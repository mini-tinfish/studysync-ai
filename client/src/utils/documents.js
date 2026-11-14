// Limits mirror API_CONTRACT.md §1 "Shared limits".
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
export const MIN_TEXT_CHARS = 50
export const MAX_TEXT_CHARS = 100_000
export const ACCEPTED_EXTENSIONS = ['pdf', 'txt', 'md']
export const ACCEPT_ATTRIBUTE = '.pdf,.txt,.md,application/pdf,text/plain,text/markdown'

export const FILE_TYPE_LABELS = {
  pdf: 'PDF',
  txt: 'Text',
  md: 'Markdown',
  notes: 'Pasted notes',
}

export function getExtension(fileName) {
  const match = /\.([^.]+)$/.exec(fileName)
  return match ? match[1].toLowerCase() : ''
}

/** Client-side pre-check so obviously invalid files never hit the network. Returns an error message or null. */
export function validateFile(file) {
  if (!ACCEPTED_EXTENSIONS.includes(getExtension(file.name))) {
    return `"${file.name}" isn't supported. Please choose a PDF, TXT, or MD file.`
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `"${file.name}" is larger than 10 MB. Please choose a smaller file.`
  }
  if (file.size === 0) {
    return `"${file.name}" is empty.`
  }
  return null
}

export function countWords(text) {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Client-side document model. Upload fields come straight from the API response;
 * id, source, and uploadedAt are added by the client (the backend is stateless).
 */
export function createUploadedDocument(apiResponse) {
  return {
    ...apiResponse,
    id: createId(),
    source: 'upload',
    uploadedAt: new Date().toISOString(),
  }
}

/**
 * Notes written in the editor. `text` is the plain text sent to the AI; `richContent`
 * (sanitized editor JSON) is kept only in the browser so the notes can be reopened.
 */
export function createPastedDocument({ title, text, richContent = null }) {
  const trimmedText = text.trim()
  return {
    id: createId(),
    source: 'paste',
    fileName: title.trim() || 'Untitled notes',
    fileType: 'notes',
    sizeBytes: null,
    pageCount: null,
    charCount: trimmedText.length,
    wordCount: countWords(trimmedText),
    truncated: false,
    text: trimmedText,
    richContent,
    uploadedAt: new Date().toISOString(),
    updatedAt: null,
  }
}

/** Field changes for saving an edited note (pass to MaterialsProvider.updateDocument). */
export function notesDocumentChanges({ title, text, richContent }) {
  const trimmedText = text.trim()
  return {
    fileName: title.trim() || 'Untitled notes',
    text: trimmedText,
    richContent,
    charCount: trimmedText.length,
    wordCount: countWords(trimmedText),
    updatedAt: new Date().toISOString(),
  }
}

/** A document can be sent to the AI endpoints once it meets the contract's minimum text length. */
export function isReadyToStudy(doc) {
  return typeof doc.text === 'string' && doc.text.trim().length >= MIN_TEXT_CHARS
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export const formatDate = (iso) => dateFormatter.format(new Date(iso))

export const formatNumber = (n) => new Intl.NumberFormat().format(n)
