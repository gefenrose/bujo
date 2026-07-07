import { MOOD_LEVELS } from '../../lib/mood'

interface MoodPickerProps {
  value: number
  onChange: (value: number) => void
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div className="mb-6 flex items-center gap-1.5">
      <span className="mr-1 text-xs text-ink/40 dark:text-inkdark/40">Mood</span>
      {MOOD_LEVELS.map((level) => {
        const selected = value === level.value
        return (
          <button
            key={level.value}
            type="button"
            title={level.label}
            onClick={() => onChange(selected ? 0 : level.value)}
            className={`flex h-7 w-7 items-center justify-center rounded-full text-base transition-all ${
              selected
                ? 'scale-110 bg-ink/[0.08] ring-1 ring-ink/20 dark:bg-inkdark/[0.1] dark:ring-inkdark/20'
                : 'opacity-40 hover:opacity-80'
            }`}
          >
            {level.emoji}
          </button>
        )
      })}
    </div>
  )
}
