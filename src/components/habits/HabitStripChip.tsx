import type { Habit } from '../../types'

interface HabitStripChipProps {
  habit: Habit
  value: number
  onToggle: () => void
  onIncrement: () => void
  onDecrement: () => void
}

export function HabitStripChip({ habit, value, onToggle, onIncrement, onDecrement }: HabitStripChipProps) {
  const active = value > 0

  if (habit.type === 'check') {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
          active
            ? 'border-amber-500/40 bg-amber-500/15 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-400'
            : 'border-ink/15 text-ink/65 hover:border-ink/30 hover:text-ink dark:border-inkdark/15 dark:text-inkdark/65 dark:hover:border-inkdark/30 dark:hover:text-inkdark'
        }`}
      >
        {habit.name}
      </button>
    )
  }

  return (
    <div
      className={`group/chip flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
        active
          ? 'border-amber-500/40 bg-amber-500/15 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-400'
          : 'border-ink/15 text-ink/65 dark:border-inkdark/15 dark:text-inkdark/65'
      }`}
    >
      <button type="button" onClick={onIncrement} className="hover:text-ink dark:hover:text-inkdark">
        {habit.name}
        {active && <span className="ms-1.5 tabular-nums">{value}</span>}
      </button>
      {active && (
        <button
          type="button"
          onClick={onDecrement}
          title="−1"
          className="hidden text-ink/50 hover:text-ink group-hover/chip:inline dark:text-inkdark/50 dark:hover:text-inkdark"
        >
          −
        </button>
      )}
    </div>
  )
}
