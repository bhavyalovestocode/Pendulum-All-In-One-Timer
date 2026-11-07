import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { motion } from 'framer-motion'
import {
  Archive, BarChart3, BookOpen, CalendarDays, Check, ChevronRight, Circle, Clock3, CloudRain,
  Download, Flame, Goal, LayoutDashboard, ListTodo, Moon, Pause,
  Play, Plus, RotateCcw, Search, Settings2, Sparkles, Sun, Target, Trash2, Trophy,
  Upload, Volume2, X, Zap,
} from 'lucide-react'
import './App.css'

type Theme = 'dark' | 'light'
type Mode = 'focus' | 'short' | 'long' | 'stopwatch' | 'countdown'
type View = 'home' | 'tasks' | 'planner' | 'calendar' | 'goals' | 'habits' | 'analytics' | 'study' | 'notes' | 'ambient' | 'ai' | 'settings'
type Id = string

type Project = { id: Id; name: string; color: string }
type Task = { id: Id; title: string; projectId: Id; done: boolean; priority: 'low' | 'medium' | 'high'; due?: string; minutes: number }
type EventItem = { id: Id; title: string; date: string; time: string; minutes: number; kind: 'focus' | 'deadline' | 'class' }
type Habit = { id: Id; name: string; cadence: 'daily' | 'weekly'; days: string[]; completions: string[] }
type Goal = { id: Id; title: string; target: number; current: number; unit: string; due: string }
type Note = { id: Id; title: string; body: string; tags: string[]; pinned: boolean; updatedAt: string }
type StudyCard = { id: Id; front: string; back: string; due: string; reviews: number }
type Session = { id: Id; startedAt: string; endedAt: string; duration: number; mode: Mode; completed: boolean }
type PersistedState = {
  tasks: Task[]; projects: Project[]; events: EventItem[]; habits: Habit[]; goals: Goal[]; notes: Note[]
  studyCards: StudyCard[]; sessions: Session[]; theme: Theme; accent: string; mode: Mode
  remaining: number; timerEndsAt?: number; isRunning: boolean; completedFocus: number
  ambient: 'rain' | 'forest' | 'cafe' | 'night'; volume: number; soundOn: boolean; xp: number
  showCompleted: boolean; aiProvider: string; aiModel: string; quietHours: boolean
}

const STORAGE_KEY = 'pendulum-state-v2'
const durations: Record<Mode, number> = { focus: 25 * 60, short: 5 * 60, long: 15 * 60, countdown: 10 * 60, stopwatch: 0 }
const uid = () => crypto.randomUUID()
const today = () => new Date().toISOString().slice(0, 10)
const formatTime = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds))
  return `${Math.floor(safe / 60).toString().padStart(2, '0')}:${(safe % 60).toString().padStart(2, '0')}`
}
const defaultProjects: Project[] = [{ id: 'design', name: 'Design system', color: '#b57cff' }, { id: 'personal', name: 'Personal', color: '#6ed6c4' }]
const defaultTasks: Task[] = [
  { id: '1', title: 'Shape the next meaningful thing', projectId: 'design', done: false, priority: 'high', minutes: 45 },
  { id: '2', title: 'Clear the small wins from today', projectId: 'personal', done: false, priority: 'medium', due: today(), minutes: 25 },
  { id: '3', title: 'Write down one idea worth keeping', projectId: 'design', done: true, priority: 'low', minutes: 15 },
]
const getDefaultState = (): PersistedState => ({
  tasks: defaultTasks, projects: defaultProjects, events: [], habits: [{ id: 'h1', name: 'Morning pages', cadence: 'daily', days: [], completions: [] }],
  goals: [{ id: 'g1', title: 'Build a sustainable focus practice', target: 20, current: 7, unit: 'sessions', due: '2026-12-01' }],
  notes: [{ id: 'n1', title: 'Welcome to Pendulum', body: 'Use this space for ideas, meeting notes, and daily reflection.', tags: ['getting-started'], pinned: true, updatedAt: new Date().toISOString() }],
  studyCards: [{ id: 'c1', front: 'What makes a habit sustainable?', back: 'A clear cue, a small action, and a meaningful reward.', due: today(), reviews: 0 }],
  sessions: [], theme: 'dark', accent: '#a66bff', mode: 'focus', remaining: durations.focus, isRunning: false, completedFocus: 0,
  ambient: 'rain', volume: 35, soundOn: false, xp: 120, showCompleted: true, aiProvider: 'Not configured', aiModel: 'Local / optional', quietHours: false,
})
const getInitialState = (): PersistedState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return { ...getDefaultState(), ...JSON.parse(saved) }
  } catch { /* local-first app recovers with defaults if storage is unavailable */ }
  return getDefaultState()
}

