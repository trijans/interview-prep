# Architecture

## Goals

- **Readable:** one folder per feature, with content separate from code.
- **Scalable:** adding a problem, design or visualizer touches one obvious place.
- **Backend-ready:** content types and the storage layer are isolated, so a server can be added without rewriting the UI.
- **Free to host:** static build on GitHub Pages; no server needed today.

## Packages

| Package | What it holds | Depends on |
|---|---|---|
| `packages/content` (`@ipl/content`) | Typed interview content and its types (`Problem`, `Design`, `FlashcardDeck`, …). Plain data, no React. | nothing |
| `apps/web` (`@ipl/web`) | The React app. | `@ipl/content` |

npm workspaces link them, so `import { PROBLEMS } from '@ipl/content'` works everywhere.

## How the web app is organized

```
src/
  app/          Shell: sidebar/bottom nav, hash routes, lazy-loaded pages
  components/   Reusable UI with no feature knowledge
  lib/          Pure helpers (no React except hooks in playback.ts)
  state/        Global stores for progress and settings
  features/     Everything user-facing, one folder per section
```

Each page is loaded lazily (its own JS chunk) and stays mounted after the first visit, so a visualizer keeps its state while you move around the app.

## Visualizers: frames + one shared player

Every animation (data structures, sorting, search, gradient descent, k-means, design flows) is a **generator of frames**:

```ts
function* stackPush(s: StackState, v: number): Gen<StackState> {
  yield { state: s, code: SC.push, line: 1, say: 'First check there is room.' };
  const items = [...s.items, v];
  yield { state: { items, hl: { [items.length - 1]: 'new' } }, line: 2, say: `Put ${v} on top.` };
}
```

A frame carries the **full picture** (`state`), the **narration** (`say`), the **highlighted pseudocode line** (`line`) and how long to **hold** it. Components draw `state` and nothing else.

`useStepper` (in `lib/playback.ts`) plays any generator into a component. The global player handles pace (step-by-step, slow, normal, fast), pause/resume, the **Next step** button and the → key, plus fast-forwarding when you leave a page mid-animation.

**To add a visualizer:**
1. Write the algorithm as a generator that yields frames (logic only, easy to test).
2. Write a component that renders `frame.state` as SVG.
3. Use `<PlayerBar/>` and `<Explain/>` for controls and narration.

## Progress, settings and storage

- `lib/storage.ts`: `KeyValueStore` interface plus a `localStorage` implementation (`ipl_*` keys).
- `state/progress.ts`: the progress store (solved, reviews, notes, stories, flashcards, practice, activity). Components read it with `useProgress()` and change it only through its actions (`rate`, `setSolved`, `saveStory`, …).
- `state/settings.ts`: theme, accent colour, tour state, flashcard deck.
- `lib/srs.ts`: spaced-repetition scheduling (1 → 3 → 7 → 14 → 30 days), independent of storage.

## Adding a backend (when you're ready)

Nothing in the UI talks to `localStorage` directly, so a backend plugs in at two seams.

1. **Progress sync:** implement `KeyValueStore` against your API (for example `GET/PUT /me/progress/:key`) and pass it to `createProgressStore` in `state/progress.ts`. Add sign-in in `app/`.
2. **Content from a database (optional):** `@ipl/content` already defines the types. A Node/TypeScript server can import the same package to seed a database and type its API responses. A Python server can generate equivalent Pydantic models from these types.

A suggested place for it is `apps/api/`, which joins the workspace automatically.

Free or near-free hosting options include Supabase or Firebase for auth and data, or Cloudflare Workers for a small TypeScript API.

## Conventions

- TypeScript `strict` everywhere. `npm run typecheck` must pass, and CI enforces it.
- Content strings may use `**bold**`, `*italic*` and `` `code` ``, rendered by `<RichText/>`.
- CSS lives in `styles/global.css` with theme tokens as CSS variables; class names match the original design.
