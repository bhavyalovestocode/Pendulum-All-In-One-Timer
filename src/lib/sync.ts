export type SyncStatus = 'local' | 'offline' | 'not-configured' | 'connected'

export type SyncAdapter = {
  readonly status: SyncStatus
  exportSnapshot: () => Promise<unknown>
  importSnapshot: (snapshot: unknown) => Promise<void>
}

export const localSyncAdapter: SyncAdapter = {
  status: typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'local',
  exportSnapshot: async () => undefined,
  importSnapshot: async () => undefined,
}
