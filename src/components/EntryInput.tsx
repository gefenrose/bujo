import { useRef, useState, type KeyboardEvent } from 'react'
import type { EntryType } from '../types'
import { parseTimeInput } from '../lib/date'
import { usePreferences } from '../hooks/usePreferences'
import { ClockIcon, CloseIcon } from './icons/Icons'
import { TimeField } from './TimeField'

interface EntryInputProps {
  onSubmit: (text: string, type: EntryType, time?: string) => void
  placeholder?: string
  autoFocus?: boolean
  inputId?: string
}

const TYPES: { type: EntryType; glyph: string; label: string; description: string }[] = [
  { type: 'task', glyph: '•', label: 'משימה', description: 'משהו שצריך לעשות' },
  { type: 'event', glyph: '○', label: 'אירוע', description: 'משהו שקורה בזמן מסוים' },
  { type: 'note', glyph: '–', label: 'הערה', description: 'מידע, רעיון או מחשבה' },
]

const MODIFIER_SYMBOLS = [
  { glyph: '×', label: 'הושלמה', description: 'המשימה בוצעה' },
  { glyph: '>', label: 'הועברה', description: 'עברה ליום אחר' },
  { glyph: '<', label: 'נקבעה', description: 'נכנסה ליומן עתידי' },
  { glyph: '★', label: 'עדיפות', description: 'חשובה במיוחד', priority: true },
]

export function EntryInput({ onSubmit, placeholder = 'מה תרשום?', autoFocus = false, inputId }: EntryInputProps) {
  const { preferences } = usePreferences()
  const [type, setType] = useState<EntryType>(preferences.defaultEntryType)
  const [value, setValue] = useState('')
  const [time, setTime] = useState('')
  const [showTime, setShowTime] = useState(false)
  const [symbolPickerOpen, setSymbolPickerOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const submit = () => {
    const text = value.trim()
    if (!text) return
    onSubmit(text, type, parseTimeInput(time) || undefined)
    setValue('')
    setTime('')
    setShowTime(false)
    setSymbolPickerOpen(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      submit()
      return
    }
    if (e.key === 'Escape') {
      setSymbolPickerOpen(false)
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
    <div
      className="rapid-entry-composer relative flex items-center gap-2.5 px-1.5 py-1 -mx-1.5"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setSymbolPickerOpen(false)
      }}
    >
      <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
        <button
          type="button"
          onClick={() => setSymbolPickerOpen((open) => !open)}
          title={`בחירת סוג רשומה — ${TYPES.find((option) => option.type === type)?.label}`}
          aria-expanded={symbolPickerOpen}
          aria-haspopup="listbox"
          className="text-ink/60 hover:text-ink dark:text-inkdark/60 dark:hover:text-inkdark"
        >
          {TYPES.find((t) => t.type === type)?.glyph}
        </button>
      </div>
      <input
        ref={inputRef}
        id={inputId}
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setSymbolPickerOpen(true)}
        onClick={() => setSymbolPickerOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="rapid-entry-input min-w-0 flex-1 bg-transparent py-0.5 text-[0.95rem] leading-snug text-ink outline-none placeholder:text-ink/50 dark:text-inkdark dark:placeholder:text-inkdark/50"
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
            className="text-ink/50 hover:text-ink dark:text-inkdark/50 dark:hover:text-inkdark"
          >
            <CloseIcon className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowTime(true)}
          title="הוספת שעה"
          className="shrink-0 text-ink/45 hover:text-ink dark:text-inkdark/45 dark:hover:text-inkdark"
        >
          <ClockIcon className="h-3.5 w-3.5" />
        </button>
      )}

      {symbolPickerOpen && (
        <div className="symbol-picker" role="listbox" aria-label="בחירת סמל לרישום מהיר">
          <div className="symbol-picker-heading">
            <strong>מה תרשום?</strong>
            <span>בחר סוג אחד</span>
          </div>
          <div className="symbol-picker-options">
            {TYPES.map((option) => (
              <button
                key={option.type}
                type="button"
                role="option"
                aria-selected={type === option.type}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setType(option.type)
                  setSymbolPickerOpen(false)
                  inputRef.current?.focus()
                }}
                className={type === option.type ? 'is-selected' : undefined}
              >
                <b>{option.glyph}</b>
                <span className="symbol-option-copy">
                  <span>{option.label}</span>
                  <small>{option.description}</small>
                </span>
                <i aria-hidden="true">{type === option.type ? '✓' : ''}</i>
              </button>
            ))}
          </div>
          <div className="symbol-picker-reference-wrap">
            <div className="symbol-picker-reference-heading">סימנים שיופיעו בהמשך</div>
            <div className="symbol-picker-reference" aria-label="משמעות סימני הפעולה">
              {MODIFIER_SYMBOLS.map((symbol) => (
                <span key={symbol.glyph} className={symbol.priority ? 'is-priority' : undefined}>
                  <b>{symbol.glyph}</b>
                  <span>
                    {symbol.label}
                    <small>{symbol.description}</small>
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
