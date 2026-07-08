import { useMemo } from 'react'
import type { Journal } from '../hooks/useJournal'
import {
  activityGrid,
  buildTaskChains,
  completionRate,
  computeStreaks,
  migrationStats,
  taskOutcomeCounts,
  weekdayActivity,
  weeklyCompletionTrend,
} from '../lib/analytics'
import { habitMonthStats } from '../lib/habits'
import { monthlyMoodAverage, weeklyMoodTrend } from '../lib/mood'
import { todayISO } from '../lib/date'
import { StatTile } from './analytics/StatTile'
import { ActivityHeatmap } from './analytics/ActivityHeatmap'
import { WeeklyCompletionChart } from './analytics/WeeklyCompletionChart'
import { WeekdayBar } from './analytics/WeekdayBar'
import { TaskOutcomeBar } from './analytics/TaskOutcomeBar'
import { MoodTrendChart } from './analytics/MoodTrendChart'

interface AnalyticsProps {
  journal: Journal
}

const pct = (n: number | null) => (n === null ? '—' : `${Math.round(n * 100)}%`)

export function Analytics({ journal }: AnalyticsProps) {
  const { entries } = journal

  const chains = useMemo(() => buildTaskChains(entries), [entries])
  const outcomes = useMemo(() => taskOutcomeCounts(chains), [chains])
  const rate = useMemo(() => completionRate(outcomes), [outcomes])
  const migration = useMemo(() => migrationStats(chains), [chains])
  const streaks = useMemo(() => computeStreaks(entries), [entries])
  const weekdayCounts = useMemo(() => weekdayActivity(entries), [entries])
  const heatmapColumns = useMemo(() => activityGrid(entries), [entries])
  const trend = useMemo(() => weeklyCompletionTrend(chains), [chains])

  const dailyEntryCount = entries.filter((e) => e.date).length

  const currentMonth = todayISO()
  const habitStats = useMemo(
    () => journal.habits.map((h) => ({ habit: h, stats: habitMonthStats(h, journal.habitLogs, currentMonth) })),
    [journal.habits, journal.habitLogs, currentMonth],
  )
  const moodAverage = useMemo(
    () => monthlyMoodAverage(journal.moodLogs, currentMonth),
    [journal.moodLogs, currentMonth],
  )
  const moodTrend = useMemo(() => weeklyMoodTrend(journal.moodLogs), [journal.moodLogs])

  return (
    <div>
      <h1 className="mb-6 text-lg font-medium tracking-tight text-ink dark:text-inkdark">נתונים</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="רצף נוכחי" value={`${streaks.current} ימים`} caption="ימים רצופים של תיעוד" />
        <StatTile label="הרצף הארוך ביותר" value={`${streaks.longest} ימים`} caption="השיא עד כה" />
        <StatTile label="אחוז השלמה" value={pct(rate)} caption={`${outcomes.done} מתוך ${chains.length} משימות`} />
        <StatTile label="רשומות שנרשמו" value={String(dailyEntryCount)} caption="ביומן היומי" />
      </div>

      <section className="mt-9">
        <h2 className="mb-3 text-sm font-medium text-ink/75 dark:text-inkdark/75">עקביות</h2>
        <div className="overflow-x-auto pb-1 pt-4">
          <ActivityHeatmap columns={heatmapColumns} />
        </div>
        <div className="mt-6 max-w-xs">
          <p className="mb-2 text-xs text-ink/65 dark:text-inkdark/65">הימים הפעילים ביותר</p>
          <WeekdayBar counts={weekdayCounts} />
        </div>
      </section>

      <section className="mt-9">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-medium text-ink/75 dark:text-inkdark/75">מצב רוח</h2>
          <span className="text-xs text-ink/60 dark:text-inkdark/60">
            {moodAverage === null ? 'אין נתונים החודש' : `ממוצע ${moodAverage.toFixed(1)} / 5 החודש`}
          </span>
        </div>
        <MoodTrendChart buckets={moodTrend} />
      </section>

      {habitStats.length > 0 && (
        <section className="mt-9">
          <h2 className="mb-3 text-sm font-medium text-ink/75 dark:text-inkdark/75">הרגלים החודש</h2>
          <ul className="flex flex-col gap-1.5">
            {habitStats.map(({ habit, stats }) => (
              <li
                key={habit.id}
                className="flex items-baseline justify-between gap-4 rounded px-1.5 py-1 -mx-1.5 hover:bg-ink/[0.03] dark:hover:bg-inkdark/[0.04]"
              >
                <span className="min-w-0 truncate text-sm text-ink/80 dark:text-inkdark/80">{habit.name}</span>
                <span className="shrink-0 text-xs tabular-nums text-amber-600 dark:text-amber-400">
                  {habit.type === 'check'
                    ? `${pct(stats.rate)} מהימים`
                    : stats.average === null
                      ? 'אין נתונים עדיין'
                      : `ממוצע ${stats.average.toFixed(1)}${habit.target ? ` / ${habit.target}` : ''}`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-9">
        <h2 className="mb-3 text-sm font-medium text-ink/75 dark:text-inkdark/75">אחוז השלמה לאורך זמן</h2>
        <WeeklyCompletionChart buckets={trend} />
      </section>

      <section className="mt-9">
        <h2 className="mb-3 text-sm font-medium text-ink/75 dark:text-inkdark/75">תוצאות המשימות</h2>
        <TaskOutcomeBar counts={outcomes} />
      </section>

      <section className="mt-9">
        <h2 className="mb-3 text-sm font-medium text-ink/75 dark:text-inkdark/75">דפוסי העברה</h2>
        <p className="text-sm text-ink/70 dark:text-inkdark/70">
          {migration.totalCount === 0
            ? 'עדיין לא נרשמו משימות.'
            : `${pct(migration.percentMigrated)} מהמשימות (${migration.migratedCount} מתוך ${migration.totalCount}) הועברו לפחות פעם אחת לפני שהושלמו.`}
        </p>
        {migration.top.length > 0 && (
          <ul className="mt-3 flex flex-col gap-1.5">
            {migration.top.map((chain, i) => (
              <li
                key={`${chain.text}-${i}`}
                className="flex items-baseline justify-between gap-4 rounded px-1.5 py-1 -mx-1.5 hover:bg-ink/[0.03] dark:hover:bg-inkdark/[0.04]"
              >
                <span className="min-w-0 truncate text-sm text-ink/80 dark:text-inkdark/80">{chain.text}</span>
                <span className="shrink-0 text-xs text-orange-600 dark:text-orange-400">
                  הועבר {chain.hops} פעמים
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
