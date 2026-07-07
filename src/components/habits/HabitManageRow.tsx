import { useState } from 'react'
import type { Habit, HabitType } from '../../types'
import { CloseIcon } from '../icons/Icons'
import { WeekdayPicker } from './WeekdayPicker'

interface HabitManageRowProps {
  habit: Habit
  onSave: (patch: { name: string; type: HabitType; target?: number; days?: number[]; time?: string }) => void
  onDelete: () => void
}

export function HabitManageRow({ habit, onSave, onDelete }: HabitManageRowProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(habit.name)
  const [type, setType] = useState<HabitType>(habit.type)
  const [target, setTarget] = useState(habit.target ?? 5)
  const [days, setDays] = useState<number[]>(habit.days ?? [])
  const [time, setTime] = useState(habit.time ?? '')

  const resetDraft = () => {
    setName(habit.name)
    setType(habit.type)
    setTarget(habit.target ?? 5)
    setDays(habit.days ?? [])
    setTime(habit.time ?? '')
  }

  const commit = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      resetDraft()
      setEditing(false)
      return
    }
    onSave({ name: trimmed, type, target, days, time })
    setEditing(false)
  }

  const cancel = () => {
    resetDraft()
    setEditing(false)
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2 py-1.5">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="min-w-0 flex-1 truncate text-start text-sm text-ink/80 hover:text-ink dark:text-inkdark/80 dark:hover:text-inkdark"
        >
          {habit.name}
        </button>
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

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-ink/10 p-3 dark:border-inkdark/10">
      <div className="flex flex-wrap items-center gap-2">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="שם ההרגל"
          className="min-w-[10rem] flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/30 dark:text-inkdark dark:placeholder:text-inkdark/30"
        />
        <div className="flex items-center gap-1 rounded-full border border-ink/10 p-0.5 text-xs dark:border-inkdark/10">
          <button
            type="button"
            onClick={() => setType('check')}
            className={`rounded-full px-2.5 py-1 ${
              type === 'check'
                ? 'bg-ink/[0.08] text-ink dark:bg-inkdark/[0.1] dark:text-inkdark'
                : 'text-ink/50 dark:text-inkdark/50'
            }`}
          >
            סימון
          </button>
          <button
            type="button"
            onClick={() => setType('count')}
            className={`rounded-full px-2.5 py-1 ${
              type === 'count'
                ? 'bg-ink/[0.08] text-ink dark:bg-inkdark/[0.1] dark:text-inkdark'
                : 'text-ink/50 dark:text-inkdark/50'
            }`}
          >
            ספירה
          </button>
        </div>
        {type === 'count' && (
          <label className="flex items-center gap-1.5 text-xs text-ink/50 dark:text-inkdark/50">
            יעד
            <input
              type="number"
              min={1}
              value={target}
              onChange={(e) => setTarget(Math.max(1, Number(e.target.value) || 1))}
              className="w-12 rounded border border-ink/15 bg-transparent px-1.5 py-0.5 text-ink outline-none dark:border-inkdark/15 dark:text-inkdark"
            />
          </label>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink/50 dark:text-inkdark/50">חזרה</span>
          <WeekdayPicker value={days} onChange={setDays} />
        </div>
        <label className="flex items-center gap-1.5 text-xs text-ink/50 dark:text-inkdark/50">
          תזכורת
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="rounded border border-ink/15 bg-transparent px-1.5 py-0.5 text-ink outline-none dark:border-inkdark/15 dark:text-inkdark"
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={commit}
          className="rounded-full bg-ink px-3 py-1 text-xs text-paper hover:opacity-90 dark:bg-inkdark dark:text-paperdark"
        >
          שמירה
        </button>
        <button
          type="button"
          onClick={cancel}
          className="text-xs text-ink/40 hover:text-ink dark:text-inkdark/40 dark:hover:text-inkdark"
        >
          ביטול
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="ms-auto text-xs text-ink/30 hover:text-red-600 dark:text-inkdark/30 dark:hover:text-red-400"
        >
          מחיקת הרגל
        </button>
      </div>
    </div>
  )
}
