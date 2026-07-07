import type { MoodWeekBucket } from '../../lib/mood'
import { moodLevel } from '../../lib/mood'

interface MoodTrendChartProps {
  buckets: MoodWeekBucket[]
}

const CHART_HEIGHT = 88
const MAX = 5

export function MoodTrendChart({ buckets }: MoodTrendChartProps) {
  return (
    <div>
      <div
        dir="ltr"
        className="flex items-end gap-3 border-b border-ink/10 pb-0 dark:border-inkdark/10"
        style={{ height: CHART_HEIGHT }}
      >
        {buckets.map((b, i) => {
          const level = b.average === null ? undefined : moodLevel(Math.round(b.average))
          const barHeight = b.average === null ? 2 : Math.max(3, Math.round((b.average / MAX) * (CHART_HEIGHT - 20)))
          const isLast = i === buckets.length - 1
          return (
            <div key={b.label} className="group/bar relative flex flex-1 flex-col items-center justify-end">
              {b.average !== null && (
                <span
                  className={`mb-1 text-[0.7rem] tabular-nums text-ink/40 opacity-0 transition-opacity group-hover/bar:opacity-100 dark:text-inkdark/40 ${
                    isLast ? '!opacity-100' : ''
                  }`}
                >
                  {b.average.toFixed(1)}
                </span>
              )}
              <div
                className={`w-full max-w-[22px] rounded-t-[4px] ${level ? level.bg : 'bg-ink/10 dark:bg-inkdark/10'}`}
                style={{ height: barHeight }}
              />
              <div
                dir="rtl"
                className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-1.5 py-0.5 text-[0.7rem] text-paper opacity-0 shadow-sm transition-opacity group-hover/bar:opacity-100 dark:bg-inkdark dark:text-paperdark"
              >
                {b.average === null ? 'לא נרשם מצב רוח' : `ממוצע ${b.average.toFixed(1)} / 5`}
              </div>
            </div>
          )
        })}
      </div>
      <div dir="ltr" className="mt-1.5 flex gap-3">
        {buckets.map((b) => (
          <span key={b.label} className="flex-1 text-center text-[0.65rem] text-ink/35 dark:text-inkdark/35">
            {b.label}
          </span>
        ))}
      </div>
    </div>
  )
}
