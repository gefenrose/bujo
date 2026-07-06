import type { JournalData } from '../types'

const STORAGE_KEY = 'bujo:data:v1'

const EMPTY: JournalData = { entries: [], collections: [] }

export function loadJournal(): JournalData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw)
    return {
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
      collections: Array.isArray(parsed.collections) ? parsed.collections : [],
    }
  } catch {
    return EMPTY
  }
}

export function saveJournal(data: JournalData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function genId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}
