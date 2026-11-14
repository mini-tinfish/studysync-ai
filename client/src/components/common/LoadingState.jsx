import { LoaderCircle } from 'lucide-react'

/** Generic loading indicator. Not used yet — ready for when API calls are wired up. */
export default function LoadingState({ label = 'Loading…', className = '' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 py-12 text-ink-500 ${className}`}
    >
      <LoaderCircle className="size-8 animate-spin text-lavender-500" aria-hidden="true" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}

/** Placeholder shimmer blocks for list/card content while loading. */
export function SkeletonList({ rows = 3 }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 rounded-2xl bg-white p-4 shadow-soft">
          <div className="size-10 rounded-xl bg-lavender-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/2 rounded-full bg-cream-200" />
            <div className="h-3 w-1/3 rounded-full bg-cream-200" />
          </div>
        </div>
      ))}
    </div>
  )
}
