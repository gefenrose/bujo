import type { Habit, HabitLog } from '../../types'
import { isToday, weekdayShort } from '../../lib/date'
import { amberLevelClass, levelForRatio } from '../../lib/colorScale'
import { habitValue, isHabitScheduledOn } from '../../lib/habits'

interface HabitWeekDotsProps {
  habit: Habit
  week: string[]
  habitLogs: HabitLog[]
  selectedDate: string
  onSelectDate: (date: string) => void
}

/** A row of 7 small day indicators showing which days this habit was done, skipped, or not scheduled. */
export function HabitWeekDots({ habit, week, habitLogs, selectedDate, onSelectDate }: HabitWeekDotsProps) {
  return (
    <div className="flex items-center gap-1.5 ps-[3.75rem]">
      {week.map((day) => {
        const scheduled = isHabitScheduledOn(habit, day)
        const value = habitValue(habitLogs, habit.id, day)
        const level = habit.type === 'check' ? (value > 0 ? 4 : 0) : levelForRatio(value / (habit.target || 1))

        return (
          <button
            key={day}
            type="button"
            onClick={() => onSelectDate(day)}
            title={`${weekdayShort(day)} ${Number(day.slice(-2))}${scheduled ? '' : ' — לא מתוזמן'}`}
            className={`h-4 w-4 shrink-0 rounded-[3px] transition-colors ${
              day === selectedDate ? 'ring-1 ring-amber-500/70' : ''
            } ${
              !scheduled
                ? 'bg-[repeating-linear-gradient(135deg,transparent,transparent_2px,currentColor_2px,currentColor_3px)] text-ink/[0.06] dark:text-inkdark/[0.08]'
                : amberLevelClass(level)
            } ${isToday(day) ? 'outline outline-1 outline-offset-1 outline-ink/20 dark:outline-inkdark/20' : ''}`}
          />
        )
      })}
    </div>
  )
}
