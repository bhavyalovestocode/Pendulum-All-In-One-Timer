import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Check,
  ChevronRight,
  Circle,
  Clock3,
  Flame,
  LayoutDashboard,
  ListTodo,
  Moon,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Settings2,
  Sparkles,
  Sun,
  Trash2,
  X,
} from 'lucide-react'
import './App.css'

type Theme = 'dark' | 'light'
type Mode = 'focus' | 'short' | 'long'

type Project = {
  id: string
  name: string
  color: string
}

type Task = {
  id: string
  title: string
  projectId: string
  done: boolean
}

type PersistedState = {
  tasks: Task[]
  projects: Project[]
  theme: Theme
  accent: string
  mode: Mode
  remaining: number
  isRunning: boolean
  completedFocus: number
}

const STORAGE_KEY = 'pendulum-state-v1'
const durations: Record<Mode, number> = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 }

const defaultProjects: Project[] = [
  { id: 'design', name: 'Design system', color: '#b57cff' },
  { id: 'personal', name: 'Personal', color: '#6ed6c4' },
]

const defaultTasks: Task[] = [
  { id: '1', title: 'Shape the next meaningful thing', projectId: 'design', done: false },
  { id: '2', title: 'Clear the small wins from today', projectId: 'personal', done: false },
  { id: '3', title: 'Write down one idea worth keeping', projectId: 'design', done: true },
]

const getInitialState = (): PersistedState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return { ...getDefaultState(), ...JSON.parse(saved) }
  } catch {
    // A clean in-memory state is safer than blocking the app when storage is unavailable.
  }
  return getDefaultState()
}

