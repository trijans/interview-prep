import { useRef, useState } from 'react';
import { rnd, useStepper, type Frame } from '@/lib/playback';
import { Explain, InfoCard, PlayerBar } from '@/components/ui';
import { BS_CODE } from './info';

interface BsState { a: number[]; lo: number; hi: number; mid: number; found: number }
type Mode = 'exact' | 'lower';
const N = 16;

function newArray(): number[] {
  const s = new Set<number>();
  while (s.size < N) s.add(rnd(1, 99));
  return [...s].sort((x, y) => x - y);
}

function* exact(a: number[], t: number): Generator<Frame<BsState>> {
  const F = (lo: number, hi: number, mid = -1, found = -1): BsState => ({ a, lo, hi, mid, found });
  let lo = 0, hi = a.length - 1, steps = 0;
  yield { state: F(lo, hi), line: 0, say: `Find **${t}**. The numbers are sorted, so we can look in the middle and throw away half of them each time. **lo** and **hi** mark the part we still need to search.`, hold: 1.4 };
  while (lo <= hi) {
    steps++;
    const mid = (lo + hi) >> 1;
    yield { state: F(lo, hi, mid), line: 2, say: `Step ${steps}: the middle of positions ${lo}–${hi} is position ${mid}, which holds **${a[mid]}**.`, hold: 1.1 };
    if (a[mid] === t) return yield { state: F(lo, hi, -1, mid), line: 3, hold: 0, say: `That is the target. **Found it in ${steps} steps.** Checking one by one could take up to ${N}. With a million numbers, binary search needs only about 20 steps.` };
    const lt = a[mid] < t;
    yield { state: F(lo, hi, mid), line: lt ? 4 : 5, hold: 1.4, say: lt ? `${a[mid]} is smaller than ${t}, so the target can only be to the **right**. Ignore positions ${lo}–${mid}: lo = ${mid + 1}.` : `${a[mid]} is bigger than ${t}, so the target can only be to the **left**. Ignore positions ${mid}–${hi}: hi = ${mid - 1}.` };
    if (lt) lo = mid + 1; else hi = mid - 1;
  }
  yield { state: F(-1, -1), line: 6, hold: 0, say: `lo (${lo}) has passed hi (${hi}), so there is nothing left to search: **${t} is not in the list**. If you added it, it would go at position ${lo}.` };
}

function* lowerBound(a: number[], t: number): Generator<Frame<BsState>> {
  const F = (lo: number, hi: number, mid = -1, found = -1): BsState => ({ a, lo, hi, mid, found });
  let lo = 0, hi = a.length, steps = 0;
  yield { state: F(lo, hi - 1), line: 0, say: `Find the first position whose value is **at least ${t}**. The answer could be anywhere from 0 up to ${hi} (just past the end).`, hold: 1.4 };
  while (lo < hi) {
    steps++;
    const mid = (lo + hi) >> 1;
    yield { state: F(lo, hi - 1, mid), line: 2, say: `Step ${steps}: the middle position is ${mid}, holding ${a[mid]}.`, hold: 1.1 };
    const lt = a[mid] < t;
    yield { state: F(lo, hi - 1, mid), line: lt ? 3 : 4, hold: 1.3, say: lt ? `${a[mid]} is smaller than ${t}, so the answer is further right: lo = ${mid + 1}.` : `${a[mid]} is at least ${t}, so position ${mid} could be the answer, but there might be an earlier one: hi = ${mid}.` };
    if (lt) lo = mid + 1; else hi = mid;
  }
  yield { state: F(-1, -1, -1, lo < a.length ? lo : -1), line: 5, hold: 0, say: lo < a.length ? `lo and hi met at position **${lo}** (value ${a[lo]}): the first value that is at least ${t}. The same idea solves "find the smallest X that works" problems.` : `Every value is smaller than ${t}, so the answer is ${lo}, just past the end.` };
}

export function BinarySearchViz() {
  const input = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>('exact');
  const st = useStepper<BsState>({ a: newArray(), lo: -1, hi: -1, mid: -1, found: -1 }, 'Enter a number (or leave it empty for a random one) and press **Search**. Each step cuts the search space in half.', BS_CODE.exact);
  const { a, lo, hi, mid, found } = st.state;
  const search = () => {
    let t = parseInt(input.current!.value, 10);
    if (isNaN(t)) { t = Math.random() < 0.6 ? a[rnd(0, N - 1)] : rnd(1, 99); input.current!.value = String(t); }
    st.play(() => (mode === 'exact' ? exact(a, t) : lowerBound(a, t)));
  };
  const cw = 44, x0 = (760 - N * cw) / 2, y = 50;
  const labels: Record<number, string[]> = {};
  if (lo >= 0) { (labels[lo] ||= []).push('lo'); if (hi >= 0 && hi < N) (labels[hi] ||= []).push('hi'); if (mid >= 0) (labels[mid] ||= []).push('mid'); }
  return (
    <div className="viz-layout">
      <div className="card">
        <div className="controls">
          <input ref={input} type="number" placeholder="target" aria-label="Target" />
          <select value={mode} aria-label="Mode" onChange={(e) => { const m = e.target.value as Mode; setMode(m); st.show(st.current(), undefined, BS_CODE[m], -1); }}>
            <option value="exact">Exact match</option><option value="lower">Lower bound (first ≥ target)</option>
          </select>
          <button className="btn pri" onClick={search}>Search</button>
          <button className="btn" onClick={() => st.show({ a: newArray(), lo: -1, hi: -1, mid: -1, found: -1 }, 'New sorted array.')}>New array</button>
        </div>
        <PlayerBar />
        <svg className="vizsvg" viewBox="0 0 760 170">
          {a.map((v, i) => {
            let cls = 'n';
            if (lo >= 0 && (i < lo || i > hi)) cls += ' out';
            if (i === mid) cls += ' cur';
            if (i === found) cls += ' found';
            const x = x0 + i * cw;
            return <g key={i}>
              <rect x={x} y={y} width={cw - 4} height={40} rx={5} className={cls} />
              <text x={x + (cw - 4) / 2} y={y + 20} className="ts" textAnchor="middle" dominantBaseline="central">{v}</text>
              <text x={x + (cw - 4) / 2} y={y - 14} className="lbl" textAnchor="middle" dominantBaseline="central">{i}</text>
              {labels[i] && <text x={x + (cw - 4) / 2} y={y + 64} className="lblA" textAnchor="middle" dominantBaseline="central">{labels[i].join('/')}</text>}
            </g>;
          })}
        </svg>
        <Explain say={st.frame.say} code={st.frame.code ?? BS_CODE[mode]} line={st.frame.line} />
      </div>
      <InfoCard title="Binary Search" desc="Works on any monotonic condition, not only sorted arrays: “first day the condition holds”, “smallest capacity that works” and similar."
        rows={[['Time', 'O(log n)'], ['Space', 'O(1)']]}
        sections={[
          { title: 'Common bugs', items: ['Off-by-one: decide whether `hi` is inclusive or exclusive and keep it that way.', 'Use `mid = lo + (hi - lo) // 2` in fixed-width languages to avoid overflow.', 'Infinite loop when `lo = mid` and mid rounds down.'] },
          { title: 'Practice', items: ['Search in Rotated Sorted Array', 'Find Minimum in Rotated Sorted Array', 'Koko Eating Bananas (binary search on the answer)', 'Median of Two Sorted Arrays'] },
        ]} />
    </div>
  );
}
