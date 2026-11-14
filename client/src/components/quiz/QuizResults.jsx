import { useEffect, useRef } from 'react'
import { CircleCheck, CircleX, Lightbulb, PartyPopper, RotateCcw, Sparkles, Trophy } from 'lucide-react'

const LETTERS = ['A', 'B', 'C', 'D']

function Stat({ label, value, tone }) {
  return (
    <div className={`rounded-2xl p-4 text-center ring-1 ${tone}`}>
      <p className="text-3xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] opacity-80">{label}</p>
    </div>
  )
}

export default function QuizResults({ score, answers, onRetry, onGenerateNew }) {
  const headingRef = useRef(null)
  useEffect(() => headingRef.current?.focus(), [])

  const { correct, incorrect, total, percent, missed } = score
  const perfect = correct === total
  const message = perfect
    ? 'Perfect score!'
    : percent >= 80
      ? 'Great work!'
      : percent >= 50
        ? 'Good effort, keep practicing!'
        : 'Keep studying, you’ll get there!'

  return (
    <section aria-labelledby="quiz-results-title" className="space-y-6">
      <div className="rounded-3xl border border-cream-200 bg-white p-6 text-center shadow-lift sm:p-8">
        <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-lavender-100 text-lavender-600">
          {perfect ? <PartyPopper className="size-7" aria-hidden="true" /> : <Trophy className="size-7" aria-hidden="true" />}
        </span>
        <h2
          id="quiz-results-title"
          ref={headingRef}
          tabIndex={-1}
          className="text-xl font-bold tracking-tight text-ink-900 outline-none sm:text-2xl"
        >
          Quiz complete: {correct} of {total} correct
        </h2>
        <p className="mt-1.5 text-sm text-ink-500">{message}</p>

        <div
          className="mx-auto mt-6 grid size-32 place-items-center rounded-full"
          style={{
            background: `conic-gradient(var(--color-lavender-500) ${percent * 3.6}deg, var(--color-cream-200) 0deg)`,
          }}
          aria-hidden="true"
        >
          <div className="grid size-24 place-items-center rounded-full bg-white">
            <span className="text-3xl font-bold tabular-nums text-lavender-700">{percent}%</span>
          </div>
        </div>
        <p className="sr-only">You scored {percent} percent.</p>

        <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-3">
          <Stat label="Score" value={`${correct}/${total}`} tone="bg-lavender-50 text-lavender-800 ring-lavender-200" />
          <Stat label="Correct" value={correct} tone="bg-emerald-50 text-emerald-800 ring-emerald-200" />
          <Stat label="Incorrect" value={incorrect} tone="bg-rose-50 text-rose-800 ring-rose-200" />
        </div>

        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-lavender-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-lavender-700"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Retry Quiz
          </button>
          {onGenerateNew && (
            <button
              type="button"
              onClick={onGenerateNew}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-lavender-700 ring-1 ring-lavender-200 transition hover:bg-lavender-50"
            >
              <Sparkles className="size-4" aria-hidden="true" />
              Generate New Quiz
            </button>
          )}
        </div>
      </div>

      {missed.length > 0 ? (
        <section aria-labelledby="missed-title">
          <h3 id="missed-title" className="mb-3 text-lg font-bold tracking-tight text-ink-900">
            Review missed questions ({missed.length})
          </h3>
          <ol className="space-y-3">
            {missed.map((q) => {
              const selected = answers[q.id]?.selected
              return (
                <li key={q.id} className="rounded-2xl border border-cream-200 bg-white p-5 shadow-soft">
                  <p className="font-semibold leading-relaxed text-ink-900">{q.question}</p>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex gap-2 rounded-xl bg-rose-50 px-3 py-2 text-rose-900">
                      <dt className="flex shrink-0 gap-2 font-semibold">
                        <CircleX className="mt-0.5 size-4 shrink-0 text-rose-600" aria-hidden="true" />
                        Your answer:
                      </dt>
                      <dd>
                        {LETTERS[selected]}. {q.options[selected]}
                      </dd>
                    </div>
                    <div className="flex gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-emerald-900">
                      <dt className="flex shrink-0 gap-2 font-semibold">
                        <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                        Correct answer:
                      </dt>
                      <dd>
                        {LETTERS[q.correctIndex]}. {q.options[q.correctIndex]}
                      </dd>
                    </div>
                  </dl>
                  {q.explanation && (
                    <p className="mt-3 flex gap-2 text-sm leading-relaxed text-ink-700">
                      <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden="true" />
                      <span>{q.explanation}</span>
                    </p>
                  )}
                </li>
              )
            })}
          </ol>
        </section>
      ) : (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
          No missed questions. Every answer was correct.
        </p>
      )}
    </section>
  )
}
