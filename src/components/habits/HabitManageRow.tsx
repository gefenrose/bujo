import { useState } from 'react'
import type { Habit } from '../../types'
import { CloseIcon } from '../icons/Icons'

interface HabitManageRowProps {
  habit: Habit
  onRename: (name: string) => void
  onDelete: () => void
}

export function HabitManageRow({ habit, onRename, onDelete }: HabitManageRowProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(habit.name)

  const commit = () => {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed && trimmed !== habit.name) onRename(trimmed)
    else setDraft(habit.name)
  }

  return (
    <div className="flex items-center gap-2 py-1">
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') {
              setDraft(habit.name)
              setEditing(false)
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none dark:text-inkdark"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="min-w-0 flex-1 truncate text-start text-sm text-ink/80 hover:text-ink dark:text-inkdark/80 dark:hover:text-inkdark"
        >
          {habit.name}
        </button>
      )}
      <button
        type="button"
        onClick={onDelete}
        title="מחיקת הרגל"
        className="shrink-0 text-ink/30 hover:text-red-600 dark:text-inkdark/30 dark:hover:text-red-400"
      >
        <CloseIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
