export const STORAGE_KEY = 'pendulum-state-v2'
export const DATABASE_NAME = 'pendulum-storage'
export const DATABASE_VERSION = 1

export type StorageBackend = 'indexeddb' | 'localstorage' | 'memory'

export type StorageResult<T> = {
  value: T
  backend: StorageBackend
}

const canUseLocalStorage = () => typeof localStorage !== 'undefined'
const canUseIndexedDb = () => typeof indexedDB !== 'undefined'

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains('state')) database.createObjectStore('state', { keyPath: 'key' })
    }
    request.onerror = () => reject(request.error ?? new Error('Unable to open storage'))
    request.onsuccess = () => resolve(request.result)
  })

export async function readPersistedState<T>(fallback: T): Promise<StorageResult<T>> {
  if (canUseIndexedDb()) {
    try {
      const database = await openDatabase()
      const value = await new Promise<T | undefined>((resolve, reject) => {
        const transaction = database.transaction('state', 'readonly')
        const request = transaction.objectStore('state').get(STORAGE_KEY)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result?.value as T | undefined)
      })
      database.close()
      if (value !== undefined) return { value, backend: 'indexeddb' }
    } catch {
      // Fall through to the localStorage adapter.
    }
  }
  if (canUseLocalStorage()) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return { value: JSON.parse(raw) as T, backend: 'localstorage' }
    } catch {
      // Fall through to the memory adapter.
    }
  }
  return { value: fallback, backend: 'memory' }
}

export async function writePersistedState<T>(value: T): Promise<StorageBackend> {
  if (canUseIndexedDb()) {
    try {
      const database = await openDatabase()
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction('state', 'readwrite')
        transaction.objectStore('state').put({ key: STORAGE_KEY, value })
        transaction.onerror = () => reject(transaction.error)
        transaction.oncomplete = () => resolve()
      })
      database.close()
      return 'indexeddb'
    } catch {
      // Fall through to localStorage.
    }
  }
  if (canUseLocalStorage()) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      return 'localstorage'
    } catch {
      // Memory-only persistence is the final safe fallback.
    }
  }
  return 'memory'
}

export async function migrateLegacyState<T>(fallback: T): Promise<StorageResult<T>> {
  const result = await readPersistedState(fallback)
  if (result.backend !== 'memory') return result
  if (!canUseLocalStorage()) return result
  try {
    const legacy = localStorage.getItem(STORAGE_KEY)
    if (!legacy) return result
    const value = JSON.parse(legacy) as T
    return { value, backend: 'localstorage' }
  } catch {
    return result
  }
}
