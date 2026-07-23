import { useEffect } from 'react'
import { usePreferences } from './usePreferences'

export function useTheme() {
  const { updatePreferences } = usePreferences()

  useEffect(() => {
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = 'light'
  }, [])

  const theme = 'light' as const
  const toggle = () => updatePreferences({ themeMode: 'light' })

  return { theme, toggle }
}
