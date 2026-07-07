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

export function daysInMonth(iso: string): string[] {
  const d = fromISODate(iso)
  const year = d.getFullYear()
  const month = d.getMonth()
  const count = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: count }, (_, i) => toISODate(new Date(year, month, i + 1)))
}
