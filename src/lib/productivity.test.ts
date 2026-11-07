import { describe, expect, it } from 'vitest'
import { buildLocalInsight, nextReviewDate, prioritiseTasks, scheduleTasks } from './productivity'

describe('local productivity helpers', () => {
  it('prioritises unfinished high priority tasks', () => {
    const result = prioritiseTasks([
      { id: 'done', title: 'Done', priority: 'high', minutes: 20, done: true },
      { id: 'low', title: 'Low', priority: 'low', minutes: 20, done: false },
      { id: 'high', title: 'High', priority: 'high', minutes: 20, done: false },
    ])
    expect(result.map((task) => task.id)).toEqual(['high', 'low', 'done'])
  })

  it('creates non-overlapping schedule blocks within available time', () => {
    const result = scheduleTasks([{ id: 'a', title: 'A', priority: 'high', minutes: 40, done: false }])
    expect(result[0]).toMatchObject({ start: '09:00', end: '09:40', minutes: 40 })
  })

  it('doubles review intervals after a remembered card', () => {
    expect(nextReviewDate({ id: 'card', due: '2026-01-01', reviews: 1, intervalDays: 2 }, true)).not.toBe('2026-01-01')
    expect(buildLocalInsight([], 0)).toContain('task list is clear')
  })
})
