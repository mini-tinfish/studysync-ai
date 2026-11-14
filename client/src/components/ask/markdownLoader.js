/** Lazily loaded Markdown renderer for AI answers (kept out of the main bundle). */
export const loadMarkdown = () => import('./MarkdownAnswer')

/** Start loading early (e.g. when Ask My Notes opens) so answers rarely flash as plain text. */
export function preloadMarkdown() {
  loadMarkdown().catch(() => {})
}
