import { useCallback, useRef, useState } from 'react'
import type { Journal } from './useJournal'
import type { useGoogleAccount } from './useGoogleAccount'
import { findDriveBackupFile, loadDriveBackup, saveDriveBackup } from '../lib/googleDrive'
import { normalizeJournalData } from '../lib/storage'
import type { JournalData } from '../types'

export function useGoogleDriveBackup(account: ReturnType<typeof useGoogleAccount>, journal: Journal) {
  const [backingUp, setBackingUp] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [lastBackedUpAt, setLastBackedUpAt] = useState<number | null>(null)
  const fileIdRef = useRef<string | null>(null)

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
      }
      fileIdRef.current = await saveDriveBackup(accessToken, fileIdRef.current, data)
      setLastBackedUpAt(Date.now())
    } catch (err) {
      account.setStatus('error')
      account.setError(err instanceof Error ? err.message : 'שמירה ל-Google Drive נכשלה')
    } finally {
      setBackingUp(false)
    }
  }, [account, journal])

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
    } catch (err) {
      account.setStatus('error')
      account.setError(err instanceof Error ? err.message : 'שחזור מ-Google Drive נכשל')
    } finally {
      setRestoring(false)
    }
  }, [account, journal])

  return { backingUp, restoring, lastBackedUpAt, backupNow, restoreNow }
}
