export type SyncStatus = 'local' | 'offline' | 'not-configured'

export type SyncAdapter = {
  status: SyncStatus
  description: string
}

export const getSyncAdapter = (): SyncAdapter => ({
  status: 'not-configured',
  description: 'No remote sync service is configured; data stays in this browser.',
})
