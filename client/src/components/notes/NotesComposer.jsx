import { Suspense, lazy, useCallback, useEffect, useId, useRef, useState } from 'react'
import { LoaderCircle, PencilLine, Save, X } from 'lucide-react'
import { useMaterials } from '../../context/materialsContext'
import {
  MAX_TEXT_CHARS,
  MIN_TEXT_CHARS,
  createPastedDocument,
  formatNumber,
  notesDocumentChanges,
} from '../../utils/documents'
import { notesToPlainText, plainTextToNotesContent, sanitizeNotesContent } from '../../utils/notes'
import InlineAlert from '../common/InlineAlert'
import { focusEditor } from './editorReady'

// Tiptap/ProseMirror is large; load it only when the notes editor is first shown.
const NotesEditor = lazy(() => import('./NotesEditor'))

function EditorLoading() {
  return (
    <div
      role="status"
      className="flex min-h-72 items-center justify-center gap-2 rounded-2xl border border-cream-300 bg-white text-sm text-ink-500 sm:min-h-96"
    >
      <LoaderCircle className="size-5 animate-spin text-lavender-500" aria-hidden="true" />
      Loading editor…
    </div>
  )
}

const KIND_LABELS = { studyGuide: 'study guide', flashcards: 'flashcards', quiz: 'practice quiz', chat: 'Ask My Notes conversation' }

function describeKinds(kinds) {
  const labels = kinds.map((kind) => KIND_LABELS[kind] ?? kind)
  if (labels.length <= 1) return labels[0] ?? ''
  return `${labels.slice(0, -1).join(', ')} and ${labels.at(-1)}`
}

function validate(text) {
  if (text.length === 0) return 'Add some notes before saving.'
  if (text.length < MIN_TEXT_CHARS) {
    return `Notes need at least ${MIN_TEXT_CHARS} characters of text to study (you have ${text.length}).`
  }
  if (text.length > MAX_TEXT_CHARS) {
    return `Notes can be at most ${formatNumber(MAX_TEXT_CHARS)} characters (you have ${formatNumber(text.length)}).`
  }
  return null
}

/**
 * One editing session: a new note, or one existing note. Remounted (via key) whenever the
 * target changes, so state never leaks between notes.
 */
