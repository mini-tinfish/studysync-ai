// Thin wrapper around Google Gemini. All provider-specific code lives here, so the
// provider can be swapped without touching routes or study logic.
import { GoogleGenAI } from '@google/genai';
import { config } from '../config.js';
import { AppError } from '../utils/AppError.js';

let client;
const getClient = () => {
  client ??= new GoogleGenAI({ apiKey: config.gemini.apiKey });
  return client;
};

// Gemini models are often temporarily overloaded (503) or rate-limited (429), and old ones
// get retired (404). These are worth trying on another model; anything else (bad key, bad
// request) fails immediately.
const RETRYABLE = new Set([429, 500, 503, 504]);
const MODEL_GONE = 404;
const PASSES = 2;
const PASS_DELAY_MS = 1_500;
// Time limits per attempt. The first attempt (normally the primary model) gets most of the
// overall budget, because a long document can legitimately take 20-30 s. Later attempts are
// capped, since an overloaded model can take ~30 s just to return 503. The very last attempt
// gets whatever time is left.
const FIRST_ATTEMPT_CAP_MS = 50_000;
const FALLBACK_ATTEMPT_CAP_MS = 25_000;
// After a 503/429, skip that model for a while so later requests go straight to one that
// works. Slow responses (timeouts) do NOT trigger this: slow is not the same as overloaded.
const COOLDOWN_MS = 120_000;
const cooldownUntil = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const isTimeout = (err) => err?.name === 'TimeoutError' || err?.name === 'AbortError';
const coolingDown = (model) => (cooldownUntil.get(model) ?? 0) > Date.now();

// Healthy models first (in configured order), then models in cooldown as a last resort.
function orderedModels() {
  const all = [...new Set([config.gemini.model, ...config.gemini.fallbackModels])];
  return [...all.filter((m) => !coolingDown(m)), ...all.filter(coolingDown)];
}

/**
 * Tries each model (primary, then fallbacks) for up to PASSES rounds, all within one
 * overall deadline (AI_TIMEOUT_MS).
 */
async function callWithFallback(request) {
  const deadline = Date.now() + config.gemini.timeoutMs;
  let sawBusy = false;
  let attempt = 0;

  for (let pass = 1; pass <= PASSES; pass += 1) {
    const models = orderedModels();
    for (const [i, model] of models.entries()) {
      const remaining = deadline - Date.now();
      if (remaining <= 0) break;
      attempt += 1;
      const isLastChance = pass === PASSES && i === models.length - 1;
      const cap = attempt === 1 ? FIRST_ATTEMPT_CAP_MS : FALLBACK_ATTEMPT_CAP_MS;
      const budget = isLastChance ? remaining : Math.min(remaining, cap);
      const started = Date.now();
      try {
        const response = await request(model, AbortSignal.timeout(budget));
        cooldownUntil.delete(model);
        const secs = ((Date.now() - started) / 1000).toFixed(1);
        console.log(`[gemini] ${model} ok in ${secs}s${model !== config.gemini.model ? ' (fallback)' : ''}`);
        return response;
      } catch (err) {
        const status = isTimeout(err) ? 'timeout' : err?.status;
        const secs = ((Date.now() - started) / 1000).toFixed(1);
        console.warn(`[gemini] ${model} failed after ${secs}s (pass ${pass}):`, status ?? '', String(err?.message).slice(0, 200));
        if (status === 'timeout') continue;
        if (RETRYABLE.has(status)) {
          sawBusy = true;
          cooldownUntil.set(model, Date.now() + COOLDOWN_MS);
          continue;
        }
        if (status === MODEL_GONE) continue;
        throw new AppError(502, 'AI_SERVICE_ERROR', 'The AI service rejected the request. Check the server logs.');
      }
    }
    if (pass < PASSES) {
      if (Date.now() + PASS_DELAY_MS >= deadline) break;
      await sleep(PASS_DELAY_MS);
    }
  }

  throw new AppError(
    502,
    'AI_SERVICE_ERROR',
    sawBusy
      ? 'The AI service is busy right now. Please try again in a moment.'
      : 'The AI service took too long to respond. Please try again.',
  );
}

/**
 * Ask Gemini for JSON matching `schema`.
 * @param {object} opts
 * @param {string} opts.system   System instruction
 * @param {string} opts.prompt   Latest user message
 * @param {object} opts.schema   JSON Schema for the response
 * @param {{role: 'user'|'assistant', content: string}[]} [opts.history] Prior chat turns
 * @returns {Promise<object>} Parsed JSON
 */
export async function generateJson({ system, prompt, schema, history = [] }) {
  if (!config.gemini.apiKey) {
    throw new AppError(
      503,
      'AI_NOT_CONFIGURED',
      'The AI service is not configured. Set GEMINI_API_KEY or enable MOCK_AI.',
    );
  }

  const contents = [
    ...history.map((turn) => ({
      role: turn.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: turn.content }],
    })),
    { role: 'user', parts: [{ text: prompt }] },
  ];

  const { thinkingLevel } = config.gemini;
  const send = (model, signal, withThinking) =>
    getClient().models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: system,
        responseMimeType: 'application/json',
        responseJsonSchema: schema,
        abortSignal: signal,
        // Less hidden "thinking" makes responses roughly 2x faster for these simple tasks.
        ...(withThinking && { thinkingConfig: { thinkingLevel } }),
      },
    });

  const response = await callWithFallback(async (model, signal) => {
    if (!thinkingLevel) return send(model, signal, false);
    try {
      return await send(model, signal, true);
    } catch (err) {
      // A model that doesn't support the thinking setting rejects it with 400: retry without.
      if (err?.status !== 400) throw err;
      console.warn(`[gemini] ${model} rejected thinkingLevel=${thinkingLevel}; retrying without it`);
      return send(model, signal, false);
    }
  });

  const raw = response?.text;
  if (!raw) {
    const reason = response?.candidates?.[0]?.finishReason ?? response?.promptFeedback?.blockReason;
    console.error('[gemini] empty response, reason:', reason);
    throw new AppError(502, 'AI_INVALID_RESPONSE', 'The AI returned an empty response. Please try again.');
  }

  try {
    return JSON.parse(raw);
  } catch {
    console.error('[gemini] non-JSON response:', raw.slice(0, 300));
    throw new AppError(502, 'AI_INVALID_RESPONSE', 'The AI returned an unreadable response. Please try again.');
  }
}
