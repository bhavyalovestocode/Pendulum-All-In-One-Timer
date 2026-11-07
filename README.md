# Pendulum — All In One Timer

Pendulum is a free, local-first productivity workspace for focused work, thoughtful planning, and visible progress. It combines an animated focus timer, lightweight tasks, projects, and a quiet reflection surface in one responsive web app.

## Milestone 1

- Original animated landing page and hero experience.
- Responsive workspace shell with overview, tasks, and reflection views.
- Focus, short-break, and long-break timer modes.
- Timer controls with persisted local session state.
- Persistent tasks and projects backed by browser local storage.
- Dark/light theme switching and an extensible accent token.
- UI coverage for landing, timer, and task interactions.

Later milestones will add planning, habits, analytics, ambient audio, notes, student workflows, optional AI providers, and sync without introducing paid feature gates.

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

Core data is stored under the `pendulum-state-v1` local-storage key. Clearing browser storage resets the local workspace to the starter state.
