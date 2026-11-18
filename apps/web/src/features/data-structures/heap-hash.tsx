import { useRef } from 'react';
import { useStepper, rnd } from '@/lib/playback';
import { DS_CODE, DS_INFO } from './info';
import { DsLayout, T, Arrow, readValue, type Gen, type Hl } from './shared';

/* ================= Min-heap ================= */
interface HeapState { a: number[]; hl: Hl }
const HC = DS_CODE.heap;

function* siftDown(a: number[], i: number, mode: 'pop' | 'heapify'): Generator<{ state: HeapState; line: number; say: string; hold: number }, number[], unknown> {
  const n = a.length;
  const L = (k: number) => (mode === 'pop' ? k : 2);
  for (;;) {
    const l = 2 * i + 1, r = l + 1;
    let m = i;
    if (l < n && a[l] < a[m]) m = l;
    if (r < n && a[r] < a[m]) m = r;
    const hl: Hl = { [i]: 'cur' };
    if (l < n) hl[l] = 'cmp';
    if (r < n) hl[r] = 'cmp';
    yield { state: { a, hl }, line: L(5), say: l < n ? `Compare ${a[i]} with its children (${a[l]}${r < n ? ' and ' + a[r] : ''}). The smallest of them should sit on top.` : `${a[i]} has no children.`, hold: 1.1 };
    if (m === i) {
      yield { state: { a, hl: {} }, line: L(6), say: l < n ? `${a[i]} is already the smallest, so it stays. Order is restored here.` : `${a[i]} stays where it is.`, hold: 0.7 };
      return a;
    }
    a = [...a];
    [a[i], a[m]] = [a[m], a[i]];
    yield { state: { a, hl: { [m]: 'new', [i]: 'new' } }, line: L(7), say: `Swap with the smaller child (${a[i]}). ${a[m]} moves one level down.`, hold: 1 };
    i = m;
  }
}

function* heapPush(s: HeapState, v: number): Gen<HeapState> {
  if (s.a.length >= 15) return yield { state: s, say: 'This demo holds 15 items.', hold: 0 };
  let a = [...s.a, v], i = a.length - 1;
  yield { state: { a, hl: { [i]: 'new' } }, code: HC.push, line: 1, say: `Add ${v} at the end of the array, which is the next free spot in the bottom row of the tree. Now move it up until its parent is smaller.`, hold: 1.3 };
  while (i > 0) {
    const p = (i - 1) >> 1;
    yield { state: { a, hl: { [i]: 'cur', [p]: 'cmp' } }, line: 4, say: `Its parent is at index (${i} − 1) / 2 = ${p}, holding ${a[p]}. Is the parent bigger than ${a[i]}?`, hold: 1.1 };
    if (a[p] <= a[i]) { yield { state: { a, hl: {} }, line: 5, say: `No (${a[p]} ≤ ${a[i]}), so every parent is smaller than its children again. Stop.`, hold: 0.7 }; break; }
    a = [...a];
    [a[p], a[i]] = [a[i], a[p]];
    yield { state: { a, hl: { [p]: 'new' } }, line: 6, say: `Yes, so swap them. ${a[p]} moves up one level.`, hold: 1 };
    i = p;
  }
  yield { state: { a, hl: { [i]: 'found' } }, say: `${v} is in place. It moved up at most the height of the tree: **O(log n)**. The smallest value is always at the top (index 0).`, hold: 0 };
}

function* heapPop(s: HeapState): Gen<HeapState> {
  if (!s.a.length) return yield { state: s, say: 'The heap is empty.', hold: 0 };
  const m = s.a[0];
  yield { state: { a: s.a, hl: { 0: 'del' } }, code: HC.pop, line: 1, say: `The smallest value is always at the top: **${m}**. Take it out.`, hold: 1.3 };
  let a = s.a.slice(0, -1);
  const last = s.a[s.a.length - 1];
  if (a.length) {
    a[0] = last;
    yield { state: { a, hl: { 0: 'new' } }, line: 2, say: `Fill the hole at the top with the last item, ${last}. That probably breaks the order, so move it down.`, hold: 1.3 };
    a = yield* siftDown(a, 0, 'pop');
  }
  yield { state: { a, hl: {} }, line: 8, say: `Done: removed **${m}** in **O(log n)**.`, hold: 0 };
}

function* heapify(): Gen<HeapState> {
  let a = Array.from({ length: 12 }, () => rnd(1, 99));
  yield { state: { a, hl: {} }, code: HC.heapify, line: 0, say: 'A random array. To turn it into a heap, fix each parent from the bottom up by moving it down. The bottom row has no children, so it is already fine.', hold: 1.6 };
  for (let i = (a.length >> 1) - 1; i >= 0; i--) {
    yield { state: { a, hl: { [i]: 'cur' } }, line: 1, say: `Fix the parent at index ${i} (${a[i]}).`, hold: 0.7 };
    a = yield* siftDown(a, i, 'heapify');
  }
  yield { state: { a, hl: {} }, say: 'Heap built: every parent is ≤ its children. This takes only **O(n)** overall.', hold: 0 };
}

