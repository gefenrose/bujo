import { addDays } from './date'

const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3'
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events'
const DEFAULT_EVENT_DURATION_MINUTES = 30
const LOCAL_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone

const pad = (n: number) => String(n).padStart(2, '0')

interface GoogleTokenClient {
  requestAccessToken: (opts?: { prompt?: string }) => void
}

interface GoogleAccountsOAuth2 {
  initTokenClient: (config: {
    client_id: string
    scope: string
    callback: (response: { access_token?: string; expires_in?: number; error?: string }) => void
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
}

const AUTH_TIMEOUT_MS = 60_000

/** Requests an OAuth access token via Google Identity Services' token client. */
export function requestGoogleAccessToken(clientId: string, opts?: { silent?: boolean }): Promise<GoogleTokenResult> {
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
      scope: CALENDAR_SCOPE,
      callback: (response) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        if (response.error || !response.access_token) {
          reject(new Error(response.error || 'ההתחברות ל-Google נכשלה'))
          return
        }
        resolve({ accessToken: response.access_token, expiresAt: Date.now() + (response.expires_in ?? 3600) * 1000 })
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

export interface GoogleCalendarEvent {
  id: string
  summary?: string
  status?: string
  start?: { date?: string; dateTime?: string }
  end?: { date?: string; dateTime?: string }
}

interface GoogleEventBody {
  summary: string
  start: { date?: string; dateTime?: string; timeZone?: string }
  end: { date?: string; dateTime?: string; timeZone?: string }
}

async function calendarFetch(accessToken: string, path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${CALENDAR_API_BASE}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Google Calendar API error ${res.status}: ${body}`)
  }
  return res
}

export async function listGoogleEvents(
  accessToken: string,
  timeMinISO: string,
  timeMaxISO: string,
): Promise<GoogleCalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin: timeMinISO,
    timeMax: timeMaxISO,
    singleEvents: 'true',
    maxResults: '250',
    orderBy: 'startTime',
  })
  const res = await calendarFetch(accessToken, `/calendars/primary/events?${params.toString()}`)
  const data = (await res.json()) as { items?: GoogleCalendarEvent[] }
  return data.items ?? []
}

export async function insertGoogleEvent(accessToken: string, event: GoogleEventBody): Promise<GoogleCalendarEvent> {
  const res = await calendarFetch(accessToken, '/calendars/primary/events', {
    method: 'POST',
    body: JSON.stringify(event),
  })
  return res.json()
}

export async function updateGoogleEvent(
  accessToken: string,
  eventId: string,
  event: GoogleEventBody,
): Promise<GoogleCalendarEvent> {
  const res = await calendarFetch(accessToken, `/calendars/primary/events/${eventId}`, {
    method: 'PATCH',
    body: JSON.stringify(event),
  })
  return res.json()
}

export async function deleteGoogleEvent(accessToken: string, eventId: string): Promise<void> {
  await fetch(`${CALENDAR_API_BASE}/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

/** Adds minutes to a date+"HH:MM" pair via plain arithmetic (no Date-object timezone traps). */
function addMinutesToTime(date: string, time: string, minutesToAdd: number): { date: string; time: string } {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutesToAdd
  const dayOffset = Math.floor(total / (24 * 60))
  const minuteOfDay = ((total % (24 * 60)) + 24 * 60) % (24 * 60)
  return {
    date: dayOffset ? addDays(date, dayOffset) : date,
    time: `${pad(Math.floor(minuteOfDay / 60))}:${pad(minuteOfDay % 60)}`,
  }
}

/** Maps a bujo entry to a Google Calendar event body, or null if it can't be represented (no date). */
export function entryToGoogleEventBody(entry: { text: string; date?: string; time?: string }): GoogleEventBody | null {
  if (!entry.date) return null
  if (entry.time) {
    const { date: endDate, time: endTime } = addMinutesToTime(entry.date, entry.time, DEFAULT_EVENT_DURATION_MINUTES)
    return {
      summary: entry.text,
      start: { dateTime: `${entry.date}T${entry.time}:00`, timeZone: LOCAL_TIMEZONE },
      end: { dateTime: `${endDate}T${endTime}:00`, timeZone: LOCAL_TIMEZONE },
    }
  }
  // All-day event: Google's end.date is exclusive, so it's the next day.
  return { summary: entry.text, start: { date: entry.date }, end: { date: addDays(entry.date, 1) } }
}

/** Maps a Google Calendar event back to bujo entry fields, or null if unrepresentable. */
export function googleEventToEntryFields(event: GoogleCalendarEvent): { text: string; date: string; time?: string } | null {
  const text = event.summary || '(ללא כותרת)'
  if (event.start?.dateTime) {
    const [datePart, timePart] = event.start.dateTime.split('T')
    return { text, date: datePart, time: timePart.slice(0, 5) }
  }
  if (event.start?.date) return { text, date: event.start.date }
  return null
}
