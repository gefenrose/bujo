import type { Journal } from '../hooks/useJournal'
import type { Filter } from '../types'
import { todayISO } from '../lib/date'
import { sortByOrder } from '../lib/entries'
import { matchesFilter } from '../lib/filters'
import { EntryList } from './EntryList'

interface FilterViewProps {
  journal: Journal
  filter: Filter
  onTagClick: (tag: string) => void
}

/** A saved smart-list: all entries (any date/collection) matching a filter's criteria. */
export function FilterView({ journal, filter, onTagClick }: FilterViewProps) {
  const entries = sortByOrder(journal.entries.filter((e) => matchesFilter(e, filter)))

  return (
    <div>
      <h1 className="mb-6 hidden text-lg font-medium tracking-tight text-ink dark:text-inkdark sm:block">
        {filter.name}
      </h1>

      <EntryList
        journal={journal}
        entries={entries}
        onMigrate={(entry) => journal.migrateEntry(entry.id, { toDate: todayISO() })}
        onAdd={(text, type, time) => {
          const id = journal.addEntry({ text, type: filter.type ?? type, time })
          if (!id) return
          if (filter.tag) journal.addTag(id, filter.tag)
          if (filter.priorityOnly) journal.togglePriority(id)
        }}
        onTagClick={onTagClick}
        emptyMessage="אין רשומות התואמות לסינון הזה."
      />
    </div>
  )
}
