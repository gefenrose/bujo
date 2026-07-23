type MobileView = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'analytics'

interface MobileTabBarProps {
  view: string
  onChangeView: (view: MobileView) => void
  onOpenIndex: () => void
  /** Shown as a small badge on the Day tab, when > 0. */
  incompleteCount?: number
}

const TABS: { view: MobileView; label: string }[] = [
  { view: 'daily', label: 'יומי' },
  { view: 'monthly', label: 'חודשי' },
  { view: 'yearly', label: 'עתידי' },
]

/** Mobile-only bottom nav: replaces the desktop top segmented Day/Week/Month control. */
export function MobileTabBar({ view, onChangeView, onOpenIndex, incompleteCount = 0 }: MobileTabBarProps) {
  return (
    <nav className="method-mobile-tabs fixed inset-x-0 bottom-0 z-30 flex border-t border-ink/20 bg-paper pb-[env(safe-area-inset-bottom)] dark:border-inkdark/20 dark:bg-paperdark sm:hidden">
      {TABS.map((tab) => (
        <button
          key={tab.view}
          type="button"
          onClick={() => onChangeView(tab.view)}
          className={`relative flex-1 py-3 text-sm transition-colors ${
            view === tab.view
              ? 'font-medium text-ink dark:text-inkdark'
              : 'text-ink/60 dark:text-inkdark/60'
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
      <button
        type="button"
        onClick={onOpenIndex}
        className="relative flex-1 py-3 text-sm text-ink/60 transition-colors dark:text-inkdark/60"
      >
        אינדקס
      </button>
    </nav>
  )
}
