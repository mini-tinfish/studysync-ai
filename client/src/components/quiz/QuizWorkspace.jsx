import { useCallback, useState } from 'react'
import { Info, ListChecks, Sparkles } from 'lucide-react'
import { generateQuiz } from '../../api/client'
import { useMaterials } from '../../context/materialsContext'
import { useGeneration } from '../../hooks/useGeneration'
import { formatDate } from '../../utils/documents'
import { DEFAULT_DIFFICULTY, DEFAULT_QUESTIONS, clampQuestionCount, difficultyLabel, normalizeQuiz } from '../../utils/quiz'
import DemoButton from '../generation/DemoButton'
import GeneratingState from '../generation/GeneratingState'
import GenerationError from '../generation/GenerationError'
import SourceBadge, { SourceNotice } from '../generation/SourceBadge'
import QuizSession from './QuizSession'
import QuizSettings from './QuizSettings'

/**
 * Practice quiz for one document. Rendered with key={document.id}, so nothing carries over
 * to another document. The quiz and its progress live in the per-document results cache:
 * editing the document's text clears them, and each new quiz gets a new setId (fresh session).
 */
export default function QuizWorkspace({ document: doc, onOpenDemo }) {
  const { saveProgress } = useMaterials()
  const { result, status, error, run, cancel } = useGeneration({
    documentId: doc.id,
    kind: 'quiz',
    sourceText: doc.text,
  })
  const [count, setCount] = useState(() => result?.data.requestedCount ?? DEFAULT_QUESTIONS)
  const [difficulty, setDifficulty] = useState(() => result?.data.difficulty ?? DEFAULT_DIFFICULTY)

  const setId = result?.setId
  const handleProgress = useCallback(
    (progress) => setId && saveProgress(doc.id, 'quiz', setId, progress),
    [doc.id, setId, saveProgress],
  )

  function generate() {
    const requestedCount = clampQuestionCount(count)
    run(
      (signal) => generateQuiz({ text: doc.text, count: requestedCount, difficulty }, { signal }),
      (raw) => normalizeQuiz(raw, { requestedCount, difficulty }),
    )
  }

  const settings = (
    <QuizSettings count={count} onCountChange={setCount} difficulty={difficulty} onDifficultyChange={setDifficulty} />
  )

  if (status === 'loading') {
    return (
      <GeneratingState
        title={`Writing ${clampQuestionCount(count)} ${difficultyLabel(difficulty).toLowerCase()} questions…`}
        description={`Building a practice quiz from “${doc.fileName}”. This can take up to a minute.`}
        onCancel={cancel}
      />
    )
  }

  const errorPanel = status === 'error' && error && (
    <GenerationError error={error} onRetry={generate} onOpenDemo={onOpenDemo} />
  )

  if (result) {
    const { questions, requestedCount } = result.data
    return (
      <div className="space-y-6">
        {errorPanel}

        <div className="flex flex-col gap-5 rounded-2xl border border-cream-200 bg-white p-5 shadow-soft">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <SourceBadge origin={result.origin} />
              <span className="rounded-full bg-cream-100 px-2.5 py-1 text-xs font-semibold text-ink-700">
                {difficultyLabel(result.data.difficulty)}
              </span>
            </div>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-ink-900">
              {questions.length}-question practice quiz
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              From &ldquo;{doc.fileName}&rdquo; &middot; created{' '}
              <time dateTime={result.generatedAt}>{formatDate(result.generatedAt)}</time>
            </p>
            {questions.length < requestedCount && (
              <p className="mt-2 flex items-start gap-1.5 text-xs text-ink-500">
                <Info className="mt-0.5 size-3.5 shrink-0 text-lavender-500" aria-hidden="true" />
                You asked for {requestedCount}; {questions.length} usable questions were created.
              </p>
            )}
          </div>
          <details className="group rounded-xl bg-cream-50 ring-1 ring-cream-200">
            <summary className="cursor-pointer list-none rounded-xl px-4 py-2.5 text-sm font-semibold text-lavender-700 transition hover:bg-lavender-50">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="size-4" aria-hidden="true" />
                New quiz settings
              </span>
            </summary>
            <div className="space-y-4 px-4 pb-4 pt-2">
              {settings}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={generate}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-lavender-700 ring-1 ring-lavender-200 transition hover:bg-lavender-50"
                >
                  <Sparkles className="size-4" aria-hidden="true" />
                  Generate new quiz
                </button>
              </div>
              <p className="text-center text-xs text-ink-400">A new quiz replaces this one and resets your progress.</p>
            </div>
          </details>
        </div>

        <SourceNotice origin={result.origin} />

        <QuizSession
          key={result.setId}
          questions={questions}
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
        aria-labelledby="generate-quiz-title"
        className="flex flex-col items-center rounded-3xl border border-cream-200 bg-white px-6 py-12 text-center shadow-soft"
      >
        <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-amber-100 text-amber-600">
          <ListChecks className="size-7" aria-hidden="true" />
        </span>
        <h2 id="generate-quiz-title" className="text-lg font-bold tracking-tight text-ink-900">
          Test yourself
        </h2>
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-ink-500">
          Generate multiple-choice questions from &ldquo;{doc.fileName}&rdquo;. You&rsquo;ll see feedback and an
          explanation after each answer.
        </p>
        <div className="mt-6 w-full">{settings}</div>
        <div className="mt-7 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={generate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-lavender-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition duration-200 hover:bg-lavender-700 hover:shadow-lift"
          >
            <Sparkles className="size-4" aria-hidden="true" />
            Generate Quiz
          </button>
          <DemoButton onClick={onOpenDemo} />
        </div>
      </section>
    </div>
  )
}
