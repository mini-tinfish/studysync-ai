import { useCallback, useRef, useState } from 'react'
import MobileHeader from './MobileHeader'
import Sidebar from './Sidebar'

export default function AppLayout({ activeRoute, children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuButtonRef = useRef(null)

  // Dismissed via close button, backdrop, or Escape: return focus to the trigger.
  const dismissMenu = useCallback(() => {
    setIsMenuOpen(false)
    requestAnimationFrame(() => menuButtonRef.current?.focus())
  }, [])

  // Closed by choosing a destination: the new page receives focus instead.
  const closeMenuOnNavigate = useCallback(() => setIsMenuOpen(false), [])

  return (
    <div className="min-h-screen bg-cream-50">
      <a
        href="#main-content"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
        className="sr-only z-50 rounded-lg bg-white px-4 py-2 font-semibold text-lavender-700 shadow-lift focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>

      <Sidebar
        activeRoute={activeRoute}
        isOpen={isMenuOpen}
        onDismiss={dismissMenu}
        onNavigate={closeMenuOnNavigate}
      />

      <div className="lg:pl-64">
        <MobileHeader
          onOpenMenu={() => setIsMenuOpen(true)}
          isMenuOpen={isMenuOpen}
          menuButtonRef={menuButtonRef}
        />
        <main id="main-content" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-8 outline-none sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  )
}
