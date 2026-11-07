# Architecture

Pendulum is currently a client-only React/TypeScript application. The UI is split into three conceptual surfaces: a public landing page, an application shell, and feature panels for the timer, tasks, projects, and reflection.

## Boundaries

- `App.tsx` owns the current Milestone 1 orchestration and composes the visual surfaces.
- Browser persistence is isolated at the `getInitialState`/`localStorage` boundary so it can later be replaced with IndexedDB or a sync adapter.
- Timer state is represented as mode, remaining seconds, and running status. The interval only updates while running and resets cleanly when a session completes.
- CSS custom properties carry theme and accent values, keeping the component tree independent from color implementation details.

## Extension direction

Future modules should add typed domain slices and storage adapters rather than coupling data access to presentational components. The same shell navigation can host planner, analytics, ambient, notes, and student modules without changing the timer contract.
