import type { Journal } from '../hooks/useJournal'
import { addMonths, daysInMonth, formatMonthHeading, isToday } from '../lib/date'
import { sortByOrder } from '../lib/entries'

interface MonthlyLogProps {
  journal: Journal
  month: string
  onChangeMonth: (month: string) => void
  onSelectDate: (date: string) => void
}

export function MonthlyLog({ journal, month, onChangeMonth, onSelectDate }: MonthlyLogProps) {
  const days = daysInMonth(month)
  const leadingBlanks = new Date(`${days[0]}T12:00:00`).getDay()
  const cells: Array<string | null> = [...Array.from({ length: leadingBlanks }, () => null), ...days]

  return (
    <div>
      <div className="mb-6 hidden items-baseline justify-between sm:flex">
        <h1 className="text-lg font-medium tracking-tight text-ink dark:text-inkdark">
          {formatMonthHeading(month)}
        </h1>
        <div className="flex items-center gap-3 text-sm text-ink/65 dark:text-inkdark/65">
          <button onClick={() => onChangeMonth(addMonths(month, -1))} className="hover:text-ink dark:hover:text-inkdark">
            הקודם
          </button>
          <button onClick={() => onChangeMonth(addMonths(month, 1))} className="hover:text-ink dark:hover:text-inkdark">
            הבא
          </button>
        </div>
      </div>

      <div className="calendar-weekdays" aria-hidden="true">
        {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map((day) => <span key={day}>{day}</span>)}
      </div>

      <div className="calendar-grid">
        {cells.map((date, index) => {
          if (!date) return <span className="calendar-cell is-empty" key={`empty-${index}`} />
          const entries = sortByOrder(journal.entries.filter((e) => e.date === date))
          const day = Number(date.slice(-2))

          return (
            <div
              key={date}
              className={`calendar-cell ${isToday(date) ? 'is-today' : ''}`}
            >
              <button type="button" onClick={() => onSelectDate(date)} className="calendar-day-number">{day}</button>
              <span className="calendar-entry-preview">
                {entries.slice(0, 2).map((entry) => (
                  <span key={entry.id}>
                    <b aria-hidden="true">{entry.type === 'task' ? '•' : entry.type === 'event' ? '○' : '–'}</b>
                    <span>{entry.text}</span>
                  </span>
                ))}
                {entries.length > 2 && <small>+{entries.length - 2}</small>}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