const hPos = (i: number) => { const lvl = Math.floor(Math.log2(i + 1)), p = i - (2 ** lvl - 1), cnt = 2 ** lvl; return { x: ((p + 0.5) * 760) / cnt, y: 30 + lvl * 56 }; };

export function HeapViz() {
  const input = useRef<HTMLInputElement>(null);
  const st = useStepper<HeapState>({ a: [3, 9, 5, 14, 10, 8, 7], hl: {} }, DS_INFO.heap.hint, HC.push);
  const { a, hl } = st.state;
  const cw = 46, x0 = (760 - a.length * cw) / 2;
  return (
    <DsLayout id="heap" frame={st.frame} viewBox="0 0 760 330" controls={<>
      <input ref={input} type="number" placeholder="value" aria-label="Value" />
      <button className="btn pri" onClick={() => { const v = readValue(input.current); st.play((s) => heapPush(s, v)); }}>insert</button>
      <button className="btn" onClick={() => st.play(heapPop)}>extract-min</button>
      <button className="btn" onClick={() => st.play(heapify)}>build heap (random)</button>
    </>}>
      {a.map((_, i) => { if (!i) return null; const p = hPos(i), q = hPos((i - 1) >> 1); return <line key={'e' + i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} className="edge" />; })}
      {a.map((v, i) => { const p = hPos(i); return <g key={'n' + i}><circle cx={p.x} cy={p.y} r={18} className={'n ' + (hl[i] ?? '')} /><T x={p.x} y={p.y} cls="ts">{v}</T></g>; })}
      <T x={380} y={236} cls="lbl">underlying array</T>
      {a.map((v, i) => <g key={'a' + i}>
        <rect x={x0 + i * cw} y={252} width={cw - 4} height={36} rx={5} className={'n ' + (hl[i] ?? '')} />
        <T x={x0 + i * cw + (cw - 4) / 2} y={270} cls="ts">{v}</T>
        <T x={x0 + i * cw + (cw - 4) / 2} y={304} cls="lbl">{i}</T>
      </g>)}
      {!a.length && <T x={380} y={120} cls="lbl">empty heap</T>}
    </DsLayout>
  );
}

/* ================= Hash table ================= */
interface HashState { m: number; b: string[][]; hb: number; item: [number, number] | null; cls: string }
const XC = DS_CODE.hash;
const hash = (k: string, m: number) => { let x = 0; for (const c of k) x = (x * 31 + c.charCodeAt(0)) % m; return x; };
const fill = (keys: string[], m: number) => { const b: string[][] = Array.from({ length: m }, () => []); keys.forEach((k) => b[hash(k, m)].push(k)); return b; };
const POOL = ['date', 'fig', 'lemon', 'lime', 'peach', 'pear', 'plum', 'melon', 'berry', 'olive', 'guava', 'papaya'];
const H = (s: HashState, p: Partial<HashState>): HashState => ({ ...s, hb: -1, item: null, cls: '', ...p });

