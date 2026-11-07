# Architecture

Pendulum is currently a client-only React/TypeScript application. The UI is split into three conceptual surfaces: a public landing page, an application shell, and feature panels for the timer, tasks, projects, and reflection.

## Boundaries

- `App.tsx` owns orchestration and composes the visual surfaces; domain types live in `src/lib/types.ts`.
- `src/lib/storage.ts` provides typed, versioned persistence. IndexedDB is preferred, the raw `pendulum-state-v2` localStorage document is migrated on first load, and localStorage is the safe fallback.
- `src/lib/notifications.ts` owns browser capability and permission guards. The app never requests permission automatically and only sends a completion notification when the user has enabled it and permission is already granted.
- `src/lib/sync.ts` defines the sync adapter/status boundary. The current adapter is explicitly not configured and transmits no data.
- Timer state is represented as mode, remaining seconds, and running status. The interval only updates while running and resets cleanly when a session completes.
- CSS custom properties carry theme and accent values, keeping the component tree independent from color implementation details.

## Extension direction

Future modules should add typed domain slices and adapters rather than coupling data access to presentational components. The same shell navigation can host planner, analytics, ambient, notes, and student modules without changing the timer contract.
