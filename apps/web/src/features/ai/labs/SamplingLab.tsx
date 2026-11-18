import { useState } from 'react';
import { RichText } from '@/components/ui';

/** Fixed next-token logits for the prompt "The cat sat on the …". */
const TOKENS: [string, number][] = [['mat', 3.2], ['floor', 2.6], ['sofa', 2.3], ['bed', 2.0], ['roof', 1.4], ['table', 1.2], ['moon', 0.3], ['keyboard', 0.1], ['idea', -0.8], ['banana', -1.5]];

/** Temperature → softmax → top-k → top-p (nucleus) → renormalize. */
export function distribution(T: number, k: number, p: number) {
  const z = TOKENS.map((t) => t[1] / T), m = Math.max(...z), e = z.map((v) => Math.exp(v - m)), S = e.reduce((a, b) => a + b, 0);
  const base = e.map((v) => v / S);
  const order = base.map((_, i) => i).sort((a, b) => base[b] - base[a]);
  const kept = k > 0 ? order.slice(0, k) : order;
  const keptSum = kept.reduce((a, i) => a + base[i], 0);
  const nucleus: number[] = [];
  let cum = 0;
  for (const i of kept) { nucleus.push(i); cum += base[i] / keptSum; if (cum >= p - 1e-9) break; }
  const keep = new Set(nucleus), ks = nucleus.reduce((a, i) => a + base[i], 0);
  const fin = base.map((v, i) => (keep.has(i) ? v / ks : 0));
  const entropy = -fin.reduce((a, v) => a + (v > 0 ? v * Math.log2(v) : 0), 0);
  return { base, fin, keep, entropy };
}

export function SamplingLab() {
  const [T, setT] = useState(1), [k, setK] = useState(0), [p, setP] = useState(1);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [last, setLast] = useState(-1);
  const [msg, setMsg] = useState('Dashed outlines show the probabilities after temperature only. Filled bars show what is left after top-k and top-p, renormalized.');
  const d = distribution(T, k, p);
  const set = (t: number, kk: number, pp: number, m?: string) => { setT(t); setK(kk); setP(pp); setCounts({}); setLast(-1); if (m) setMsg(m); };
  const sample = (n: number) => {
    const c = { ...counts };
    let w = '', li = -1;
    for (let j = 0; j < n; j++) {
      let r = Math.random(), i = 0;
      for (; i < d.fin.length; i++) { r -= d.fin[i]; if (r <= 0) break; }
      i = Math.min(i, d.fin.length - 1);
      while (d.fin[i] === 0 && i > 0) i--;
      li = i; w = TOKENS[i][0]; c[w] = (c[w] || 0) + 1;
    }
    setCounts(c); setLast(li);
    setMsg(n === 1 ? `The cat sat on the **${w}**.` : `Sampled ${n} times. Counts are shown next to each bar. Lower the temperature and the samples pile onto "mat".`);
  };
  const rowH = 36, x0 = 110, bw = 520;
  const slider = (label: string, value: number, min: number, max: number, step: number, on: (v: number) => void, shown: string) => (
    <label className="muted" style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>{label}
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => { on(+e.target.value); setCounts({}); setLast(-1); }} style={{ accentColor: 'var(--accent)' }} />
      <b style={{ color: 'var(--text)', minWidth: 34 }}>{shown}</b></label>
  );
  return (
    <div className="viz-layout">
      <div className="card">
        <p style={{ margin: '0 0 12px', fontSize: 18 }}>Prompt: <b>"The cat sat on the …"</b> <span className="muted" style={{ fontSize: 14 }}>The model's raw scores (logits) for the next token are fixed. Your settings change how one gets picked.</span></p>
        <div className="controls">
          {slider('Temperature', T, 0.1, 2, 0.05, setT, T.toFixed(2))}
          {slider('Top-k', k, 0, 10, 1, setK, k ? String(k) : 'off')}
          {slider('Top-p', p, 0.05, 1, 0.05, setP, p.toFixed(2))}
        </div>
        <div className="controls">
          <button className="btn pri" onClick={() => sample(1)}>Sample one token</button>
          <button className="btn" onClick={() => sample(20)}>Sample 20 times</button>
          <span className="muted" style={{ fontSize: 14 }}>Presets:</span>
          <button className="btn sm" onClick={() => set(1, 1, 1, '**Greedy:** top-k = 1 always picks the most likely token. Deterministic, but repetitive in long outputs.')}>Greedy</button>
          <button className="btn sm" onClick={() => set(0.7, 0, 0.9, '**Focused:** temperature 0.7 with top-p 0.9, a common default for assistants.')}>Focused</button>
          <button className="btn sm" onClick={() => set(1.3, 0, 0.98, '**Creative:** a high temperature flattens the distribution, so unlikely tokens get picked more often.')}>Creative</button>
        </div>
        <svg className="vizsvg" viewBox={`0 0 720 ${14 + TOKENS.length * rowH}`}>
          {TOKENS.map(([w], i) => {
            const y = 14 + i * rowH, kept = d.keep.has(i);
            return <g key={w}>
              <text x={x0 - 12} y={y + 12} className={kept ? 't' : 'lbl'} textAnchor="end" dominantBaseline="central">{w}</text>
              <rect x={x0} y={y} width={Math.max(1, d.base[i] * bw)} height={24} rx={4} fill="none" style={{ stroke: 'var(--edge)' }} strokeDasharray="4 3" />
              {kept && <rect x={x0} y={y} width={Math.max(2, d.fin[i] * bw)} height={24} rx={4} className={'bar ' + (last === i ? 'pivot' : 'done')} />}
              <text x={x0 + Math.max(d.base[i], d.fin[i]) * bw + 8} y={y + 12} className="lbl" dominantBaseline="central">{kept ? (d.fin[i] * 100).toFixed(1) + '%' : 'filtered out'}{counts[w] ? ` · sampled ${counts[w]}×` : ''}</text>
            </g>;
          })}
        </svg>
        <div className="stats"><span>Tokens that can be picked: <b>{d.keep.size}</b></span><span>Entropy: <b>{d.entropy.toFixed(2)} bits</b> (higher = more random)</span></div>
        <div className="say"><RichText text={msg} /></div>
      </div>
      <div className="card side">
        <h3>How decoding works</h3>
        <table className="cx"><tbody>
          <tr><td><b>Temperature</b></td><td>Divides the logits before the softmax. Below 1 sharpens the distribution; above 1 flattens it.</td></tr>
          <tr><td><b>Top-k</b></td><td>Keeps only the k most likely tokens.</td></tr>
          <tr><td><b>Top-p</b></td><td>Keeps the smallest set of top tokens whose probabilities add up to p (nucleus sampling).</td></tr>
        </tbody></table>
        <h4>Questions interviewers ask</h4>
        <ul><li>Why can greedy decoding produce repetitive text?</li><li>When would you use temperature 0?</li><li>Why is top-p often preferred to a fixed top-k?</li><li>How does beam search differ from sampling?</li></ul>
      </div>
    </div>
  );
}
