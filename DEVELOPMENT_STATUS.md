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
- Study dashboard with flashcard review tracking, due-card calculations, and deterministic interval progression.
- Task studio includes list, Kanban, and timeline views with deterministic priority ordering and schedule blocks.
- Local productivity helpers cover task prioritisation, schedule generation, review intervals, and measured insights.

### Milestone 6 — Optional intelligence

- Provider-independent AI settings surface with local/compatible backend choices.
- Natural-language prompts can create local tasks without requiring an AI provider.
- Deterministic local assistant suggestions provide task insights and schedule recommendations before any provider is configured.
- No API keys are shipped in frontend code and core functionality remains independent of AI.

### Milestone 7 — Ecosystem boundaries

- Gamification XP and achievement surface with wellbeing-safe, non-punitive progress.
- Ecosystem workspace includes a local body-doubling room model, focus profiles, plugin readiness indicators, and explicit sync/provider boundaries.
- Collaboration, calendar providers, music providers, and desktop integrations remain explicit future adapter boundaries rather than fake integrations.

### Milestone 8 — Privacy and release quality

- Complete JSON export and restore flow.
- Local-first offline behavior with versioned storage key.
- Build, test, lint, and live browser verification completed.
- IndexedDB-first persistence adapter with localStorage/memory fallback.
- Explicit notification service and opt-in browser permission flow.
- Local/offline sync adapter status boundary without data transmission.

## Known limitations

- Browser notifications, native desktop packaging, cloud synchronization, conflict resolution, encrypted accounts, and OAuth provider integrations still require backend/desktop adapters.
- Ambient audio currently provides controls and scene persistence; legally distributable audio assets need to be supplied or hosted before playback can be enabled.
- Charts use the measured session history where labeled; the compact overview pulse bars remain decorative context.

## Next milestone

Production hardening remains: broaden end-to-end workflow coverage, remove render-time Date purity warnings, add PWA/offline installation polish, and document adapter contracts for real cloud, desktop, and collaboration providers.
