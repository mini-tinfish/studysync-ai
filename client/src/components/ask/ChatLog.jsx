import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowDown, PencilLine, RotateCw, TriangleAlert } from 'lucide-react'
import { errorTitle } from '../generation/errorMessages'
import ChatMessage from './ChatMessage'

const NEAR_BOTTOM_PX = 80
const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div
        role="status"
        className="flex items-center gap-3 rounded-2xl rounded-bl-md border border-cream-200 bg-white px-4 py-3 shadow-soft"
      >
        <span className="flex gap-1" aria-hidden="true">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="size-2 animate-bounce rounded-full bg-lavender-400"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
        <span className="text-sm text-ink-500">Reading your notes…</span>
      </div>
    </div>
  )
}

/**
 * Scrollable conversation. Auto-scrolls to new content only while the student is already
 * near the bottom; if they scrolled up to reread, a "Jump to latest" button appears instead.
 */
export default function ChatLog({ messages, pending, documentText, onRetry, onEditFailed, emptyState }) {
  const scrollRef = useRef(null)
  const stickToBottom = useRef(true)
  const [hasUnseen, setHasUnseen] = useState(false)

  // True while *we* are smooth-scrolling: the intermediate scroll positions of that animation
  // must not be mistaken for the student scrolling up. Cleared on arrival or on any real input.
  const autoScrolling = useRef(false)

  const scrollToBottom = (smooth) => {
    const el = scrollRef.current
    if (!el) return
    const animate = smooth && !prefersReducedMotion()
    autoScrolling.current = animate
    el.scrollTo({ top: el.scrollHeight, behavior: animate ? 'smooth' : 'auto' })
    stickToBottom.current = true
    setHasUnseen(false)
  }

  // Start at the latest message.
  useLayoutEffect(() => {
    scrollToBottom(false)
  }, [])

  // Follow new content instantly while the student is at the bottom (no animation, so a fast
  // answer arriving mid-animation can't be misread as the student scrolling away).
  const contentKey = `${messages.length}:${pending?.status ?? ''}`
  useEffect(() => {
    if (stickToBottom.current) scrollToBottom(false)
    else setHasUnseen(true)
  }, [contentKey])

  function handleScroll() {
    const el = scrollRef.current
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX
    if (autoScrolling.current) {
      if (nearBottom) autoScrolling.current = false
      return
    }
    stickToBottom.current = nearBottom
    if (nearBottom) setHasUnseen(false)
  }

  const stopAutoScroll = () => {
    autoScrolling.current = false
  }

  // Messages can grow after they first render (the Markdown renderer loads lazily; tables and
  // code blocks lay out). If the student was at the bottom, keep them there.
  const contentRef = useRef(null)
  useEffect(() => {
    const el = scrollRef.current
    const content = contentRef.current
    if (!el || !content || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(() => {
      if (stickToBottom.current && !autoScrolling.current) el.scrollTop = el.scrollHeight
    })
    observer.observe(content)
    return () => observer.disconnect()
  }, [])

  const isEmpty = messages.length === 0 && !pending

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onWheel={stopAutoScroll}
        onTouchStart={stopAutoScroll}
        onKeyDown={stopAutoScroll}
        role="log"
        aria-label="Conversation"
        aria-live="polite"
        tabIndex={0}
        className="h-[min(60vh,560px)] min-h-72 overflow-y-auto px-3 py-4 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lavender-300 sm:px-5"
      >
        {/* Observed for size changes (see ResizeObserver above). */}
        <div ref={contentRef} className="flex min-h-full flex-col gap-4">
        {isEmpty
          ? emptyState
          : messages.map((message) => <ChatMessage key={message.id} message={message} documentText={documentText} />)}

        {pending && (
          <>
            <div className="flex justify-end">
              <div
                className={`max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 shadow-soft sm:max-w-[75%] ${
                  pending.status === 'error' ? 'bg-lavender-200 text-lavender-900' : 'bg-lavender-600 text-white'
                }`}
              >
                <p className="sr-only">You asked:</p>
                <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{pending.question}</p>
              </div>
            </div>
            {pending.status === 'loading' && <TypingIndicator />}
            {pending.status === 'error' && (
              <div role="alert" className="mx-auto max-w-md rounded-2xl bg-rose-50 px-4 py-3 text-sm ring-1 ring-rose-200">
                <p className="flex items-center gap-2 font-semibold text-rose-800">
                  <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
                  {errorTitle(pending.error.code)}
                </p>
                <p className="mt-1 text-rose-900/90">{pending.error.message}</p>
                <p className="mt-1 text-xs text-rose-900/70">This question wasn&rsquo;t added to the conversation.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100"
                  >
                    <RotateCw className="size-3.5" aria-hidden="true" />
                    Retry
                  </button>
                  <button
                    type="button"
                    onClick={onEditFailed}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-800 transition hover:bg-rose-100"
                  >
                    <PencilLine className="size-3.5" aria-hidden="true" />
                    Edit question
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        </div>
      </div>

      {hasUnseen && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-lavender-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lift transition hover:bg-lavender-700"
        >
          <ArrowDown className="size-3.5" aria-hidden="true" />
          Jump to latest
        </button>
      )}
    </div>
  )
}
