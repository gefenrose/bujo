import type { Journal } from '../hooks/useJournal'
import { addDays, formatDayHeading, isToday, todayISO } from '../lib/date'
import { EntryInput } from './EntryInput'
import { EntryRow } from './EntryRow'

interface DailyLogProps {
  journal: Journal
  date: string
  onChangeDate: (date: string) => void
}

export function DailyLog({ journal, date, onChangeDate }: DailyLogProps) {
  const entries = journal.entries
    .filter((e) => e.date === date)
    .sort((a, b) => a.createdAt - b.createdAt)

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

      <div className="flex flex-col">
        {entries.map((entry) => (
          <EntryRow
            key={entry.id}
            entry={entry}
            onToggle={() => journal.cycleStatus(entry.id)}
            onEdit={(text) => journal.updateEntry(entry.id, { text })}
            onDelete={() => journal.deleteEntry(entry.id)}
            onMigrate={() => journal.migrateEntry(entry.id, { toDate: addDays(date, 1) })}
            onTogglePriority={() => journal.togglePriority(entry.id)}
          />
        ))}
        <EntryInput onSubmit={(text, type) => journal.addEntry({ text, type, date })} />
      </div>

      {entries.length === 0 && (
        <p className="mt-2 text-sm text-ink/30 dark:text-inkdark/30">Nothing logged yet — start writing above.</p>
      )}
    </div>
  )
}
