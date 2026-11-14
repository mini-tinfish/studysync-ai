import { useEffect, useRef } from 'react'
import LoadingState from './components/common/LoadingState'
import StorageNotice from './components/common/StorageNotice'
import AppLayout from './components/layout/AppLayout'
import { preloadNotesEditor, whenIdle } from './components/notes/editorLoader'
import { NAV_ITEMS } from './config/navigation'
import MaterialsProvider from './context/MaterialsProvider'
import { useMaterials } from './context/materialsContext'
import { useHashRoute } from './hooks/useHashRoute'
import AskNotesPage from './pages/AskNotesPage'
import DashboardPage from './pages/DashboardPage'
import FlashcardsPage from './pages/FlashcardsPage'
import MaterialsPage from './pages/MaterialsPage'
import QuizPage from './pages/QuizPage'
import StudyGuidePage from './pages/StudyGuidePage'

const PAGES = {
  dashboard: DashboardPage,
  materials: MaterialsPage,
  'study-guide': StudyGuidePage,
  flashcards: FlashcardsPage,
  quiz: QuizPage,
  ask: AskNotesPage,
}

export default function App() {
  const [route] = useHashRoute()
  const isFirstRender = useRef(true)
  const Page = PAGES[route]

  useEffect(() => {
    const label = NAV_ITEMS.find((item) => item.id === route)?.label
    document.title = label ? `${label} · StudySync AI` : 'StudySync AI'

    // After client-side navigation, move focus to the new page heading
    // so keyboard and screen reader users land in the right place.
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    window.scrollTo({ top: 0 })
    document.querySelector('#main-content h1')?.focus()
  }, [route])

  return (
    // MaterialsProvider sits above the pages so documents and the active selection
    // survive navigation between views (and are restored from browser storage on load).
    <MaterialsProvider>
      <AppLayout activeRoute={route}>
        <StorageNotice />
        <RestoringGate>
          <Page />
        </RestoringGate>
      </AppLayout>
    </MaterialsProvider>
  )
}

/** While saved materials are being restored, show a loading state instead of the page. */
function RestoringGate({ children }) {
  const { isRestoring } = useMaterials()

  // Once the app is up, fetch the rich-text editor's code in idle time so opening
  // Paste notes / Edit doesn't wait for it (see components/notes/editorLoader.js).
  useEffect(() => {
    if (!isRestoring) return whenIdle(preloadNotesEditor)
  }, [isRestoring])

  if (isRestoring) return <LoadingState label="Restoring your study materials…" className="min-h-[50vh]" />
  return children
}
