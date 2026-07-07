import type { Habit } from '../../types'
import { amberLevelClass, levelForRatio } from '../../lib/colorScale'

interface HabitCellProps {
  habit: Habit
  value: number
  isToday: boolean
  onToggle: () => void
  onIncrement: () => void
  onDecrement: () => void
}

export function HabitCell({ habit, value, isToday, onToggle, onIncrement, onDecrement }: HabitCellProps) {
  const level = habit.type === 'check' ? (value > 0 ? 4 : 0) : levelForRatio(value / (habit.target || 1))

  return (
    <div className={`group/hcell relative h-5 w-5 shrink-0 ${isToday ? 'ring-1 ring-amber-500/60 rounded-[4px]' : ''}`}>
      <button
        type="button"
        onClick={habit.type === 'check' ? onToggle : onIncrement}
        title={
          habit.type === 'check'
            ? value > 0
              ? 'מסומן — לחיצה לביטול הסימון'
              : 'לחיצה לסימון'
            : `${value}${habit.target ? ` / ${habit.target}` : ''} — לחיצה להוספת 1`
        }
        className={`flex h-full w-full items-center justify-center rounded-[4px] text-[0.6rem] leading-none text-ink/70 transition-colors dark:text-inkdark/70 ${amberLevelClass(level)}`}
      >
        {habit.type === 'count' && value > 0 ? value : ''}
      </button>
      {habit.type === 'count' && value > 0 && (
        <button
          type="button"
          onClick={onDecrement}
          title="−1"
          className="absolute -end-1 -top-1 hidden h-3 w-3 items-center justify-center rounded-full bg-ink text-[0.55rem] leading-none text-paper opacity-80 hover:opacity-100 group-hover/hcell:flex dark:bg-inkdark dark:text-paperdark"
        >
          −
        </button>
      )}
    </div>
  )
}
