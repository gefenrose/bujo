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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 dark:bg-black/50 sm:hidden"
      onClick={onClose}
    >
      <div
        className="symbol-sheet w-full border-t border-ink/30 bg-paper p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] dark:border-inkdark/30 dark:bg-paperdark"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-ink/65 dark:text-inkdark/65">{formatDayHeading(date)}</span>
          <button type="button" onClick={onClose} title="סגירה" className="text-ink/50 hover:text-ink dark:text-inkdark/50 dark:hover:text-inkdark">
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        <EntryInput
          autoFocus
          inputId="mobile-rapid-log-input"
          onSubmit={(text, type, time) => {
            onAdd(text, type, time)
            onClose()
          }}
        />
        <div className="symbol-sheet-key" aria-label="מפתח הסימנים">
          <span><b>•</b> משימה</span>
          <span><b>×</b> הושלמה</span>
          <span><b>&gt;</b> הועברה</span>
          <span><b>&lt;</b> נקבעה</span>
          <span><b>–</b> הערה</span>
          <span><b>○</b> אירוע</span>
          <span className="priority-key"><b>★</b> עדיפות</span>
        </div>
      </div>
    </div>
  )
}
