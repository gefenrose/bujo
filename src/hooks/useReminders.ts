import { useEffect, useRef, useState } from 'react'
import type { Journal } from './useJournal'
import { todayISO } from '../lib/date'
import { habitValue, isHabitScheduledOn } from '../lib/habits'
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendNotification,
  type NotificationPermissionState,
} from '../lib/notifications'

export interface ReminderToast {
  id: string
  title: string
  body: string
}

interface FiredState {
  date: string
  ids: string[]
}

const FIRED_KEY = 'bujo:reminders-fired'
const CHECK_INTERVAL_MS = 20_000
const TOAST_LIFETIME_MS = 8_000

function loadFired(): FiredState {
  try {
    const raw = localStorage.getItem(FIRED_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (parsed && parsed.date === todayISO() && Array.isArray(parsed.ids)) return parsed
  } catch {
    // ignore malformed storage
  }
  return { date: todayISO(), ids: [] }
}

function saveFired(state: FiredState) {
  localStorage.setItem(FIRED_KEY, JSON.stringify(state))
}

function currentHHMM(): string {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

/**
 * Fires an in-app toast (and a system notification, if permitted) once for each open task
 * or unfinished habit whose scheduled time has passed today. Only runs while this tab is open —
 * there is no server, so it cannot wake the app or notify in the background.
 */
export function useReminders(journal: Journal) {
  const [permission, setPermission] = useState<NotificationPermissionState>(getNotificationPermission)
  const [toasts, setToasts] = useState<ReminderToast[]>([])
  const firedRef = useRef<FiredState>(loadFired())

  const enableReminders = async () => {
    const result = await requestNotificationPermission()
    setPermission(result)
  }

  const dismissToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  useEffect(() => {
    const check = () => {
      const today = todayISO()
      if (firedRef.current.date !== today) firedRef.current = { date: today, ids: [] }
      const nowTime = currentHHMM()
      const due: ReminderToast[] = []

      for (const entry of journal.entries) {
        if (entry.date !== today || !entry.time || entry.status !== 'open') continue
        if (entry.time > nowTime) continue
        const fireId = `entry:${entry.id}:${today}`
        if (firedRef.current.ids.includes(fireId)) continue
        due.push({ id: fireId, title: entry.text, body: `מתוזמן לשעה ${entry.time}` })
      }

      for (const habit of journal.habits) {
        if (!habit.time || !isHabitScheduledOn(habit, today) || habit.time > nowTime) continue
        const value = habitValue(journal.habitLogs, habit.id, today)
        const done = habit.type === 'check' ? value > 0 : value >= (habit.target ?? 1)
        if (done) continue
        const fireId = `habit:${habit.id}:${today}`
        if (firedRef.current.ids.includes(fireId)) continue
        due.push({ id: fireId, title: habit.name, body: `תזכורת הרגל — ${habit.time}` })
      }

      if (due.length === 0) return

      firedRef.current = { date: today, ids: [...firedRef.current.ids, ...due.map((d) => d.id)] }
      saveFired(firedRef.current)
      setToasts((prev) => [...prev, ...due])
      for (const item of due) sendNotification(item.title, item.body)
    }

    check()
    const interval = setInterval(check, CHECK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [journal.entries, journal.habits, journal.habitLogs])

  useEffect(() => {
    if (toasts.length === 0) return
    const timers = toasts.map((t) => setTimeout(() => dismissToast(t.id), TOAST_LIFETIME_MS))
    return () => timers.forEach(clearTimeout)
  }, [toasts])

  return { permission, enableReminders, toasts, dismissToast }
}
