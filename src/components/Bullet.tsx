import type { Entry } from '../types'

interface BulletProps {
  entry: Entry
  onClick?: () => void
}

const TYPE_LABEL: Record<Entry['type'], string> = { task: 'משימה', event: 'אירוע', note: 'הערה' }
const STATUS_LABEL: Record<Entry['status'], string> = {
  open: 'פתוחה',
  done: 'הושלמה',
  migrated: 'הועברה',
  cancelled: 'בוטלה',
}

export function Bullet({ entry, onClick }: BulletProps) {
  const clickable = entry.type === 'task' && (entry.status === 'open' || entry.status === 'done')

  return (
    <button
      type="button"
      onClick={clickable ? onClick : undefined}
      aria-label={`${TYPE_LABEL[entry.type]} ${STATUS_LABEL[entry.status]}`}
      className={`mt-[0.5em] flex h-3.5 w-3.5 shrink-0 items-center justify-center ${
        clickable ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      <BulletGlyph entry={entry} />
    </button>
  )
}

function BulletGlyph({ entry }: { entry: Entry }) {
  const ink = 'text-ink/70 dark:text-inkdark/70'

  if (entry.type === 'task') {
    if (entry.status === 'done') {
      return <span className={`text-[0.7rem] leading-none ${ink}`}>✕</span>
    }
    if (entry.status === 'migrated') {
      return <span className={`text-[0.75rem] leading-none ${ink}`}>&gt;</span>
    }
    if (entry.status === 'cancelled') {
      return (
        <span className="relative block h-1.5 w-1.5 rounded-full bg-current text-ink/40 dark:text-inkdark/40">
          <span className="absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-current" />
        </span>
      )
    }
    return <span className="block h-1.5 w-1.5 rounded-full bg-ink/80 dark:bg-inkdark/80" />
  }

  if (entry.type === 'event') {
    return <span className="block h-1.5 w-1.5 rounded-full border border-ink/70 dark:border-inkdark/70" />
  }

  return <span className={`text-sm leading-none ${ink}`}>–</span>
}
