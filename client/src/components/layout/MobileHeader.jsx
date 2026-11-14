import { Menu } from 'lucide-react'
import Logo from '../common/Logo'

export default function MobileHeader({ onOpenMenu, isMenuOpen, menuButtonRef }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-cream-200 bg-cream-50/90 px-4 backdrop-blur lg:hidden">
      <button
        ref={menuButtonRef}
        type="button"
        onClick={onOpenMenu}
        aria-controls="app-sidebar"
        aria-expanded={isMenuOpen}
        aria-label="Open navigation menu"
        className="grid size-10 place-items-center rounded-xl text-ink-700 transition hover:bg-lavender-100 hover:text-lavender-700"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>
      <Logo />
    </header>
  )
}
