import { useCallback, useRef, useState } from 'react'
import { loadGoogleIdentityScript, requestGoogleAccessToken, revokeGoogleAccessToken, type GoogleTokenResult } from '../lib/googleAuth'
import { CALENDAR_SCOPE } from '../lib/googleCalendar'
import { DRIVE_SCOPE } from '../lib/googleDrive'

const COMBINED_SCOPE = `${CALENDAR_SCOPE} ${DRIVE_SCOPE}`
const TOKEN_EXPIRY_BUFFER_MS = 60_000

export type GoogleAccountStatus = 'unconfigured' | 'disconnected' | 'connecting' | 'connected' | 'error'

/**
 * Shared Google OAuth connection (single sign-in, combined Calendar + Drive scope) used by both
 * useGoogleCalendar and useGoogleDriveBackup, so connecting once covers both features.
 */
export function useGoogleAccount() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const [status, setStatus] = useState<GoogleAccountStatus>(clientId ? 'disconnected' : 'unconfigured')
  const [error, setError] = useState<string | null>(null)
  const tokenRef = useRef<GoogleTokenResult | null>(null)

  const ensureAccessToken = useCallback(async (): Promise<string> => {
    if (!clientId) throw new Error('Google Client ID אינו מוגדר')
    const existing = tokenRef.current
    if (existing && existing.expiresAt - TOKEN_EXPIRY_BUFFER_MS > Date.now()) return existing.accessToken
    await loadGoogleIdentityScript()
    const result = await requestGoogleAccessToken(clientId, COMBINED_SCOPE, { silent: !!existing })
    tokenRef.current = result
    setStatus('connected')
    return result.accessToken
  }, [clientId])

  const connect = useCallback(async () => {
    if (!clientId) return
    setStatus('connecting')
    setError(null)
    try {
      await loadGoogleIdentityScript()
      const result = await requestGoogleAccessToken(clientId, COMBINED_SCOPE)
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
    setStatus('disconnected')
    setError(null)
    if (token) await revokeGoogleAccessToken(token.accessToken)
  }, [])

  return { configured: !!clientId, status, error, setStatus, setError, connect, disconnect, ensureAccessToken }
}
