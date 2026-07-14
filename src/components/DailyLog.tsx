import type { Journal } from '../hooks/useJournal'
import { addDays, formatDayHeading, isToday, todayISO } from '../lib/date'
import { sortByOrder } from '../lib/entries'
import { habitValue, isHabitScheduledOn } from '../lib/habits'
import { moodValue } from '../lib/mood'
import { EntryList } from './EntryList'
import { HabitStripChip } from './habits/HabitStripChip'
import { MoodPicker } from './mood/MoodPicker'
import { DailyPrompts } from './prompts/DailyPrompts'

interface DailyLogProps {
  journal: Journal
  date: string
  onChangeDate: (date: string) => void
  onTagClick: (tag: string) => void
}

export function DailyLog({ journal, date, onChangeDate, onTagClick }: DailyLogProps) {
  const entries = sortByOrder(journal.entries.filter((e) => e.date === date))
  const scheduledHabits = journal.habits.filter((h) => isHabitScheduledOn(h, date))

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

      <div className="method-caption hidden sm:flex">
        <span>רישום מהיר</span>
        <span>• × &gt; &lt; – ○ ★</span>
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
        onTagClick={onTagClick}
        emptyMessage="עדיין לא נרשם כלום — אפשר להתחיל לכתוב למעלה."
        hideAddOnMobile
      />

      <DailyPrompts journal={journal} date={date} />
    </div>
  )
}
