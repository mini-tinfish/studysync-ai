import { useId } from 'react'
import { SendHorizontal, Square } from 'lucide-react'
import { MAX_QUESTION_CHARS } from '../../utils/ask'

/**
 * Message box. Enter sends, Shift+Enter adds a line (IME composition is respected).
 * While an answer is loading, the Send button becomes Cancel.
 */
export default function ChatComposer({ value, onChange, onSend, onCancel, isLoading, disabled, textareaRef, placeholder }) {
  const id = useId()
  const hintId = useId()
  const trimmed = value.trim()
  const tooLong = trimmed.length > MAX_QUESTION_CHARS
  const canSend = !disabled && !isLoading && trimmed.length > 0 && !tooLong

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      if (canSend) onSend()
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (canSend) onSend()
      }}
      className="border-t border-cream-200 bg-cream-50/70 p-3 sm:p-4"
    >
      <label htmlFor={id} className="sr-only">
        Ask a question about your notes
      </label>
      <div
        className={`flex items-end gap-2 rounded-2xl border bg-white p-2 transition focus-within:ring-4 ${
          tooLong ? 'border-rose-300 focus-within:ring-rose-100' : 'border-cream-300 focus-within:border-lavender-400 focus-within:ring-lavender-100'
        }`}
      >
        <textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          maxLength={MAX_QUESTION_CHARS + 200}
          disabled={disabled}
          placeholder={placeholder}
          aria-describedby={hintId}
          aria-invalid={tooLong}
          className="max-h-40 min-h-12 flex-1 resize-none bg-transparent px-2 py-1.5 text-[15px] leading-relaxed text-ink-900 outline-none placeholder:text-ink-400 disabled:cursor-not-allowed"
        />
        {/* Distinct keys: if React reused one <button> for both, the click on Cancel would
            finish on a type="submit" button and immediately resend the question. */}
        {isLoading ? (
          <button
            key="cancel"
            type="button"
            onClick={(event) => {
              event.preventDefault()
              onCancel()
            }}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-white px-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-50"
          >
            <Square className="size-3.5 fill-current" aria-hidden="true" />
            Cancel
          </button>
        ) : (
          <button
            key="send"
            type="submit"
            disabled={!canSend}
            aria-label="Send question"
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-lavender-600 text-white shadow-soft transition hover:bg-lavender-700 disabled:cursor-not-allowed disabled:bg-lavender-200 disabled:shadow-none"
          >
            <SendHorizontal className="size-[18px]" aria-hidden="true" />
          </button>
        )}
      </div>
      <p id={hintId} className="mt-1.5 flex justify-between gap-3 px-1 text-xs text-ink-400">
        <span className="hidden sm:inline">Enter to send · Shift+Enter for a new line</span>
        <span className={`ml-auto tabular-nums ${tooLong ? 'font-semibold text-rose-600' : ''}`}>
          {trimmed.length.toLocaleString()} / {MAX_QUESTION_CHARS.toLocaleString()}
        </span>
      </p>
    </form>
  )
}
