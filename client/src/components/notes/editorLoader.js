/**
 * Loading the rich-text editor (Tiptap/ProseMirror) on demand.
 *
 * Measured root cause of the slow "Loading editor…": the editor's code was only requested
 * when Paste notes / Edit was clicked, so its whole download + parse cost landed on that
 * click (≈3.5 MB unminified in dev, ≈3.6 s on a throttled mid-range machine; ≈127 kB gzip
 * in production). Preloading during idle time (and on hover/focus of the controls that
 * open it) moves that cost off the click. A failed load is not cached, so it can be retried.
 */
let pending = null

export function loadNotesEditor() {
  pending ??= import('./NotesEditor').catch((error) => {
    pending = null // allow a retry instead of failing forever
    throw error
  })
  return pending
}

export function preloadNotesEditor() {
  loadNotesEditor().catch(() => {})
}

/** Run `task` when the browser is idle (or after a short delay where idle callbacks don't exist). */
export function whenIdle(task, timeout = 3000) {
  if (typeof window === 'undefined') return () => {}
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(task, { timeout })
    return () => window.cancelIdleCallback(id)
  }
  const id = window.setTimeout(task, 1200)
  return () => window.clearTimeout(id)
}
