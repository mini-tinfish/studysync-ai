import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, REQUEST_ABORTED, getHealth } from '../api/client'
import { useMaterials } from '../context/materialsContext'

/**
 * Shared request lifecycle for AI features (study guide, flashcards, ...).
 *
 * - One request at a time: calls made while a request is pending are ignored.
 * - The pending request is cancelled on `cancel()` and when the component unmounts
 *   (leaving the page or switching documents, since pages key workspaces by document id).
 * - GET /api/health runs alongside the request so the result records its origin:
 *   'mock' when the server is in MOCK_AI mode, 'ai' otherwise, 'unknown' if health failed.
 * - Results are saved per document in MaterialsProvider, never shared across documents.
 */
export function useGeneration({ documentId, kind, sourceText }) {
  const { getResult, saveResult } = useMaterials()
  const result = getResult(documentId, kind)
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'error'
  const [error, setError] = useState(null)
  const controllerRef = useRef(null)

  useEffect(() => () => controllerRef.current?.abort(), [])

  /**
   * requestFn(signal) → raw API response; normalize(raw) → data (may throw ApiError).
   * Resolves true on success, false on failure, cancellation, or a duplicate call.
   */
  const run = useCallback(
    async (requestFn, normalize) => {
      if (controllerRef.current) return false
      const controller = new AbortController()
      controllerRef.current = controller
      setStatus('loading')
      setError(null)
      try {
        const [raw, health] = await Promise.all([
          requestFn(controller.signal),
          getHealth({ signal: controller.signal }).catch(() => null),
        ])
        const data = normalize(raw)
        const origin = health ? (health.mockMode ? 'mock' : 'ai') : 'unknown'
        // Not saved if the document's text changed while the request was running.
        const saved = saveResult(documentId, kind, data, { origin, sourceText })
        setStatus('idle')
        return saved
      } catch (err) {
        if (err?.code === REQUEST_ABORTED) return false
        setError(
          err instanceof ApiError
            ? err
            : new ApiError({ code: 'INTERNAL_ERROR', message: 'Something unexpected went wrong. Please try again.', status: 0 }),
        )
        setStatus('error')
        return false
      } finally {
        if (controllerRef.current === controller) controllerRef.current = null
      }
    },
    [documentId, kind, sourceText, saveResult],
  )

  const cancel = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
    setStatus('idle')
  }, [])

  return { result, status, error, run, cancel }
}
