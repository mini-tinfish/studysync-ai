import { useEffect, useId, useRef } from 'react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import { sanitizeNotesContent } from '../../utils/notes'
import EditorToolbar from './EditorToolbar'
import { isEditorReady } from './editorReady'
import { notesExtensions } from './editorExtensions'

/**
 * Rich-text notes editor (Tiptap). Uncontrolled: it starts from `initialContent`
 * (sanitized ProseMirror JSON) and reports every change through `onChange(json)`.
 * To load a different note, remount it with a new `key`.
 */
export default function NotesEditor({ initialContent, onChange, labelledBy, describedBy, invalid = false, onReady }) {
  const contentId = useId()
  const onChangeRef = useRef(onChange)
  const onReadyRef = useRef(onReady)
  const invalidRef = useRef(invalid)
  useEffect(() => {
    onChangeRef.current = onChange
    onReadyRef.current = onReady
    invalidRef.current = invalid
  })

  const applyInvalid = (e) => {
    if (isEditorReady(e)) e.view.dom.setAttribute('aria-invalid', String(Boolean(invalidRef.current)))
  }

  const editor = useEditor({
    extensions: notesExtensions,
    content: sanitizeNotesContent(initialContent),
    editorProps: {
      attributes: {
        id: contentId,
        role: 'textbox',
        'aria-multiline': 'true',
        ...(labelledBy && { 'aria-labelledby': labelledBy }),
        ...(describedBy && { 'aria-describedby': describedBy }),
        class: 'notes-content min-h-72 px-5 py-4 text-[15px] leading-relaxed text-ink-900 outline-none sm:min-h-96',
      },
    },
    onUpdate: ({ editor: e }) => onChangeRef.current?.(e.getJSON()),
    // Fires once the view is attached to the page (and again if React remounts it).
    onCreate: ({ editor: e }) => {
      applyInvalid(e)
      onReadyRef.current?.(e)
    },
  })

  const isEmpty = useEditorState({ editor, selector: ({ editor: e }) => e?.isEmpty ?? true })

  // Keep aria-invalid on the editable element in sync with validation.
  useEffect(() => {
    applyInvalid(editor)
  }, [editor, invalid])

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white transition focus-within:ring-4 ${
        invalid
          ? 'border-rose-300 focus-within:ring-rose-100'
          : 'border-cream-300 focus-within:border-lavender-400 focus-within:ring-lavender-100'
      }`}
    >
      <EditorToolbar editor={editor} controlsId={contentId} />
      <div className="relative max-h-[70vh] overflow-y-auto">
        {isEmpty && (
          <p aria-hidden="true" className="pointer-events-none absolute left-5 top-4 text-[15px] text-ink-400">
            Paste or type your notes here. Formatting from Word, Google Docs, and websites is kept where it fits.
          </p>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
