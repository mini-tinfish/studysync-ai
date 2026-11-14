import { useId } from 'react'
import { RotateCcw } from 'lucide-react'

const faceBase =
  'flex min-h-64 flex-col items-center justify-center rounded-3xl px-6 py-10 text-center [grid-area:1/1] [backface-visibility:hidden] sm:min-h-72 sm:px-10'

/**
 * A flippable card. It is a native <button>, so click, Enter, and Space all flip it.
 * Both faces share one grid cell (the card grows to fit the longer side) and only the
 * visible face is exposed to assistive technology. Reduced-motion users get an
 * instant flip via the global prefers-reduced-motion rule in index.css.
 */
export default function Flashcard({ card, isFlipped, onFlip, mark, buttonRef }) {
  const hintId = useId()

  return (
    <div className="[perspective:1400px]">
      <button
        ref={buttonRef}
        type="button"
        onClick={onFlip}
        aria-describedby={hintId}
        className={`group grid w-full rounded-3xl text-left transition-transform duration-500 ease-out [transform-style:preserve-3d] focus-visible:outline-offset-4 ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Front: question */}
        <span
          aria-hidden={isFlipped}
          className={`${faceBase} border border-cream-200 bg-white shadow-lift transition-shadow group-hover:shadow-[0_18px_40px_-12px_rgb(59_44_93/0.25)]`}
        >
          <span className="mb-4 rounded-full bg-lavender-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-lavender-700">
            Question
          </span>
          <span className="max-w-xl text-lg font-semibold leading-relaxed text-ink-900 sm:text-xl">{card.front}</span>
        </span>

        {/* Back: answer */}
        <span
          aria-hidden={!isFlipped}
          className={`${faceBase} bg-gradient-to-br from-lavender-600 to-lavender-500 text-white shadow-lift [transform:rotateY(180deg)]`}
        >
          <span className="mb-4 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]">
            Answer
          </span>
          <span className="max-w-xl text-lg leading-relaxed sm:text-xl">{card.back}</span>
        </span>
      </button>

      <p id={hintId} className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-400">
        <RotateCcw className="size-3.5" aria-hidden="true" />
        {isFlipped ? 'Showing the answer. ' : 'Showing the question. '}
        Click, or press Enter or Space, to flip.
        {mark && <span className="sr-only"> Marked as {mark === 'know' ? 'Know it' : 'Review again'}.</span>}
      </p>

      {/* Announce the newly revealed side for screen reader users. */}
      <p role="status" className="sr-only">
        {isFlipped ? `Answer: ${card.back}` : ''}
      </p>
    </div>
  )
}
