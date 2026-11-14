import { useId } from 'react'
import { useEditorState } from '@tiptap/react'
import { Bold, Highlighter, Italic, List, ListOrdered, Redo2, Underline, Undo2 } from 'lucide-react'
import { FONT_SIZES } from '../../utils/notes'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const MOD = isMac ? '⌘' : 'Ctrl'

function ToolbarButton({ icon: Icon, label, shortcut, keyshortcuts, isActive, disabled, onClick }) {
  const isToggle = typeof isActive === 'boolean'
  return (
    <button
      type="button"
      // Keep the editor's text selection when clicking a button.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={isToggle ? isActive : undefined}
      aria-keyshortcuts={keyshortcuts}
      title={shortcut ? `${label} (${shortcut})` : label}
      className={`grid size-9 place-items-center rounded-lg transition duration-150 disabled:cursor-not-allowed disabled:opacity-35 ${
        isActive
          ? 'bg-lavender-600 text-white shadow-soft'
          : 'text-ink-700 enabled:hover:bg-lavender-100 enabled:hover:text-lavender-800'
      }`}
    >
      <Icon className="size-[18px]" aria-hidden="true" />
    </button>
  )
}

const Divider = () => <span aria-hidden="true" className="mx-1 h-6 w-px shrink-0 bg-cream-300" />

const selectClass =
  'h-9 rounded-lg border border-cream-300 bg-white px-2.5 text-sm font-medium text-ink-700 transition hover:border-lavender-300 focus:border-lavender-400 disabled:cursor-not-allowed disabled:opacity-50'

/**
 * Formatting toolbar. Commands apply to the current selection; each control reflects the
 * selection's state (aria-pressed / select value) and is disabled when the command can't run.
 */
export default function EditorToolbar({ editor, controlsId, disabled = false }) {
  const blockTypeId = useId()
  const fontSizeId = useId()
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e) return null
      const can = e.can()
      return {
        bold: e.isActive('bold'),
        italic: e.isActive('italic'),
        underline: e.isActive('underline'),
        highlight: e.isActive('highlight'),
        bulletList: e.isActive('bulletList'),
        orderedList: e.isActive('orderedList'),
        block: [1, 2, 3].find((level) => e.isActive('heading', { level })) ?? 'paragraph',
        fontSize: e.getAttributes('textStyle').fontSize ?? 'normal',
        canBold: can.chain().toggleBold().run(),
        canItalic: can.chain().toggleItalic().run(),
        canUnderline: can.chain().toggleUnderline().run(),
        canHighlight: can.chain().toggleHighlight().run(),
        canBulletList: can.chain().toggleBulletList().run(),
        canOrderedList: can.chain().toggleOrderedList().run(),
        canHeading: can.chain().setHeading({ level: 1 }).run() || e.isActive('heading'),
        canFontSize: can.chain().setMark('textStyle', { fontSize: 'large' }).run(),
        canUndo: can.undo(),
        canRedo: can.redo(),
      }
    },
  })

  if (!editor || !state) return null
  const off = disabled || !editor.isEditable
  const run = (command) => command(editor.chain().focus()).run()

  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      aria-controls={controlsId}
      className="flex flex-wrap items-center gap-1 border-b border-cream-200 bg-cream-50/80 px-2 py-2 sm:px-3"
    >
      <label className="sr-only" htmlFor={blockTypeId}>
        Text style
      </label>
      <select
        id={blockTypeId}
        value={state.block}
        disabled={off || !state.canHeading}
        onChange={(event) => {
          const value = event.target.value
          run((c) => (value === 'paragraph' ? c.setParagraph() : c.setHeading({ level: Number(value) })))
        }}
        className={selectClass}
      >
        <option value="paragraph">Normal text</option>
        <option value={1}>Heading 1</option>
        <option value={2}>Heading 2</option>
        <option value={3}>Heading 3</option>
      </select>

      <label className="sr-only" htmlFor={fontSizeId}>
        Font size
      </label>
      <select
        id={fontSizeId}
        value={state.fontSize}
        disabled={off || !state.canFontSize}
        onChange={(event) => run((c) => c.setNotesFontSize(event.target.value))}
        className={selectClass}
      >
        <option value="small">{FONT_SIZES.small.label}</option>
        <option value="normal">Normal</option>
        <option value="large">{FONT_SIZES.large.label}</option>
      </select>

      <Divider />

      <ToolbarButton
        icon={Bold}
        label="Bold"
        shortcut={`${MOD}+B`}
        keyshortcuts="Control+B Meta+B"
        isActive={state.bold}
        disabled={off || !state.canBold}
        onClick={() => run((c) => c.toggleBold())}
      />
      <ToolbarButton
        icon={Italic}
        label="Italic"
        shortcut={`${MOD}+I`}
        keyshortcuts="Control+I Meta+I"
        isActive={state.italic}
        disabled={off || !state.canItalic}
        onClick={() => run((c) => c.toggleItalic())}
      />
      <ToolbarButton
        icon={Underline}
        label="Underline"
        shortcut={`${MOD}+U`}
        keyshortcuts="Control+U Meta+U"
        isActive={state.underline}
        disabled={off || !state.canUnderline}
        onClick={() => run((c) => c.toggleUnderline())}
      />
      <ToolbarButton
        icon={Highlighter}
        label="Highlight"
        shortcut={`${MOD}+Shift+H`}
        keyshortcuts="Control+Shift+H Meta+Shift+H"
        isActive={state.highlight}
        disabled={off || !state.canHighlight}
        onClick={() => run((c) => c.toggleHighlight())}
      />

      <Divider />

      <ToolbarButton
        icon={List}
        label="Bulleted list"
        shortcut={`${MOD}+Shift+8`}
        keyshortcuts="Control+Shift+8 Meta+Shift+8"
        isActive={state.bulletList}
        disabled={off || !state.canBulletList}
        onClick={() => run((c) => c.toggleBulletList())}
      />
      <ToolbarButton
        icon={ListOrdered}
        label="Numbered list"
        shortcut={`${MOD}+Shift+7`}
        keyshortcuts="Control+Shift+7 Meta+Shift+7"
        isActive={state.orderedList}
        disabled={off || !state.canOrderedList}
        onClick={() => run((c) => c.toggleOrderedList())}
      />

      <Divider />

      <ToolbarButton
        icon={Undo2}
        label="Undo"
        shortcut={`${MOD}+Z`}
        keyshortcuts="Control+Z Meta+Z"
        disabled={off || !state.canUndo}
        onClick={() => run((c) => c.undo())}
      />
      <ToolbarButton
        icon={Redo2}
        label="Redo"
        shortcut={isMac ? '⌘+Shift+Z' : 'Ctrl+Y'}
        keyshortcuts="Control+Y Meta+Shift+Z"
        disabled={off || !state.canRedo}
        onClick={() => run((c) => c.redo())}
      />
    </div>
  )
}
