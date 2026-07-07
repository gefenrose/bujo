export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported'

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPermission(): NotificationPermissionState {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.requestPermission()
}

export function sendNotification(title: string, body: string): void {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return
  try {
    new Notification(title, { body, icon: '/pwa-192.png', tag: title })
  } catch {
    // some browsers throw synchronously (e.g. iOS Safari outside an install); ignore
  }
}
