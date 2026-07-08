import type { Entry } from '../types'
import type { IconShape } from '../lib/preferences'
import { usePreferences } from '../hooks/usePreferences'
import { CalendarIcon, TriangleIcon } from './icons/Icons'

interface BulletProps {
  entry: Entry
  onClick?: () => void
  /** Overrides the default ink color (e.g. for the "inherit collection color" preference). */
  colorClass?: string
}

const TYPE_LABEL: Record<Entry['type'], string> = { task: 'משימה', event: 'אירוע', note: 'הערה' }
const STATUS_LABEL: Record<Entry['status'], string> = {
  open: 'פתוחה',
  done: 'הושלמה',
  migrated: 'הועברה',
  cancelled: 'בוטלה',
}

export function Bullet({ entry, onClick, colorClass }: BulletProps) {
  const { preferences } = usePreferences()
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
      <BulletGlyph entry={entry} shape={preferences.entryIcons[entry.type]} colorClass={colorClass} />
    </button>
  )
}

function BulletGlyph({ entry, shape, colorClass }: { entry: Entry; shape: IconShape; colorClass?: string }) {
  const ink = colorClass ?? 'text-ink/75 dark:text-inkdark/75'

  if (entry.type === 'task') {
    if (entry.status === 'done') {
      return <span className={`text-[0.7rem] leading-none ${ink}`}>✕</span>
    }
    if (entry.status === 'migrated') {
      return <span className={`text-[0.75rem] leading-none ${ink}`}>&gt;</span>
    }
    if (entry.status === 'cancelled') {
      return (
        <span className={`relative block h-1.5 w-1.5 rounded-full bg-current text-ink/60 dark:text-inkdark/60`}>
          <span className="absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-current" />
        </span>
      )
    }
  }

  return <ShapeGlyph shape={shape} className={ink} />
}

function ShapeGlyph({ shape, className }: { shape: IconShape; className: string }) {
  switch (shape) {
    case 'square':
      return <span className={`block h-2.5 w-2.5 rounded-[2px] border border-current ${className}`} />
    case 'circle':
      return <span className={`block h-1.5 w-1.5 rounded-full border border-current ${className}`} />
    case 'triangle':
      return <TriangleIcon className={`h-2.5 w-2.5 ${className}`} />
    case 'dash':
      return <span className={`text-sm leading-none ${className}`}>–</span>
    case 'calendar':
      return <CalendarIcon className={`h-3 w-3 ${className}`} />
    case 'dot':
    default:
      return <span className={`block h-1.5 w-1.5 rounded-full bg-current ${className}`} />
  }
}
