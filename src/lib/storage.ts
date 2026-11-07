import type { Mode, PersistedState, Project, Task } from './types'

export const STORAGE_KEY = 'pendulum-state-v2'
export const STORAGE_VERSION = 3
const DB_NAME = 'pendulum-storage'
const STORE_NAME = 'state'
const STATE_ID = 'current'

export type StorageStatus = 'indexeddb' | 'localStorage' | 'unavailable'
type StorageEnvelope = { version: number; state: Partial<PersistedState> }

const durations: Record<Mode, number> = { focus: 25 * 60, short: 5 * 60, long: 15 * 60, countdown: 10 * 60, stopwatch: 0 }
const today = () => new Date().toISOString().slice(0, 10)
const defaultProjects: Project[] = [{ id: 'design', name: 'Design system', color: '#b57cff' }, { id: 'personal', name: 'Personal', color: '#6ed6c4' }]
const defaultTasks: Task[] = [
  { id: '1', title: 'Shape the next meaningful thing', projectId: 'design', done: false, priority: 'high', minutes: 45 },
  { id: '2', title: 'Clear the small wins from today', projectId: 'personal', done: false, priority: 'medium', due: today(), minutes: 25 },
  { id: '3', title: 'Write down one idea worth keeping', projectId: 'design', done: true, priority: 'low', minutes: 15 },
]

export const getDefaultState = (): PersistedState => ({
  tasks: defaultTasks, projects: defaultProjects, events: [], habits: [{ id: 'h1', name: 'Morning pages', cadence: 'daily', days: [], completions: [] }],
  goals: [{ id: 'g1', title: 'Build a sustainable focus practice', target: 20, current: 7, unit: 'sessions', due: '2026-12-01' }],
  notes: [{ id: 'n1', title: 'Welcome to Pendulum', body: 'Use this space for ideas, meeting notes, and daily reflection.', tags: ['getting-started'], pinned: true, updatedAt: new Date().toISOString() }],
  studyCards: [{ id: 'c1', front: 'What makes a habit sustainable?', back: 'A clear cue, a small action, and a meaningful reward.', due: today(), reviews: 0 }],
  sessions: [], theme: 'dark', accent: '#a66bff', mode: 'focus', remaining: durations.focus, isRunning: false, completedFocus: 0,
  ambient: 'rain', volume: 35, soundOn: false, xp: 120, showCompleted: true, aiProvider: 'Not configured', aiModel: 'Local / optional',
  quietHours: false, notifyOnTimerComplete: false,
})

const mergeState = (defaults: PersistedState, value: unknown): PersistedState => {
  if (!value || typeof value !== 'object') return defaults
  return { ...defaults, ...(value as Partial<PersistedState>) }
}

const getLocalStorage = (): Storage | null => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

const readLocal = (defaults: PersistedState): PersistedState => {
  const storage = getLocalStorage()
  if (!storage) return defaults
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return defaults
    const parsed: unknown = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && 'state' in parsed) return mergeState(defaults, (parsed as StorageEnvelope).state)
    return mergeState(defaults, parsed)
  } catch {
    return defaults
  }
}

const writeLocal = (state: PersistedState) => {
  const storage = getLocalStorage()
  if (!storage) return false
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, state }))
    return true
  } catch {
    return false
  }
}

const indexedDbAvailable = () => typeof indexedDB !== 'undefined'

const requestToPromise = <T>(request: IDBRequest<T>) => new Promise<T>((resolve, reject) => {
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'))
})

const openDatabase = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, 1)
  request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME)
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error ?? new Error('IndexedDB unavailable'))
})

const readIndexedDb = async () => {
  const db = await openDatabase()
  try {
    return await requestToPromise<StorageEnvelope | undefined>(db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(STATE_ID))
  } finally {
    db.close()
  }
}

const writeIndexedDb = async (state: PersistedState) => {
  const db = await openDatabase()
  try {
    await requestToPromise(db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put({ version: STORAGE_VERSION, state }, STATE_ID))
  } finally {
    db.close()
  }
}

export const loadInitialState = (defaults = getDefaultState()) => readLocal(defaults)

export const createStorageService = (defaults = getDefaultState()) => {
  let status: StorageStatus = indexedDbAvailable() ? 'indexeddb' : getLocalStorage() ? 'localStorage' : 'unavailable'
  return {
    get status() { return status },
    async load() {
      if (indexedDbAvailable()) {
        try {
          const stored = await readIndexedDb()
          if (stored?.state) return mergeState(defaults, stored.state)
          const migrated = readLocal(defaults)
          await writeIndexedDb(migrated)
          return migrated
        } catch {
          status = getLocalStorage() ? 'localStorage' : 'unavailable'
        }
      }
      return readLocal(defaults)
    },
    async save(state: PersistedState) {
      if (status === 'indexeddb') {
        try {
          await writeIndexedDb(state)
          return
        } catch {
          status = getLocalStorage() ? 'localStorage' : 'unavailable'
        }
      }
      writeLocal(state)
    },
  }
}
