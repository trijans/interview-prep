import { useState } from 'react';
import { player, rnd, useStepper } from '@/lib/playback';
import { Explain, InfoCard, PlayerBar } from '@/components/ui';
import { SORTS, type SortState } from './algorithms';
import { SORT_INFO, type SortId } from './info';

const randomArray = (n: number) => Array.from({ length: n }, () => rnd(5, 100));
const fresh = (a: number[]): SortState => ({ a, done: [], cmp: 0, swp: 0 });
const INTRO = 'Press **Sort** to watch. Choose **Step by step** above to go one move at a time. Every move is explained here.';

export function SortingViz() {
  const [alg, setAlg] = useState<SortId>('bubble');
  const [base, setBase] = useState(() => randomArray(10));
  const st = useStepper<SortState>(fresh(base), INTRO, SORT_INFO.bubble.code);
  const info = SORT_INFO[alg];
  const reset = (a = base, id = alg) => { player.interrupt(); setBase(a); st.show(fresh(a), INTRO, SORT_INFO[id].code, -1); };

  const sort = () => st.play(function* () {
    let last: SortState = fresh(base);
    for (const f of SORTS[alg](base)) {
      last = f.state;
      yield { ...f, hold: player.get().pace === 'fast' ? 0.15 : 0.6 };
    }
    yield { state: { ...last, done: last.a.map((_, i) => i), c: [], s: [], p: undefined, r: undefined }, line: -1, hold: 0,
      say: `Sorted! That took ${last.cmp} comparisons and ${last.swp} swaps or writes for ${last.a.length} items. Try another algorithm on the same numbers and compare.` };
  });

  const { a, done, c = [], s = [], p, r } = st.state;
  const n = a.length, bw = 760 / n, doneSet = new Set(done);
  return (
    <div className="viz-layout">
      <div className="card">
        <div className="controls">
          <select value={alg} aria-label="Algorithm" onChange={(e) => { const id = e.target.value as SortId; setAlg(id); reset(base, id); }}>
            {(Object.keys(SORT_INFO) as SortId[]).map((k) => <option key={k} value={k}>{SORT_INFO[k].name}</option>)}
          </select>
          <label className="muted" style={{ fontSize: 13 }}>n <input type="range" min={6} max={40} value={base.length} onChange={(e) => reset(randomArray(+e.target.value))} /></label>
          <button className="btn pri" onClick={sort} disabled={st.busy}>▶ Sort</button>
          <button className="btn" onClick={() => reset(randomArray(base.length))}>Shuffle</button>
        </div>
        <PlayerBar />
        <svg className="vizsvg" viewBox="0 0 760 300">
          {a.map((v, i) => {
            let cls = 'bar';
            if (doneSet.has(i)) cls += ' done';
            if (c.includes(i)) cls += ' cmp';
            if (s.includes(i)) cls += ' swap';
            if (p === i) cls += ' pivot';
            if (r && (i < r[0] || i > r[1])) cls += ' out';
            const h = (v / 100) * 270;
            return <g key={i}>
              <rect x={i * bw + 1} y={290 - h} width={Math.max(1, bw - 2)} height={h} rx={2} className={cls} />
              {n <= 24 && <text x={i * bw + bw / 2} y={290 - h - 9} className="lbl" textAnchor="middle">{v}</text>}
            </g>;
          })}
        </svg>
        <div className="stats"><span>Comparisons: <b>{st.state.cmp}</b></span><span>Swaps / writes: <b>{st.state.swp}</b></span></div>
        <div className="legend"><span style={{ ['--c' as string]: 'var(--yellow)' }}>comparing</span><span style={{ ['--c' as string]: 'var(--red)' }}>swap / write</span><span style={{ ['--c' as string]: 'var(--purple)' }}>pivot</span><span style={{ ['--c' as string]: 'var(--green)' }}>in final place</span></div>
        <Explain say={st.frame.say} code={info.code} line={st.frame.line} />
      </div>
      <InfoCard title={info.name} desc={info.idea}
        rows={[['Best', info.best], ['Average', info.average], ['Worst', info.worst], ['Extra space', info.space], ['Stable', info.stable]]}
        sections={[{ title: 'Interview angle', items: ["You'll rarely implement a sort. You will be asked about trade-offs: stability, memory, worst case.", 'Quickselect (the partition step) finds the k-th element in O(n) on average.', 'The merge step is the core of Merge k Sorted Lists and counting inversions.'] }]} />
    </div>
  );
}
