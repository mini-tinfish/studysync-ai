/**
 * Thin wrapper around the StudySync backend (see API_CONTRACT.md).
 * All requests use relative /api paths; Vite proxies them to Express in dev.
 */

export class ApiError extends Error {
  constructor({ code, message, status, details }) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.details = details
  }
}

// Client-only error codes (never sent by the backend).
/** The backend could not be reached (not running, proxy failure). */
export const BACKEND_UNAVAILABLE = 'BACKEND_UNAVAILABLE'
/** The request took longer than the client timeout. */
export const REQUEST_TIMEOUT = 'REQUEST_TIMEOUT'
/** The caller cancelled the request (e.g. navigated away). Callers should ignore it. */
export const REQUEST_ABORTED = 'REQUEST_ABORTED'

const UNAVAILABLE_MESSAGE =
  "Couldn't reach the StudySync server. Make sure the backend is running, then try again."

// The contract allows ~60 s for AI calls; leave headroom before giving up.
const AI_TIMEOUT_MS = 90_000

async function request(path, { signal, timeoutMs, ...options } = {}) {
  const controller = new AbortController()
  let timedOut = false
  const timer = timeoutMs
    ? setTimeout(() => {
        timedOut = true
        controller.abort()
      }, timeoutMs)
    : null
  const forwardAbort = () => controller.abort()
  signal?.addEventListener('abort', forwardAbort)

  let response
  try {
    response = await fetch(path, { ...options, signal: controller.signal })
  } catch {
    if (timedOut) {
      throw new ApiError({
        code: REQUEST_TIMEOUT,
        message: 'The request took too long to finish. Please try again.',
        status: 0,
      })
    }
    if (signal?.aborted) {
      throw new ApiError({ code: REQUEST_ABORTED, message: 'Request cancelled.', status: 0 })
    }
    throw new ApiError({ code: BACKEND_UNAVAILABLE, message: UNAVAILABLE_MESSAGE, status: 0 })
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', forwardAbort)
  }

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const body = isJson ? await response.json().catch(() => null) : null

  if (response.ok && body) return body

  if (body?.error) {
    throw new ApiError({
      code: body.error.code ?? 'INTERNAL_ERROR',
      message: body.error.message ?? 'Something went wrong.',
      status: response.status,
      details: body.error.details,
    })
  }

  // No contract-shaped JSON: the request never reached Express (e.g. the Vite proxy
  // returned an empty 5xx because the backend is down) or the route doesn't exist yet.
  const unreachable = response.status >= 500 || response.status === 404
  throw new ApiError({
    code: unreachable ? BACKEND_UNAVAILABLE : 'INTERNAL_ERROR',
    message: unreachable ? UNAVAILABLE_MESSAGE : 'Unexpected response from the server.',
    status: response.status,
  })
}

function postJson(path, body, options) {
  return request(path, {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/** GET /api/health — returns { status, timestamp, aiConfigured, mockMode } */
export function getHealth({ signal } = {}) {
  return request('/api/health', { method: 'GET', signal, timeoutMs: 5_000 })
}

/** POST /api/upload — returns { fileName, fileType, sizeBytes, pageCount, charCount, wordCount, truncated, text } */
export function uploadDocument(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request('/api/upload', { method: 'POST', body: formData })
}

/**
 * POST /api/study-guide — body { text, title? }.
 * Returns { title, summary, sections[{ heading, content, keyPoints[] }], keyTerms[{ term, definition }], reviewQuestions[] }
 */
export function generateStudyGuide({ text, title }, { signal } = {}) {
  return postJson('/api/study-guide', title ? { text, title } : { text }, { signal, timeoutMs: AI_TIMEOUT_MS })
}

/** POST /api/flashcards — body { text, count? (1–30) }. Returns { flashcards: [{ id, front, back }] } */
export function generateFlashcards({ text, count }, { signal } = {}) {
  return postJson('/api/flashcards', { text, count }, { signal, timeoutMs: AI_TIMEOUT_MS })
}

/**
 * POST /api/quiz — body { text, count? (1–20), difficulty? ('easy' | 'medium' | 'hard') }.
 * Returns { questions: [{ id, question, options[4], correctIndex, explanation }] }
 */
export function generateQuiz({ text, count, difficulty }, { signal } = {}) {
  return postJson('/api/quiz', { text, count, difficulty }, { signal, timeoutMs: AI_TIMEOUT_MS })
}
