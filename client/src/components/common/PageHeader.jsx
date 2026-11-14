/**
 * Page title block. The <h1> is focusable (tabIndex -1) so focus can move
 * to it after client-side navigation, announcing the new page to screen readers.
 */
export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-lavender-600">{eyebrow}</p>
        )}
        <h1 tabIndex={-1} className="text-2xl font-bold tracking-tight text-ink-900 outline-none sm:text-3xl">
          {title}
        </h1>
        {description && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </header>
  )
}
