import { ArrowRight, CloudUpload, FileText } from 'lucide-react'
import { routeHref } from '../../config/navigation'

export default function UploadCard() {
  return (
    <section
      aria-labelledby="upload-card-title"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-lavender-600 via-lavender-500 to-lavender-400 p-6 text-white shadow-lift sm:p-8"
    >
      {/* Decorative shapes */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/10" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 right-24 size-40 rounded-full bg-white/10" />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-lg">
          <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-white/20 ring-1 ring-white/30">
            <CloudUpload className="size-6" aria-hidden="true" />
          </span>
          <h2 id="upload-card-title" className="text-xl font-bold tracking-tight sm:text-2xl">
            Upload Materials
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-lavender-50 sm:text-[15px]">
            Add your lecture notes, readings, or slides. Once they&rsquo;re in, you&rsquo;ll be able to turn
            them into study guides, flashcards, and practice quizzes.
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            <FileText className="size-3.5" aria-hidden="true" />
            PDF documents
          </p>
        </div>

        <a
          href={routeHref('materials')}
          className="group inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-white px-5 py-3 text-sm font-semibold text-lavender-700 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-white md:self-center"
        >
          Upload Materials
          <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
