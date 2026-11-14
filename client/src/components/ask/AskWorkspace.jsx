import { useEffect, useRef, useState } from 'react'
import { MessageCircleQuestionMark, Sparkles, Trash2 } from 'lucide-react'
import { useMaterials } from '../../context/materialsContext'
import { useAskConversation } from '../../hooks/useAskConversation'
import { STARTER_QUESTIONS } from '../../utils/ask'
import DemoButton from '../generation/DemoButton'
import ChatComposer from './ChatComposer'
import ChatLog from './ChatLog'

export function StarterQuestions({ onPick, disabled, footer }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-2 py-6 text-center">
      <span className="mb-3 grid size-12 place-items-center rounded-2xl bg-sky-100 text-sky-600">
        <MessageCircleQuestionMark className="size-6" aria-hidden="true" />
      </span>
      <p className="font-semibold text-ink-900">Ask anything about your notes</p>
      <p className="mt-1 max-w-sm text-sm text-ink-500">Answers are based on this document. Try one of these:</p>
      <ul className="mt-4 grid w-full max-w-lg gap-2 sm:grid-cols-2">
        {STARTER_QUESTIONS.map((question) => (
          <li key={question}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onPick(question)}
              className="flex h-full w-full items-start gap-2 rounded-xl bg-white px-3 py-2.5 text-left text-sm text-ink-700 ring-1 ring-cream-300 transition hover:bg-lavender-50 hover:ring-lavender-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-lavender-500" aria-hidden="true" />
              {question}
            </button>
          </li>
        ))}
      </ul>
      {footer}
    </div>
  )
}

/**
 * Chat for one document. The page renders it with key={document.id}, so switching
 * documents shows that document's own conversation.
 */
export default function AskWorkspace({ document: doc, onOpenDemo }) {
  const { getChatDraft, setChatDraft } = useMaterials()
  const { messages, pending, isLoading, ask, cancel, retry, dismissError, clear, pendingRef } = useAskConversation(doc)
  const [draft, setDraftState] = useState(() => getChatDraft(doc.id))
  const [confirmingClear, setConfirmingClear] = useState(false)
  const textareaRef = useRef(null)

  const setDraft = (text) => {
    setDraftState(text)
    setChatDraft(doc.id, text)
  }

  // If the student leaves while a question is pending, keep it as a draft to resend.
  const draftRef = useRef(draft)
  useEffect(() => {
    draftRef.current = draft
  })
  useEffect(
    () => () => {
      const question = pendingRef.current?.question
      if (question && !draftRef.current.trim()) setChatDraft(doc.id, question)
    },
    [doc.id, pendingRef, setChatDraft],
  )

  async function send(text = draft) {
    if (isLoading) return
    setDraft('')
    setConfirmingClear(false)
    const result = await ask(text)
    if (result.cancelled) textareaRef.current?.focus()
  }

  function handleCancel() {
    const question = cancel()
    setDraft(question)
    textareaRef.current?.focus()
  }

  function handleEditFailed() {
    setDraft(dismissError())
    textareaRef.current?.focus()
  }

  const count = messages.length

  return (
    <section
      aria-labelledby="ask-title"
      className="overflow-clip rounded-3xl border border-cream-200 bg-white shadow-soft"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-200 px-4 py-3 sm:px-5">
        <div>
          <h2 id="ask-title" className="font-bold tracking-tight text-ink-900">
            Conversation
          </h2>
          <p className="text-xs text-ink-500">
            {count === 0 ? 'No messages yet' : `${count} ${count === 1 ? 'message' : 'messages'}`} &middot; the last 10
            are sent as context
          </p>
        </div>
        {count > 0 &&
          (confirmingClear ? (
            <div role="group" aria-label="Confirm clearing the conversation" className="flex items-center gap-2">
              <span className="text-sm text-ink-700">Clear this conversation?</span>
              <button
                type="button"
                onClick={() => {
                  clear()
                  setConfirmingClear(false)
                  textareaRef.current?.focus()
                }}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700"
              >
                Yes, clear
              </button>
              <button
                type="button"
                onClick={() => setConfirmingClear(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:bg-cream-100"
              >
                Keep
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingClear(true)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-ink-500 transition hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Clear conversation
            </button>
          ))}
      </header>

      <ChatLog
        messages={messages}
        pending={pending}
        documentText={doc.text}
        onRetry={retry}
        onEditFailed={handleEditFailed}
        emptyState={
          <StarterQuestions
            onPick={(question) => send(question)}
            disabled={isLoading}
            footer={
              <div className="mt-5 flex items-center gap-2 text-xs text-ink-400">
                No backend handy?
                <DemoButton onClick={onOpenDemo} className="!px-3 !py-1.5 !text-xs" />
              </div>
            }
          />
        }
      />

      <ChatComposer
        value={draft}
        onChange={setDraft}
        onSend={() => send()}
        onCancel={handleCancel}
        isLoading={isLoading}
        textareaRef={textareaRef}
        placeholder={`Ask about “${doc.fileName}”…`}
      />
    </section>
  )
}
