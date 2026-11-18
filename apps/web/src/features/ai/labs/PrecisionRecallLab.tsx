import { useRef, useState } from 'react';
import { RichText } from '@/components/ui';
import { randn } from '@/lib/playback';

interface Pt { y: 0 | 1; s: number; j: number }
function generate(sep: number, imbalanced: boolean): Pt[] {
  const pos = imbalanced ? 0.1 : 0.5, d = 0.04 + 0.26 * sep;
  return Array.from({ length: 120 }, () => {
    const y: 0 | 1 = Math.random() < pos ? 1 : 0;
    return { y, s: Math.min(0.99, Math.max(0.01, (y ? 0.5 + d : 0.5 - d) + 0.15 * randn())), j: Math.random() };
  });
}
export function metrics(pts: Pt[], t: number) {
  let TP = 0, FP = 0, FN = 0, TN = 0;
  for (const p of pts) { const pr = p.s >= t; if (p.y && pr) TP++; else if (!p.y && pr) FP++; else if (p.y) FN++; else TN++; }
  const P = TP + FP ? TP / (TP + FP) : 0, R = TP + FN ? TP / (TP + FN) : 0;
  return { TP, FP, FN, TN, P, R, F1: P + R ? (2 * P * R) / (P + R) : 0, acc: (TP + TN) / pts.length, fpr: FP + TN ? FP / (FP + TN) : 0 };
}

