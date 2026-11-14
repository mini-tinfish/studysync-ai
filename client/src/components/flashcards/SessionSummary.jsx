import { useEffect, useRef } from 'react'
import { CircleCheck, PartyPopper, RefreshCw, RotateCcw, Sparkles, Target } from 'lucide-react'

function Stat({ label, value, total, tone }) {
  return (
    <div className={`rounded-2xl p-4 text-center ring-1 ${tone}`}>
      <p className="text-3xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] opacity-80">{label}</p>
      <p className="sr-only">out of {total} cards</p>
    </div>
  )
}

export default function SessionSummary({ summary, total, round, onReviewMissed, onRestart, onGenerateNew }) {
  const headingRef = useRef(null)
  useEffect(() => headingRef.current?.focus(), [])

  const { known, review, unmarked } = summary
  const allKnown = known.length === total

  return (
    <section
      aria-labelledby="session-summary-title"
      className="rounded-3xl border border-cream-200 bg-white p-6 text-center shadow-lift sm:p-8"
    >
      <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-lavender-100 text-lavender-600">
        {allKnown ? <PartyPopper className="size-7" aria-hidden="true" /> : <Target className="size-7" aria-hidden="true" />}
      </span>
      <h2
        id="session-summary-title"
        ref={headingRef}
        tabIndex={-1}
        className="text-xl font-bold tracking-tight text-ink-900 outline-none sm:text-2xl"
      >
        {allKnown ? 'You know every card!' : round === 'missed' ? 'Review round complete' : 'Session complete'}
      </h2>
      <p className="mt-1.5 text-sm text-ink-500">
        {known.length} of {total} cards marked Know It.
        {review.length > 0 && ` ${review.length} still need review.`}
      </p>

      <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-3">
        <Stat label="Know it" value={known.length} total={total} tone="bg-emerald-50 text-emerald-800 ring-emerald-200" />
        <Stat label="Review" value={review.length} total={total} tone="bg-rose-50 text-rose-800 ring-rose-200" />
        <Stat label="Not marked" value={unmarked} total={total} tone="bg-cream-100 text-ink-700 ring-cream-200" />
      </div>

      {review.length > 0 && (
        <div className="mx-auto mt-6 max-w-lg text-left">
          <h3 className="mb-2 text-sm font-semibold text-ink-700">Cards to review again</h3>
          <ul className="max-h-48 space-y-1.5 overflow-y-auto rounded-2xl bg-cream-50 p-3 ring-1 ring-cream-200">
            {review.map((card) => (
              <li key={card.id} className="flex gap-2 text-sm text-ink-700">
                <RotateCcw className="mt-0.5 size-3.5 shrink-0 text-rose-500" aria-hidden="true" />
                {card.front}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row sm:flex-wrap">
        {review.length > 0 && (
          <button
            type="button"
            onClick={onReviewMissed}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-lavender-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-lavender-700"
          >
            <Target className="size-4" aria-hidden="true" />
            Review Missed Cards ({review.length})
          </button>
        )}
        <button
          type="button"
          onClick={onRestart}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            review.length > 0
              ? 'bg-white text-lavender-700 ring-1 ring-lavender-200 hover:bg-lavender-50'
              : 'bg-lavender-600 text-white shadow-soft hover:bg-lavender-700'
          }`}
        >
          {allKnown ? <CircleCheck className="size-4" aria-hidden="true" /> : <RefreshCw className="size-4" aria-hidden="true" />}
          Restart Session
        </button>
        {onGenerateNew && (
          <button
            type="button"
            onClick={onGenerateNew}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 ring-1 ring-cream-300 transition hover:bg-cream-100"
          >
            <Sparkles className="size-4" aria-hidden="true" />
            Generate New Set
          </button>
        )}
      </div>
    </section>
  )
}
