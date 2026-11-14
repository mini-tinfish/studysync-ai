import { Eye } from 'lucide-react'

export default function DemoButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-lavender-700 ring-1 ring-lavender-200 transition duration-200 hover:bg-lavender-50 ${className}`}
    >
      <Eye className="size-4" aria-hidden="true" />
      Preview Demo Mode
    </button>
  )
}
