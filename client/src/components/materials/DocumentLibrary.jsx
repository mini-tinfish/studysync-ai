import { useState } from 'react'
import { FolderOpen, HardDrive, Trash2 } from 'lucide-react'
import EmptyState from '../common/EmptyState'
import DocumentCard from './DocumentCard'

const STORAGE_NOTES = {
  saved: 'Saved only in this browser on this device.',
  error: 'Recent changes couldn’t be saved in this browser.',
  unavailable: 'Not saved: browser storage is turned off, so materials are lost on refresh.',
}

export default function DocumentLibrary({
  documents,
  activeId,
  editingId,
  onSelect,
  onRemove,
  onEdit,
  onClearAll,
  storageStatus,
}) {
  const [confirmingClear, setConfirmingClear] = useState(false)

  return (
    <section aria-labelledby="library-title">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div>
          <h2 id="library-title" className="text-lg font-bold tracking-tight text-ink-900">
            Library
          </h2>
          {STORAGE_NOTES[storageStatus] && (
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-400">
              <HardDrive className="size-3.5" aria-hidden="true" />
              {STORAGE_NOTES[storageStatus]}
            </p>
          )}
        </div>
        {documents.length > 0 && (
          <div className="flex items-center gap-3">
            <p className="text-sm text-ink-400">
              {documents.length} {documents.length === 1 ? 'document' : 'documents'}
            </p>
            {confirmingClear ? (
              <div role="group" aria-label="Confirm removing all materials" className="flex items-center gap-2">
                <span className="text-sm text-ink-700">Remove all materials and their study tools?</span>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmingClear(false)
                    onClearAll()
                  }}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700"
                >
                  Yes, remove all
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
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-ink-500 transition hover:bg-rose-50 hover:text-rose-700"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {documents.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Your library is empty"
          description="Upload a file or paste your notes above. Everything you add will appear here, ready to study."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {documents.map((doc) => (
            <li key={doc.id}>
              <DocumentCard
                document={doc}
                isActive={doc.id === activeId}
                isEditing={doc.id === editingId}
                onSelect={onSelect}
                onRemove={onRemove}
                onEdit={onEdit}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
