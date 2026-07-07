import type { Journal } from '../hooks/useJournal'
import { addMonths, daysInMonth, formatMonthHeading, isToday, weekdayShort } from '../lib/date'
import { moodLevel, moodValue } from '../lib/mood'
import { Bullet } from './Bullet'
import { MoodFaceIcon } from './icons/MoodFaceIcon'

interface MonthlyLogProps {
  journal: Journal
  month: string
  onChangeMonth: (month: string) => void
  onSelectDate: (date: string) => void
}

export function MonthlyLog({ journal, month, onChangeMonth, onSelectDate }: MonthlyLogProps) {
  const days = daysInMonth(month)

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-lg font-medium tracking-tight text-ink dark:text-inkdark">
          {formatMonthHeading(month)}
        </h1>
        <div className="flex items-center gap-3 text-sm text-ink/50 dark:text-inkdark/50">
          <button onClick={() => onChangeMonth(addMonths(month, -1))} className="hover:text-ink dark:hover:text-inkdark">
            ← prev
          </button>
          <button onClick={() => onChangeMonth(addMonths(month, 1))} className="hover:text-ink dark:hover:text-inkdark">
            next →
          </button>
        </div>
      </div>

      <div className="flex flex-col">
        {days.map((date) => {
          const entries = journal.entries
            .filter((e) => e.date === date)
            .sort((a, b) => a.createdAt - b.createdAt)
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
                className="flex w-12 shrink-0 items-baseline gap-1.5 text-left"
              >
                <span className="text-sm tabular-nums text-ink/70 dark:text-inkdark/70">{day}</span>
                <span className="text-[0.7rem] uppercase text-ink/30 dark:text-inkdark/30">
                  {weekdayShort(date)}
                </span>
              </button>

              {entries.length > 0 ? (
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
                        {entry.text}
                      </span>
                    </span>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => onSelectDate(date)}
                  className="flex-1 py-0.5 text-left text-sm text-ink/15 dark:text-inkdark/15"
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
