import type { Journal } from '../hooks/useJournal'
import { todayISO } from '../lib/date'
import { sortByOrder } from '../lib/entries'
import { EntryList } from './EntryList'

interface InboxProps {
  journal: Journal
  onTagClick: (tag: string) => void
}

export function Inbox({ journal, onTagClick }: InboxProps) {
  const entries = sortByOrder(journal.entries.filter((e) => !e.date && !e.collectionId))

  return (
    <div>
      <h1 className="mb-6 text-lg font-medium tracking-tight text-ink dark:text-inkdark">תיבת קלט</h1>

      <EntryList
        journal={journal}
        entries={entries}
        onMigrate={(entry) => journal.migrateEntry(entry.id, { toDate: todayISO() })}
        onAdd={(text, type, time) => journal.addEntry({ text, type, time })}
        onTagClick={onTagClick}
        emptyMessage="תיבת הקלט ריקה — רעיונות ומשימות שטרם מוינו יופיעו כאן."
      />
    </div>
  )
}
