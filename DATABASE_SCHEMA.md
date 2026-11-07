# Data schema

Milestone 1 uses browser local storage and stores one JSON document under `pendulum-state-v1`.

```ts
type PersistedState = {
  tasks: { id: string; title: string; projectId: string; done: boolean }[]
  projects: { id: string; name: string; color: string }[]
  theme: 'dark' | 'light'
  accent: string
  mode: 'focus' | 'short' | 'long'
  remaining: number
  isRunning: boolean
  completedFocus: number
}
```

The schema is deliberately small and versioned by the storage key. A future migration layer can upgrade this document to IndexedDB or a relational SQLite model without requiring view components to know the storage implementation.