function App() {
  const [state, setState] = useState<PersistedState>(getInitialState)
  const [view, setView] = useState<View>('home')
  const [showLanding, setShowLanding] = useState(true)
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [selectedNote, setSelectedNote] = useState<Id | null>(null)
  const [toast, setToast] = useState('')
  const importRef = useRef<HTMLInputElement>(null)

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(state)), [state])
  useEffect(() => {
    if (!state.isRunning) return
    const interval = window.setInterval(() => {
      setState((current) => {
        const now = Date.now()
        const remaining = current.mode === 'stopwatch' ? Math.floor((now - (current.timerEndsAt ?? now)) / 1000) * -1 : Math.ceil(((current.timerEndsAt ?? now) - now) / 1000)
        if (current.mode !== 'stopwatch' && remaining <= 0) {
          const startedAt = new Date((current.timerEndsAt ?? now) - durations[current.mode] * 1000).toISOString()
          const endedAt = new Date().toISOString()
          const finished: Session = { id: uid(), startedAt, endedAt, duration: durations[current.mode], mode: current.mode, completed: true }
          return { ...current, remaining: durations[current.mode], timerEndsAt: undefined, isRunning: false, completedFocus: current.mode === 'focus' ? current.completedFocus + 1 : current.completedFocus, xp: current.xp + (current.mode === 'focus' ? 25 : 5), sessions: [...current.sessions, finished] }
        }
        return { ...current, remaining }
      })
    }, 500)
    return () => window.clearInterval(interval)
  }, [state.isRunning, state.mode])
  useEffect(() => { if (!toast) return; const timeout = window.setTimeout(() => setToast(''), 2600); return () => window.clearTimeout(timeout) }, [toast])

  const activeTasks = state.tasks.filter((task) => !task.done)
  const completedTasks = state.tasks.filter((task) => task.done)
  const progress = state.mode === 'stopwatch' ? 0 : Math.round(((durations[state.mode] - state.remaining) / durations[state.mode]) * 100)
  const focusMinutes = Math.round(state.sessions.reduce((sum, session) => sum + session.duration, 0) / 60)
  const currentNote = state.notes.find((note) => note.id === selectedNote) ?? state.notes[0]

  const update = (patch: Partial<PersistedState>) => setState((current) => ({ ...current, ...patch }))
  const addToast = (message: string) => setToast(message)
  const startTimer = () => {
    const seconds = state.mode === 'stopwatch' ? 0 : state.remaining || durations[state.mode]
    update({ isRunning: true, timerEndsAt: Date.now() + seconds * 1000 })
  }
  const pauseTimer = () => {
    const remaining = state.mode === 'stopwatch' ? state.remaining : Math.max(0, Math.ceil(((state.timerEndsAt ?? Date.now()) - Date.now()) / 1000))
    update({ isRunning: false, timerEndsAt: undefined, remaining })
  }
  const resetTimer = () => update({ isRunning: false, timerEndsAt: undefined, remaining: durations[state.mode] })
  const setMode = (mode: Mode) => update({ mode, isRunning: false, timerEndsAt: undefined, remaining: durations[mode] })
  const addTask = (title = draft) => {
    if (!title.trim()) return
    update({ tasks: [...state.tasks, { id: uid(), title: title.trim(), projectId: state.projects[0]?.id ?? 'personal', done: false, priority: 'medium', minutes: 25 }] })
    setDraft('')
  }
  const toggleTask = (id: Id) => update({ tasks: state.tasks.map((task) => task.id === id ? { ...task, done: !task.done } : task) })
  const removeTask = (id: Id) => update({ tasks: state.tasks.filter((task) => task.id !== id) })
  const addEvent = () => {
    if (!draft.trim()) return
    update({ events: [...state.events, { id: uid(), title: draft.trim(), date: today(), time: '09:00', minutes: 45, kind: 'focus' }] })
    setDraft('')
  }
  const addHabit = () => {
    if (!draft.trim()) return
    update({ habits: [...state.habits, { id: uid(), name: draft.trim(), cadence: 'daily', days: [], completions: [] }] })
    setDraft('')
  }
  const completeHabit = (id: Id) => update({ habits: state.habits.map((habit) => habit.id === id && !habit.completions.includes(today()) ? { ...habit, completions: [...habit.completions, today()] } : habit) })
  const addGoal = () => {
    if (!draft.trim()) return
    update({ goals: [...state.goals, { id: uid(), title: draft.trim(), target: 10, current: 0, unit: 'steps', due: '2026-12-31' }] })
    setDraft('')
  }
  const addNote = () => {
    const note: Note = { id: uid(), title: draft.trim() || 'Untitled note', body: '', tags: [], pinned: false, updatedAt: new Date().toISOString() }
    update({ notes: [note, ...state.notes] }); setSelectedNote(note.id); setDraft('')
  }
  const updateNote = (patch: Partial<Note>) => currentNote && update({ notes: state.notes.map((note) => note.id === currentNote.id ? { ...note, ...patch, updatedAt: new Date().toISOString() } : note) })
  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'pendulum-backup.json'; anchor.click(); URL.revokeObjectURL(url); addToast('Backup exported')
  }
  const importData = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return
    const reader = new FileReader(); reader.onload = () => { try { update(JSON.parse(String(reader.result))); addToast('Backup restored') } catch { addToast('That backup file could not be read') } }; reader.readAsText(file)
  }

  if (showLanding) return <Landing state={state} progress={progress} formatTime={formatTime} enter={() => setShowLanding(false)} />

  const nav: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'home', label: 'Overview', icon: LayoutDashboard }, { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'planner', label: 'Planner', icon: Target }, { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'goals', label: 'Goals', icon: Goal }, { id: 'habits', label: 'Habits', icon: Flame },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }, { id: 'study', label: 'Study', icon: BookOpen },
    { id: 'notes', label: 'Notes', icon: Archive }, { id: 'ambient', label: 'Ambient', icon: CloudRain },
    { id: 'ai', label: 'AI assistant', icon: Sparkles }, { id: 'settings', label: 'Settings', icon: Settings2 },
  ]

  return (
    <div className={`app-shell ${state.theme}`} style={{ '--accent': state.accent } as React.CSSProperties}>
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">◒</span> pendulum</div>
        <div className="sidebar-label">Workspace</div>
        <div className="nav-scroll">{nav.map(({ id, label, icon: Icon }) => <button key={id} className={`side-link ${view === id ? 'active' : ''}`} onClick={() => setView(id)}><Icon size={16} /> {label}{id === 'tasks' && <span>{activeTasks.length}</span>}</button>)}</div>
        <div className="sidebar-spacer" />
        <button className="side-link" onClick={() => update({ theme: state.theme === 'dark' ? 'light' : 'dark' })}>{state.theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} {state.theme === 'dark' ? 'Light mode' : 'Dark mode'}</button>
        <button className="profile"><span>PC</span><div><strong>Personal space</strong><small>Local workspace · {state.xp} XP</small></div></button>
      </aside>
      <main className="workspace">
        <header className="workspace-header"><div><span className="crumb">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span><h2>{headings[view]}</h2></div><div className="header-actions"><div className="global-search"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your workspace" /></div><button className="icon-button" onClick={() => setShowLanding(true)} aria-label="Back to landing"><X size={18} /></button></div></header>
        {view === 'home' && <Overview state={state} activeTasks={activeTasks} focusMinutes={focusMinutes} progress={progress} formatTime={formatTime} setView={setView} startTimer={startTimer} pauseTimer={pauseTimer} resetTimer={resetTimer} setMode={setMode} addTask={addTask} draft={draft} setDraft={setDraft} toggleTask={toggleTask} removeTask={removeTask} />}
        {view === 'tasks' && <Tasks state={state} draft={draft} setDraft={setDraft} addTask={addTask} toggleTask={toggleTask} removeTask={removeTask} query={query} />}
        {view === 'planner' && <Planner state={state} draft={draft} setDraft={setDraft} addTask={addTask} addEvent={addEvent} />}
        {view === 'calendar' && <Calendar state={state} />}
        {view === 'goals' && <Goals state={state} draft={draft} setDraft={setDraft} addGoal={addGoal} update={update} />}
        {view === 'habits' && <Habits state={state} draft={draft} setDraft={setDraft} addHabit={addHabit} completeHabit={completeHabit} />}
        {view === 'analytics' && <Analytics state={state} focusMinutes={focusMinutes} completedTasks={completedTasks.length} />}
        {view === 'study' && <Study state={state} update={update} />}
        {view === 'notes' && <Notes state={state} currentNote={currentNote} selectedNote={selectedNote} setSelectedNote={setSelectedNote} addNote={addNote} updateNote={updateNote} query={query} />}
        {view === 'ambient' && <Ambient state={state} update={update} />}
        {view === 'ai' && <Assistant state={state} addTask={addTask} update={update} />}
        {view === 'settings' && <Settings state={state} update={update} exportData={exportData} importData={() => importRef.current?.click()} />}
        <input ref={importRef} className="hidden-input" type="file" accept="application/json" onChange={importData} />
        {toast && <div className="toast"><Check size={15} />{toast}</div>}
      </main>
    </div>
  )
}

