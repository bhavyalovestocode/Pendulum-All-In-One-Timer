# Data schema

The current browser schema is a versioned JSON document stored in an IndexedDB object store named `state` under the `current` record. The existing `pendulum-state-v2` localStorage document is accepted as a migration source and remains the fallback store.

```ts
type PersistedState = {
  tasks: { id: string; title: string; projectId: string; done: boolean }[]
  projects: { id: string; name: string; color: string }[]
  theme: 'dark' | 'light'
  accent: string
  mode: 'focus' | 'short' | 'long' | 'stopwatch' | 'countdown'
  remaining: number
  isRunning: boolean
  completedFocus: number
  notifyOnTimerComplete: boolean
}
```

The persistence envelope is `{ version: 3, state: PersistedState }`. Loading merges a legacy or partial document with current defaults, so newly introduced fields are safe. JSON export/restore remains the user-controlled backup path; no remote database or sync transport is configured.
