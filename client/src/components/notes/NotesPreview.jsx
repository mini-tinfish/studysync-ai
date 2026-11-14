import { FONT_SIZES, sanitizeNotesContent } from '../../utils/notes'

/**
 * Read-only rendering of saved notes (editor JSON) without loading the editor. The content
 * is re-sanitized against the editor's allow-list and rendered as React elements, so text
 * is always text — no HTML from storage is ever inserted.
 */

function renderText(node, key) {
  let content = node.text
  for (const mark of node.marks ?? []) {
    if (mark.type === 'bold') content = <strong className="font-bold">{content}</strong>
    else if (mark.type === 'italic') content = <em>{content}</em>
    else if (mark.type === 'underline') content = <u>{content}</u>
    else if (mark.type === 'highlight') content = <mark>{content}</mark>
    else if (mark.type === 'textStyle' && FONT_SIZES[mark.attrs?.fontSize]) {
      content = <span style={{ fontSize: FONT_SIZES[mark.attrs.fontSize].css }}>{content}</span>
    }
  }
  return <span key={key}>{content}</span>
}

const renderInline = (nodes = []) =>
  nodes.map((node, i) => (node.type === 'hardBreak' ? <br key={i} /> : node.type === 'text' ? renderText(node, i) : null))

// Note headings are demoted (h1→h3 …) to sit under the dialog's own heading; the classes
// keep the editor's look.
const HEADING_TAGS = { 1: 'h3', 2: 'h4', 3: 'h5' }
const HEADING_CLASSES = {
  1: 'text-2xl font-bold tracking-tight text-ink-900',
  2: 'text-xl font-bold tracking-tight text-ink-900',
  3: 'text-lg font-semibold text-lavender-800',
}

function renderBlock(node, key) {
  switch (node.type) {
    case 'paragraph':
      return <p key={key}>{node.content?.length ? renderInline(node.content) : <br />}</p>
    case 'heading': {
      const Tag = HEADING_TAGS[node.attrs?.level] ?? 'h4'
      return (
        <Tag key={key} className={HEADING_CLASSES[node.attrs?.level] ?? HEADING_CLASSES[2]}>
          {renderInline(node.content)}
        </Tag>
      )
    }
    case 'bulletList':
      return <ul key={key}>{(node.content ?? []).map(renderBlock)}</ul>
    case 'orderedList':
      return (
        <ol key={key} start={node.attrs?.start ?? 1}>
          {(node.content ?? []).map(renderBlock)}
        </ol>
      )
    case 'listItem':
      return <li key={key}>{(node.content ?? []).map(renderBlock)}</li>
    default:
      return null
  }
}

export default function NotesPreview({ content }) {
  const doc = sanitizeNotesContent(content)
  return <div className="notes-content text-[15px] leading-relaxed text-ink-900">{doc.content.map(renderBlock)}</div>
}
