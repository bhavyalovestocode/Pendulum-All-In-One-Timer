export type NotificationPermissionStatus = 'unsupported' | NotificationPermission

const getNotification = () => typeof Notification === 'undefined' ? null : Notification

export const getNotificationPermission = (): NotificationPermissionStatus => {
  const notification = getNotification()
  return notification ? notification.permission : 'unsupported'
}

export const requestNotificationPermission = async (): Promise<NotificationPermissionStatus> => {
  const notification = getNotification()
  if (!notification) return 'unsupported'
  return notification.requestPermission()
}

export const notifyTimerComplete = (enabled: boolean, title = 'Pendulum timer complete') => {
  const notification = getNotification()
  if (!enabled || !notification || notification.permission !== 'granted') return false
  try {
    new notification(title, { body: 'Your session is complete. Take a breath before the next thing.' })
    return true
  } catch {
    return false
  }
}
