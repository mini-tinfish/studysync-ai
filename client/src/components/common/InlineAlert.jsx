import { CircleCheck, Info, TriangleAlert, X } from 'lucide-react'

const VARIANTS = {
  success: { icon: CircleCheck, classes: 'border-emerald-200 bg-emerald-50 text-emerald-900', iconClass: 'text-emerald-600' },
  error: { icon: TriangleAlert, classes: 'border-rose-200 bg-rose-50 text-rose-900', iconClass: 'text-rose-600' },
  warning: { icon: TriangleAlert, classes: 'border-amber-200 bg-amber-50 text-amber-900', iconClass: 'text-amber-600' },
  info: { icon: Info, classes: 'border-lavender-200 bg-lavender-50 text-lavender-900', iconClass: 'text-lavender-600' },
}

/** Compact status message. Errors use role="alert"; everything else is a polite status. */
export default function InlineAlert({ variant = 'info', title, children, action, onDismiss, className = '' }) {
  const { icon: Icon, classes, iconClass } = VARIANTS[variant]
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${classes} ${className}`}
    >
      <Icon className={`mt-0.5 size-5 shrink-0 ${iconClass}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? 'mt-0.5 leading-relaxed opacity-90' : 'leading-relaxed'}>{children}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          className="-m-1 grid size-7 shrink-0 place-items-center rounded-lg opacity-70 transition hover:bg-black/5 hover:opacity-100"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