const headings: Record<View, string> = { home: 'A clear place to begin.', tasks: 'Your open loops.', planner: 'Shape the day before it shapes you.', calendar: 'See the shape of your time.', goals: 'Small steps, visible direction.', habits: 'Practice what matters.', analytics: 'Notice your rhythm.', study: 'Learn with intention.', notes: 'A place for your thinking.', ambient: 'Make the room work for you.', ai: 'A quiet co-pilot, on your terms.', settings: 'Make Pendulum yours.' }

function Landing({ state, progress, formatTime, enter }: { state: PersistedState; progress: number; formatTime: (n: number) => string; enter: () => void }) {
  return <main className="landing"><div className="orb orb-one" /><div className="orb orb-two" /><nav className="landing-nav"><div className="brand"><span className="brand-mark">◒</span> pendulum</div><div className="nav-links"><a href="#philosophy">Why Pendulum</a><a href="#features">Features</a><button className="ghost-button" onClick={enter}>Open workspace <ChevronRight size={16} /></button></div></nav><section className="hero"><div className="hero-copy"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="eyebrow"><Sparkles size={14} /> A calmer way to get things done</motion.div><motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}>Make time<br /><em>meaningful.</em></motion.h1><motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .18 }}>Focus, planning, learning, and reflection in one beautifully quiet workspace. Free forever, local-first, and made for your best hours.</motion.p><div className="hero-actions"><button className="primary-button" onClick={enter}>Enter your workspace <ChevronRight size={17} /></button><span className="microcopy">No account required · Your data stays yours</span></div></div><motion.div className="hero-card-wrap" initial={{ opacity: 0, scale: .92, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: .2, duration: .8 }}><div className="hero-card-glow" /><div className="hero-card"><div className="mini-top"><span>Today · local workspace</span><span className="live-dot">● Ready</span></div><div className="mini-time">{formatTime(state.remaining)}</div><div className="mini-task"><span className="mini-check"><Check size={12} /></span><span>Make space for the important</span><span>↗</span></div><div className="mini-progress"><span style={{ width: `${Math.max(progress, 8)}%` }} /></div><div className="mini-bottom"><span>Focus session</span><button onClick={enter}><Play size={13} fill="currentColor" /> Start</button></div></div></motion.div></section><section className="signal-row" id="philosophy"><span>FOCUS</span><span>PLAN</span><span>ORGANISE</span><span>LEARN</span><span>IMPROVE</span></section><section className="feature-strip" id="features"><div><Clock3 size={20} /><strong>One gentle rhythm</strong><p>A reliable timer, planning surface, and reflection loop.</p></div><div><BookOpen size={20} /><strong>More than a timer</strong><p>Habits, notes, goals, study cards, and real progress signals.</p></div><div><Zap size={20} /><strong>Private by default</strong><p>Your workspace starts offline and stays yours until you choose otherwise.</p></div></section><footer className="landing-footer"><span>pendulum / all in one timer</span><span>Built for attention, not addiction.</span></footer></main>
}

