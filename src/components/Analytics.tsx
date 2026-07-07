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
import { todayISO } from '../lib/date'
import { StatTile } from './analytics/StatTile'
import { ActivityHeatmap } from './analytics/ActivityHeatmap'
import { WeeklyCompletionChart } from './analytics/WeeklyCompletionChart'
import { WeekdayBar } from './analytics/WeekdayBar'
import { TaskOutcomeBar } from './analytics/TaskOutcomeBar'

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

  return (
    <div>
      <h1 className="mb-6 text-lg font-medium tracking-tight text-ink dark:text-inkdark">Analytics</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Current streak" value={`${streaks.current}d`} caption="consecutive days journaled" />
        <StatTile label="Longest streak" value={`${streaks.longest}d`} caption="best run so far" />
        <StatTile label="Completion rate" value={pct(rate)} caption={`${outcomes.done} of ${chains.length} tasks`} />
        <StatTile label="Entries logged" value={String(dailyEntryCount)} caption="in the daily log" />
      </div>

      <section className="mt-9">
        <h2 className="mb-3 text-sm font-medium text-ink/70 dark:text-inkdark/70">Consistency</h2>
        <div className="overflow-x-auto pb-1 pt-4">
          <ActivityHeatmap columns={heatmapColumns} />
        </div>
        <div className="mt-6 max-w-xs">
          <p className="mb-2 text-xs text-ink/50 dark:text-inkdark/50">Most active days</p>
          <WeekdayBar counts={weekdayCounts} />
        </div>
      </section>

      {habitStats.length > 0 && (
        <section className="mt-9">
          <h2 className="mb-3 text-sm font-medium text-ink/70 dark:text-inkdark/70">Habits this month</h2>
          <ul className="flex flex-col gap-1.5">
            {habitStats.map(({ habit, stats }) => (
              <li
                key={habit.id}
                className="flex items-baseline justify-between gap-4 rounded px-1.5 py-1 -mx-1.5 hover:bg-ink/[0.03] dark:hover:bg-inkdark/[0.04]"
              >
                <span className="min-w-0 truncate text-sm text-ink/80 dark:text-inkdark/80">{habit.name}</span>
                <span className="shrink-0 text-xs tabular-nums text-amber-600 dark:text-amber-400">
                  {habit.type === 'check'
                    ? `${pct(stats.rate)} of days`
                    : stats.average === null
                      ? 'no data yet'
                      : `avg ${stats.average.toFixed(1)}${habit.target ? ` / ${habit.target}` : ''}`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-9">
        <h2 className="mb-3 text-sm font-medium text-ink/70 dark:text-inkdark/70">Completion rate over time</h2>
        <WeeklyCompletionChart buckets={trend} />
      </section>

      <section className="mt-9">
        <h2 className="mb-3 text-sm font-medium text-ink/70 dark:text-inkdark/70">Task outcomes</h2>
        <TaskOutcomeBar counts={outcomes} />
      </section>

      <section className="mt-9">
        <h2 className="mb-3 text-sm font-medium text-ink/70 dark:text-inkdark/70">Migration patterns</h2>
        <p className="text-sm text-ink/60 dark:text-inkdark/60">
          {migration.totalCount === 0
            ? 'No tasks logged yet.'
            : `${pct(migration.percentMigrated)} of tasks (${migration.migratedCount} of ${migration.totalCount}) were migrated at least once before being resolved.`}
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
                  moved {chain.hops}×
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
