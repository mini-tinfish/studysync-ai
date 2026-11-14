/**
 * Rich-text notes helpers. Notes are stored as ProseMirror/Tiptap JSON (never HTML) and
 * converted to plain text for the AI endpoints, which only accept plain `text`
 * (API_CONTRACT.md). Nothing here touches the DOM, so it is easy to test.
 */

/** Font sizes offered in the toolbar. "Normal" is the absence of a size. */
export const FONT_SIZES = {
  small: { label: 'Small', css: '0.875em' },
  large: { label: 'Large', css: '1.25em' },
}

/** Map a CSS font-size back to a toolbar size key; anything else (e.g. Word's "11pt") → null. */
export function fontSizeKeyFromCss(value) {
  if (!value) return null
  const normalized = String(value).replace(/\s+/g, '').toLowerCase()
  return Object.keys(FONT_SIZES).find((key) => FONT_SIZES[key].css === normalized) ?? null
}

// ---------- Sanitizing stored content ----------

const BLOCK_TYPES = new Set(['paragraph', 'heading', 'bulletList', 'orderedList', 'listItem'])
const MARK_TYPES = new Set(['bold', 'italic', 'underline', 'highlight', 'textStyle'])

function sanitizeMarks(marks) {
  if (!Array.isArray(marks)) return undefined
  const clean = []
  for (const mark of marks) {
    if (!mark || !MARK_TYPES.has(mark.type)) continue
    if (mark.type === 'textStyle') {
      const fontSize = FONT_SIZES[mark.attrs?.fontSize] ? mark.attrs.fontSize : null
      if (fontSize) clean.push({ type: 'textStyle', attrs: { fontSize } })
      continue
    }
    clean.push({ type: mark.type })
  }
  return clean.length ? clean : undefined
}

function inlineText(node) {
  if (!node) return ''
  if (node.type === 'text') return typeof node.text === 'string' ? node.text : ''
  if (node.type === 'hardBreak') return '\n'
  return (Array.isArray(node.content) ? node.content : []).map(inlineText).join('')
}

function sanitizeInline(nodes) {
  const result = []
  for (const node of Array.isArray(nodes) ? nodes : []) {
    if (node?.type === 'text' && typeof node.text === 'string' && node.text.length > 0) {
      const marks = sanitizeMarks(node.marks)
      result.push(marks ? { type: 'text', text: node.text, marks } : { type: 'text', text: node.text })
    } else if (node?.type === 'hardBreak') {
      result.push({ type: 'hardBreak' })
    } else if (node) {
      // Unknown inline node: keep its text, drop the wrapper.
      const text = inlineText(node)
      if (text) result.push({ type: 'text', text })
    }
  }
  return result
}

function sanitizeBlock(node) {
  if (!node || typeof node !== 'object') return []
  switch (node.type) {
    case 'paragraph':
      return [{ type: 'paragraph', content: sanitizeInline(node.content) }]
    case 'heading': {
      const level = [1, 2, 3].includes(node.attrs?.level) ? node.attrs.level : 2
      return [{ type: 'heading', attrs: { level }, content: sanitizeInline(node.content) }]
    }
    case 'bulletList':
    case 'orderedList': {
      const items = (Array.isArray(node.content) ? node.content : []).flatMap(sanitizeListItem)
      if (items.length === 0) return []
      const list = { type: node.type, content: items }
      if (node.type === 'orderedList') {
        const start = Number.isInteger(node.attrs?.start) && node.attrs.start > 0 ? node.attrs.start : 1
        list.attrs = { start }
      }
      return [list]
    }
    case 'listItem':
      return sanitizeListItem(node).flatMap((item) => item.content)
    default: {
      // Unknown block (e.g. blockquote, code block, table): keep any child blocks or its text.
      const children = Array.isArray(node.content) ? node.content : []
      if (children.some((child) => BLOCK_TYPES.has(child?.type))) return children.flatMap(sanitizeBlock)
      const text = inlineText(node)
      return text ? [{ type: 'paragraph', content: [{ type: 'text', text }] }] : []
    }
  }
}

function sanitizeListItem(node) {
  if (node?.type !== 'listItem') {
    const blocks = sanitizeBlock(node)
    return blocks.length ? [{ type: 'listItem', content: blocks }] : []
  }
  const blocks = (Array.isArray(node.content) ? node.content : []).flatMap(sanitizeBlock)
  // A list item must start with a paragraph.
  if (blocks[0]?.type !== 'paragraph') blocks.unshift({ type: 'paragraph', content: [] })
  return [{ type: 'listItem', content: blocks }]
}

/**
 * Returns a copy of `json` containing only the nodes, marks, and attributes the notes
 * editor supports. Run on save and before loading content back into the editor.
 */
export function sanitizeNotesContent(json) {
  const blocks = (Array.isArray(json?.content) ? json.content : []).flatMap(sanitizeBlock)
  return { type: 'doc', content: blocks.length ? blocks : [{ type: 'paragraph', content: [] }] }
}

// ---------- Plain text for the AI ----------

function blockToLines(node, indent) {
  const pad = '  '.repeat(indent)
  switch (node.type) {
    case 'paragraph':
    case 'heading': {
      const text = inlineText(node).trim()
      return text ? [pad + text.replace(/\n/g, `\n${pad}`)] : []
    }
    case 'bulletList':
    case 'orderedList': {
      let number = node.type === 'orderedList' ? (node.attrs?.start ?? 1) : null
      const lines = []
      for (const item of node.content ?? []) {
        const marker = number === null ? '- ' : `${number++}. `
        const [first, ...rest] = item.content ?? []
        const firstText = first && (first.type === 'paragraph' || first.type === 'heading') ? inlineText(first).trim() : ''
        lines.push(`${pad}${marker}${firstText}`.trimEnd())
        const remaining = firstText || !first ? rest : item.content
        for (const child of remaining) lines.push(...blockToLines(child, indent + 1))
      }
      return lines
    }
    default:
      return (node.content ?? []).flatMap((child) => blockToLines(child, indent))
  }
}

/**
 * Plain text sent to the AI endpoints. Blocks are separated by blank lines, list items
 * keep "- " / "1. " markers, nested lists are indented, and formatting is dropped.
 */
export function notesToPlainText(json) {
  const blocks = Array.isArray(json?.content) ? json.content : []
  const parts = []
  for (const block of blocks) {
    const lines = blockToLines(block, 0)
    if (lines.length) parts.push(lines.join('\n'))
  }
  return parts
    .join('\n\n')
    .replace(/ /g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Turn legacy plain-text notes into editor content (one paragraph per line). */
export function plainTextToNotesContent(text) {
  const paragraphs = String(text ?? '')
    .split(/\n/)
    .map((line) => (line ? { type: 'paragraph', content: [{ type: 'text', text: line }] } : { type: 'paragraph', content: [] }))
  return sanitizeNotesContent({ type: 'doc', content: paragraphs })
}
