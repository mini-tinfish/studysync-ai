import { ApiError } from '../api/client'

// API_CONTRACT.md POST /api/flashcards: count is an integer 1–30, default 10.
export const MIN_CARDS = 1
export const MAX_CARDS = 30
export const DEFAULT_CARDS = 10

export function clampCount(value) {
  const number = Number(value)
  if (value === '' || value === null || !Number.isFinite(number)) return DEFAULT_CARDS
  return Math.min(MAX_CARDS, Math.max(MIN_CARDS, Math.round(number)))
}

const asText = (value) => (typeof value === 'string' ? value.trim() : '')

/**
 * Validates a POST /api/flashcards response before rendering. Cards missing a front
 * or back are dropped; ids are made unique so React keys and review progress stay
 * reliable. Throws AI_INVALID_RESPONSE when nothing usable remains.
 */
export function normalizeFlashcards(raw, requestedCount) {
  const list = Array.isArray(raw?.flashcards) ? raw.flashcards : null
  if (!list) {
    throw new ApiError({
      code: 'AI_INVALID_RESPONSE',
      message: 'The server response did not include a list of flashcards.',
      status: 0,
    })
  }

  const seen = new Set()
  const cards = []
  list.forEach((item, index) => {
    const front = asText(item?.front)
    const back = asText(item?.back)
    if (!front || !back) return
    let id = asText(item?.id) || `card-${index + 1}`
    if (seen.has(id)) id = `${id}-${index + 1}`
    seen.add(id)
    cards.push({ id, front, back })
  })

  if (cards.length === 0) {
    throw new ApiError({
      code: 'AI_INVALID_RESPONSE',
      message: 'The server returned no usable flashcards. Please try again.',
      status: 0,
    })
  }

  return { cards, requestedCount: requestedCount ?? cards.length }
}

/** Fisher–Yates shuffle; returns a new array. */
export function shuffled(items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
