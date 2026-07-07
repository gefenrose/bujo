import { MOOD_LEVELS } from '../../lib/mood'
import { MoodFaceIcon } from '../icons/MoodFaceIcon'

interface MoodPickerProps {
  value: number
  onChange: (value: number) => void
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div className="mb-6 flex items-center gap-1.5">
      <span className="me-1 text-xs text-ink/40 dark:text-inkdark/40">מצב רוח</span>
      {MOOD_LEVELS.map((level) => {
        const selected = value === level.value
        return (
          <button
            key={level.value}
            type="button"
            title={level.label}
            onClick={() => onChange(selected ? 0 : level.value)}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
              selected
                ? `scale-110 bg-ink/[0.08] ring-1 ring-ink/20 dark:bg-inkdark/[0.1] dark:ring-inkdark/20 ${level.text}`
                : 'text-ink/35 opacity-70 hover:opacity-100 dark:text-inkdark/35'
            }`}
          >
            <MoodFaceIcon level={level.value} className="h-5 w-5" />
          </button>
        )
      })}
    </div>
  )
}
