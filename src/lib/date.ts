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

export function addYears(iso: string, delta: number): string {
  const d = fromISODate(iso)
  d.setFullYear(d.getFullYear() + delta, d.getMonth(), 1)
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

export function monthName(iso: string): string {
  return MONTHS[fromISODate(iso).getMonth()]
}

export function yearOf(iso: string): number {
  return fromISODate(iso).getFullYear()
}

export function monthsInYear(iso: string): string[] {
  const year = yearOf(iso)
  return Array.from({ length: 12 }, (_, i) => toISODate(new Date(year, i, 1)))
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

/** Formats a "HH:MM" 24h time string, either as-is (24h) or converted to a 12h clock with Hebrew AM/PM. */
export function formatTime(time: string, format: '24h' | '12h' = '24h'): string {
  if (format === '24h') return time
  const [h, m] = time.split(':').map(Number)
  const period = h < 12 ? 'לפנה"צ' : 'אחה"צ'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${pad(m)} ${period}`
}

/** Subtracts N minutes from a "HH:MM" time string, clamping at 00:00 (never wraps to the previous day). */
export function subtractMinutesFromTime(time: string, minutes: number): string {
  if (minutes <= 0) return time
  const [h, m] = time.split(':').map(Number)
  const total = Math.max(0, h * 60 + m - minutes)
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`
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

/** First day (Sunday, or Monday if startDay=1) of the week containing this date. */
export function startOfWeek(iso: string, startDay: 0 | 1 = 0): string {
  const dow = fromISODate(iso).getDay()
  const offset = (dow - startDay + 7) % 7
  return addDays(iso, -offset)
}

export function daysInWeek(iso: string, startDay: 0 | 1 = 0): string[] {
  const start = startOfWeek(iso, startDay)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function addWeeks(iso: string, delta: number): string {
  return addDays(iso, delta * 7)
}

export function formatWeekHeading(iso: string, startDay: 0 | 1 = 0): string {
  const start = fromISODate(startOfWeek(iso, startDay))
  const end = fromISODate(addDays(startOfWeek(iso, startDay), 6))
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} ב${MONTHS[start.getMonth()]} ${start.getFullYear()}`
  }
  return `${start.getDate()} ב${MONTHS_SHORT[start.getMonth()]} – ${end.getDate()} ב${MONTHS_SHORT[end.getMonth()]}`
}

/** 1-indexed week number within its year, counting weeks from Jan 1 using the given start-of-week day. */
export function weekOfYear(iso: string, startDay: 0 | 1 = 0): number {
  const start = fromISODate(startOfWeek(iso, startDay))
  const jan1 = new Date(start.getFullYear(), 0, 1)
  const diffDays = Math.round((start.getTime() - jan1.getTime()) / 86_400_000)
  return Math.floor(diffDays / 7) + 1
}

/** Short mobile-header title for the Day view: "היום" or the long weekday name. */
export function mobileDayTitle(iso: string): string {
  return isToday(iso) ? 'היום' : `יום ${WEEKDAYS[fromISODate(iso).getDay()]}`
}

export function mobileDaySubtitle(iso: string): string {
  const d = fromISODate(iso)
  return `יום ${WEEKDAYS_SHORT[d.getDay()]}, ${d.getDate()} ב${MONTHS_SHORT[d.getMonth()]}`
}

export function mobileWeekSubtitle(iso: string, startDay: 0 | 1 = 0): string {
  return `שבוע ${weekOfYear(iso, startDay)} · ${fromISODate(startOfWeek(iso, startDay)).getFullYear()}`
}
