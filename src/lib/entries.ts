import type { Entry, EntryType } from '../types'

export function entryOrder(e: Entry): number {
  return e.order ?? e.createdAt
}

export function sortByOrder(entries: Entry[]): Entry[] {
  return [...entries].sort((a, b) => entryOrder(a) - entryOrder(b))
}

/** The next order value for an entry being appended to this scope's list (same date or collection). */
export function nextOrder(scopeEntries: Entry[]): number {
  if (scopeEntries.length === 0) return 0
  return Math.max(...scopeEntries.map(entryOrder)) + 1
}

export function nextEntryType(type: EntryType): EntryType {
  if (type === 'task') return 'event'
  if (type === 'event') return 'note'
  return 'task'
}
