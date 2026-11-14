import { useCallback, useEffect, useState } from 'react'
import { applyTheme, getSavedTheme, getSystemTheme, onSystemThemeChange, saveTheme } from '../theme/theme'

/**
 * Current theme plus a setter. First use follows the system theme (and keeps following it
 * while the student hasn't chosen); an explicit choice is saved and wins from then on.
 */
export function useTheme() {
  const [theme, setThemeState] = useState(() => getSavedTheme() ?? getSystemTheme())
  const [isExplicit, setIsExplicit] = useState(() => getSavedTheme() !== null)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    if (isExplicit) return undefined
    return onSystemThemeChange(setThemeState)
  }, [isExplicit])

  const setTheme = useCallback((next) => {
    saveTheme(next)
    setIsExplicit(true)
    setThemeState(next)
  }, [])

  return { theme, setTheme, isExplicit }
}
