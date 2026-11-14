import { BookOpenCheck, CircleAlert, Quote, SearchX } from 'lucide-react'
import { citationAppearsInText } from '../../utils/ask'
import SourceBadge from '../generation/SourceBadge'

/** Assistant text: keep the model's paragraphs and line breaks, rendered as plain text (never HTML). */
function AnswerText({ text }) {
  return (
    <div className="space-y-2 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-ink-900">
      {text.split(/\n{2,}/).map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </div>
  )
}

function Citations({ citations, documentText }) {
  if (citations.length === 0) return null
  return (
    <div className="mt-3 border-t border-cream-200 pt-3">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-lavender-700">
        <Quote className="size-3.5" aria-hidden="true" />
        Sources quoted in the answer
      </p>
      <ul className="space-y-2">
        {citations.map((citation, i) => {
          const found = documentText != null && citationAppearsInText(citation, documentText)
          return (
            <li key={i} className="rounded-xl bg-cream-50 px-3 py-2 ring-1 ring-cream-200">
              <blockquote className="break-words text-sm italic leading-relaxed text-ink-700">&ldquo;{citation}&rdquo;</blockquote>
              {documentText != null && (
                <p className={`mt-1 flex items-center gap-1 text-[11px] font-medium ${found ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {found ? (
                    <BookOpenCheck className="size-3.5" aria-hidden="true" />
                  ) : (
                    <CircleAlert className="size-3.5" aria-hidden="true" />
                  )}
                  {found ? 'Found in your notes' : 'Not found word-for-word in your notes'}
                </p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * One chat message. Assistant messages show where the answer came from (origin badge),
 * whether it is grounded in the notes (answeredFromMaterial), and any citations the
 * server returned — each checked against the document text, never invented.
 */
export default function ChatMessage({ message, documentText }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-lavender-600 px-4 py-2.5 text-white shadow-soft sm:max-w-[75%]">
          <p className="sr-only">You asked:</p>
          <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-cream-200 bg-white px-4 py-3 shadow-soft sm:max-w-[80%]">
        <p className="sr-only">StudySync answered:</p>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <SourceBadge origin={message.origin} />
          {message.answeredFromMaterial ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <BookOpenCheck className="size-3.5" aria-hidden="true" />
              Based on your notes
            </span>
          ) : null}
        </div>
        {!message.answeredFromMaterial && (
          <p className="mb-2 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-200">
            <SearchX className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              <strong className="font-semibold">Not found in your notes.</strong> This question doesn&rsquo;t seem to
              be covered by this document, so the answer below isn&rsquo;t backed by your material.
            </span>
          </p>
        )}
        <AnswerText text={message.content} />
        <Citations citations={message.citations ?? []} documentText={documentText} />
      </div>
    </div>
  )
}
