import { useCallback, useMemo, useState } from 'react'
import { MaterialsContext } from './materialsContext'

/**
 * Holds the student's documents, the active study material, and AI results in React state.
 * The backend is stateless (API_CONTRACT.md), so the extracted text lives here
 * and is sent with each AI request. State resets on a full page reload.
 *
 * Results are keyed by document id, so output generated for one document can
 * never be shown for another, and removing a document discards its results.
 */
export default function MaterialsProvider({ children }) {
  const [documents, setDocuments] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [results, setResults] = useState({}) // { [documentId]: { [kind]: { data, generatedAt } } }

  const addDocument = useCallback((doc, { makeActive = true } = {}) => {
    setDocuments((current) => [doc, ...current])
    if (makeActive) setActiveId(doc.id)
  }, [])

  const removeDocument = useCallback((id) => {
    setDocuments((current) => current.filter((doc) => doc.id !== id))
    setActiveId((current) => (current === id ? null : current))
    setResults((current) => {
      if (!(id in current)) return current
      const next = { ...current }
      delete next[id]
      return next
    })
  }, [])

  const selectDocument = useCallback((id) => setActiveId(id), [])

  /**
   * kind: 'studyGuide' | 'flashcards' (later 'quiz', ...).
   * Each save is a new result with its own `setId`; anything tied to the previous
   * result (e.g. flashcard review progress) is discarded with it.
   * origin: 'ai' | 'mock' | 'unknown' — where the server said the content came from.
   */
  const saveResult = useCallback((documentId, kind, data, { origin = 'unknown' } = {}) => {
    const setId = globalThis.crypto?.randomUUID?.() ?? `set-${Date.now()}-${Math.random().toString(36).slice(2)}`
    setResults((current) => ({
      ...current,
      [documentId]: {
        ...current[documentId],
        [kind]: { data, origin, setId, generatedAt: new Date().toISOString(), progress: null },
      },
    }))
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

  const value = useMemo(
    () => ({
      documents,
      activeDocument: documents.find((doc) => doc.id === activeId) ?? null,
      addDocument,
      removeDocument,
      selectDocument,
      saveResult,
      saveProgress,
      getResult,
    }),
    [documents, activeId, addDocument, removeDocument, selectDocument, saveResult, saveProgress, getResult],
  )

  return <MaterialsContext.Provider value={value}>{children}</MaterialsContext.Provider>
}
