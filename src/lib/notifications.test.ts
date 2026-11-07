import { afterEach, describe, expect, it, vi } from 'vitest'
import { getNotificationPermission, notifyTimerComplete, requestNotificationPermission } from './notifications'

describe('notification guards', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('is safe when browser notifications are unavailable', async () => {
    vi.stubGlobal('Notification', undefined)
    expect(getNotificationPermission()).toBe('unsupported')
    await expect(requestNotificationPermission()).resolves.toBe('unsupported')
    expect(notifyTimerComplete(true)).toBe(false)
  })

  it('does not request permission while sending a notification', () => {
    const requestPermission = vi.fn()
    const NotificationMock = vi.fn()
    Object.assign(NotificationMock, { permission: 'default', requestPermission: vi.fn() })
    vi.stubGlobal('Notification', NotificationMock)
    expect(notifyTimerComplete(true)).toBe(false)
    expect(NotificationMock).not.toHaveBeenCalled()
    expect(requestPermission).not.toHaveBeenCalled()
  })

  it('requests permission only through the explicit request helper', async () => {
    const requestPermission = vi.fn().mockResolvedValue('granted')
    const NotificationMock = vi.fn()
    Object.assign(NotificationMock, { permission: 'default', requestPermission })
    vi.stubGlobal('Notification', NotificationMock)
    await expect(requestNotificationPermission()).resolves.toBe('granted')
    expect(requestPermission).toHaveBeenCalledOnce()
  })
})
