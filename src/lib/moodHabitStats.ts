import type { Habit, HabitLog, MoodLog } from '../types'
import { habitValue, isHabitScheduledOn } from './habits'

export interface MoodHabitDay {
  date: string
  mood: number
  completion: number
}

export interface CompletionBucket {
  key: 'low' | 'medium' | 'high'
  label: string
  averageMood: number | null
  days: number
}

export interface HabitMoodDifference {
  habitId: string
  name: string
  completedAverage: number | null
  missedAverage: number | null
  difference: number | null
  completedDays: number
  missedDays: number
}

const average = (values: number[]) =>
  values.length === 0 ? null : values.reduce((sum, value) => sum + value, 0) / values.length

const completionFor = (habit: Habit, logs: HabitLog[], date: string) => {
  const value = habitValue(logs, habit.id, date)
  if (habit.type === 'check') return value > 0 ? 1 : 0
  return Math.min(value / Math.max(habit.target ?? 1, 1), 1)
}

export function moodHabitDays(habits: Habit[], habitLogs: HabitLog[], moodLogs: MoodLog[]): MoodHabitDay[] {
  return moodLogs.flatMap((mood) => {
    const scheduled = habits.filter((habit) => isHabitScheduledOn(habit, mood.date))
    if (scheduled.length === 0) return []
    const completion = scheduled.reduce((sum, habit) => sum + completionFor(habit, habitLogs, mood.date), 0) / scheduled.length
    return [{ date: mood.date, mood: mood.value, completion }]
  })
}

export function pearsonCorrelation(days: MoodHabitDay[]): number | null {
  if (days.length < 3) return null
  const meanX = days.reduce((sum, day) => sum + day.completion, 0) / days.length
  const meanY = days.reduce((sum, day) => sum + day.mood, 0) / days.length
  let numerator = 0
  let xSquares = 0
  let ySquares = 0
  for (const day of days) {
    const x = day.completion - meanX
    const y = day.mood - meanY
    numerator += x * y
    xSquares += x * x
    ySquares += y * y
  }
  const denominator = Math.sqrt(xSquares * ySquares)
  return denominator === 0 ? null : numerator / denominator
}

export function completionBuckets(days: MoodHabitDay[]): CompletionBucket[] {
  const buckets = [
    { key: 'low' as const, label: 'מעט הרגלים', values: [] as number[] },
    { key: 'medium' as const, label: 'חלק מההרגלים', values: [] as number[] },
    { key: 'high' as const, label: 'רוב ההרגלים', values: [] as number[] },
  ]
  for (const day of days) {
    const index = day.completion < 1 / 3 ? 0 : day.completion < 2 / 3 ? 1 : 2
    buckets[index].values.push(day.mood)
  }
  return buckets.map(({ key, label, values }) => ({ key, label, averageMood: average(values), days: values.length }))
}

export function habitMoodDifferences(
  habits: Habit[],
  habitLogs: HabitLog[],
  moodLogs: MoodLog[],
): HabitMoodDifference[] {
  return habits
    .map((habit) => {
      const relevant = moodLogs.filter((mood) => isHabitScheduledOn(habit, mood.date))
      const completed = relevant.filter((mood) => completionFor(habit, habitLogs, mood.date) >= 1).map((mood) => mood.value)
      const missed = relevant.filter((mood) => completionFor(habit, habitLogs, mood.date) < 1).map((mood) => mood.value)
      const completedAverage = average(completed)
      const missedAverage = average(missed)
      const difference = completedAverage === null || missedAverage === null ? null : completedAverage - missedAverage
      return {
        habitId: habit.id,
        name: habit.name,
        completedAverage,
        missedAverage,
        difference,
        completedDays: completed.length,
        missedDays: missed.length,
      }
    })
    .sort((a, b) => (b.difference ?? -Infinity) - (a.difference ?? -Infinity))
}
