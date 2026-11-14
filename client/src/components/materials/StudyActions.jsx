import { ArrowRight, BookOpen, Layers, ListChecks, MessageCircleQuestionMark, Sparkles } from 'lucide-react'
import { routeHref } from '../../config/navigation'
import { FILE_TYPE_LABELS } from '../../utils/documents'

const ACTIONS = [
  { route: 'study-guide', label: 'Generate Study Guide', icon: BookOpen, tone: 'bg-lavender-100 text-lavender-600' },
  { route: 'flashcards', label: 'Create Flashcards', icon: Layers, tone: 'bg-rose-100 text-rose-500' },
  { route: 'quiz', label: 'Practice Quiz', icon: ListChecks, tone: 'bg-amber-100 text-amber-600' },
  { route: 'ask', label: 'Ask My Notes', icon: MessageCircleQuestionMark, tone: 'bg-sky-100 text-sky-600' },
]

/** Shown once a document is active. Actions are plain links; the selection lives in context. */
export default function StudyActions({ document: doc, headingRef }) {
  return (
    <section
      aria-labelledby="study-actions-title"
      className="rounded-3xl bg-gradient-to-br from-lavender-100 via-lavender-50 to-cream-100 p-5 ring-1 ring-lavender-200 sm:p-6"
    >
      <div className="mb-5 flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-lavender-600 shadow-soft">
          <Sparkles className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2
            id="study-actions-title"
            ref={headingRef}
            tabIndex={-1}
            className="text-lg font-bold tracking-tight text-ink-900 outline-none"
          >
            Study &ldquo;<span className="break-all">{doc.fileName}</span>&rdquo;
          </h2>
          <p className="text-sm text-ink-500">
            {FILE_TYPE_LABELS[doc.fileType] ?? doc.fileType} &middot; your active study material. Choose what to do next.
          </p>
        </div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {ACTIONS.map(({ route, label, icon: Icon, tone }) => (
          <li key={route}>
            <a
              href={routeHref(route)}
              className="group flex h-full items-center gap-3 rounded-2xl bg-white p-4 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone}`}>
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="flex-1 text-sm font-semibold text-ink-900">{label}</span>
              <ArrowRight
                className="size-4 text-lavender-500 transition group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
