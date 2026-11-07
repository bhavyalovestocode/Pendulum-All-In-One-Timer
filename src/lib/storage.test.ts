import { beforeEach, describe, expect, it } from 'vitest'
import { readPersistedState, writePersistedState, STORAGE_KEY } from './storage'

describe('storage adapter', () => {
  beforeEach(() => localStorage.clear())

  it('round-trips through localStorage when IndexedDB is unavailable', async () => {
    const original = globalThis.indexedDB
    Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: undefined })
    expect(await writePersistedState({ answer: 42 })).toBe('localstorage')
    await expect(readPersistedState({ answer: 0 })).resolves.toEqual({ value: { answer: 42 }, backend: 'localstorage' })
    Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: original })
  })

  it('reads legacy v2 localStorage data', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ migrated: true }))
    const original = globalThis.indexedDB
    Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: undefined })
    await expect(readPersistedState({ migrated: false })).resolves.toEqual({ value: { migrated: true }, backend: 'localstorage' })
    Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: original })
  })
})
