import { useState } from 'react';
import { COMPANIES, PROBLEMS, type CompanyCode } from '@ipl/content';
import { ProgressBar } from '@/components/ui';
import { progress, useProgress } from '@/state/progress';
import { ProblemTable, matchesStatus, type StatusFilter } from './ProblemTable';
import { reviewId } from './problemModal';

const PATTERNS = [...new Set(PROBLEMS.map((p) => p.pattern))].sort();

export default function ProblemsPage() {
  const prog = useProgress();
  const [q, setQ] = useState('');
  const [diff, setDiff] = useState('');
  const [pat, setPat] = useState('');
  const [co, setCo] = useState('');
  const [status, setStatus] = useState<StatusFilter>('');
  const solved = new Set(prog.solved);
  const rows = PROBLEMS.filter((p) =>
    (!q || p.title.toLowerCase().includes(q.toLowerCase()) || p.id === q) && (!diff || p.difficulty === diff) &&
    (!pat || p.pattern === pat) && (!co || p.companies.includes(co as CompanyCode)) && matchesStatus(p, status, solved));
  const ns = PROBLEMS.filter((p) => solved.has(p.id)).length;
  const nd = PROBLEMS.filter((p) => progress.isDue(reviewId(p.id))).length;
  return (
    <>
      <h1>Top Interview Problems</h1>
      <p className="sub">{PROBLEMS.length} problems that come up again and again at large tech companies, grouped by pattern. Click a problem for hints, a timer and notes. Rate each attempt and it comes back for review on a schedule (1, 3, 7, 14, 30 days).</p>
      <div className="card">
        <div className="controls">
          <input type="search" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search problems" />
          <select value={diff} onChange={(e) => setDiff(e.target.value)} aria-label="Difficulty"><option value="">All difficulties</option><option>Easy</option><option>Medium</option><option>Hard</option></select>
          <select value={pat} onChange={(e) => setPat(e.target.value)} aria-label="Pattern"><option value="">All patterns</option>{PATTERNS.map((p) => <option key={p}>{p}</option>)}</select>
          <select value={co} onChange={(e) => setCo(e.target.value)} aria-label="Company"><option value="">All companies</option>{Object.entries(COMPANIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} aria-label="Status"><option value="">All problems</option><option value="unsolved">Not solved yet</option><option value="solved">Solved</option><option value="due">Due for review</option></select>
        </div>
        <div className="muted" style={{ fontSize: 14 }}>{ns} / {PROBLEMS.length} solved{nd ? `. ${nd} due for review` : ''}</div>
        <div style={{ marginBottom: 12 }}><ProgressBar value={ns} max={PROBLEMS.length} /></div>
        <ProblemTable rows={rows} showCompanies />
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 0 }}>Company tags come from public interview reports and change over time, so use them as a guide only. Problem links open LeetCode.</p>
      </div>
    </>
  );
}
