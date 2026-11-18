import { useMemo, useState } from 'react';
import { player, useStepper, type Frame } from '@/lib/playback';
import { Explain, PlayerBar } from '@/components/ui';
import { GD_CODE } from './code';

type Surface = 'bowl' | 'ravine' | 'two';
type Optimizer = 'gd' | 'mom' | 'adam';
type Pt = [number, number];

/** Loss surfaces with their analytic gradients. */
const SURFACES: Record<Surface, { name: string; f: (x: number, y: number) => number; g: (x: number, y: number) => Pt; start: Pt }> = {
  bowl: { name: 'Bowl (convex)', f: (x, y) => x * x + y * y, g: (x, y) => [2 * x, 2 * y], start: [-2.4, 1.5] },
  ravine: { name: 'Narrow valley', f: (x, y) => 0.1 * x * x + 2 * y * y, g: (x, y) => [0.2 * x, 4 * y], start: [-2.6, 1.4] },
  two: { name: 'Two valleys (non-convex)', f: (x, y) => (x * x - 1) ** 2 + 0.5 * y * y, g: (x, y) => [4 * x * (x * x - 1), y], start: [-0.15, 1.6] },
};
const W = 720, H = 480, X0 = -3, X1 = 3, Y0 = -2, Y1 = 2;
const px = (x: number) => ((x - X0) / (X1 - X0)) * W, py = (y: number) => H - ((y - Y0) / (Y1 - Y0)) * H;
const lrFromSlider = (v: number) => 0.001 * Math.pow(1200, v / 100);

interface GdState { path: Pt[] }

/** Runs gradient descent, narrating the first steps in detail. */
function* descend(surface: Surface, opt: Optimizer, lr: number, start: Pt): Generator<Frame<GdState>> {
  const { f, g } = SURFACES[surface], code = GD_CODE[opt];
  let [x, y] = start, vx = 0, vy = 0, mx = 0, my = 0, sx = 0, sy = 0, msg = '';
  const path: Pt[] = [[x, y]];
  yield { state: { path: [...path] }, code, line: 0, say: `Start at (${x.toFixed(2)}, ${y.toFixed(2)}), where the loss is ${f(x, y).toFixed(3)}. Goal: reach the lowest point. At each step we measure the slope and step downhill.`, hold: 1.4 };
  for (let t = 1; t <= 120; t++) {
    const [gx, gy] = g(x, y), L0 = f(x, y), slow = player.get().pace === 'step' || t <= 5;
    if (Math.hypot(gx, gy) < 1e-3) { msg = `**Converged** after ${t - 1} steps at (${x.toFixed(2)}, ${y.toFixed(2)}): the ground is flat, so we are at a minimum. Loss ${f(x, y).toExponential(1)}.`; break; }
    if (slow) yield { state: { path: [...path] }, line: 2, say: `Step ${t}: the slope here is (${gx.toFixed(2)}, ${gy.toFixed(2)}). Uphill is that way, so we will move the opposite way.` };
    let note = '';
    if (opt === 'gd') { x -= lr * gx; y -= lr * gy; note = `Move by learning rate × slope = ${lr.toFixed(3)} × slope.`; }
    else if (opt === 'mom') { vx = 0.9 * vx + gx; vy = 0.9 * vy + gy; x -= lr * vx; y -= lr * vy; note = 'Velocity keeps 90% of the previous step and adds the new slope, so it builds up speed in a consistent direction.'; }
    else { mx = 0.9 * mx + 0.1 * gx; my = 0.9 * my + 0.1 * gy; sx = 0.999 * sx + 0.001 * gx * gx; sy = 0.999 * sy + 0.001 * gy * gy; const c1 = 1 - 0.9 ** t, c2 = 1 - 0.999 ** t; x -= (lr * (mx / c1)) / (Math.sqrt(sx / c2) + 1e-8); y -= (lr * (my / c1)) / (Math.sqrt(sy / c2) + 1e-8); note = 'Adam divides by how steep each direction has been, so steep and flat directions get similar-sized steps.'; }
    path.push([x, y]);
    if (!isFinite(x) || Math.abs(x) > 60 || Math.abs(y) > 60) { msg = `**Diverged** after ${t} steps. The learning rate (${lr.toFixed(3)}) is too large: each step overshoots the bottom and lands even higher on the other side.`; break; }
    const L = f(x, y);
    yield { state: { path: [...path] }, line: opt === 'adam' ? 5 : opt === 'mom' ? 4 : 3, hold: slow ? 1.1 : 0.05,
      say: `Step ${t}: ${slow ? note + ' ' : ''}New position (${x.toFixed(2)}, ${y.toFixed(2)}). Loss ${L0.toFixed(4)} → ${L.toFixed(4)} ${L < L0 ? '(lower, good)' : '(higher: overshot)'}.${player.get().pace !== 'step' && t === 5 ? ' Speeding up now: every remaining step repeats the same idea.' : ''}` };
  }
  if (!msg) { const L = f(x, y); msg = L < 1e-3 ? `**Converged** to (${x.toFixed(2)}, ${y.toFixed(2)}) with loss ${L.toExponential(1)}.` : `Stopped after 120 steps with loss ${L.toFixed(4)}. Still going downhill: try a larger learning rate${opt === 'gd' ? ' or momentum' : ''}.`; }
  const diverged = msg.startsWith('**Diverged');
  if (!diverged && surface === 'two' && isFinite(x) && Math.abs(y) < 0.2) msg += ` It settled in the ${x > 0 ? 'right' : 'left'} valley. Start on the other side of the middle and it finds the other one: with bumpy loss surfaces, the starting point matters.`;
  if (!diverged && surface === 'ravine' && opt === 'gd') msg += ' Notice the zig-zag: the slope points across the narrow valley rather than along it. Compare with momentum or Adam.';
  yield { state: { path: [...path] }, line: -1, say: msg, hold: 0 };
}

