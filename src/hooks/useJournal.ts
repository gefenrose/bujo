import { useCallback, useEffect, useRef, useState } from 'react'
import type { Collection, Entry, EntryType, TaskStatus } from '../types'
import { genId, loadJournal, saveJournal } from '../lib/storage'
import { todayISO } from '../lib/date'

export function useJournal() {
  const [entries, setEntries] = useState<Entry[]>(() => loadJournal().entries)
  const [collections, setCollections] = useState<Collection[]>(() => loadJournal().collections)
  const hydrated = useRef(false)

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true
      return
    }
    saveJournal({ entries, collections })
  }, [entries, collections])

  const addEntry = useCallback(
    (input: { text: string; type: EntryType; date?: string; collectionId?: string }) => {
      const text = input.text.trim()
      if (!text) return
      const entry: Entry = {
        id: genId(),
        type: input.type,
        text,
        status: 'open',
        priority: false,
        date: input.date,
        collectionId: input.collectionId,
        createdAt: Date.now(),
      }
      setEntries((prev) => [...prev, entry])
    },
    [],
  )

  const updateEntry = useCallback((id: string, patch: Partial<Entry>) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
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
      const copy: Entry = {
        id: genId(),
        type: source.type,
        text: source.text,
        status: 'open',
        priority: source.priority,
        date: opts?.toCollectionId ? undefined : opts?.toDate ?? todayISO(),
        collectionId: opts?.toCollectionId,
        migratedFromId: source.id,
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

  return {
    entries,
    collections,
    addEntry,
    updateEntry,
    deleteEntry,
    cycleStatus,
    togglePriority,
    migrateEntry,
    addCollection,
    deleteCollection,
    renameCollection,
  }
}

export type Journal = ReturnType<typeof useJournal>
