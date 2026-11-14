const asString = (value) => (typeof value === 'string' ? value.trim() : '')
const asStringArray = (value) => (Array.isArray(value) ? value.map(asString).filter(Boolean) : [])

/**
 * Defensive normalization of a POST /api/study-guide response. The contract defines
 * the shape, but AI output can still be uneven, so missing fields become empty values
 * instead of crashing the UI.
 */
export function normalizeStudyGuide(raw) {
  const guide = raw && typeof raw === 'object' ? raw : {}
  return {
    title: asString(guide.title) || 'Study guide',
    summary: asString(guide.summary),
    sections: (Array.isArray(guide.sections) ? guide.sections : [])
      .map((section) => ({
        heading: asString(section?.heading),
        content: asString(section?.content),
        keyPoints: asStringArray(section?.keyPoints),
      }))
      .filter((section) => section.heading || section.content || section.keyPoints.length),
    keyTerms: (Array.isArray(guide.keyTerms) ? guide.keyTerms : [])
      .map((item) => ({ term: asString(item?.term), definition: asString(item?.definition) }))
      .filter((item) => item.term),
    reviewQuestions: asStringArray(guide.reviewQuestions),
  }
}

/** Title hint for the API: the document name without its file extension (contract max 200 chars). */
export function titleHintFor(doc) {
  const name = doc.source === 'paste' ? doc.fileName : doc.fileName.replace(/\.(pdf|txt|md)$/i, '')
  return name.trim().slice(0, 200)
}
