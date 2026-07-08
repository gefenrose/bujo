import type { Entry, Filter } from '../types'

/** Whether an entry satisfies a saved filter's criteria (all set criteria must match). */
export function matchesFilter(entry: Entry, filter: Filter): boolean {
  if (filter.type && entry.type !== filter.type) return false
  if (filter.priorityOnly && !entry.priority) return false
  if (filter.tag && !(entry.tags ?? []).includes(filter.tag)) return false
  return true
}

/** All distinct tags currently used across entries, alphabetically sorted. */
export function allUsedTags(entries: Entry[]): string[] {
  const set = new Set<string>()
  for (const entry of entries) for (const tag of entry.tags ?? []) set.add(tag)
  return [...set].sort((a, b) => a.localeCompare(b))
}
