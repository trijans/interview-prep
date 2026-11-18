import { useState } from 'react';
import { COMPONENT_TYPES, type Design } from '@ipl/content';
import { player, useStepper, type Frame } from '@/lib/playback';
import { PlayerBar, RichText } from '@/components/ui';
import { PracticeModal } from './PracticeModal';
import { TokenBucket } from './TokenBucket';

interface FlowState { act: string[]; hot: string[]; dot: { x: number; y: number; ms: number } | null; steps: string[] }
const W = 150, H = 50;
const empty: FlowState = { act: [], hot: [], dot: null, steps: [] };

/** Interactive architecture diagram with animated request flows, used for both the software and AI designs. */
export function DesignViewer({ d }: { d: Design }) {
  const st = useStepper<FlowState>(empty);
  const [sel, setSel] = useState<string | null>(null);
  const [practice, setPractice] = useState(false);
  const types = [...new Set(Object.values(d.nodes).map((n) => n.type))];
  const { act, hot, dot, steps } = st.state;
  const selected = sel ? d.nodes[sel] : null;

  const playFlow = (fi: number) => st.play(function* (): Generator<Frame<FlowState>> {
    const a = new Set<string>(), h = new Set<string>(), lines: string[] = [];
    for (const s of d.flows[fi].steps) {
      const A = d.nodes[s.from], B = d.nodes[s.to];
      a.add(s.from); h.add(s.from + '>' + s.to);
      lines.push(`**${A.label} → ${B.label}:** ${s.text}`);
      const ms = player.speed() * 0.8;
      yield { state: { act: [...a], hot: [...h], dot: { x: A.x, y: A.y, ms: 0 }, steps: [...lines] }, hold: 0.02 };
      yield { state: { act: [...a], hot: [...h], dot: { x: B.x, y: B.y, ms }, steps: [...lines] }, hold: 0.85 };
      a.add(s.to);
      yield { state: { act: [...a], hot: [...h], dot: null, steps: [...lines] }, hold: 0.9 };
    }
  });

  return (
    <>
      <div className="sd-layout">
        <div className="card">
          <div className="controls">
            {d.flows.map((f, i) => <button key={f.name} className={'btn' + (i ? '' : ' pri')} onClick={() => playFlow(i)}>▶ {f.name}</button>)}
            <button className="btn" onClick={() => !st.busy && st.show(empty)}>Reset</button>
            <button className="btn" style={{ marginLeft: 'auto' }} onClick={() => setPractice(true)}>✎ Practice this design</button>
          </div>
          <PlayerBar />
          <svg className="vizsvg" viewBox="0 0 900 460">
            {d.edges.map(([a, b]) => {
              const A = d.nodes[a], B = d.nodes[b], dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy);
              const ux = dx / len, uy = dy / len, f = Math.min((W / 2 + 4) / Math.abs(ux || 1e-9), (H / 2 + 4) / Math.abs(uy || 1e-9));
              const isHot = hot.includes(a + '>' + b) || hot.includes(b + '>' + a);
              return <line key={a + b} x1={A.x + ux * f} y1={A.y + uy * f} x2={B.x - ux * f} y2={B.y - uy * f} className={'sdedge' + (isHot ? ' hot' : '')} markerEnd={`url(#${isHot ? 'arrA' : 'arr'})`} />;
            })}
            {Object.entries(d.nodes).map(([id, n]) => (
              <g key={id} className={'sdn' + (act.includes(id) ? ' act' : '') + (sel === id ? ' sel' : '')} onClick={() => setSel(id)} role="button" aria-label={n.label}>
                <rect x={n.x - W / 2} y={n.y - H / 2} width={W} height={H} rx={10} stroke={COMPONENT_TYPES[n.type].color} />
                <text x={n.x} y={n.y - 9} className="ty" textAnchor="middle" dominantBaseline="central" fill={COMPONENT_TYPES[n.type].color}>{COMPONENT_TYPES[n.type].name.split(' /')[0]}</text>
                <text x={n.x} y={n.y + 9} className="nm" textAnchor="middle" dominantBaseline="central">{n.label}</text>
              </g>
            ))}
            {dot && <circle r={7} className="dot" cx={0} cy={0} style={{ transform: `translate(${dot.x}px, ${dot.y}px)`, transition: dot.ms ? `transform ${dot.ms}ms ease-in-out` : 'none' }} />}
          </svg>
          <ol className="steps">{steps.map((s, i) => <li key={i} className={i === steps.length - 1 ? 'now' : ''}><RichText text={s} /></li>)}</ol>
        </div>
        <div className="card side">
          {selected ? <>
            <span className="pill" style={{ color: COMPONENT_TYPES[selected.type].color }}>{COMPONENT_TYPES[selected.type].name}</span>
            <h3 style={{ marginTop: 8 }}>{selected.label}</h3>
            <p style={{ fontSize: 14 }}><RichText text={selected.info} /></p>
            <h4>Connected to</h4>
            <ul>{d.edges.filter((e) => e.includes(sel!)).map((e) => <li key={e.join()}>{d.nodes[e[0] === sel ? e[1] : e[0]].label}</li>)}</ul>
          </> : <>
            <h3>Click any component</h3>
            <p className="muted" style={{ fontSize: 14 }}>Each box shows why it exists and the trade-offs to mention in the interview.</p>
            <h4>Legend</h4>
            {types.map((t) => <div key={t} style={{ fontSize: 13 }}><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: COMPONENT_TYPES[t].color, marginRight: 6 }} />{COMPONENT_TYPES[t].name}</div>)}
          </>}
        </div>
      </div>
      <div className="grid3">
        <div className="card"><h3>Requirements</h3>
          <h4 style={{ marginTop: 0 }}>Functional</h4><ul>{d.requirements.functional.map((x) => <li key={x}>{x}</li>)}</ul>
          <h4>Non-functional</h4><ul>{d.requirements.nonFunctional.map((x) => <li key={x}>{x}</li>)}</ul></div>
        <div className="card"><h3>Back-of-the-envelope</h3><ul>{d.estimates.map((x) => <li key={x}><RichText text={x} /></li>)}</ul></div>
        <div className="card"><h3>API sketch</h3><ul>{d.api.map((x) => <li key={x}><code style={{ fontSize: 12.5 }}>{x}</code></li>)}</ul></div>
      </div>
      {d.extra === 'token-bucket' && <TokenBucket />}
      <h3 style={{ margin: '6px 0 10px' }}>Deep dives &amp; trade-offs</h3>
      {d.deepDives.map((x, i) => <details key={x.title} open={i === 0}><summary><RichText text={x.title} /></summary><p><RichText text={x.body} /></p></details>)}
      <PracticeModal design={d} open={practice} onClose={() => setPractice(false)} />
    </>
  );
}
