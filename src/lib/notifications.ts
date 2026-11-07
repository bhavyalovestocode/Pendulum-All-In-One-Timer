export type NotificationStatus = 'unsupported' | 'default' | 'granted' | 'denied'

export const getNotificationStatus = (): NotificationStatus => {
  if (typeof Notification === 'undefined') return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationStatus> {
  if (typeof Notification === 'undefined') return 'unsupported'
  if (Notification.permission === 'granted' || Notification.permission === 'denied') return Notification.permission
  return Notification.requestPermission()
}

export function notify(title: string, options?: NotificationOptions): boolean {
  if (getNotificationStatus() !== 'granted') return false
  new Notification(title, options)
  return true
}
