import { useCallback, useRef, useState } from 'react'
import type { Journal } from './useJournal'
import { addDays, todayISO } from '../lib/date'
import {
  deleteGoogleEvent,
  entryToGoogleEventBody,
  googleEventToEntryFields,
  insertGoogleEvent,
  listGoogleEvents,
  loadGoogleIdentityScript,
  requestGoogleAccessToken,
  revokeGoogleAccessToken,
  updateGoogleEvent,
  type GoogleTokenResult,
} from '../lib/googleCalendar'

const SYNC_WINDOW_PAST_DAYS = 30
const SYNC_WINDOW_FUTURE_DAYS = 180
const TOKEN_EXPIRY_BUFFER_MS = 60_000

export type GoogleCalendarStatus = 'unconfigured' | 'disconnected' | 'connecting' | 'connected' | 'error'

export function useGoogleCalendar(journal: Journal) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const [status, setStatus] = useState<GoogleCalendarStatus>(clientId ? 'disconnected' : 'unconfigured')
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null)
  const tokenRef = useRef<GoogleTokenResult | null>(null)
  /** entryId -> googleEventId, as of the last successful sync. */
  const knownRef = useRef<Map<string, string>>(new Map())

  const ensureAccessToken = useCallback(async (): Promise<string> => {
    if (!clientId) throw new Error('Google Client ID אינו מוגדר')
    const existing = tokenRef.current
    if (existing && existing.expiresAt - TOKEN_EXPIRY_BUFFER_MS > Date.now()) return existing.accessToken
    const result = await requestGoogleAccessToken(clientId, { silent: !!existing })
    tokenRef.current = result
    return result.accessToken
  }, [clientId])

  const connect = useCallback(async () => {
    if (!clientId) return
    setStatus('connecting')
    setError(null)
    try {
      await loadGoogleIdentityScript()
      const result = await requestGoogleAccessToken(clientId)
      tokenRef.current = result
      setStatus('connected')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'ההתחברות נכשלה')
    }
  }, [clientId])

  const disconnect = useCallback(async () => {
    const token = tokenRef.current
    tokenRef.current = null
    knownRef.current = new Map()
    setLastSyncedAt(null)
    setStatus('disconnected')
    if (token) await revokeGoogleAccessToken(token.accessToken)
  }, [])

  const syncNow = useCallback(async () => {
    if (!clientId) return
    setSyncing(true)
    setError(null)
    try {
      await loadGoogleIdentityScript()
      const accessToken = await ensureAccessToken()
      setStatus('connected')

      const windowStart = addDays(todayISO(), -SYNC_WINDOW_PAST_DAYS)
      const windowEnd = addDays(todayISO(), SYNC_WINDOW_FUTURE_DAYS)
      const workingEntries = journal.entries.map((e) => ({ ...e }))
      const justSyncedIds = new Set<string>()

      // 1. Local deletions -> delete on Google.
      const currentIds = new Set(workingEntries.map((e) => e.id))
      for (const [entryId, googleEventId] of knownRef.current.entries()) {
        if (!currentIds.has(entryId)) {
          await deleteGoogleEvent(accessToken, googleEventId).catch(() => {})
          knownRef.current.delete(entryId)
        }
      }

      // 2. Pull remote events within the sync window, reconcile against local entries.
      const timeMin = new Date(`${windowStart}T00:00:00`).toISOString()
      const timeMax = new Date(`${windowEnd}T00:00:00`).toISOString()
      const remoteEvents = await listGoogleEvents(accessToken, timeMin, timeMax)
      const activeRemoteEvents = remoteEvents.filter((e) => e.status !== 'cancelled')
      const remoteIds = new Set(activeRemoteEvents.map((e) => e.id))

      for (const remoteEvent of activeRemoteEvents) {
        const fields = googleEventToEntryFields(remoteEvent)
        if (!fields) continue
        const idx = workingEntries.findIndex((e) => e.googleEventId === remoteEvent.id)
        if (idx >= 0) {
          const local = workingEntries[idx]
          if (local.text !== fields.text || local.date !== fields.date || local.time !== fields.time) {
            journal.updateEntry(local.id, { text: fields.text, date: fields.date, time: fields.time })
          }
          knownRef.current.set(local.id, remoteEvent.id)
          justSyncedIds.add(local.id)
        } else {
          journal.addEntry({ text: fields.text, type: 'event', date: fields.date, time: fields.time, googleEventId: remoteEvent.id })
        }
      }

      // 3. Remote deletions (within the window) -> delete locally.
      for (const entry of workingEntries) {
        if (
          entry.googleEventId &&
          knownRef.current.has(entry.id) &&
          !remoteIds.has(entry.googleEventId) &&
          entry.date &&
          entry.date >= windowStart &&
          entry.date <= windowEnd
        ) {
          journal.deleteEntry(entry.id)
          knownRef.current.delete(entry.id)
          justSyncedIds.add(entry.id)
        }
      }

      // 4. Push local event entries not already reconciled above (new, or edited locally).
      for (const entry of workingEntries) {
        if (justSyncedIds.has(entry.id)) continue
        if (entry.type !== 'event' || !entry.date || entry.collectionId) continue
        const body = entryToGoogleEventBody(entry)
        if (!body) continue
        if (!entry.googleEventId) {
          const created = await insertGoogleEvent(accessToken, body)
          journal.updateEntry(entry.id, { googleEventId: created.id })
          knownRef.current.set(entry.id, created.id)
        } else {
          await updateGoogleEvent(accessToken, entry.googleEventId, body).catch(() => {})
          knownRef.current.set(entry.id, entry.googleEventId)
        }
      }

      setLastSyncedAt(Date.now())
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'הסנכרון נכשל')
    } finally {
      setSyncing(false)
    }
  }, [clientId, ensureAccessToken, journal])

  return { configured: !!clientId, status, error, syncing, lastSyncedAt, connect, disconnect, syncNow }
}
