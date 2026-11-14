import { useRef } from 'react'
import { BookOpen, RefreshCw, Sparkles } from 'lucide-react'
import { generateStudyGuide } from '../../api/client'
import { useGeneration } from '../../hooks/useGeneration'
import { formatDate } from '../../utils/documents'
import { normalizeStudyGuide, titleHintFor } from '../../utils/studyGuide'
import DemoButton from '../generation/DemoButton'
import GeneratingState from '../generation/GeneratingState'
import GenerationError from '../generation/GenerationError'
import SourceBadge, { SourceNotice } from '../generation/SourceBadge'
import StudyGuideView from './StudyGuideView'

/**
 * Study guide for one document. The page renders this with key={document.id}, so all
 * local state (loading, errors) resets when a different document is selected, and the
 * generated guide is read from the per-document results cache.
 */
export default function StudyGuideWorkspace({ document: doc, onOpenDemo }) {
  const { result, status, error, run, cancel } = useGeneration({ documentId: doc.id, kind: 'studyGuide', sourceText: doc.text })
  const titleRef = useRef(null)

  async function generate() {
    const ok = await run(
      (signal) => generateStudyGuide({ text: doc.text, title: titleHintFor(doc) }, { signal }),
      normalizeStudyGuide,
    )
    // Move focus to the new guide's title once it has rendered.
    if (ok) requestAnimationFrame(() => titleRef.current?.focus())
  }

  if (status === 'loading') {
    return (
      <GeneratingState
        title="Generating your study guide…"
        description={`Reading “${doc.fileName}” and organizing the key ideas. This can take up to a minute.`}
        onCancel={cancel}
      />
    )
  }

  const errorPanel = status === 'error' && error && (
    <GenerationError error={error} onRetry={generate} onOpenDemo={onOpenDemo} />
  )

  if (result) {
    return (
      <div className="space-y-5">
        {errorPanel}
        <SourceNotice origin={result.origin} />
        <StudyGuideView
          guide={result.data}
          titleRef={titleRef}
          badge={<SourceBadge origin={result.origin} />}
          meta={
            <>
              From &ldquo;{doc.fileName}&rdquo; &middot; created{' '}
              <time dateTime={result.generatedAt}>{formatDate(result.generatedAt)}</time>
            </>
          }
          actions={
            <button
              type="button"
              onClick={generate}
              className="inline-flex items-center gap-2 rounded-xl bg-lavender-600 px-3.5 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-lavender-700"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Regenerate
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {errorPanel}
      {status !== 'error' && (
        <section
          aria-labelledby="generate-guide-title"
          className="flex flex-col items-center rounded-3xl border border-cream-200 bg-white px-6 py-12 text-center shadow-soft"
        >
          <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-lavender-50 text-lavender-500">
            <BookOpen className="size-7" aria-hidden="true" />
          </span>
          <h2 id="generate-guide-title" className="text-lg font-bold tracking-tight text-ink-900">
            Ready to build your study guide
          </h2>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-ink-500">
            StudySync will summarize &ldquo;{doc.fileName}&rdquo; into an overview, key concepts, takeaways, key terms,
            and review questions.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={generate}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-lavender-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition duration-200 hover:bg-lavender-700 hover:shadow-lift"
            >
              <Sparkles className="size-4" aria-hidden="true" />
              Generate Study Guide
            </button>
            <DemoButton onClick={onOpenDemo} />
          </div>
        </section>
      )}
    </div>
  )
}
