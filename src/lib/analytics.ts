import type { Entry, TaskStatus } from '../types'
import { addDays, formatShortDate, fromISODate, toISODate, todayISO } from './date'

export interface TaskChain {
  /** date the task was first logged (its root entry) */
  rootDate?: string
  text: string
  hops: number
  status: TaskStatus
}

/** Follows migratedFromId links to find, for every task, its final (terminal) status and how many times it was migrated. */
export function buildTaskChains(entries: Entry[]): TaskChain[] {
  const successorOf = new Map<string, Entry>()
  for (const e of entries) {
    if (e.migratedFromId) successorOf.set(e.migratedFromId, e)
  }

  const roots = entries.filter(
    (e) => e.type === 'task' && !e.migratedFromId && (e.date !== undefined || e.collectionId !== undefined),
  )

  return roots.map((root) => {
    let hops = 0
    let terminal = root
    while (successorOf.has(terminal.id)) {
      terminal = successorOf.get(terminal.id)!
      hops++
    }
    return { rootDate: root.date, text: terminal.text, hops, status: terminal.status }
  })
}

export interface OutcomeCounts {
  open: number
  done: number
  migrated: number
  cancelled: number
}

export function taskOutcomeCounts(chains: TaskChain[]): OutcomeCounts {
  const counts: OutcomeCounts = { open: 0, done: 0, migrated: 0, cancelled: 0 }
  for (const c of chains) counts[c.status]++
  return counts
}

export function completionRate(counts: OutcomeCounts): number | null {
  const total = counts.open + counts.done + counts.migrated + counts.cancelled
  return total === 0 ? null : counts.done / total
}

export interface MigrationStats {
  percentMigrated: number | null
  migratedCount: number
  totalCount: number
  top: TaskChain[]
}

export function migrationStats(chains: TaskChain[]): MigrationStats {
  const migrated = chains.filter((c) => c.hops > 0)
  const top = [...migrated].sort((a, b) => b.hops - a.hops).slice(0, 5)
  return {
    percentMigrated: chains.length === 0 ? null : migrated.length / chains.length,
    migratedCount: migrated.length,
    totalCount: chains.length,
    top,
  }
}

export interface WeekBucket {
  label: string
  rate: number | null
  total: number
}

/** Rolling 7-day buckets ending today, bucketing each task chain by the date it was first logged. */
export function weeklyCompletionTrend(chains: TaskChain[], weeks = 8): WeekBucket[] {
  const today = todayISO()
  const buckets: WeekBucket[] = []

  for (let i = weeks - 1; i >= 0; i--) {
    const end = addDays(today, -i * 7)
    const start = addDays(end, -6)
    const inBucket = chains.filter((c) => c.rootDate && c.rootDate >= start && c.rootDate <= end)
    const counts = taskOutcomeCounts(inBucket)
    buckets.push({ label: formatShortDate(end), rate: completionRate(counts), total: inBucket.length })
  }

  return buckets
}

export interface Streaks {
  current: number
  longest: number
  activeDates: Set<string>
}

export function computeStreaks(entries: Entry[]): Streaks {
  const activeDates = new Set(entries.filter((e): e is Entry & { date: string } => Boolean(e.date)).map((e) => e.date))
  const today = todayISO()

  let cursor = activeDates.has(today) ? today : addDays(today, -1)
  let current = 0
  while (activeDates.has(cursor)) {
    current++
    cursor = addDays(cursor, -1)
  }

  const sorted = [...activeDates].sort()
  let longest = 0
  let run = 0
  let prev: string | null = null
  for (const d of sorted) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1
    longest = Math.max(longest, run)
    prev = d
  }

  return { current, longest, activeDates }
}

/** Entry counts by weekday (Sun=0 .. Sat=6), for daily-log entries only. */
export function weekdayActivity(entries: Entry[]): number[] {
  const counts = [0, 0, 0, 0, 0, 0, 0]
  for (const e of entries) {
    if (!e.date) continue
    counts[fromISODate(e.date).getDay()]++
  }
  return counts
}

export interface ActivityDay {
  date: string
  count: number
  future: boolean
}

/** A GitHub-style contribution grid: `weeks` full Sun-Sat columns ending on the current week. */
export function activityGrid(entries: Entry[], weeks = 17): ActivityDay[][] {
  const counts = new Map<string, number>()
  for (const e of entries) {
    if (!e.date) continue
    counts.set(e.date, (counts.get(e.date) ?? 0) + 1)
  }

  const today = fromISODate(todayISO())
  const endOfWeek = new Date(today)
  endOfWeek.setDate(today.getDate() + (6 - today.getDay()))
  const start = new Date(endOfWeek)
  start.setDate(endOfWeek.getDate() - (weeks * 7 - 1))

  const todayISOValue = todayISO()
  const days: ActivityDay[] = []
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const iso = toISODate(d)
    days.push({ date: iso, count: counts.get(iso) ?? 0, future: iso > todayISOValue })
  }

  const columns: ActivityDay[][] = []
  for (let i = 0; i < weeks; i++) columns.push(days.slice(i * 7, i * 7 + 7))
  return columns
}
