import type { Journal } from '../hooks/useJournal'
import { addWeeks, daysInWeek, formatTime, formatWeekHeading, isToday, weekdayShort } from '../lib/date'
import { sortByOrder } from '../lib/entries'
import { moodLevel, moodValue } from '../lib/mood'
import { usePreferences } from '../hooks/usePreferences'
import { Bullet } from './Bullet'
import { MoodFaceIcon } from './icons/MoodFaceIcon'

interface WeeklyLogProps {
  journal: Journal
  date: string
  onChangeDate: (date: string) => void
  onSelectDate: (date: string) => void
}

export function WeeklyLog({ journal, date, onChangeDate, onSelectDate }: WeeklyLogProps) {
  const { preferences } = usePreferences()
  const days = daysInWeek(date, preferences.startOfWeek)

  return (
    <div>
      <div className="mb-6 hidden items-baseline justify-between sm:flex">
        <h1 className="text-lg font-medium tracking-tight text-ink dark:text-inkdark">
          {formatWeekHeading(date, preferences.startOfWeek)}
        </h1>
        <div className="flex items-center gap-3 text-sm text-ink/65 dark:text-inkdark/65">
          <button onClick={() => onChangeDate(addWeeks(date, -1))} className="hover:text-ink dark:hover:text-inkdark">
            הקודם
          </button>
          <button onClick={() => onChangeDate(addWeeks(date, 1))} className="hover:text-ink dark:hover:text-inkdark">
            הבא
          </button>
        </div>
      </div>

      <div className="flex flex-col">
        {days.map((d) => {
          const entries = sortByOrder(journal.entries.filter((e) => e.date === d))
          const day = Number(d.slice(-2))
          const mood = moodLevel(moodValue(journal.moodLogs, d))

          return (
            <div
              key={d}
              className={`group flex gap-3 rounded px-1.5 py-2 -mx-1.5 hover:bg-ink/[0.03] dark:hover:bg-inkdark/[0.04] ${
                isToday(d) ? 'bg-amber-500/[0.06]' : ''
              }`}
            >
              <button
                onClick={() => onSelectDate(d)}
                className="flex w-16 shrink-0 flex-col items-start gap-0 text-start"
              >
                <span className="text-[0.7rem] uppercase text-ink/50 dark:text-inkdark/50">
                  יום {weekdayShort(d)}
                </span>
                <span className="text-sm tabular-nums text-ink/75 dark:text-inkdark/75">{day}</span>
              </button>

              {entries.length > 0 ? (
                <div className="flex min-w-0 flex-1 flex-col gap-1 py-0.5">
                  {entries.map((entry) => (
                    <span key={entry.id} className="flex items-baseline gap-1.5">
                      <span className="inline-flex -translate-y-px items-center">
                        <Bullet entry={entry} onClick={() => journal.cycleStatus(entry.id)} />
                      </span>
                      <span
                        className={`text-sm ${
                          entry.status === 'done' || entry.status === 'cancelled' ? 'line-through' : ''
                        } ${
                          entry.status === 'migrated' || entry.status === 'cancelled'
                            ? 'text-ink/60 dark:text-inkdark/60'
                            : 'text-ink/80 dark:text-inkdark/80'
                        }`}
                      >
                        {entry.time && (
                          <span className="me-1 text-xs tabular-nums text-ink/60 dark:text-inkdark/60">
                            {formatTime(entry.time, preferences.timeFormat)}
                          </span>
                        )}
                        {entry.text}
                      </span>
                    </span>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => onSelectDate(d)}
                  className="flex-1 py-0.5 text-start text-sm text-ink/35 dark:text-inkdark/35"
                >
                  —
                </button>
              )}

              {mood && (
                <span className={`shrink-0 self-start pt-0.5 ${mood.text}`} title={mood.label}>
                  <MoodFaceIcon level={mood.value} className="h-4 w-4" />
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
