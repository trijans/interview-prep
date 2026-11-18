import type { ReactNode } from 'react';
import type { Design } from '@ipl/content';
import { Modal, ProgressBar, RichText } from '@/components/ui';
import { progress, useProgress, type DesignPractice } from '@/state/progress';

interface Step { title: string; prompt: string; reference: (d: Design) => ReactNode; checks: (d: Design) => string[] }

/** The five stages of a system design interview, each with a reference answer and a self-check. */
export const STEPS: Step[] = [
  {
    title: 'Requirements',
    prompt: 'Write the functional requirements (what the system must do) and the non-functional ones (scale, latency, availability, consistency). In a real interview, this is where you ask clarifying questions.',
    reference: (d) => <><h4>Functional</h4><ul>{d.requirements.functional.map((x) => <li key={x}>{x}</li>)}</ul><h4>Non-functional</h4><ul>{d.requirements.nonFunctional.map((x) => <li key={x}>{x}</li>)}</ul></>,
    checks: () => ['Listed the 3–5 core features, and nothing extra', 'Stated the expected scale (users, requests per second)', 'Named latency, availability or consistency targets', 'Said what is out of scope'],
  },
  {
    title: 'Estimates',
    prompt: 'Estimate reads and writes per second, storage over a few years, and anything else that shapes the design.',
    reference: (d) => <ul>{d.estimates.map((x) => <li key={x}><RichText text={x} /></li>)}</ul>,
    checks: () => ['Worked out read and write QPS', 'Estimated storage growth over time', 'Used a number to justify a design choice (cache, sharding, CDN…)'],
  },
  {
    title: 'API & data model',
    prompt: 'Sketch the main API endpoints and the core entities with their keys. Choose a datastore and say why.',
    reference: (d) => <ul>{d.api.map((x) => <li key={x}><code>{x}</code></li>)}</ul>,
    checks: () => ['Defined the main endpoints with inputs and outputs', 'Named the core entities and their primary keys', 'Picked a datastore based on the access pattern'],
  },
  {
    title: 'High-level design',
    prompt: 'List the main components, then walk one request from the client to storage and back.',
    reference: (d) => <>
      <h4>Components</h4><ul>{Object.values(d.nodes).map((n) => <li key={n.label}><b>{n.label}</b>: <RichText text={n.info} /></li>)}</ul>
      {d.flows.map((f) => <div key={f.name}><h4>{f.name}</h4><ol>{f.steps.map((s, i) => <li key={i}>{d.nodes[s.from].label} → {d.nodes[s.to].label}: {s.text}</li>)}</ol></div>)}
    </>,
    checks: () => ['Walked one request end to end', 'Kept app servers stateless behind a load balancer', 'Placed a cache, queue or CDN where it is actually needed', 'Covered every functional requirement'],
  },
  {
    title: 'Deep dives',
    prompt: 'Pick the hardest parts of this system and go deeper: bottlenecks, failure modes and trade-offs.',
    reference: (d) => <>{d.deepDives.map((x) => <div key={x.title}><h4><RichText text={x.title} /></h4><p><RichText text={x.body} /></p></div>)}</>,
    checks: (d) => [...d.deepDives.map((x) => 'Covered: ' + x.title.replace(/\?$/, '').replace(/\*\*/g, '')), 'Named a single point of failure and how to remove it', 'Mentioned monitoring and alerting'],
  },
];

const fresh = (): DesignPractice => ({ step: 0, ans: {}, chk: {}, rev: {} });