function Overview({ state, activeTasks, focusMinutes, progress, formatTime, setView, startTimer, pauseTimer, resetTimer, setMode, addTask, draft, setDraft, toggleTask, removeTask }: { state: PersistedState; activeTasks: Task[]; focusMinutes: number; progress: number; formatTime: (n: number) => string; setView: (view: View) => void; startTimer: () => void; pauseTimer: () => void; resetTimer: () => void; setMode: (mode: Mode) => void; addTask: () => void; draft: string; setDraft: (value: string) => void; toggleTask: (id: Id) => void; removeTask: (id: Id) => void }) {
  return <section className="overview-grid"><div className="timer-panel panel"><div className="panel-heading"><div><span className="overline">Current intention</span><h3>{state.mode === 'focus' ? 'Deep work' : state.mode}</h3></div><span className="session-state">{state.isRunning ? 'In progress' : 'Ready when you are'}</span></div><div className="timer-orbit"><div className="orbit-ring" style={{ '--progress': `${progress * 3.6}deg` } as React.CSSProperties}><div className="timer-inner"><span>{state.mode === 'focus' ? 'Focus' : state.mode}</span><strong>{formatTime(state.remaining)}</strong><small>{progress > 0 ? `${progress}% complete` : 'A fresh start'}</small></div></div></div><div className="mode-tabs">{(['focus', 'short', 'long', 'stopwatch', 'countdown'] as Mode[]).map((mode) => <button key={mode} className={state.mode === mode ? 'selected' : ''} onClick={() => setMode(mode)}>{mode === 'stopwatch' ? 'Stopwatch' : mode === 'countdown' ? 'Countdown' : mode === 'focus' ? 'Focus' : mode === 'short' ? 'Short break' : 'Long break'}</button>)}</div><TimerControls state={state} startTimer={startTimer} pauseTimer={pauseTimer} resetTimer={resetTimer} /></div><div className="today-panel panel"><div className="panel-heading"><div><span className="overline">Today</span><h3>{activeTasks.length} things in motion</h3></div><button className="text-button" onClick={() => setView('tasks')}>View all <ChevronRight size={14} /></button></div><div className="task-list">{state.tasks.slice(0, 5).map((task) => <TaskItem key={task.id} task={task} project={state.projects.find((project) => project.id === task.projectId)} onToggle={toggleTask} onRemove={removeTask} />)}</div><QuickAdd draft={draft} setDraft={setDraft} add={addTask} placeholder="Add a task to your day..." /></div><div className="quote-panel panel"><span className="quote-mark">“</span><p>The quality of your attention is the quality of your life.</p><span className="quote-author">— Seneca</span></div><div className="pulse-panel panel"><div className="panel-heading"><div><span className="overline">Your pulse</span><h3>{focusMinutes} minutes measured</h3></div><span className="pulse-value">{state.xp} <small>XP</small></span></div><div className="bars">{[38, 58, 42, 76, 62, 88, 54].map((height, index) => <i key={index} style={{ height: `${height}%`, opacity: index === 6 ? 1 : .45 }} />)}</div><div className="bar-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Today</span></div></div></section>
}

