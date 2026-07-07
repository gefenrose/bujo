import type { MoodLog } from '../types'
import { addDays, daysInMonth, formatShortDate, todayISO } from './date'

export interface MoodLevel {
  value: number
  emoji: string
  label: string
  /** background classes for the mood cell/chip at this level, light/dark */
  bg: string
}

export const MOOD_LEVELS: MoodLevel[] = [
  { value: 1, emoji: '😞', label: 'Rough', bg: 'bg-rose-500' },
  { value: 2, emoji: '😕', label: 'Low', bg: 'bg-orange-400' },
  { value: 3, emoji: '😐', label: 'Okay', bg: 'bg-amber-300 dark:bg-amber-400' },
  { value: 4, emoji: '🙂', label: 'Good', bg: 'bg-lime-400 dark:bg-lime-500' },
  { value: 5, emoji: '😄', label: 'Great', bg: 'bg-emerald-500' },
]

export function moodLevel(value: number): MoodLevel | undefined {
  return MOOD_LEVELS.find((l) => l.value === value)
}

export function moodValue(moodLogs: MoodLog[], date: string): number {
  return moodLogs.find((l) => l.date === date)?.value ?? 0
}

export function monthlyMoodAverage(moodLogs: MoodLog[], month: string): number | null {
  const days = daysInMonth(month)
  const values = days.map((d) => moodValue(moodLogs, d)).filter((v) => v > 0)
  return values.length === 0 ? null : values.reduce((a, b) => a + b, 0) / values.length
}

export interface MoodWeekBucket {
  label: string
  average: number | null
}

/** Rolling 7-day buckets ending today, averaging logged mood values in each. */
export function weeklyMoodTrend(moodLogs: MoodLog[], weeks = 8): MoodWeekBucket[] {
  const today = todayISO()
  const buckets: MoodWeekBucket[] = []

  for (let i = weeks - 1; i >= 0; i--) {
    const end = addDays(today, -i * 7)
    const start = addDays(end, -6)
    const values = moodLogs.filter((l) => l.date >= start && l.date <= end).map((l) => l.value)
    const average = values.length === 0 ? null : values.reduce((a, b) => a + b, 0) / values.length
    buckets.push({ label: formatShortDate(end), average })
  }

  return buckets
}
