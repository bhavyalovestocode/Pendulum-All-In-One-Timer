export type Theme = 'dark' | 'light'
export type Mode = 'focus' | 'short' | 'long' | 'stopwatch' | 'countdown'
export type Id = string

export type Project = { id: Id; name: string; color: string }
export type Task = { id: Id; title: string; projectId: Id; done: boolean; priority: 'low' | 'medium' | 'high'; due?: string; minutes: number }
export type EventItem = { id: Id; title: string; date: string; time: string; minutes: number; kind: 'focus' | 'deadline' | 'class' }
export type Habit = { id: Id; name: string; cadence: 'daily' | 'weekly'; days: string[]; completions: string[] }
export type Goal = { id: Id; title: string; target: number; current: number; unit: string; due: string }
export type Note = { id: Id; title: string; body: string; tags: string[]; pinned: boolean; updatedAt: string }
export type StudyCard = { id: Id; front: string; back: string; due: string; reviews: number }
export type Session = { id: Id; startedAt: string; endedAt: string; duration: number; mode: Mode; completed: boolean }

export type PersistedState = {
  tasks: Task[]; projects: Project[]; events: EventItem[]; habits: Habit[]; goals: Goal[]; notes: Note[]
  studyCards: StudyCard[]; sessions: Session[]; theme: Theme; accent: string; mode: Mode
  remaining: number; timerEndsAt?: number; isRunning: boolean; completedFocus: number
  ambient: 'rain' | 'forest' | 'cafe' | 'night'; volume: number; soundOn: boolean; xp: number
  showCompleted: boolean; aiProvider: string; aiModel: string; quietHours: boolean
  notifyOnTimerComplete: boolean
}
