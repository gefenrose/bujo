import type { Journal } from '../hooks/useJournal'
import { addDays, formatDayHeading, isToday, todayISO } from '../lib/date'
import { sortByOrder } from '../lib/entries'
import { habitValue, isHabitScheduledOn } from '../lib/habits'
import { moodValue } from '../lib/mood'
import { EntryList } from './EntryList'

interface DailyLogProps {
  journal: Journal
  date: string
  onChangeDate: (date: string) => void
  onTagClick: (tag: string) => void
}

export function DailyLog({ journal, date, onChangeDate, onTagClick }: DailyLogProps) {
  const entries = sortByOrder(journal.entries.filter((e) => e.date === date))
  const scheduledHabits = journal.habits.filter((habit) => isHabitScheduledOn(habit, date))
  const mood = moodValue(journal.moodLogs, date)
  return (
    <div className="daily-log">
      <div className="daily-heading mb-6 hidden items-baseline justify-between sm:flex">
        <h1 className="text-lg font-medium tracking-tight text-ink dark:text-inkdark">
          {formatDayHeading(date)}
        </h1>
        <div className="flex items-center gap-3 text-sm text-ink/65 dark:text-inkdark/65">
          <button onClick={() => onChangeDate(addDays(date, -1))} className="hover:text-ink dark:hover:text-inkdark">
            הקודם
          </button>
          {!isToday(date) && (
            <button onClick={() => onChangeDate(todayISO())} className="hover:text-ink dark:hover:text-inkdark">
              היום
            </button>
          )}
          <button onClick={() => onChangeDate(addDays(date, 1))} className="hover:text-ink dark:hover:text-inkdark">
            הבא
          </button>
        </div>
      </div>

      <section className="daily-signals" aria-label="תיעוד מצב רוח והרגלים">
        <div className="daily-mood-input">
          <span>מצב רוח</span>
          <div>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => journal.setMood(date, value)}
                className={mood === value ? 'is-selected' : undefined}
                aria-label={`מצב רוח ${value} מתוך 5`}
                aria-pressed={mood === value}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        {scheduledHabits.length > 0 && (
          <div className="daily-habit-inputs">
            {scheduledHabits.map((habit) => {
              const value = habitValue(journal.habitLogs, habit.id, date)
              const done = habit.type === 'check' ? value > 0 : value >= (habit.target ?? 1)
              return (
                <button
                  key={habit.id}
                  type="button"
                  onClick={() => habit.type === 'check' ? journal.toggleHabitCheck(habit.id, date) : journal.incrementHabit(habit.id, date, 1)}
                  className={done ? 'is-done' : undefined}
                  aria-pressed={done}
                >
                  <span aria-hidden="true">{done ? '✓' : '○'}</span>
                  {habit.name}
                  {habit.type === 'count' && <small>{value}/{habit.target ?? 1}</small>}
                </button>
              )
            })}
          </div>
        )}
      </section>

      <EntryList
        journal={journal}
        entries={entries}
        onMigrate={(entry) => journal.migrateEntry(entry.id, { toDate: addDays(date, 1) })}
        onAdd={(text, type, time) => journal.addEntry({ text, type, date, time })}
        onTagClick={onTagClick}
        emptyMessage="עדיין לא נרשם כלום — אפשר להתחיל לכתוב למעלה."
      />
    </div>
  )
}
