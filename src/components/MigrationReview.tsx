import type { Journal } from '../hooks/useJournal'
import { formatDayHeading, todayISO } from '../lib/date'

interface MigrationReviewProps {
  journal: Journal
  onSelectDate: (date: string) => void
}

export function MigrationReview({ journal, onSelectDate }: MigrationReviewProps) {
  const today = todayISO()
  const openTasks = journal.entries
    .filter((entry) => entry.type === 'task' && entry.status === 'open' && entry.date && entry.date < today)
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? '') || a.createdAt - b.createdAt)

  return (
    <div className="migration-review">
      <header>
        <p>השתקפות</p>
        <h1>מה עדיין ראוי לזמן שלך?</h1>
        <span>עוברים על משימות פתוחות מן היומנים הקודמים: משלימים, מבטלים או מעבירים להיום.</span>
      </header>

      {openTasks.length === 0 ? (
        <div className="migration-review-empty">
          <b>הכול מעודכן.</b>
          <span>אין משימות פתוחות שמחכות להעברה.</span>
        </div>
      ) : (
        <div className="migration-review-list">
          {openTasks.map((entry) => (
            <article key={entry.id}>
              <button type="button" className="migration-source" onClick={() => onSelectDate(entry.date!)}>
                {formatDayHeading(entry.date!)}
              </button>
              <p>{entry.text}</p>
              <div aria-label={`פעולות עבור ${entry.text}`}>
                <button
                  type="button"
                  onClick={() => journal.cycleStatus(entry.id)}
                  title="סימון כהושלמה"
                >
                  × <span>הושלמה</span>
                </button>
                <button
                  type="button"
                  onClick={() => journal.updateEntry(entry.id, { status: 'cancelled' })}
                  title="ביטול המשימה"
                >
                  — <span>לא רלוונטית</span>
                </button>
                <button
                  type="button"
                  className="is-primary"
                  onClick={() => journal.migrateEntry(entry.id, { toDate: today })}
                  title="העברה ליומן של היום"
                >
                  &gt; <span>להעביר להיום</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <footer>
        <span>× הושלמה</span>
        <span>— לא רלוונטית</span>
        <span>&gt; הועברה</span>
      </footer>
    </div>
  )
}
