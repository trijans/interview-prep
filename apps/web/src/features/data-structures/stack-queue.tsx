import { useRef } from 'react';
import { useStepper } from '@/lib/playback';
import { DS_CODE, DS_INFO } from './info';
import { DsLayout, T, Arrow, readValue, type Gen, type Hl } from './shared';

/* ================= Stack ================= */
interface StackState { items: number[]; hl: Hl }
const SC = DS_CODE.stack;

function* stackPush(s: StackState, v: number): Gen<StackState> {
  if (s.items.length >= 9) return yield { state: s, code: SC.push, line: 1, say: 'The stack is full (this demo holds 9 items), so **push** fails with an "overflow" error.', hold: 0 };
  yield { state: s, code: SC.push, line: 1, say: `**push(${v})**: first check there is room. There is.`, hold: 0.8 };
  const items = [...s.items, v];
  yield { state: { items, hl: { [items.length - 1]: 'new' } }, line: 2, say: `Put ${v} on top of the pile, like adding a plate to a stack of plates.` };
  yield { state: { items, hl: { [items.length - 1]: 'new' } }, line: 3, say: 'Done. Only the top was touched, so push takes the same time however big the stack is: **O(1)**.', hold: 0 };
}
function* stackPop(s: StackState): Gen<StackState> {
  if (!s.items.length) return yield { state: s, code: SC.pop, line: 1, say: 'The stack is empty, so there is nothing to remove ("underflow").', hold: 0 };
  const i = s.items.length - 1, top = s.items[i];
  yield { state: { ...s, hl: { [i]: 'del' } }, code: SC.pop, line: 2, say: `**pop()**: look at the top item, **${top}**. It was the last one added, so it is the first one out (Last In, First Out).`, hold: 1.2 };
  const items = s.items.slice(0, -1);
  yield { state: { items, hl: {} }, line: 3, say: `Remove it. ${items.length ? `The new top is ${items[items.length - 1]}.` : 'The stack is now empty.'}`, hold: 0.8 };
  yield { state: { items, hl: {} }, line: 4, say: `Return **${top}**. This is O(1).`, hold: 0 };
}
function* stackPeek(s: StackState): Gen<StackState> {
  if (!s.items.length) return yield { state: s, code: SC.peek, line: 1, say: 'The stack is empty.', hold: 0 };
  yield { state: { ...s, hl: { [s.items.length - 1]: 'cur' } }, code: SC.peek, line: 1, say: `**peek()** looks at the top item, **${s.items[s.items.length - 1]}**, without removing it.`, hold: 0 };
}

export function StackViz() {
  const input = useRef<HTMLInputElement>(null);
  const st = useStepper<StackState>({ items: [12, 5, 30], hl: {} }, DS_INFO.stack.hint, SC.push);
  const { items, hl } = st.state;
  const W = 360, base = 380, bw = 140, bh = 34, x = (W - bw) / 2;
  return (
    <DsLayout id="stack" frame={st.frame} viewBox="0 0 360 400" controls={<>
      <input ref={input} type="number" placeholder="value" aria-label="Value" />
      <button className="btn pri" onClick={() => { const v = readValue(input.current); st.play((s) => stackPush(s, v)); }}>push</button>
      <button className="btn" onClick={() => st.play(stackPop)}>pop</button>
      <button className="btn" onClick={() => st.play(stackPeek)}>peek</button>
    </>}>
      <path d={`M${x - 10} 30 V${base} H${x + bw + 10} V30`} className="wall" />
      {items.map((v, i) => {
        const y = base - 6 - (i + 1) * (bh + 4);
        return <g key={i}>
          <rect x={x} y={y} width={bw} height={bh} rx={6} className={'n ' + (hl[i] ?? '')} />
          <T x={x + bw / 2} y={y + bh / 2}>{v}</T>
          {i === items.length - 1 && <T x={x + bw + 44} y={y + bh / 2} cls="lblA">← top</T>}
        </g>;
      })}
      {!items.length && <T x={W / 2} y={base - 30} cls="lbl">empty</T>}
    </DsLayout>
  );
}

/* ================= Queue ================= */
interface QueueState { items: number[]; hl: Hl }
const QC = DS_CODE.queue;

function* enqueue(s: QueueState, v: number): Gen<QueueState> {
  if (s.items.length >= 9) return yield { state: s, say: 'The queue is full (this demo holds 9 items).', hold: 0 };
  const items = [...s.items, v];
  yield { state: { items, hl: { [items.length - 1]: 'new' } }, code: QC.enq, line: 1, say: `**enqueue(${v})**: ${v} joins the back of the line, like a person joining a queue at a shop. O(1).`, hold: 0 };
}
function* dequeue(s: QueueState): Gen<QueueState> {
  if (!s.items.length) return yield { state: s, code: QC.deq, line: 1, say: 'The queue is empty, so there is nobody to serve.', hold: 0 };
  yield { state: { ...s, hl: { 0: 'del' } }, code: QC.deq, line: 2, say: `**dequeue()**: the item at the front, **${s.items[0]}**, has waited the longest, so it leaves first (First In, First Out).`, hold: 1.2 };
  const items = s.items.slice(1);
  yield { state: { items, hl: {} }, line: 3, say: `Removed ${s.items[0]}. Everyone else moves up one place.${items.length ? ` ${items[0]} is now at the front.` : ''}`, hold: 0.8 };
  yield { state: { items, hl: {} }, line: 4, hold: 0 };
}
function* front(s: QueueState): Gen<QueueState> {
  if (!s.items.length) return yield { state: s, code: QC.front, line: 1, say: 'The queue is empty.', hold: 0 };
  yield { state: { ...s, hl: { 0: 'cur' } }, code: QC.front, line: 1, say: `**front()** = **${s.items[0]}**. It looks without removing anything.`, hold: 0 };
}

export function QueueViz() {
  const input = useRef<HTMLInputElement>(null);
  const st = useStepper<QueueState>({ items: [8, 3, 17], hl: {} }, DS_INFO.queue.hint, QC.enq);
  const { items, hl } = st.state;
  const bw = 64, x0 = 40, y = 70;
  return (
    <DsLayout id="queue" frame={st.frame} viewBox="0 0 760 200" controls={<>
      <input ref={input} type="number" placeholder="value" aria-label="Value" />
      <button className="btn pri" onClick={() => { const v = readValue(input.current); st.play((s) => enqueue(s, v)); }}>enqueue</button>
      <button className="btn" onClick={() => st.play(dequeue)}>dequeue</button>
      <button className="btn" onClick={() => st.play(front)}>front</button>
    </>}>
      {items.map((v, i) => {
        const x = x0 + i * (bw + 10);
        return <g key={i}>
          <rect x={x} y={y} width={bw} height={44} rx={6} className={'n ' + (hl[i] ?? '')} />
          <T x={x + bw / 2} y={y + 22}>{v}</T>
          {i === 0 && <T x={x + bw / 2} y={y - 18} cls="lblA">front</T>}
          {i === items.length - 1 && <T x={x + bw / 2} y={y + 64} cls="lblA">rear</T>}
        </g>;
      })}
      {!items.length && <T x={380} y={92} cls="lbl">empty</T>}
      <Arrow x1={20} y1={170} x2={120} y2={170} />
      <T x={70} y={186} cls="lbl">dequeue here</T>
    </DsLayout>
  );
}
