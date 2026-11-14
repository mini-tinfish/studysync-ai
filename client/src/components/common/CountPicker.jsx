import { useId } from 'react'

/**
 * Number picker for generation settings: a native range input (keyboard arrows, touch drag)
 * with the current value shown. Pass `presets` to add quick-choice buttons (Flashcards does);
 * omit it for a slider-only picker (Practice Quiz).
 * Always yields a value within [min, max].
 */
export default function CountPicker({ label, value, onChange, min, max, presets = [], disabled = false }) {
  const id = useId()
  const clamp = (n) => Math.min(max, Math.max(min, Math.round(Number(n)) || min))

  return (
    <div className="w-full max-w-sm">
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-ink-700">
          {label}
        </label>
        <output htmlFor={id} className="text-lg font-bold tabular-nums text-lavender-700">
          {value}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(clamp(event.target.value))}
        className="w-full cursor-pointer accent-lavender-600 disabled:cursor-not-allowed"
      />
      <div className="mt-1 flex justify-between text-[11px] text-ink-400" aria-hidden="true">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      {presets.length > 0 && (
        <div role="group" aria-label={`Quick choices for ${label.toLowerCase()}`} className="mt-3 flex flex-wrap gap-2">
          {presets.map((preset) => (
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
      )}
    </div>
  )
}
