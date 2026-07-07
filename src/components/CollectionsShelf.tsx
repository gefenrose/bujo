import { useState } from 'react'
import type { Journal } from '../hooks/useJournal'

interface CollectionsShelfProps {
  journal: Journal
  selectedId: string | null
  onSelect: (id: string) => void
}

/** Persistent collections nav: a vertical sidebar on wide screens, a horizontal shelf on narrow ones. */
export function CollectionsShelf({ journal, selectedId, onSelect }: CollectionsShelfProps) {
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  const commitCreate = () => {
    const name = newName.trim()
    setCreating(false)
    setNewName('')
    if (!name) return
    const id = journal.addCollection(name)
    if (id) onSelect(id)
  }

  return (
    <div className="flex shrink-0 gap-1.5 overflow-x-auto pb-1 sm:w-40 sm:flex-col sm:overflow-visible sm:pb-0">
      {journal.collections.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onSelect(c.id)}
          className={`shrink-0 rounded-full px-3 py-1 text-sm transition-colors sm:w-full sm:rounded-lg sm:px-2.5 sm:py-1.5 sm:text-start ${
            selectedId === c.id
              ? 'bg-ink/[0.06] text-ink dark:bg-inkdark/[0.08] dark:text-inkdark'
              : 'text-ink/50 hover:text-ink dark:text-inkdark/50 dark:hover:text-inkdark'
          }`}
        >
          <span className="block truncate">{c.name}</span>
        </button>
      ))}

      {creating ? (
        <input
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={commitCreate}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitCreate()
            if (e.key === 'Escape') {
              setCreating(false)
              setNewName('')
            }
          }}
          placeholder="שם האוסף"
          className="w-28 shrink-0 rounded-full border border-ink/20 bg-transparent px-3 py-1 text-sm text-ink outline-none dark:border-inkdark/20 dark:text-inkdark sm:w-full sm:rounded-lg"
        />
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="shrink-0 rounded-full border border-dashed border-ink/20 px-3 py-1 text-sm text-ink/40 hover:border-ink/40 hover:text-ink dark:border-inkdark/20 dark:text-inkdark/40 dark:hover:border-inkdark/40 dark:hover:text-inkdark sm:w-full sm:rounded-lg sm:text-start"
        >
          + חדש
        </button>
      )}
    </div>
  )
}
