import { COMPANIES, type Problem } from '@ipl/content';
import { Pill } from '@/components/ui';
import { progress, useProgress } from '@/state/progress';
import { daysUntil } from '@/lib/dates';
import { isDue } from '@/lib/srs';
import { openProblem, reviewId } from './problemModal';

function NextReview({ id }: { id: string }) {
  const item = useProgress().sr[reviewId(id)];
  if (!item) return <span className="muted">–</span>;
  if (isDue(item)) return <Pill kind="due">Due now</Pill>;
  const n = daysUntil(item.due);
  return <span className="muted" style={{ fontSize: 13 }}>in {n} day{n > 1 ? 's' : ''}</span>;
}

/** Table of problems with a solved checkbox, review status and (optionally) company tags. */
export function ProblemTable({ rows, showCompanies }: { rows: Problem[]; showCompanies?: boolean }) {
  const prog = useProgress();
  const solved = new Set(prog.solved);
  const toggle = (id: string, on: boolean) => { progress.setSolved(id, on); if (on) openProblem(id); };
  return (
    <div style={{ overflow: 'auto' }}>
      <table className="probs">
        <thead><tr><th></th>{showCompanies && <th>#</th>}<th>Problem</th><th>Difficulty</th><th>{showCompanies ? 'Pattern' : 'Topic'}</th><th>Next review</th>{showCompanies && <th>Often reported at</th>}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className={solved.has(r.id) && !isDue(prog.sr[reviewId(r.id)]) ? 'solved' : ''}>
              <td><input type="checkbox" aria-label="Mark solved" checked={solved.has(r.id)} onChange={(e) => toggle(r.id, e.target.checked)} /></td>
              {showCompanies && <td className="muted">{r.id}</td>}
              <td>
                <button className="linkbtn" onClick={() => openProblem(r.id)}>{r.title}</button>
                {r.leetcodeSlug && <> <a href={`https://leetcode.com/problems/${r.leetcodeSlug}/`} target="_blank" rel="noopener" title="Open on LeetCode" style={{ textDecoration: 'none', fontSize: 13 }}>↗</a></>}
                {r.summary && <div className="muted" style={{ fontSize: 14 }}>{r.summary}</div>}
              </td>
              <td><Pill kind={r.difficulty}>{r.difficulty}</Pill></td>
              <td><Pill>{r.pattern}</Pill></td>
              <td><NextReview id={r.id} /></td>
              {showCompanies && <td className="muted" style={{ fontSize: 13 }}>{r.companies.map((c) => COMPANIES[c]).join(', ')}</td>}
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={7} className="muted">No matches.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export type StatusFilter = '' | 'unsolved' | 'solved' | 'due';
export function matchesStatus(p: Problem, f: StatusFilter, solved: Set<string>) {
  if (f === 'unsolved') return !solved.has(p.id);
  if (f === 'solved') return solved.has(p.id);
  if (f === 'due') return progress.isDue(reviewId(p.id));
  return true;
}
