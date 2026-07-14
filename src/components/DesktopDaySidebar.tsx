import type { Journal } from '../hooks/useJournal'
import { habitValue, isHabitScheduledOn } from '../lib/habits'

interface DesktopDaySidebarProps {
  journal: Journal
  date: string
  onOpenHabits: () => void
}

export function DesktopDaySidebar({ journal, date, onOpenHabits }: DesktopDaySidebarProps) {
  const habits = journal.habits.filter((habit) => isHabitScheduledOn(habit, date)).slice(0, 6)
  const migrationQueue = journal.entries
    .filter((entry) => entry.type === 'task' && entry.status === 'open' && entry.date && entry.date < date)
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
    .slice(0, 4)

  return (
    <aside className="day-sidebar hidden sm:flex" aria-label="סיכום היום">
      <section>
        <div className="rail-heading">
          <h2>הרגלים</h2>
          <button type="button" onClick={onOpenHabits}>הצג הכל</button>
        </div>
        {habits.length > 0 ? (
          <div className="habit-ledger">
            {habits.map((habit) => {
              const value = habitValue(journal.habitLogs, habit.id, date)
              const done = value > 0
              return (
                <button
                  type="button"
                  key={habit.id}
                  onClick={() =>
                    habit.type === 'check'
                      ? journal.toggleHabitCheck(habit.id, date)
                      : journal.incrementHabit(habit.id, date, 1)
                  }
                >
                  <span>{habit.name}</span>
                  <span className={done ? 'habit-dot is-done' : 'habit-dot'}>{habit.type === 'count' && value > 0 ? value : ''}</span>
                </button>
              )
            })}
          </div>
        ) : (
          <button type="button" onClick={onOpenHabits} className="rail-empty">
            + יצירת מעקב הרגלים
          </button>
        )}
      </section>

      <section className="migration-section">
        <div className="rail-heading">
          <h2>תור הגירה</h2>
          <span>{migrationQueue.length}</span>
        </div>
        {migrationQueue.length > 0 ? (
          <div className="migration-list">
            {migrationQueue.map((entry) => (
              <div key={entry.id}>
                <span className="migration-copy">{entry.text}</span>
                <button
                  type="button"
                  onClick={() => journal.migrateEntry(entry.id, { toDate: date })}
                  title="העברה ליומן הנוכחי"
                >
                  &gt;
                </button>
                <small>{entry.date?.slice(5).replace('-', '/')}</small>
              </div>
            ))}
          </div>
        ) : (
          <p className="rail-empty">אין משימות פתוחות מיומנים קודמים.</p>
        )}
      </section>

      <section className="reflection-note">
        <span>סקירה יומית</span>
        <p>מה עדיין חשוב מספיק כדי להעביר הלאה?</p>
      </section>
    </aside>
  )
}
