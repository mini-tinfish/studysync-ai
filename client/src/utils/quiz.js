import { ApiError } from '../api/client'

// API_CONTRACT.md POST /api/quiz: count is an integer 1–20 (default 5); difficulty defaults to "medium".
export const MIN_QUESTIONS = 1
export const MAX_QUESTIONS = 20
export const DEFAULT_QUESTIONS = 5
export const DIFFICULTIES = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
]
export const DEFAULT_DIFFICULTY = 'medium'
export const OPTION_COUNT = 4

export function clampQuestionCount(value) {
  const number = Number(value)
  if (value === '' || value === null || !Number.isFinite(number)) return DEFAULT_QUESTIONS
  return Math.min(MAX_QUESTIONS, Math.max(MIN_QUESTIONS, Math.round(number)))
}

export const isDifficulty = (value) => DIFFICULTIES.some((d) => d.id === value)
export const difficultyLabel = (value) => DIFFICULTIES.find((d) => d.id === value)?.label ?? 'Medium'

const asText = (value) => (typeof value === 'string' ? value.trim() : '')

/**
 * Validates a POST /api/quiz response before rendering. A question is kept only if it has
 * text, exactly four non-empty options, and an integer correctIndex in 0–3; ids are made
 * unique so progress tracking stays reliable. Throws AI_INVALID_RESPONSE when nothing usable remains.
 */
export function normalizeQuiz(raw, { requestedCount, difficulty } = {}) {
  const list = Array.isArray(raw?.questions) ? raw.questions : null
  if (!list) {
    throw new ApiError({
      code: 'AI_INVALID_RESPONSE',
      message: 'The server response did not include any quiz questions.',
      status: 0,
    })
  }

  const seen = new Set()
  const questions = []
  list.forEach((item, index) => {
    const question = asText(item?.question)
    const options = Array.isArray(item?.options) ? item.options.map(asText) : []
    const { correctIndex } = item ?? {}
    if (
      !question ||
      options.length !== OPTION_COUNT ||
      !options.every(Boolean) ||
      !Number.isInteger(correctIndex) ||
      correctIndex < 0 ||
      correctIndex >= OPTION_COUNT
    ) {
      return
    }
    let id = asText(item?.id) || `q-${index + 1}`
    if (seen.has(id)) id = `${id}-${index + 1}`
    seen.add(id)
    questions.push({ id, question, options, correctIndex, explanation: asText(item?.explanation) })
  })

  if (questions.length === 0) {
    throw new ApiError({
      code: 'AI_INVALID_RESPONSE',
      message: 'The server returned no usable quiz questions. Please try again.',
      status: 0,
    })
  }

  return {
    questions,
    requestedCount: requestedCount ?? questions.length,
    difficulty: isDifficulty(difficulty) ? difficulty : DEFAULT_DIFFICULTY,
  }
}
