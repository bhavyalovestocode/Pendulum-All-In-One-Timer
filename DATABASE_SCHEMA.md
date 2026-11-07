# Data schema

Pendulum stores one JSON document under the current `pendulum-state-v2` key. Older `pendulum-state` and `pendulum-state-v1` documents are migrated on first hydration.

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

The persistence adapter uses an IndexedDB database named `pendulum-storage`, version `1`, with a `state` object store keyed by `pendulum-state-v2`. If IndexedDB is unavailable, the adapter uses the same localStorage key and finally an in-memory fallback. Reset removes the IndexedDB record and all supported localStorage keys.