/** Looks a key up in its bucket, narrating each comparison. Returns the position or -1. */
function* walk(s: HashState, k: string, code: string[], cmpLine: number): Generator<{ state: HashState; code?: string[]; line: number; say: string; hold: number }, [number, number], unknown> {
  const i = hash(k, s.m);
  yield { state: H(s, { hb: i }), code, line: 1, say: `Turn the key into a bucket number: hash("${k}") mod ${s.m} = **${i}**. The same key always gives the same number, so we only ever look in bucket ${i}.`, hold: 1.4 };
  for (let j = 0; j < s.b[i].length; j++) {
    yield { state: H(s, { hb: i, item: [i, j], cls: 'cmp' }), line: cmpLine, say: `Bucket ${i} holds a short chain. Is "${s.b[i][j]}" the key "${k}"?`, hold: 1 };
    if (s.b[i][j] === k) return [i, j];
  }
  return [i, -1];
}
function* put(s: HashState, k: string): Gen<HashState> {
  const [i, j] = yield* walk(s, k, XC.put, 3);
  if (j >= 0) return yield { state: H(s, { hb: i, item: [i, j], cls: 'found' }), say: `"${k}" is already here, so its value would just be updated.`, hold: 0 };
  const b = s.b.map((c, x) => (x === i ? [...c, k] : c)), n = b.flat().length, lf = n / s.m;
  yield { state: H({ ...s, b }, { hb: i, item: [i, b[i].length - 1], cls: 'new' }), line: 4, say: `Not there, so add "${k}" to bucket ${i}. Load factor = items ÷ buckets = ${n}/${s.m} = **${lf.toFixed(2)}**.${lf > 0.75 ? ' That is above 0.75, so chains are getting long: time to resize.' : ''}`, hold: 0 };
}
function* get(s: HashState, k: string): Gen<HashState> {
  const [i, j] = yield* walk(s, k, XC.get, 3);
  if (j >= 0) yield { state: H(s, { hb: i, item: [i, j], cls: 'found' }), line: 3, say: `Found "${k}" after checking only bucket ${i}: **O(1)** on average.`, hold: 0 };
  else yield { state: H(s, { hb: i }), line: 4, say: `"${k}" is not in bucket ${i}, so it is not in the table at all.`, hold: 0 };
}
function* del(s: HashState, k: string): Gen<HashState> {
  const [i, j] = yield* walk(s, k, XC.del, 2);
  if (j < 0) return yield { state: H(s, { hb: i }), say: `"${k}" is not in the table.`, hold: 0 };
  yield { state: H(s, { hb: i, item: [i, j], cls: 'del' }), line: 3, say: `Found it. Unlink it from bucket ${i}'s chain.`, hold: 1.1 };
  yield { state: H({ ...s, b: s.b.map((c, x) => (x === i ? c.filter((_, y) => y !== j) : c)) }, {}), say: `Removed "${k}".`, hold: 0 };
}
function* resize(s: HashState): Gen<HashState> {
  const keys = s.b.flat(), m = s.m === 7 ? 14 : 7;
  yield { state: H(s, {}), code: XC.resize, line: 1, say: `Change the number of buckets to ${m}. Each key's bucket depends on the size, so every key must be placed again.`, hold: 1.3 };
  const b: string[][] = Array.from({ length: m }, () => []);
  for (const k of keys) { const x = hash(k, m); b[x] = [...b[x], k]; yield { state: H({ m, b: b.map((c) => [...c]), hb: x, item: null, cls: '' }, { hb: x }), line: 3, say: `Put "${k}" into bucket ${x}.`, hold: 0.45 }; }
  yield { state: H({ m, b, hb: -1, item: null, cls: '' }, {}), say: `Done: ${keys.length} keys over ${m} buckets, load factor ${(keys.length / m).toFixed(2)}. Resizing touches every key, **O(n)**, but it happens rarely. Click again to switch back.`, hold: 0 };
}

export function HashViz() {
  const input = useRef<HTMLInputElement>(null);
  const st = useStepper<HashState>({ m: 7, b: fill(['apple', 'banana', 'cherry', 'grape', 'kiwi', 'mango'], 7), hb: -1, item: null, cls: '' }, DS_INFO.hash.hint, XC.put);
  const { m, b, hb, item, cls } = st.state;
  const key = () => { const el = input.current!; let k = el.value.trim().toLowerCase(); el.value = ''; return k || POOL[rnd(0, POOL.length - 1)]; };
  return (
    <DsLayout id="hash" frame={st.frame} viewBox={`0 0 760 ${20 + m * 44}`} controls={<>
      <input ref={input} type="text" placeholder="key (e.g. apple)" style={{ width: 150 }} aria-label="Key" />
      <button className="btn pri" onClick={() => { const k = key(); st.play((s) => put(s, k)); }}>put</button>
      <button className="btn" onClick={() => { const k = key(); st.play((s) => get(s, k)); }}>get</button>
      <button className="btn" onClick={() => { const k = key(); st.play((s) => del(s, k)); }}>delete</button>
      <button className="btn" onClick={() => st.play(resize)}>resize ×2</button>
    </>}>
      {b.map((ch, i) => { const y = 10 + i * 44; return <g key={i}>
        <rect x={14} y={y} width={48} height={34} rx={5} className={'n idx ' + (i === hb ? 'cur' : '')} />
        <T x={38} y={y + 17} cls="ts">{i}</T>
        {!ch.length && <T x={100} y={y + 17} cls="lbl">∅</T>}
        {ch.slice(0, 5).map((k, j) => { const x = 100 + j * 125; return <g key={k}>
          <Arrow x1={j ? x - 23 : 64} y1={y + 17} x2={x - 2} y2={y + 17} />
          <rect x={x} y={y} width={100} height={34} rx={5} className={'n ' + (item && item[0] === i && item[1] === j ? cls : '')} />
          <T x={x + 50} y={y + 17} cls="ts">{k.length > 11 ? k.slice(0, 10) + '…' : k}</T>
        </g>; })}
        {ch.length > 5 && <T x={735} y={y + 17} cls="lbl">+{ch.length - 5}</T>}
      </g>; })}
    </DsLayout>
  );
}
