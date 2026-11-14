import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPersister, describeStorageError, loadSavedState, openStudyDb } from '../storage/persistence'
import { MaterialsContext } from './materialsContext'

/**
 * Holds the student's documents, the active study material, and AI results in React state,
 * and keeps them in this browser's IndexedDB so a refresh doesn't lose anything.
 * The backend is stateless (API_CONTRACT.md), so the extracted text lives here
 * and is sent with each AI request.
 *
 * Results are keyed by document id, so output generated for one document can
 * never be shown for another, and removing a document discards its results.
 */
export default function MaterialsProvider({ children }) {
  const [documents, setDocuments] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [results, setResults] = useState({}) // { [documentId]: { [kind]: { data, generatedAt } } }

  // Unsaved drafts (not persisted). Unsaved "new note" draft. A ref, not state: it only needs to survive the editor
  // unmounting (tab or page switches) and must not re-render the app on every keystroke.
  const notesDraftRef = useRef(null)
  // Unsent Ask My Notes question per document (survives page switches, keeps a cancelled question).
  const chatDraftsRef = useRef({})

  // ---------- Browser persistence ----------
  // status: 'loading' (restoring) | 'saved' | 'error' (a save failed) | 'unavailable' (no storage)
  const [storage, setStorage] = useState({ status: 'loading', message: null })
  const persisterRef = useRef(null)
  const latestStateRef = useRef({ documents, activeId, results })
  useEffect(() => {
    latestStateRef.current = { documents, activeId, results }
  }, [documents, activeId, results])

  // Restore saved state once. Saving only starts after this, from a snapshot of exactly what
  // was loaded, so the initial empty state can never overwrite saved data.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const db = await openStudyDb()
        const loaded = await loadSavedState(db)
        if (cancelled) return
        persisterRef.current = createPersister(db, loaded, {
          onSaved: () => setStorage((s) => (s.status === 'saved' ? s : { status: 'saved', message: null })),
          onError: (error) => setStorage({ status: 'error', message: describeStorageError(error) }),
        })
        setDocuments(loaded.documents)
        setResults(loaded.results)
        setActiveId(loaded.activeId)
        setStorage({ status: 'saved', message: null })
      } catch (error) {
        if (!cancelled) setStorage({ status: 'unavailable', message: describeStorageError(error) })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Save after every change (debounced; only what changed is written).
  useEffect(() => {
    persisterRef.current?.schedule({ documents, activeId, results })
  }, [documents, activeId, results])

  // Don't lose the last change when the tab is hidden or closed.
  useEffect(() => {
    const flush = () => persisterRef.current?.flush(latestStateRef.current)
    const onVisibility = () => document.visibilityState === 'hidden' && flush()
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const retrySave = useCallback(() => persisterRef.current?.flush(latestStateRef.current), [])

  /** Remove every document, result, and conversation (in memory and in browser storage). */
  const clearAllData = useCallback(() => {
    setDocuments([])
    setActiveId(null)
    setResults({})
    notesDraftRef.current = null
    chatDraftsRef.current = {}
  }, [])

  // Latest documents for async callbacks (e.g. a generation finishing after an edit).
  const documentsRef = useRef(documents)
  useEffect(() => {
    documentsRef.current = documents
  }, [documents])

  const getNotesDraft = useCallback(() => notesDraftRef.current, [])
  const setNotesDraft = useCallback((draft) => {
    notesDraftRef.current = draft
  }, [])

  const clearResults = (id) =>
    setResults((current) => {
      if (!(id in current)) return current
      const next = { ...current }
      delete next[id]
      return next
    })

  const addDocument = useCallback((doc, { makeActive = true } = {}) => {
    setDocuments((current) => [doc, ...current])
    if (makeActive) setActiveId(doc.id)
  }, [])

  /**
   * Apply `changes` to a document. If its text changes, every generated result for it is
   * discarded (it was built from the old text). Returns the kinds that were cleared.
   */
  const updateDocument = useCallback(
    (id, changes) => {
      const existing = documents.find((doc) => doc.id === id)
      if (!existing) return { updated: false, clearedKinds: [] }
      const textChanged = typeof changes.text === 'string' && changes.text !== existing.text
      const clearedKinds = textChanged ? Object.keys(results[id] ?? {}) : []
      setDocuments((current) => current.map((doc) => (doc.id === id ? { ...doc, ...changes, id } : doc)))
      if (textChanged) clearResults(id)
      return { updated: true, clearedKinds }
    },
    [documents, results],
  )

  const removeDocument = useCallback((id) => {
    setDocuments((current) => current.filter((doc) => doc.id !== id))
    setActiveId((current) => (current === id ? null : current))
    clearResults(id)
    delete chatDraftsRef.current[id]
  }, [])

  // ---------- Ask My Notes conversations (stored as the 'chat' result kind) ----------

  const getChatDraft = useCallback((documentId) => chatDraftsRef.current[documentId] ?? '', [])
  const setChatDraft = useCallback((documentId, text) => {
    if (text) chatDraftsRef.current[documentId] = text
    else delete chatDraftsRef.current[documentId]
  }, [])

  /**
   * Append messages (a question and its answer) to a document's conversation. Skipped —
   * returns false — if the document was removed or its text changed since `sourceText`
   * was sent, so an answer about old notes is never saved.
   */
  const appendChatMessages = useCallback((documentId, messages, { sourceText }) => {
    const doc = documentsRef.current.find((d) => d.id === documentId)
    if (!doc || doc.text !== sourceText) return false
    setResults((current) => {
      const previous = current[documentId]?.chat
      const setId = previous?.setId ?? globalThis.crypto?.randomUUID?.() ?? `chat-${Date.now()}`
      return {
        ...current,
        [documentId]: {
          ...current[documentId],
          chat: {
            data: { messages: [...(previous?.data.messages ?? []), ...messages] },
            origin: 'mixed', // each assistant message carries its own origin
            setId,
            generatedAt: previous?.generatedAt ?? new Date().toISOString(),
            progress: null,
          },
        },
      }
    })
    return true
  }, [])

  const clearChat = useCallback((documentId) => {
    setResults((current) => {
      if (!current[documentId]?.chat) return current
      const rest = { ...current[documentId] }
      delete rest.chat
      return { ...current, [documentId]: rest }
    })
  }, [])

  const selectDocument = useCallback((id) => setActiveId(id), [])

  /**
   * kind: 'studyGuide' | 'flashcards' (later 'quiz', ...).
   * Each save is a new result with its own `setId`; anything tied to the previous
   * result (e.g. flashcard review progress) is discarded with it.
   * origin: 'ai' | 'mock' | 'unknown' — where the server said the content came from.
   * sourceText: the text the request was made with; if the document has been edited
   * since, the result is stale and is not saved. Returns whether it was saved.
   */
  const saveResult = useCallback((documentId, kind, data, { origin = 'unknown', sourceText } = {}) => {
    const doc = documentsRef.current.find((d) => d.id === documentId)
    if (!doc || (sourceText !== undefined && doc.text !== sourceText)) return false
    const setId = globalThis.crypto?.randomUUID?.() ?? `set-${Date.now()}-${Math.random().toString(36).slice(2)}`
    setResults((current) => ({
      ...current,
      [documentId]: {
        ...current[documentId],
        [kind]: { data, origin, setId, generatedAt: new Date().toISOString(), progress: null },
      },
    }))
    return true
  }, [])

  /** Store UI progress (e.g. flashcard review state) on a result, only if it is still the same set. */
  const saveProgress = useCallback((documentId, kind, setId, progress) => {
    setResults((current) => {
      const result = current[documentId]?.[kind]
      if (!result || result.setId !== setId) return current
      return { ...current, [documentId]: { ...current[documentId], [kind]: { ...result, progress } } }
    })
  }, [])

  const getResult = useCallback((documentId, kind) => results[documentId]?.[kind] ?? null, [results])

  /** Kinds of generated content currently stored for a document, e.g. ['studyGuide']. */
  const getResultKinds = useCallback((documentId) => Object.keys(results[documentId] ?? {}), [results])

  const value = useMemo(
    () => ({
      documents,
      activeDocument: documents.find((doc) => doc.id === activeId) ?? null,
      addDocument,
      updateDocument,
      removeDocument,
      selectDocument,
      saveResult,
      saveProgress,
      getResult,
      getResultKinds,
      getNotesDraft,
      setNotesDraft,
      appendChatMessages,
      clearChat,
      getChatDraft,
      setChatDraft,
      storageStatus: storage.status,
      storageMessage: storage.message,
      isRestoring: storage.status === 'loading',
      retrySave,
      clearAllData,
    }),
    [
      storage,
      retrySave,
      clearAllData,
      appendChatMessages,
      clearChat,
      getChatDraft,
      setChatDraft,
      documents,
      activeId,
      addDocument,
      updateDocument,
      removeDocument,
      selectDocument,
      saveResult,
      saveProgress,
      getResult,
      getResultKinds,
      getNotesDraft,
      setNotesDraft,
    ],
  )

  return <MaterialsContext.Provider value={value}>{children}</MaterialsContext.Provider>
}
