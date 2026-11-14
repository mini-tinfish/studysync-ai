import { ArrowRight, FileText, Inbox } from 'lucide-react'
import { routeHref } from '../../config/navigation'
import Button from '../common/Button'
import EmptyState from '../common/EmptyState'

const dateFormatter = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

/**
 * Expected material shape (frontend assumption, pending the agreed API contract):
 * { id, title, fileName, uploadedAt (ISO string) }
 */
export default function RecentMaterials({ materials }) {
  return (
    <section aria-labelledby="recent-materials-title">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 id="recent-materials-title" className="text-lg font-bold tracking-tight text-ink-900">
          Recent study materials
        </h2>
        {materials.length > 0 && (
          <a
            href={routeHref('materials')}
            className="inline-flex items-center gap-1 rounded-lg text-sm font-semibold text-lavender-600 transition hover:text-lavender-800"
          >
            View all
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        )}
      </div>

      {materials.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No study materials yet"
          description="Materials you upload will show up here, so you can jump back into studying anytime."
          action={
            <Button href={routeHref('materials')} variant="secondary">
              Go to My Materials
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-cream-200 overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-soft">
          {materials.slice(0, 5).map((material) => (
            <li key={material.id} className="flex items-center gap-4 p-4 transition hover:bg-lavender-50/50">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-lavender-50 text-lavender-500">
                <FileText className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink-900">{material.title}</p>
                <p className="truncate text-sm text-ink-500">{material.fileName}</p>
              </div>
              <time dateTime={material.uploadedAt} className="shrink-0 text-xs text-ink-400">
                {dateFormatter.format(new Date(material.uploadedAt))}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
