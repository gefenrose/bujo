import { useState } from 'react'
import { useJournal } from './hooks/useJournal'
import { useTheme } from './hooks/useTheme'
import { todayISO } from './lib/date'
import { DailyLog } from './components/DailyLog'
import { MonthlyLog } from './components/MonthlyLog'
import { Collections } from './components/Collections'

type View = 'daily' | 'monthly' | 'collections'

const NAV: { view: View; label: string }[] = [
  { view: 'daily', label: 'Daily' },
  { view: 'monthly', label: 'Monthly' },
  { view: 'collections', label: 'Collections' },
]

function App() {
  const journal = useJournal()
  const { theme, toggle } = useTheme()

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
        <header className="flex items-center justify-between border-b border-ink/10 py-5 dark:border-inkdark/10">
          <span className="text-[0.95rem] font-medium tracking-tight text-ink dark:text-inkdark">bujo</span>

          <nav className="flex items-center gap-1 text-sm">
            {NAV.map((n) => (
              <button
                key={n.view}
                onClick={() => {
                  setView(n.view)
                  if (n.view === 'monthly') setMonth(date)
                }}
                className={`rounded-full px-3 py-1 transition-colors ${
                  view === n.view
                    ? 'bg-ink/[0.06] text-ink dark:bg-inkdark/[0.08] dark:text-inkdark'
                    : 'text-ink/50 hover:text-ink dark:text-inkdark/50 dark:hover:text-inkdark'
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>

          <button
            onClick={toggle}
            title="Toggle theme"
            className="flex h-7 w-7 items-center justify-center rounded-full text-ink/50 hover:text-ink dark:text-inkdark/50 dark:hover:text-inkdark"
          >
            {theme === 'dark' ? '☾' : '☼'}
          </button>
        </header>

        <main className="flex-1 py-8">
          {view === 'daily' && <DailyLog journal={journal} date={date} onChangeDate={setDate} />}
          {view === 'monthly' && (
            <MonthlyLog journal={journal} month={month} onChangeMonth={setMonth} onSelectDate={goToDate} />
          )}
          {view === 'collections' && (
            <Collections journal={journal} selectedId={collectionId} onSelect={setCollectionId} />
          )}
        </main>

        <footer className="border-t border-ink/10 py-4 text-center text-xs text-ink/30 dark:border-inkdark/10 dark:text-inkdark/30">
          saved locally in this browser
        </footer>
      </div>
    </div>
  )
}

export default App
