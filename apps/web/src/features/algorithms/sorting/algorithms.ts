import type { Frame } from '@/lib/playback';
import type { SortId } from './info';

/**
 * Each sorting algorithm is a generator that works on a copy of the array and
 * yields one frame per comparison or swap, with a plain-English explanation.
 */
export interface SortState {
  a: number[];
  done: number[];
  /** indices being compared */ c?: number[];
  /** indices swapped or written */ s?: number[];
  /** pivot index */ p?: number;
  /** active range [lo, hi] */ r?: [number, number];
  cmp: number;
  swp: number;
}

type SortGen = Generator<Frame<SortState>, void, unknown>;

function makeCtx(input: number[]) {
  const a = [...input], done = new Set<number>();
  let cmp = 0, swp = 0;
  const frame = (x: Partial<SortState>, line: number, say: string): Frame<SortState> =>
    ({ state: { a: [...a], done: [...done], cmp, swp, ...x }, line, say });
  return {
    a, done, frame,
    compare: () => { cmp++; },
    swap: (i: number, j: number) => { [a[i], a[j]] = [a[j], a[i]]; swp++; },
    write: () => { swp++; },
  };
}

function* bubble(input: number[]): SortGen {
  const k = makeCtx(input), a = k.a, n = a.length;
  for (let i = 0; i < n; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      k.compare();
      const out = a[j] > a[j + 1];
      yield k.frame({ c: [j, j + 1] }, 2, `Compare neighbours ${a[j]} and ${a[j + 1]}. ${out ? `${a[j]} is bigger, so they are in the wrong order.` : 'They are already in order, so leave them.'}`);
      if (out) { k.swap(j, j + 1); swapped = true; yield k.frame({ s: [j, j + 1] }, 3, `Swap them. The bigger value, ${a[j + 1]}, moves one step to the right.`); }
    }
    k.done.add(n - 1 - i);
    yield k.frame({}, 4, `End of pass ${i + 1}: the biggest remaining value, ${a[n - 1 - i]}, has reached the end. It is in its final place (green).`);
    if (!swapped) { yield k.frame({}, 4, 'No swaps happened in this pass, so everything is already in order. Stop early.'); break; }
  }
}

function* selection(input: number[]): SortGen {
  const k = makeCtx(input), a = k.a, n = a.length;
  for (let i = 0; i < n; i++) {
    let m = i;
    yield k.frame({ p: m }, 1, `Fill position ${i}. Start by assuming ${a[i]} (purple) is the smallest remaining value.`);
    for (let j = i + 1; j < n; j++) {
      k.compare();
      const smaller = a[j] < a[m];
      yield k.frame({ c: [j], p: m }, 3, `Is ${a[j]} smaller than the smallest so far, ${a[m]}? ${smaller ? 'Yes, remember it instead.' : 'No.'}`);
      if (smaller) m = j;
    }
    if (m !== i) { k.swap(i, m); yield k.frame({ s: [i, m] }, 4, `The smallest remaining value is ${a[i]}. Swap it into position ${i}.`); }
    else yield k.frame({}, 4, `${a[i]} was already the smallest, so it stays at position ${i}.`);
    k.done.add(i);
  }
}

function* insertion(input: number[]): SortGen {
  const k = makeCtx(input), a = k.a, n = a.length;
  for (let i = 1; i < n; i++) {
    let j = i;
    yield k.frame({ p: i }, 0, `Everything left of position ${i} is sorted. Take ${a[i]} (purple) and slide it left into place.`);
    while (j > 0) {
      k.compare();
      const out = a[j - 1] > a[j];
      yield k.frame({ c: [j - 1, j] }, 2, `Is ${a[j - 1]} bigger than ${a[j]}? ${out ? 'Yes, so swap them.' : `No, so ${a[j]} has found its place.`}`);
      if (!out) break;
      k.swap(j - 1, j);
      yield k.frame({ s: [j - 1, j] }, 3, `Swapped. ${a[j - 1]} moves one step left.`);
      j--;
    }
  }
}

