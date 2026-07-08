import type { ReactNode } from 'react'
import type { NotificationPermissionState } from '../../lib/notifications'
import { BellIcon, CalendarIcon, ChartIcon, CloseIcon, InboxIcon, SearchIcon } from '../icons/Icons'

interface MobileMoreMenuProps {
  onClose: () => void
  onAnalytics: () => void
  onInbox: () => void
  onSearch: () => void
  onGoogle: () => void
  googleConnected: boolean
  reminderPermission: NotificationPermissionState
  onEnableReminders: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function MobileMoreMenu({
  onClose,
  onAnalytics,
  onInbox,
  onSearch,
  onGoogle,
  googleConnected,
  reminderPermission,
  onEnableReminders,
  theme,
  onToggleTheme,
}: MobileMoreMenuProps) {
  const row = (
    onClick: () => void,
    icon: ReactNode,
    label: string,
    active?: boolean,
  ) => (
    <button
      type="button"
      onClick={() => {
        onClick()
        onClose()
      }}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm ${
        active
          ? 'text-amber-600 dark:text-amber-500'
          : 'text-ink/70 hover:bg-ink/[0.04] dark:text-inkdark/70 dark:hover:bg-inkdark/[0.05]'
      }`}
    >
      {icon}
      {label}
    </button>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 px-4 pt-20 dark:bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-ink/10 bg-paper p-2 shadow-xl dark:border-inkdark/10 dark:bg-paperdark"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-2 pb-1 pt-1">
          <span className="text-sm font-medium text-ink dark:text-inkdark">עוד</span>
          <button type="button" onClick={onClose} className="text-ink/30 hover:text-ink dark:text-inkdark/30 dark:hover:text-inkdark">
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col">
          {row(onAnalytics, <ChartIcon className="h-4 w-4" />, 'תובנות')}
          {row(onInbox, <InboxIcon className="h-4 w-4" />, 'תיבת קלט')}
          {row(onSearch, <SearchIcon className="h-4 w-4" />, 'חיפוש')}
          {row(
            onEnableReminders,
            <BellIcon filled={reminderPermission === 'granted'} className="h-4 w-4" />,
            reminderPermission === 'granted' ? 'תזכורות פעילות' : 'הפעלת תזכורות',
            reminderPermission === 'granted',
          )}
          {row(onGoogle, <CalendarIcon className="h-4 w-4" />, 'Google', googleConnected)}
          {row(onToggleTheme, <span className="w-4 text-center leading-none">{theme === 'dark' ? '☾' : '☼'}</span>, 'החלפת ערכת נושא')}
        </div>
      </div>
    </div>
  )
}
