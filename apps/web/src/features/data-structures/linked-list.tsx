import { useRef } from 'react';
import { useStepper } from '@/lib/playback';
import { DS_CODE, DS_INFO } from './info';
import { DsLayout, T, Arrow, readValue, type Gen, type Hl } from './shared';

interface LLState { items: number[]; hl: Hl; ptr: Record<number, string>; rev: boolean[] | null }
const C = DS_CODE.ll;
const S = (items: number[], hl: Hl = {}, ptr: Record<number, string> = {}, rev: boolean[] | null = null): LLState => ({ items, hl, ptr, rev });

function* insertHead(s: LLState, v: number): Gen<LLState> {
  if (s.items.length >= 8) return yield { state: s, say: 'This demo holds 8 nodes.', hold: 0 };
  yield { state: S(s.items), code: C.head, line: 1, say: `Create a new node holding ${v}. A node is a value plus an arrow (next) to the following node.` };
  const items = [v, ...s.items];
  yield { state: S(items, { 0: 'new' }), line: 2, say: "Point the new node's arrow at the old first node." };
  yield { state: S(items, { 0: 'new' }), line: 3, say: 'Make **head** point to the new node. Nothing else had to move, so this is **O(1)**.', hold: 0 };
}

function* insertTail(s: LLState, v: number): Gen<LLState> {
  if (s.items.length >= 8) return yield { state: s, say: 'This demo holds 8 nodes.', hold: 0 };
  yield { state: S(s.items), code: C.tail, line: 1, say: 'To add at the end, we first have to find the end. Start at head.', hold: 0.8 };
  for (let i = 0; i < s.items.length; i++) {
    const last = i === s.items.length - 1;
    yield { state: S(s.items, { [i]: 'cur' }, { [i]: 'curr' }), line: last ? 2 : 3, say: last ? `At ${s.items[i]}. Its arrow points to null, so this is the last node.` : `At ${s.items[i]}. It has a next node, so follow the arrow.`, hold: 0.9 };
  }
  const items = [...s.items, v];
  yield { state: S(items, { [items.length - 1]: 'new' }), line: 4, say: `Attach ${v} after it. We had to walk the whole list first, so this is **O(n)**, unless we also keep a pointer to the tail.`, hold: 0 };
}

function* search(s: LLState, v: number): Gen<LLState> {
  yield { state: S(s.items), code: C.find, line: 1, say: `Search for ${v}. A list has no index, so we can only start at head and follow the arrows.`, hold: 0.8 };
  for (let i = 0; i < s.items.length; i++) {
    yield { state: S(s.items, { [i]: 'cur' }, { [i]: 'curr' }), line: 3, say: `Is this node's value (${s.items[i]}) equal to ${v}?` };
    if (s.items[i] === v) return yield { state: S(s.items, { [i]: 'found' }), line: 3, say: `Yes. Found **${v}** at position ${i}. In the worst case we check every node: **O(n)**.`, hold: 0 };
    yield { state: S(s.items, { [i]: 'cur' }, { [i]: 'curr' }), line: 4, say: 'No. Follow the arrow to the next node.', hold: 0.6 };
  }
  yield { state: S(s.items), line: 5, say: `Reached the end (null) without finding **${v}**.`, hold: 0 };
}

function* remove(s: LLState, v: number): Gen<LLState> {
  yield { state: S(s.items), code: C.del, line: 1, say: `Delete ${v}. We walk with two pointers: **curr** (the node we're checking) and **prev** (the one before it).` };
  for (let i = 0; i < s.items.length; i++) {
    const ptr = { [i]: 'curr', [i - 1]: 'prev' };
    yield { state: S(s.items, { [i]: 'cur' }, ptr), line: 3, say: `Is ${s.items[i]} equal to ${v}?` };
    if (s.items[i] === v) {
      yield { state: S(s.items, { [i]: 'del' }, ptr), line: 4, say: i ? `Yes. Make ${s.items[i - 1]}'s arrow skip over it and point to ${i + 1 < s.items.length ? s.items[i + 1] : 'null'}. Nothing points to ${v} any more, so it is gone.` : 'Yes, and it is the first node, so simply move **head** to the next node.', hold: 1.4 };
      return yield { state: S(s.items.filter((_, j) => j !== i)), line: 5, hold: 0 };
    }
    yield { state: S(s.items, { [i]: 'cur' }, ptr), line: 6, say: 'No. Move both pointers one step forward.', hold: 0.6 };
  }
  yield { state: S(s.items), say: `**${v}** is not in the list.`, hold: 0 };
}

