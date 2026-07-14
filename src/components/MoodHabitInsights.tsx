import { useMemo } from 'react'
import type { Journal } from '../hooks/useJournal'
import {
  completionBuckets,
  habitMoodDifferences,
  moodHabitDays,
  pearsonCorrelation,
} from '../lib/moodHabitStats'

interface MoodHabitInsightsProps {
  journal: Journal
}

const correlationLabel = (value: number | null, days: number) => {
  if (days < 3 || value === null) return 'אין מספיק נתונים'
  const strength = Math.abs(value) < 0.2 ? 'כמעט אין קשר' : Math.abs(value) < 0.5 ? 'קשר מתון' : 'קשר חזק'
  return value >= 0 ? `${strength} חיובי` : `${strength} שלילי`
}

export function MoodHabitInsights({ journal }: MoodHabitInsightsProps) {
  const days = useMemo(
    () => moodHabitDays(journal.habits, journal.habitLogs, journal.moodLogs),
    [journal.habits, journal.habitLogs, journal.moodLogs],
  )
  const correlation = useMemo(() => pearsonCorrelation(days), [days])
  const buckets = useMemo(() => completionBuckets(days), [days])
  const habits = useMemo(
    () => habitMoodDifferences(journal.habits, journal.habitLogs, journal.moodLogs),
    [journal.habits, journal.habitLogs, journal.moodLogs],
  )
  const comparableHabits = habits.filter((habit) => habit.difference !== null)

  return (
    <div className="mood-habit-insights">
      <header className="insights-heading">
        <div>
          <h1>הרגלים ומצב רוח</h1>
          <p>האם בימים שבהם השלמת יותר הרגלים גם הרגשת טוב יותר?</p>
        </div>
        <span>{days.length} ימים עם נתונים משותפים</span>
      </header>

      {days.length < 3 ? (
        <section className="insights-empty">
          <h2>צריך עוד כמה ימים</h2>
          <p>כדי לזהות דפוס, יש לתעד מצב רוח והרגלים באותו יום לפחות שלוש פעמים.</p>
        </section>
      ) : (
        <>
          <section className="association-summary">
            <div>
              <span>הקשר שנמצא</span>
              <strong>{correlationLabel(correlation, days.length)}</strong>
            </div>
            <div>
              <span>מתאם</span>
              <strong>{correlation === null ? '—' : correlation.toFixed(2)}</strong>
            </div>
            <p>זהו קשר סטטיסטי בלבד — הוא לא מוכיח שההרגלים גרמו לשינוי במצב הרוח.</p>
          </section>

          <section className="insights-section">
            <div className="insights-section-heading">
              <h2>מצב רוח לפי השלמת הרגלים</h2>
              <span>ממוצע מתוך 5</span>
            </div>
            <div className="mood-bucket-chart">
              {buckets.map((bucket) => (
                <div key={bucket.key}>
                  <span className="mood-bar-track" aria-hidden="true">
                    <span style={{ height: `${((bucket.averageMood ?? 0) / 5) * 100}%` }} />
                  </span>
                  <strong>{bucket.averageMood === null ? '—' : bucket.averageMood.toFixed(1)}</strong>
                  <span>{bucket.label}</span>
                  <small>{bucket.days} ימים</small>
                </div>
              ))}
            </div>
          </section>

          <section className="insights-section">
            <div className="insights-section-heading">
              <h2>הבדל לפי הרגל</h2>
              <span>מצב רוח ביום שהושלם לעומת יום שלא</span>
            </div>
            {comparableHabits.length > 0 ? (
              <div className="habit-impact-list">
                {comparableHabits.map((habit) => (
                  <div key={habit.habitId}>
                    <div className="habit-impact-copy">
                      <strong>{habit.name}</strong>
                      <small>{habit.completedDays} ימים הושלם · {habit.missedDays} ימים לא הושלם</small>
                    </div>
                    <span className={`habit-impact-value ${(habit.difference ?? 0) < 0 ? 'is-negative' : ''}`}>
                      {(habit.difference ?? 0) > 0 ? '+' : ''}{habit.difference?.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="insights-note">כדי להשוות הרגל מסוים, צריך לפחות יום אחד שבו הושלם ויום אחד שבו לא הושלם — ובשניהם תועד מצב רוח.</p>
            )}
          </section>
        </>
      )}
    </div>
  )
}
