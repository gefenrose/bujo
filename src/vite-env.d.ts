/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** OAuth Client ID from Google Cloud Console, for Google Calendar sync. */
  readonly VITE_GOOGLE_CLIENT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
