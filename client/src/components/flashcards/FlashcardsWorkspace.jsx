import { useCallback, useState } from 'react'
import { Info, Layers, Sparkles } from 'lucide-react'
import { generateFlashcards } from '../../api/client'
import { useMaterials } from '../../context/materialsContext'
import { useGeneration } from '../../hooks/useGeneration'
import { formatDate } from '../../utils/documents'
import { DEFAULT_CARDS, MAX_CARDS, MIN_CARDS, clampCount, normalizeFlashcards } from '../../utils/flashcards'
import DemoButton from '../generation/DemoButton'
import GeneratingState from '../generation/GeneratingState'
import GenerationError from '../generation/GenerationError'
import SourceBadge, { SourceNotice } from '../generation/SourceBadge'
import CountPicker from '../common/CountPicker'
import FlashcardSession from './FlashcardSession'

/**
 * Flashcards for one document. Rendered with key={document.id}, so nothing carries over
 * to another document; the card set and its review progress live in the per-document
 * results cache, and each new set gets a new setId (and a fresh session).
 */
export default function FlashcardsWorkspace({ document: doc, onOpenDemo }) {
  const { saveProgress } = useMaterials()
  const { result, status, error, run, cancel } = useGeneration({ documentId: doc.id, kind: 'flashcards', sourceText: doc.text })
  const [count, setCount] = useState(() => result?.data.requestedCount ?? DEFAULT_CARDS)

  const setId = result?.setId
  const handleProgress = useCallback(
    (progress) => setId && saveProgress(doc.id, 'flashcards', setId, progress),
    [doc.id, setId, saveProgress],
  )

  function generate() {
    const requested = clampCount(count)
    run(
      (signal) => generateFlashcards({ text: doc.text, count: requested }, { signal }),
      (raw) => normalizeFlashcards(raw, requested),
    )
  }

  if (status === 'loading') {
    return (
      <GeneratingState
        title={`Creating ${clampCount(count)} flashcards…`}
        description={`Pulling key questions and answers from “${doc.fileName}”. This can take up to a minute.`}
        onCancel={cancel}
      />
    )
  }

  const errorPanel = status === 'error' && error && (
    <GenerationError error={error} onRetry={generate} onOpenDemo={onOpenDemo} />
  )

  if (result) {
    const { cards, requestedCount } = result.data
    return (
      <div className="space-y-6">
        {errorPanel}

        <div className="flex flex-col gap-5 rounded-2xl border border-cream-200 bg-white p-5 shadow-soft lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <SourceBadge origin={result.origin} />
            <h2 className="mt-2 text-xl font-bold tracking-tight text-ink-900">
              {cards.length} {cards.length === 1 ? 'flashcard' : 'flashcards'}
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              From &ldquo;{doc.fileName}&rdquo; &middot; created{' '}
              <time dateTime={result.generatedAt}>{formatDate(result.generatedAt)}</time>
            </p>
            {cards.length < requestedCount && (
              <p className="mt-2 flex items-start gap-1.5 text-xs text-ink-500">
                <Info className="mt-0.5 size-3.5 shrink-0 text-lavender-500" aria-hidden="true" />
                You asked for {requestedCount}; {cards.length} could be made from this material.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <CountPicker label="Number of cards" value={count} onChange={setCount} min={MIN_CARDS} max={MAX_CARDS} presets={[5, 10, 20, 30]} />
            <button
              type="button"
              onClick={generate}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-lavender-700 ring-1 ring-lavender-200 transition hover:bg-lavender-50"
            >
              <Sparkles className="size-4" aria-hidden="true" />
              Generate new set
            </button>
          </div>
        </div>

        <SourceNotice origin={result.origin} />

        <FlashcardSession
          key={result.setId}
          cards={cards}
          initialProgress={result.progress}
          onProgressChange={handleProgress}
          onGenerateNew={generate}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {errorPanel}
      <section
        aria-labelledby="generate-cards-title"
        className="flex flex-col items-center rounded-3xl border border-cream-200 bg-white px-6 py-12 text-center shadow-soft"
      >
        <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-rose-100 text-rose-500">
          <Layers className="size-7" aria-hidden="true" />
        </span>
        <h2 id="generate-cards-title" className="text-lg font-bold tracking-tight text-ink-900">
          Create flashcards
        </h2>
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-ink-500">
          Turn &ldquo;{doc.fileName}&rdquo; into question-and-answer cards you can flip through and mark as you go.
        </p>
        <div className="mt-6 flex w-full justify-center">
          <CountPicker label="Number of cards" value={count} onChange={setCount} min={MIN_CARDS} max={MAX_CARDS} presets={[5, 10, 20, 30]} />
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={generate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-lavender-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition duration-200 hover:bg-lavender-700 hover:shadow-lift"
          >
            <Sparkles className="size-4" aria-hidden="true" />
            Generate Flashcards
          </button>
          <DemoButton onClick={onOpenDemo} />
        </div>
      </section>
    </div>
  )
}
