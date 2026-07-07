import type { Journal } from '../../hooks/useJournal'
import { daysInMonth, todayISO } from '../../lib/date'
import { habitMonthStats, habitValue } from '../../lib/habits'
import { HabitCell } from './HabitCell'

interface HabitGridProps {
  journal: Journal
  month: string
}

export function HabitGrid({ journal, month }: HabitGridProps) {
  const days = daysInMonth(month)
  const today = todayISO()

  if (journal.habits.length === 0) {
    return (
      <p className="text-sm text-ink/40 dark:text-inkdark/40">
        No habits yet — add one below to start tracking (water, steps, mood, sleep…).
      </p>
    )
  }

  return (
    <div className="overflow-x-auto pb-1">
      <div className="inline-flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <div className="sticky left-0 z-10 w-28 shrink-0 bg-paper dark:bg-paperdark" />
          <div className="sticky left-28 z-10 w-14 shrink-0 bg-paper dark:bg-paperdark" />
          <div className="flex gap-[3px] pl-1">
            {days.map((d) => (
              <span
                key={d}
                className={`w-5 shrink-0 text-center text-[0.65rem] tabular-nums ${
                  d === today ? 'font-medium text-amber-600 dark:text-amber-400' : 'text-ink/35 dark:text-inkdark/35'
                }`}
              >
                {Number(d.slice(-2))}
              </span>
            ))}
          </div>
        </div>

        {journal.habits.map((habit) => {
          const stats = habitMonthStats(habit, journal.habitLogs, month)
          const summary =
            habit.type === 'check'
              ? `${stats.loggedDays}/${days.length}`
              : stats.average === null
                ? '—'
                : stats.average.toFixed(1)

          return (
            <div key={habit.id} className="group/hrow flex items-center gap-1">
              <div className="sticky left-0 z-10 flex w-28 shrink-0 items-center justify-between bg-paper pr-1 dark:bg-paperdark">
                <span className="truncate text-sm text-ink/80 dark:text-inkdark/80">{habit.name}</span>
                <button
                  type="button"
                  onClick={() => journal.deleteHabit(habit.id)}
                  className="shrink-0 text-xs text-ink/25 opacity-0 hover:text-red-600 group-hover/hrow:opacity-100 dark:text-inkdark/25 dark:hover:text-red-400"
                  title="Delete habit"
                >
                  ✕
                </button>
              </div>
              <div className="sticky left-28 z-10 w-14 shrink-0 bg-paper text-xs tabular-nums text-ink/40 dark:bg-paperdark dark:text-inkdark/40">
                {summary}
              </div>
              <div className="flex gap-[3px] pl-1">
                {days.map((d) => (
                  <HabitCell
                    key={d}
                    habit={habit}
                    value={habitValue(journal.habitLogs, habit.id, d)}
                    isToday={d === today}
                    onToggle={() => journal.toggleHabitCheck(habit.id, d)}
                    onIncrement={() => journal.incrementHabit(habit.id, d, 1)}
                    onDecrement={() => journal.incrementHabit(habit.id, d, -1)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
