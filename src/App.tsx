import { useState } from 'react'
import { useJournal } from './hooks/useJournal'
import { useTheme } from './hooks/useTheme'
import { useReminders } from './hooks/useReminders'
import { useGoogleAccount } from './hooks/useGoogleAccount'
import { useGoogleCalendar } from './hooks/useGoogleCalendar'
import { useGoogleDriveBackup } from './hooks/useGoogleDriveBackup'
import { todayISO } from './lib/date'
import { DailyLog } from './components/DailyLog'
import { WeeklyLog } from './components/WeeklyLog'
import { MonthlyLog } from './components/MonthlyLog'
import { Inbox } from './components/Inbox'
import { Collections } from './components/Collections'
import { CollectionsShelf } from './components/CollectionsShelf'
import { Analytics } from './components/Analytics'
import { Habits } from './components/Habits'
import { Toasts } from './components/Toasts'
import { Search } from './components/Search'
import { GooglePanel } from './components/GooglePanel'
import { BellIcon, CalendarIcon, ChartIcon, InboxIcon, RepeatIcon, SearchIcon } from './components/icons/Icons'

type View = 'daily' | 'weekly' | 'monthly' | 'inbox' | 'collections' | 'habits' | 'analytics'

const TIME_NAV: { view: View; label: string }[] = [
  { view: 'daily', label: 'יומי' },
  { view: 'weekly', label: 'שבועי' },
  { view: 'monthly', label: 'חודשי' },
]

