import { useCallback, useEffect, useRef, useState } from 'react'
import InlineAlert from '../components/common/InlineAlert'
import PageHeader from '../components/common/PageHeader'
import AddMaterialTabs from '../components/materials/AddMaterialTabs'
import DocumentLibrary from '../components/materials/DocumentLibrary'
import StudyActions from '../components/materials/StudyActions'
import NotesComposer from '../components/notes/NotesComposer'
import { focusEditor } from '../components/notes/editorReady'
import { useMaterials } from '../context/materialsContext'

export default function MaterialsPage() {
  const { documents, activeDocument, addDocument, removeDocument, selectDocument, getNotesDraft } = useMaterials()
  const actionsHeadingRef = useRef(null)
  const focusActionsOnRender = useRef(false)

  // Reopen on the notes tab if there is an unsaved draft from earlier.
  const [activeTab, setActiveTab] = useState(() => (getNotesDraft() ? 'paste' : 'upload'))
  const [editingId, setEditingId] = useState(null)
  const [pendingEditId, setPendingEditId] = useState(null)
  const isEditorDirty = useRef(false)
  const editorRef = useRef(null)
  const addSectionRef = useRef(null)

  const editingDocument = documents.find((doc) => doc.id === editingId) ?? null
  const pendingEditDocument = documents.find((doc) => doc.id === pendingEditId) ?? null

  // When a student picks a document from the library, bring the study actions into view.
  useEffect(() => {
    if (focusActionsOnRender.current && activeDocument) {
      focusActionsOnRender.current = false
      actionsHeadingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      actionsHeadingRef.current?.focus({ preventScroll: true })
    }
  }, [activeDocument])

  // Opening a note for editing: bring the editor into view. NotesComposer moves the
  // cursor into the editor once it has loaded.
  useEffect(() => {
    if (editingId) addSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [editingId])

  function handleSelect(id) {
    focusActionsOnRender.current = true
    selectDocument(id)
  }

  function startEditing(id) {
    setPendingEditId(null)
    setEditingId(id)
    setActiveTab('paste')
  }

  function handleEditRequest(id) {
    if (id === editingId) {
      setActiveTab('paste')
      focusEditor(editorRef.current)
      return
    }
    // Switching away from a note with unsaved edits needs confirmation.
    if (editingId && isEditorDirty.current) {
      setActiveTab('paste')
      setPendingEditId(id)
      return
    }
    startEditing(id)
  }

  const exitEditing = useCallback(() => {
    setEditingId(null)
    setPendingEditId(null)
  }, [])

  const handleDirtyChange = useCallback((dirty) => {
    isEditorDirty.current = dirty
  }, [])

  function handleRemove(id) {
    if (id === editingId) exitEditing()
    if (id === pendingEditId) setPendingEditId(null)
    removeDocument(id)
  }

  const pendingSwitch = pendingEditDocument && editingDocument && (
    <InlineAlert
      variant="warning"
      title="You have unsaved changes"
      action={
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => startEditing(pendingEditDocument.id)}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-300 transition hover:bg-amber-100"
          >
            Discard changes and edit &ldquo;{pendingEditDocument.fileName}&rdquo;
          </button>
          <button
            type="button"
            onClick={() => {
              setPendingEditId(null)
              focusEditor(editorRef.current)
            }}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-100"
          >
            Keep editing &ldquo;{editingDocument.fileName}&rdquo;
          </button>
        </div>
      }
    >
      Your edits to &ldquo;{editingDocument.fileName}&rdquo; haven&rsquo;t been saved.
    </InlineAlert>
  )

  return (
    <>
      <PageHeader
        eyebrow="My Materials"
        title="Your study materials"
        description="Upload a document or write your class notes, then pick one to study."
      />

      <div className="space-y-10">
        <div ref={addSectionRef} className="scroll-mt-6">
          <AddMaterialTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onAdded={addDocument}
            notesPanel={
              <NotesComposer
                editingDocument={editingDocument}
                onExitEdit={exitEditing}
                onDirtyChange={handleDirtyChange}
                editorRef={editorRef}
                pendingSwitch={pendingSwitch}
              />
            }
          />
        </div>

        {activeDocument && <StudyActions document={activeDocument} headingRef={actionsHeadingRef} />}

        <DocumentLibrary
          documents={documents}
          activeId={activeDocument?.id ?? null}
          editingId={editingId}
          onSelect={handleSelect}
          onRemove={handleRemove}
          onEdit={handleEditRequest}
        />
      </div>
    </>
  )
}
