import type { Habit, HabitLog } from '../types'
import { daysInMonth } from './date'

export function habitValue(habitLogs: HabitLog[], habitId: string, date: string): number {
  return habitLogs.find((l) => l.habitId === habitId && l.date === date)?.value ?? 0
}

export interface HabitMonthStats {
  /** for 'check' habits: days checked / days in month so far */
  rate: number | null
  /** for 'count' habits: average value across logged days */
  average: number | null
  loggedDays: number
}

export function habitMonthStats(habit: Habit, habitLogs: HabitLog[], month: string): HabitMonthStats {
  const days = daysInMonth(month)
  const values = days.map((d) => habitValue(habitLogs, habit.id, d))

  if (habit.type === 'check') {
    const checked = values.filter((v) => v > 0).length
    return { rate: checked / days.length, average: null, loggedDays: checked }
  }

  const logged = values.filter((v) => v > 0)
  const average = logged.length === 0 ? null : logged.reduce((a, b) => a + b, 0) / logged.length
  return { rate: null, average, loggedDays: logged.length }
}