function NotesForm({ document: doc, onSaved, onCancelEdit, onDirtyChange, editorRef }) {
  const { addDocument, updateDocument, getResultKinds, getNotesDraft, setNotesDraft } = useMaterials()
  const isEditing = Boolean(doc)

  const [initial] = useState(() => {
    if (doc) return { title: doc.fileName, json: doc.richContent ?? plainTextToNotesContent(doc.text) }
    return getNotesDraft() ?? { title: '', json: null }
  })
  const [title, setTitle] = useState(initial.title)
  const [json, setJson] = useState(initial.json)
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState(null)

  const titleId = useId()
  const notesLabelId = useId()
  const counterId = useId()
  const errorId = useId()

  const text = json ? notesToPlainText(json) : ''
  const isOverLimit = text.length > MAX_TEXT_CHARS
  const isDirty = isEditing ? touched : Boolean(text || title.trim())
  const existingKinds = isEditing ? getResultKinds(doc.id) : []

  useEffect(() => onDirtyChange?.(isDirty), [isDirty, onDirtyChange])

  // Keep the unsaved new-note draft so it survives tab and page switches.
  useEffect(() => {
    if (!isEditing) setNotesDraft(text || title.trim() ? { title, json } : null)
  }, [isEditing, title, json, text, setNotesDraft])

  // The editor loads lazily, so focus requests made before it was ready are applied here.
  const handleEditorReady = useCallback(
    (editor) => {
      editorRef.current = editor
      if (isEditing) focusEditor(editor, 'start')
    },
    [editorRef, isEditing],
  )

  const handleEditorChange = useCallback((nextJson) => {
    setJson(nextJson)
    setTouched(true)
    setError(null)
  }, [])

  function handleSubmit(event) {
    event.preventDefault()
    const problem = validate(text)
    if (problem) {
      setError(problem)
      focusEditor(editorRef.current)
      return
    }
    const richContent = sanitizeNotesContent(json)

    if (isEditing) {
      const { clearedKinds } = updateDocument(doc.id, notesDocumentChanges({ title, text, richContent }))
      onSaved({
        title: `Changes to ${title.trim() || 'Untitled notes'} were saved`,
        text: clearedKinds.length
          ? `The ${describeKinds(clearedKinds)} made from the previous version were cleared, because the notes changed. Generate them again to match your edits.`
          : 'Your updated notes are ready to study.',
        variant: clearedKinds.length ? 'warning' : 'success',
      })
      return
    }

    const newDoc = createPastedDocument({ title, text, richContent })
    addDocument(newDoc)
    setNotesDraft(null)
    onSaved({
      title: `${newDoc.fileName} is ready to study`,
      text: 'Your notes were added to your library and set as your active study material.',
      variant: 'success',
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-3xl border border-cream-200 bg-white p-5 shadow-soft sm:p-6"
    >
      {isEditing && (
        <div className="flex flex-col gap-3 rounded-2xl bg-lavender-50 px-4 py-3 ring-1 ring-lavender-200 sm:flex-row sm:items-center">
          <PencilLine className="hidden size-5 shrink-0 text-lavender-600 sm:block" aria-hidden="true" />
          <p className="flex-1 text-sm text-lavender-900">
            Editing <strong className="font-semibold">&ldquo;{doc.fileName}&rdquo;</strong>. Your changes are only saved
            when you choose Save changes.
          </p>
          <button
            type="button"
            onClick={onCancelEdit}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-sm font-semibold text-ink-700 ring-1 ring-cream-300 transition hover:bg-cream-100"
          >
            <X className="size-4" aria-hidden="true" />
            {touched ? 'Discard changes' : 'Close editor'}
          </button>
        </div>
      )}

      {isEditing && existingKinds.length > 0 && (
        <InlineAlert variant="warning">
          This note already has a generated {describeKinds(existingKinds)}. Saving changes to its text will clear{' '}
          {existingKinds.length > 1 ? 'them' : 'it'}, so you can regenerate from the updated notes. Title-only and
          formatting-only changes keep {existingKinds.length > 1 ? 'them' : 'it'}.
        </InlineAlert>
      )}

      <div>
        <label htmlFor={titleId} className="mb-1.5 block text-sm font-semibold text-ink-700">
          Title <span className="font-normal text-ink-400">(optional)</span>
        </label>
        <input
          id={titleId}
          type="text"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value)
            setTouched(true)
          }}
          placeholder="e.g. Biology — Week 5 lecture notes"
          maxLength={120}
          className="w-full rounded-xl border border-cream-300 bg-cream-50 px-3.5 py-2.5 text-base font-semibold text-ink-900 transition placeholder:font-normal placeholder:text-ink-400 focus:border-lavender-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-lavender-100"
        />
      </div>

      <div>
        <p id={notesLabelId} className="mb-1.5 text-sm font-semibold text-ink-700">
          Class notes
        </p>
        <Suspense fallback={<EditorLoading />}>
          <NotesEditor
            initialContent={initial.json}
            onChange={handleEditorChange}
            labelledBy={notesLabelId}
            describedBy={error ? `${counterId} ${errorId}` : counterId}
            invalid={Boolean(error) || isOverLimit}
            onReady={handleEditorReady}
          />
        </Suspense>
        <p id={counterId} className={`mt-1.5 text-xs ${isOverLimit ? 'font-semibold text-rose-600' : 'text-ink-400'}`}>
          {formatNumber(text.length)} / {formatNumber(MAX_TEXT_CHARS)} characters of text &middot; minimum{' '}
          {MIN_TEXT_CHARS}
        </p>
        {error && (
          <p id={errorId} role="alert" className="mt-1.5 text-sm font-medium text-rose-600">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-400">
          Notes and their formatting are saved in this browser. Only the plain text is sent to generate study tools.
        </p>
        <button
          type="submit"
          disabled={isEditing && !isDirty}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-lavender-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition duration-200 hover:bg-lavender-700 hover:shadow-lift disabled:cursor-not-allowed disabled:bg-lavender-300 disabled:shadow-none"
        >
          <Save className="size-4" aria-hidden="true" />
          {isEditing ? 'Save changes' : 'Save notes'}
        </button>
      </div>
    </form>
  )
}

/**
 * Paste Notes panel: create formatted notes or edit an existing note.
 * `editingDocument` switches to edit mode; the unsaved new-note draft is kept meanwhile.
 */
export default function NotesComposer({ editingDocument, onExitEdit, onDirtyChange, editorRef, pendingSwitch }) {
  const [message, setMessage] = useState(null)
  const [newNoteKey, setNewNoteKey] = useState(0)
  const fallbackRef = useRef(null)
  const ref = editorRef ?? fallbackRef

  // Starting to edit a note hides any earlier save message (adjusting state during render,
  // React's recommended alternative to an effect for this).
  const editingId = editingDocument?.id ?? null
  const [prevEditingId, setPrevEditingId] = useState(editingId)
  if (editingId !== prevEditingId) {
    setPrevEditingId(editingId)
    if (editingId) setMessage(null)
  }

  function handleSaved(nextMessage) {
    setMessage(nextMessage)
    if (editingDocument) onExitEdit()
    else setNewNoteKey((key) => key + 1) // fresh, empty editor for the next note
  }

  return (
    <div className="space-y-4">
      {pendingSwitch}
      <NotesForm
        key={editingDocument ? `edit-${editingDocument.id}` : `new-${newNoteKey}`}
        document={editingDocument}
        onSaved={handleSaved}
        onCancelEdit={onExitEdit}
        onDirtyChange={onDirtyChange}
        editorRef={ref}
      />
      {message && (
        <InlineAlert variant={message.variant} title={message.title} onDismiss={() => setMessage(null)}>
          {message.text}
        </InlineAlert>
      )}
    </div>
  )
}
