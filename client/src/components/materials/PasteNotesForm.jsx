import { useId, useState } from 'react'
import { ClipboardPaste } from 'lucide-react'
import { MAX_TEXT_CHARS, MIN_TEXT_CHARS, createPastedDocument, formatNumber } from '../../utils/documents'
import InlineAlert from '../common/InlineAlert'

/** Manual notes entry. Works fully offline — nothing is sent to the backend here. */
export default function PasteNotesForm({ onSaved }) {
  const titleId = useId()
  const notesId = useId()
  const hintId = useId()
  const errorId = useId()
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState(null)
  const [savedName, setSavedName] = useState(null)

  const charCount = text.trim().length
  const isOverLimit = charCount > MAX_TEXT_CHARS

  function handleSubmit(event) {
    event.preventDefault()
    if (charCount < MIN_TEXT_CHARS) {
      setError(`Please enter at least ${MIN_TEXT_CHARS} characters of notes (you have ${charCount}).`)
      return
    }
    if (isOverLimit) {
      setError(`Notes can be at most ${formatNumber(MAX_TEXT_CHARS)} characters.`)
      return
    }
    const doc = createPastedDocument({ title, text })
    onSaved(doc)
    setSavedName(doc.fileName)
    setError(null)
    setTitle('')
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-3xl border border-cream-200 bg-white p-5 shadow-soft sm:p-6">
      <div>
        <label htmlFor={titleId} className="mb-1.5 block text-sm font-semibold text-ink-700">
          Title <span className="font-normal text-ink-400">(optional)</span>
        </label>
        <input
          id={titleId}
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Biology — Week 5 lecture notes"
          maxLength={120}
          className="w-full rounded-xl border border-cream-300 bg-cream-50 px-3.5 py-2.5 text-sm text-ink-900 transition placeholder:text-ink-400 focus:border-lavender-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-lavender-100"
        />
      </div>

      <div>
        <label htmlFor={notesId} className="mb-1.5 block text-sm font-semibold text-ink-700">
          Class notes
        </label>
        <textarea
          id={notesId}
          value={text}
          onChange={(event) => {
            setText(event.target.value)
            if (error) setError(null)
            if (savedName) setSavedName(null)
          }}
          rows={9}
          placeholder="Paste or type your notes here…"
          aria-describedby={error ? `${hintId} ${errorId}` : hintId}
          aria-invalid={Boolean(error)}
          className={`w-full resize-y rounded-xl border bg-cream-50 px-3.5 py-3 text-sm leading-relaxed text-ink-900 transition placeholder:text-ink-400 focus:bg-white focus:outline-none focus:ring-4 ${
            error ? 'border-rose-300 focus:ring-rose-100' : 'border-cream-300 focus:border-lavender-400 focus:ring-lavender-100'
          }`}
        />
        <p id={hintId} className={`mt-1.5 text-xs ${isOverLimit ? 'text-rose-600' : 'text-ink-400'}`}>
          {formatNumber(charCount)} / {formatNumber(MAX_TEXT_CHARS)} characters &middot; minimum {MIN_TEXT_CHARS}
        </p>
        {error && (
          <p id={errorId} className="mt-1.5 text-sm font-medium text-rose-600">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-400">Pasted notes are saved in this browser tab only.</p>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-lavender-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition duration-200 hover:bg-lavender-700 hover:shadow-lift"
        >
          <ClipboardPaste className="size-4" aria-hidden="true" />
          Save notes
        </button>
      </div>

      {savedName && (
        <InlineAlert variant="success" title={`${savedName} is ready to study`} onDismiss={() => setSavedName(null)}>
          Your notes were added to your library and set as your active study material.
        </InlineAlert>
      )}
    </form>
  )
}
