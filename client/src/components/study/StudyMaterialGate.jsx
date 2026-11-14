import { FileText, FolderOpen } from 'lucide-react'
import { routeHref } from '../../config/navigation'
import { useMaterials } from '../../context/materialsContext'
import { FILE_TYPE_LABELS, formatNumber } from '../../utils/documents'
import Button from '../common/Button'
import EmptyState from '../common/EmptyState'
import FeatureEmptyState from '../common/FeatureEmptyState'

/**
 * Wraps each study tool page. Renders the right empty state until a document is
 * active, then shows which document is being studied above the page content.
 * `children` receives the active document.
 */
export default function StudyMaterialGate({ icon, featureName, emptyExtra, children }) {
  const { documents, activeDocument } = useMaterials()

  if (documents.length === 0) {
    return (
      <div className="space-y-4">
        <FeatureEmptyState
          icon={icon}
          title="No study materials yet"
          description={`Upload a document or paste your notes first, then come back here for ${featureName}.`}
        />
        {emptyExtra}
      </div>
    )
  }

  if (!activeDocument) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={FolderOpen}
          title="Choose a document to study"
          description={`Pick one of your materials on My Materials to use it for ${featureName}.`}
          action={<Button href={routeHref('materials')}>Choose a document</Button>}
        />
        {emptyExtra}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-cream-200 bg-white p-4 shadow-soft sm:flex-row sm:items-center">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-lavender-50 text-lavender-500">
          <FileText className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-lavender-600">Studying</p>
          <p className="truncate font-semibold text-ink-900">{activeDocument.fileName}</p>
          <p className="text-xs text-ink-400">
            {FILE_TYPE_LABELS[activeDocument.fileType] ?? activeDocument.fileType}
            {typeof activeDocument.wordCount === 'number' && ` · ${formatNumber(activeDocument.wordCount)} words`}
          </p>
        </div>
        <Button href={routeHref('materials')} variant="secondary" className="shrink-0">
          Change document
        </Button>
      </div>
      {children(activeDocument)}
    </div>
  )
}
