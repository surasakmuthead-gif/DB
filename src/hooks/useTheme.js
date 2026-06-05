import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'baac-kpi-theme'
const THEMES = ['dark', 'light', 'colorful']

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return THEMES.includes(saved) ? saved : 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const setTheme = useCallback((t) => {
    if (THEMES.includes(t)) setThemeState(t)
  }, [])

  const cycleTheme = useCallback(() => {
    setThemeState(prev => {
      const idx = THEMES.indexOf(prev)
      return THEMES[(idx + 1) % THEMES.length]
    })
  }, [])

  return { theme, setTheme, cycleTheme, themes: THEMES }
}