function* reverse(s: LLState): Gen<LLState> {
  const n = s.items.length;
  if (n < 2) return;
  const it = s.items, rev = Array(n).fill(false);
  yield { state: S(it, {}, {}, [...rev]), code: C.rev, line: 1, say: 'We walk the list once and flip every arrow so it points backwards. **prev** starts at null and **curr** at the first node.', hold: 1.2 };
  for (let i = 0; i < n; i++) {
    const ptr = { [i - 1]: 'prev', [i]: 'curr', [i + 1]: 'next' };
    yield { state: S(it, { [i]: 'cur' }, ptr, [...rev]), line: 3, say: `Save the node after ${it[i]} (${i + 1 < n ? it[i + 1] : 'null'}) as **next**, so we don't lose the rest of the list when we flip the arrow.`, hold: 1.1 };
    rev[i] = true;
    yield { state: S(it, { [i]: 'new' }, ptr, [...rev]), line: 4, say: `Flip the arrow: ${it[i]} now points back to ${i ? it[i - 1] : 'null'} (blue).`, hold: 1.1 };
    yield { state: S(it, {}, { [i]: 'prev', [i + 1]: 'curr' }, [...rev]), line: 6, say: `Step forward: **prev** = ${it[i]}, **curr** = ${i + 1 < n ? it[i + 1] : 'null'}.`, hold: 0.9 };
  }
  yield { state: S([...it].reverse()), line: 7, say: '**curr** is null, so every arrow is flipped. Set **head** = prev (the old last node). One pass, no extra list: **O(n)** time, **O(1)** space.', hold: 0 };
}

export function LinkedListViz() {
  const input = useRef<HTMLInputElement>(null);
  const st = useStepper<LLState>(S([4, 8, 15, 16]), DS_INFO.ll.hint, C.rev);
  const { items, hl, ptr, rev } = st.state;
  const w = 62, hh = 40, step = 96, x0 = 80, y = 80, n = items.length, X = (i: number) => x0 + i * step;
  const v = () => readValue(input.current);
  const labels: Record<number, string[]> = {};
  for (const [k, lab] of Object.entries(ptr)) { const i = +k; if (i >= 0 && i < n) (labels[i] ||= []).push(lab); }
  return (
    <DsLayout id="ll" frame={st.frame} viewBox="0 0 900 220" controls={<>
      <input ref={input} type="number" placeholder="value" aria-label="Value" />
      <button className="btn pri" onClick={() => { const x = v(); st.play((s) => insertHead(s, x)); }}>insert head</button>
      <button className="btn" onClick={() => { const x = v(); st.play((s) => insertTail(s, x)); }}>insert tail</button>
      <button className="btn" onClick={() => { const x = v(); st.play((s) => remove(s, x)); }}>delete</button>
      <button className="btn" onClick={() => { const x = v(); st.play((s) => search(s, x)); }}>search</button>
      <button className="btn" onClick={() => st.play(reverse)}>reverse ↺</button>
    </>}>
      {n > 0 && <T x={X(0) + w / 2} y={y - 22} cls="lblA">head</T>}
      {items.map((val, i) => (
        <g key={i}>
          <rect x={X(i)} y={y} width={w} height={hh} rx={6} className={'n ' + (hl[i] ?? '')} />
          <T x={X(i) + w / 2} y={y + hh / 2}>{val}</T>
          {rev && rev[i]
            ? (i > 0 ? <Arrow rev x1={X(i)} y1={y + hh / 2 + 10} x2={X(i - 1) + w + 2} y2={y + hh / 2 + 10} /> : <Arrow rev x1={X(0)} y1={y + hh / 2 + 10} x2={X(0) - 34} y2={y + hh / 2 + 10} />)
            : (i < n - 1 ? <Arrow x1={X(i) + w} y1={y + hh / 2 - 6} x2={X(i + 1) - 2} y2={y + hh / 2 - 6} /> : <Arrow x1={X(i) + w} y1={y + hh / 2 - 6} x2={X(i) + w + 30} y2={y + hh / 2 - 6} />)}
        </g>
      ))}
      {n > 0 && !(rev && rev[n - 1]) && <T x={X(n - 1) + w + 52} y={y + hh / 2 - 6} cls="lbl">null</T>}
      {rev && rev[0] && <T x={X(0) - 56} y={y + hh / 2 + 10} cls="lbl">null</T>}
      {!n && <T x={450} y={100} cls="lbl">empty list (head → null)</T>}
      {Object.entries(labels).map(([i, l]) => <T key={i} x={X(+i) + w / 2} y={y + hh + 26} cls="lblA">{l.join(', ')}</T>)}
    </DsLayout>
  );
}
