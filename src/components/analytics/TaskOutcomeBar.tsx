import type { OutcomeCounts } from '../../lib/analytics'

interface Segment {
  key: keyof OutcomeCounts
  label: string
  glyph: string
  barClass: string
  dotClass: string
}

const SEGMENTS: Segment[] = [
  { key: 'done', label: 'Done', glyph: '✕', barClass: 'bg-emerald-600 dark:bg-emerald-500', dotClass: 'bg-emerald-600 dark:bg-emerald-500' },
  { key: 'open', label: 'Still open', glyph: '•', barClass: 'bg-ink/25 dark:bg-inkdark/25', dotClass: 'bg-ink/40 dark:bg-inkdark/40' },
  { key: 'migrated', label: 'Migrated', glyph: '>', barClass: 'bg-orange-500 dark:bg-orange-400', dotClass: 'bg-orange-500 dark:bg-orange-400' },
  { key: 'cancelled', label: 'Cancelled', glyph: '✕', barClass: 'bg-rose-600 dark:bg-rose-400', dotClass: 'bg-rose-600 dark:bg-rose-400' },
]

interface TaskOutcomeBarProps {
  counts: OutcomeCounts
}

export function TaskOutcomeBar({ counts }: TaskOutcomeBarProps) {
  const total = counts.open + counts.done + counts.migrated + counts.cancelled

  if (total === 0) {
    return <p className="text-sm text-ink/30 dark:text-inkdark/30">No tasks logged yet.</p>
  }

  return (
    <div>
      <div className="flex h-4 gap-[2px] overflow-hidden rounded-[4px]">
        {SEGMENTS.map((seg) => {
          const value = counts[seg.key]
          if (value === 0) return null
          return (
            <div
              key={seg.key}
              className={`group/seg relative h-full ${seg.barClass}`}
              style={{ width: `${(value / total) * 100}%` }}
            >
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-1.5 py-0.5 text-[0.7rem] text-paper opacity-0 shadow-sm transition-opacity group-hover/seg:opacity-100 dark:bg-inkdark dark:text-paperdark">
                {seg.label}: {value} ({Math.round((value / total) * 100)}%)
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {SEGMENTS.map((seg) => (
          <span key={seg.key} className="flex items-center gap-1.5 text-xs text-ink/60 dark:text-inkdark/60">
            <span className={`h-2 w-2 rounded-full ${seg.dotClass}`} />
            {seg.label}
            <span className="tabular-nums text-ink/40 dark:text-inkdark/40">{counts[seg.key]}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
