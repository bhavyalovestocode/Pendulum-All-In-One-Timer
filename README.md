# Pendulum — All In One Timer

Pendulum is a free, local-first productivity workspace for focused work, thoughtful planning, learning, and visible progress. It combines an animated focus timer with tasks, planning, goals, habits, analytics, notes, study cards, ambient scenes, optional AI configuration, and privacy tools.

## What is included

- Animated landing page and responsive application shell.
- Absolute-time focus timer with focus, break, countdown, and stopwatch modes.
- Persistent tasks with priorities, project association, search, completion, and task-time estimates.
- Planner, two-week calendar, goals, habits, and measured focus analytics.
- Notes with autosaved editing, pinning, search, and word counts.
- Study dashboard with flashcard review tracking and due-card calculations.
- Ambient scene presets, volume controls, and saved workspace preferences.
- Optional AI provider/model configuration that never blocks core workflows.
- XP and achievement surface with non-punitive progress.
- Local JSON export/restore and quiet-hours settings.

## Honest integration boundaries

Pendulum does not pretend that browser-only code can securely provide cloud sync, OAuth calendar/music integrations, native notifications, encrypted accounts, or operating-system website blocking. Those capabilities have explicit adapter boundaries in the UI and are documented for future IndexedDB, backend, and desktop implementations.

## Development

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run build
npm run test
npm run lint
```

Core data is stored under the versioned `pendulum-state-v2` local-storage key. Use **Settings → Export all data** for a complete JSON backup; **Restore backup** imports it on another device.
