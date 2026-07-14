import { createContext, useContext } from 'react'
import {
  DEFAULT_PREFERENCES,
  type Preferences,
} from '../lib/preferences'

export interface PreferencesContextValue {
  preferences: Preferences
  updatePreferences: (patch: Partial<Preferences>) => void
}

export const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext)
  if (!ctx) return { preferences: DEFAULT_PREFERENCES, updatePreferences: () => {} }
  return ctx
}
