import { useRef, useState } from 'react'
import { ClipboardPaste, CloudUpload } from 'lucide-react'
import PasteNotesForm from './PasteNotesForm'
import UploadDropzone from './UploadDropzone'

const TABS = [
  { id: 'upload', label: 'Upload a file', icon: CloudUpload },
  { id: 'paste', label: 'Paste notes', icon: ClipboardPaste },
]

/**
 * Accessible tabs (WAI-ARIA tabs pattern: arrow keys / Home / End move between tabs).
 * Both panels stay mounted so a half-written note survives switching tabs.
 */
export default function AddMaterialTabs({ onAdded }) {
  const [activeTab, setActiveTab] = useState('upload')
  const tabRefs = useRef({})

  function handleKeyDown(event) {
    const index = TABS.findIndex((tab) => tab.id === activeTab)
    const nextIndex = {
      ArrowRight: (index + 1) % TABS.length,
      ArrowLeft: (index - 1 + TABS.length) % TABS.length,
      Home: 0,
      End: TABS.length - 1,
    }[event.key]
    if (nextIndex === undefined) return
    event.preventDefault()
    const nextId = TABS[nextIndex].id
    setActiveTab(nextId)
    tabRefs.current[nextId]?.focus()
  }

  return (
    <section aria-labelledby="add-material-title">
      <h2 id="add-material-title" className="mb-4 text-lg font-bold tracking-tight text-ink-900">
        Add study material
      </h2>

      <div
        role="tablist"
        aria-label="Ways to add study material"
        onKeyDown={handleKeyDown}
        className="mb-4 inline-flex gap-1 rounded-2xl bg-cream-100 p-1 ring-1 ring-cream-200"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const selected = id === activeTab
          return (
            <button
              key={id}
              ref={(el) => (tabRefs.current[id] = el)}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={selected}
              aria-controls={`panel-${id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveTab(id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition duration-200 ${
                selected ? 'bg-white text-lavender-700 shadow-soft' : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </button>
          )
        })}
      </div>

      <div role="tabpanel" id="panel-upload" aria-labelledby="tab-upload" hidden={activeTab !== 'upload'}>
        <UploadDropzone onUploaded={onAdded} />
      </div>
      <div role="tabpanel" id="panel-paste" aria-labelledby="tab-paste" hidden={activeTab !== 'paste'}>
        <PasteNotesForm onSaved={onAdded} />
      </div>
    </section>
  )
}
