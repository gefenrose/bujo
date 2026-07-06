const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface WeekdayBarProps {
  counts: number[]
}

export function WeekdayBar({ counts }: WeekdayBarProps) {
  const max = Math.max(1, ...counts)

  return (
    <div className="flex flex-col gap-1.5">
      {counts.map((count, i) => (
        <div key={WEEKDAYS[i]} className="flex items-center gap-2.5">
          <span className="w-8 shrink-0 text-xs text-ink/50 dark:text-inkdark/50">{WEEKDAYS[i].slice(0, 3)}</span>
          <div className="h-3.5 flex-1">
            <div
              className="h-3.5 min-w-[3px] rounded-[4px] bg-amber-500 dark:bg-amber-400"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span className="w-6 shrink-0 text-right text-xs tabular-nums text-ink/40 dark:text-inkdark/40">
            {count}
          </span>
        </div>
      ))}
    </div>
  )
}
