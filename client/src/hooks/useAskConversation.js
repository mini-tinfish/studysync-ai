import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, REQUEST_ABORTED, askNotes, getHealth } from '../api/client'
import { useMaterials } from '../context/materialsContext'
import { buildHistory, normalizeAskResponse, validateQuestion } from '../utils/ask'

const NO_MESSAGES = Object.freeze([]) // stable identity when there is no conversation yet
const newId = () => globalThis.crypto?.randomUUID?.() ?? `m-${Date.now()}-${Math.random().toString(36).slice(2)}`

/**
 * Ask My Notes conversation for one document (render the owner with key={document.id}).
 *
 * - Messages live in MaterialsProvider (result kind 'chat'), so they survive navigation,
 *   are cleared when the note's text is edited, and disappear with the document.
 * - A question is stored only together with its answer, so history always alternates
 *   user/assistant and a failed or cancelled question never pollutes it.
 * - One request at a time; it is cancelled on `cancel()` or unmount.
 * - The answer is not saved if the document was edited or removed meanwhile.
 */
export function useAskConversation(doc) {
  const { getResult, appendChatMessages, clearChat } = useMaterials()
  const messages = getResult(doc.id, 'chat')?.data.messages ?? NO_MESSAGES
  const [pending, setPending] = useState(null) // { question, status: 'loading' | 'error', error? }
  const controllerRef = useRef(null)
  const pendingRef = useRef(null)
  useEffect(() => {
    pendingRef.current = pending
  })

  useEffect(() => () => controllerRef.current?.abort(), [])

  const ask = useCallback(
    async (rawQuestion) => {
      const question = rawQuestion.trim()
      if (controllerRef.current || validateQuestion(question)) return { sent: false }
      const controller = new AbortController()
      controllerRef.current = controller
      setPending({ question, status: 'loading' })
      const history = buildHistory(messages)
      const sourceText = doc.text
      try {
        const [raw, health] = await Promise.all([
          askNotes({ text: sourceText, question, history }, { signal: controller.signal }),
          getHealth({ signal: controller.signal }).catch(() => null),
        ])
        const answer = normalizeAskResponse(raw)
        const now = new Date().toISOString()
        const saved = appendChatMessages(
          doc.id,
          [
            { id: newId(), role: 'user', content: question, createdAt: now },
            {
              id: newId(),
              role: 'assistant',
              content: answer.answer,
              answeredFromMaterial: answer.answeredFromMaterial,
              citations: answer.citations,
              origin: health ? (health.mockMode ? 'mock' : 'ai') : 'unknown',
              createdAt: now,
            },
          ],
          { sourceText },
        )
        setPending(null)
        return { sent: true, saved }
      } catch (err) {
        if (err?.code === REQUEST_ABORTED) return { sent: false, cancelled: true }
        setPending({
          question,
          status: 'error',
          error:
            err instanceof ApiError
              ? err
              : new ApiError({ code: 'INTERNAL_ERROR', message: 'Something unexpected went wrong. Please try again.', status: 0 }),
        })
        return { sent: false }
      } finally {
        if (controllerRef.current === controller) controllerRef.current = null
      }
    },
    [doc.id, doc.text, messages, appendChatMessages],
  )

  /** Cancel the pending request; returns the question so it can go back into the composer. */
  const cancel = useCallback(() => {
    const question = pendingRef.current?.question ?? ''
    controllerRef.current?.abort()
    controllerRef.current = null
    setPending(null)
    return question
  }, [])

  /** Dismiss a failed question; returns it so it can be edited and resent. */
  const dismissError = useCallback(() => {
    const question = pendingRef.current?.question ?? ''
    setPending(null)
    return question
  }, [])

  const retry = useCallback(() => {
    const question = pendingRef.current?.question
    if (question) {
      setPending(null)
      return ask(question)
    }
    return Promise.resolve({ sent: false })
  }, [ask])

  return {
    messages,
    pending,
    isLoading: pending?.status === 'loading',
    ask,
    cancel,
    retry,
    dismissError,
    clear: () => clearChat(doc.id),
    pendingRef,
  }
}
