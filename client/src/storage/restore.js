import { normalizeFlashcards } from '../utils/flashcards'
import { sanitizeNotesContent } from '../utils/notes'
import { normalizeQuiz } from '../utils/quiz'
import { normalizeStudyGuide } from '../utils/studyGuide'

/**
 * Validation for data read back from browser storage. Stored data can be stale (an older
 * app version), partially written, or edited by hand, so everything is checked the same
 * way fresh API responses are. Anything invalid is dropped rather than crashing the app.
 */

const ORIGINS = new Set(['ai', 'mock', 'unknown', 'mixed'])
const FILE_TYPES = new Set(['pdf', 'txt', 'md', 'notes'])
const isString = (v) => typeof v === 'string'
const isIsoDate = (v) => isString(v) && !Number.isNaN(Date.parse(v))
const numberOrNull = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null)

export function restoreDocument(raw) {
  if (!raw || !isString(raw.id) || !raw.id || !isString(raw.text) || !isString(raw.fileName)) return null
  const source = raw.source === 'paste' ? 'paste' : 'upload'
  return {
    id: raw.id,
    source,
    fileName: raw.fileName,
    fileType: FILE_TYPES.has(raw.fileType) ? raw.fileType : source === 'paste' ? 'notes' : 'txt',
    sizeBytes: numberOrNull(raw.sizeBytes),
    pageCount: numberOrNull(raw.pageCount),
    charCount: numberOrNull(raw.charCount) ?? raw.text.length,
    wordCount: numberOrNull(raw.wordCount),
    truncated: raw.truncated === true,
    text: raw.text,
    // Notes formatting is re-sanitized against the editor's allow-list.
    richContent: source === 'paste' && raw.richContent ? sanitizeNotesContent(raw.richContent) : null,
    uploadedAt: isIsoDate(raw.uploadedAt) ? raw.uploadedAt : new Date().toISOString(),
    updatedAt: isIsoDate(raw.updatedAt) ? raw.updatedAt : null,
  }
}

function restoreChat(data) {
  const messages = (Array.isArray(data?.messages) ? data.messages : []).filter(
    (m) => m && isString(m.id) && (m.role === 'user' || m.role === 'assistant') && isString(m.content) && m.content,
  )
  if (messages.length === 0) return null
  return {
    messages: messages.map((m) =>
      m.role === 'user'
        ? { id: m.id, role: 'user', content: m.content, createdAt: m.createdAt }
        : {
            id: m.id,
            role: 'assistant',
            content: m.content,
            answeredFromMaterial: m.answeredFromMaterial === true,
            citations: Array.isArray(m.citations) ? m.citations.filter(isString) : [],
            origin: ORIGINS.has(m.origin) ? m.origin : 'unknown',
            createdAt: m.createdAt,
          },
    ),
  }
}

const RESTORERS = {
  studyGuide: (data) => normalizeStudyGuide(data),
  flashcards: (data) => normalizeFlashcards({ flashcards: data?.cards }, data?.requestedCount),
  quiz: (data) => normalizeQuiz(data, { requestedCount: data?.requestedCount, difficulty: data?.difficulty }),
  chat: restoreChat,
}

/** Restore one document's results ({ [kind]: result }); unknown kinds and invalid data are dropped. */
export function restoreResults(raw) {
  if (!raw || typeof raw !== 'object') return null
  const restored = {}
  for (const [kind, result] of Object.entries(raw)) {
    const restore = RESTORERS[kind]
    if (!restore || !result || !isString(result.setId)) continue
    let data
    try {
      data = restore(result.data)
    } catch {
      data = null
    }
    if (!data) continue
    restored[kind] = {
      data,
      origin: ORIGINS.has(result.origin) ? result.origin : 'unknown',
      setId: result.setId,
      generatedAt: isIsoDate(result.generatedAt) ? result.generatedAt : new Date().toISOString(),
      // Progress is validated again by each session's restore function when it is used.
      progress: result.progress && typeof result.progress === 'object' ? result.progress : null,
    }
  }
  return Object.keys(restored).length ? restored : null
}

/**
 * Rebuild app state from stored records. Documents follow the saved order (newest first);
 * results without a matching document are discarded; the active id must still exist.
 */
export function restoreState({ documents: rawDocs = [], results: rawResults = {}, order = [], activeId = null }) {
  const byId = new Map()
  for (const raw of rawDocs) {
    const doc = restoreDocument(raw)
    if (doc) byId.set(doc.id, doc)
  }
  const ordered = (Array.isArray(order) ? order : []).filter((id) => byId.has(id))
  const unordered = [...byId.keys()].filter((id) => !ordered.includes(id))
  const documents = [...ordered, ...unordered].map((id) => byId.get(id))

  const results = {}
  for (const [documentId, raw] of Object.entries(rawResults)) {
    if (!byId.has(documentId)) continue
    const restored = restoreResults(raw)
    if (restored) results[documentId] = restored
  }

  return { documents, results, activeId: byId.has(activeId) ? activeId : null }
}
