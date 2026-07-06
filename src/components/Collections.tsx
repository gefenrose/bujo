import { useState } from 'react'
import type { Journal } from '../hooks/useJournal'
import { todayISO } from '../lib/date'
import { EntryInput } from './EntryInput'
import { EntryRow } from './EntryRow'

interface CollectionsProps {
  journal: Journal
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function Collections({ journal, selectedId, onSelect }: CollectionsProps) {
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  const selected = journal.collections.find((c) => c.id === selectedId) ?? journal.collections[0] ?? null

  const commitCreate = () => {
    const name = newName.trim()
    setCreating(false)
    setNewName('')
    if (!name) return
    const id = journal.addCollection(name)
    if (id) onSelect(id)
  }

  const entries = selected
    ? journal.entries
        .filter((e) => e.collectionId === selected.id)
        .sort((a, b) => a.createdAt - b.createdAt)
    : []

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {journal.collections.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              selected?.id === c.id
                ? 'border-ink/20 bg-ink/[0.06] text-ink dark:border-inkdark/20 dark:bg-inkdark/[0.08] dark:text-inkdark'
                : 'border-transparent text-ink/50 hover:text-ink dark:text-inkdark/50 dark:hover:text-inkdark'
            }`}
          >
            {c.name}
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
            placeholder="Collection name"
            className="rounded-full border border-ink/20 bg-transparent px-3 py-1 text-sm text-ink outline-none dark:border-inkdark/20 dark:text-inkdark"
          />
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="rounded-full border border-dashed border-ink/20 px-3 py-1 text-sm text-ink/40 hover:border-ink/40 hover:text-ink dark:border-inkdark/20 dark:text-inkdark/40 dark:hover:border-inkdark/40 dark:hover:text-inkdark"
          >
            + new
          </button>
        )}
      </div>

      {selected ? (
        <>
          <div className="mb-4 flex items-baseline justify-between">
            <h1 className="text-lg font-medium tracking-tight text-ink dark:text-inkdark">{selected.name}</h1>
            <button
              onClick={() => {
                journal.deleteCollection(selected.id)
                onSelect(null)
              }}
              className="text-sm text-ink/30 hover:text-red-600 dark:text-inkdark/30 dark:hover:text-red-400"
            >
              delete collection
            </button>
          </div>

          <div className="flex flex-col">
            {entries.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                onToggle={() => journal.cycleStatus(entry.id)}
                onEdit={(text) => journal.updateEntry(entry.id, { text })}
                onDelete={() => journal.deleteEntry(entry.id)}
                onMigrate={() => journal.migrateEntry(entry.id, { toDate: todayISO() })}
                onTogglePriority={() => journal.togglePriority(entry.id)}
              />
            ))}
            <EntryInput onSubmit={(text, type) => journal.addEntry({ text, type, collectionId: selected.id })} />
          </div>
        </>
      ) : (
        <p className="text-sm text-ink/40 dark:text-inkdark/40">
          Create a collection to track books, ideas, goals, or anything else outside the daily grind.
        </p>
      )}
    </div>
  )
}
