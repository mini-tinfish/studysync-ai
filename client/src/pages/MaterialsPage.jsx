import { useEffect, useRef } from 'react'
import PageHeader from '../components/common/PageHeader'
import AddMaterialTabs from '../components/materials/AddMaterialTabs'
import DocumentLibrary from '../components/materials/DocumentLibrary'
import StudyActions from '../components/materials/StudyActions'
import { useMaterials } from '../context/materialsContext'

export default function MaterialsPage() {
  const { documents, activeDocument, addDocument, removeDocument, selectDocument } = useMaterials()
  const actionsHeadingRef = useRef(null)
  const focusActionsOnRender = useRef(false)

  // When a student picks a document from the library, bring the study actions into view.
  useEffect(() => {
    if (focusActionsOnRender.current && activeDocument) {
      focusActionsOnRender.current = false
      actionsHeadingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      actionsHeadingRef.current?.focus({ preventScroll: true })
    }
  }, [activeDocument])

  function handleSelect(id) {
    focusActionsOnRender.current = true
    selectDocument(id)
  }

  return (
    <>
      <PageHeader
        eyebrow="My Materials"
        title="Your study materials"
        description="Upload a document or paste your class notes, then pick one to study."
      />

      <div className="space-y-10">
        <AddMaterialTabs onAdded={addDocument} />

        {activeDocument && <StudyActions document={activeDocument} headingRef={actionsHeadingRef} />}

        <DocumentLibrary
          documents={documents}
          activeId={activeDocument?.id ?? null}
          onSelect={handleSelect}
          onRemove={removeDocument}
        />
      </div>
    </>
  )
}
