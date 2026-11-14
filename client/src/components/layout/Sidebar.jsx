import { useEffect, useRef } from 'react'
import { Info, X } from 'lucide-react'
import { NAV_ITEMS, routeHref } from '../../config/navigation'
import Logo from '../common/Logo'

export default function Sidebar({ activeRoute, isOpen, onDismiss, onNavigate }) {
  const closeButtonRef = useRef(null)

  // Mobile drawer: move focus in on open, close on Escape.
  useEffect(() => {
    if (!isOpen) return
    closeButtonRef.current?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onDismiss()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onDismiss])

  return (
    <>
      {/* Mobile backdrop */}
      <div
        aria-hidden="true"
        onClick={onDismiss}
        className={`fixed inset-0 z-30 bg-lavender-900/30 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        id="app-sidebar"
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-cream-200 bg-cream-100 transition-[transform,visibility] duration-300 ease-out lg:visible lg:w-64 lg:translate-x-0 ${
          isOpen ? 'visible translate-x-0 shadow-lift' : 'invisible -translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5 lg:h-20">
          <a
            href={routeHref('dashboard')}
            onClick={onNavigate}
            className="rounded-lg"
            aria-label="StudySync AI home"
          >
            <Logo />
          </a>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onDismiss}
            className="grid size-9 place-items-center rounded-lg text-ink-500 transition hover:bg-lavender-100 hover:text-lavender-700 lg:hidden"
            aria-label="Close navigation menu"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="space-y-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const isActive = id === activeRoute
              return (
                <li key={id}>
                  <a
                    href={routeHref(id)}
                    onClick={onNavigate}
                    aria-current={isActive ? 'page' : undefined}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200 ${
                      isActive
                        ? 'bg-white text-lavender-700 shadow-soft'
                        : 'text-ink-500 hover:bg-white/70 hover:text-ink-900'
                    }`}
                  >
                    <span
                      className={`grid size-8 place-items-center rounded-lg transition ${
                        isActive
                          ? 'bg-lavender-100 text-lavender-600'
                          : 'text-ink-400 group-hover:bg-lavender-50 group-hover:text-lavender-500'
                      }`}
                    >
                      <Icon className="size-[18px]" aria-hidden="true" />
                    </span>
                    {label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="m-3 rounded-2xl bg-lavender-50 p-4 ring-1 ring-lavender-100">
          <p className="flex items-start gap-2 text-xs leading-relaxed text-lavender-800">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              <strong className="font-semibold">Preview build.</strong> Uploads and AI features aren&rsquo;t
              connected yet.
            </span>
          </p>
        </div>
      </aside>
    </>
  )
}
