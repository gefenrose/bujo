import type { Journal } from '../../hooks/useJournal'
import { daysInMonth, formatTime, todayISO } from '../../lib/date'
import { habitMonthStats, habitValue, isHabitScheduledOn } from '../../lib/habits'
import { monthlyMoodAverage, moodValue } from '../../lib/mood'
import { ClockIcon, CloseIcon } from '../icons/Icons'
import { HabitCell } from './HabitCell'
import { MoodGridCell } from './MoodGridCell'

interface HabitGridProps {
  journal: Journal
  month: string
}

export function HabitGrid({ journal, month }: HabitGridProps) {
  const days = daysInMonth(month)
  const today = todayISO()
  const moodAverage = monthlyMoodAverage(journal.moodLogs, month)

  return (
    <div className="overflow-x-auto pb-1">
      <div className="inline-flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <div className="sticky start-0 z-10 w-28 shrink-0 bg-paper dark:bg-paperdark" />
          <div className="sticky start-28 z-10 w-14 shrink-0 bg-paper dark:bg-paperdark" />
          <div className="flex gap-[3px] ps-1">
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

        <div className="flex items-center gap-1">
          <div className="sticky start-0 z-10 w-28 shrink-0 bg-paper pe-1 dark:bg-paperdark">
            <span className="truncate text-sm text-ink/80 dark:text-inkdark/80">מצב רוח</span>
          </div>
          <div className="sticky start-28 z-10 w-14 shrink-0 bg-paper text-xs tabular-nums text-ink/40 dark:bg-paperdark dark:text-inkdark/40">
            {moodAverage === null ? '—' : moodAverage.toFixed(1)}
          </div>
          <div className="flex gap-[3px] ps-1">
            {days.map((d) => (
              <MoodGridCell
                key={d}
                value={moodValue(journal.moodLogs, d)}
                isToday={d === today}
                onChange={(v) => journal.setMood(d, v)}
              />
            ))}
          </div>
        </div>

        {journal.habits.length === 0 ? (
          <p className="pt-2 text-sm text-ink/40 dark:text-inkdark/40">
            עדיין אין הרגלים — אפשר להוסיף אחד למטה כדי להתחיל לעקוב (מים, צעדים, שינה...).
          </p>
        ) : (
          journal.habits.map((habit) => {
            const stats = habitMonthStats(habit, journal.habitLogs, month)
            const summary =
              habit.type === 'check'
                ? `${stats.loggedDays}/${stats.scheduledDays}`
                : stats.average === null
                  ? '—'
                  : stats.average.toFixed(1)

            return (
              <div key={habit.id} className="group/hrow flex items-center gap-1">
                <div className="sticky start-0 z-10 flex w-28 shrink-0 items-center justify-between bg-paper pe-1 dark:bg-paperdark">
                  <span className="flex min-w-0 items-center gap-1">
                    <span className="truncate text-sm text-ink/80 dark:text-inkdark/80">{habit.name}</span>
                    {habit.time && (
                      <span
                        className="shrink-0 text-ink/30 dark:text-inkdark/30"
                        title={`תזכורת בשעה ${formatTime(habit.time)}`}
                      >
                        <ClockIcon className="h-3 w-3" />
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => journal.deleteHabit(habit.id)}
                    className="shrink-0 text-ink/25 opacity-0 hover:text-red-600 group-hover/hrow:opacity-100 dark:text-inkdark/25 dark:hover:text-red-400"
                    title="מחיקת הרגל"
                  >
                    <CloseIcon className="h-3 w-3" />
                  </button>
                </div>
                <div className="sticky start-28 z-10 w-14 shrink-0 bg-paper text-xs tabular-nums text-ink/40 dark:bg-paperdark dark:text-inkdark/40">
                  {summary}
                </div>
                <div className="flex gap-[3px] ps-1">
                  {days.map((d) =>
                    isHabitScheduledOn(habit, d) ? (
                      <HabitCell
                        key={d}
                        habit={habit}
                        value={habitValue(journal.habitLogs, habit.id, d)}
                        isToday={d === today}
                        onToggle={() => journal.toggleHabitCheck(habit.id, d)}
                        onIncrement={() => journal.incrementHabit(habit.id, d, 1)}
                        onDecrement={() => journal.incrementHabit(habit.id, d, -1)}
                      />
                    ) : (
                      <div
                        key={d}
                        className="h-5 w-5 shrink-0 rounded-[4px] bg-[repeating-linear-gradient(135deg,transparent,transparent_2px,currentColor_2px,currentColor_3px)] text-ink/[0.05] dark:text-inkdark/[0.06]"
                        title="לא מתוזמן"
                      />
                    ),
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
