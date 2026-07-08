import { useState } from 'react'
import type { Journal } from '../hooks/useJournal'
import { rowColor } from '../lib/collectionColors'
import { usePreferences } from '../hooks/usePreferences'
import { ListIcon } from './icons/Icons'

interface CollectionsShelfProps {
  journal: Journal
  selectedId: string | null
  onSelect: (id: string) => void
  /** 'shelf' (default): sidebar on wide screens, horizontal scroll shelf on narrow ones. 'list': always a vertical full-width list, for the mobile drawer. */
  layout?: 'shelf' | 'list'
  /** Whether to render the inline "+ new" create control. Set false when a parent (e.g. the mobile drawer) drives creation itself. */
  showAddButton?: boolean
}

/** Persistent collections nav: a vertical sidebar on wide screens, a horizontal shelf on narrow ones. */
export function CollectionsShelf({
  journal,
  selectedId,
  onSelect,
  layout = 'shelf',
  showAddButton = true,
}: CollectionsShelfProps) {
  const { preferences } = usePreferences()
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const list = layout === 'list'

  const commitCreate = () => {
    const name = newName.trim()
    setCreating(false)
    setNewName('')
    if (!name) return
    const id = journal.addCollection(name)
    if (id) onSelect(id)
  }

  return (
    <div
      className={
        list
          ? 'flex w-full flex-col gap-1.5'
          : 'flex shrink-0 gap-1.5 overflow-x-auto pb-1 sm:w-40 sm:flex-col sm:overflow-visible sm:pb-0'
      }
    >
      {journal.collections.map((c, i) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onSelect(c.id)}
          className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1 text-sm transition-colors ${
            list ? 'w-full rounded-lg px-2.5 py-1.5 text-start' : 'sm:w-full sm:rounded-lg sm:px-2.5 sm:py-1.5 sm:text-start'
          } ${
            selectedId === c.id
              ? 'bg-ink/[0.06] text-ink dark:bg-inkdark/[0.08] dark:text-inkdark'
              : 'text-ink/50 hover:text-ink dark:text-inkdark/50 dark:hover:text-inkdark'
          }`}
        >
          {list && <ListIcon className={`h-4 w-4 shrink-0 ${rowColor(i, preferences.autoAssignColors)}`} />}
          <span className="block min-w-0 flex-1 truncate">{c.name}</span>
        </button>
      ))}

      {showAddButton &&
        (creating ? (
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
            className={`w-28 shrink-0 rounded-full border border-ink/20 bg-transparent px-3 py-1 text-sm text-ink outline-none dark:border-inkdark/20 dark:text-inkdark ${
              list ? 'w-full rounded-lg' : 'sm:w-full sm:rounded-lg'
            }`}
          />
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className={`shrink-0 rounded-full border border-dashed border-ink/20 px-3 py-1 text-sm text-ink/40 hover:border-ink/40 hover:text-ink dark:border-inkdark/20 dark:text-inkdark/40 dark:hover:border-inkdark/40 dark:hover:text-inkdark ${
              list ? 'w-full rounded-lg text-start' : 'sm:w-full sm:rounded-lg sm:text-start'
            }`}
          >
            + חדש
          </button>
        ))}
    </div>
  )
}
