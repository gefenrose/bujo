const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
const AUTH_TIMEOUT_MS = 60_000

interface GoogleTokenClient {
  requestAccessToken: (opts?: { prompt?: string }) => void
}

interface GoogleAccountsOAuth2 {
  initTokenClient: (config: {
    client_id: string
    scope: string
    callback: (response: { access_token?: string; expires_in?: number; scope?: string; error?: string }) => void
  }) => GoogleTokenClient
  revoke: (token: string, done: () => void) => void
}

declare global {
  interface Window {
    google?: { accounts?: { oauth2?: GoogleAccountsOAuth2 } }
  }
}

let scriptLoadPromise: Promise<void> | null = null

/** Injects the Google Identity Services script (idempotent). */
export function loadGoogleIdentityScript(): Promise<void> {
  if (scriptLoadPromise) return scriptLoadPromise
  scriptLoadPromise = new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${GIS_SCRIPT_SRC}"]`) && window.google?.accounts?.oauth2) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = GIS_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('נכשלה טעינת ספריית ההזדהות של Google'))
    document.head.appendChild(script)
  })
  return scriptLoadPromise
}

export interface GoogleTokenResult {
  accessToken: string
  expiresAt: number
  /** Space-separated scopes actually granted (may be narrower than what was requested). */
  grantedScope: string
}

/** Requests an OAuth access token via Google Identity Services' token client, for the given scope(s). */
export function requestGoogleAccessToken(
  clientId: string,
  scope: string,
  opts?: { silent?: boolean },
): Promise<GoogleTokenResult> {
  return new Promise((resolve, reject) => {
    const oauth2 = window.google?.accounts?.oauth2
    if (!oauth2) {
      reject(new Error('ספריית ההזדהות של Google לא נטענה'))
      return
    }

    let settled = false
    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      reject(new Error('ההתחברות פגה — ייתכן שחוסם חלונות קופצים מנע את תהליך ההתחברות'))
    }, AUTH_TIMEOUT_MS)

    const tokenClient = oauth2.initTokenClient({
      client_id: clientId,
      scope,
      callback: (response) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        if (response.error || !response.access_token) {
          reject(new Error(response.error || 'ההתחברות ל-Google נכשלה'))
          return
        }
        resolve({
          accessToken: response.access_token,
          expiresAt: Date.now() + (response.expires_in ?? 3600) * 1000,
          grantedScope: response.scope ?? '',
        })
      },
    })
    tokenClient.requestAccessToken({ prompt: opts?.silent ? '' : 'consent' })
  })
}

export function revokeGoogleAccessToken(accessToken: string): Promise<void> {
  return new Promise((resolve) => {
    const oauth2 = window.google?.accounts?.oauth2
    if (!oauth2) {
      resolve()
      return
    }
    oauth2.revoke(accessToken, () => resolve())
  })
}
