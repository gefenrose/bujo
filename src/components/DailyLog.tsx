import type { Journal } from '../hooks/useJournal'
import { addDays, formatDayHeading, isToday, todayISO } from '../lib/date'
import { sortByOrder } from '../lib/entries'
import { habitValue, isHabitScheduledOn } from '../lib/habits'
import { moodValue } from '../lib/mood'
import { EntryList } from './EntryList'
import { HabitStripChip } from './habits/HabitStripChip'
import { MoodPicker } from './mood/MoodPicker'

interface DailyLogProps {
  journal: Journal
  date: string
  onChangeDate: (date: string) => void
}

export function DailyLog({ journal, date, onChangeDate }: DailyLogProps) {
  const entries = sortByOrder(journal.entries.filter((e) => e.date === date))
  const scheduledHabits = journal.habits.filter((h) => isHabitScheduledOn(h, date))

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-lg font-medium tracking-tight text-ink dark:text-inkdark">
          {formatDayHeading(date)}
        </h1>
        <div className="flex items-center gap-3 text-sm text-ink/50 dark:text-inkdark/50">
          <button onClick={() => onChangeDate(addDays(date, -1))} className="hover:text-ink dark:hover:text-inkdark">
            ← prev
          </button>
          {!isToday(date) && (
            <button onClick={() => onChangeDate(todayISO())} className="hover:text-ink dark:hover:text-inkdark">
              today
            </button>
          )}
          <button onClick={() => onChangeDate(addDays(date, 1))} className="hover:text-ink dark:hover:text-inkdark">
            next →
          </button>
        </div>
      </div>

      <MoodPicker value={moodValue(journal.moodLogs, date)} onChange={(v) => journal.setMood(date, v)} />

      {scheduledHabits.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {scheduledHabits.map((habit) => (
            <HabitStripChip
              key={habit.id}
              habit={habit}
              value={habitValue(journal.habitLogs, habit.id, date)}
              onToggle={() => journal.toggleHabitCheck(habit.id, date)}
              onIncrement={() => journal.incrementHabit(habit.id, date, 1)}
              onDecrement={() => journal.incrementHabit(habit.id, date, -1)}
            />
          ))}
        </div>
      )}

      <EntryList
        journal={journal}
        entries={entries}
        onMigrate={(entry) => journal.migrateEntry(entry.id, { toDate: addDays(date, 1) })}
        onAdd={(text, type, time) => journal.addEntry({ text, type, date, time })}
        emptyMessage="Nothing logged yet — start writing above."
      />
    </div>
  )
}
