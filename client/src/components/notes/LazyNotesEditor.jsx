import { useEffect, useState } from 'react'
import { LoaderCircle, RefreshCw, RotateCw, TriangleAlert } from 'lucide-react'
import { loadNotesEditor } from './editorLoader'

// The editor component once its code has loaded (shared by every later mount: no flash).
let LoadedEditor = null

function EditorLoading() {
  return (
    <div
      role="status"
      className="flex min-h-72 items-center justify-center gap-2 rounded-2xl border border-cream-300 bg-white text-sm text-ink-500 sm:min-h-96"
    >
      <LoaderCircle className="size-5 animate-spin text-lavender-500" aria-hidden="true" />
      Loading editor…
    </div>
  )
}

function EditorLoadFailed({ onRetry }) {
  return (
    <div
      role="alert"
      className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-6 text-center text-sm text-rose-900 sm:min-h-96"
    >
      <TriangleAlert className="size-6 text-rose-600" aria-hidden="true" />
      <p className="font-semibold">The editor couldn&rsquo;t load.</p>
      <p className="max-w-sm opacity-80">
        This can happen after a connection hiccup or an app update. Your saved notes are safe.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100"
        >
          <RotateCw className="size-3.5" aria-hidden="true" />
          Try again
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-800 transition hover:bg-rose-100"
        >
          <RefreshCw className="size-3.5" aria-hidden="true" />
          Reload page
        </button>
      </div>
    </div>
  )
}

/**
 * The rich-text editor, loaded on demand (usually already preloaded during idle time — see
 * editorLoader.js). If its code fails to download, only this area shows an error with
 * Try again / Reload page, instead of the whole app crashing (which a bare React.lazy did).
 */
export default function LazyNotesEditor(props) {
  const [Editor, setEditor] = useState(() => LoadedEditor)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (Editor) return undefined
    let cancelled = false
    loadNotesEditor().then(
      (module) => {
        LoadedEditor = module.default
        if (!cancelled) setEditor(() => module.default)
      },
      () => {
        if (!cancelled) setFailed(true)
      },
    )
    return () => {
      cancelled = true
    }
  }, [Editor, attempt])

  if (Editor) return <Editor {...props} />
  if (failed) {
    return (
      <EditorLoadFailed
        onRetry={() => {
          setFailed(false)
          setAttempt((n) => n + 1)
        }}
      />
    )
  }
  return <EditorLoading />
}
