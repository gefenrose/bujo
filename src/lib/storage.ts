import type { JournalData, Prompt } from '../types'

const STORAGE_KEY = 'bujo:data:v1'

const DEFAULT_PROMPT_TEXTS = ['על מה אני אסיר תודה?', 'מה הלך טוב היום?', 'מה המיקוד שלי היום?', 'מה למדתי היום?']

function defaultPrompts(): Prompt[] {
  return DEFAULT_PROMPT_TEXTS.map((text, i) => ({ id: genId(), text, order: i, createdAt: Date.now() }))
}

const EMPTY: JournalData = {
  entries: [],
  collections: [],
  habits: [],
  habitLogs: [],
  moodLogs: [],
  prompts: [],
  promptResponses: [],
  filters: [],
  pinnedTags: [],
}

/** Tolerantly coerces arbitrary parsed JSON (localStorage, or a restored backup) into JournalData. */
export function normalizeJournalData(parsed: unknown): JournalData {
  const p = (parsed && typeof parsed === 'object' ? parsed : {}) as Record<string, unknown>
  return {
    entries: Array.isArray(p.entries) ? (p.entries as JournalData['entries']) : [],
    collections: Array.isArray(p.collections) ? (p.collections as JournalData['collections']) : [],
    habits: Array.isArray(p.habits) ? (p.habits as JournalData['habits']) : [],
    habitLogs: Array.isArray(p.habitLogs) ? (p.habitLogs as JournalData['habitLogs']) : [],
    moodLogs: Array.isArray(p.moodLogs) ? (p.moodLogs as JournalData['moodLogs']) : [],
    prompts: Array.isArray(p.prompts) ? (p.prompts as JournalData['prompts']) : [],
    promptResponses: Array.isArray(p.promptResponses) ? (p.promptResponses as JournalData['promptResponses']) : [],
    filters: Array.isArray(p.filters) ? (p.filters as JournalData['filters']) : [],
    pinnedTags: Array.isArray(p.pinnedTags) ? (p.pinnedTags as JournalData['pinnedTags']) : [],
  }
}

export function loadJournal(): JournalData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...EMPTY, prompts: defaultPrompts() }
    return normalizeJournalData(JSON.parse(raw))
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
