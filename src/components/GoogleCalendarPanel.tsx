import type { useGoogleCalendar } from '../hooks/useGoogleCalendar'
import { CloseIcon } from './icons/Icons'

interface GoogleCalendarPanelProps {
  google: ReturnType<typeof useGoogleCalendar>
  onClose: () => void
}

export function GoogleCalendarPanel({ google, onClose }: GoogleCalendarPanelProps) {
  const isConnected = google.status === 'connected'

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 px-4 pt-20 dark:bg-black/40"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-ink/10 bg-paper p-4 shadow-xl dark:border-inkdark/10 dark:bg-paperdark"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink dark:text-inkdark">Google Calendar</h2>
          <button
            autoFocus
            onClick={onClose}
            className="text-ink/30 hover:text-ink dark:text-inkdark/30 dark:hover:text-inkdark"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {!google.configured ? (
          <p className="text-sm text-ink/50 dark:text-inkdark/50">
            החיבור ל-Google Calendar עדיין לא הוגדר עבור ההתקנה הזו (חסר Client ID).
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-ink/50 dark:text-inkdark/50">
              סנכרון דו-כיווני: רשומות מסוג "אירוע" בעלות תאריך יסתנכרנו בין bujo ל-Google Calendar.
            </p>

            {google.error && <p className="text-sm text-red-600 dark:text-red-400">{google.error}</p>}

            {isConnected ? (
              <>
                <p className="text-xs text-ink/40 dark:text-inkdark/40">
                  {google.lastSyncedAt
                    ? `סונכרן לאחרונה בשעה ${new Date(google.lastSyncedAt).toLocaleTimeString('he-IL', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`
                    : 'טרם בוצע סנכרון'}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={google.syncNow}
                    disabled={google.syncing}
                    className="rounded-full bg-ink px-3 py-1.5 text-sm text-paper hover:opacity-90 disabled:opacity-50 dark:bg-inkdark dark:text-paperdark"
                  >
                    {google.syncing ? 'מסנכרן…' : 'סנכרון עכשיו'}
                  </button>
                  <button
                    type="button"
                    onClick={google.disconnect}
                    className="text-sm text-ink/40 hover:text-red-600 dark:text-inkdark/40 dark:hover:text-red-400"
                  >
                    ניתוק
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={google.connect}
                disabled={google.status === 'connecting'}
                className="rounded-full bg-ink px-3 py-1.5 text-sm text-paper hover:opacity-90 disabled:opacity-50 dark:bg-inkdark dark:text-paperdark"
              >
                {google.status === 'connecting' ? 'מתחבר…' : 'התחברות ל-Google Calendar'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
