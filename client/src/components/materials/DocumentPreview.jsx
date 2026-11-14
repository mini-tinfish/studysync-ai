import { Suspense, lazy, useEffect, useId, useRef, useState } from 'react'
import { FileText, Info, NotebookPen, PencilLine, X } from 'lucide-react'
import { FILE_TYPE_LABELS, formatDate, formatNumber } from '../../utils/documents'
import { plainTextToNotesContent } from '../../utils/notes'
import { loadMarkdown } from '../ask/markdownLoader'
import ErrorBoundary from '../common/ErrorBoundary'
import NotesPreview from '../notes/NotesPreview'

const MarkdownAnswer = lazy(loadMarkdown)

function PlainText({ text }) {
  return <div className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-ink-900">{text}</div>
}

function Notice({ children }) {
  return (
    <p className="flex items-start gap-2 rounded-xl bg-lavender-50 px-3.5 py-2.5 text-sm leading-relaxed text-lavender-900 ring-1 ring-lavender-100">
      <Info className="mt-0.5 size-4 shrink-0 text-lavender-600" aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}

function MarkdownPreview({ text }) {
  const [formatted, setFormatted] = useState(true)
  return (
    <div className="space-y-4">
      <div role="group" aria-label="Markdown view" className="inline-flex gap-1 rounded-xl bg-cream-100 p-1 ring-1 ring-cream-200">
        {[
          [true, 'Formatted'],
          [false, 'Plain text'],
        ].map(([value, label]) => (
          <button
            key={label}
            type="button"
            aria-pressed={formatted === value}
            onClick={() => setFormatted(value)}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              formatted === value ? 'bg-white text-lavender-700 shadow-soft' : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {formatted ? (
        <ErrorBoundary fallback={() => <PlainText text={text} />}>
          <Suspense fallback={<PlainText text={text} />}>
            <MarkdownAnswer text={text} />
          </Suspense>
        </ErrorBoundary>
      ) : (
        <PlainText text={text} />
      )}
    </div>
  )
}

function PreviewBody({ doc }) {
  if (doc.source === 'paste') {
    return <NotesPreview content={doc.richContent ?? plainTextToNotesContent(doc.text)} />
  }
  if (doc.fileType === 'pdf') {
    return (
      <div className="space-y-4">
        <Notice>
          This is the <strong className="font-semibold">text StudySync extracted</strong> from the PDF, not the original
          page layout. Images, columns, and formatting from the PDF aren&rsquo;t shown.
        </Notice>
        <PlainText text={doc.text} />
      </div>
    )
  }
  if (doc.fileType === 'md') {
    return (
      <div className="space-y-4">
        <Notice>Markdown is shown with the same safety rules as AI answers: no HTML, scripts, or remote images.</Notice>
        <MarkdownPreview text={doc.text} />
      </div>
    )
  }
  return <PlainText text={doc.text} />
}

/**
 * Read-only preview of a saved document, in a modal dialog (native <dialog>: focus is kept
 * inside, Escape closes, focus returns to the button that opened it). Uses only the saved
 * document — no backend requests. Uploaded content is untrusted and only ever rendered as text
 * (or safe Markdown); notes keep their sanitized formatting.
 */
export default function DocumentPreview({ document: doc, onClose, onEdit }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const Icon = doc.source === 'paste' ? NotebookPen : FileText

  // Open as a modal once mounted. No cleanup on purpose: calling close() there would fire
  // onClose (and under React StrictMode's mount→unmount→mount check, instantly dismiss the
  // preview); removing the element from the page already dismisses an open dialog.
  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  const meta = [
    FILE_TYPE_LABELS[doc.fileType] ?? doc.fileType,
    typeof doc.pageCount === 'number' && `${doc.pageCount} ${doc.pageCount === 1 ? 'page' : 'pages'}`,
    typeof doc.wordCount === 'number' && `${formatNumber(doc.wordCount)} words`,
    `${formatNumber(doc.charCount ?? doc.text.length)} characters`,
    doc.updatedAt ? `Updated ${formatDate(doc.updatedAt)}` : `Added ${formatDate(doc.uploadedAt)}`,
  ].filter(Boolean)

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      // Clicking the backdrop (the dialog element itself, outside the panel) closes it.
      onClick={(event) => event.target === dialogRef.current && dialogRef.current.close()}
      className="m-auto max-h-[min(88vh,900px)] w-[min(100%-1.5rem,48rem)] overflow-hidden rounded-3xl bg-white p-0 text-ink-900 shadow-lift backdrop:bg-black/50 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex max-h-[min(88vh,900px)] flex-col">
        <header className="flex items-start gap-3 border-b border-cream-200 px-5 py-4 sm:px-6">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-lavender-50 text-lavender-500">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-lavender-600">Preview</p>
            <h2 id={titleId} className="break-words text-lg font-bold tracking-tight text-ink-900">
              {doc.fileName}
            </h2>
            <p className="mt-0.5 text-xs text-ink-500">{meta.join(' · ')}</p>
            {doc.truncated && (
              <p className="mt-1 text-xs font-medium text-amber-700">
                Only the first 100,000 characters were kept when this file was uploaded.
              </p>
            )}
          </div>
          <button
            type="button"
            autoFocus
            onClick={() => dialogRef.current?.close()}
            aria-label="Close preview"
            className="-mr-1 grid size-9 shrink-0 place-items-center rounded-lg text-ink-500 transition hover:bg-cream-100 hover:text-ink-900"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div
          tabIndex={0}
          aria-label="Document content"
          className="min-h-0 flex-1 overflow-y-auto px-5 py-5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lavender-400 sm:px-6"
        >
          <PreviewBody doc={doc} />
        </div>

        <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-cream-200 px-5 py-3 sm:px-6">
          {doc.source === 'paste' && onEdit && (
            <button
              type="button"
              onClick={() => {
                dialogRef.current?.close()
                onEdit(doc.id)
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-lavender-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-lavender-700"
            >
              <PencilLine className="size-4" aria-hidden="true" />
              Edit notes
            </button>
          )}
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-ink-700 ring-1 ring-cream-300 transition hover:bg-cream-100"
          >
            Close
          </button>
        </footer>
      </div>
    </dialog>
  )
}
