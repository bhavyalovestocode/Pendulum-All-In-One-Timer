# Development status

## Completed

### Milestone 1 — Foundation

- React, TypeScript, Vite, Vitest, local-first persistence, original visual system, and responsive shell.
- Animated landing page and hero experience.
- Focus, short-break, long-break, countdown, and stopwatch modes with absolute timestamp timer progression.
- Persistent tasks and projects with completion, priorities, search, and task/project views.

### Milestone 2 — Productivity core

- Configurable navigation across dashboard, tasks, planner, calendar, goals, habits, analytics, study, notes, ambient, AI, and settings.
- Daily planning surface with time blocks and quick scheduling.
- Two-week calendar preview with real local events.
- Goals with progress logging.
- Habits with daily completion and history markers.
- Local reminders/preferences boundary and quiet-hours setting.

### Milestone 3 — Analytics

- Measured focus minutes from completed sessions.
- Session count, average duration, task completion totals, distribution chart, and session history.
- Analytics explicitly distinguish measured data from illustrative visual scaffolding.

### Milestone 4 — Ambient workspace

- Local ambient presets, visual scene switching, clock stage, volume control, and soundscape toggle boundary.
- Provider/licensing restrictions are not hidden; external audio assets are intentionally not fabricated.

### Milestone 5 — Advanced productivity and knowledge

- Notes with autosaved title/body editing, pinning, search, word counts, and local persistence.
- Study dashboard with flashcard review tracking and due-card calculations.
- Goal and task structures provide extension points for kanban, dependencies, and scheduling.

### Milestone 6 — Optional intelligence

- Provider-independent AI settings surface with local/compatible backend choices.
- Natural-language prompts can create local tasks without requiring an AI provider.
- No API keys are shipped in frontend code and core functionality remains independent of AI.

### Milestone 7 — Ecosystem boundaries

- Gamification XP and achievement surface with wellbeing-safe, non-punitive progress.
- Collaboration, calendar providers, music providers, and desktop integrations are represented as explicit future adapter boundaries rather than fake integrations.

### Milestone 8 — Privacy and release quality

- Complete JSON export and restore flow.
- Local-first offline behavior with versioned storage key.
- Build, test, lint, and live browser verification completed.

### Milestone 9 — Local infrastructure

- Typed domain and persistence helpers extracted from `App.tsx`.
- Versioned IndexedDB persistence with migration from `pendulum-state-v2` and localStorage fallback.
- Guarded, opt-in browser notification service wired to timer completion.
- Explicit sync adapter/status boundary with no transmission or simulated connection.
- Settings exposes storage, notification permission, sync status, and JSON backup controls.
- Storage migration/fallback and notification guard tests added.

## Known limitations

- Native desktop packaging, cloud synchronization, conflict resolution, encrypted accounts, and OAuth provider integrations still require backend/desktop adapters.
- IndexedDB is currently a single local workspace record; multi-device sync and conflict resolution are intentionally not implemented.
- Ambient audio currently provides controls and scene persistence; legally distributable audio assets need to be supplied or hosted before playback can be enabled.
- Charts use the measured session history where labeled; the compact overview pulse bars remain decorative context.

## Next milestone

Implement an explicit remote sync adapter only when a backend/authentication design is approved; preserve the local/offline behavior when it is unavailable.
