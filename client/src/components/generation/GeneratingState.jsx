import { useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { SkeletonList } from '../common/LoadingState'

/** Loading panel for AI requests, with elapsed time and a cancel button. */
export default function GeneratingState({ title, description, onCancel, skeleton = true }) {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-5" aria-busy="true">
      <div
        role="status"
        className="flex flex-col items-center gap-3 rounded-2xl border border-lavender-200 bg-lavender-50/60 px-6 py-10 text-center"
      >
        <LoaderCircle className="size-9 animate-spin text-lavender-500" aria-hidden="true" />
        <p className="font-semibold text-ink-900">{title}</p>
        {description && <p className="max-w-md text-sm text-ink-500">{description}</p>}
        <p className="text-xs tabular-nums text-ink-400" aria-hidden="true">
          {seconds}s elapsed
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="mt-1 rounded-xl px-4 py-2 text-sm font-semibold text-ink-500 transition hover:bg-white hover:text-ink-900"
        >
          Cancel
        </button>
      </div>
      {skeleton && <SkeletonList rows={3} />}
    </div>
  )
}
