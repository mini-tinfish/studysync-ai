import { CloudUpload, FolderOpen } from 'lucide-react'
import EmptyState from '../components/common/EmptyState'
import PageHeader from '../components/common/PageHeader'

export default function MaterialsPage({ materials }) {
  return (
    <>
      <PageHeader
        eyebrow="My Materials"
        title="Your study materials"
        description="Upload documents and manage everything you're studying from one place."
      />

      <section aria-labelledby="upload-title" className="mb-10">
        <h2 id="upload-title" className="sr-only">
          Upload a document
        </h2>
        {/* Placeholder: upload is not wired to the backend yet. */}
        <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-lavender-200 bg-white/70 px-6 py-12 text-center">
          <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-lavender-50 text-lavender-500">
            <CloudUpload className="size-7" aria-hidden="true" />
          </span>
          <p className="font-semibold text-ink-900">Drag and drop a PDF, or choose a file</p>
          <p className="mt-1 text-sm text-ink-500">PDF documents</p>
          <button
            type="button"
            disabled
            aria-describedby="upload-unavailable"
            className="mt-5 inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-lavender-200 px-4 py-2.5 text-sm font-semibold text-lavender-800 opacity-70"
          >
            Choose file
          </button>
          <p id="upload-unavailable" className="mt-3 text-xs text-ink-400">
            Uploading isn&rsquo;t available yet &mdash; it will be enabled once the server is connected.
          </p>
        </div>
      </section>

      <section aria-labelledby="library-title">
        <h2 id="library-title" className="mb-4 text-lg font-bold tracking-tight text-ink-900">
          Library
        </h2>
        {materials.length === 0 && (
          <EmptyState
            icon={FolderOpen}
            title="Your library is empty"
            description="Uploaded documents will be listed here."
          />
        )}
      </section>
    </>
  )
}
