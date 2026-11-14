/**
 * A Tiptap editor's view (DOM) exists only after it has been mounted on the page;
 * calling commands or touching `editor.view.dom` before then throws. Kept separate from
 * NotesEditor.jsx so importing it doesn't pull the lazily loaded editor into the main bundle.
 */
export const isEditorReady = (editor) => Boolean(editor && !editor.isDestroyed && editor.isInitialized)

export function focusEditor(editor, position) {
  if (isEditorReady(editor)) editor.commands.focus(position, { scrollIntoView: false })
}
