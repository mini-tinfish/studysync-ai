import { createContext, useContext } from 'react'

export const MaterialsContext = createContext(null)

/**
 * { documents, activeDocument, addDocument, removeDocument, selectDocument,
 *   saveResult, saveProgress, getResult }
 * getResult(documentId, kind) → { data, origin, setId, generatedAt, progress } | null
 */
export function useMaterials() {
  const context = useContext(MaterialsContext)
  if (!context) throw new Error('useMaterials must be used inside <MaterialsProvider>')
  return context
}
