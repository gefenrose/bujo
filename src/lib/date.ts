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

const WEEKDAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const WEEKDAYS_SHORT = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']
const MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
]
const MONTHS_SHORT = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ', 'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ']

export function formatDayHeading(iso: string): string {
  const d = fromISODate(iso)
  return `יום ${WEEKDAYS[d.getDay()]}, ${d.getDate()} ב${MONTHS[d.getMonth()]}`
}

export function formatMonthHeading(iso: string): string {
  const d = fromISODate(iso)
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function formatShortDate(iso: string): string {
  const d = fromISODate(iso)
  return `${d.getDate()} ב${MONTHS_SHORT[d.getMonth()]}`
}

export function monthShortLabel(iso: string): string {
  return MONTHS_SHORT[fromISODate(iso).getMonth()]
}

export const WEEKDAY_LABELS = WEEKDAYS_SHORT

export function weekdayShort(iso: string): string {
  return WEEKDAYS_SHORT[fromISODate(iso).getDay()]
}

export function isToday(iso: string): boolean {
  return iso === todayISO()
}

/** Formats a "HH:MM" 24h time string using Israeli convention (24h clock). */
export function formatTime(time: string): string {
  return time
}

/**
 * Leniently parses free-typed digits into a "HH:MM" 24h time string.
 * "9" -> "09:00", "930"/"9:30" -> "09:30", "1430" -> "14:30". Empty input -> "".
 */
export function parseTimeInput(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  let hours: number
  let minutes: number
  if (digits.length <= 2) {
    hours = Number(digits)
    minutes = 0
  } else if (digits.length === 3) {
    hours = Number(digits.slice(0, 1))
    minutes = Number(digits.slice(1))
  } else {
    hours = Number(digits.slice(0, 2))
    minutes = Number(digits.slice(2, 4))
  }
  hours = Math.min(23, Math.max(0, hours))
  minutes = Math.min(59, Math.max(0, minutes))
  return `${pad(hours)}:${pad(minutes)}`
}

export function daysInMonth(iso: string): string[] {
  const d = fromISODate(iso)
  const year = d.getFullYear()
  const month = d.getMonth()
  const count = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: count }, (_, i) => toISODate(new Date(year, month, i + 1)))
}

/** Sunday of the week containing this date. */
export function startOfWeek(iso: string): string {
  return addDays(iso, -fromISODate(iso).getDay())
}

export function daysInWeek(iso: string): string[] {
  const start = startOfWeek(iso)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function addWeeks(iso: string, delta: number): string {
  return addDays(iso, delta * 7)
}

export function formatWeekHeading(iso: string): string {
  const start = fromISODate(startOfWeek(iso))
  const end = fromISODate(addDays(startOfWeek(iso), 6))
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} ב${MONTHS[start.getMonth()]} ${start.getFullYear()}`
  }
  return `${start.getDate()} ב${MONTHS_SHORT[start.getMonth()]} – ${end.getDate()} ב${MONTHS_SHORT[end.getMonth()]}`
}
