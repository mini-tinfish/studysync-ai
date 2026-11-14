import { shuffled } from '../../utils/flashcards'

/**
 * Review session state for one card set.
 * - order:    card ids in the current round (all cards, or only missed ones)
 * - position: index into `order`
 * - marks:    { [cardId]: 'know' | 'review' } across the whole set
 * - round:    'all' | 'missed'
 * - finished: true once the round is complete (shows the summary)
 */
export function createSession(cards) {
  return { order: cards.map((c) => c.id), position: 0, marks: {}, round: 'all', finished: false }
}

/** Rehydrate saved progress only if it still matches this card set. */
export function restoreSession(cards, saved) {
  if (!saved) return createSession(cards)
  const ids = new Set(cards.map((c) => c.id))
  const order = saved.order.filter((id) => ids.has(id))
  if (order.length === 0) return createSession(cards)
  return { ...saved, order, position: Math.min(saved.position, order.length - 1) }
}

export function sessionReducer(state, action) {
  switch (action.type) {
    case 'next':
      if (state.position >= state.order.length - 1) return { ...state, finished: true }
      return { ...state, position: state.position + 1 }

    case 'prev':
      return { ...state, position: Math.max(0, state.position - 1) }

    case 'mark': {
      const id = state.order[state.position]
      const marks = { ...state.marks, [id]: action.value }
      if (state.position >= state.order.length - 1) return { ...state, marks, finished: true }
      return { ...state, marks, position: state.position + 1 }
    }

    case 'shuffle':
      return { ...state, order: shuffled(state.order), position: 0, finished: false }

    case 'restart':
      return createSession(action.cards)

    case 'reviewMissed': {
      const missed = action.cards.map((c) => c.id).filter((id) => state.marks[id] === 'review')
      if (missed.length === 0) return state
      return { ...state, order: missed, position: 0, round: 'missed', finished: false }
    }

    default:
      return state
  }
}

export function summarize(cards, marks) {
  const known = cards.filter((c) => marks[c.id] === 'know')
  const review = cards.filter((c) => marks[c.id] === 'review')
  return { known, review, unmarked: cards.length - known.length - review.length }
}
