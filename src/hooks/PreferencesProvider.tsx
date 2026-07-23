import { useEffect, useState, type ReactNode } from 'react'
import {
  FONT_WEIGHT_VALUE,
  TEXT_SIZE_PX,
  loadPreferences,
  savePreferences,
  type Preferences,
} from '../lib/preferences'
import { PreferencesContext } from './usePreferences'

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(() => ({ ...loadPreferences(), themeMode: 'light' }))

  useEffect(() => {
    savePreferences(preferences)
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = 'light'
    document.documentElement.style.fontSize = `${TEXT_SIZE_PX[preferences.textSize]}px`
    document.documentElement.style.setProperty('--content-font-weight', String(FONT_WEIGHT_VALUE[preferences.fontWeight]))
  }, [preferences])

  const updatePreferences = (patch: Partial<Preferences>) => setPreferences((prev) => ({ ...prev, ...patch }))

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences }}>{children}</PreferencesContext.Provider>
  )
}
