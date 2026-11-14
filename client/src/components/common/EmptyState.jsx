export default function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-lavender-200 bg-white/60 px-6 py-12 text-center ${className}`}
    >
      {Icon && (
        <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-lavender-50 text-lavender-500">
          <Icon className="size-7" aria-hidden="true" />
        </span>
      )}
      <h3 className="text-base font-semibold text-ink-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
