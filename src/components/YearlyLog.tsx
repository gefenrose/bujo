import type { Journal } from '../hooks/useJournal'
import { addYears, daysInMonth, formatTime, isToday, monthName, monthsInYear, weekdayShort, yearOf } from '../lib/date'
import { sortByOrder } from '../lib/entries'
import { moodLevel, moodValue } from '../lib/mood'
import { usePreferences } from '../hooks/usePreferences'
import { Bullet } from './Bullet'
import { MoodFaceIcon } from './icons/MoodFaceIcon'

interface YearlyLogProps {
  journal: Journal
  /** an ISO date within the currently-expanded month */
  month: string
  onChangeMonth: (month: string) => void
  onSelectDate: (date: string) => void
}

export function YearlyLog({ journal, month, onChangeMonth, onSelectDate }: YearlyLogProps) {
  const { preferences } = usePreferences()
  const months = monthsInYear(month)
  const expandedMonth = months.find((m) => m.slice(0, 7) === month.slice(0, 7)) ?? months[0]

  return (
    <div>
      <div className="mb-6 hidden items-baseline justify-between sm:flex">
        <h1 className="text-lg font-medium tracking-tight text-ink dark:text-inkdark">{yearOf(month)}</h1>
        <div className="flex items-center gap-3 text-sm text-ink/50 dark:text-inkdark/50">
          <button onClick={() => onChangeMonth(addYears(month, -1))} className="hover:text-ink dark:hover:text-inkdark">
            הקודמת
          </button>
          <button onClick={() => onChangeMonth(addYears(month, 1))} className="hover:text-ink dark:hover:text-inkdark">
            הבאה
          </button>
        </div>
      </div>

      <div className="flex flex-col">
        {months.map((m) => {
          const expanded = m === expandedMonth
          const daysWithEntries = expanded
            ? daysInMonth(m).filter((date) => journal.entries.some((e) => e.date === date))
            : []

          return (
            <div key={m} className="border-b border-ink/10 py-3 first:pt-0 dark:border-inkdark/10">
              <button
                type="button"
                onClick={() => onChangeMonth(m)}
                className={`text-sm ${
                  expanded ? 'font-medium text-ink dark:text-inkdark' : 'text-ink/50 dark:text-inkdark/50'
                }`}
              >
                {monthName(m)}
              </button>

              {expanded && daysWithEntries.length > 0 && (
                <div className="mt-2 flex flex-col">
                  {daysWithEntries.map((date) => {
                    const entries = sortByOrder(journal.entries.filter((e) => e.date === date))
                    const day = Number(date.slice(-2))
                    const mood = moodLevel(moodValue(journal.moodLogs, date))

                    return (
                      <div
                        key={date}
                        className={`group flex gap-3 rounded px-1.5 py-1 -mx-1.5 hover:bg-ink/[0.03] dark:hover:bg-inkdark/[0.04] ${
                          isToday(date) ? 'bg-amber-500/[0.06]' : ''
                        }`}
                      >
                        <button
                          onClick={() => onSelectDate(date)}
                          className="flex w-12 shrink-0 items-baseline gap-1.5 text-start"
                        >
                          <span className="text-sm tabular-nums text-ink/70 dark:text-inkdark/70">{day}</span>
                          <span className="text-[0.7rem] uppercase text-ink/30 dark:text-inkdark/30">
                            {weekdayShort(date)}
                          </span>
                        </button>

                        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-1 py-0.5">
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
                                    ? 'text-ink/40 dark:text-inkdark/40'
                                    : 'text-ink/80 dark:text-inkdark/80'
                                }`}
                              >
                                {entry.time && (
                                  <span className="me-1 text-xs tabular-nums text-ink/40 dark:text-inkdark/40">
                                    {formatTime(entry.time, preferences.timeFormat)}
                                  </span>
                                )}
                                {entry.text}
                              </span>
                            </span>
                          ))}
                        </div>

                        {mood && (
                          <span className={`shrink-0 self-start pt-0.5 ${mood.text}`} title={mood.label}>
                            <MoodFaceIcon level={mood.value} className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
