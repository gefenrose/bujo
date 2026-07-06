import { useState, type KeyboardEvent } from 'react'
import type { EntryType } from '../types'

interface EntryInputProps {
  onSubmit: (text: string, type: EntryType) => void
  placeholder?: string
}

const TYPES: { type: EntryType; glyph: string; label: string }[] = [
  { type: 'task', glyph: '•', label: 'Task' },
  { type: 'event', glyph: '○', label: 'Event' },
  { type: 'note', glyph: '–', label: 'Note' },
]

export function EntryInput({ onSubmit, placeholder = 'Add an entry…' }: EntryInputProps) {
  const [type, setType] = useState<EntryType>('task')
  const [value, setValue] = useState('')

  const submit = () => {
    const text = value.trim()
    if (!text) return
    onSubmit(text, type)
    setValue('')
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
          title="Cycle entry type (task / event / note)"
          className="text-ink/40 hover:text-ink dark:text-inkdark/40 dark:hover:text-inkdark"
        >
          {TYPES.find((t) => t.type === type)?.glyph}
        </button>
      </div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent py-0.5 text-[0.95rem] leading-snug text-ink outline-none placeholder:text-ink/30 dark:text-inkdark dark:placeholder:text-inkdark/30"
      />
    </div>
  )
}
