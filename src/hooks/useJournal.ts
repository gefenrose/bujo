import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  Collection,
  Entry,
  EntryType,
  Habit,
  HabitLog,
  HabitType,
  MoodLog,
  Prompt,
  PromptResponse,
  TaskStatus,
} from '../types'
import { genId, loadJournal, saveJournal } from '../lib/storage'
import { todayISO } from '../lib/date'
import { nextOrder } from '../lib/entries'

export interface UndoAction {
  id: string
  label: string
  undo: () => void
}

const UNDO_LIFETIME_MS = 7_000

export function useJournal() {
  const [entries, setEntries] = useState<Entry[]>(() => loadJournal().entries)
  const [collections, setCollections] = useState<Collection[]>(() => loadJournal().collections)
  const [habits, setHabits] = useState<Habit[]>(() => loadJournal().habits)
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>(() => loadJournal().habitLogs)
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>(() => loadJournal().moodLogs)
  const [prompts, setPrompts] = useState<Prompt[]>(() => loadJournal().prompts)
  const [promptResponses, setPromptResponses] = useState<PromptResponse[]>(() => loadJournal().promptResponses)
  const [undoActions, setUndoActions] = useState<UndoAction[]>([])
  const hydrated = useRef(false)

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true
      return
    }
    saveJournal({ entries, collections, habits, habitLogs, moodLogs, prompts, promptResponses })
  }, [entries, collections, habits, habitLogs, moodLogs, prompts, promptResponses])

  const dismissUndo = useCallback((id: string) => {
    setUndoActions((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const pushUndo = useCallback((label: string, undo: () => void) => {
    const id = genId()
    setUndoActions((prev) => [...prev, { id, label, undo }])
  }, [])

  const performUndo = useCallback((id: string) => {
    setUndoActions((prev) => {
      prev.find((a) => a.id === id)?.undo()
      return prev.filter((a) => a.id !== id)
    })
  }, [])

  useEffect(() => {
    if (undoActions.length === 0) return
    const timers = undoActions.map((a) => setTimeout(() => dismissUndo(a.id), UNDO_LIFETIME_MS))
    return () => timers.forEach(clearTimeout)
  }, [undoActions, dismissUndo])

  const addEntry = useCallback(
    (input: {
      text: string
      type: EntryType
      date?: string
      collectionId?: string
      time?: string
      googleEventId?: string
    }) => {
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
          googleEventId: input.googleEventId,
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

  const deleteEntry = useCallback(
    (id: string) => {
      const target = entries.find((e) => e.id === id)
      setEntries((prev) => prev.filter((e) => e.id !== id))
      if (!target) return
      pushUndo(`"${target.text}" נמחק`, () => {
        setEntries((prev) => (prev.some((e) => e.id === target.id) ? prev : [...prev, target]))
      })
    },
    [entries, pushUndo],
  )

  /** Clears an entry's time (undo-able), for the small × next to the time badge. */
  const clearEntryTime = useCallback(
    (id: string) => {
      const target = entries.find((e) => e.id === id)
      if (!target?.time) return
      const previousTime = target.time
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, time: undefined } : e)))
      pushUndo(`הוסרה השעה מ-"${target.text}"`, () => {
        setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, time: previousTime } : e)))
      })
    },
    [entries, pushUndo],
  )

  const addSubtask = useCallback((entryId: string, text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? { ...e, subtasks: [...(e.subtasks ?? []), { id: genId(), text: trimmed, done: false }] }
          : e,
      ),
    )
  }, [])

  const toggleSubtask = useCallback((entryId: string, subtaskId: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? { ...e, subtasks: e.subtasks?.map((s) => (s.id === subtaskId ? { ...s, done: !s.done } : s)) }
          : e,
      ),
    )
  }, [])

  const deleteSubtask = useCallback(
    (entryId: string, subtaskId: string) => {
      const entry = entries.find((e) => e.id === entryId)
      const target = entry?.subtasks?.find((s) => s.id === subtaskId)
      setEntries((prev) =>
        prev.map((e) => (e.id === entryId ? { ...e, subtasks: e.subtasks?.filter((s) => s.id !== subtaskId) } : e)),
      )
      if (!target) return
      pushUndo(`"${target.text}" נמחק`, () => {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === entryId
              ? {
                  ...e,
                  subtasks: e.subtasks?.some((s) => s.id === target.id) ? e.subtasks : [...(e.subtasks ?? []), target],
                }
              : e,
          ),
        )
      })
    },
    [entries, pushUndo],
  )

  const addTag = useCallback((entryId: string, tag: string) => {
    const normalized = tag.trim().toLowerCase()
    if (!normalized) return
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== entryId || e.tags?.includes(normalized)) return e
        return { ...e, tags: [...(e.tags ?? []), normalized] }
      }),
    )
  }, [])

  const removeTag = useCallback((entryId: string, tag: string) => {
    setEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, tags: e.tags?.filter((t) => t !== tag) } : e)))
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

  const deleteCollection = useCallback(
    (id: string) => {
      const target = collections.find((c) => c.id === id)
      const removedEntries = entries.filter((e) => e.collectionId === id)
      setCollections((prev) => prev.filter((c) => c.id !== id))
      setEntries((prev) => prev.filter((e) => e.collectionId !== id))
      if (!target) return
      pushUndo(`האוסף "${target.name}" נמחק`, () => {
        setCollections((prev) => (prev.some((c) => c.id === target.id) ? prev : [...prev, target]))
        setEntries((prev) => [...prev, ...removedEntries])
      })
    },
    [collections, entries, pushUndo],
  )

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

  const deleteHabit = useCallback(
    (id: string) => {
      const target = habits.find((h) => h.id === id)
      const removedLogs = habitLogs.filter((l) => l.habitId === id)
      setHabits((prev) => prev.filter((h) => h.id !== id))
      setHabitLogs((prev) => prev.filter((l) => l.habitId !== id))
      if (!target) return
      pushUndo(`ההרגל "${target.name}" נמחק`, () => {
        setHabits((prev) => (prev.some((h) => h.id === target.id) ? prev : [...prev, target]))
        setHabitLogs((prev) => [...prev, ...removedLogs])
      })
    },
    [habits, habitLogs, pushUndo],
  )

  const updateHabit = useCallback(
    (id: string, patch: { name: string; type: HabitType; target?: number; days?: number[]; time?: string }) => {
      const name = patch.name.trim()
      if (!name) return
      setHabits((prev) =>
        prev.map((h) =>
          h.id === id
            ? {
                ...h,
                name,
                type: patch.type,
                target: patch.type === 'count' ? patch.target ?? 5 : undefined,
                days: patch.days && patch.days.length > 0 && patch.days.length < 7 ? patch.days : undefined,
                time: patch.time || undefined,
              }
            : h,
        ),
      )
    },
    [],
  )

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

  const addPrompt = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return
      const nextPromptOrder = prompts.length === 0 ? 0 : Math.max(...prompts.map((p) => p.order ?? 0)) + 1
      const prompt: Prompt = { id: genId(), text: trimmed, order: nextPromptOrder, createdAt: Date.now() }
      setPrompts((prev) => [...prev, prompt])
    },
    [prompts],
  )

  const renamePrompt = useCallback((id: string, text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, text: trimmed } : p)))
  }, [])

  const deletePrompt = useCallback(
    (id: string) => {
      const target = prompts.find((p) => p.id === id)
      const removedResponses = promptResponses.filter((r) => r.promptId === id)
      setPrompts((prev) => prev.filter((p) => p.id !== id))
      setPromptResponses((prev) => prev.filter((r) => r.promptId !== id))
      if (!target) return
      pushUndo(`השאלה "${target.text}" נמחקה`, () => {
        setPrompts((prev) => (prev.some((p) => p.id === target.id) ? prev : [...prev, target]))
        setPromptResponses((prev) => [...prev, ...removedResponses])
      })
    },
    [prompts, promptResponses, pushUndo],
  )

  /** Sets (or clears, with an empty string) a prompt's answer for a date. */
  const setPromptAnswer = useCallback((promptId: string, date: string, answer: string) => {
    setPromptResponses((prev) => {
      const existing = prev.find((r) => r.promptId === promptId && r.date === date)
      if (!answer) return existing ? prev.filter((r) => r !== existing) : prev
      if (existing) return prev.map((r) => (r === existing ? { ...r, answer } : r))
      return [...prev, { id: genId(), promptId, date, answer }]
    })
  }, [])

  return {
    entries,
    collections,
    habits,
    habitLogs,
    moodLogs,
    undoActions,
    performUndo,
    dismissUndo,
    addEntry,
    updateEntry,
    reorderEntries,
    deleteEntry,
    clearEntryTime,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    addTag,
    removeTag,
    cycleStatus,
    togglePriority,
    migrateEntry,
    addCollection,
    deleteCollection,
    renameCollection,
    addHabit,
    deleteHabit,
    updateHabit,
    setHabitValue,
    incrementHabit,
    toggleHabitCheck,
    setMood,
    prompts,
    promptResponses,
    addPrompt,
    renamePrompt,
    deletePrompt,
    setPromptAnswer,
  }
}

export type Journal = ReturnType<typeof useJournal>
