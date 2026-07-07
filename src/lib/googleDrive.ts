const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3'
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3'
export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata'
const BACKUP_FILENAME = 'bujo-backup.json'

async function driveFetch(accessToken: string, url: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(url, { ...init, headers: { Authorization: `Bearer ${accessToken}`, ...init?.headers } })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Google Drive API error ${res.status}: ${body}`)
  }
  return res
}

export interface DriveBackupFile {
  id: string
  modifiedTime: string
}

/** Looks up the single bujo backup file in the app's hidden Drive folder, if one exists. */
export async function findDriveBackupFile(accessToken: string): Promise<DriveBackupFile | null> {
  const params = new URLSearchParams({
    spaces: 'appDataFolder',
    q: `name='${BACKUP_FILENAME}' and trashed=false`,
    fields: 'files(id,modifiedTime)',
  })
  const res = await driveFetch(accessToken, `${DRIVE_API_BASE}/files?${params.toString()}`)
  const data = (await res.json()) as { files?: DriveBackupFile[] }
  return data.files?.[0] ?? null
}

async function createDriveBackupFile(accessToken: string): Promise<string> {
  const res = await driveFetch(accessToken, `${DRIVE_API_BASE}/files`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: BACKUP_FILENAME, parents: ['appDataFolder'] }),
  })
  const data = (await res.json()) as { id: string }
  return data.id
}

/** Writes the backup content, creating the hidden Drive file first if it doesn't exist yet. */
export async function saveDriveBackup(
  accessToken: string,
  existingFileId: string | null,
  content: unknown,
): Promise<string> {
  const fileId = existingFileId ?? (await createDriveBackupFile(accessToken))
  await driveFetch(accessToken, `${DRIVE_UPLOAD_BASE}/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content),
  })
  return fileId
}

export async function loadDriveBackup(accessToken: string, fileId: string): Promise<unknown> {
  const res = await driveFetch(accessToken, `${DRIVE_API_BASE}/files/${fileId}?alt=media`)
  return res.json()
}
