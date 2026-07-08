import type { EntryType } from '../../types'
import { formatDayHeading } from '../../lib/date'
import { EntryInput } from '../EntryInput'
import { CloseIcon } from '../icons/Icons'

interface MobileQuickAddProps {
  date: string
  onAdd: (text: string, type: EntryType, time?: string) => void
  onClose: () => void
}

/** Mobile-only quick-add sheet opened via the floating '+' button; always adds to the shared selected date. */
export function MobileQuickAdd({ date, onAdd, onClose }: MobileQuickAddProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 dark:bg-black/40 sm:hidden"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-2xl border-t border-ink/10 bg-paper p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-xl dark:border-inkdark/10 dark:bg-paperdark"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-ink/65 dark:text-inkdark/65">{formatDayHeading(date)}</span>
          <button type="button" onClick={onClose} className="text-ink/50 hover:text-ink dark:text-inkdark/50 dark:hover:text-inkdark">
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        <EntryInput
          autoFocus
          onSubmit={(text, type, time) => {
            onAdd(text, type, time)
            onClose()
          }}
        />
      </div>
    </div>
  )
}
