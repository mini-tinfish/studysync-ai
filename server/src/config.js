// Central configuration. Values come from server/.env (loaded by `node --env-file-if-exists`).

const toInt = (value, fallback) => {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const mockFromArgs = process.argv.includes('--mock');

export const config = {
  port: toInt(process.env.PORT, 3001),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    // Tried in order when the main model is overloaded or unavailable.
    fallbackModels: (process.env.GEMINI_FALLBACK_MODELS ?? 'gemini-3.7-flash,gemini-3.6-flash')
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean),
    // Overall limit per request, across all models. Must stay below the frontend's 90 s timeout.
    timeoutMs: toInt(process.env.AI_TIMEOUT_MS, 85_000),
    // Gemini "thinking" depth: MINIMAL | LOW | MEDIUM | HIGH. Empty = model default.
    // LOW measured ~2x faster than the default with equally good study guides.
    thinkingLevel: (process.env.GEMINI_THINKING_LEVEL ?? 'LOW').trim().toUpperCase(),
  },

  // Mock mode returns fixed sample data so the frontend can work without an API key.
  mockAi: mockFromArgs || process.env.MOCK_AI === 'true',

  // Limits from API_CONTRACT.md
  limits: {
    maxUploadBytes: 10 * 1024 * 1024,
    minTextChars: 50,
    maxTextChars: 100_000,
    maxQuestionChars: 1_000,
    maxHistoryTurns: 10,
    flashcards: { min: 1, max: 30, default: 10 },
    quiz: { min: 1, max: 20, default: 5 },
  },
};

export const isAiConfigured = () => config.mockAi || Boolean(config.gemini.apiKey);
