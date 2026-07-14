import { useState } from 'react'
import { useJournal } from './hooks/useJournal'
import { useTheme } from './hooks/useTheme'
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
import { isHabitScheduledOn } from './lib/habits'
import { usePreferences } from './hooks/usePreferences'
import type { Filter } from './types'
import { DailyLog } from './components/DailyLog'
import { WeeklyLog } from './components/WeeklyLog'
import { MonthlyLog } from './components/MonthlyLog'
import { YearlyLog } from './components/YearlyLog'
import { Inbox } from './components/Inbox'
import { Collections } from './components/Collections'
import { DesktopIndex } from './components/DesktopIndex'
import { DesktopDaySidebar } from './components/DesktopDaySidebar'
import { FilterView } from './components/FilterView'
import { SettingsView } from './components/SettingsView'
import { Analytics } from './components/Analytics'
import { Habits } from './components/Habits'
import { Toasts } from './components/Toasts'
import { Search } from './components/Search'
import { GooglePanel } from './components/GooglePanel'
import { MobileHeader } from './components/mobile/MobileHeader'
import { MobileTabBar } from './components/mobile/MobileTabBar'
import { MobileMainDrawer } from './components/mobile/MobileMainDrawer'
import { MobileQuickAdd } from './components/mobile/MobileQuickAdd'
import { BellIcon, CalendarIcon, ChartIcon, InboxIcon, PlusIcon, RepeatIcon, SearchIcon } from './components/icons/Icons'

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
type MobileTabView = 'daily' | 'weekly' | 'monthly' | 'yearly'

const TIME_NAV: { view: View; label: string }[] = [
  { view: 'daily', label: 'יומי' },
  { view: 'weekly', label: 'שבועי' },
  { view: 'monthly', label: 'חודשי' },
]

const MOBILE_TAB_VIEWS: MobileTabView[] = ['daily', 'weekly', 'monthly', 'yearly']

function App() {
  const journal = useJournal()
  const { preferences } = usePreferences()
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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [mobileQuickAddOpen, setMobileQuickAddOpen] = useState(false)
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

  const changeMobileTab = (v: MobileTabView) => {
    setView(v)
    if (v === 'monthly' || v === 'yearly') setMonth(date)
  }

  const iconButton = (active: boolean) =>
    `flex h-7 w-7 items-center justify-center rounded-full ${
      active
        ? 'text-ink dark:text-inkdark'
        : 'text-ink/65 hover:text-ink dark:text-inkdark/65 dark:hover:text-inkdark'
    }`

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

  const scheduledHabitsToday = journal.habits.filter((h) => isHabitScheduledOn(h, date))
  const incompleteToday = preferences.showIncompleteCount
    ? journal.entries.filter((e) => e.date === todayISO() && e.type === 'task' && e.status === 'open').length
    : 0
  const onMainTab = MOBILE_TAB_VIEWS.includes(view as MobileTabView)
  const header = mobileHeaderProps()

  return (
    <div dir="rtl" className="app-shell min-h-screen bg-paper text-ink dark:bg-paperdark dark:text-inkdark">
      <header className="method-header hidden sm:grid">
        <div className="brand-lockup">
          <span className="brand-word">bujo</span>
          <span className="brand-subtitle">המחברת שלך</span>
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
            רישום מהיר
          </button>
          <div className="toolbar-icons">
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
      </header>

      <div className="mobile-shell sm:hidden">

        {view !== 'settings' && (
          <MobileHeader
            title={header.title}
            subtitle={header.subtitle}
            onPrev={header.onPrev}
            onNext={header.onNext}
            onTitleClick={header.onTitleClick}
            onMenuClick={() => setMobileDrawerOpen(true)}
            onSearchClick={() => {
              setSearchQuery('')
              setSearchOpen(true)
            }}
          />
        )}
      </div>

      <div className="method-workspace">
        <DesktopIndex
          journal={journal}
          view={view}
          selectedCollectionId={collectionId}
          onDaily={() => setView('daily')}
          onWeekly={() => setView('weekly')}
          onMonthly={() => {
            setMonth(date)
            setView('monthly')
          }}
          onYearly={() => {
            setMonth(date)
            setView('yearly')
          }}
          onInbox={() => setView('inbox')}
          onSelectCollection={goToCollection}
        />

        <main className="journal-canvas min-w-0 flex-1 pb-40 sm:pb-16">
          <div className="journal-page">
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
            {view === 'analytics' && <Analytics journal={journal} />}
            {view === 'filter' && activeFilter && (
              <FilterView journal={journal} filter={activeFilter} onTagClick={openSearchForTag} />
            )}
            {view === 'settings' && <SettingsView onClose={() => setView(previousView)} />}
            <div className="page-number" aria-hidden="true">196 / 366</div>
          </div>
        </main>

        <DesktopDaySidebar journal={journal} date={date} onOpenHabits={() => setView('habits')} />
      </div>

      <footer className="method-footer hidden sm:flex">
        <span>BUJO · RAPID LOG</span>
        <span>
          {googleDrive.lastBackedUpAt
            ? `נשמר מקומית ומגובה ל-Google Drive · עודכן ${new Date(googleDrive.lastBackedUpAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`
            : 'נשמר מקומית בדפדפן זה'}
        </span>
      </footer>

      {onMainTab && (
        <>
          <button
            type="button"
            onClick={() => setView('habits')}
            title="הרגלים"
          className="mobile-habits-button fixed bottom-20 start-4 z-40 flex items-center gap-1.5 px-4 py-2.5 text-sm sm:hidden"
          >
            <RepeatIcon className="h-4 w-4" />
            הרגלים
            {scheduledHabitsToday.length > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-paper/20 px-1 text-xs dark:bg-paperdark/20">
                {scheduledHabitsToday.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileQuickAddOpen(true)}
            title="הוספת רשומה"
          className="mobile-add-button fixed bottom-20 end-4 z-40 flex h-12 w-12 items-center justify-center sm:hidden"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </>
      )}

      <MobileTabBar view={view} onChangeView={changeMobileTab} incompleteCount={incompleteToday} />

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

      {mobileQuickAddOpen && (
        <MobileQuickAdd
          date={date}
          onAdd={(text, type, time) => journal.addEntry({ text, type, date, time })}
          onClose={() => setMobileQuickAddOpen(false)}
        />
      )}
    </div>
  )
}

export default App
