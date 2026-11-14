/**
 * Presentation helpers for AI answers rendered as Markdown. Nothing here changes the stored
 * answer: the original string stays in the conversation history and API requests.
 */

const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:'])

/**
 * URL allow-list for links in AI answers. Only absolute http(s) and mailto URLs survive;
 * everything else (javascript:, data:, vbscript:, file:, relative paths, …) returns null,
 * and the link is shown as plain text instead.
 */
export function safeLinkUrl(url) {
  if (typeof url !== 'string') return null
  const trimmed = url.trim()
  try {
    const parsed = new URL(trimmed)
    return SAFE_PROTOCOLS.has(parsed.protocol) ? parsed.href : null
  } catch {
    return null
  }
}

const FENCE = /^ {0,3}(`{3,}|~{3,})/
const UNICODE_BULLET = /^(\s*)[•◦▪‣∙●]\s+/
const ORDERED_ITEM = /^ {0,3}(\d{1,9})[.)]\s+\S/
const BLOCK_START = /^ {0,3}(?:[-*+]\s|\d{1,9}[.)]\s|#{1,6}\s|>|\||```|~~~)/

/**
 * Minimal, meaning-preserving fixes for list formatting that models sometimes produce:
 * 1. Lines starting with "•" (and similar bullet characters) become Markdown "- " items.
 * 2. A numbered list that doesn't start at 1 (e.g. "2. …" right after a sentence) can't
 *    interrupt a paragraph in CommonMark, so it would render as plain text; a blank line is
 *    inserted before it.
 * Code blocks are never touched, and no other newlines are added.
 */
export function normalizeMarkdownForDisplay(text) {
  if (typeof text !== 'string' || text === '') return ''
  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  const out = []
  let fence = null

  for (const original of lines) {
    const fenceMatch = original.match(FENCE)
    if (fence) {
      out.push(original)
      if (fenceMatch && fenceMatch[1][0] === fence[0] && fenceMatch[1].length >= fence.length) fence = null
      continue
    }
    if (fenceMatch) {
      fence = fenceMatch[1]
      out.push(original)
      continue
    }

    const line = original.replace(UNICODE_BULLET, '$1- ')
    const ordered = line.match(ORDERED_ITEM)
    const previous = out.at(-1)
    const previousIsParagraphText = previous !== undefined && previous.trim() !== '' && !BLOCK_START.test(previous)
    if (ordered && Number(ordered[1]) !== 1 && previousIsParagraphText) out.push('')
    out.push(line)
  }
  return out.join('\n')
}
