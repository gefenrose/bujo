import { ChevronIcon } from '../icons/Icons'

interface MobileHeaderProps {
  title: string
  subtitle?: string
  onPrev?: () => void
  onNext?: () => void
  onTitleClick?: () => void
  onSearchClick: () => void
}

/** Mobile-only header: hamburger (main drawer), centered title/subtitle with prev/next paging. */
export function MobileHeader({ title, subtitle, onPrev, onNext, onTitleClick }: MobileHeaderProps) {
  return (
    <header className="method-mobile-header flex items-center justify-center border-b border-ink/20 px-1 py-3 dark:border-inkdark/20 sm:hidden">
      <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            aria-label="התקופה הקודמת"
            className="flex h-7 w-7 shrink-0 items-center justify-center text-ink/50 dark:text-inkdark/50"
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
          <span className="mobile-journal-title truncate text-base font-medium tracking-tight text-ink dark:text-inkdark">{title}</span>
          {subtitle && (
            <span className="truncate text-xs text-ink/60 dark:text-inkdark/60">{subtitle}</span>
          )}
        </button>
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            aria-label="התקופה הבאה"
            className="flex h-7 w-7 shrink-0 items-center justify-center text-ink/50 dark:text-inkdark/50"
          >
            <ChevronIcon className="h-3.5 w-3.5 rotate-90" />
          </button>
        )}
      </div>
    </header>
  )
}
