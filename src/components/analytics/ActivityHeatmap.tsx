import type { ActivityDay } from '../../lib/analytics'
import { formatShortDate } from '../../lib/date'

interface ActivityHeatmapProps {
  columns: ActivityDay[][]
}

function levelClass(count: number): string {
  if (count <= 0) return 'bg-ink/[0.06] dark:bg-inkdark/[0.06]'
  if (count === 1) return 'bg-amber-200 dark:bg-amber-950'
  if (count === 2) return 'bg-amber-400 dark:bg-amber-800'
  if (count === 3) return 'bg-amber-500 dark:bg-amber-600'
  return 'bg-amber-700 dark:bg-amber-400'
}

export function ActivityHeatmap({ columns }: ActivityHeatmapProps) {
  const monthLabelForColumn = (col: ActivityDay[], prevCol: ActivityDay[] | undefined) => {
    const firstOfMonth = col.find((d) => d.date.endsWith('-01'))
    if (!firstOfMonth) return null
    if (prevCol?.some((d) => d.date === firstOfMonth.date)) return null
    return formatShortDate(firstOfMonth.date).split(' ')[0]
  }

  return (
    <div>
      <div className="flex gap-[3px]">
        {columns.map((col, i) => {
          const label = monthLabelForColumn(col, columns[i - 1])
          return (
            <div key={col[0]?.date ?? i} className="relative flex flex-col gap-[3px]">
              {label && (
                <span className="absolute -top-4 left-0 text-[0.65rem] text-ink/35 dark:text-inkdark/35">
                  {label}
                </span>
              )}
              {col.map((day) => (
                <div key={day.date} className="group/cell relative">
                  <div
                    className={`h-[11px] w-[11px] rounded-[2px] ${
                      day.future ? 'bg-transparent' : levelClass(day.count)
                    }`}
                  />
                  {!day.future && (
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-1.5 py-0.5 text-[0.7rem] text-paper opacity-0 shadow-sm transition-opacity group-hover/cell:opacity-100 dark:bg-inkdark dark:text-paperdark">
                      {day.count} {day.count === 1 ? 'entry' : 'entries'} · {formatShortDate(day.date)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[0.7rem] text-ink/40 dark:text-inkdark/40">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((n) => (
          <div key={n} className={`h-[11px] w-[11px] rounded-[2px] ${levelClass(n)}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
