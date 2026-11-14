import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

/** Light/dark switch for the bottom of the sidebar. */
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="group m-3 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-ink-700 ring-1 ring-cream-200 transition hover:bg-white hover:ring-lavender-200"
    >
      <span className="relative grid size-8 place-items-center rounded-lg bg-lavender-100 text-lavender-700">
        {isDark ? <Moon className="size-[18px]" aria-hidden="true" /> : <Sun className="size-[18px]" aria-hidden="true" />}
      </span>
      <span className="flex-1 text-left">Dark mode</span>
      {/* Visual switch track; state is exposed via role="switch" + aria-checked. */}
      <span
        aria-hidden="true"
        className={`relative h-5 w-9 rounded-full transition-colors ${isDark ? 'bg-lavender-600' : 'bg-cream-300'}`}
      >
        <span
          className={`absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-soft transition-transform ${
            isDark ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  )
}
