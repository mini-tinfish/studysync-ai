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

  let response;
  try {
    response = await getClient().models.generateContent({
      model: config.gemini.model,
      contents,
      config: {
        systemInstruction: system,
        responseMimeType: 'application/json',
        responseJsonSchema: schema,
        abortSignal: AbortSignal.timeout(config.gemini.timeoutMs),
      },
    });
  } catch (err) {
    const timedOut = err?.name === 'TimeoutError' || err?.name === 'AbortError';
    console.error('[gemini] request failed:', err?.status ?? '', err?.message);
    throw new AppError(
      502,
      'AI_SERVICE_ERROR',
      timedOut
        ? 'The AI service took too long to respond. Please try again.'
        : 'The AI service failed to respond. Please try again.',
    );
  }

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
