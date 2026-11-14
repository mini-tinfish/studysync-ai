import { useId } from 'react'
import { MAX_CARDS, MIN_CARDS, clampCount } from '../../utils/flashcards'

const PRESETS = [5, 10, 20, 30]

/** Card count control (1–30). A native range input plus quick presets; always yields a valid count. */
export default function CardCountPicker({ value, onChange, disabled = false }) {
  const id = useId()

  return (
    <div className="w-full max-w-sm">
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-ink-700">
          Number of cards
        </label>
        <output htmlFor={id} className="text-lg font-bold tabular-nums text-lavender-700">
          {value}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={MIN_CARDS}
        max={MAX_CARDS}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(clampCount(event.target.value))}
        className="w-full cursor-pointer accent-lavender-600 disabled:cursor-not-allowed"
      />
      <div className="mt-1 flex justify-between text-[11px] text-ink-400" aria-hidden="true">
        <span>{MIN_CARDS}</span>
        <span>{MAX_CARDS}</span>
      </div>
      <div role="group" aria-label="Quick choices" className="mt-3 flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            disabled={disabled}
            onClick={() => onChange(preset)}
            aria-pressed={value === preset}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              value === preset
                ? 'bg-lavender-600 text-white'
                : 'bg-lavender-50 text-lavender-700 ring-1 ring-lavender-200 hover:bg-lavender-100'
            }`}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  )
}
