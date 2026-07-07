import type { ChangeEvent, FocusEvent, KeyboardEvent } from 'react'

interface TimeFieldProps {
  value: string
  onChange: (value: string) => void
  onEnter?: () => void
  autoFocus?: boolean
  className?: string
}

/**
 * A plain-text stand-in for <input type="time">: native time inputs have
 * inconsistent (and in some browsers broken) support, and mirror their
 * internal hour/minute order under RTL page direction. This just accepts
 * free-typed digits ("930", "9:30", "0930") and lets the caller normalize
 * the final value via parseTimeInput at save time.
 */
export function TimeField({ value, onChange, onEnter, autoFocus, className }: TimeFieldProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)
  const handleFocus = (e: FocusEvent<HTMLInputElement>) => e.currentTarget.select()
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onEnter?.()
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      dir="ltr"
      autoFocus={autoFocus}
      value={value}
      onChange={handleChange}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      placeholder="--:--"
      className={className}
    />
  )
}
