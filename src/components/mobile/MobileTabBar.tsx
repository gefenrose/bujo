type MobileView = 'daily' | 'weekly' | 'monthly' | 'yearly'

interface MobileTabBarProps {
  view: string
  onChangeView: (view: MobileView) => void
}

const TABS: { view: MobileView; label: string }[] = [
  { view: 'daily', label: 'יום' },
  { view: 'weekly', label: 'שבוע' },
  { view: 'monthly', label: 'חודש' },
  { view: 'yearly', label: 'שנה' },
]

/** Mobile-only bottom nav: replaces the desktop top segmented Day/Week/Month control. */
export function MobileTabBar({ view, onChangeView }: MobileTabBarProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-ink/10 bg-paper pb-[env(safe-area-inset-bottom)] dark:border-inkdark/10 dark:bg-paperdark sm:hidden">
      {TABS.map((tab) => (
        <button
          key={tab.view}
          type="button"
          onClick={() => onChangeView(tab.view)}
          className={`flex-1 py-3 text-sm transition-colors ${
            view === tab.view
              ? 'font-medium text-ink dark:text-inkdark'
              : 'text-ink/40 dark:text-inkdark/40'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