function TimerControls({ state, startTimer, pauseTimer, resetTimer }: { state: PersistedState; startTimer: () => void; pauseTimer: () => void; resetTimer: () => void }) {
  return <div className="timer-controls"><button className="primary-button timer-button" onClick={state.isRunning ? pauseTimer : startTimer}>{state.isRunning ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}{state.isRunning ? 'Pause' : 'Begin session'}</button><button className="icon-button" onClick={resetTimer} aria-label="Reset timer"><RotateCcw size={17} /></button></div>
}
function QuickAdd({ draft, setDraft, add, placeholder }: { draft: string; setDraft: (value: string) => void; add: () => void; placeholder: string }) { return <div className="quick-add"><input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && add()} placeholder={placeholder} /><button onClick={add} aria-label="Add item"><Plus size={17} /></button></div> }
function TaskItem({ task, project, onToggle, onRemove }: { task: Task; project?: Project; onToggle: (id: Id) => void; onRemove: (id: Id) => void }) { return <div className={`task-item ${task.done ? 'done' : ''}`}><button className="task-check" onClick={() => onToggle(task.id)} aria-label={task.done ? 'Mark task incomplete' : 'Complete task'}>{task.done ? <Check size={14} /> : <Circle size={14} />}</button><span className="task-title">{task.title}</span><span className={`priority ${task.priority}`}>{task.priority}</span><span className="task-project"><i style={{ background: project?.color }} />{project?.name}</span><button className="remove-task" onClick={() => onRemove(task.id)} aria-label="Delete task"><Trash2 size={14} /></button></div> }

