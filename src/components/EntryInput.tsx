import { useState, type KeyboardEvent } from 'react'
import type { EntryType } from '../types'
import { parseTimeInput } from '../lib/date'
import { usePreferences } from '../hooks/usePreferences'
import { ClockIcon, CloseIcon } from './icons/Icons'
import { TimeField } from './TimeField'

interface EntryInputProps {
  onSubmit: (text: string, type: EntryType, time?: string) => void
  placeholder?: string
  autoFocus?: boolean
}

const TYPES: { type: EntryType; glyph: string; label: string }[] = [
  { type: 'task', glyph: '•', label: 'משימה' },
  { type: 'event', glyph: '○', label: 'אירוע' },
  { type: 'note', glyph: '–', label: 'הערה' },
]

export function EntryInput({ onSubmit, placeholder = 'הוספת רשומה…', autoFocus = false }: EntryInputProps) {
  const { preferences } = usePreferences()
  const [type, setType] = useState<EntryType>(preferences.defaultEntryType)
  const [value, setValue] = useState('')
  const [time, setTime] = useState('')
  const [showTime, setShowTime] = useState(false)

  const submit = () => {
    const text = value.trim()
    if (!text) return
    onSubmit(text, type, parseTimeInput(time) || undefined)
    setValue('')
    setTime('')
    setShowTime(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      submit()
      return
    }
    // rapid-logging shortcuts at start of an empty input
    if (value === '') {
      if (e.key === 'o' && e.altKey) {
        setType('event')
      } else if (e.key === 'n' && e.altKey) {
        setType('note')
      } else if (e.key === 't' && e.altKey) {
        setType('task')
      }
    }
  }

  return (
    <div className="flex items-center gap-2.5 rounded px-1.5 py-1 -mx-1.5">
      <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
        <button
          type="button"
          onClick={() => setType(TYPES[(TYPES.findIndex((t) => t.type === type) + 1) % TYPES.length].type)}
          title="החלפת סוג הרשומה (משימה / אירוע / הערה)"
          className="text-ink/40 hover:text-ink dark:text-inkdark/40 dark:hover:text-inkdark"
        >
          {TYPES.find((t) => t.type === type)?.glyph}
        </button>
      </div>
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent py-0.5 text-[0.95rem] leading-snug text-ink outline-none placeholder:text-ink/30 dark:text-inkdark dark:placeholder:text-inkdark/30"
      />
      {showTime || time ? (
        <div className="flex shrink-0 items-center gap-1">
          <TimeField
            autoFocus={showTime && !time}
            value={time}
            onChange={setTime}
            onEnter={submit}
            className="w-12 rounded border border-ink/15 bg-transparent px-1 py-0.5 text-xs text-ink outline-none dark:border-inkdark/15 dark:text-inkdark"
          />
          <button
            type="button"
            onClick={() => {
              setTime('')
              setShowTime(false)
            }}
            title="הסרת שעה"
            className="text-ink/30 hover:text-ink dark:text-inkdark/30 dark:hover:text-inkdark"
          >
            <CloseIcon className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowTime(true)}
          title="הוספת שעה"
          className="shrink-0 text-ink/25 hover:text-ink dark:text-inkdark/25 dark:hover:text-inkdark"
        >
          <ClockIcon className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
