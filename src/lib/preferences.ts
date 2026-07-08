import type { EntryType } from '../types'

export type ThemeMode = 'system' | 'light' | 'dark'
export type TextSize = 'small' | 'medium' | 'large'
export type FontWeight = 'light' | 'regular' | 'bold'
export type EntryColorStyle = 'none' | 'icon' | 'titleAndIcon'
export type IconShape = 'square' | 'circle' | 'triangle' | 'dot' | 'dash' | 'calendar'
export type ImageLayoutMode = 'hidden' | 'thumbnails'
export type TimeFormat = '24h' | '12h'

export interface Preferences {
  themeMode: ThemeMode
  textSize: TextSize
  fontWeight: FontWeight
  entryColorStyle: EntryColorStyle
  entryIcons: Record<EntryType, IconShape>
  defaultEntryType: EntryType
  /** 0 = Sunday, 1 = Monday */
  startOfWeek: 0 | 1
  timeFormat: TimeFormat
  showIncompleteCount: boolean
  autoAssignColors: boolean
  showSubtasksByDefault: boolean
  imageLayout: Record<EntryType, ImageLayoutMode>
  /** "HH:MM", or null to turn off */
  dailyReminderTime: string | null
  /** minutes before a timed entry/habit to fire its reminder, or null for "at the exact time" */
  reminderMinutesBefore: number | null
}

const STORAGE_KEY = 'bujo:preferences:v1'

export const DEFAULT_PREFERENCES: Preferences = {
  themeMode: 'system',
  textSize: 'medium',
  fontWeight: 'regular',
  entryColorStyle: 'titleAndIcon',
  entryIcons: { task: 'dot', event: 'circle', note: 'dash' },
  defaultEntryType: 'task',
  startOfWeek: 0,
  timeFormat: '24h',
  showIncompleteCount: true,
  autoAssignColors: true,
  showSubtasksByDefault: false,
  imageLayout: { task: 'hidden', event: 'thumbnails', note: 'thumbnails' },
  dailyReminderTime: null,
  reminderMinutesBefore: null,
}

export function loadPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PREFERENCES
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      entryIcons: { ...DEFAULT_PREFERENCES.entryIcons, ...parsed.entryIcons },
      imageLayout: { ...DEFAULT_PREFERENCES.imageLayout, ...parsed.imageLayout },
    }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export function savePreferences(prefs: Preferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}

export const TEXT_SIZE_PX: Record<TextSize, number> = { small: 14, medium: 16, large: 18 }
export const FONT_WEIGHT_VALUE: Record<FontWeight, number> = { light: 300, regular: 400, bold: 600 }
