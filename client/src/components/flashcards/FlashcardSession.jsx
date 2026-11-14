import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw, RotateCcw, Shuffle, ThumbsUp } from 'lucide-react'
import Flashcard from './Flashcard'
import SessionSummary from './SessionSummary'
import { restoreSession, sessionReducer, summarize } from './sessionReducer'

const toolbarButton =
  'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-ink-500 transition hover:bg-white hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-50'

/**
 * Interactive review of one card set. Render with key={setId} so a new set always
 * starts a fresh session. `onProgressChange` (optional) persists progress so it
 * survives page navigation; Demo Mode omits it.
 */
export default function FlashcardSession({ cards, initialProgress, onProgressChange, onGenerateNew }) {
  const [state, dispatch] = useReducer(sessionReducer, null, () => restoreSession(cards, initialProgress))
  const [isFlipped, setIsFlipped] = useState(false)
  const cardsById = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards])
  const summary = useMemo(() => summarize(cards, state.marks), [cards, state.marks])

  const progressRef = useRef(onProgressChange)
  useEffect(() => {
    progressRef.current = onProgressChange
  })
  useEffect(() => {
    progressRef.current?.(state)
  }, [state])

  // Leaving the summary (restart / review missed) unmounts the focused button,
  // so hand focus to the card.
  const cardButtonRef = useRef(null)
  const wasFinished = useRef(state.finished)
  useEffect(() => {
    if (wasFinished.current && !state.finished) cardButtonRef.current?.focus()
    wasFinished.current = state.finished
  }, [state.finished])

  // Every move shows the question side of the next card first.
  const act = (action) => {
    setIsFlipped(false)
    dispatch(action)
  }

  if (state.finished) {
    return (
      <SessionSummary
        summary={summary}
        total={cards.length}
        round={state.round}
        onReviewMissed={() => act({ type: 'reviewMissed', cards })}
        onRestart={() => act({ type: 'restart', cards })}
        onGenerateNew={onGenerateNew}
      />
    )
  }

  const card = cardsById.get(state.order[state.position])
  const total = state.order.length
  const number = state.position + 1
  const isLast = number === total
  const mark = state.marks[card.id]

  function handleKeyDown(event) {
    if (event.target.closest('input, textarea, select')) return
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      act({ type: 'next' })
    } else if (event.key === 'ArrowLeft' && state.position > 0) {
      event.preventDefault()
      act({ type: 'prev' })
    }
  }

  return (
    <section aria-label="Flashcard review" onKeyDown={handleKeyDown} className="mx-auto max-w-2xl space-y-5">
      {/* Progress + session tools */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-ink-700" aria-live="polite">
            {state.round === 'missed' && (
              <span className="mr-2 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
                Missed cards
              </span>
            )}
            Card {number} of {total}
          </p>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => act({ type: 'shuffle' })} disabled={total < 2} className={toolbarButton}>
              <Shuffle className="size-4" aria-hidden="true" />
              Shuffle
            </button>
            <button type="button" onClick={() => act({ type: 'restart', cards })} className={toolbarButton}>
              <RefreshCw className="size-4" aria-hidden="true" />
              Restart
            </button>
          </div>
        </div>
        <div
          role="progressbar"
          aria-label="Session progress"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={number}
          aria-valuetext={`Card ${number} of ${total}`}
          className="h-2 overflow-hidden rounded-full bg-cream-200"
        >
          <div
            className="h-full rounded-full bg-lavender-500 transition-[width] duration-300"
            style={{ width: `${(number / total) * 100}%` }}
          />
        </div>
        <p className="flex gap-4 text-xs text-ink-500">
          <span>
            <span className="font-semibold text-emerald-700">{summary.known.length}</span> know it
          </span>
          <span>
            <span className="font-semibold text-rose-700">{summary.review.length}</span> to review
          </span>
          <span>
            <span className="font-semibold text-ink-700">{summary.unmarked}</span> not marked
          </span>
        </p>
      </div>

      <Flashcard
        card={card}
        isFlipped={isFlipped}
        onFlip={() => setIsFlipped((f) => !f)}
        mark={mark}
        buttonRef={cardButtonRef}
      />

      {/* Self-assessment */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => act({ type: 'mark', value: 'review' })}
          aria-pressed={mark === 'review'}
          className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition duration-200 ${
            mark === 'review'
              ? 'bg-rose-600 text-white shadow-soft'
              : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100'
          }`}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Review Again
        </button>
        <button
          type="button"
          onClick={() => act({ type: 'mark', value: 'know' })}
          aria-pressed={mark === 'know'}
          className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition duration-200 ${
            mark === 'know'
              ? 'bg-emerald-600 text-white shadow-soft'
              : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <ThumbsUp className="size-4" aria-hidden="true" />
          Know It
        </button>
      </div>

      {/* Navigation */}
      <nav aria-label="Card navigation" className="flex items-center justify-between gap-3">
        {/* aria-disabled (not disabled) keeps focus in place when reaching the first card. */}
        <button
          type="button"
          onClick={() => state.position > 0 && act({ type: 'prev' })}
          aria-disabled={state.position === 0}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 shadow-soft ring-1 ring-cream-200 transition hover:bg-cream-100 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:bg-white"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </button>
        <p className="hidden text-xs text-ink-400 sm:block">Tip: use ← and → to move between cards</p>
        <button
          type="button"
          onClick={() => act({ type: 'next' })}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 shadow-soft ring-1 ring-cream-200 transition hover:bg-cream-100"
        >
          {isLast ? 'Finish' : 'Next'}
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </nav>
    </section>
  )
}
