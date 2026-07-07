import { useCallback, useEffect, useRef, useState } from 'react'
import type { Collection, Entry, EntryType, Habit, HabitLog, HabitType, MoodLog, TaskStatus } from '../types'
import { genId, loadJournal, saveJournal } from '../lib/storage'
import { todayISO } from '../lib/date'
import { nextOrder } from '../lib/entries'

export function useJournal() {
  const [entries, setEntries] = useState<Entry[]>(() => loadJournal().entries)
  const [collections, setCollections] = useState<Collection[]>(() => loadJournal().collections)
  const [habits, setHabits] = useState<Habit[]>(() => loadJournal().habits)
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>(() => loadJournal().habitLogs)
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>(() => loadJournal().moodLogs)
  const hydrated = useRef(false)

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true
      return
    }
    saveJournal({ entries, collections, habits, habitLogs, moodLogs })
  }, [entries, collections, habits, habitLogs, moodLogs])

  const addEntry = useCallback(
    (input: { text: string; type: EntryType; date?: string; collectionId?: string; time?: string }) => {
      const text = input.text.trim()
      if (!text) return
      setEntries((prev) => {
        const scope = prev.filter((e) => e.date === input.date && e.collectionId === input.collectionId)
        const entry: Entry = {
          id: genId(),
          type: input.type,
          text,
          status: 'open',
          priority: false,
          date: input.date,
          collectionId: input.collectionId,
          time: input.time,
          order: nextOrder(scope),
          createdAt: Date.now(),
        }
        return [...prev, entry]
      })
    },
    [],
  )

  const updateEntry = useCallback((id: string, patch: Partial<Entry>) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }, [])

  /** Reorders entries within one scope (a day or a collection) to match the given id sequence. */
  const reorderEntries = useCallback((orderedIds: string[]) => {
    setEntries((prev) => {
      const position = new Map(orderedIds.map((id, i) => [id, i]))
      return prev.map((e) => (position.has(e.id) ? { ...e, order: position.get(e.id)! } : e))
    })
  }, [])

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const cycleStatus = useCallback((id: string) => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e
        const next: TaskStatus = e.status === 'open' ? 'done' : 'open'
        return { ...e, status: next }
      }),
    )
  }, [])

  const togglePriority = useCallback((id: string) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, priority: !e.priority } : e)))
  }, [])

  /** Migrate an open task to today's daily log (or a chosen date), marking the original as migrated. */
  const migrateEntry = useCallback((id: string, opts?: { toDate?: string; toCollectionId?: string }) => {
    setEntries((prev) => {
      const source = prev.find((e) => e.id === id)
      if (!source) return prev
      const targetDate = opts?.toCollectionId ? undefined : opts?.toDate ?? todayISO()
      const targetCollectionId = opts?.toCollectionId
      const scope = prev.filter((e) => e.date === targetDate && e.collectionId === targetCollectionId)
      const copy: Entry = {
        id: genId(),
        type: source.type,
        text: source.text,
        status: 'open',
        priority: source.priority,
        date: targetDate,
        collectionId: targetCollectionId,
        migratedFromId: source.id,
        order: nextOrder(scope),
        createdAt: Date.now(),
      }
      return prev.map((e) => (e.id === id ? { ...e, status: 'migrated' as TaskStatus } : e)).concat(copy)
    })
  }, [])

  const addCollection = useCallback((name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const collection: Collection = { id: genId(), name: trimmed, createdAt: Date.now() }
    setCollections((prev) => [...prev, collection])
    return collection.id
  }, [])

  const deleteCollection = useCallback((id: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== id))
    setEntries((prev) => prev.filter((e) => e.collectionId !== id))
  }, [])

  const renameCollection = useCallback((id: string, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setCollections((prev) => prev.map((c) => (c.id === id ? { ...c, name: trimmed } : c)))
  }, [])

  const addHabit = useCallback(
    (input: { name: string; type: HabitType; target?: number; days?: number[]; time?: string }) => {
      const name = input.name.trim()
      if (!name) return
      const habit: Habit = {
        id: genId(),
        name,
        type: input.type,
        target: input.type === 'count' ? input.target ?? 5 : undefined,
        days: input.days && input.days.length > 0 && input.days.length < 7 ? input.days : undefined,
        time: input.time || undefined,
        createdAt: Date.now(),
      }
      setHabits((prev) => [...prev, habit])
      return habit.id
    },
    [],
  )

  const deleteHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id))
    setHabitLogs((prev) => prev.filter((l) => l.habitId !== id))
  }, [])

  const renameHabit = useCallback((id: string, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, name: trimmed } : h)))
  }, [])

  const setHabitValue = useCallback((habitId: string, date: string, value: number) => {
    const clamped = Math.max(0, value)
    setHabitLogs((prev) => {
      const existing = prev.find((l) => l.habitId === habitId && l.date === date)
      if (existing) return prev.map((l) => (l === existing ? { ...l, value: clamped } : l))
      return [...prev, { id: genId(), habitId, date, value: clamped }]
    })
  }, [])

  const incrementHabit = useCallback((habitId: string, date: string, delta: number) => {
    setHabitLogs((prev) => {
      const existing = prev.find((l) => l.habitId === habitId && l.date === date)
      const next = Math.max(0, (existing?.value ?? 0) + delta)
      if (existing) return prev.map((l) => (l === existing ? { ...l, value: next } : l))
      return [...prev, { id: genId(), habitId, date, value: next }]
    })
  }, [])

  const toggleHabitCheck = useCallback(
    (habitId: string, date: string) => {
      const existing = habitLogs.find((l) => l.habitId === habitId && l.date === date)
      setHabitValue(habitId, date, existing && existing.value > 0 ? 0 : 1)
    },
    [habitLogs, setHabitValue],
  )

  /** Sets (or clears, with 0) the mood for a date. */
  const setMood = useCallback((date: string, value: number) => {
    setMoodLogs((prev) => {
      const existing = prev.find((l) => l.date === date)
      if (value <= 0) return existing ? prev.filter((l) => l !== existing) : prev
      if (existing) return prev.map((l) => (l === existing ? { ...l, value } : l))
      return [...prev, { id: genId(), date, value }]
    })
  }, [])

  return {
    entries,
    collections,
    habits,
    habitLogs,
    moodLogs,
    addEntry,
    updateEntry,
    reorderEntries,
    deleteEntry,
    cycleStatus,
    togglePriority,
    migrateEntry,
    addCollection,
    deleteCollection,
    renameCollection,
    addHabit,
    deleteHabit,
    renameHabit,
    setHabitValue,
    incrementHabit,
    toggleHabitCheck,
    setMood,
  }
}

export type Journal = ReturnType<typeof useJournal>
