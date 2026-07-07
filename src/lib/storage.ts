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
}

export function loadJournal(): JournalData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...EMPTY, prompts: defaultPrompts() }
    const parsed = JSON.parse(raw)
    return {
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
      collections: Array.isArray(parsed.collections) ? parsed.collections : [],
      habits: Array.isArray(parsed.habits) ? parsed.habits : [],
      habitLogs: Array.isArray(parsed.habitLogs) ? parsed.habitLogs : [],
      moodLogs: Array.isArray(parsed.moodLogs) ? parsed.moodLogs : [],
      prompts: Array.isArray(parsed.prompts) ? parsed.prompts : [],
      promptResponses: Array.isArray(parsed.promptResponses) ? parsed.promptResponses : [],
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
