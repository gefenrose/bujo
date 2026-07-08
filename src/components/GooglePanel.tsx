import type { useGoogleAccount } from '../hooks/useGoogleAccount'
import type { useGoogleCalendar } from '../hooks/useGoogleCalendar'
import type { useGoogleDriveBackup } from '../hooks/useGoogleDriveBackup'
import { CloseIcon } from './icons/Icons'

interface GooglePanelProps {
  account: ReturnType<typeof useGoogleAccount>
  calendar: ReturnType<typeof useGoogleCalendar>
  drive: ReturnType<typeof useGoogleDriveBackup>
  onClose: () => void
}

const formatTime = (ts: number) => new Date(ts).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })

export function GooglePanel({ account, calendar, drive, onClose }: GooglePanelProps) {
  const isConnected = account.status === 'connected'

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
          <h2 className="text-sm font-medium text-ink dark:text-inkdark">Google</h2>
          <button
            autoFocus
            onClick={onClose}
            className="text-ink/50 hover:text-ink dark:text-inkdark/50 dark:hover:text-inkdark"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {!account.configured ? (
          <p className="text-sm text-ink/65 dark:text-inkdark/65">
            החיבור ל-Google עדיין לא הוגדר עבור ההתקנה הזו (חסר Client ID).
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {account.error && <p className="text-sm text-red-600 dark:text-red-400">{account.error}</p>}

            <div className="flex flex-col gap-2">
              <p className="text-xs text-ink/65 dark:text-inkdark/65">אילו תכונות להפעיל:</p>
              <label className="flex items-center gap-2 text-sm text-ink/80 dark:text-inkdark/80">
                <input
                  type="checkbox"
                  checked={account.calendarEnabled}
                  onChange={(e) => account.setCalendarEnabled(e.target.checked)}
                  className="h-4 w-4 accent-ink dark:accent-inkdark"
                />
                סנכרון Google Calendar
              </label>
              <label className="flex items-center gap-2 text-sm text-ink/80 dark:text-inkdark/80">
                <input
                  type="checkbox"
                  checked={account.driveEnabled}
                  onChange={(e) => account.setDriveEnabled(e.target.checked)}
                  className="h-4 w-4 accent-ink dark:accent-inkdark"
                />
                גיבוי ל-Google Drive
              </label>
            </div>

            {!isConnected ? (
              <button
                type="button"
                onClick={account.connect}
                disabled={account.status === 'connecting'}
                className="rounded-full bg-ink px-3 py-1.5 text-sm text-paper hover:opacity-90 disabled:opacity-50 dark:bg-inkdark dark:text-paperdark"
              >
                {account.status === 'connecting' ? 'מתחבר…' : 'התחברות לחשבון Google'}
              </button>
            ) : (
              <>
                {account.calendarEnabled && (
                  <div className="border-b border-ink/10 pb-4 dark:border-inkdark/10">
                    <h3 className="mb-1.5 text-xs font-medium text-ink/70 dark:text-inkdark/70">Google Calendar</h3>
                    {!account.hasCalendarScope ? (
                      <GrantHint onReconnect={account.connect} />
                    ) : (
                      <>
                        <p className="mb-2 text-xs text-ink/60 dark:text-inkdark/60">
                          {calendar.lastSyncedAt
                            ? `סונכרן לאחרונה בשעה ${formatTime(calendar.lastSyncedAt)}`
                            : 'טרם בוצע סנכרון'}
                        </p>
                        <button
                          type="button"
                          onClick={calendar.syncNow}
                          disabled={calendar.syncing}
                          className="rounded-full bg-ink px-3 py-1.5 text-sm text-paper hover:opacity-90 disabled:opacity-50 dark:bg-inkdark dark:text-paperdark"
                        >
                          {calendar.syncing ? 'מסנכרן…' : 'סנכרון עכשיו'}
                        </button>
                      </>
                    )}
                  </div>
                )}

                {account.driveEnabled && (
                  <div className="border-b border-ink/10 pb-4 dark:border-inkdark/10">
                    <h3 className="mb-1.5 text-xs font-medium text-ink/70 dark:text-inkdark/70">Google Drive</h3>
                    {!account.hasDriveScope ? (
                      <GrantHint onReconnect={account.connect} />
                    ) : (
                      <>
                        <p className="mb-2 text-xs text-ink/60 dark:text-inkdark/60">
                          {drive.lastBackedUpAt
                            ? `נשמר לאחרונה בשעה ${formatTime(drive.lastBackedUpAt)}`
                            : 'טרם נשמר גיבוי'}
                        </p>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={drive.backupNow}
                            disabled={drive.backingUp}
                            className="rounded-full bg-ink px-3 py-1.5 text-sm text-paper hover:opacity-90 disabled:opacity-50 dark:bg-inkdark dark:text-paperdark"
                          >
                            {drive.backingUp ? 'שומר…' : 'שמירה ל-Drive'}
                          </button>
                          <button
                            type="button"
                            onClick={drive.restoreNow}
                            disabled={drive.restoring}
                            className="text-sm text-ink/60 hover:text-ink disabled:opacity-50 dark:text-inkdark/60 dark:hover:text-inkdark"
                          >
                            {drive.restoring ? 'משחזר…' : 'שחזור מ-Drive'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={account.disconnect}
                  className="text-sm text-ink/50 hover:text-red-600 dark:text-inkdark/50 dark:hover:text-red-400"
                >
                  ניתוק החשבון
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function GrantHint({ onReconnect }: { onReconnect: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <p className="text-xs text-ink/60 dark:text-inkdark/60">ההרשאה הזו טרם ניתנה.</p>
      <button
        type="button"
        onClick={onReconnect}
        className="text-xs text-ink/70 underline hover:text-ink dark:text-inkdark/70 dark:hover:text-inkdark"
      >
        התחברות מחדש
      </button>
    </div>
  )
}