export function PrecisionRecallLab() {
  const [sep, setSep] = useState(55);
  const [imb, setImb] = useState(false);
  const [pts, setPts] = useState(() => generate(0.55, false));
  const [t, setT] = useState(0.5);
  const [msg, setMsg] = useState('Drag the threshold. Moving it right raises precision and lowers recall; moving it left does the opposite.');
  const dragging = useRef(false);
  const m = metrics(pts, t), X = (v: number) => 100 + v * 590;
  const roc: [number, number][] = [[0, 0]];
  for (const s of [...new Set(pts.map((p) => p.s))].sort((a, b) => b - a)) { const q = metrics(pts, s); roc.push([q.fpr, q.R]); }
  roc.push([1, 1]);
  let auc = 0;
  for (let i = 1; i < roc.length; i++) auc += ((roc[i][0] - roc[i - 1][0]) * (roc[i][1] + roc[i - 1][1])) / 2;
  const drag = (e: React.PointerEvent<SVGSVGElement>) => {
    const s = e.currentTarget, p = s.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    setT(Math.min(0.99, Math.max(0.01, (p.matrixTransform(s.getScreenCTM()!.inverse()).x - 100) / 590)));
  };
  const RX = (v: number) => 30 + v * 200, RY = (v: number) => 220 - v * 200;
  return (
    <div className="viz-layout">
      <div className="card">
        <div className="controls">
          <label className="muted" style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>Threshold <input type="range" min={1} max={99} value={Math.round(t * 100)} onChange={(e) => setT(+e.target.value / 100)} style={{ accentColor: 'var(--accent)' }} /></label>
          <label className="muted" style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>How well the model separates classes <input type="range" min={0} max={100} value={sep} onChange={(e) => { setSep(+e.target.value); setPts(generate(+e.target.value / 100, imb)); }} style={{ accentColor: 'var(--accent)' }} /></label>
          <label className="muted" style={{ fontSize: 14 }}><input type="checkbox" checked={imb} onChange={(e) => { setImb(e.target.checked); setPts(generate(sep / 100, e.target.checked)); setMsg(e.target.checked ? 'Only 10% of examples are positive now. Accuracy stays high even when recall is poor, which is why accuracy misleads on imbalanced data.' : 'Back to a 50/50 class balance.'); }} /> Imbalanced (10% positive)</label>
          <button className="btn" onClick={() => setPts(generate(sep / 100, imb))}>New data</button>
        </div>
        <svg className="vizsvg" viewBox="0 0 720 292" style={{ touchAction: 'none', cursor: 'ew-resize' }}
          onPointerDown={(e) => { dragging.current = true; drag(e); }} onPointerMove={(e) => dragging.current && drag(e)} onPointerUp={() => (dragging.current = false)} onPointerLeave={() => (dragging.current = false)}>
          <text x={12} y={80} className="lbl">actual</text><text x={12} y={96} className="lbl">positive</text>
          <text x={12} y={190} className="lbl">actual</text><text x={12} y={206} className="lbl">negative</text>
          <line x1={100} y1={250} x2={690} y2={250} className="edge" />
          {[0, 0.25, 0.5, 0.75, 1].map((v) => <text key={v} x={X(v)} y={266} className="lbl" textAnchor="middle">{v}</text>)}
          <text x={395} y={284} className="lbl" textAnchor="middle">model score</text>
          <rect x={X(t)} y={30} width={690 - X(t)} height={208} fill="var(--accent)" fillOpacity={0.07} />
          <text x={Math.min(X(t) + 8, 600)} y={44} className="lblA">predicted positive →</text>
          {pts.map((p, i) => { const col = p.y ? 'var(--green)' : 'var(--red)'; return <circle key={i} cx={X(p.s)} cy={(p.y ? 88 : 198) + (p.j - 0.5) * 56} r={5.5} style={{ stroke: col, fill: p.s >= t ? col : 'var(--panel)' }} strokeWidth={2} />; })}
          <line x1={X(t)} y1={24} x2={X(t)} y2={246} style={{ stroke: 'var(--accent)' }} strokeWidth={3} />
          <rect x={X(t) - 30} y={2} width={60} height={22} rx={6} fill="var(--accent)" />
          <text x={X(t)} y={13} textAnchor="middle" dominantBaseline="central" style={{ fill: 'var(--on-accent)', font: "700 12.5px 'Atkinson Hyperlegible'" }}>{t.toFixed(2)}</text>
        </svg>
        <div className="legend"><span style={{ ['--c' as string]: 'var(--green)' }}>actual positive</span><span style={{ ['--c' as string]: 'var(--red)' }}>actual negative</span><span style={{ ['--c' as string]: 'var(--line2)' }}>filled = predicted positive, hollow = predicted negative</span></div>
        <div className="say"><RichText text={msg} /></div>
      </div>
      <div className="card side">
        <h3>Confusion matrix</h3>
        <table className="cx"><tbody>
          <tr><th></th><th>Predicted +</th><th>Predicted −</th></tr>
          <tr><th>Actual +</th><td><b className="ok">{m.TP}</b> TP</td><td><b>{m.FN}</b> FN</td></tr>
          <tr><th>Actual −</th><td><b className="bad">{m.FP}</b> FP</td><td><b>{m.TN}</b> TN</td></tr>
        </tbody></table>
        <table className="cx" style={{ marginTop: 10 }}><tbody>
          <tr><td>Precision <span className="muted">TP / (TP+FP)</span></td><td><code>{m.P.toFixed(2)}</code></td></tr>
          <tr><td>Recall <span className="muted">TP / (TP+FN)</span></td><td><code>{m.R.toFixed(2)}</code></td></tr>
          <tr><td>F1</td><td><code>{m.F1.toFixed(2)}</code></td></tr>
          <tr><td>Accuracy</td><td><code>{m.acc.toFixed(2)}</code></td></tr>
        </tbody></table>
        <svg viewBox="0 0 240 252" style={{ width: '100%', maxWidth: 280, height: 'auto', marginTop: 12 }}>
          <rect x={30} y={20} width={200} height={200} fill="none" className="edge" />
          <line x1={30} y1={220} x2={230} y2={20} style={{ stroke: 'var(--edge)' }} strokeDasharray="4 4" />
          <polyline points={roc.map(([a, b]) => `${RX(a).toFixed(1)},${RY(b).toFixed(1)}`).join(' ')} fill="none" style={{ stroke: 'var(--accent)' }} strokeWidth={2.5} />
          <circle cx={RX(m.fpr)} cy={RY(m.R)} r={6} style={{ fill: 'var(--orange)', stroke: 'var(--panel)' }} strokeWidth={2} />
          <text x={130} y={244} className="lbl" textAnchor="middle">false positive rate</text>
          <text x={12} y={120} className="lbl" textAnchor="middle" transform="rotate(-90 12 120)">true positive rate</text>
          <text x={130} y={12} className="lblA" textAnchor="middle">ROC curve · AUC {auc.toFixed(2)}</text>
        </svg>
        <h4>Questions interviewers ask</h4>
        <ul><li>When do you care more about precision than recall? Give an example of each.</li><li>Why is accuracy misleading on imbalanced data?</li><li>ROC-AUC or PR-AUC for rare events?</li></ul>
      </div>
    </div>
  );
}
