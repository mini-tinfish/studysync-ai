# StudySync AI — Server

Express + Google Gemini backend. Owned by Agent 1. The API is documented in [`../API_CONTRACT.md`](../API_CONTRACT.md).

## Setup

```bash
cd server
npm install
cp .env.example .env    # then put your GEMINI_API_KEY in .env (never commit it)
```

## Run

| Command | What it does |
|---------|--------------|
| `npm run dev` | Starts on http://localhost:3001 with auto-reload, using Gemini |
| `npm run dev:mock` | Same, but AI endpoints return sample data (no API key needed) |
| `npm start` | Starts without auto-reload |
| `npm test` | Runs endpoint tests (mock mode, never calls Gemini) |

Check it's up: http://localhost:3001/api/health

## Layout

```
src/
  index.js              starts the server
  app.js                Express app: CORS, JSON parsing, routes, errors
  config.js             env settings and limits
  routes/api.js         all /api endpoints
  middleware/           upload (multer), input validation, error handler
  services/
    documentService.js  PDF / TXT / MD text extraction
    aiService.js        Gemini calls (the only provider-specific file)
    prompts.js          prompt text
    schemas.js          JSON schemas Gemini must follow
    studyService.js     feature logic + output cleanup
  mocks/                sample data for mock mode
tests/api.test.js
```
