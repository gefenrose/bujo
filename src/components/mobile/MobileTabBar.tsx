type MobileView = 'daily' | 'weekly' | 'monthly' | 'yearly'

interface MobileTabBarProps {
  view: string
  onChangeView: (view: MobileView) => void
  /** Shown as a small badge on the Day tab, when > 0. */
  incompleteCount?: number
}

const TABS: { view: MobileView; label: string }[] = [
  { view: 'daily', label: 'יום' },
  { view: 'weekly', label: 'שבוע' },
  { view: 'monthly', label: 'חודש' },
  { view: 'yearly', label: 'שנה' },
]

/** Mobile-only bottom nav: replaces the desktop top segmented Day/Week/Month control. */
export function MobileTabBar({ view, onChangeView, incompleteCount = 0 }: MobileTabBarProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-ink/10 bg-paper pb-[env(safe-area-inset-bottom)] dark:border-inkdark/10 dark:bg-paperdark sm:hidden">
      {TABS.map((tab) => (
        <button
          key={tab.view}
          type="button"
          onClick={() => onChangeView(tab.view)}
          className={`relative flex-1 py-3 text-sm transition-colors ${
            view === tab.view
              ? 'font-medium text-ink dark:text-inkdark'
              : 'text-ink/40 dark:text-inkdark/40'
          }`}
        >
          {tab.label}
          {tab.view === 'daily' && incompleteCount > 0 && (
            <span className="absolute end-[calc(50%-1.4rem)] top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[0.65rem] text-paper dark:bg-amber-400 dark:text-paperdark">
              {incompleteCount}
            </span>
          )}
        </button>
      ))}
    </nav>
  )
}
