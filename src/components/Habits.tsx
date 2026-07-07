import { useState } from 'react'
import type { Journal } from '../hooks/useJournal'
import type { HabitType } from '../types'
import { daysInWeek, isToday, parseTimeInput, weekdayShort } from '../lib/date'
import { habitValue, isHabitScheduledOn } from '../lib/habits'
import { HabitManageRow } from './habits/HabitManageRow'
import { HabitRow } from './habits/HabitRow'
import { WeekdayPicker } from './habits/WeekdayPicker'
import { TimeField } from './TimeField'

interface HabitsProps {
  journal: Journal
  date: string
  onChangeDate: (date: string) => void
}

export function Habits({ journal, date, onChangeDate }: HabitsProps) {
  const [managing, setManaging] = useState(false)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<HabitType>('check')
  const [target, setTarget] = useState(5)
  const [days, setDays] = useState<number[]>([])
  const [time, setTime] = useState('')

  const commitCreate = () => {
    const trimmed = name.trim()
    setCreating(false)
    setName('')
    setType('check')
    setTarget(5)
    setDays([])
    setTime('')
    if (!trimmed) return
    journal.addHabit({ name: trimmed, type, target, days, time: parseTimeInput(time) })
  }

  const week = daysInWeek(date)
  const scheduledHabits = journal.habits.filter((h) => isHabitScheduledOn(h, date))

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-lg font-medium tracking-tight text-ink dark:text-inkdark">הרגלים</h1>
        <button
          onClick={() => setManaging((v) => !v)}
          className="text-sm text-ink/50 hover:text-ink dark:text-inkdark/50 dark:hover:text-inkdark"
        >
          {managing ? 'סגירה' : 'ניהול'}
        </button>
      </div>

      <div className="mb-6 flex items-center justify-between">
        {week.map((d) => (
          <button
            key={d}
            onClick={() => onChangeDate(d)}
            className={`flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 transition-colors ${
              d === date
                ? 'bg-ink/[0.06] dark:bg-inkdark/[0.08]'
                : 'hover:bg-ink/[0.03] dark:hover:bg-inkdark/[0.04]'
            }`}
          >
            <span
              className={`text-[0.65rem] uppercase ${
                d === date ? 'text-ink/50 dark:text-inkdark/50' : 'text-ink/30 dark:text-inkdark/30'
              }`}
            >
              {weekdayShort(d)}
            </span>
            <span
              className={`text-sm tabular-nums ${
                isToday(d)
                  ? 'font-medium text-amber-600 dark:text-amber-400'
                  : 'text-ink/70 dark:text-inkdark/70'
              }`}
            >
              {Number(d.slice(-2))}
            </span>
          </button>
        ))}
      </div>

      {scheduledHabits.length === 0 ? (
        <p className="text-sm text-ink/40 dark:text-inkdark/40">
          עדיין אין הרגלים — אפשר להוסיף אחד דרך "ניהול" כדי להתחיל לעקוב (מים, צעדים, שינה...).
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {scheduledHabits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              value={habitValue(journal.habitLogs, habit.id, date)}
              onToggle={() => journal.toggleHabitCheck(habit.id, date)}
              onIncrement={() => journal.incrementHabit(habit.id, date, 1)}
              onDecrement={() => journal.incrementHabit(habit.id, date, -1)}
            />
          ))}
        </div>
      )}

      {managing && (
        <div className="mt-6 flex flex-col gap-1 border-t border-ink/10 pt-4 dark:border-inkdark/10">
          {journal.habits.map((habit) => (
            <HabitManageRow
              key={habit.id}
              habit={habit}
              onSave={(patch) => journal.updateHabit(habit.id, patch)}
              onDelete={() => journal.deleteHabit(habit.id)}
            />
          ))}

          <div className="mt-3">
            {creating ? (
              <div className="flex flex-col gap-3 rounded-lg border border-ink/10 p-3 dark:border-inkdark/10">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="שם ההרגל (למשל מים, צעדים, שינה)"
                    className="min-w-[10rem] flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/30 dark:text-inkdark dark:placeholder:text-inkdark/30"
                  />
                  <div className="flex items-center gap-1 rounded-full border border-ink/10 p-0.5 text-xs dark:border-inkdark/10">
                    <button
                      type="button"
                      onClick={() => setType('check')}
                      className={`rounded-full px-2.5 py-1 ${
                        type === 'check'
                          ? 'bg-ink/[0.08] text-ink dark:bg-inkdark/[0.1] dark:text-inkdark'
                          : 'text-ink/50 dark:text-inkdark/50'
                      }`}
                    >
                      סימון
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('count')}
                      className={`rounded-full px-2.5 py-1 ${
                        type === 'count'
                          ? 'bg-ink/[0.08] text-ink dark:bg-inkdark/[0.1] dark:text-inkdark'
                          : 'text-ink/50 dark:text-inkdark/50'
                      }`}
                    >
                      ספירה
                    </button>
                  </div>
                  {type === 'count' && (
                    <label className="flex items-center gap-1.5 text-xs text-ink/50 dark:text-inkdark/50">
                      יעד
                      <input
                        type="number"
                        min={1}
                        value={target}
                        onChange={(e) => setTarget(Math.max(1, Number(e.target.value) || 1))}
                        className="w-12 rounded border border-ink/15 bg-transparent px-1.5 py-0.5 text-ink outline-none dark:border-inkdark/15 dark:text-inkdark"
                      />
                    </label>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-ink/50 dark:text-inkdark/50">חזרה</span>
                    <WeekdayPicker value={days} onChange={setDays} />
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-ink/50 dark:text-inkdark/50">
                    תזכורת
                    <TimeField
                      value={time}
                      onChange={setTime}
                      className="w-12 rounded border border-ink/15 bg-transparent px-1.5 py-0.5 text-ink outline-none dark:border-inkdark/15 dark:text-inkdark"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={commitCreate}
                    className="rounded-full bg-ink px-3 py-1 text-xs text-paper hover:opacity-90 dark:bg-inkdark dark:text-paperdark"
                  >
                    הוספה
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreating(false)
                      setName('')
                    }}
                    className="text-xs text-ink/40 hover:text-ink dark:text-inkdark/40 dark:hover:text-inkdark"
                  >
                    ביטול
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="rounded-full border border-dashed border-ink/20 px-3 py-1 text-sm text-ink/40 hover:border-ink/40 hover:text-ink dark:border-inkdark/20 dark:text-inkdark/40 dark:hover:border-inkdark/40 dark:hover:text-inkdark"
              >
                + הרגל חדש
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
