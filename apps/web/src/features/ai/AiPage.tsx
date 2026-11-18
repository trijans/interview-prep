import { useState } from 'react';
import { AI_PROBLEMS, DESIGNS } from '@ipl/content';
import { Panel, ProgressBar, Tabs, useTab } from '@/components/ui';
import { useProgress } from '@/state/progress';
import { settingsStore } from '@/state/settings';
import { ProblemTable, matchesStatus, type StatusFilter } from '@/features/problems/ProblemTable';
import { DesignViewer } from '@/features/system-design/DesignViewer';
import { selectQuestion, ALL_QUESTIONS } from '@/features/behavioral/questions';
import { setFlashcardMode } from '@/features/flashcards/cards';
import { GradientDescentLab } from './labs/GradientDescentLab';
import { SamplingLab } from './labs/SamplingLab';
import { PrecisionRecallLab } from './labs/PrecisionRecallLab';
import { KMeansLab } from './labs/KMeansLab';

const TABS = [
  { id: 'overview', label: 'Overview' }, { id: 'gd', label: 'Gradient descent' }, { id: 'sample', label: 'LLM sampling' },
  { id: 'pr', label: 'Precision & recall' }, { id: 'km', label: 'K-means' }, { id: 'code', label: 'ML coding' }, { id: 'design', label: 'AI system design' },
];
const AI_DESIGNS = DESIGNS.filter((d) => d.track === 'ai');

const ROLES = [
  { t: 'AI engineer', d: 'Builds products on top of foundation models: retrieval, agents, evaluation, latency and cost.', f: ['RAG and agent system design', 'LLM sampling, context, tokens and cost', 'Evaluating LLM output', 'Standard coding rounds (LeetCode medium)'] },
  { t: 'ML engineer', d: 'Trains, ships and monitors models: features, pipelines, ranking, serving and drift.', f: ['ML system design (recommendations, fraud)', 'ML coding from scratch in NumPy', 'Metrics, thresholds and experiments', 'Two coding rounds at SWE difficulty'] },
  { t: 'Applied / research scientist', d: 'Goes deeper on modeling: optimization, architectures, experiment design and papers.', f: ['Optimization and training dynamics', 'Transformers and attention in depth', 'Statistics and evaluation design', 'Discussing your past research in depth'] },
];
const LOOP = [
  ['Recruiter call and coding screen.', 'Usually a standard algorithms problem; some companies swap in an ML coding task.'],
  ['ML coding.', 'Implement something from scratch in Python and NumPy: attention, k-means, logistic regression, sampling.'],
  ['ML fundamentals or depth.', 'Bias and variance, metrics, optimization, transformers, and the details of your own projects.'],
  ['ML or LLM system design.', '"Design a recommendation feed", "Design a RAG assistant", "Design an agent that can take actions".'],
  ['Behavioral and project deep dive.', 'A model you shipped, what went wrong in production, and how you measured impact.'],
];

function MlCoding() {
  const prog = useProgress();
  const [status, setStatus] = useState<StatusFilter>('');
  const solved = new Set(prog.solved);
  const n = AI_PROBLEMS.filter((p) => solved.has(p.id)).length;
  return (
    <div className="card">
      <div className="controls">
        <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} aria-label="Status"><option value="">All problems</option><option value="unsolved">Not solved yet</option><option value="due">Due for review</option></select>
        <span className="muted" style={{ fontSize: 14 }}>Write these in Python and NumPy without ML libraries, the way most ML coding rounds ask.</span>
      </div>
      <div className="muted" style={{ fontSize: 14 }}>{n} / {AI_PROBLEMS.length} solved</div>
      <div style={{ marginBottom: 12 }}><ProgressBar value={n} max={AI_PROBLEMS.length} /></div>
      <ProblemTable rows={AI_PROBLEMS.filter((p) => matchesStatus(p, status, solved))} />
    </div>
  );
}

export default function AiPage() {
  const [tab, setTab] = useTab('ai', 'overview');
  const [design, setDesign] = useTab('aisd', AI_DESIGNS[0].id);
  const go = (to: string) => {
    if (to === 'flash') { settingsStore.setDeck('ai'); setFlashcardMode('all'); location.hash = 'technical'; }
    else if (to === 'beh') { selectQuestion(ALL_QUESTIONS.findIndex((q) => q.includes('model or AI feature'))); location.hash = 'behavioral'; }
    else { setTab(to); window.scrollTo(0, 0); }
  };
  const goCard = (to: string, title: string, body: string) => (
    <div className="card go" role="link" tabIndex={0} onClick={() => go(to)} onKeyDown={(e) => e.key === 'Enter' && go(to)}>
      <h3>{title}</h3><p className="muted" style={{ fontSize: 15, margin: 0 }}>{body}</p>
    </div>
  );
  return (
    <>
      <h1>AI &amp; ML interviews</h1>
      <p className="sub">For AI engineer, ML engineer and applied scientist roles. Build intuition with the visual labs, practise ML coding from scratch, design AI systems, and drill the concepts.</p>
      <Tabs tabs={TABS} active={tab} onChange={setTab} label="AI section" />
      <Panel show={tab === 'overview'}>
        <div className="grid3">{ROLES.map((r) => (
          <div className="card" key={r.t}><h3>{r.t}</h3><p className="muted" style={{ fontSize: 15, marginTop: 0 }}>{r.d}</p><h4>Focus on</h4>
            <ul style={{ paddingLeft: 18, margin: 0, fontSize: 15 }}>{r.f.map((x) => <li key={x}>{x}</li>)}</ul></div>
        ))}</div>
        <div className="card" style={{ marginBottom: 16 }}>
          <h3>What a typical loop looks like</h3>
          <ol className="steps" style={{ color: 'var(--text)' }}>{LOOP.map(([a, b]) => <li key={a}><b>{a}</b> {b}</li>)}</ol>
        </div>
        <div className="cards">
          {goCard('gd', 'Visual labs', 'Gradient descent, LLM sampling, precision and recall, and k-means, all interactive.')}
          {goCard('code', `${AI_PROBLEMS.length} ML coding problems`, 'From softmax to multi-head attention and BPE, each with hints and complexity targets.')}
          {goCard('design', `${AI_DESIGNS.length} AI system designs`, 'RAG, agents, recommendations, LLM serving and fraud detection, with guided practice.')}
          {goCard('flash', 'AI flashcards', 'ML fundamentals, deep learning, transformers, RAG and agents, evaluation, and MLOps.')}
          {goCard('beh', 'AI behavioral questions', 'Shipping models, offline vs online results, explaining models and responsible AI.')}
        </div>
      </Panel>
      <Panel show={tab === 'gd'}><GradientDescentLab /></Panel>
      <Panel show={tab === 'sample'}><SamplingLab /></Panel>
      <Panel show={tab === 'pr'}><PrecisionRecallLab /></Panel>
      <Panel show={tab === 'km'}><KMeansLab /></Panel>
      <Panel show={tab === 'code'}><MlCoding /></Panel>
      <Panel show={tab === 'design'}>
        <p className="muted" style={{ marginTop: 0 }}>The most common AI interview question today is some form of "design an LLM-based system for…". These {AI_DESIGNS.length} cover the main patterns. Each has a guided practice mode.</p>
        <Tabs tabs={AI_DESIGNS.map((d) => ({ id: d.id, label: d.name }))} active={design} onChange={setDesign} label="AI design" />
        {AI_DESIGNS.map((d) => <Panel key={d.id} show={design === d.id}><DesignViewer d={d} /></Panel>)}
      </Panel>
    </>
  );
}
