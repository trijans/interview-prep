import { useRef, useState } from 'react';
import { useStepper } from '@/lib/playback';
import { DS_CODE, DS_INFO } from './info';
import { DsLayout, T, readValue, type Gen, type Hl } from './shared';

/** Immutable binary search tree node. */
export interface Node { v: number; l: Node | null; r: Node | null }
interface BstState { root: Node | null; hl: Hl }
const C = DS_CODE.bst;
type Trav = 'in' | 'pre' | 'post' | 'level';

export function insert(n: Node | null, v: number): Node {
  if (!n) return { v, l: null, r: null };
  if (v < n.v) return { ...n, l: insert(n.l, v) };
  if (v > n.v) return { ...n, r: insert(n.r, v) };
  return n;
}
export function remove(n: Node | null, v: number): Node | null {
  if (!n) return null;
  if (v < n.v) return { ...n, l: remove(n.l, v) };
  if (v > n.v) return { ...n, r: remove(n.r, v) };
  if (!n.l) return n.r;
  if (!n.r) return n.l;
  let s = n.r;
  while (s.l) s = s.l;
  return { v: s.v, l: n.l, r: remove(n.r, s.v) };
}
export const height = (n: Node | null): number => (n ? 1 + Math.max(height(n.l), height(n.r)) : 0);
export const count = (n: Node | null): number => (n ? 1 + count(n.l) + count(n.r) : 0);

function* insertGen(s: BstState, v: number): Gen<BstState> {
  if (count(s.root) >= 31) return yield { state: s, say: 'The tree is full for this demo.', hold: 0 };
  yield { state: { ...s, hl: {} }, code: C.ins, line: 1, say: `Insert ${v}. Start at the top (the root). At each node: smaller values go left, bigger values go right.` };
  let n = s.root, d = 0;
  while (n) {
    if (v === n.v) return yield { state: { ...s, hl: { [n.v]: 'cur' } }, say: `${v} is already in the tree. A BST usually holds each value once.`, hold: 0 };
    const left = v < n.v;
    yield { state: { ...s, hl: { [n.v]: 'cur' } }, line: left ? 3 : 4, say: `${v} is ${left ? 'smaller' : 'bigger'} than ${n.v}, so go **${left ? 'left' : 'right'}**.`, hold: 1.1 };
    n = left ? n.l : n.r;
    d++;
  }
  if (d > 5) return yield { state: { ...s, hl: {} }, say: `Inserting ${v} would go deeper than this canvas can show. Try another value. (Lopsided trees like this get slow, closer to O(n).)`, hold: 0 };
  yield { state: { root: insert(s.root, v), hl: { [v]: 'new' } }, line: 5, say: `Reached an empty spot, so **${v}** goes here as a new leaf. It took ${d} comparisons, about the height of the tree: **O(log n)** when the tree is balanced.`, hold: 0 };
}

function* searchGen(s: BstState, v: number): Gen<BstState> {
  yield { state: { ...s, hl: {} }, code: C.search, line: 1, say: `Search for ${v}, starting at the root.`, hold: 0.8 };
  let n = s.root, c = 0;
  while (n) {
    c++;
    yield { state: { ...s, hl: { [n.v]: 'cur' } }, line: 3, say: `Is ${n.v} the value we want (${v})?`, hold: 0.9 };
    if (v === n.v) return yield { state: { ...s, hl: { [v]: 'found' } }, line: 3, say: `Yes. Found **${v}** in ${c} steps. Each step rules out a whole side of the tree, which is why search is fast.`, hold: 0 };
    const left = v < n.v;
    yield { state: { ...s, hl: { [n.v]: 'cur' } }, line: left ? 4 : 5, say: `No. ${v} is ${left ? 'smaller' : 'bigger'} than ${n.v}, so it can only be in the **${left ? 'left' : 'right'}** part. We never look at the other side.`, hold: 1.1 };
    n = left ? n.l : n.r;
  }
  yield { state: { ...s, hl: {} }, line: 6, say: `Reached an empty spot, so **${v}** is not in the tree.`, hold: 0 };
}

function* deleteGen(s: BstState, v: number): Gen<BstState> {
  let n = s.root;
  yield { state: { ...s, hl: {} }, code: C.del, line: 1, hold: 0.3 };
  while (n && n.v !== v) {
    yield { state: { ...s, hl: { [n.v]: 'cur' } }, say: `Looking for ${v}: it is ${v < n.v ? 'smaller' : 'bigger'} than ${n.v}, so go ${v < n.v ? 'left' : 'right'}.`, hold: 0.9 };
    n = v < n.v ? n.l : n.r;
  }
  if (!n) return yield { state: { ...s, hl: {} }, say: `**${v}** is not in the tree.`, hold: 0 };
  if (n.l && n.r) {
    let x = n.r;
    while (x.l) x = x.l;
    yield { state: { ...s, hl: { [v]: 'del', [x.v]: 'found' } }, line: 5, say: `${v} has two children, so we can't just remove it. Find the smallest value in its right side, **${x.v}** (green). It is the next value in sorted order.`, hold: 1.6 };
    yield { state: { ...s, hl: { [v]: 'del', [x.v]: 'found' } }, line: 6, say: `Copy ${x.v} into ${v}'s place, then delete the old ${x.v} node, which has at most one child.`, hold: 1.3 };
  } else {
    yield { state: { ...s, hl: { [v]: 'del' } }, line: n.l || n.r ? 3 : 2, say: n.l || n.r ? `${v} has one child, so its parent links straight to that child.` : `${v} is a leaf (no children), so just remove it.`, hold: 1.3 };
  }
  yield { state: { root: remove(s.root, v), hl: {} }, say: `Deleted ${v}. Smaller-left, bigger-right still holds everywhere.`, hold: 0 };
}

