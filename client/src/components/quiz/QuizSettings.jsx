import { useId } from 'react'
import { DIFFICULTIES, MAX_QUESTIONS, MIN_QUESTIONS } from '../../utils/quiz'
import CountPicker from '../common/CountPicker'

/** Difficulty as a segmented radio group (native radios: arrow keys move the choice). */
function DifficultyPicker({ value, onChange, disabled }) {
  const name = useId()
  return (
    <fieldset className="w-full max-w-sm" disabled={disabled}>
      <legend className="mb-2 text-sm font-semibold text-ink-700">Difficulty</legend>
      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-cream-100 p-1 ring-1 ring-cream-200">
        {DIFFICULTIES.map(({ id, label }) => (
          <label
            key={id}
            className={`cursor-pointer rounded-xl px-3 py-2 text-center text-sm font-semibold transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-lavender-500 ${
              value === id ? 'bg-white text-lavender-700 shadow-soft' : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={id}
              checked={value === id}
              onChange={() => onChange(id)}
              className="sr-only"
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default function QuizSettings({ count, onCountChange, difficulty, onDifficultyChange, disabled = false }) {
  return (
    <div className="flex w-full flex-col items-center gap-5 sm:flex-row sm:items-end sm:justify-center">
      <CountPicker
        label="Number of questions"
        value={count}
        onChange={onCountChange}
        min={MIN_QUESTIONS}
        max={MAX_QUESTIONS}
        // Practice Quiz uses the slider and numeric value only (no quick-choice presets).
        disabled={disabled}
      />
      <DifficultyPicker value={difficulty} onChange={onDifficultyChange} disabled={disabled} />
    </div>
  )
}
