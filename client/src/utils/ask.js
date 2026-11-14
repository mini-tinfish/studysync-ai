import { ApiError } from '../api/client'

// API_CONTRACT.md POST /api/ask: question 1–1,000 chars; the server uses at most 10 history turns.
export const MAX_QUESTION_CHARS = 1_000
export const MAX_HISTORY_TURNS = 10

export const STARTER_QUESTIONS = [
  'Summarize the main ideas in these notes.',
  'What are the most important terms I should know?',
  'Explain the hardest concept here in simpler words.',
  'What might an exam ask about this material?',
]

const asText = (value) => (typeof value === 'string' ? value.trim() : '')

/** Validation message for a question, or null if it can be sent. */
export function validateQuestion(question) {
  const trimmed = question.trim()
  if (!trimmed) return 'Type a question first.'
  if (trimmed.length > MAX_QUESTION_CHARS) return `Questions can be at most ${MAX_QUESTION_CHARS.toLocaleString()} characters.`
  return null
}

/** The last 10 messages, in the contract's history shape (no extra fields). */
export function buildHistory(messages) {
  return messages.slice(-MAX_HISTORY_TURNS).map(({ role, content }) => ({ role, content }))
}

/**
 * Validates a POST /api/ask response. `answeredFromMaterial` counts as true only when the
 * server says exactly `true` — an answer is never assumed to be supported by the notes.
 */
export function normalizeAskResponse(raw) {
  const answer = asText(raw?.answer)
  if (!answer) {
    throw new ApiError({
      code: 'AI_INVALID_RESPONSE',
      message: 'The server returned an empty answer. Please try again.',
      status: 0,
    })
  }
  const citations = [...new Set((Array.isArray(raw?.citations) ? raw.citations : []).map(asText).filter(Boolean))]
  return { answer, answeredFromMaterial: raw?.answeredFromMaterial === true, citations }
}

// Compare text loosely: case, curly quotes, dashes, and whitespace differences don't matter.
const loose = (text) =>
  text
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/^[\s"'.…]+|[\s"'.…]+$/g, '')
    .trim()

/** Whether a citation actually appears in the document's text (so it can be shown as a quote from it). */
export function citationAppearsInText(citation, documentText) {
  const needle = loose(citation)
  return needle.length > 0 && loose(documentText).includes(needle)
}