function* merge(input: number[]): SortGen {
  const k = makeCtx(input), a = k.a;
  function* ms(lo: number, hi: number): SortGen {
    if (hi <= lo) return;
    const mid = (lo + hi) >> 1;
    yield k.frame({ r: [lo, hi] }, 2, `Split positions ${lo}–${hi} into two halves: ${lo}–${mid} and ${mid + 1}–${hi}. Sort each half first.`);
    yield* ms(lo, mid);
    yield* ms(mid + 1, hi);
    const L = a.slice(lo, mid + 1), R = a.slice(mid + 1, hi + 1);
    let i = 0, j = 0, w = lo;
    yield k.frame({ r: [lo, hi] }, 4, `Both halves are now sorted: [${L.join(', ')}] and [${R.join(', ')}]. Merge them.`);
    while (i < L.length && j < R.length) {
      k.compare();
      const takeLeft = L[i] <= R[j];
      yield k.frame({ c: [w], r: [lo, hi] }, 4, `Compare the front of each half: ${L[i]} vs ${R[j]}. Take the smaller one, ${takeLeft ? L[i] : R[j]}.`);
      a[w++] = takeLeft ? L[i++] : R[j++];
      k.write();
      yield k.frame({ s: [w - 1], r: [lo, hi] }, 5, `Write ${a[w - 1]} into position ${w - 1}.`);
    }
    while (i < L.length) { a[w++] = L[i++]; k.write(); yield k.frame({ s: [w - 1], r: [lo, hi] }, 5, `The right half is used up. Copy the rest of the left half: ${a[w - 1]}.`); }
    while (j < R.length) { a[w++] = R[j++]; k.write(); yield k.frame({ s: [w - 1], r: [lo, hi] }, 5, `The left half is used up. Copy the rest of the right half: ${a[w - 1]}.`); }
  }
  yield* ms(0, a.length - 1);
}

function* quick(input: number[]): SortGen {
  const k = makeCtx(input), a = k.a;
  function* qs(lo: number, hi: number): SortGen {
    if (lo > hi) return;
    if (lo === hi) { k.done.add(lo); return; }
    const pv = a[hi];
    let i = lo;
    yield k.frame({ p: hi, r: [lo, hi] }, 2, `Work on positions ${lo}–${hi}. Pick the last value, ${pv}, as the pivot (purple). Goal: smaller values to its left, bigger to its right.`);
    for (let j = lo; j < hi; j++) {
      k.compare();
      const sm = a[j] < pv;
      yield k.frame({ c: [j], p: hi, r: [lo, hi] }, 4, `Is ${a[j]} smaller than the pivot ${pv}? ${sm ? 'Yes, so move it to the "smaller" group on the left.' : 'No, so it stays in the "bigger" group.'}`);
      if (sm) { k.swap(i, j); yield k.frame({ s: [i, j], p: hi, r: [lo, hi] }, 4, `Swap it into position ${i}, the end of the smaller group.`); i++; }
    }
    k.swap(i, hi);
    k.done.add(i);
    yield k.frame({ s: [i, hi], r: [lo, hi] }, 5, `Put the pivot ${pv} right after the smaller values, at position ${i}. It is now in its final place (green). Next, sort each side.`);
    yield* qs(lo, i - 1);
    yield* qs(i + 1, hi);
  }
  yield* qs(0, a.length - 1);
}

function* heap(input: number[]): SortGen {
  const k = makeCtx(input), a = k.a, n = a.length;
  function* sift(i: number, m: number): SortGen {
    for (;;) {
      const l = 2 * i + 1, r = l + 1;
      if (l >= m) return;
      let g = i;
      k.compare(); if (a[l] > a[g]) g = l;
      if (r < m) { k.compare(); if (a[r] > a[g]) g = r; }
      yield k.frame({ c: [i, l, ...(r < m ? [r] : [])] }, 4, `Compare ${a[i]} with its children ${a[l]}${r < m ? ' and ' + a[r] : ''}. ${g === i ? `${a[i]} is the largest, so it stays.` : `Swap it with the larger child, ${a[g]}.`}`);
      if (g === i) return;
      k.swap(i, g);
      yield k.frame({ s: [i, g] }, 4, 'Swapped. Keep pushing it down.');
      i = g;
    }
  }
  yield k.frame({}, 0, 'Step 1: rearrange the array into a max-heap, where every parent is at least as big as its children. The biggest value ends up at the front.');
  for (let i = (n >> 1) - 1; i >= 0; i--) yield* sift(i, n);
  for (let e = n - 1; e > 0; e--) {
    k.swap(0, e);
    k.done.add(e);
    yield k.frame({ s: [0, e] }, 2, `The biggest remaining value (${a[e]}) is at the front. Swap it to position ${e}. It is now final (green).`);
    yield* sift(0, e);
  }
}

export const SORTS: Record<SortId, (a: number[]) => SortGen> = { bubble, selection, insertion, merge, quick, heap };
