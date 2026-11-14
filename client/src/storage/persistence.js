import { openDB } from 'idb'
import { restoreState } from './restore'

/**
 * IndexedDB persistence for StudySync. Everything stays in this browser: nothing here
 * talks to a server. Stores:
 *   documents  { id, ...document }                 (keyPath: id)
 *   results    { [kind]: result }                   (key: document id)
 *   meta       activeId / documentOrder / schemaVersion
 * Only serializable app data is stored — never pending requests, AbortControllers,
 * unsent drafts, or anything secret (API keys live on the server only).
 */

const DB_NAME = 'studysync-ai'
const DB_VERSION = 1
const SCHEMA_VERSION = 1
const SAVE_DELAY_MS = 250

export class StorageUnavailableError extends Error {}

/** A user-facing explanation for a storage failure. */
export function describeStorageError(error) {
  const name = error?.name ?? ''
  if (error instanceof StorageUnavailableError || name === 'SecurityError' || name === 'InvalidStateError') {
    return "Your browser isn't allowing this site to save data (for example in a private window, or when site data is blocked)."
  }
  if (name === 'QuotaExceededError' || /quota/i.test(error?.message ?? '')) {
    return "Your browser's storage for this site is full. Removing some documents frees up space."
  }
  return 'Your browser reported an error while saving.'
}

export async function openStudyDb() {
  if (typeof indexedDB === 'undefined' || !indexedDB) {
    throw new StorageUnavailableError('IndexedDB is not available')
  }
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('documents')) db.createObjectStore('documents', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('results')) db.createObjectStore('results')
      if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta')
    },
    // Another tab upgraded the database: close so it can proceed.
    blocking(_current, _blocked, event) {
      event.target.close()
    },
  })
}

/** Read and validate everything that was saved. */
export async function loadSavedState(db) {
  const tx = db.transaction(['documents', 'results', 'meta'], 'readonly')
  const [documents, resultKeys, resultValues, order, activeId, schemaVersion] = await Promise.all([
    tx.objectStore('documents').getAll(),
    tx.objectStore('results').getAllKeys(),
    tx.objectStore('results').getAll(),
    tx.objectStore('meta').get('documentOrder'),
    tx.objectStore('meta').get('activeId'),
    tx.objectStore('meta').get('schemaVersion'),
  ])
  await tx.done
  if (schemaVersion !== undefined && schemaVersion > SCHEMA_VERSION) {
    // Saved by a newer version of the app; don't risk misreading or overwriting it.
    throw new StorageUnavailableError('Saved data comes from a newer version of StudySync.')
  }
  const results = Object.fromEntries(resultKeys.map((key, i) => [key, resultValues[i]]))
  return restoreState({ documents, results, order, activeId })
}

/**
 * Writes state changes to IndexedDB. Saves are debounced and serialized; each save writes
 * only what changed since the last successful save (by object identity — app state is
 * updated immutably), in one transaction. `snapshot` starts as the state that was just
 * loaded, so hydration never writes the initial empty state over saved data.
 */
export function createPersister(db, loadedState, { onSaved, onError } = {}) {
  let saved = snapshotOf(loadedState)
  let latest = null
  let failed = null // state whose save failed; retried on the next change or an explicit flush
  let timer = null
  let running = null

  async function save() {
    if (!latest) return
    const state = latest
    latest = null
    const next = snapshotOf(state)
    if (sameSnapshot(saved, next)) return
    let tx
    try {
      // Creating the transaction or a put can throw synchronously (closed database, data
      // that can't be cloned), so everything is inside the try.
      tx = db.transaction(['documents', 'results', 'meta'], 'readwrite')
      const documents = tx.objectStore('documents')
      const results = tx.objectStore('results')
      const meta = tx.objectStore('meta')
      const ops = []
      const op = (promise) => ops.push(promise.catch(() => {})) // failures surface via tx.done

      for (const [id, doc] of next.documents) if (saved.documents.get(id) !== doc) op(documents.put(doc))
      for (const id of saved.documents.keys()) if (!next.documents.has(id)) op(documents.delete(id))
      for (const [id, result] of next.results) if (saved.results.get(id) !== result) op(results.put(result, id))
      for (const id of saved.results.keys()) if (!next.results.has(id)) op(results.delete(id))
      if (next.order !== saved.order) op(meta.put(JSON.parse(next.order), 'documentOrder'))
      if (next.activeId !== saved.activeId) op(meta.put(next.activeId, 'activeId'))
      op(meta.put(SCHEMA_VERSION, 'schemaVersion'))

      await Promise.all([...ops, tx.done])
      saved = next
      failed = null
      onSaved?.()
    } catch (error) {
      // Keep the old snapshot, so the next save rewrites everything that didn't land.
      // Don't loop: a full disk would fail forever. Wait for a new change or a retry.
      failed = state
      // If a put threw before we awaited tx.done, observe it so the abort isn't an
      // unhandled rejection.
      tx?.done.catch(() => {})
      try {
        tx?.abort()
      } catch {
        // already finished or aborted
      }
      onError?.(tx?.error ?? error)
    }
  }

  function run() {
    if (running) return running
    running = (async () => {
      try {
        while (latest) await save()
      } finally {
        running = null
      }
    })()
    return running
  }

  return {
    /** Queue a save of `state` (debounced). */
    schedule(state) {
      latest = state
      clearTimeout(timer)
      timer = setTimeout(run, SAVE_DELAY_MS)
    },
    /** Save immediately (e.g. when the page is being hidden), or retry after an error. */
    flush(state) {
      latest = state ?? latest ?? failed
      clearTimeout(timer)
      return run()
    },
  }
}

const sameEntries = (a, b) => a.size === b.size && [...a].every(([key, value]) => b.get(key) === value)

function sameSnapshot(a, b) {
  return (
    a.order === b.order &&
    a.activeId === b.activeId &&
    sameEntries(a.documents, b.documents) &&
    sameEntries(a.results, b.results)
  )
}

function snapshotOf({ documents, results, activeId }) {
  return {
    documents: new Map(documents.map((doc) => [doc.id, doc])),
    results: new Map(Object.entries(results).filter(([, r]) => r && Object.keys(r).length)),
    order: JSON.stringify(documents.map((doc) => doc.id)),
    activeId: activeId ?? null,
  }
}