export function PracticeModal({ design, open, onClose }: { design: Design; open: boolean; onClose: () => void }) {
  const saved = useProgress().sdp[design.id];
  const p = saved ?? fresh();
  const save = (patch: Partial<DesignPractice>) => progress.savePractice(design.id, { ...p, ...patch });
  const total = STEPS.reduce((a, s) => a + s.checks(design).length, 0);
  const done = STEPS.reduce((a, _s, j) => a + (p.chk[j] || []).filter(Boolean).length, 0);

  if (p.step >= STEPS.length) {
    const pct = Math.round((done / total) * 100);
    return (
      <Modal open={open} onClose={onClose}>
        <div className="muted" style={{ fontSize: 13 }}>Guided practice · results</div>
        <h2 style={{ margin: '4px 0 12px' }}>Design {design.name}: {pct}%</h2>
        <div style={{ marginBottom: 16 }}><ProgressBar value={done} max={total} /></div>
        <table className="cx"><tbody>{STEPS.map((s, j) => {
          const n = s.checks(design).length, c = (p.chk[j] || []).filter(Boolean).length;
          return <tr key={s.title}><td>{j + 1}. {s.title}</td><td><code>{c} / {n}</code></td><td>{!p.rev[j] ? <span className="muted">not checked yet</span> : c === n ? <span className="ok">✓ solid</span> : <span style={{ color: 'var(--yellow)' }}>revisit</span>}</td></tr>;
        })}</tbody></table>
        <p className="muted" style={{ fontSize: 14 }}>Steps marked "revisit" are the ones to practise again. Try explaining this design out loud in 35–40 minutes, as you would in a real interview.</p>
        <div className="controls">
          <button className="btn" onClick={() => save({ step: 0 })}>Review my answers</button>
          <button className="btn" onClick={() => progress.savePractice(design.id, fresh())}>Start over</button>
          <button className="btn pri" onClick={onClose}>Done</button>
        </div>
      </Modal>
    );
  }

  const i = p.step, s = STEPS[i], checks = s.checks(design), c = p.chk[i] || [];
  return (
    <Modal open={open} onClose={onClose}>
      <div className="muted" style={{ fontSize: 13 }}>Guided practice · step {i + 1} of {STEPS.length}</div>
      <h2 style={{ margin: '4px 0 12px' }}>Design {design.name}</h2>
      <div className="steps-nav">{STEPS.map((x, j) => <button key={x.title} className={(j === i ? 'active ' : '') + ((p.ans[j] || '').trim() ? 'done' : '')} onClick={() => save({ step: j })}>{j + 1}. {x.title}</button>)}</div>
      <p style={{ fontSize: 14.5 }}>{s.prompt}</p>
      <textarea key={i} rows={8} defaultValue={p.ans[i] || ''} placeholder="Write your answer here. Bullet points are fine." onChange={(e) => save({ ans: { ...p.ans, [i]: e.target.value } })} />
      <div className="controls" style={{ marginTop: 10 }}>
        <button className={'btn' + (p.rev[i] ? '' : ' pri')} onClick={() => { if (!p.rev[i]) progress.logOnce('sd'); save({ rev: { ...p.rev, [i]: !p.rev[i] } }); }}>{p.rev[i] ? 'Hide' : 'Reveal'} reference answer</button>
        {!p.rev[i] && <span className="muted" style={{ fontSize: 13 }}>Write your own answer first, then compare.</span>}
      </div>
      {p.rev[i] && <>
        <div className="card ref">{s.reference(design)}</div>
        <h4>Self-check: did your answer…</h4>
        <div className="checks">{checks.map((t, j) => (
          <label key={t}><input type="checkbox" checked={!!c[j]} onChange={(e) => { const n = [...c]; n[j] = e.target.checked; save({ chk: { ...p.chk, [i]: n } }); }} /> {t}</label>
        ))}</div>
      </>}
      <div className="controls" style={{ marginTop: 16, justifyContent: 'space-between' }}>
        <span className="muted" style={{ fontSize: 14 }}>Score so far: <b>{done} / {total}</b></span>
        <span>
          <button className="btn" disabled={!i} onClick={() => save({ step: i - 1 })}>← Back</button>{' '}
          <button className="btn pri" onClick={() => save({ step: i + 1 })}>{i < STEPS.length - 1 ? 'Next step →' : 'Finish'}</button>
        </span>
      </div>
    </Modal>
  );
}
