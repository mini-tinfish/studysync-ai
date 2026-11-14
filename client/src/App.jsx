import { useEffect, useRef } from 'react'
import AppLayout from './components/layout/AppLayout'
import { NAV_ITEMS } from './config/navigation'
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

// No backend yet: materials stay empty so the UI shows its empty states.
// Replace with data from the API once the contract is agreed.
const materials = []

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
    <AppLayout activeRoute={route}>
      <Page materials={materials} />
    </AppLayout>
  )
}
