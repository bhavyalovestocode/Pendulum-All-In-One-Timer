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
- Local JSON export/restore, quiet-hours settings, guarded browser notifications, and explicit sync boundaries.

## Honest integration boundaries

Pendulum does not pretend that browser-only code can securely provide cloud sync, OAuth calendar/music integrations, encrypted accounts, or operating-system website blocking. Workspace persistence prefers versioned IndexedDB, migrates the existing `pendulum-state-v2` localStorage document, and falls back to localStorage when IndexedDB is unavailable. Browser notifications are optional, guarded, and require an explicit permission request; sync remains a visible “Not configured” boundary with no data transmission.

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

Core data is stored through the versioned storage service. Use **Settings → Export all data** for a complete JSON backup; **Restore backup** imports it on another device. The legacy `pendulum-state-v2` localStorage key remains the migration and fallback location.