const TRAV_NAME: Record<Trav, string> = { in: 'Inorder', pre: 'Preorder', post: 'Postorder', level: 'Level order (BFS)' };
const TRAV_WHY: Record<Trav, string> = {
  in: 'the left side first, then the node itself, then the right side. For a BST this lists the values in sorted order',
  pre: 'the node first, then its left side, then its right side. Handy for copying a tree',
  post: 'both sides first, then the node. Handy for deleting a tree',
  level: 'row by row from the top, using a queue',
};
function order(root: Node | null, t: Trav): number[] {
  const out: number[] = [];
  const rec = (n: Node | null) => {
    if (!n) return;
    if (t === 'pre') out.push(n.v);
    rec(n.l);
    if (t === 'in') out.push(n.v);
    rec(n.r);
    if (t === 'post') out.push(n.v);
  };
  if (t === 'level') { const q = root ? [root] : []; while (q.length) { const x = q.shift()!; out.push(x.v); if (x.l) q.push(x.l); if (x.r) q.push(x.r); } }
  else rec(root);
  return out;
}
function* traverseGen(s: BstState, t: Trav): Gen<BstState> {
  const line = { in: 3, pre: 2, post: 4, level: 4 }[t], seen: number[] = [];
  yield { state: { ...s, hl: {} }, code: C[t], line: 0, say: `${TRAV_NAME[t]} visits ${TRAV_WHY[t]}.`, hold: 1.4 };
  for (const v of order(s.root, t)) {
    seen.push(v);
    const hl: Hl = Object.fromEntries(seen.map((x) => [x, 'done']));
    hl[v] = 'cur';
    yield { state: { ...s, hl }, line, say: `Visit **${v}**. Order so far: \`[${seen.join(', ')}]\``, hold: 0.8 };
  }
  yield { state: { ...s, hl: Object.fromEntries(seen.map((x) => [x, 'done'])) }, say: `${TRAV_NAME[t]} done: \`[${seen.join(', ')}]\``, hold: 0 };
}

function randomTree(): Node | null {
  for (let tries = 0; tries < 50; tries++) {
    let r: Node | null = null;
    const used = new Set<number>();
    while (used.size < 12) { const v = Math.floor(Math.random() * 99) + 1; if (!used.has(v)) { used.add(v); r = insert(r, v); } }
    if (height(r) <= 6) return r;
  }
  return null;
}

export function BstViz() {
  const input = useRef<HTMLInputElement>(null);
  const [trav, setTrav] = useState<Trav>('in');
  const st = useStepper<BstState>({ root: [50, 30, 70, 20, 40, 60, 80, 35, 65].reduce<Node | null>(insert, null), hl: {} }, DS_INFO.bst.hint, C.search);
  const { root, hl } = st.state;
  const ord: [Node, number][] = [];
  (function f(n: Node | null, d: number) { if (!n) return; f(n.l, d + 1); ord.push([n, d]); f(n.r, d + 1); })(root, 0);
  const pos = new Map<Node, { x: number; y: number }>();
  ord.forEach(([n, d], k) => pos.set(n, { x: ((k + 1) * 760) / (ord.length + 1), y: 30 + d * 60 }));
  const v = () => readValue(input.current);
  return (
    <DsLayout id="bst" frame={st.frame} viewBox="0 0 760 360" controls={<>
      <input ref={input} type="number" placeholder="value" aria-label="Value" />
      <button className="btn pri" onClick={() => { const x = v(); st.play((s) => insertGen(s, x)); }}>insert</button>
      <button className="btn" onClick={() => { const x = v(); st.play((s) => searchGen(s, x)); }}>search</button>
      <button className="btn" onClick={() => { const x = v(); st.play((s) => deleteGen(s, x)); }}>delete</button>
      <select value={trav} onChange={(e) => setTrav(e.target.value as Trav)} aria-label="Traversal">
        {(Object.keys(TRAV_NAME) as Trav[]).map((t) => <option key={t} value={t}>{TRAV_NAME[t]}</option>)}
      </select>
      <button className="btn" onClick={() => st.play((s) => traverseGen(s, trav))}>traverse</button>
      <button className="btn" onClick={() => st.show({ root: randomTree(), hl: {} }, 'A random tree with 12 nodes.')}>random</button>
    </>}>
      {ord.map(([n]) => [n.l, n.r].map((c) => c && <line key={`${n.v}-${c.v}`} x1={pos.get(n)!.x} y1={pos.get(n)!.y} x2={pos.get(c)!.x} y2={pos.get(c)!.y} className="edge" />))}
      {ord.map(([n]) => { const p = pos.get(n)!; return <g key={n.v}><circle cx={p.x} cy={p.y} r={18} className={'n ' + (hl[n.v] ?? '')} /><T x={p.x} y={p.y} cls="ts">{n.v}</T></g>; })}
      {!root && <T x={380} y={150} cls="lbl">empty tree</T>}
    </DsLayout>
  );
}