function Heat({ surface }: { surface: Surface }) {
  const cells = useMemo(() => {
    const { f } = SURFACES[surface], c = 15, out: [number, number, number][] = [];
    let fmax = 0;
    for (let y = 0; y < H; y += c) for (let x = 0; x < W; x += c) {
      const v = f(X0 + ((x + c / 2) / W) * (X1 - X0), Y0 + ((H - y - c / 2) / H) * (Y1 - Y0));
      out.push([x, y, v]); fmax = Math.max(fmax, v);
    }
    return out.map(([x, y, v]) => [x, y, 0.42 * (1 - Math.log1p(v) / Math.log1p(fmax))] as const);
  }, [surface]);
  return <>{cells.map(([x, y, o]) => <rect key={x + '-' + y} x={x} y={y} width={15} height={15} fill="var(--accent)" fillOpacity={o.toFixed(3)} />)}</>;
}

export function GradientDescentLab() {
  const [surface, setSurface] = useState<Surface>('bowl');
  const [opt, setOpt] = useState<Optimizer>('gd');
  const [lrv, setLrv] = useState(65);
  const [start, setStart] = useState<Pt>(SURFACES.bowl.start);
  const st = useStepper<GdState>({ path: [] }, 'Think of the picture as a landscape seen from above: darker means lower. Gradient descent is a ball rolling downhill, one step at a time. Pick a surface, an optimizer and a learning rate (step size), then press **Run**.', GD_CODE.gd);
  const lr = lrFromSlider(lrv), path = st.state.path, cur = path[path.length - 1];
  const loss = path.map(([x, y]) => SURFACES[surface].f(x, y)).filter(isFinite).map((v) => Math.log10(v + 1e-6));
  const mx = Math.max(...loss), mn = Math.min(...loss), rng = mx - mn || 1;
  const reset = (s: Surface, msg?: string) => { setStart(SURFACES[s].start); st.show({ path: [] }, msg); };
  return (
    <div className="viz-layout">
      <div className="card">
        <div className="controls">
          <select value={surface} aria-label="Loss surface" onChange={(e) => { const s = e.target.value as Surface; setSurface(s); reset(s, SURFACES[s].name + '. Press Run.'); }}>
            {(Object.keys(SURFACES) as Surface[]).map((k) => <option key={k} value={k}>{SURFACES[k].name}</option>)}
          </select>
          <select value={opt} aria-label="Optimizer" onChange={(e) => { const o = e.target.value as Optimizer; setOpt(o); st.show({ path: [] }, undefined, GD_CODE[o], -1); }}>
            <option value="gd">Plain gradient descent</option><option value="mom">Momentum (β = 0.9)</option><option value="adam">Adam</option>
          </select>
          <label className="muted" style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>Learning rate
            <input type="range" min={0} max={100} value={lrv} onChange={(e) => setLrv(+e.target.value)} style={{ accentColor: 'var(--accent)' }} />
            <b style={{ color: 'var(--text)', minWidth: 42 }}>{lr.toFixed(3)}</b></label>
          <button className="btn pri" disabled={st.busy} onClick={() => st.play(() => descend(surface, opt, lr, start))}>▶ Run</button>
          <button className="btn" onClick={() => !st.busy && reset(surface, 'Reset to the default starting point.')}>Reset</button>
        </div>
        <PlayerBar />
        <svg className="vizsvg" viewBox={`0 0 ${W} ${H}`} style={{ cursor: 'crosshair' }} onClick={(e) => {
          if (st.busy) return;
          const s = e.currentTarget, p = s.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
          const q = p.matrixTransform(s.getScreenCTM()!.inverse());
          const pt: Pt = [X0 + (q.x / W) * (X1 - X0), Y0 + ((H - q.y) / H) * (Y1 - Y0)];
          setStart(pt); st.show({ path: [] }, `Start set to (${pt[0].toFixed(2)}, ${pt[1].toFixed(2)}). Press Run.`);
        }}>
          <Heat surface={surface} />
          {path.length > 1 && <polyline points={path.map(([x, y]) => `${px(x).toFixed(1)},${py(y).toFixed(1)}`).join(' ')} fill="none" style={{ stroke: 'var(--orange)' }} strokeWidth={2.5} strokeLinejoin="round" />}
          {path.slice(1, -1).map(([x, y], i) => <circle key={i} cx={px(x)} cy={py(y)} r={2.6} style={{ fill: 'var(--orange)' }} />)}
          <circle cx={px(start[0])} cy={py(start[1])} r={7} style={{ fill: 'var(--panel)', stroke: 'var(--text)' }} strokeWidth={2.5} />
          {path.length > 1 && cur && isFinite(cur[0]) && <circle cx={px(Math.max(X0, Math.min(X1, cur[0])))} cy={py(Math.max(Y0, Math.min(Y1, cur[1])))} r={8} style={{ fill: 'var(--orange)', stroke: 'var(--panel)' }} strokeWidth={2.5} />}
          <text x={12} y={22} className="lbl">Click anywhere to choose a starting point</text>
        </svg>
        <Explain say={st.frame.say} code={st.frame.code ?? GD_CODE[opt]} line={st.frame.line} />
      </div>
      <div className="card side">
        <h3>Gradient descent</h3>
        <p>Each step moves against the gradient: <code>w ← w − lr · ∇L(w)</code>. The learning rate decides how far.</p>
        <svg viewBox="0 0 300 124" style={{ width: '100%', height: 'auto' }}>
          {loss.length < 2 ? <text x={150} y={60} className="lbl" textAnchor="middle">Run to see the loss curve</text> : <>
            <line x1={30} y1={100} x2={290} y2={100} className="edge" /><line x1={30} y1={10} x2={30} y2={100} className="edge" />
            <text x={160} y={116} className="lbl" textAnchor="middle">step</text>
            <text x={12} y={56} className="lbl" textAnchor="middle" transform="rotate(-90 12 56)">loss (log)</text>
            <polyline points={loss.map((v, i) => `${(30 + (i / (loss.length - 1)) * 260).toFixed(1)},${(100 - ((v - mn) / rng) * 88).toFixed(1)}`).join(' ')} fill="none" style={{ stroke: 'var(--orange)' }} strokeWidth={2} />
          </>}
        </svg>
        <h4>Things to try</h4>
        <ul><li>Narrow valley with plain descent: watch it zig-zag. Then switch to momentum.</li><li>Push the learning rate past about 0.5 on the narrow valley and it diverges.</li><li>Two valleys: start on either side of the middle and it lands in different minima.</li></ul>
        <h4>Questions interviewers ask</h4>
        <ul><li>Why does Adam often train faster than plain SGD?</li><li>How do you pick a learning rate? What does warmup do?</li><li>Why does SGD noise help find better minima?</li></ul>
      </div>
    </div>
  );
}
