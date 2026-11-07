import { beforeEach, describe, expect, it } from 'vitest'
import { createStorageService, getDefaultState, loadInitialState, STORAGE_KEY } from './storage'

describe('storage service', () => {
  beforeEach(() => localStorage.clear())

  it('loads the existing raw v2 localStorage document and merges new defaults', () => {
    const defaults = getDefaultState()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...defaults, xp: 999 }))
    const state = loadInitialState(defaults)
    expect(state.xp).toBe(999)
    expect(state.notifyOnTimerComplete).toBe(false)
  })

  it('falls back to localStorage when IndexedDB is unavailable', async () => {
    const defaults = getDefaultState()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...defaults, xp: 321 }))
    const service = createStorageService(defaults)
    expect(service.status).toBe('localStorage')
    await expect(service.load()).resolves.toMatchObject({ xp: 321 })
    await service.save({ ...defaults, xp: 654 })
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toMatchObject({ version: 3, state: { xp: 654 } })
  })
})