function Tasks({ state, draft, setDraft, addTask, toggleTask, removeTask, query }: { state: PersistedState; draft: string; setDraft: (value: string) => void; addTask: () => void; toggleTask: (id: Id) => void; removeTask: (id: Id) => void; query: string }) {
  const tasks = state.tasks.filter((task) => task.title.toLowerCase().includes(query.toLowerCase()))
  return <section className="tasks-view panel"><div className="panel-heading"><div><span className="overline">Task studio</span><h3>Everything you want to move forward</h3></div><span className="session-state">{state.tasks.filter((task) => task.done).length} complete</span></div><div className="filter-row"><span>List view</span><span>Kanban ready</span><span>Calendar ready</span></div><div className="task-list large-list">{tasks.map((task) => <TaskItem key={task.id} task={task} project={state.projects.find((project) => project.id === task.projectId)} onToggle={toggleTask} onRemove={removeTask} />)}</div><QuickAdd draft={draft} setDraft={setDraft} add={addTask} placeholder="Add another task..." /></section>
}
function Planner({ state, draft, setDraft, addTask, addEvent }: { state: PersistedState; draft: string; setDraft: (value: string) => void; addTask: () => void; addEvent: () => void }) { return <section className="module-grid"><div className="panel module-card wide"><div className="panel-heading"><div><span className="overline">Morning plan</span><h3>Give today a shape</h3></div><span className="session-state">{state.tasks.filter((task) => task.due === today()).length} due today</span></div><p className="muted-copy">Choose one important outcome, then make room for the rest.</p><label className="field-label">Today's priority</label><QuickAdd draft={draft} setDraft={setDraft} add={addTask} placeholder="What would make today meaningful?" /></div><div className="panel module-card"><span className="overline">Time blocks</span><h3>Protect the good hours</h3><div className="timeline">{['09:00 Deep work', '11:00 Admin & messages', '14:00 Learning block', '16:00 Review & reset'].map((item) => <div key={item}><i />{item}</div>)}</div></div><div className="panel module-card"><span className="overline">Quick schedule</span><h3>Put a block on the calendar</h3><QuickAdd draft={draft} setDraft={setDraft} add={addEvent} placeholder="e.g. Research session" /></div></section> }
function Calendar({ state }: { state: PersistedState }) { const days = Array.from({ length: 14 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() + index); return date }); return <section className="calendar-view panel"><div className="panel-heading"><div><span className="overline">Two-week view</span><h3>Your time, at a glance</h3></div><CalendarDays size={20} /></div><div className="calendar-grid">{days.map((date) => { const key = date.toISOString().slice(0, 10); const items = state.events.filter((event) => event.date === key); return <div className={`calendar-day ${key === today() ? 'today' : ''}`} key={key}><strong>{date.toLocaleDateString(undefined, { weekday: 'short' })}</strong><span>{date.getDate()}</span>{items.map((item) => <em key={item.id}>{item.title}</em>)}</div> })}</div></section> }
function Goals({ state, draft, setDraft, addGoal, update }: { state: PersistedState; draft: string; setDraft: (value: string) => void; addGoal: () => void; update: (patch: Partial<PersistedState>) => void }) { return <section className="module-grid">{state.goals.map((goal) => <div className="goal-card panel" key={goal.id}><div className="goal-icon"><Goal size={19} /></div><span className="overline">{goal.due}</span><h3>{goal.title}</h3><div className="goal-progress"><span style={{ width: `${Math.min(100, goal.current / goal.target * 100)}%` }} /></div><div className="goal-meta"><span>{goal.current} / {goal.target} {goal.unit}</span><button onClick={() => update({ goals: state.goals.map((item) => item.id === goal.id ? { ...item, current: Math.min(item.target, item.current + 1) } : item) })}>Log progress <Plus size={13} /></button></div></div>)}<div className="panel module-card add-card"><span className="overline">New direction</span><h3>What are you moving toward?</h3><QuickAdd draft={draft} setDraft={setDraft} add={addGoal} placeholder="Name a goal..." /></div></section> }
function Habits({ state, draft, setDraft, addHabit, completeHabit }: { state: PersistedState; draft: string; setDraft: (value: string) => void; addHabit: () => void; completeHabit: (id: Id) => void }) { return <section className="module-grid">{state.habits.map((habit) => <div className="habit-card panel" key={habit.id}><div className="habit-top"><div className="habit-icon"><Flame size={18} /></div><span>{habit.cadence}</span></div><h3>{habit.name}</h3><div className="habit-days">{Array.from({ length: 7 }, (_, index) => <i className={index === 6 && habit.completions.includes(today()) ? 'done' : ''} key={index} />)}</div><button className={`habit-action ${habit.completions.includes(today()) ? 'done' : ''}`} onClick={() => completeHabit(habit.id)}>{habit.completions.includes(today()) ? <><Check size={14} /> Done today</> : 'Mark today complete'}</button></div>)}<div className="panel module-card add-card"><span className="overline">Build gently</span><h3>Add a practice</h3><QuickAdd draft={draft} setDraft={setDraft} add={addHabit} placeholder="e.g. Walk outside..." /></div></section> }
function Analytics({ state, focusMinutes, completedTasks }: { state: PersistedState; focusMinutes: number; completedTasks: number }) { const average = state.sessions.length ? Math.round(focusMinutes / state.sessions.length) : 0; return <section className="analytics-grid"><div className="metric-card panel"><span>Focus time</span><strong>{focusMinutes}<small> min</small></strong><em>Measured from completed sessions</em></div><div className="metric-card panel"><span>Sessions</span><strong>{state.sessions.length}</strong><em>{average} min average</em></div><div className="metric-card panel"><span>Tasks complete</span><strong>{completedTasks}</strong><em>Across your local workspace</em></div><div className="panel chart-card"><div className="panel-heading"><div><span className="overline">Focus distribution</span><h3>Return, don't grind</h3></div><BarChart3 size={20} /></div><div className="bars tall">{[38, 58, 42, 76, 62, 88, 54].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div><div className="bar-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Today</span></div></div><div className="panel chart-card"><span className="overline">Measured history</span><h3>Recent sessions</h3><div className="session-history">{state.sessions.slice(-5).reverse().map((session) => <div key={session.id}><span>{new Date(session.endedAt).toLocaleDateString()}</span><strong>{session.mode}</strong><em>{Math.round(session.duration / 60)} min</em></div>)}</div></div></section> }
function Study({ state, update }: { state: PersistedState; update: (patch: Partial<PersistedState>) => void }) { const card = state.studyCards[0]; return <section className="study-grid"><div className="study-hero panel"><span className="overline">Spaced repetition</span><h3>Remember what you learn.</h3><p className="muted-copy">{state.studyCards.length} cards in your deck · {state.studyCards.filter((item) => item.reviews > 0).length} reviewed</p>{card && <div className="flashcard"><span>{card.front}</span><small>Reveal the answer in your head, then check it.</small><button onClick={() => update({ studyCards: state.studyCards.map((item) => item.id === card.id ? { ...item, reviews: item.reviews + 1, due: '2026-12-01' } : item) })}>I remembered it <Check size={14} /></button></div>}</div><div className="panel module-card"><span className="overline">Study dashboard</span><h3>Keep the loop alive</h3><div className="study-stat"><BookOpen size={18} /><span><strong>{dueCardsCount(state.studyCards)}</strong> cards due today</span></div><div className="study-stat"><Target size={18} /><span><strong>62%</strong> syllabus progress</span></div><div className="study-stat"><Trophy size={18} /><span><strong>3</strong> mock tests logged</span></div></div></section> }
const dueCardsCount = (cards: StudyCard[]) => cards.filter((card) => card.due <= today()).length
function Notes({ state, currentNote, selectedNote, setSelectedNote, addNote, updateNote, query }: { state: PersistedState; currentNote?: Note; selectedNote: Id | null; setSelectedNote: (id: Id) => void; addNote: () => void; updateNote: (patch: Partial<Note>) => void; query: string }) { return <section className="notes-layout panel"><aside className="notes-list"><div className="panel-heading"><h3>Notes</h3><button className="icon-button" onClick={addNote} aria-label="Add note"><Plus size={15} /></button></div>{state.notes.filter((note) => note.title.toLowerCase().includes(query.toLowerCase())).map((note) => <button className={`note-row ${selectedNote === note.id ? 'selected' : ''}`} key={note.id} onClick={() => setSelectedNote(note.id)}><strong>{note.title}</strong><small>{new Date(note.updatedAt).toLocaleDateString()}</small></button>)}</aside><div className="note-editor">{currentNote ? <><input className="note-title-input" value={currentNote.title} onChange={(event) => updateNote({ title: event.target.value })} /><textarea value={currentNote.body} onChange={(event) => updateNote({ body: event.target.value })} placeholder="Start writing..." /><div className="note-footer"><span>{currentNote.body.split(/\s+/).filter(Boolean).length} words · autosaved locally</span><button className="text-button" onClick={() => updateNote({ pinned: !currentNote.pinned })}>{currentNote.pinned ? 'Unpin' : 'Pin note'}</button></div></> : <div className="empty-state">Create a note to start thinking.</div>}</div></section> }
function Ambient({ state, update }: { state: PersistedState; update: (patch: Partial<PersistedState>) => void }) { const presets = [{ id: 'rain', label: 'Rainy window', color: '#4d79a5', icon: CloudRain }, { id: 'forest', label: 'Deep forest', color: '#3e806d', icon: Sparkles }, { id: 'cafe', label: 'Quiet café', color: '#ad735d', icon: Volume2 }, { id: 'night', label: 'Night sky', color: '#3c3b85', icon: Moon }] as const; return <section className="ambient-view"><div className="ambient-stage panel" style={{ background: `radial-gradient(circle at 70% 20%, ${presets.find((item) => item.id === state.ambient)?.color}, transparent 45%), #11111d` }}><div><span className="overline">Ambient workspace</span><h3>Let the room become quieter.</h3><p>Visual presets are local and audio controls are ready for legally licensed sound assets.</p></div><div className="ambient-clock">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div></div><div className="ambient-controls panel"><div className="preset-grid">{presets.map(({ id, label, color, icon: Icon }) => <button className={state.ambient === id ? 'selected' : ''} key={id} onClick={() => update({ ambient: id })} style={{ '--preset': color } as React.CSSProperties}><Icon size={17} /><span>{label}</span></button>)}</div><div className="volume-row"><button className={`sound-toggle ${state.soundOn ? 'selected' : ''}`} onClick={() => update({ soundOn: !state.soundOn })}><Volume2 size={16} /> {state.soundOn ? 'Sound on' : 'Sound off'}</button><input type="range" min="0" max="100" value={state.volume} onChange={(event) => update({ volume: Number(event.target.value) })} /><span>{state.volume}%</span></div></div></section> }
function Assistant({ state, addTask, update }: { state: PersistedState; addTask: (title: string) => void; update: (patch: Partial<PersistedState>) => void }) { const [prompt, setPrompt] = useState(''); const suggestions = ['Make a realistic plan for my open tasks', 'Break my highest-priority task into steps', 'Create a gentle study routine']; return <section className="assistant-view"><div className="assistant-card panel"><Sparkles size={22} /><span className="overline">Optional intelligence</span><h3>A co-pilot that never gets in the way.</h3><p className="muted-copy">Pendulum works without AI. Configure a provider only when you choose to, and keep requests under your control.</p><div className="assistant-input"><input value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ask for a plan or breakdown..." /><button onClick={() => { if (prompt.trim()) { addTask(`AI idea: ${prompt.trim()}`); setPrompt('') } }}>Create task <Plus size={14} /></button></div><div className="suggestion-row">{suggestions.map((item) => <button key={item} onClick={() => setPrompt(item)}>{item}</button>)}</div></div><div className="panel module-card"><span className="overline">Privacy boundary</span><h3>Provider configuration</h3><p className="muted-copy">No API key is bundled in the client. A future backend or local model adapter can use these preferences.</p><label className="field-label">Provider</label><select value={state.aiProvider} onChange={(event) => update({ aiProvider: event.target.value })}><option>Not configured</option><option>Local model</option><option>OpenAI-compatible backend</option><option>Anthropic-compatible backend</option></select><label className="field-label">Model label</label><input className="settings-input" value={state.aiModel} onChange={(event) => update({ aiModel: event.target.value })} /></div></section> }
function Settings({ state, update, exportData, importData }: { state: PersistedState; update: (patch: Partial<PersistedState>) => void; exportData: () => void; importData: () => void }) { return <section className="settings-view"><div className="panel settings-card"><span className="overline">Appearance</span><h3>Make the workspace yours.</h3><div className="settings-row"><span>Accent colour</span><div className="swatches">{['#a66bff', '#ff7d9d', '#4cc9a5', '#55a8ff', '#ff9e67'].map((color) => <button className={state.accent === color ? 'selected' : ''} key={color} style={{ background: color }} onClick={() => update({ accent: color })} aria-label={`Use ${color}`} />)}</div></div><div className="settings-row"><span>Quiet hours</span><button className={`toggle ${state.quietHours ? 'on' : ''}`} onClick={() => update({ quietHours: !state.quietHours })}>{state.quietHours ? 'On' : 'Off'}</button></div></div><div className="panel settings-card"><span className="overline">Data & privacy</span><h3>Your data belongs to you.</h3><p className="muted-copy">Pendulum is local-first. Export a complete JSON backup or restore one on another device.</p><div className="settings-actions"><button className="secondary-button" onClick={exportData}><Download size={15} /> Export all data</button><button className="secondary-button" onClick={importData}><Upload size={15} /> Restore backup</button></div></div><div className="panel settings-card"><span className="overline">Wellbeing</span><h3>Progress without pressure.</h3><p className="muted-copy">Gamification is optional and intentionally gentle. You have {state.xp} XP and no streak penalties.</p><div className="achievement"><Trophy size={17} /><span>Focus foundation</span><strong>{state.completedFocus >= 1 ? 'Unlocked' : 'In progress'}</strong></div></div></section> }

export default App
