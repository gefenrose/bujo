import type { ReminderToast } from '../hooks/useReminders'
import type { UndoAction } from '../hooks/useJournal'
import { BellIcon, CloseIcon } from './icons/Icons'

interface ToastsProps {
  reminders: ReminderToast[]
  onDismissReminder: (id: string) => void
  undoActions: UndoAction[]
  onUndo: (id: string) => void
  onDismissUndo: (id: string) => void
}

export function Toasts({ reminders, onDismissReminder, undoActions, onUndo, onDismissUndo }: ToastsProps) {
  if (reminders.length === 0 && undoActions.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
      {reminders.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-lg border border-ink/10 bg-paper px-3 py-2.5 shadow-lg dark:border-inkdark/10 dark:bg-paperdark"
        >
          <span className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-500">
            <BellIcon filled className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink dark:text-inkdark">{toast.title}</p>
            <p className="text-xs text-ink/50 dark:text-inkdark/50">{toast.body}</p>
          </div>
          <button
            type="button"
            onClick={() => onDismissReminder(toast.id)}
            className="shrink-0 text-ink/30 hover:text-ink dark:text-inkdark/30 dark:hover:text-inkdark"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      {undoActions.map((action) => (
        <div
          key={action.id}
          className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-lg bg-ink px-3 py-2.5 text-paper shadow-lg dark:bg-inkdark dark:text-paperdark"
        >
          <p className="min-w-0 flex-1 truncate text-sm">{action.label}</p>
          <button
            type="button"
            onClick={() => onUndo(action.id)}
            className="shrink-0 text-sm font-medium text-amber-400 hover:text-amber-300 dark:text-amber-700 dark:hover:text-amber-800"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={() => onDismissUndo(action.id)}
            className="shrink-0 text-paper/40 hover:text-paper dark:text-paperdark/40 dark:hover:text-paperdark"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
