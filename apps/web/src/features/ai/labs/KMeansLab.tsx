import { useState } from 'react';
import { randn, rnd, useStepper, type Frame } from '@/lib/playback';
import { Explain, PlayerBar } from '@/components/ui';
import { KMEANS_CODE } from './code';

type P = [number, number];
const COLORS = ['#4C72F0', '#16A075', '#D69214', '#E0564B', '#8B5FE6', '#1597AD'];
const d2 = (a: P, b: P) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
interface KmState { pts: P[]; c: P[]; a: number[]; it: number; done: boolean }

function blobs(): P[] {
  const out: P[] = [];
  for (let b = 0; b < rnd(3, 5); b++) {
    const cx = rnd(100, 620), cy = rnd(80, 360);
    for (let i = 0; i < 36; i++) out.push([Math.min(705, Math.max(15, cx + randn() * 38)), Math.min(425, Math.max(15, cy + randn() * 34))]);
  }
  return out;
}
/** Random init, or k-means++ (each new centroid chosen with probability ∝ squared distance). */
function initCentroids(pts: P[], k: number, plusPlus: boolean): P[] {
  if (!plusPlus) return [...pts].sort(() => Math.random() - 0.5).slice(0, k).map((p) => [...p] as P);
  const c: P[] = [[...pts[rnd(0, pts.length - 1)]] as P];
  while (c.length < k) {
    const D = pts.map((p) => Math.min(...c.map((q) => d2(p, q)))), S = D.reduce((a, b) => a + b, 0);
    let r = Math.random() * S, i = 0;
    for (; i < pts.length; i++) { r -= D[i]; if (r <= 0) break; }
    c.push([...pts[Math.min(i, pts.length - 1)]] as P);
  }
  return c;
}
const assign = (pts: P[], c: P[]) => pts.map((p) => { let b = 0, bd = Infinity; c.forEach((q, j) => { const d = d2(p, q); if (d < bd) { bd = d; b = j; } }); return b; });
const update = (pts: P[], c: P[], a: number[]): P[] => c.map((q, j) => { const m = pts.filter((_, i) => a[i] === j); return m.length ? [m.reduce((s, p) => s + p[0], 0) / m.length, m.reduce((s, p) => s + p[1], 0) / m.length] : q; });
export const inertia = (pts: P[], c: P[], a: number[]) => pts.reduce((s, p, i) => s + (a[i] >= 0 ? d2(p, c[a[i]]) : 0), 0);

function* rounds(s: KmState, maxRounds: number): Generator<Frame<KmState>> {
  let st = s;
  for (let r = 0; r < maxRounds; r++) {
    if (st.done) return yield { state: st, say: 'Already converged: no point changes group any more. Try a different k or press New data.', hold: 0 };
    const a = assign(st.pts, st.c), ch = a.filter((x, i) => x !== st.a[i]).length;
    st = { ...st, a };
    yield { state: st, line: 2, say: `**Assign:** each point measures its distance to all ${st.c.length} centroids (diamonds) and joins the nearest one, taking its colour. ${ch} point${ch === 1 ? '' : 's'} changed group.`, hold: 1.3 };
    if (ch === 0 && st.it > 0) {
      st = { ...st, done: true };
      return yield { state: st, line: 4, say: `**Converged** after ${st.it} rounds: no point changed group, so the centroids won't move again. Inertia (total squared distance to centroids) is ${Math.round(inertia(st.pts, st.c, st.a)).toLocaleString()}.`, hold: 0 };
    }
    st = { ...st, c: update(st.pts, st.c, a), it: st.it + 1 };
    yield { state: st, line: 3, say: `**Move:** each centroid jumps to the middle (average position) of the points in its group. Round ${st.it} done.`, hold: 1.1 };
  }
}

