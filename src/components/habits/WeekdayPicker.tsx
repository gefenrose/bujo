const LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

interface WeekdayPickerProps {
  value: number[]
  onChange: (days: number[]) => void
}

/** A 7-toggle weekday picker. An empty/full selection both mean "every day". */
export function WeekdayPicker({ value, onChange }: WeekdayPickerProps) {
  const everyDay = value.length === 0 || value.length === 7

  const toggle = (day: number) => {
    const active = everyDay || value.includes(day)
    const base = everyDay ? [0, 1, 2, 3, 4, 5, 6] : value
    const next = active ? base.filter((d) => d !== day) : [...base, day].sort()
    onChange(next)
  }

  return (
    <div className="flex items-center gap-1">
      {LABELS.map((label, day) => {
        const active = everyDay || value.includes(day)
        return (
          <button
            key={day}
            type="button"
            onClick={() => toggle(day)}
            title={['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]}
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.7rem] transition-colors ${
              active
                ? 'bg-ink/[0.1] text-ink dark:bg-inkdark/[0.12] dark:text-inkdark'
                : 'text-ink/30 hover:text-ink dark:text-inkdark/30 dark:hover:text-inkdark'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
