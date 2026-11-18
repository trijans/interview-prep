import type { PathAlgo } from './info';

/** Grid model and search algorithms. Pure logic: no DOM, so it is easy to test or reuse. */
export const ROWS = 17, COLS = 35;
export type Cell = [number, number];
export const EMPTY = 0, WALL = 1, WEIGHT = 2;
export const key = ([r, c]: Cell) => r * COLS + c;
export const costOf = (grid: Uint8Array, [r, c]: Cell) => (grid[r * COLS + c] === WEIGHT ? 5 : 1);

export interface Visit { u: Cell; end?: boolean; add?: number; size?: number; d?: number; h?: number }

function neighbors(grid: Uint8Array, [r, c]: Cell): Cell[] {
  const out: Cell[] = [];
  for (const [dr, dc] of [[-1, 0], [0, 1], [1, 0], [0, -1]]) {
    const R = r + dr, C = c + dc;
    if (R >= 0 && R < ROWS && C >= 0 && C < COLS && grid[R * COLS + C] !== WALL) out.push([R, C]);
  }
  return out;
}

/** Minimal binary min-heap keyed by the first tuple element. */
class MinHeap<T> {
  private h: [number, T][] = [];
  get size() { return this.h.length; }
  push(x: [number, T]) {
    const h = this.h; h.push(x);
    let i = h.length - 1;
    while (i > 0) { const p = (i - 1) >> 1; if (h[p][0] <= h[i][0]) break; [h[p], h[i]] = [h[i], h[p]]; i = p; }
  }
  pop(): [number, T] {
    const h = this.h, top = h[0], last = h.pop()!;
    if (h.length) {
      h[0] = last;
      let i = 0;
      for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < h.length && h[l][0] < h[m][0]) m = l; if (r < h.length && h[r][0] < h[m][0]) m = r; if (m === i) break; [h[m], h[i]] = [h[i], h[m]]; i = m; }
    }
    return top;
  }
}

/** Yields every cell as it is visited. Returns true if the end was reached; fills `prev` for path reconstruction. */
export function* search(alg: PathAlgo, grid: Uint8Array, start: Cell, end: Cell, prev: Map<number, Cell>): Generator<Visit, boolean, unknown> {
  const E = key(end);
  if (alg === 'bfs') {
    const q: Cell[] = [start], seen = new Set([key(start)]);
    let qi = 0;
    while (qi < q.length) {
      const u = q[qi++];
      if (key(u) === E) { yield { u, end: true }; return true; }
      let add = 0;
      for (const v of neighbors(grid, u)) if (!seen.has(key(v))) { seen.add(key(v)); prev.set(key(v), u); q.push(v); add++; }
      yield { u, add, size: q.length - qi };
    }
    return false;
  }
  if (alg === 'dfs') {
    const st: [Cell, Cell | null][] = [[start, null]], seen = new Set<number>();
    while (st.length) {
      const [u, p] = st.pop()!;
      if (seen.has(key(u))) continue;
      seen.add(key(u));
      if (p) prev.set(key(u), p);
      if (key(u) === E) { yield { u, end: true }; return true; }
      let add = 0;
      for (const v of neighbors(grid, u).reverse()) if (!seen.has(key(v))) { st.push([v, u]); add++; }
      yield { u, add, size: st.length };
    }
    return false;
  }
  const h = ([r, c]: Cell) => (alg === 'astar' ? Math.abs(r - end[0]) + Math.abs(c - end[1]) : 0);
  const dist = new Map([[key(start), 0]]), pq = new MinHeap<Cell>(), done = new Set<number>();
  pq.push([h(start), start]);
  while (pq.size) {
    const [, u] = pq.pop();
    if (done.has(key(u))) continue;
    done.add(key(u));
    if (key(u) === E) { yield { u, end: true }; return true; }
    let add = 0;
    for (const v of neighbors(grid, u)) {
      const nd = dist.get(key(u))! + costOf(grid, v);
      if (nd < (dist.get(key(v)) ?? Infinity)) { dist.set(key(v), nd); prev.set(key(v), u); pq.push([nd + h(v), v]); add++; }
    }
    yield { u, add, size: pq.size, d: dist.get(key(u)), h: h(u) };
  }
  return false;
}

/** Plain-English description of one visit. */
export function narrate(alg: PathAlgo, v: Visit): string {
  const [r, c] = v.u, at = `row ${r + 1}, column ${c + 1}`;
  if (v.end) return `Reached the end at ${at}!`;
  const s = (n = 0) => (n === 1 ? '' : 's');
  if (alg === 'bfs') return `Take the cell at ${at} from the front of the queue. ${v.add ? `${v.add} new neighbor${v.add > 1 ? 's join' : ' joins'} the back of the queue` : 'All its neighbors were already seen'} (${v.size} waiting).`;
  if (alg === 'dfs') return `Take the cell at ${at} from the top of the stack and go deeper. ${v.add} neighbor${s(v.add)} pushed on top (${v.size} on the stack).`;
  if (alg === 'dijkstra') return `The cheapest unvisited cell is at ${at}, cost ${v.d} from the start. ${v.add ? `Found cheaper routes to ${v.add} neighbor${s(v.add)}.` : 'No neighbor gets a cheaper route.'}`;
  return `Best guess is the cell at ${at}: cost so far ${v.d} + estimated ${v.h} to go = ${(v.d ?? 0) + (v.h ?? 0)}. ${v.add ? `Updated ${v.add} neighbor${s(v.add)}.` : ''}`;
}
