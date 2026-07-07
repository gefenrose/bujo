import { useCallback, useRef, useState } from 'react'
import { loadGoogleIdentityScript, requestGoogleAccessToken, revokeGoogleAccessToken, type GoogleTokenResult } from '../lib/googleAuth'
import { CALENDAR_SCOPE } from '../lib/googleCalendar'
import { DRIVE_SCOPE } from '../lib/googleDrive'

const TOKEN_EXPIRY_BUFFER_MS = 60_000
const FEATURES_STORAGE_KEY = 'bujo:google:features'

export type GoogleAccountStatus = 'unconfigured' | 'disconnected' | 'connecting' | 'connected' | 'error'

interface FeatureToggles {
  calendarEnabled: boolean
  driveEnabled: boolean
}

function loadFeatureToggles(): FeatureToggles {
  try {
    const raw = localStorage.getItem(FEATURES_STORAGE_KEY)
    if (!raw) return { calendarEnabled: true, driveEnabled: true }
    const parsed = JSON.parse(raw)
    return {
      calendarEnabled: parsed.calendarEnabled !== false,
      driveEnabled: parsed.driveEnabled !== false,
    }
  } catch {
    return { calendarEnabled: true, driveEnabled: true }
  }
}

/**
 * Shared Google OAuth connection used by both useGoogleCalendar and useGoogleDriveBackup.
 * The user picks which feature(s) to enable; only the enabled ones' scopes are requested,
 * so connecting doesn't force granting both permissions when only one is wanted.
 */
export function useGoogleAccount() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const [status, setStatus] = useState<GoogleAccountStatus>(clientId ? 'disconnected' : 'unconfigured')
  const [error, setError] = useState<string | null>(null)
  const [{ calendarEnabled, driveEnabled }, setFeatures] = useState<FeatureToggles>(loadFeatureToggles)
  const [grantedScope, setGrantedScope] = useState('')
  const tokenRef = useRef<GoogleTokenResult | null>(null)

  const persistFeatures = useCallback((next: FeatureToggles) => {
    setFeatures(next)
    localStorage.setItem(FEATURES_STORAGE_KEY, JSON.stringify(next))
  }, [])

  const setCalendarEnabled = useCallback(
    (enabled: boolean) => persistFeatures({ calendarEnabled: enabled, driveEnabled }),
    [driveEnabled, persistFeatures],
  )
  const setDriveEnabled = useCallback(
    (enabled: boolean) => persistFeatures({ calendarEnabled, driveEnabled: enabled }),
    [calendarEnabled, persistFeatures],
  )

  const wantedScope = [calendarEnabled && CALENDAR_SCOPE, driveEnabled && DRIVE_SCOPE].filter(Boolean).join(' ')
  const hasCalendarScope = grantedScope.includes(CALENDAR_SCOPE)
  const hasDriveScope = grantedScope.includes(DRIVE_SCOPE)

  const ensureAccessToken = useCallback(async (): Promise<string> => {
    if (!clientId) throw new Error('Google Client ID אינו מוגדר')
    const existing = tokenRef.current
    if (existing && existing.expiresAt - TOKEN_EXPIRY_BUFFER_MS > Date.now()) return existing.accessToken
    await loadGoogleIdentityScript()
    const result = await requestGoogleAccessToken(clientId, wantedScope, { silent: !!existing })
    tokenRef.current = result
    setGrantedScope(result.grantedScope)
    setStatus('connected')
    return result.accessToken
  }, [clientId, wantedScope])

  const connect = useCallback(async () => {
    if (!clientId) return
    if (!wantedScope) {
      setError('יש לבחור לפחות אפשרות אחת (סנכרון יומן או גיבוי ל-Drive)')
      return
    }
    setStatus('connecting')
    setError(null)
    try {
      await loadGoogleIdentityScript()
      const result = await requestGoogleAccessToken(clientId, wantedScope)
      tokenRef.current = result
      setGrantedScope(result.grantedScope)
      setStatus('connected')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'ההתחברות נכשלה')
    }
  }, [clientId, wantedScope])

  const disconnect = useCallback(async () => {
    const token = tokenRef.current
    tokenRef.current = null
    setGrantedScope('')
    setStatus('disconnected')
    setError(null)
    if (token) await revokeGoogleAccessToken(token.accessToken)
  }, [])

  return {
    configured: !!clientId,
    status,
    error,
    setStatus,
    setError,
    connect,
    disconnect,
    ensureAccessToken,
    calendarEnabled,
    driveEnabled,
    setCalendarEnabled,
    setDriveEnabled,
    hasCalendarScope,
    hasDriveScope,
  }
}
