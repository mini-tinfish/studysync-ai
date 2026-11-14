import { RotateCw, TriangleAlert } from 'lucide-react'

/** Generic error display with optional retry. Not used yet — ready for API integration. */
export default function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again in a moment.',
  onRetry,
  className = '',
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/60 px-6 py-10 text-center ${className}`}
    >
      <span className="mb-3 grid size-12 place-items-center rounded-2xl bg-rose-100 text-rose-600">
        <TriangleAlert className="size-6" aria-hidden="true" />
      </span>
      <h3 className="text-base font-semibold text-ink-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-500">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink-700 shadow-soft ring-1 ring-rose-200 transition hover:bg-rose-50"
        >
          <RotateCw className="size-4" aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  )
}
