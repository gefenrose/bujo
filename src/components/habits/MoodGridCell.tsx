import { moodLevel } from '../../lib/mood'

interface MoodGridCellProps {
  value: number
  isToday: boolean
  onChange: (value: number) => void
}

export function MoodGridCell({ value, isToday, onChange }: MoodGridCellProps) {
  const level = moodLevel(value)

  return (
    <button
      type="button"
      onClick={() => onChange(value >= 5 ? 0 : value + 1)}
      title={level ? `${level.label} — click to change` : 'No mood logged — click to set'}
      className={`h-5 w-5 shrink-0 rounded-[4px] transition-colors ${isToday ? 'ring-1 ring-amber-500/60' : ''} ${
        level ? level.bg : 'bg-ink/[0.06] dark:bg-inkdark/[0.06]'
      }`}
    />
  )
}