export function KMeansLab() {
  const [k, setK] = useState(3);
  const [pp, setPp] = useState(true);
  const init = (pts: P[], kk = k, plus = pp): KmState => ({ pts, c: initCentroids(pts, kk, plus), a: pts.map(() => -1), it: 0, done: false });
  const st = useStepper<KmState>(init(blobs()), 'K-means groups points into k clusters. Each round has two parts: every point joins its nearest centroid (diamond), then every centroid moves to the middle of its group.', KMEANS_CODE);
  const [elbow, setElbow] = useState<number[] | null>(null);
  const reinit = (pts = st.state.pts, kk = k, plus = pp) => { if (!st.busy) st.show(init(pts, kk, plus), `${kk} centroids placed ${plus ? 'with k-means++ (spread out, far from each other)' : 'on random points'}. Press Step to assign points, then move centroids.`, KMEANS_CODE, 0); };
  const drawElbow = () => {
    const pts = st.state.pts, out: number[] = [];
    for (let kk = 1; kk <= 8; kk++) {
      let best = Infinity;
      for (let r = 0; r < 4; r++) {
        let c = initCentroids(pts, kk, true), a = pts.map(() => -1);
        for (let it = 0; it < 50; it++) { const na = assign(pts, c), same = na.every((v, i) => v === a[i]); a = na; c = update(pts, c, a); if (same) break; }
        best = Math.min(best, inertia(pts, c, a));
      }
      out.push(best);
    }
    setElbow(out);
  };
  const { pts, c, a, it } = st.state;
  return (
    <div className="viz-layout">
      <div className="card">
        <div className="controls">
          <label className="muted" style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>k <input type="range" min={2} max={6} value={k} onChange={(e) => { setK(+e.target.value); reinit(undefined, +e.target.value); }} style={{ accentColor: 'var(--accent)' }} /> <b style={{ color: 'var(--text)' }}>{k}</b></label>
          <select value={pp ? 'pp' : 'rand'} aria-label="Initialization" onChange={(e) => { setPp(e.target.value === 'pp'); reinit(undefined, undefined, e.target.value === 'pp'); }}><option value="pp">k-means++ initialization</option><option value="rand">Random initialization</option></select>
          <button className="btn pri" disabled={st.busy} onClick={() => st.play((s) => rounds(s, 1))}>Step</button>
          <button className="btn" disabled={st.busy} onClick={() => st.play((s) => rounds(s, 40))}>▶ Run to convergence</button>
          <button className="btn" onClick={() => { reinit(blobs()); setElbow(null); }}>New data</button>
        </div>
        <PlayerBar />
        <svg className="vizsvg" viewBox="0 0 720 440">
          {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={5} style={{ fill: a[i] >= 0 ? COLORS[a[i] % 6] : 'var(--node-stroke)', fillOpacity: a[i] >= 0 ? 0.75 : 0.6 }} />)}
          {c.map((q, j) => <g key={j} transform={`translate(${q[0]},${q[1]})`} style={{ transition: 'transform .5s ease' }}><rect x={-11} y={-11} width={22} height={22} rx={4} transform="rotate(45)" style={{ fill: COLORS[j % 6], stroke: 'var(--panel)' }} strokeWidth={3} /></g>)}
        </svg>
        <div className="stats"><span>Iteration: <b>{it}</b></span><span>Inertia (sum of squared distances): <b>{a[0] >= 0 ? Math.round(inertia(pts, c, a)).toLocaleString() : '–'}</b></span></div>
        <Explain say={st.frame.say} code={KMEANS_CODE} line={st.frame.line} />
      </div>
      <div className="card side">
        <h3>K-means</h3>
        <table className="cx"><tbody><tr><td>Time per iteration</td><td><code>O(n · k · d)</code></td></tr><tr><td>Objective</td><td>Minimize inertia: the sum of squared distances to the nearest centroid</td></tr></tbody></table>
        <h4>Choosing k</h4>
        <button className="btn sm" onClick={drawElbow}>Draw the elbow chart</button>
        {elbow && <svg viewBox="0 0 300 150" style={{ width: '100%', height: 'auto', marginTop: 8 }}>
          <line x1={30} y1={110} x2={280} y2={110} className="edge" /><line x1={30} y1={10} x2={30} y2={110} className="edge" />
          <polyline points={elbow.map((v, i) => `${30 + (i / 7) * 250},${110 - (v / elbow[0]) * 95}`).join(' ')} fill="none" style={{ stroke: 'var(--accent)' }} strokeWidth={2.5} />
          {elbow.map((v, i) => <g key={i}><circle cx={30 + (i / 7) * 250} cy={110 - (v / elbow[0]) * 95} r={4} style={{ fill: 'var(--accent)' }} /><text x={30 + (i / 7) * 250} y={126} className="lbl" textAnchor="middle">{i + 1}</text></g>)}
          <text x={155} y={142} className="lbl" textAnchor="middle">k</text>
        </svg>}
        {elbow && <p className="muted" style={{ fontSize: 14 }}>Inertia always falls as k grows, so look for the "elbow" where adding clusters stops helping much.</p>}
        <h4>Questions interviewers ask</h4>
        <ul><li>Why can random initialization give a bad result? What does k-means++ change?</li><li>When does k-means fail (non-spherical clusters, different sizes)?</li><li>Why scale features before clustering?</li></ul>
      </div>
    </div>
  );
}
