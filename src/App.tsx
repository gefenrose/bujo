import { useState } from 'react'
import { useJournal } from './hooks/useJournal'
import { useReminders } from './hooks/useReminders'
import { useGoogleAccount } from './hooks/useGoogleAccount'
import { useGoogleCalendar } from './hooks/useGoogleCalendar'
import { useGoogleDriveBackup } from './hooks/useGoogleDriveBackup'
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  isToday,
  mobileDaySubtitle,
  mobileDayTitle,
  mobileWeekSubtitle,
  monthName,
  todayISO,
  yearOf,
} from './lib/date'
import { usePreferences } from './hooks/usePreferences'
import type { Filter } from './types'
import { DailyLog } from './components/DailyLog'
import { WeeklyLog } from './components/WeeklyLog'
import { MonthlyLog } from './components/MonthlyLog'
import { YearlyLog } from './components/YearlyLog'
import { Inbox } from './components/Inbox'
import { Collections } from './components/Collections'
import { FilterView } from './components/FilterView'
import { SettingsView } from './components/SettingsView'
import { MoodHabitInsights } from './components/MoodHabitInsights'
import { Habits } from './components/Habits'
import { Toasts } from './components/Toasts'
import { Search } from './components/Search'
import { GooglePanel } from './components/GooglePanel'
import { MobileHeader } from './components/mobile/MobileHeader'
import { MobileMainDrawer } from './components/mobile/MobileMainDrawer'
import { PlusIcon, SearchIcon } from './components/icons/Icons'
import pressedOliveSprig from './assets/pressed-olive-sprig-v2.png'
import calendarSticker from './assets/calendar-sticker.png'

type View =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'inbox'
  | 'collections'
  | 'habits'
  | 'analytics'
  | 'filter'
  | 'settings'
const TIME_NAV: { view: View; label: string }[] = [
  { view: 'daily', label: 'יומן' },
  { view: 'monthly', label: 'לוח שנה' },
  { view: 'analytics', label: 'תובנות' },
]

