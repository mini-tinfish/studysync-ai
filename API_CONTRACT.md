# StudySync AI — API Contract

**Status:** AGREED v1.0. Both developers accepted it. The AI provider is Google Gemini.

Any change to paths, request shapes, or response shapes must update this file in the same PR (see `CLAUDE.md`).

---

## 1. General Conventions

| Item | Value |
|------|-------|
| Base URL (dev) | `http://localhost:3001/api` |
| Frontend access | Vite dev server proxies `/api` → `http://localhost:3001`, so the client calls relative paths like `/api/quiz` |
| Content type | `application/json` for everything except `POST /api/upload` (`multipart/form-data`) |
| Field naming | `camelCase` |
| Auth | None for the MVP |
| Storage | **Stateless backend.** The server does not store documents. The client keeps the extracted `text` from `/api/upload` and sends it with every generation request. |

### Success responses
A successful response returns the resource JSON directly with HTTP `200`. There is no wrapper object.

### Error responses
Every error, on every endpoint, uses this shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message safe to show in the UI.",
    "details": { "field": "text" }
  }
}
```

- `code`: stable machine-readable string. The frontend should branch on this, not on `message`.
- `message`: always present, safe to display.
- `details`: optional, and its shape varies.

| HTTP | `code` | When |
|------|--------|------|
| 400 | `VALIDATION_ERROR` | Missing or invalid field, text too short or too long, bad `count` |
| 400 | `NO_FILE` | Upload request has no file |
| 413 | `FILE_TOO_LARGE` | Upload exceeds 10 MB |
| 415 | `UNSUPPORTED_FILE_TYPE` | File is not PDF, TXT, or MD |
| 422 | `NO_EXTRACTABLE_TEXT` | PDF parsed but contains no text (e.g. a scanned image) |
| 404 | `NOT_FOUND` | Unknown route |
| 502 | `AI_SERVICE_ERROR` | The LLM provider failed or timed out |
| 502 | `AI_INVALID_RESPONSE` | The LLM returned output that could not be parsed into the contract shape |
| 503 | `AI_NOT_CONFIGURED` | No API key and mock mode is off |
| 500 | `INTERNAL_ERROR` | Anything else |

### Shared limits
| Limit | Value |
|-------|-------|
| Max upload size | 10 MB |
| `text` minimum length | 50 characters |
| `text` maximum length | 100,000 characters. Upload truncates to this length and sets `truncated: true`. |
| AI request timeout | ~60 s. The UI should show a loading state. |

### IDs
Generated items (`flashcards[].id`, `questions[].id`) are strings that are unique within a single response. They are not stable across requests.

---

## 2. Endpoints

### `GET /api/health`
Checks that the backend is running.

**Response 200**
```json
{
  "status": "ok",
  "timestamp": "2026-11-14T15:00:00.000Z",
  "aiConfigured": true,
  "mockMode": false
}
```

---

### `POST /api/upload`
Accepts a PDF (or plain text or Markdown notes), extracts the text, and returns it with metadata.

**Request:** `multipart/form-data`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `file` | File | yes | `.pdf`, `.txt`, or `.md`, up to 10 MB |

**Response 200**
```json
{
  "fileName": "lecture-05-photosynthesis.pdf",
  "fileType": "pdf",
  "sizeBytes": 482113,
  "pageCount": 24,
  "charCount": 18342,
  "wordCount": 3011,
  "truncated": false,
  "text": "Photosynthesis is the process by which..."
}
```
- `fileType`: one of `"pdf"`, `"txt"`, `"md"`.
- `pageCount`: `null` for non-PDF files.

**Errors:** `NO_FILE`, `FILE_TOO_LARGE`, `UNSUPPORTED_FILE_TYPE`, `NO_EXTRACTABLE_TEXT`, `INTERNAL_ERROR`

---

### `POST /api/study-guide`
Generates a structured study guide from course material.

**Request**
```json
{
  "text": "Photosynthesis is the process by which...",
  "title": "Lecture 5 — Photosynthesis"
}
```
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `text` | string | yes | 50–100,000 chars |
| `title` | string | no | Hint for the guide title. Defaults to an AI-chosen title. |

**Response 200**
```json
{
  "title": "Photosynthesis",
  "summary": "A 2–4 sentence overview of the material.",
  "sections": [
    {
      "heading": "Light-Dependent Reactions",
      "content": "Short paragraph explaining the section.",
      "keyPoints": [
        "Occur in the thylakoid membrane",
        "Produce ATP and NADPH"
      ]
    }
  ],
  "keyTerms": [
    { "term": "Chlorophyll", "definition": "Green pigment that absorbs light energy." }
  ],
  "reviewQuestions": [
    "What are the products of the light-dependent reactions?"
  ]
}
```
- `sections`: 1 or more. `keyTerms`: 0 or more. `reviewQuestions`: 0 or more (open-ended, no answers).

**Errors:** `VALIDATION_ERROR`, `AI_SERVICE_ERROR`, `AI_INVALID_RESPONSE`, `AI_NOT_CONFIGURED`

---

### `POST /api/flashcards`
Generates question-and-answer flashcards.

**Request**
```json
{
  "text": "Photosynthesis is the process by which...",
  "count": 10
}
```
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `text` | string | yes | 50–100,000 chars |
| `count` | integer | no | 1–30, default `10`. The AI may return fewer if the material is short. |

**Response 200**
```json
{
  "flashcards": [
    {
      "id": "fc-1",
      "front": "What organelle performs photosynthesis?",
      "back": "The chloroplast."
    }
  ]
}
```

**Errors:** `VALIDATION_ERROR`, `AI_SERVICE_ERROR`, `AI_INVALID_RESPONSE`, `AI_NOT_CONFIGURED`

---

### `POST /api/quiz`
Generates multiple-choice practice questions with explanations.

**Request**
```json
{
  "text": "Photosynthesis is the process by which...",
  "count": 5,
  "difficulty": "medium"
}
```
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `text` | string | yes | 50–100,000 chars |
| `count` | integer | no | 1–20, default `5` |
| `difficulty` | string | no | `"easy"`, `"medium"`, or `"hard"`; default `"medium"` |

**Response 200**
```json
{
  "questions": [
    {
      "id": "q-1",
      "question": "Where do the light-dependent reactions occur?",
      "options": ["Stroma", "Thylakoid membrane", "Cytoplasm", "Mitochondria"],
      "correctIndex": 1,
      "explanation": "Light-dependent reactions take place in the thylakoid membranes of the chloroplast."
    }
  ]
}
```
- `options`: always exactly 4 strings.
- `correctIndex`: 0-based index into `options`.
- Scoring happens client-side. The answer is included in the response.

**Errors:** `VALIDATION_ERROR`, `AI_SERVICE_ERROR`, `AI_INVALID_RESPONSE`, `AI_NOT_CONFIGURED`

---

### `POST /api/ask`
Answers a student's question using only the supplied material.

**Request**
```json
{
  "text": "Photosynthesis is the process by which...",
  "question": "Why do plants need sunlight?",
  "history": [
    { "role": "user", "content": "What is chlorophyll?" },
    { "role": "assistant", "content": "Chlorophyll is the green pigment..." }
  ]
}
```
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `text` | string | yes | 50–100,000 chars |
| `question` | string | yes | 1–1,000 chars |
| `history` | array | no | Prior turns for follow-ups. `role` is `"user"` or `"assistant"`. The server uses at most the last 10 turns. |

**Response 200**
```json
{
  "answer": "Plants need sunlight because light energy drives the light-dependent reactions...",
  "answeredFromMaterial": true,
  "citations": [
    "Light energy is absorbed by chlorophyll in the thylakoid membranes."
  ]
}
```
- `answeredFromMaterial`: `false` when the material does not cover the question. `answer` then says so instead of guessing.
- `citations`: short quotes copied from the supplied text. It may be empty.

**Errors:** `VALIDATION_ERROR`, `AI_SERVICE_ERROR`, `AI_INVALID_RESPONSE`, `AI_NOT_CONFIGURED`

---

## 3. Mock Mode

When the server runs with `MOCK_AI=true`, every AI endpoint returns fixed sample data in exactly the shapes above, after the same input validation. The frontend can be built and demoed before an AI provider or key is chosen.

## 4. Resolved Decisions

1. The backend is stateless. The client holds `text` and re-sends it with each request.
2. The response shapes above are accepted as-is.
3. Upload takes one file per request. The client may concatenate texts if needed.
4. Express runs on port `3001` and Vite on `5173`. Vite proxies `/api` to the backend (`client/vite.config.js`).
5. The AI provider is Google Gemini, configured in `server/.env` (see `server/.env.example`).
