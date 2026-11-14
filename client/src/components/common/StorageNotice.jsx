import { useState } from 'react'
import { DatabaseZap, RotateCw, X } from 'lucide-react'
import { useMaterials } from '../../context/materialsContext'

/**
 * Tells the student when their work isn't being saved in the browser:
 * - 'unavailable': storage can't be used at all (the app still works until a refresh)
 * - 'error': a save failed (e.g. storage full); retried on the next change or via "Try again"
 */
export default function StorageNotice() {
  const { storageStatus, storageMessage, retrySave } = useMaterials()
  const [dismissedStatus, setDismissedStatus] = useState(null)

  if (storageStatus !== 'unavailable' && storageStatus !== 'error') return null
  if (dismissedStatus === storageStatus) return null

  const isError = storageStatus === 'error'
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`mb-6 flex flex-col gap-3 rounded-2xl border px-4 py-3 text-sm sm:flex-row sm:items-start ${
        isError ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-amber-200 bg-amber-50 text-amber-900'
      }`}
    >
      <DatabaseZap className={`mt-0.5 size-5 shrink-0 ${isError ? 'text-rose-600' : 'text-amber-600'}`} aria-hidden="true" />
      <div className="flex-1">
        <p className="font-semibold">
          {isError ? 'Your latest changes couldn’t be saved' : 'Saving is turned off in this browser'}
        </p>
        <p className="mt-0.5 leading-relaxed opacity-90">
          {storageMessage}{' '}
          {isError
            ? 'Everything still works, but recent changes may be lost if you refresh or close this tab.'
            : 'Everything still works, but your materials will be lost when you refresh or close this tab.'}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {isError && (
          <button
            type="button"
            onClick={retrySave}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100"
          >
            <RotateCw className="size-3.5" aria-hidden="true" />
            Try again
          </button>
        )}
        <button
          type="button"
          onClick={() => setDismissedStatus(storageStatus)}
          aria-label="Dismiss storage notice"
          className="grid size-7 place-items-center rounded-lg opacity-70 transition hover:bg-black/5 hover:opacity-100"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
