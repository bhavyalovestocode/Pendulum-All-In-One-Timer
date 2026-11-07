export type PlanningTask = {
  id: string
  title: string
  priority: 'low' | 'medium' | 'high'
  minutes: number
  due?: string
  done: boolean
}

export type ReviewCard = {
  id: string
  due: string
  reviews: number
  intervalDays?: number
}

export type ScheduleBlock = {
  taskId: string
  title: string
  start: string
  end: string
  minutes: number
}

const priorityWeight = { high: 3, medium: 2, low: 1 }

export function prioritiseTasks(tasks: PlanningTask[]): PlanningTask[] {
  return [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    const priority = priorityWeight[b.priority] - priorityWeight[a.priority]
    if (priority !== 0) return priority
    return (a.due ?? '9999-12-31').localeCompare(b.due ?? '9999-12-31')
  })
}

export function scheduleTasks(tasks: PlanningTask[], startHour = 9, availableMinutes = 8 * 60): ScheduleBlock[] {
  const blocks: ScheduleBlock[] = []
  let cursor = startHour * 60
  let remaining = availableMinutes
  for (const task of prioritiseTasks(tasks).filter((item) => !item.done)) {
    if (remaining <= 0) break
    const minutes = Math.min(task.minutes, remaining)
    const start = `${Math.floor(cursor / 60).toString().padStart(2, '0')}:${(cursor % 60).toString().padStart(2, '0')}`
    cursor += minutes
    remaining -= minutes
    const end = `${Math.floor(cursor / 60).toString().padStart(2, '0')}:${(cursor % 60).toString().padStart(2, '0')}`
    blocks.push({ taskId: task.id, title: task.title, start, end, minutes })
    cursor += 10
    remaining = Math.max(0, remaining - 10)
  }
  return blocks
}

export function nextReviewDate(card: ReviewCard, remembered: boolean): string {
  const current = card.intervalDays ?? 1
  const interval = remembered ? Math.min(60, Math.max(1, current * 2)) : 1
  const date = new Date()
  date.setDate(date.getDate() + interval)
  return date.toISOString().slice(0, 10)
}

export function buildLocalInsight(tasks: PlanningTask[], focusMinutes: number): string {
  const open = tasks.filter((task) => !task.done)
  if (!open.length) return 'Your task list is clear. Use the space for reflection or recovery.'
  const high = open.filter((task) => task.priority === 'high').length
  if (high > 2) return `You have ${high} high-priority tasks open. Choose one and protect a single focused block before adding more.`
  if (focusMinutes === 0) return 'No completed focus sessions are recorded yet. Start with one small, protected block.'
  return `${focusMinutes} measured focus minutes are recorded. Your next best move is one ${open[0].minutes}-minute block for “${open[0].title}”.`
}
