import { describe, expect, it } from 'vitest'
import { addBlockedWebsite, aiAdapterStatus, defaultFocusProfiles, normalizeWebsite, roomDurationSeconds } from './ecosystem'

describe('ecosystem helpers', () => {
  it('normalizes and deduplicates blocked websites', () => {
    expect(normalizeWebsite('https://www.Example.com/path')).toBe('example.com')
    const profile = addBlockedWebsite(defaultFocusProfiles[0], 'https://www.Example.com')
    expect(addBlockedWebsite(profile, 'example.com').blockedWebsites).toContain('example.com')
    expect(addBlockedWebsite(profile, 'example.com').blockedWebsites.filter((item) => item === 'example.com')).toHaveLength(1)
  })

  it('reports local room duration and deterministic AI fallback status', () => {
    const startedAt = new Date(1_000).toISOString()
    expect(roomDurationSeconds({ active: true, startedAt, participants: [] }, 61_000)).toBe(60)
    expect(aiAdapterStatus('Not configured').label).toBe('Local fallback active')
  })
})
