import { ChevronIcon, MenuIcon } from '../icons/Icons'

interface MobileHeaderProps {
  title: string
  subtitle?: string
  onPrev?: () => void
  onNext?: () => void
  onTitleClick?: () => void
  onMenuClick: () => void
}

/** Mobile-only header: hamburger (main drawer), centered title/subtitle with prev/next paging. */
export function MobileHeader({ title, subtitle, onPrev, onNext, onTitleClick, onMenuClick }: MobileHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-ink/10 px-1 py-3 dark:border-inkdark/10 sm:hidden">
      <button
        type="button"
        onClick={onMenuClick}
        title="תפריט"
        className="flex h-8 w-8 shrink-0 items-center justify-center text-ink/60 dark:text-inkdark/60"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            className="flex h-7 w-7 shrink-0 items-center justify-center text-ink/30 dark:text-inkdark/30"
          >
            <ChevronIcon className="h-3.5 w-3.5 -rotate-90" />
          </button>
        )}
        <button
          type="button"
          onClick={onTitleClick}
          disabled={!onTitleClick}
          className="flex min-w-0 flex-col items-center px-1"
        >
          <span className="truncate text-base font-medium tracking-tight text-ink dark:text-inkdark">{title}</span>
          {subtitle && (
            <span className="truncate text-xs text-ink/40 dark:text-inkdark/40">{subtitle}</span>
          )}
        </button>
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="flex h-7 w-7 shrink-0 items-center justify-center text-ink/30 dark:text-inkdark/30"
          >
            <ChevronIcon className="h-3.5 w-3.5 rotate-90" />
          </button>
        )}
      </div>

      <div className="h-8 w-8 shrink-0" />
    </header>
  )
}
