export type FocusProfile = {
  id: string
  name: string
  description: string
  blockedWebsites: string[]
}

export type RoomParticipant = {
  id: string
  name: string
  kind: 'you' | 'simulated'
  joinedAt: string
}

export type RoomState = {
  active: boolean
  startedAt?: string
  participants: RoomParticipant[]
}

export type IntegrationStatus = 'local' | 'available' | 'boundary'

export type IntegrationDefinition = {
  id: string
  name: string
  description: string
  status: IntegrationStatus
}

export const defaultFocusProfiles: FocusProfile[] = [
  { id: 'deep-work', name: 'Deep work', description: 'Protect one meaningful block.', blockedWebsites: ['news.ycombinator.com', 'reddit.com'] },
  { id: 'study-sprint', name: 'Study sprint', description: 'Keep study materials in view.', blockedWebsites: ['youtube.com', 'social.example'] },
  { id: 'meeting-mode', name: 'Meeting mode', description: 'Reduce interruptions while talking.', blockedWebsites: [] },
  { id: 'writing-room', name: 'Writing room', description: 'Keep the page and your thoughts open.', blockedWebsites: ['mail.google.com'] },
]

export const integrationRegistry: IntegrationDefinition[] = [
  { id: 'local-storage', name: 'Local workspace', description: 'IndexedDB/localStorage persistence', status: 'local' },
  { id: 'ambient-audio', name: 'Ambient audio', description: 'Web Audio API soundscape', status: 'local' },
  { id: 'import-export', name: 'Import / export', description: 'Portable JSON backups', status: 'available' },
  { id: 'oauth-calendar', name: 'OAuth calendar', description: 'Requires an account and remote adapter', status: 'boundary' },
  { id: 'cloud-collaboration', name: 'Cloud collaboration', description: 'Requires a remote service', status: 'boundary' },
]

export const normalizeWebsite = (value: string): string => value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '')

export const addBlockedWebsite = (profile: FocusProfile, value: string): FocusProfile => {
  const website = normalizeWebsite(value)
  if (!website || profile.blockedWebsites.includes(website)) return profile
  return { ...profile, blockedWebsites: [...profile.blockedWebsites, website] }
}

export const removeBlockedWebsite = (profile: FocusProfile, website: string): FocusProfile => ({
  ...profile,
  blockedWebsites: profile.blockedWebsites.filter((item) => item !== website),
})

export const roomDurationSeconds = (room: RoomState, now = Date.now()): number =>
  room.active && room.startedAt ? Math.max(0, Math.floor((now - Date.parse(room.startedAt)) / 1000)) : 0

export const aiAdapterStatus = (provider: string): { label: string; detail: string } => {
  if (provider === 'Not configured') return { label: 'Local fallback active', detail: 'Deterministic insights and task planning run without a network provider.' }
  if (provider === 'Local model') return { label: 'Local adapter selected', detail: 'No model process is connected; deterministic fallback remains active.' }
  return { label: 'Remote adapter boundary', detail: 'Provider credentials and network transport are intentionally not implemented.' }
}
