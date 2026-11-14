import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import { Extension } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { FONT_SIZES, fontSizeKeyFromCss } from '../../utils/notes'

/**
 * Restricted font size: only the toolbar's Small/Large values survive. Pasted sizes such
 * as Word's "11pt" are ignored, so pasted notes keep a consistent look.
 * Stored as a key ("small" | "large"); rendered as an inline font-size style.
 */
const FontSize = Extension.create({
  name: 'notesFontSize',

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => fontSizeKeyFromCss(element.style.fontSize),
            renderHTML: (attributes) =>
              FONT_SIZES[attributes.fontSize] ? { style: `font-size: ${FONT_SIZES[attributes.fontSize].css}` } : {},
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setNotesFontSize:
        (size) =>
        ({ chain }) =>
          FONT_SIZES[size]
            ? chain().setMark('textStyle', { fontSize: size }).run()
            : chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    }
  },
})

/**
 * Only what the toolbar offers. Anything else in pasted HTML (images, tables, links,
 * scripts, colors, fonts, code blocks...) is dropped by the editor schema; text is kept.
 */
export const notesExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    blockquote: false,
    code: false,
    codeBlock: false,
    horizontalRule: false,
    link: false,
    strike: false,
  }),
  TextStyle,
  FontSize,
  Highlight.configure({ multicolor: false }),
]
