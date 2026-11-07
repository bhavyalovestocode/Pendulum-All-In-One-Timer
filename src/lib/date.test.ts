import { describe, expect, it } from 'vitest'
import { formatLocalDate, localDateKey } from './date'

describe('local date helpers', () => {
  it('uses the local calendar date rather than UTC date parts', () => {
    expect(localDateKey(new Date(2026, 0, 2, 0, 30))).toBe('2026-01-02')
  })

  it('formats a supplied date without creating render-time clocks', () => {
    expect(formatLocalDate(new Date(2026, 5, 15), { year: 'numeric' })).toContain('2026')
  })
})
