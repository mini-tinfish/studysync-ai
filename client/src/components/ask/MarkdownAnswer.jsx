import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ImageOff, SquareArrowOutUpRight } from 'lucide-react'
import { normalizeMarkdownForDisplay, safeLinkUrl } from '../../utils/markdown'

/**
 * Elements an AI answer may produce. Anything else (e.g. footnote sections) is unwrapped to
 * its text. Raw HTML in the answer is never rendered as HTML (no rehype-raw): it shows as text.
 */
const ALLOWED_ELEMENTS = [
  'p', 'br', 'strong', 'em', 'del', 'a',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'input',
  'code', 'pre', 'blockquote', 'hr',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'img',
]

const COMPONENTS = {
  p: ({ node: _node, ...props }) => <p className="my-2.5 first:mt-0 last:mb-0" {...props} />,
  strong: ({ node: _node, ...props }) => <strong className="font-semibold text-ink-900" {...props} />,
  em: ({ node: _node, ...props }) => <em className="italic" {...props} />,
  del: ({ node: _node, ...props }) => <del className="text-ink-500" {...props} />,

  h1: ({ node: _node, ...props }) => <h3 className="mb-2 mt-4 text-lg font-bold tracking-tight text-ink-900 first:mt-0" {...props} />,
  h2: ({ node: _node, ...props }) => <h4 className="mb-2 mt-4 text-base font-bold text-ink-900 first:mt-0" {...props} />,
  h3: ({ node: _node, ...props }) => <h5 className="mb-1.5 mt-3.5 font-semibold text-lavender-800 first:mt-0" {...props} />,
  h4: ({ node: _node, ...props }) => <h6 className="mb-1 mt-3 font-semibold text-ink-900 first:mt-0" {...props} />,
  h5: ({ node: _node, ...props }) => <h6 className="mb-1 mt-3 text-sm font-semibold text-ink-700 first:mt-0" {...props} />,
  h6: ({ node: _node, ...props }) => <h6 className="mb-1 mt-3 text-sm font-semibold text-ink-500 first:mt-0" {...props} />,

  ul: ({ node: _node, ...props }) => (
    <ul className="my-2.5 list-disc space-y-1 pl-5 marker:text-lavender-500 first:mt-0 last:mb-0 [&_ol]:my-1 [&_ul]:my-1" {...props} />
  ),
  ol: ({ node: _node, ...props }) => (
    <ol className="my-2.5 list-decimal space-y-1 pl-5 marker:font-semibold marker:text-lavender-600 first:mt-0 last:mb-0 [&_ol]:my-1 [&_ul]:my-1" {...props} />
  ),
  li: ({ node: _node, ...props }) => <li className="pl-1 [&>p]:my-1" {...props} />,
  // GFM task-list checkboxes: display only.
  input: ({ node: _node, type, checked }) =>
    type === 'checkbox' ? (
      <input type="checkbox" checked={Boolean(checked)} disabled readOnly className="mr-1.5 translate-y-px accent-lavender-600" />
    ) : null,

  // Inline code; inside <pre> the block styles below take over.
  code: ({ node: _node, className, ...props }) => (
    <code
      className={`rounded-md bg-lavender-50 px-1.5 py-0.5 font-mono text-[0.85em] text-lavender-800 ring-1 ring-lavender-100 ${className ?? ''}`}
      {...props}
    />
  ),
  // Code blocks are shown as text only: never highlighted with HTML, never executed.
  pre: ({ node: _node, ...props }) => (
    <pre
      tabIndex={0}
      aria-label="Code block"
      className="my-3 overflow-x-auto rounded-xl bg-[#2b2537] p-3.5 font-mono text-[13px] leading-relaxed text-[#f1ecf7] ring-1 ring-transparent dark:bg-[#120f19] dark:ring-cream-200 outline-none focus-visible:ring-2 focus-visible:ring-lavender-400 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit [&_code]:ring-0"
      {...props}
    />
  ),
  blockquote: ({ node: _node, ...props }) => (
    <blockquote className="my-3 border-l-4 border-lavender-300 bg-lavender-50/60 py-1.5 pl-3 pr-2 text-ink-700 [&>p]:my-1" {...props} />
  ),
  hr: () => <hr className="my-4 border-cream-300" />,

  // Wide tables scroll horizontally inside their own keyboard-focusable region.
  table: ({ node: _node, ...props }) => (
    <div
      role="region"
      aria-label="Table"
      tabIndex={0}
      className="my-3 overflow-x-auto rounded-xl ring-1 ring-cream-300 outline-none focus-visible:ring-2 focus-visible:ring-lavender-400"
    >
      <table className="w-full border-collapse text-left text-sm" {...props} />
    </div>
  ),
  thead: ({ node: _node, ...props }) => <thead className="bg-lavender-50 text-lavender-900" {...props} />,
  tr: ({ node: _node, ...props }) => <tr className="border-b border-cream-200 last:border-0" {...props} />,
  th: ({ node: _node, style, ...props }) => (
    <th className="whitespace-nowrap px-3 py-2 font-semibold" style={style} {...props} />
  ),
  td: ({ node: _node, style, ...props }) => <td className="px-3 py-2 align-top" style={style} {...props} />,

  // Links: only http(s)/mailto (see urlTransform); anything else is shown as plain text.
  a: ({ node: _node, href, children }) =>
    href ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow ugc"
        className="inline-flex items-baseline gap-0.5 font-medium text-lavender-700 underline decoration-lavender-300 underline-offset-2 transition hover:text-lavender-900 hover:decoration-lavender-500"
      >
        {children}
        <SquareArrowOutUpRight className="size-3 shrink-0 self-center" aria-hidden="true" />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    ) : (
      <span>{children}</span>
    ),

  // Images from AI answers are never loaded (no tracking pixels or remote content).
  img: ({ alt }) => (
    <span className="inline-flex items-center gap-1 rounded-md bg-cream-100 px-1.5 py-0.5 text-xs text-ink-500 ring-1 ring-cream-200">
      <ImageOff className="size-3.5" aria-hidden="true" />
      {alt ? `Image not shown: ${alt}` : 'Image not shown'}
    </span>
  ),
}

/** href → allow-listed URL or null; image src → always null (images are never fetched). */
function urlTransform(url, key) {
  if (key === 'src') return null
  return safeLinkUrl(url)
}

/**
 * Renders an AI answer as safe Markdown (GFM). The `text` prop is only normalized for
 * display; the stored answer string is never modified.
 */
export default function MarkdownAnswer({ text }) {
  return (
    <div className="break-words text-[15px] leading-relaxed text-ink-900">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        allowedElements={ALLOWED_ELEMENTS}
        unwrapDisallowed
        urlTransform={urlTransform}
        components={COMPONENTS}
      >
        {normalizeMarkdownForDisplay(text)}
      </ReactMarkdown>
    </div>
  )
}
