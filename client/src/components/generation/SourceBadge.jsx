import { CircleHelp, FlaskConical, ServerCog, Sparkles } from 'lucide-react'

/**
 * Labels where generated content came from. Only 'ai' may be called AI-generated:
 * - 'ai'      the server confirmed it is not in mock mode
 * - 'mock'    the server is running with MOCK_AI=true (fixed sample responses)
 * - 'unknown' the content came from the server but mock mode couldn't be checked
 * - 'demo'    client-side Demo Mode sample data
 */
const SOURCES = {
  ai: { label: 'AI-generated', icon: Sparkles, classes: 'bg-lavender-100 text-lavender-700' },
  mock: { label: 'Mock data', icon: ServerCog, classes: 'bg-amber-100 text-amber-800' },
  unknown: { label: 'Source not verified', icon: CircleHelp, classes: 'bg-cream-200 text-ink-700' },
  demo: { label: 'Demo sample · not AI-generated', icon: FlaskConical, classes: 'bg-amber-100 text-amber-800' },
}

export default function SourceBadge({ origin }) {
  const { label, icon: Icon, classes } = SOURCES[origin] ?? SOURCES.unknown
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}>
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  )
}

/** Extra explanation shown with server results that are not confirmed AI output. */
export function SourceNotice({ origin }) {
  if (origin === 'mock') {
    return (
      <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm leading-relaxed text-amber-900 ring-1 ring-amber-200">
        <strong className="font-semibold">Mock data:</strong> the server is running in mock mode, so this is fixed
        sample content. It was not generated from your document.
      </p>
    )
  }
  if (origin === 'unknown') {
    return (
      <p className="rounded-xl bg-cream-100 px-3.5 py-2.5 text-sm leading-relaxed text-ink-700 ring-1 ring-cream-200">
        The server&rsquo;s status couldn&rsquo;t be checked, so it&rsquo;s unclear whether this content was AI-generated
        or sample data.
      </p>
    )
  }
  return null
}
