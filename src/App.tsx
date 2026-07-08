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
import { CollectionsShelf } from './components/CollectionsShelf'
import { FilterView } from './components/FilterView'
import { SettingsView } from './components/SettingsView'
import { Analytics } from './components/Analytics'
import { Habits } from './components/Habits'
import { Toasts } from './components/Toasts'
import { Search } from './components/Search'
import { GooglePanel } from './components/GooglePanel'
import { MobileHeader } from './components/mobile/MobileHeader'
import { MobileTabBar } from './components/mobile/MobileTabBar'
import { MobileMoreMenu } from './components/mobile/MobileMoreMenu'
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
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false)
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
        : 'text-ink/50 hover:text-ink dark:text-inkdark/50 dark:hover:text-inkdark'
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
    <div className="min-h-screen bg-paper text-ink dark:bg-paperdark dark:text-inkdark">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6">
        <header className="hidden border-b border-ink/10 py-4 dark:border-inkdark/10 sm:flex sm:flex-row sm:items-center sm:justify-between sm:py-5">
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

        {view !== 'settings' && (
          <MobileHeader
            title={header.title}
            subtitle={header.subtitle}
            onPrev={header.onPrev}
            onNext={header.onNext}
            onTitleClick={header.onTitleClick}
            onMenuClick={() => setMobileDrawerOpen(true)}
            onMoreClick={() => setMobileMoreOpen(true)}
            moreActive={googleAccount.status === 'connected' || reminders.permission === 'granted'}
          />
        )}

        <div className="flex flex-1 flex-col gap-6 py-6 sm:flex-row sm:gap-8 sm:py-8">
          <div className="hidden sm:contents">
            <CollectionsShelf journal={journal} selectedId={collectionId} onSelect={goToCollection} />
          </div>

          <main className="min-w-0 flex-1 pb-40 sm:pb-16">
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
          </main>
        </div>

        <footer className="hidden border-t border-ink/10 py-4 text-center text-xs text-ink/30 dark:border-inkdark/10 dark:text-inkdark/30 sm:block">
          {googleDrive.lastBackedUpAt
            ? `נשמר מקומית ומגובה ל-Google Drive · עודכן לאחרונה בשעה ${new Date(googleDrive.lastBackedUpAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`
            : 'נשמר מקומית בדפדפן זה'}
        </footer>
      </div>

      {onMainTab && (
        <>
          <button
            type="button"
            onClick={() => setView('habits')}
            title="הרגלים"
            className="fixed bottom-20 start-4 z-40 flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-sm text-paper shadow-lg transition-colors hover:opacity-90 dark:bg-inkdark dark:text-paperdark sm:hidden"
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
            className="fixed bottom-20 end-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-paper shadow-lg transition-colors hover:opacity-90 dark:bg-inkdark dark:text-paperdark sm:hidden"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() => setView('habits')}
        title="הרגלים"
        className={`fixed bottom-6 end-6 z-40 hidden h-12 w-12 items-center justify-center rounded-full shadow-lg transition-colors hover:opacity-90 sm:flex ${
          view === 'habits'
            ? 'bg-amber-500 text-paper dark:bg-amber-400 dark:text-paperdark'
            : 'bg-ink text-paper dark:bg-inkdark dark:text-paperdark'
        }`}
      >
        <RepeatIcon className="h-5 w-5" />
      </button>

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
          onSearch={() => {
            setSearchQuery('')
            setSearchOpen(true)
          }}
          onSettings={() => {
            setPreviousView(view)
            setView('settings')
          }}
          onClose={() => setMobileDrawerOpen(false)}
        />
      )}

      {mobileMoreOpen && (
        <MobileMoreMenu
          onClose={() => setMobileMoreOpen(false)}
          onAnalytics={() => setView('analytics')}
          onInbox={() => setView('inbox')}
          onSearch={() => {
            setSearchQuery('')
            setSearchOpen(true)
          }}
          onGoogle={() => setGooglePanelOpen(true)}
          googleConnected={googleAccount.status === 'connected'}
          reminderPermission={reminders.permission}
          onEnableReminders={reminders.enableReminders}
          theme={theme}
          onToggleTheme={toggle}
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
