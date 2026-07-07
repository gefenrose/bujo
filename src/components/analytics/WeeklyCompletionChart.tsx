import type { WeekBucket } from '../../lib/analytics'

interface WeeklyCompletionChartProps {
  buckets: WeekBucket[]
}

const CHART_HEIGHT = 88

export function WeeklyCompletionChart({ buckets }: WeeklyCompletionChartProps) {
  return (
    <div>
      <div
        className="flex items-end gap-3 border-b border-ink/10 pb-0 dark:border-inkdark/10"
        style={{ height: CHART_HEIGHT }}
      >
        {buckets.map((b, i) => {
          const pct = b.rate === null ? 0 : Math.round(b.rate * 100)
          const barHeight = b.rate === null ? 2 : Math.max(3, Math.round(b.rate * (CHART_HEIGHT - 20)))
          const isLast = i === buckets.length - 1
          return (
            <div key={b.label} className="group/bar relative flex flex-1 flex-col items-center justify-end">
              {b.rate !== null && (
                <span
                  className={`mb-1 text-[0.7rem] tabular-nums text-ink/40 opacity-0 transition-opacity group-hover/bar:opacity-100 dark:text-inkdark/40 ${
                    isLast ? '!opacity-100' : ''
                  }`}
                >
                  {pct}%
                </span>
              )}
              <div
                className={`w-full max-w-[22px] rounded-t-[4px] ${
                  b.rate === null ? 'bg-ink/10 dark:bg-inkdark/10' : 'bg-amber-500 dark:bg-amber-400'
                }`}
                style={{ height: barHeight }}
              />
              <div
                dir="rtl"
                className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-1.5 py-0.5 text-[0.7rem] text-paper opacity-0 shadow-sm transition-opacity group-hover/bar:opacity-100 dark:bg-inkdark dark:text-paperdark"
              >
                {b.total === 0 ? 'לא נרשמו משימות' : `${pct}% מתוך ${b.total} משימות`}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-1.5 flex gap-3">
        {buckets.map((b) => (
          <span key={b.label} className="flex-1 text-center text-[0.65rem] text-ink/35 dark:text-inkdark/35">
            {b.label}
          </span>
        ))}
      </div>
    </div>
  )
}
