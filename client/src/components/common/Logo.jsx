import { GraduationCap } from 'lucide-react'

export default function Logo({ compact = false }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-lavender-600 text-white shadow-soft">
        <GraduationCap className="size-5" aria-hidden="true" />
      </span>
      {!compact && (
        <span className="text-lg font-extrabold tracking-tight text-ink-900">
          StudySync <span className="text-lavender-600">AI</span>
        </span>
      )}
    </span>
  )
}
