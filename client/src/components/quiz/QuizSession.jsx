import { useEffect, useMemo, useReducer, useRef } from 'react'
import { ArrowRight, Check, Flag } from 'lucide-react'
import QuizQuestion from './QuizQuestion'
import QuizResults from './QuizResults'
import { quizReducer, restoreQuizSession, scoreQuiz } from './quizReducer'

/**
 * Plays one quiz: one question at a time, submit → feedback → next, then results.
 * Render with key={setId} so a new quiz always starts fresh. `onProgressChange`
 * (optional) persists progress so it survives page navigation; Demo Mode omits it.
 */
export default function QuizSession({ questions, initialProgress, onProgressChange, onGenerateNew }) {
  const [state, dispatch] = useReducer(quizReducer, null, () => restoreQuizSession(questions, initialProgress))
  const byId = useMemo(() => new Map(questions.map((q) => [q.id, q])), [questions])
  const score = useMemo(() => scoreQuiz(questions, state.answers), [questions, state.answers])

  const progressRef = useRef(onProgressChange)
  useEffect(() => {
    progressRef.current = onProgressChange
  })
  useEffect(() => {
    progressRef.current?.(state)
  }, [state])

  const question = byId.get(state.order[state.position])
  const answer = question ? state.answers[question.id] : undefined
  const isSubmitted = Boolean(answer)
  const total = state.order.length
  const number = state.position + 1
  const isLast = number === total

  // Focus management: after submitting, move to the Next button (the Submit button is
  // replaced); after moving on, move to the new question.
  const legendRef = useRef(null)
  const nextRef = useRef(null)
  const submittedAt = useRef(0)
  const lastPosition = useRef(state.position)
  const wasSubmitted = useRef(isSubmitted)
  const wasFinished = useRef(state.finished)
  useEffect(() => {
    if (state.finished) {
      wasFinished.current = true
      return
    }
    if (lastPosition.current !== state.position || wasFinished.current) legendRef.current?.focus()
    else if (!wasSubmitted.current && isSubmitted) nextRef.current?.focus()
    lastPosition.current = state.position
    wasSubmitted.current = isSubmitted
    wasFinished.current = false
  }, [state.position, state.finished, isSubmitted])

  if (state.finished) {
    return (
      <QuizResults
        score={score}
        answers={state.answers}
        onRetry={() => dispatch({ type: 'restart', questions })}
        onGenerateNew={onGenerateNew}
      />
    )
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (isSubmitted) {
      // A fast double-click on "Submit answer" must not also skip past the feedback.
      if (Date.now() - submittedAt.current < 500) return
      dispatch({ type: 'next' })
    } else if (state.pending !== null) {
      submittedAt.current = Date.now()
      dispatch({ type: 'submit', questions })
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Practice quiz" className="mx-auto max-w-2xl space-y-5">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="font-semibold text-ink-700">
            Question {number} of {total}
          </p>
          <p className="text-ink-500">
            Score: <span className="font-semibold tabular-nums text-ink-900">{score.correct}</span> /{' '}
            <span className="tabular-nums">{score.answered}</span> answered
          </p>
        </div>
        <div
          role="progressbar"
          aria-label="Quiz progress"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={score.answered}
          aria-valuetext={`${score.answered} of ${total} questions answered`}
          className="h-2 overflow-hidden rounded-full bg-cream-200"
        >
          <div
            className="h-full rounded-full bg-lavender-500 transition-[width] duration-300"
            style={{ width: `${(score.answered / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-cream-200 bg-white p-5 shadow-lift sm:p-7">
        <QuizQuestion
          key={question.id}
          question={question}
          number={number}
          pending={state.pending}
          answer={answer}
          onSelect={(index) => dispatch({ type: 'select', index })}
          legendRef={legendRef}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-ink-400">
          {isSubmitted ? 'Answer locked in.' : 'Choose an answer, then submit it.'}
        </p>
        {isSubmitted ? (
          <button
            key="next"
            ref={nextRef}
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-lavender-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-lavender-700 hover:shadow-lift"
          >
            {isLast ? (
              <>
                See results
                <Flag className="size-4" aria-hidden="true" />
              </>
            ) : (
              <>
                Next question
                <ArrowRight className="size-4" aria-hidden="true" />
              </>
            )}
          </button>
        ) : (
          <button
            key="submit"
            type="submit"
            disabled={state.pending === null}
            className="inline-flex items-center gap-2 rounded-xl bg-lavender-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-lavender-700 hover:shadow-lift disabled:cursor-not-allowed disabled:bg-lavender-300 disabled:shadow-none"
          >
            <Check className="size-4" aria-hidden="true" />
            Submit answer
          </button>
        )}
      </div>
    </form>
  )
}
