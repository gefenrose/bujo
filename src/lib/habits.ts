import type { Habit, HabitLog } from '../types'
import { daysInMonth, fromISODate } from './date'

export function habitValue(habitLogs: HabitLog[], habitId: string, date: string): number {
  return habitLogs.find((l) => l.habitId === habitId && l.date === date)?.value ?? 0
}

/** Whether a habit is scheduled on the given date's weekday. No/all-7 days means every day. */
export function isHabitScheduledOn(habit: Habit, date: string): boolean {
  if (!habit.days || habit.days.length === 0 || habit.days.length === 7) return true
  return habit.days.includes(fromISODate(date).getDay())
}

export interface HabitMonthStats {
  /** for 'check' habits: scheduled days checked / scheduled days in month so far */
  rate: number | null
  /** for 'count' habits: average value across logged days */
  average: number | null
  loggedDays: number
  scheduledDays: number
}

export function habitMonthStats(habit: Habit, habitLogs: HabitLog[], month: string): HabitMonthStats {
  const scheduled = daysInMonth(month).filter((d) => isHabitScheduledOn(habit, d))
  const values = scheduled.map((d) => habitValue(habitLogs, habit.id, d))

  if (habit.type === 'check') {
    const checked = values.filter((v) => v > 0).length
    return {
      rate: scheduled.length === 0 ? null : checked / scheduled.length,
      average: null,
      loggedDays: checked,
      scheduledDays: scheduled.length,
    }
  }

  const logged = values.filter((v) => v > 0)
  const average = logged.length === 0 ? null : logged.reduce((a, b) => a + b, 0) / logged.length
  return { rate: null, average, loggedDays: logged.length, scheduledDays: scheduled.length }
}
