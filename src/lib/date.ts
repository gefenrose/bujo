const pad = (n: number) => String(n).padStart(2, '0')

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function addDays(iso: string, delta: number): string {
  const d = fromISODate(iso)
  d.setDate(d.getDate() + delta)
  return toISODate(d)
}

export function addMonths(iso: string, delta: number): string {
  const d = fromISODate(iso)
  d.setMonth(d.getMonth() + delta, 1)
  return toISODate(d)
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const WEEKDAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function formatDayHeading(iso: string): string {
  const d = fromISODate(iso)
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`
}

export function formatMonthHeading(iso: string): string {
  const d = fromISODate(iso)
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function formatShortDate(iso: string): string {
  const d = fromISODate(iso)
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`
}

export const WEEKDAY_LABELS = WEEKDAYS_SHORT

export function weekdayShort(iso: string): string {
  return WEEKDAYS_SHORT[fromISODate(iso).getDay()]
}

export function isToday(iso: string): boolean {
  return iso === todayISO()
}

/** Formats a "HH:MM" 24h time string as "h:MM AM/PM". Returns the input unchanged if malformed. */
export function formatTime12h(time: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time)
  if (!match) return time
  const hour24 = Number(match[1])
  const minute = match[2]
  const period = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return `${hour12}:${minute} ${period}`
}

export function daysInMonth(iso: string): string[] {
  const d = fromISODate(iso)
  const year = d.getFullYear()
  const month = d.getMonth()
  const count = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: count }, (_, i) => toISODate(new Date(year, month, i + 1)))
}
