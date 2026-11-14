import { useState } from 'react'
import { BookMarked, ChevronsDownUp, ChevronsUpDown, CircleHelp, Lightbulb, ListChecks, ScrollText } from 'lucide-react'
import CollapsibleSection from './CollapsibleSection'

const SECTION_IDS = ['overview', 'concepts', 'takeaways', 'terms', 'questions']

const EmptyNote = ({ children }) => <p className="text-sm italic text-ink-400">{children}</p>

/**
 * Renders a normalized study guide (see utils/studyGuide.js) as five collapsible sections.
 * `badge` labels where the content came from (AI-generated vs. demo sample) and
 * `actions` holds page-specific buttons; both appear in the header.
 */
export default function StudyGuideView({ guide, badge, meta, actions, titleRef, idPrefix = 'guide' }) {
  const [openSections, setOpenSections] = useState(() => new Set(SECTION_IDS))
  const allOpen = openSections.size === SECTION_IDS.length

  const toggle = (id) =>
    setOpenSections((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const takeawayGroups = guide.sections.filter((section) => section.keyPoints.length > 0)
  const takeawayCount = takeawayGroups.reduce((sum, section) => sum + section.keyPoints.length, 0)
  const sectionProps = (id) => ({ id: `${idPrefix}-${id}`, isOpen: openSections.has(id), onToggle: () => toggle(id) })

  return (
    <article aria-labelledby={`${idPrefix}-title`} className="space-y-5">
      <header className="flex flex-col gap-4 rounded-2xl border border-cream-200 bg-white p-5 shadow-soft sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {badge}
          <h2
            id={`${idPrefix}-title`}
            ref={titleRef}
            tabIndex={-1}
            className="mt-2 text-xl font-bold tracking-tight text-ink-900 outline-none sm:text-2xl"
          >
            {guide.title}
          </h2>
          {meta && <p className="mt-1 text-sm text-ink-500">{meta}</p>}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setOpenSections(allOpen ? new Set() : new Set(SECTION_IDS))}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-sm font-semibold text-ink-700 ring-1 ring-cream-300 transition hover:bg-cream-100"
          >
            {allOpen ? (
              <ChevronsDownUp className="size-4" aria-hidden="true" />
            ) : (
              <ChevronsUpDown className="size-4" aria-hidden="true" />
            )}
            {allOpen ? 'Collapse all' : 'Expand all'}
          </button>
          {actions}
        </div>
      </header>

      <CollapsibleSection title="Overview" icon={ScrollText} {...sectionProps('overview')}>
        {guide.summary ? (
          <p className="max-w-3xl text-[15px] leading-relaxed text-ink-700">{guide.summary}</p>
        ) : (
          <EmptyNote>No summary was provided.</EmptyNote>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="Key Concepts and Explanations"
        icon={Lightbulb}
        count={guide.sections.length}
        {...sectionProps('concepts')}
      >
        {guide.sections.length > 0 ? (
          <div className="space-y-5">
            {guide.sections.map((section, index) => (
              <div key={index} className="border-l-2 border-lavender-200 pl-4">
                {section.heading && <h4 className="font-semibold text-ink-900">{section.heading}</h4>}
                {section.content && <p className="mt-1 text-[15px] leading-relaxed text-ink-700">{section.content}</p>}
              </div>
            ))}
          </div>
        ) : (
          <EmptyNote>No key concepts were identified.</EmptyNote>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="Important Takeaways"
        icon={ListChecks}
        count={takeawayCount}
        {...sectionProps('takeaways')}
      >
        {takeawayGroups.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {takeawayGroups.map((section, index) => (
              <div key={index}>
                {section.heading && (
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-lavender-600">
                    {section.heading}
                  </h4>
                )}
                <ul className="space-y-2">
                  {section.keyPoints.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex gap-2.5 text-[15px] leading-relaxed text-ink-700">
                      <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-lavender-400" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <EmptyNote>No takeaways were identified.</EmptyNote>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="Key Terms and Definitions"
        icon={BookMarked}
        count={guide.keyTerms.length}
        {...sectionProps('terms')}
      >
        {guide.keyTerms.length > 0 ? (
          <dl className="grid gap-3 sm:grid-cols-2">
            {guide.keyTerms.map(({ term, definition }, index) => (
              <div key={index} className="rounded-xl bg-cream-50 p-4 ring-1 ring-cream-200">
                <dt className="font-semibold text-lavender-800">{term}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-ink-700">{definition || '—'}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <EmptyNote>No key terms were identified.</EmptyNote>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="Review Questions"
        icon={CircleHelp}
        count={guide.reviewQuestions.length}
        {...sectionProps('questions')}
      >
        {guide.reviewQuestions.length > 0 ? (
          <ol className="space-y-3">
            {guide.reviewQuestions.map((question, index) => (
              <li key={index} className="flex gap-3 text-[15px] leading-relaxed text-ink-700">
                <span
                  aria-hidden="true"
                  className="grid size-6 shrink-0 place-items-center rounded-full bg-lavender-100 text-xs font-bold text-lavender-700"
                >
                  {index + 1}
                </span>
                <span className="pt-0.5">{question}</span>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyNote>No review questions were provided.</EmptyNote>
        )}
      </CollapsibleSection>
    </article>
  )
}
