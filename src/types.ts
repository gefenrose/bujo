export type EntryType = 'task' | 'event' | 'note'

export type TaskStatus = 'open' | 'done' | 'migrated' | 'cancelled'

export interface SubTask {
  id: string
  text: string
  done: boolean
}

export interface Entry {
  id: string
  type: EntryType
  text: string
  status: TaskStatus
  priority: boolean
  /** ISO date (YYYY-MM-DD) the entry lives under, for daily-log entries */
  date?: string
  /** collection id the entry lives under, for collection entries */
  collectionId?: string
  /** id of the entry this one was migrated from, forming a migration chain */
  migratedFromId?: string
  /** manual sort position within its scope (date or collection); falls back to createdAt for legacy entries */
  order?: number
  /** optional time of day (HH:MM, 24h) */
  time?: string
  /** checkable sub-items, indented under this entry (tasks only) */
  subtasks?: SubTask[]
  /** freeform labels, normalized lowercase/trimmed, cross-cutting across dates and collections */
  tags?: string[]
  createdAt: number
}

export interface Collection {
  id: string
  name: string
  createdAt: number
}

export type HabitType = 'check' | 'count'

export interface Habit {
  id: string
  name: string
  type: HabitType
  /** for 'count' habits: the daily goal, used both as the color-intensity ceiling and a sensible default target */
  target?: number
  /** weekdays this habit is scheduled on (0=Sun..6=Sat); undefined or all 7 means every day */
  days?: number[]
  /** optional reminder time of day (HH:MM, 24h) */
  time?: string
  createdAt: number
}

export interface HabitLog {
  id: string
  habitId: string
  /** ISO date (YYYY-MM-DD) */
  date: string
  value: number
}

export interface MoodLog {
  id: string
  /** ISO date (YYYY-MM-DD) */
  date: string
  /** 1 (worst) .. 5 (best) */
  value: number
}

export interface JournalData {
  entries: Entry[]
  collections: Collection[]
  habits: Habit[]
  habitLogs: HabitLog[]
  moodLogs: MoodLog[]
}
