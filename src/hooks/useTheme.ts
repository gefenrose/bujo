import { useEffect, useState } from 'react'
import { usePreferences } from './usePreferences'

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useTheme() {
  const { preferences, updatePreferences } = usePreferences()
  const [systemDark, setSystemDark] = useState(systemPrefersDark)

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => setSystemDark(mql.matches)
    mql.addEventListener('change', listener)
    return () => mql.removeEventListener('change', listener)
  }, [])

  const theme: 'light' | 'dark' =
    preferences.themeMode === 'system' ? (systemDark ? 'dark' : 'light') : preferences.themeMode

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggle = () => updatePreferences({ themeMode: theme === 'dark' ? 'light' : 'dark' })

  return { theme, toggle }
}
