import { ChevronDown } from 'lucide-react'

/**
 * Disclosure section (WAI-ARIA accordion pattern: a heading wrapping a button).
 * Collapsed content is `inert`, so it can't receive focus or be read while hidden.
 */
export default function CollapsibleSection({ id, title, icon: Icon, count, isOpen, onToggle, children }) {
  const buttonId = `${id}-toggle`
  const panelId = `${id}-panel`

  return (
    <section className="overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-soft">
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-lavender-50/60 focus-visible:-outline-offset-2"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-lavender-50 text-lavender-600">
            <Icon className="size-[18px]" aria-hidden="true" />
          </span>
          <span className="flex-1 font-semibold text-ink-900">{title}</span>
          {typeof count === 'number' && (
            <span className="rounded-full bg-cream-100 px-2.5 py-0.5 text-xs font-medium text-ink-500">
              {count}
              <span className="sr-only"> items</span>
            </span>
          )}
          <ChevronDown
            className={`size-5 shrink-0 text-ink-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        inert={!isOpen}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-cream-200 px-5 py-5">{children}</div>
        </div>
      </div>
    </section>
  )
}
