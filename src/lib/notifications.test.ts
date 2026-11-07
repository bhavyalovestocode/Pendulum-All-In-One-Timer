import { describe, expect, it } from 'vitest'
import { getNotificationStatus, notify, requestNotificationPermission } from './notifications'

describe('notification service', () => {
  it('guards unsupported browser environments', async () => {
    const notification = globalThis.Notification
    Object.defineProperty(globalThis, 'Notification', { configurable: true, value: undefined })
    expect(getNotificationStatus()).toBe('unsupported')
    await expect(requestNotificationPermission()).resolves.toBe('unsupported')
    expect(notify('Test')).toBe(false)
    Object.defineProperty(globalThis, 'Notification', { configurable: true, value: notification })
  })
})
