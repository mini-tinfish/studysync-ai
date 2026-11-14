import { CircleCheck, CircleX, Lightbulb } from 'lucide-react'

const LETTERS = ['A', 'B', 'C', 'D']

/**
 * One multiple-choice question. Options are native radio buttons in a fieldset, so arrow
 * keys move between choices and screen readers announce "1 of 4". Nothing in the DOM
 * hints at the correct answer until the answer has been submitted (`answer` is set).
 */
export default function QuizQuestion({ question, number, pending, answer, onSelect, legendRef }) {
  const submitted = Boolean(answer)
  const name = `quiz-${question.id}`
  const feedbackId = `${name}-feedback`

  function optionState(index) {
    if (!submitted) return pending === index ? 'selected' : 'idle'
    if (index === question.correctIndex) return 'correct'
    if (index === answer.selected) return 'wrong'
    return 'dimmed'
  }

  const styles = {
    idle: 'border-cream-200 bg-white hover:border-lavender-300 hover:bg-lavender-50/50',
    selected: 'border-lavender-500 bg-lavender-50 ring-4 ring-lavender-100',
    correct: 'border-emerald-400 bg-emerald-50',
    wrong: 'border-rose-400 bg-rose-50',
    dimmed: 'border-cream-200 bg-white opacity-60',
  }
  const letterStyles = {
    idle: 'bg-cream-100 text-ink-700',
    selected: 'bg-lavender-600 text-white',
    correct: 'bg-emerald-600 text-white',
    wrong: 'bg-rose-600 text-white',
    dimmed: 'bg-cream-100 text-ink-500',
  }

  return (
    <fieldset aria-describedby={submitted ? feedbackId : undefined} className="space-y-4">
      <legend
        ref={legendRef}
        tabIndex={-1}
        className="mb-4 text-lg font-semibold leading-relaxed text-ink-900 outline-none sm:text-xl"
      >
        <span className="sr-only">Question {number}: </span>
        {question.question}
      </legend>

      <div className="grid gap-3">
        {question.options.map((option, index) => {
          const state = optionState(index)
          return (
            <label
              key={index}
              className={`group flex items-start gap-3 rounded-2xl border-2 p-4 transition duration-150 ${styles[state]} ${
                submitted ? 'cursor-default' : 'cursor-pointer'
              } has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-lavender-500`}
            >
              <input
                type="radio"
                name={name}
                value={index}
                checked={submitted ? answer.selected === index : pending === index}
                onChange={() => onSelect(index)}
                disabled={submitted}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={`grid size-8 shrink-0 place-items-center rounded-lg text-sm font-bold transition ${letterStyles[state]}`}
              >
                {LETTERS[index]}
              </span>
              <span className="flex-1 pt-1 text-[15px] leading-relaxed text-ink-900">{option}</span>
              {state === 'correct' && (
                <span className="flex shrink-0 items-center gap-1 pt-1 text-xs font-semibold text-emerald-700">
                  <CircleCheck className="size-4" aria-hidden="true" />
                  Correct answer
                </span>
              )}
              {state === 'wrong' && (
                <span className="flex shrink-0 items-center gap-1 pt-1 text-xs font-semibold text-rose-700">
                  <CircleX className="size-4" aria-hidden="true" />
                  Your answer
                </span>
              )}
            </label>
          )
        })}
      </div>

      {/* Feedback is announced when it appears (polite live region). */}
      <div role="status" id={feedbackId}>
        {submitted && (
          <div
            className={`rounded-2xl p-4 ring-1 ${
              answer.correct ? 'bg-emerald-50 ring-emerald-200' : 'bg-rose-50 ring-rose-200'
            }`}
          >
            <p className={`flex items-center gap-2 font-bold ${answer.correct ? 'text-emerald-800' : 'text-rose-800'}`}>
              {answer.correct ? (
                <CircleCheck className="size-5" aria-hidden="true" />
              ) : (
                <CircleX className="size-5" aria-hidden="true" />
              )}
              {answer.correct ? 'Correct!' : 'Not quite.'}
            </p>
            {!answer.correct && (
              <p className="mt-1 text-sm font-semibold text-rose-800">
                The answer is {LETTERS[question.correctIndex]}: {question.options[question.correctIndex]}
              </p>
            )}
            {question.explanation && (
              <p className="mt-2 flex gap-2 text-sm leading-relaxed text-ink-700">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden="true" />
                <span>{question.explanation}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </fieldset>
  )
}
