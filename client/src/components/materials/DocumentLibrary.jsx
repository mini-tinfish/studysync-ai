import { FolderOpen } from 'lucide-react'
import EmptyState from '../common/EmptyState'
import DocumentCard from './DocumentCard'

export default function DocumentLibrary({ documents, activeId, onSelect, onRemove }) {
  return (
    <section aria-labelledby="library-title">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 id="library-title" className="text-lg font-bold tracking-tight text-ink-900">
          Library
        </h2>
        {documents.length > 0 && (
          <p className="text-sm text-ink-400">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'}
          </p>
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
              <DocumentCard document={doc} isActive={doc.id === activeId} onSelect={onSelect} onRemove={onRemove} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
