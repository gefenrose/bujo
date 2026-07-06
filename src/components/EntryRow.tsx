import { useEffect, useRef, useState } from 'react'
import type { Entry } from '../types'
import { Bullet } from './Bullet'

interface EntryRowProps {
  entry: Entry
  onToggle: () => void
  onEdit: (text: string) => void
  onDelete: () => void
  onMigrate: () => void
  onTogglePriority: () => void
}

export function EntryRow({ entry, onToggle, onEdit, onDelete, onMigrate, onTogglePriority }: EntryRowProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(entry.text)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const commit = () => {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed && trimmed !== entry.text) onEdit(trimmed)
    else setDraft(entry.text)
  }

  const struck = entry.status === 'done' || entry.status === 'cancelled'
  const dimmed = entry.status === 'migrated' || entry.status === 'cancelled'

  return (
    <div className="group flex items-start gap-2.5 rounded px-1.5 py-1 -mx-1.5 hover:bg-ink/[0.03] dark:hover:bg-inkdark/[0.04]">
      <Bullet entry={entry} onClick={onToggle} />

      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') {
              setDraft(entry.text)
              setEditing(false)
            }
          }}
          className="min-w-0 flex-1 bg-transparent py-0.5 text-[0.95rem] leading-snug text-ink outline-none dark:text-inkdark"
        />
      ) : (
        <p
          onClick={() => {
            setDraft(entry.text)
            setEditing(true)
          }}
          className={`min-w-0 flex-1 cursor-text py-0.5 text-[0.95rem] leading-snug ${
            struck ? 'line-through decoration-1' : ''
          } ${dimmed ? 'text-ink/40 dark:text-inkdark/40' : 'text-ink dark:text-inkdark'}`}
        >
          {entry.text}
        </p>
      )}

      {entry.priority && (
        <span className="mt-0.5 select-none text-amber-600 dark:text-amber-500" title="priority">
          ★
        </span>
      )}

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={onTogglePriority}
          title="Toggle priority"
          className="rounded px-1 text-xs text-ink/40 hover:text-amber-600 dark:text-inkdark/40 dark:hover:text-amber-500"
        >
          ★
        </button>
        {entry.status === 'open' && (
          <button
            type="button"
            onClick={onMigrate}
            title="Migrate"
            className="rounded px-1 text-sm text-ink/40 hover:text-ink dark:text-inkdark/40 dark:hover:text-inkdark"
          >
            &gt;
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          title="Delete"
          className="rounded px-1 text-sm text-ink/40 hover:text-red-600 dark:text-inkdark/40 dark:hover:text-red-400"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
