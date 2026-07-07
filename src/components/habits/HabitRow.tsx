import type { Habit } from '../../types'
import { CheckIcon } from '../icons/Icons'

interface HabitRowProps {
  habit: Habit
  value: number
  onToggle: () => void
  onIncrement: () => void
  onDecrement: () => void
}

export function HabitRow({ habit, value, onToggle, onIncrement, onDecrement }: HabitRowProps) {
  const target = habit.type === 'count' ? habit.target || 1 : 1
  const effectiveValue = habit.type === 'count' ? value : value > 0 ? 1 : 0
  const complete = effectiveValue >= target
  const initial = habit.name.trim().slice(0, 1).toUpperCase()

  return (
    <div className="flex items-center gap-3 rounded-xl bg-ink/[0.03] px-4 py-3 dark:bg-inkdark/[0.04]">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/10 text-sm font-medium text-ink/60 dark:bg-inkdark/10 dark:text-inkdark/60">
        {initial}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-ink dark:text-inkdark">{habit.name}</p>
        <p className="text-xs text-ink/40 dark:text-inkdark/40">
          {effectiveValue} / {target} פעמים
        </p>
      </div>

      {habit.type === 'count' && value > 0 && (
        <button
          type="button"
          onClick={onDecrement}
          title="הפחתת 1"
          className="shrink-0 rounded-full px-2 py-1 text-sm text-ink/30 hover:text-ink dark:text-inkdark/30 dark:hover:text-inkdark"
        >
          −
        </button>
      )}

      <button
        type="button"
        onClick={habit.type === 'check' ? onToggle : onIncrement}
        title={
          habit.type === 'check' ? (value > 0 ? 'ביטול הסימון' : 'סימון כבוצע') : `${effectiveValue} / ${target} — הוספת 1`
        }
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          complete
            ? 'border-amber-500 bg-amber-500 text-paper dark:border-amber-400 dark:bg-amber-400 dark:text-paperdark'
            : 'border-ink/20 text-transparent dark:border-inkdark/20'
        }`}
      >
        <CheckIcon className="h-4 w-4" />
      </button>
    </div>
  )
}
