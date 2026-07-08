import { useCallback, useRef, useState } from 'react'
import type { Journal } from './useJournal'
import type { useGoogleAccount } from './useGoogleAccount'
import { findDriveBackupFile, loadDriveBackup, saveDriveBackup } from '../lib/googleDrive'
import { normalizeJournalData } from '../lib/storage'
import type { JournalData } from '../types'

const LAST_BACKED_UP_STORAGE_KEY = 'bujo:google:lastBackedUpAt'

function loadLastBackedUpAt(): number | null {
  const stored = localStorage.getItem(LAST_BACKED_UP_STORAGE_KEY)
  return stored ? Number(stored) : null
}

export function useGoogleDriveBackup(account: ReturnType<typeof useGoogleAccount>, journal: Journal) {
  const [backingUp, setBackingUp] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [lastBackedUpAt, setLastBackedUpAtState] = useState<number | null>(loadLastBackedUpAt)
  const fileIdRef = useRef<string | null>(null)

  const setLastBackedUpAt = useCallback((ts: number) => {
    setLastBackedUpAtState(ts)
    localStorage.setItem(LAST_BACKED_UP_STORAGE_KEY, String(ts))
  }, [])

  const backupNow = useCallback(async () => {
    if (!account.configured) return
    setBackingUp(true)
    account.setError(null)
    try {
      const accessToken = await account.ensureAccessToken()
      if (!fileIdRef.current) {
        const existing = await findDriveBackupFile(accessToken)
        fileIdRef.current = existing?.id ?? null
      }
      const data: JournalData = {
        entries: journal.entries,
        collections: journal.collections,
        habits: journal.habits,
        habitLogs: journal.habitLogs,
        moodLogs: journal.moodLogs,
        prompts: journal.prompts,
        promptResponses: journal.promptResponses,
        filters: journal.filters,
        pinnedTags: journal.pinnedTags,
      }
      fileIdRef.current = await saveDriveBackup(accessToken, fileIdRef.current, data)
      setLastBackedUpAt(Date.now())
    } catch (err) {
      account.setStatus('error')
      account.setError(err instanceof Error ? err.message : 'שמירה ל-Google Drive נכשלה')
    } finally {
      setBackingUp(false)
    }
  }, [account, journal, setLastBackedUpAt])

  const restoreNow = useCallback(async () => {
    if (!account.configured) return
    if (!window.confirm('שחזור מ-Google Drive יחליף את כל הנתונים המקומיים בגיבוי השמור. להמשיך?')) return
    setRestoring(true)
    account.setError(null)
    try {
      const accessToken = await account.ensureAccessToken()
      const existing = await findDriveBackupFile(accessToken)
      if (!existing) {
        account.setError('לא נמצא גיבוי שמור ב-Google Drive')
        return
      }
      fileIdRef.current = existing.id
      const raw = await loadDriveBackup(accessToken, existing.id)
      journal.replaceAll(normalizeJournalData(raw))
      setLastBackedUpAt(new Date(existing.modifiedTime).getTime())
    } catch (err) {
      account.setStatus('error')
      account.setError(err instanceof Error ? err.message : 'שחזור מ-Google Drive נכשל')
    } finally {
      setRestoring(false)
    }
  }, [account, journal, setLastBackedUpAt])

  return { backingUp, restoring, lastBackedUpAt, backupNow, restoreNow }
}