function App() {
  const journal = useJournal()
  const { theme, toggle } = useTheme()
  const reminders = useReminders(journal)
  const googleAccount = useGoogleAccount()
  const googleCalendar = useGoogleCalendar(googleAccount, journal)
  const googleDrive = useGoogleDriveBackup(googleAccount, journal)

  const [view, setView] = useState<View>('daily')
  const [date, setDate] = useState(todayISO())
  const [month, setMonth] = useState(todayISO())
  const [collectionId, setCollectionId] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [googlePanelOpen, setGooglePanelOpen] = useState(false)

  const goToDate = (d: string) => {
    setDate(d)
    setView('daily')
  }

  const goToCollection = (id: string) => {
    setCollectionId(id)
    setView('collections')
  }

  const openSearchForTag = (tag: string) => {
    setSearchQuery(tag)
    setSearchOpen(true)
  }

  const iconButton = (active: boolean) =>
    `flex h-7 w-7 items-center justify-center rounded-full ${
      active
        ? 'text-ink dark:text-inkdark'
        : 'text-ink/50 hover:text-ink dark:text-inkdark/50 dark:hover:text-inkdark'
    }`

  return (
    <div className="min-h-screen bg-paper text-ink dark:bg-paperdark dark:text-inkdark">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6">
        <header className="flex flex-col gap-3 border-b border-ink/10 py-4 dark:border-inkdark/10 sm:flex-row sm:items-center sm:justify-between sm:py-5">
          <div className="flex items-center justify-between sm:contents">
            <span className="shrink-0 text-[0.95rem] font-medium tracking-tight text-ink dark:text-inkdark">bujo</span>

            <div className="flex shrink-0 items-center gap-1 sm:order-3">
              <button onClick={() => setView('analytics')} title="נתונים" className={iconButton(view === 'analytics')}>
                <ChartIcon className="h-4 w-4" />
              </button>
              <button onClick={() => setView('inbox')} title="תיבת קלט" className={iconButton(view === 'inbox')}>
                <InboxIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setGooglePanelOpen(true)}
                title="Google"
                className={
                  googleAccount.status === 'connected'
                    ? 'flex h-7 w-7 items-center justify-center rounded-full text-amber-600 dark:text-amber-500'
                    : iconButton(false)
                }
              >
                <CalendarIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSearchOpen(true)
                }}
                title="חיפוש"
                className={iconButton(false)}
              >
                <SearchIcon className="h-4 w-4" />
              </button>
              <button
                onClick={reminders.enableReminders}
                title={
                  reminders.permission === 'granted'
                    ? 'תזכורות פעילות — פועל כשבujo פתוח בדפדפן זה'
                    : reminders.permission === 'denied'
                      ? 'התראות חסומות — יש לאפשר אותן בהגדרות הדפדפן'
                      : 'הפעלת תזכורות (פועל כשbujo פתוח בדפדפן זה)'
                }
                className={
                  reminders.permission === 'granted'
                    ? 'flex h-7 w-7 items-center justify-center rounded-full text-amber-600 dark:text-amber-500'
                    : iconButton(false)
                }
              >
                <BellIcon filled={reminders.permission === 'granted'} className="h-4 w-4" />
              </button>
              <button onClick={toggle} title="החלפת ערכת נושא" className={iconButton(false)}>
                {theme === 'dark' ? '☾' : '☼'}
              </button>
            </div>
          </div>

          <nav className="flex items-center gap-1 self-center rounded-full bg-ink/[0.04] p-1 text-sm dark:bg-inkdark/[0.05]">
            {TIME_NAV.map((n) => (
              <button
                key={n.view}
                onClick={() => {
                  setView(n.view)
                  if (n.view === 'monthly') setMonth(date)
                }}
                className={`rounded-full px-3 py-1 transition-colors ${
                  view === n.view
                    ? 'bg-paper text-ink shadow-sm dark:bg-paperdark dark:text-inkdark'
                    : 'text-ink/50 hover:text-ink dark:text-inkdark/50 dark:hover:text-inkdark'
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>
        </header>

        <div className="flex flex-1 flex-col gap-6 py-6 sm:flex-row sm:gap-8 sm:py-8">
          <CollectionsShelf journal={journal} selectedId={collectionId} onSelect={goToCollection} />

          <main className="min-w-0 flex-1 pb-16">
            {view === 'daily' && (
              <DailyLog journal={journal} date={date} onChangeDate={setDate} onTagClick={openSearchForTag} />
            )}
            {view === 'weekly' && (
              <WeeklyLog journal={journal} date={date} onChangeDate={setDate} onSelectDate={goToDate} />
            )}
            {view === 'monthly' && (
              <MonthlyLog journal={journal} month={month} onChangeMonth={setMonth} onSelectDate={goToDate} />
            )}
            {view === 'collections' && (
              <Collections journal={journal} selectedId={collectionId} onTagClick={openSearchForTag} />
            )}
            {view === 'inbox' && <Inbox journal={journal} onTagClick={openSearchForTag} />}
            {view === 'habits' && <Habits journal={journal} date={date} onChangeDate={setDate} />}
            {view === 'analytics' && <Analytics journal={journal} />}
          </main>
        </div>

        <footer className="border-t border-ink/10 py-4 text-center text-xs text-ink/30 dark:border-inkdark/10 dark:text-inkdark/30">
          נשמר מקומית בדפדפן זה
        </footer>
      </div>

      <button
        type="button"
        onClick={() => setView('habits')}
        title="הרגלים"
        className={`fixed bottom-20 end-4 z-40 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-colors hover:opacity-90 sm:bottom-6 sm:end-6 ${
          view === 'habits'
            ? 'bg-amber-500 text-paper dark:bg-amber-400 dark:text-paperdark'
            : 'bg-ink text-paper dark:bg-inkdark dark:text-paperdark'
        }`}
      >
        <RepeatIcon className="h-5 w-5" />
      </button>

      <Toasts
        reminders={reminders.toasts}
        onDismissReminder={reminders.dismissToast}
        undoActions={journal.undoActions}
        onUndo={journal.performUndo}
        onDismissUndo={journal.dismissUndo}
      />

      {searchOpen && (
        <Search
          journal={journal}
          initialQuery={searchQuery}
          onClose={() => setSearchOpen(false)}
          onSelectDate={goToDate}
          onSelectCollection={goToCollection}
        />
      )}

      {googlePanelOpen && (
        <GooglePanel
          account={googleAccount}
          calendar={googleCalendar}
          drive={googleDrive}
          onClose={() => setGooglePanelOpen(false)}
        />
      )}
    </div>
  )
}

export default App