function App() {
  const journal = useJournal()
  const { preferences } = usePreferences()
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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<Filter | null>(null)
  const [previousView, setPreviousView] = useState<View>('daily')

  const goToDate = (d: string) => {
    setDate(d)
    setView('daily')
  }

  const goToCollection = (id: string) => {
    setCollectionId(id)
    setView('collections')
  }

  const goToFilter = (filter: Filter) => {
    setActiveFilter(filter)
    setView('filter')
  }

  const openSearchForTag = (tag: string) => {
    setSearchQuery(tag)
    setSearchOpen(true)
  }

  const mobileHeaderProps = (): {
    title: string
    subtitle?: string
    onPrev?: () => void
    onNext?: () => void
    onTitleClick?: () => void
  } => {
    switch (view) {
      case 'daily':
        return {
          title: mobileDayTitle(date),
          subtitle: mobileDaySubtitle(date),
          onPrev: () => setDate(addDays(date, -1)),
          onNext: () => setDate(addDays(date, 1)),
          onTitleClick: isToday(date) ? undefined : () => setDate(todayISO()),
        }
      case 'weekly':
        return {
          title: 'השבוע',
          subtitle: mobileWeekSubtitle(date, preferences.startOfWeek),
          onPrev: () => setDate(addWeeks(date, -1)),
          onNext: () => setDate(addWeeks(date, 1)),
          onTitleClick: () => setDate(todayISO()),
        }
      case 'monthly':
        return {
          title: 'החודש',
          subtitle: monthName(month),
          onPrev: () => setMonth(addMonths(month, -1)),
          onNext: () => setMonth(addMonths(month, 1)),
          onTitleClick: () => setMonth(todayISO()),
        }
      case 'yearly':
        return {
          title: 'השנה',
          subtitle: String(yearOf(month)),
          onPrev: () => setMonth(addYears(month, -1)),
          onNext: () => setMonth(addYears(month, 1)),
          onTitleClick: () => setMonth(todayISO()),
        }
      case 'habits':
        return { title: 'הרגלים' }
      case 'analytics':
        return { title: 'תובנות' }
      case 'inbox':
        return { title: 'תיבת קלט' }
      case 'collections':
        return { title: journal.collections.find((c) => c.id === collectionId)?.name ?? 'אוספים' }
      case 'filter':
        return { title: activeFilter?.name ?? 'סינון' }
      case 'settings':
        return { title: 'העדפות' }
    }
  }

  const header = mobileHeaderProps()

  return (
    <div dir="rtl" className="app-shell min-h-screen bg-paper text-ink dark:bg-paperdark dark:text-inkdark">
      <header className="method-header hidden sm:grid">
        <div className="brand-lockup">
          <span className="brand-word">bujo</span>
        </div>

        <nav className="method-view-nav" aria-label="תצוגות זמן">
          {TIME_NAV.map((n) => (
            <button
              key={n.view}
              onClick={() => {
                setView(n.view)
                if (n.view === 'monthly') setMonth(date)
              }}
              className={view === n.view ? 'is-active' : undefined}
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="method-toolbar">
          <button
            type="button"
            className="rapid-log-button"
            onClick={() => {
              setView('daily')
              requestAnimationFrame(() => document.getElementById('rapid-log-input')?.focus())
            }}
          >
            <PlusIcon className="h-4 w-4" />
            רשומה חדשה
          </button>
          <div className="toolbar-icons">
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSearchOpen(true)
                }}
                title="חיפוש"
                className="minimal-icon-button"
              >
                <SearchIcon className="h-4 w-4" />
              </button>
          </div>
        </div>
      </header>

      <div className="mobile-shell sm:hidden">
        <nav className="mobile-primary-nav" aria-label="ניווט ראשי">
          <span className="brand-word">bujo</span>
          <div>
            <button type="button" className={view === 'daily' ? 'is-active' : undefined} onClick={() => setView('daily')}>יומן</button>
            <button type="button" className={view === 'monthly' ? 'is-active' : undefined} onClick={() => { setMonth(date); setView('monthly') }}>לוח</button>
            <button type="button" className={view === 'analytics' ? 'is-active' : undefined} onClick={() => setView('analytics')}>תובנות</button>
          </div>
          <button type="button" title="חיפוש" onClick={() => { setSearchQuery(''); setSearchOpen(true) }}>
            <SearchIcon className="h-5 w-5" />
          </button>
        </nav>

        {view !== 'settings' && view !== 'analytics' && (
          <MobileHeader
            title={header.title}
            subtitle={header.subtitle}
            onPrev={header.onPrev}
            onNext={header.onNext}
            onTitleClick={header.onTitleClick}
            onSearchClick={() => {
              setSearchQuery('')
              setSearchOpen(true)
            }}
          />
        )}
      </div>

      <div className="method-workspace">
        <main className="journal-canvas min-w-0 flex-1 pb-16">
          <div className="journal-page">
            <div className="journal-stickers" aria-hidden="true">
              <span className="date-tab-sticker">
                <small>{monthName(date)}</small>
                <strong>{Number(date.slice(-2))}</strong>
              </span>
              <img className="calendar-sticker" src={calendarSticker} alt="" />
              <img className="leaf-sticker" src={pressedOliveSprig} alt="" />
            </div>
            {view === 'daily' && (
              <DailyLog journal={journal} date={date} onChangeDate={setDate} onTagClick={openSearchForTag} />
            )}
            {view === 'weekly' && (
              <WeeklyLog journal={journal} date={date} onChangeDate={setDate} onSelectDate={goToDate} />
            )}
            {view === 'monthly' && (
              <MonthlyLog journal={journal} month={month} onChangeMonth={setMonth} onSelectDate={goToDate} />
            )}
            {view === 'yearly' && (
              <YearlyLog journal={journal} month={month} onChangeMonth={setMonth} onSelectDate={goToDate} />
            )}
            {view === 'collections' && (
              <Collections journal={journal} selectedId={collectionId} onTagClick={openSearchForTag} />
            )}
            {view === 'inbox' && <Inbox journal={journal} onTagClick={openSearchForTag} />}
            {view === 'habits' && <Habits journal={journal} date={date} onChangeDate={setDate} />}
            {view === 'analytics' && <MoodHabitInsights journal={journal} />}
            {view === 'filter' && activeFilter && (
              <FilterView journal={journal} filter={activeFilter} onTagClick={openSearchForTag} />
            )}
            {view === 'settings' && <SettingsView onClose={() => setView(previousView)} />}
          </div>
        </main>
      </div>

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

      {mobileDrawerOpen && (
        <MobileMainDrawer
          journal={journal}
          selectedCollectionId={collectionId}
          onSelectCollection={goToCollection}
          onSelectFilter={goToFilter}
          onInbox={() => setView('inbox')}
          onHabits={() => setView('habits')}
          onAnalytics={() => setView('analytics')}
          onSearch={() => {
            setSearchQuery('')
            setSearchOpen(true)
          }}
          onSettings={() => {
            setPreviousView(view)
            setView('settings')
          }}
          onGoogle={() => setGooglePanelOpen(true)}
          googleConnected={googleAccount.status === 'connected'}
          reminderPermission={reminders.permission}
          onEnableReminders={reminders.enableReminders}
          onClose={() => setMobileDrawerOpen(false)}
        />
      )}

    </div>
  )
}

export default App
