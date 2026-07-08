import { useState } from 'react'
import type { Journal } from '../hooks/useJournal'
import { todayISO } from '../lib/date'
import { sortByOrder } from '../lib/entries'
import { EntryList } from './EntryList'

interface CollectionsProps {
  journal: Journal
  selectedId: string | null
  onTagClick: (tag: string) => void
}

export function Collections({ journal, selectedId, onTagClick }: CollectionsProps) {
  const [editingName, setEditingName] = useState(false)
  const [renameDraft, setRenameDraft] = useState('')

  const selected = journal.collections.find((c) => c.id === selectedId) ?? journal.collections[0] ?? null

  const startRename = () => {
    if (!selected) return
    setRenameDraft(selected.name)
    setEditingName(true)
  }

  const commitRename = () => {
    setEditingName(false)
    if (!selected) return
    const trimmed = renameDraft.trim()
    if (trimmed && trimmed !== selected.name) journal.renameCollection(selected.id, trimmed)
  }

  const entries = selected ? sortByOrder(journal.entries.filter((e) => e.collectionId === selected.id)) : []

  if (!selected) {
    return (
      <p className="text-sm text-ink/60 dark:text-inkdark/60">
        כדאי ליצור אוסף למעקב אחר ספרים, רעיונות, מטרות, או כל דבר אחר מחוץ לשגרת היומיום — אפשר להוסיף אחד בסרגל הצד.
      </p>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        {editingName ? (
          <input
            autoFocus
            value={renameDraft}
            onChange={(e) => setRenameDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename()
              if (e.key === 'Escape') setEditingName(false)
            }}
            className="min-w-0 flex-1 bg-transparent text-lg font-medium tracking-tight text-ink outline-none dark:text-inkdark"
          />
        ) : (
          <button
            type="button"
            onClick={startRename}
            className="min-w-0 flex-1 truncate text-start text-lg font-medium tracking-tight text-ink hover:opacity-70 dark:text-inkdark"
          >
            {selected.name}
          </button>
        )}
        <button
          onClick={() => journal.deleteCollection(selected.id)}
          className="text-sm text-ink/50 hover:text-red-600 dark:text-inkdark/50 dark:hover:text-red-400"
        >
          מחיקת האוסף
        </button>
      </div>

      <EntryList
        journal={journal}
        entries={entries}
        onMigrate={(entry) => journal.migrateEntry(entry.id, { toDate: todayISO() })}
        onAdd={(text, type, time) => journal.addEntry({ text, type, collectionId: selected.id, time })}
        onTagClick={onTagClick}
        emptyMessage="עדיין אין רשומות — אפשר להוסיף אחת למעלה."
      />
    </div>
  )
}
