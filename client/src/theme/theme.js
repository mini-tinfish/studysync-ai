/**
 * Light/dark theme. The theme is a `dark` class on <html>; all colors come from CSS
 * variables in index.css that change under that class. The same logic runs as an inline
 * script in index.html before React loads, so the first paint already has the right theme.
 */
export const THEME_STORAGE_KEY = 'studysync-theme'

/** The saved explicit choice ('light' | 'dark'), or null if the student never picked one. */
export function getSavedTheme() {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null // storage blocked
  }
}

export function saveTheme(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Storage blocked: the choice still applies until the page is reloaded.
  }
}

const darkQuery = () => window.matchMedia?.('(prefers-color-scheme: dark)')

export const getSystemTheme = () => (darkQuery()?.matches ? 'dark' : 'light')

export function applyTheme(theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
}

/** Subscribe to OS theme changes; returns an unsubscribe function. */
export function onSystemThemeChange(listener) {
  const query = darkQuery()
  if (!query) return () => {}
  const handler = (event) => listener(event.matches ? 'dark' : 'light')
  query.addEventListener('change', handler)
  return () => query.removeEventListener('change', handler)
}
