# Architecture

Pendulum is currently a client-only React/TypeScript application. The UI is split into three conceptual surfaces: a public landing page, an application shell, and feature panels for the timer, tasks, projects, and reflection.

## Boundaries

- `App.tsx` owns the current Milestone 1 orchestration and composes the visual surfaces.
- Browser persistence is isolated at the `getInitialState`/`localStorage` boundary so it can later be replaced with IndexedDB or a sync adapter.
- Timer state is represented as mode, remaining seconds, and running status. The interval only updates while running and resets cleanly when a session completes.
- CSS custom properties carry theme and accent values, keeping the component tree independent from color implementation details.

## Extension direction

Future modules should add typed domain slices and storage adapters rather than coupling data access to presentational components. The same shell navigation can host planner, analytics, ambient, notes, and student modules without changing the timer contract.

## Infrastructure adapters

`src/lib/storage.ts` provides a versioned persistence boundary. It prefers IndexedDB, creates the Pendulum object store on upgrade, reads existing `pendulum-state-v2` JSON data, and falls back to localStorage or memory when browser storage is unavailable. The current UI retains its synchronous localStorage bootstrap for fast first paint while the adapter is available for the next async hydration step.

`src/lib/notifications.ts` is an explicit browser notification boundary. Permission is requested only from Settings, and timer completion is a guarded best-effort notification. `src/lib/sync.ts` defines the future sync contract while reporting local/offline status without transmitting user data.

`src/lib/ambient.ts` provides a generated Web Audio API soundscape using oscillator voices; it does not fetch or embed licensed music. `src/lib/ecosystem.ts` contains typed local focus profiles, simulated room presence, integration registry metadata, and deterministic AI adapter status. These modules are deliberately local-only: OAuth, cloud sync/collaboration, remote AI transport, browser/OS blocking permissions, native OS integrations, and licensed music remain adapter boundaries.
