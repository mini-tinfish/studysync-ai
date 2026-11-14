import { CircleAlert, CircleCheck, Eye, FileText, NotebookPen, PencilLine, Trash2 } from 'lucide-react'
import { preloadNotesEditor } from '../notes/editorLoader'
import { FILE_TYPE_LABELS, formatDate, formatNumber, isReadyToStudy } from '../../utils/documents'

export default function DocumentCard({ document: doc, isActive, isEditing, onSelect, onRemove, onEdit, onPreview }) {
  const ready = isReadyToStudy(doc)
  const Icon = doc.source === 'paste' ? NotebookPen : FileText
  const titleId = `doc-title-${doc.id}`

  return (
    <article
      aria-labelledby={titleId}
      className={`flex h-full flex-col rounded-2xl border bg-white p-5 shadow-soft transition duration-200 hover:shadow-lift ${
        isActive ? 'border-lavender-400 ring-4 ring-lavender-100' : 'border-cream-200 hover:border-lavender-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-lavender-50 text-lavender-500">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 id={titleId} className="truncate font-semibold text-ink-900" title={doc.fileName}>
            {doc.fileName}
          </h3>
          <p className="mt-0.5 text-xs text-ink-400">
            {doc.updatedAt ? (
              <>
                Updated <time dateTime={doc.updatedAt}>{formatDate(doc.updatedAt)}</time>
              </>
            ) : (
              <time dateTime={doc.uploadedAt}>{formatDate(doc.uploadedAt)}</time>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(doc.id)}
          aria-label={`Remove ${doc.fileName}`}
          className="-mr-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-lg text-ink-400 transition hover:bg-rose-50 hover:text-rose-600"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>

      <dl className="mt-4 flex flex-wrap gap-2 text-xs">
        <div className="rounded-full bg-cream-100 px-2.5 py-1 text-ink-700">
          <dt className="sr-only">File type</dt>
          <dd>{FILE_TYPE_LABELS[doc.fileType] ?? doc.fileType}</dd>
        </div>
        {typeof doc.wordCount === 'number' && (
          <div className="rounded-full bg-cream-100 px-2.5 py-1 text-ink-700">
            <dt className="sr-only">Word count</dt>
            <dd>{formatNumber(doc.wordCount)} words</dd>
          </div>
        )}
        {typeof doc.pageCount === 'number' && (
          <div className="rounded-full bg-cream-100 px-2.5 py-1 text-ink-700">
            <dt className="sr-only">Pages</dt>
            <dd>
              {doc.pageCount} {doc.pageCount === 1 ? 'page' : 'pages'}
            </dd>
          </div>
        )}
        <div
          className={`rounded-full px-2.5 py-1 font-medium ${
            ready ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          <dt className="sr-only">Status</dt>
          <dd className="inline-flex items-center gap-1">
            {ready ? (
              <CircleCheck className="size-3.5" aria-hidden="true" />
            ) : (
              <CircleAlert className="size-3.5" aria-hidden="true" />
            )}
            {ready ? 'Ready to study' : 'Too short to study'}
          </dd>
        </div>
      </dl>

      {doc.truncated && <p className="mt-3 text-xs text-amber-700">Trimmed to the first 100,000 characters.</p>}

      <div className="mt-auto flex flex-col gap-2 pt-5">
        <div className="flex gap-2">
          {onPreview && (
            <button
              type="button"
              onClick={() => onPreview(doc.id)}
              aria-label={`Preview ${doc.fileName}`}
              className="inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-ink-700 ring-1 ring-cream-300 transition duration-200 hover:bg-cream-100"
            >
              <Eye className="size-4" aria-hidden="true" />
              Preview
            </button>
          )}
          {doc.source === 'paste' && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(doc.id)}
              onPointerEnter={preloadNotesEditor}
              onFocus={preloadNotesEditor}
              aria-label={`Edit notes: ${doc.fileName}`}
              aria-pressed={isEditing}
              title="Edit notes"
              className={`inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition duration-200 ${
                isEditing
                  ? 'bg-lavender-100 text-lavender-800 ring-1 ring-lavender-300'
                  : 'bg-white text-ink-700 ring-1 ring-cream-300 hover:bg-cream-100'
              }`}
            >
              <PencilLine className="size-4" aria-hidden="true" />
              {isEditing ? 'Editing' : 'Edit'}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => onSelect(doc.id)}
          disabled={!ready}
          aria-pressed={isActive}
          className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
            isActive
              ? 'bg-lavender-600 text-white shadow-soft'
              : 'bg-lavender-50 text-lavender-700 ring-1 ring-lavender-200 enabled:hover:bg-lavender-100'
          }`}
        >
          {isActive ? 'Active study material' : 'Study this'}
        </button>
      </div>
    </article>
  )
}
