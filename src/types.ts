export type EntryType = 'task' | 'event' | 'note'

export type TaskStatus = 'open' | 'done' | 'migrated' | 'cancelled'

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
  createdAt: number
}

export interface Collection {
  id: string
  name: string
  createdAt: number
}

export interface JournalData {
  entries: Entry[]
  collections: Collection[]
}
