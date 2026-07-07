import { useState } from 'react'
import { useJournal } from './hooks/useJournal'
import { useTheme } from './hooks/useTheme'
import { useReminders } from './hooks/useReminders'
import { todayISO } from './lib/date'
import { DailyLog } from './components/DailyLog'
import { MonthlyLog } from './components/MonthlyLog'
import { Collections } from './components/Collections'
import { Analytics } from './components/Analytics'
import { Habits } from './components/Habits'
import { Toasts } from './components/Toasts'
import { BellIcon } from './components/icons/Icons'

type View = 'daily' | 'monthly' | 'collections' | 'habits' | 'analytics'

const NAV: { view: View; label: string }[] = [
  { view: 'daily', label: 'יומי' },
  { view: 'monthly', label: 'חודשי' },
  { view: 'collections', label: 'אוספים' },
  { view: 'habits', label: 'הרגלים' },
  { view: 'analytics', label: 'נתונים' },
]

function App() {
  const journal = useJournal()
  const { theme, toggle } = useTheme()
  const reminders = useReminders(journal)

  const [view, setView] = useState<View>('daily')
  const [date, setDate] = useState(todayISO())
  const [month, setMonth] = useState(todayISO())
  const [collectionId, setCollectionId] = useState<string | null>(null)

  const goToDate = (d: string) => {
    setDate(d)
    setView('daily')
  }

  return (
    <div className="min-h-screen bg-paper text-ink dark:bg-paperdark dark:text-inkdark">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-6">
        <header className="flex items-center justify-between gap-3 border-b border-ink/10 py-5 dark:border-inkdark/10">
          <span className="shrink-0 text-[0.95rem] font-medium tracking-tight text-ink dark:text-inkdark">bujo</span>

          <nav className="flex min-w-0 items-center gap-1 overflow-x-auto text-sm">
            {NAV.map((n) => (
              <button
                key={n.view}
                onClick={() => {
                  setView(n.view)
                  if (n.view === 'monthly' || n.view === 'habits') setMonth(date)
                }}
                className={`shrink-0 rounded-full px-3 py-1 transition-colors ${
                  view === n.view
                    ? 'bg-ink/[0.06] text-ink dark:bg-inkdark/[0.08] dark:text-inkdark'
                    : 'text-ink/50 hover:text-ink dark:text-inkdark/50 dark:hover:text-inkdark'
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={reminders.enableReminders}
              title={
                reminders.permission === 'granted'
                  ? 'תזכורות פעילות — פועל כשבujo פתוח בדפדפן זה'
                  : reminders.permission === 'denied'
                    ? 'התראות חסומות — יש לאפשר אותן בהגדרות הדפדפן'
                    : 'הפעלת תזכורות (פועל כשbujo פתוח בדפדפן זה)'
              }
              className={`flex h-7 w-7 items-center justify-center rounded-full ${
                reminders.permission === 'granted'
                  ? 'text-amber-600 dark:text-amber-500'
                  : 'text-ink/50 hover:text-ink dark:text-inkdark/50 dark:hover:text-inkdark'
              }`}
            >
              <BellIcon filled={reminders.permission === 'granted'} className="h-4 w-4" />
            </button>
            <button
              onClick={toggle}
              title="החלפת ערכת נושא"
              className="flex h-7 w-7 items-center justify-center rounded-full text-ink/50 hover:text-ink dark:text-inkdark/50 dark:hover:text-inkdark"
            >
              {theme === 'dark' ? '☾' : '☼'}
            </button>
          </div>
        </header>

        <main className="flex-1 py-8">
          {view === 'daily' && <DailyLog journal={journal} date={date} onChangeDate={setDate} />}
          {view === 'monthly' && (
            <MonthlyLog journal={journal} month={month} onChangeMonth={setMonth} onSelectDate={goToDate} />
          )}
          {view === 'collections' && (
            <Collections journal={journal} selectedId={collectionId} onSelect={setCollectionId} />
          )}
          {view === 'habits' && <Habits journal={journal} month={month} onChangeMonth={setMonth} />}
          {view === 'analytics' && <Analytics journal={journal} />}
        </main>

        <footer className="border-t border-ink/10 py-4 text-center text-xs text-ink/30 dark:border-inkdark/10 dark:text-inkdark/30">
          נשמר מקומית בדפדפן זה
        </footer>
      </div>

      <Toasts
        reminders={reminders.toasts}
        onDismissReminder={reminders.dismissToast}
        undoActions={journal.undoActions}
        onUndo={journal.performUndo}
        onDismissUndo={journal.dismissUndo}
      />
    </div>
  )
}

export default App
