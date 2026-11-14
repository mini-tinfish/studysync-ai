import { ArrowRight } from 'lucide-react'

const TONES = {
  lavender: 'bg-lavender-100 text-lavender-600',
  rose: 'bg-rose-100 text-rose-500',
  amber: 'bg-amber-100 text-amber-600',
}

export default function QuickActionCard({ href, icon: Icon, title, description, tone = 'lavender', note }) {
  return (
    <a
      href={href}
      className="group flex h-full flex-col rounded-2xl border border-cream-200 bg-white p-5 shadow-soft transition duration-200 hover:-translate-y-1 hover:border-lavender-200 hover:shadow-lift"
    >
      <span className={`mb-4 grid size-11 place-items-center rounded-xl ${TONES[tone]}`}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3 className="font-semibold text-ink-900">{title}</h3>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-ink-500">{description}</p>
      <div className="mt-4 flex items-center justify-between gap-2">
        {note && <span className="text-xs font-medium text-ink-400">{note}</span>}
        <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-lavender-600">
          Open
          <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </a>
  )
}
