import { createContext, useContext } from 'react'

export const MaterialsContext = createContext(null)

/**
 * { documents, activeDocument, addDocument, updateDocument, removeDocument, selectDocument,
 *   saveResult, saveProgress, getResult, getResultKinds, getNotesDraft, setNotesDraft }
 * getResult(documentId, kind) → { data, origin, setId, generatedAt, progress } | null
 * updateDocument(id, changes) → { updated, clearedKinds } (text changes clear results)
 * Ask My Notes: appendChatMessages(documentId, messages, { sourceText }) → saved?,
 *   clearChat(documentId), getChatDraft(documentId), setChatDraft(documentId, text).
 *   The conversation is getResult(documentId, 'chat').data.messages.
 */
export function useMaterials() {
  const context = useContext(MaterialsContext)
  if (!context) throw new Error('useMaterials must be used inside <MaterialsProvider>')
  return context
}
