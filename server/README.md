# StudySync AI — Server

Express + Google Gemini backend for StudySync AI. It extracts text from uploaded lecture files and turns it into study guides, flashcards, quizzes, and grounded answers.

The API is documented in [`../API_CONTRACT.md`](../API_CONTRACT.md). Owner: Agent 1 (backend).

## Setup

Requires Node.js 22 or newer.

```bash
cd server
npm install
cp .env.example .env      # Windows PowerShell: copy .env.example .env
```

Then open `.env` and set `GEMINI_API_KEY` (get one at https://aistudio.google.com/apikey).
`.env` is git-ignored. **Never commit it.** Share keys privately, not through Git.

No key? Use `npm run dev:mock`, which needs no key.

## Run

Run all commands from inside the `server/` folder.

| Command | What it does |
|---------|--------------|
| `npm run dev` | Starts on http://localhost:3001 with auto-reload, using real Gemini |
| `npm run dev:mock` | Same, but AI endpoints return fixed sample data (no key, no cost) |
| `npm start` | Starts without auto-reload |
| `npm test` | 23 endpoint tests in mock mode. Never calls Gemini. |
| `npm run smoke` | Calls every endpoint on an **already running** server and checks the responses. Against real Gemini it makes ~6 AI calls (a few cents). |
| `npm run smoke -- "C:\path\lecture.pdf"` | Same, using your own PDF / TXT / MD |

Check it's up: http://localhost:3001/api/health. `mockMode` and `aiConfigured` show the current mode.

The frontend (`client/`, `npm run dev` on port 5173) proxies `/api` to this server, so start both.

> Auto-reload picks up code changes, **not** `.env` changes. Restart (Ctrl+C, then `npm run dev`) after editing `.env`.

## Settings (`.env`)

| Variable | Default | Purpose |
|----------|---------|---------|
| `GEMINI_API_KEY` | (none) | Required for real AI |
| `GEMINI_MODEL` | `gemini-3.8-flash` | Main model. We use `gemini-3.6-flash`, which was the most reliable in testing. |
| `GEMINI_FALLBACK_MODELS` | `gemini-3.7-flash,gemini-3.6-flash` | Comma-separated backups, tried in order when the main model is overloaded (503/429) or retired (404) |
| `GEMINI_THINKING_LEVEL` | `LOW` | Gemini's hidden reasoning: `MINIMAL`, `LOW`, `MEDIUM`, `HIGH`, or empty for the model default. `LOW` measured ~2x faster with equally good output. |
| `AI_TIMEOUT_MS` | `85000` | Overall limit per AI request. Keep it below the frontend's 90 s. |
| `MOCK_AI` | `false` | `true` returns sample data (same as `npm run dev:mock`) |
| `PORT` | `3001` | The frontend proxy expects 3001 |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed browser origin (CORS) |

## How AI requests behave

- **Fixed output shape.** Gemini must return JSON matching a schema (`services/schemas.js`). The server then checks and cleans the result, so the frontend always gets the shapes in `API_CONTRACT.md`. For example, quiz questions without exactly 4 options are dropped.
- **Grounded answers.** Prompts tell Gemini to use only the uploaded material, and to ignore any instructions inside it. `/api/ask` says when the material doesn't cover a question instead of guessing.
- **Fallback.** When a model returns 503 or 429, the server tries the next model and skips the busy one for 2 minutes. The first attempt gets up to 50 s, so long documents aren't cut off; each backup gets up to 25 s.
- **Typical timing.** For a ~25-page lecture PDF: study guide ~10 s, flashcards and quizzes ~5–8 s, answers ~3–5 s.
- Each attempt is logged, e.g. `[gemini] gemini-3.6-flash ok in 9.4s`.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `npm error enoent Could not read package.json` | Command run from the repo root | `cd server` first |
| `NOT_FOUND` at http://localhost:3001/api | There is no route at `/api` itself | Use http://localhost:3001/api/health |
| `AI_NOT_CONFIGURED` (503) | No `GEMINI_API_KEY` in `server/.env` | Add the key and restart, or use `npm run dev:mock` |
| "The AI service is busy" | Gemini overloaded (503) or quota used up (429) | Wait a minute and retry; check quota/billing in AI Studio; or use `npm run dev:mock` |
| "Took too long to respond" | Very long document or slow model | Retry; check the `[gemini]` lines in the server log |
| `EADDRINUSE` on port 3001 | Another server is already running | Close the other terminal or press Ctrl+C in it |
| `NO_EXTRACTABLE_TEXT` (422) on a PDF | Scanned/image-only or protected PDF | Use a text-based PDF, or paste the notes into a `.txt` file |

**Demo backup plan:** if Gemini fails during a demo, stop the server and run `npm run dev:mock`. Uploads still extract the real text, and AI features show sample data labelled "Mock data" in the UI.

## Layout

```
src/
  index.js              starts the server
  app.js                Express app: CORS, JSON parsing, routes, errors
  config.js             env settings and limits
  routes/api.js         all /api endpoints
  middleware/           upload (multer), input validation, error handler
  services/
    documentService.js  PDF / TXT / MD text extraction (unpdf)
    aiService.js        Gemini calls + model fallback (the only provider-specific file)
    prompts.js          prompt text
    schemas.js          JSON schemas Gemini must follow
    studyService.js     feature logic + output cleanup
  mocks/                sample data for mock mode
scripts/smoke.js        end-to-end check against a running server
tests/api.test.js       endpoint tests (mock mode)
```