const getDefaultState = (): PersistedState => ({
  tasks: defaultTasks,
  projects: defaultProjects,
  theme: 'dark',
  accent: '#a66bff',
  mode: 'focus',
  remaining: durations.focus,
  isRunning: false,
  completedFocus: 0,
})

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const remainder = (seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${remainder}`
}

function App() {
  const [view, setView] = useState<'home' | 'tasks' | 'stats'>('home')
  const [showLanding, setShowLanding] = useState(true)
  const [state, setState] = useState<PersistedState>(getInitialState)
  const [newTask, setNewTask] = useState('')
  const [newProject, setNewProject] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    if (!state.isRunning) return
    const interval = window.setInterval(() => {
      setState((current) => {
        if (current.remaining <= 1) {
          return {
            ...current,
            remaining: durations[current.mode],
            isRunning: false,
            completedFocus: current.mode === 'focus' ? current.completedFocus + 1 : current.completedFocus,
          }
        }
        return { ...current, remaining: current.remaining - 1 }
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [state.isRunning])

  const activeTasks = state.tasks.filter((task) => !task.done)
  const progress = Math.round(((durations[state.mode] - state.remaining) / durations[state.mode]) * 100)
  const currentProject = state.projects.find((project) => project.id === activeTasks[0]?.projectId)

  const setMode = (mode: Mode) => {
    setState((current) => ({ ...current, mode, remaining: durations[mode], isRunning: false }))
  }

  const addTask = () => {
    const title = newTask.trim()
    if (!title) return
    setState((current) => ({
      ...current,
      tasks: [...current.tasks, { id: crypto.randomUUID(), title, projectId: current.projects[0]?.id ?? 'personal', done: false }],
    }))
    setNewTask('')
  }

  const addProject = () => {
    const name = newProject.trim()
    if (!name) return
    setState((current) => ({
      ...current,
      projects: [...current.projects, { id: crypto.randomUUID(), name, color: '#ff8b7b' }],
    }))
    setNewProject('')
  }

  const toggleTask = (id: string) => {
    setState((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === id ? { ...task, done: !task.done } : task) }))
  }

  const removeTask = (id: string) => {
    setState((current) => ({ ...current, tasks: current.tasks.filter((task) => task.id !== id) }))
  }

  const resetTimer = () => setState((current) => ({ ...current, remaining: durations[current.mode], isRunning: false }))

  if (showLanding) {
    return (
      <main className="landing">
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <nav className="landing-nav">
          <div className="brand"><span className="brand-mark">◒</span> pendulum</div>
          <div className="nav-links"><a href="#philosophy">Why Pendulum</a><a href="#features">Features</a><button className="ghost-button" onClick={() => setShowLanding(false)}>Open workspace <ChevronRight size={16} /></button></div>
        </nav>
        <section className="hero">
          <div className="hero-copy">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="eyebrow"><Sparkles size={14} /> A calmer way to get things done</motion.div>
            <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}>Make time<br /><em>meaningful.</em></motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .18 }}>Pendulum brings focus, planning, and reflection into one beautifully quiet workspace. Free forever, local-first, and made for your best hours.</motion.p>
            <div className="hero-actions"><button className="primary-button" onClick={() => setShowLanding(false)}>Enter your workspace <ChevronRight size={17} /></button><span className="microcopy">No account required · Your data stays yours</span></div>
          </div>
          <motion.div className="hero-card-wrap" initial={{ opacity: 0, scale: .92, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: .2, duration: .8 }}>
            <div className="hero-card-glow" />
            <div className="hero-card">
              <div className="mini-top"><span>Tuesday, 12 November</span><span className="live-dot">● In focus</span></div>
              <div className="mini-time">{formatTime(state.remaining)}</div>
              <div className="mini-task"><span className="mini-check"><Check size={12} /></span><span>Make space for the important</span><span>↗</span></div>
              <div className="mini-progress"><span style={{ width: `${Math.max(progress, 8)}%` }} /></div>
              <div className="mini-bottom"><span>Focus session</span><button onClick={() => setShowLanding(false)}><Play size={13} fill="currentColor" /> Start</button></div>
            </div>
          </motion.div>
        </section>
        <section className="signal-row" id="philosophy"><span>FOCUS</span><span>PLAN</span><span>ORGANISE</span><span>TRACK</span><span>IMPROVE</span></section>
        <section className="feature-strip" id="features">
          <div><Clock3 size={20} /><strong>One gentle rhythm</strong><p>A timer that respects deep work and real breaks.</p></div>
          <div><ListTodo size={20} /><strong>Less to hold in your head</strong><p>Tasks and projects that stay clear, simple, and close.</p></div>
          <div><Flame size={20} /><strong>Progress you can feel</strong><p>Small signals that help you return to what matters.</p></div>
        </section>
        <footer className="landing-footer"><span>pendulum / all in one timer</span><span>Built for attention, not addiction.</span></footer>
      </main>
    )
  }

  return (
    <div className={`app-shell ${state.theme}`} style={{ '--accent': state.accent } as React.CSSProperties}>
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">◒</span> pendulum</div>
        <div className="sidebar-label">Workspace</div>
        <button className={`side-link ${view === 'home' ? 'active' : ''}`} onClick={() => setView('home')}><LayoutDashboard size={17} /> Overview</button>
        <button className={`side-link ${view === 'tasks' ? 'active' : ''}`} onClick={() => setView('tasks')}><ListTodo size={17} /> Tasks <span>{activeTasks.length}</span></button>
        <button className={`side-link ${view === 'stats' ? 'active' : ''}`} onClick={() => setView('stats')}><BarChart3 size={17} /> Reflection</button>
        <div className="sidebar-label project-label">Projects</div>
        {state.projects.map((project) => <div className="project-row" key={project.id}><i style={{ background: project.color }} />{project.name}<span>{state.tasks.filter((task) => task.projectId === project.id && !task.done).length}</span></div>)}
        <div className="add-project"><input value={newProject} onChange={(event) => setNewProject(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addProject()} placeholder="New project" /><button onClick={addProject} aria-label="Add project"><Plus size={15} /></button></div>
        <div className="sidebar-spacer" />
        <button className="side-link" onClick={() => setState((current) => ({ ...current, theme: current.theme === 'dark' ? 'light' : 'dark' }))}>{state.theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />} {state.theme === 'dark' ? 'Light mode' : 'Dark mode'}</button>
        <button className="side-link subtle"><Settings2 size={17} /> Preferences</button>
        <button className="profile"><span>PC</span><div><strong>Personal space</strong><small>Local workspace</small></div><ChevronRight size={15} /></button>
      </aside>
      <main className="workspace">
        <header className="workspace-header"><div><span className="crumb">Tuesday, 12 November</span><h2>{view === 'home' ? 'A clear place to begin.' : view === 'tasks' ? 'Your open loops.' : 'Notice your rhythm.'}</h2></div><button className="icon-button" onClick={() => setShowLanding(true)} aria-label="Back to landing"><X size={18} /></button></header>
        {view === 'home' && <section className="overview-grid">
          <div className="timer-panel panel">
            <div className="panel-heading"><div><span className="overline">Current intention</span><h3>{currentProject?.name ?? 'Your next focus'}</h3></div><span className="session-state">{state.isRunning ? 'In progress' : 'Ready when you are'}</span></div>
            <div className="timer-orbit"><div className="orbit-ring" style={{ '--progress': `${progress * 3.6}deg` } as React.CSSProperties}><div className="timer-inner"><span>{state.mode === 'focus' ? 'Focus' : state.mode === 'short' ? 'Short break' : 'Long break'}</span><strong>{formatTime(state.remaining)}</strong><small>{progress > 0 ? `${progress}% complete` : 'A fresh start'}</small></div></div></div>
            <div className="mode-tabs">{(['focus', 'short', 'long'] as Mode[]).map((mode) => <button key={mode} className={state.mode === mode ? 'selected' : ''} onClick={() => setMode(mode)}>{mode === 'focus' ? 'Focus' : mode === 'short' ? 'Short break' : 'Long break'}</button>)}</div>
            <div className="timer-controls"><button className="primary-button timer-button" onClick={() => setState((current) => ({ ...current, isRunning: !current.isRunning }))}>{state.isRunning ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}{state.isRunning ? 'Pause' : 'Begin session'}</button><button className="icon-button" onClick={resetTimer} aria-label="Reset timer"><RotateCcw size={17} /></button></div>
          </div>
          <div className="today-panel panel"><div className="panel-heading"><div><span className="overline">Today</span><h3>{activeTasks.length} things in motion</h3></div><button className="text-button" onClick={() => setView('tasks')}>View all <ChevronRight size={14} /></button></div><div className="task-list">{state.tasks.slice(0, 4).map((task) => <TaskItem key={task.id} task={task} project={state.projects.find((project) => project.id === task.projectId)} onToggle={toggleTask} onRemove={removeTask} />)}</div><div className="quick-add"><input value={newTask} onChange={(event) => setNewTask(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addTask()} placeholder="Add a task to your day..." /><button onClick={addTask} aria-label="Add task"><Plus size={17} /></button></div></div>
          <div className="quote-panel panel"><span className="quote-mark">“</span><p>The quality of your attention is the quality of your life.</p><span className="quote-author">— Seneca</span></div>
          <div className="pulse-panel panel"><div className="panel-heading"><div><span className="overline">Your pulse</span><h3>A little momentum</h3></div><span className="pulse-value">{state.completedFocus} <small>sessions</small></span></div><div className="bars">{[38, 58, 42, 76, 62, 88, 54].map((height, index) => <i key={index} style={{ height: `${height}%`, opacity: index === 6 ? 1 : .45 }} />)}</div><div className="bar-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Today</span></div></div>
        </section>}
        {view === 'tasks' && <section className="tasks-view panel"><div className="panel-heading"><div><span className="overline">Task studio</span><h3>Everything you want to move forward</h3></div><span className="session-state">{state.tasks.filter((task) => task.done).length} complete</span></div><div className="task-list large-list">{state.tasks.map((task) => <TaskItem key={task.id} task={task} project={state.projects.find((project) => project.id === task.projectId)} onToggle={toggleTask} onRemove={removeTask} />)}</div><div className="quick-add"><input value={newTask} onChange={(event) => setNewTask(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addTask()} placeholder="Add another task..." /><button onClick={addTask} aria-label="Add task"><Plus size={17} /></button></div></section>}
        {view === 'stats' && <section className="stats-view"><div className="stats-card panel"><span className="overline">The last seven days</span><h3>Consistency beats intensity.</h3><p>Your focus is a practice, not a performance. Keep returning.</p><div className="big-stat">{state.completedFocus}<small> sessions completed</small></div><div className="bars tall">{[38, 58, 42, 76, 62, 88, 54].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div></div><div className="reflection-card panel"><Sparkles size={20} /><h3>Make the next hour count.</h3><p>Start a focus session and let the rest become simpler.</p><button className="primary-button" onClick={() => { setView('home'); setState((current) => ({ ...current, isRunning: true })) }}>Begin a session <Play size={15} fill="currentColor" /></button></div></section>}
      </main>
    </div>
  )
}

function TaskItem({ task, project, onToggle, onRemove }: { task: Task; project?: Project; onToggle: (id: string) => void; onRemove: (id: string) => void }) {
  return <div className={`task-item ${task.done ? 'done' : ''}`}><button className="task-check" onClick={() => onToggle(task.id)} aria-label={task.done ? 'Mark task incomplete' : 'Complete task'}>{task.done ? <Check size={14} /> : <Circle size={14} />}</button><span className="task-title">{task.title}</span><span className="task-project"><i style={{ background: project?.color }} />{project?.name}</span><button className="remove-task" onClick={() => onRemove(task.id)} aria-label="Delete task"><Trash2 size={14} /></button></div>
}

export default App
