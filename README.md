# Interview Prep Lab

Interactive interview prep for **software engineering** and **AI / ML** roles: animated data structures and algorithms with step-by-step explanations, system design walkthroughs with guided practice, behavioral STAR stories, flashcards, and ML labs.

**Live site:** https://trijans.github.io/interview-prep/

## Quick start

```bash
npm install        # once
npm run dev        # local dev server with hot reload → http://localhost:5173
npm run build      # production build → apps/web/dist
npm run typecheck  # type-check every package
```

Requires Node 20+.

## Repository layout

```
interview-prep/
├─ apps/
│  └─ web/                     React + TypeScript + Vite front end
│     └─ src/
│        ├─ app/               App shell, navigation, routes (#home, #ds, …)
│        ├─ components/        Shared UI: Tabs, Modal, PlayerBar, Explain, icons
│        ├─ lib/               Framework-free helpers: storage, dates, spaced repetition, playback
│        ├─ state/             Progress and settings stores (the seam for a future backend)
│        ├─ styles/            Global CSS and theme tokens (light/dark, accents)
│        └─ features/          One folder per area of the app
│           ├─ home/           Today panel, heatmap, tour, appearance, backup
│           ├─ data-structures/
│           ├─ algorithms/     sorting/, binary-search/, pathfinding/, patterns
│           ├─ problems/       Problem table + problem panel (hints, timer, reviews)
│           ├─ system-design/  Design viewer, guided practice, token bucket, consistent hashing
│           ├─ behavioral/
│           ├─ flashcards/
│           └─ ai/             Overview, labs/, ML coding, AI designs
├─ packages/
│  └─ content/                 All interview content as typed data (no UI code)
├─ docs/ARCHITECTURE.md        How the pieces fit together, and how to add things
└─ .github/workflows/          CI: type-check, build, deploy to GitHub Pages
```

## Adding content

All questions, problems, flashcards and designs live in `packages/content/src/` as typed TypeScript data. The editor will flag a missing field.

| To add… | Edit |
|---|---|
| A coding problem | `problems.ts` |
| An ML coding problem | `ai-problems.ts` |
| A flashcard or topic | `flashcards.ts` |
| A behavioral question | `behavioral.ts` |
| A system design (software or AI) | `designs.ts` (set `track: 'swe'` or `'ai'`) |
| A pattern template | `patterns.ts` |

Push to `main` and the site rebuilds and redeploys automatically.

## Deployment

`.github/workflows/deploy.yml` type-checks, builds and publishes `apps/web/dist` to GitHub Pages on every push to `main`. In the repo's **Settings → Pages**, the source must be set to **GitHub Actions**.

## Progress and privacy

Progress (solved problems, reviews, notes, stories, flashcards, design practice) is stored in the browser's `localStorage` under `ipl_*` keys. Use **Export / Import backup** on the Home page to move it between devices. See *Adding a backend* in `docs/ARCHITECTURE.md` for syncing across devices.
