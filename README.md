# Interview Prep Lab

An interactive interview-prep web app with visual data structures, algorithms, system design walkthroughs, a behavioral STAR builder and technical flashcards.

The whole app is **one static file** (`index.html`). There is no server, no database and no build step, so hosting is free and there is nothing to maintain.

## What's inside

| Section | What you can do |
|---|---|
| Data Structures | Animate stack, queue, linked list (including reverse), BST (insert/search/delete/traversals), min-heap (sift up/down, build heap), hash table (chaining, resize) |
| Algorithms | 6 sorting algorithms with counters, binary search (exact + lower bound), BFS / DFS / Dijkstra / A* on a grid you draw, 14 pattern templates |
| Top Problems | 45 frequently asked LeetCode problems with pattern and company filters and solved tracking |
| System Design | URL shortener, rate limiter, chat, news feed, video streaming with animated request flows, plus a token bucket demo, consistent hashing demo and core concepts |
| Behavioral | 21 common questions, a STAR editor with auto-save, word count and a 2-minute timer |
| Technical Q&A | 36 flashcards: OS, networking, databases, OOP, concurrency, web/APIs |

Progress (solved problems, known cards, STAR stories) is saved in the browser's `localStorage`. It stays on that device and browser.

## Run locally

Open `index.html` in a browser. That's it.

## Deploy for free (pick one)

### Option A: GitHub Pages (simplest)
1. Create a new GitHub repo and add `index.html` (and this README).
2. Repo → **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / root → Save.
3. Your site will be live at `https://<username>.github.io/<repo>/` within a minute.

### Option B: Cloudflare Pages (fast global CDN, custom domain)
1. Push the repo to GitHub.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Build command: *(leave empty)*. Output directory: `/`.
4. Every `git push` redeploys automatically.

### Option C: Netlify Drop (no Git at all)
Drag the folder onto https://app.netlify.com/drop.

All three free tiers are far more than enough for a static site like this.

## Adding content

All content lives in plain JavaScript arrays near the bottom of `index.html`:

- `PROBS` lists problems: `[number, title, leetcode-slug, difficulty, pattern, company codes]`
- `SD` holds system designs (nodes with x/y positions, edges, flows, requirements, deep dives)
- `BQ` holds behavioral questions by category
- `FC` holds flashcards by topic
- `PATTERNS` holds pattern templates

Edit, save, push, and it's live.

## If you later want accounts or sync (still ~free)

Keep the site static and add a hosted backend only for user data:

- **Supabase** free tier (Postgres + auth) or **Firebase** Spark plan (Firestore + auth)
- Replace the `store.get/set` helper with calls to the backend once a user signs in

That keeps hosting at $0 and leaves no servers for you to patch.
