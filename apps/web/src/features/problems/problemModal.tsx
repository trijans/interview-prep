import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AI_PROBLEMS, PROBLEMS, type Problem } from '@ipl/content';
import { Modal, Pill } from '@/components/ui';
import { progress, useProgress } from '@/state/progress';
import { RATING_LABEL, type Rating } from '@/lib/srs';
import { formatClock } from '@/lib/dates';

export const ALL_PROBLEMS: Problem[] = [...PROBLEMS, ...AI_PROBLEMS];
export const reviewId = (id: string) => 'p:' + id;

/* Which problem is open, shared so Home, Top Problems and ML coding can all open it. */
let openId: string | null = null;
const subs = new Set<() => void>();
export function openProblem(id: string | null) { openId = id; subs.forEach((f) => f()); }
const close = () => openProblem(null);

const TARGET_MIN = { Easy: 15, Medium: 25, Hard: 40 };

export function ProblemModalHost() {
  const id = useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => openId);
  const p = ALL_PROBLEMS.find((x) => x.id === id);
  return <Modal open={!!p} onClose={close}>{p && <ProblemPanel key={p.id} p={p} />}</Modal>;
}

function ProblemPanel({ p }: { p: Problem }) {
  const prog = useProgress();
  const item = prog.sr[reviewId(p.id)];
  const [shown, setShown] = useState(0);
  const [sec, setSec] = useState(0);
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<number>();
  const target = TARGET_MIN[p.difficulty];
  useEffect(() => {
    if (running) timer.current = window.setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(timer.current);
  }, [running]);

  const rate = (r: Rating) => {
    const days = progress.rate(reviewId(p.id), r);
    if (r !== 'fail') progress.setSolved(p.id, true);
    setMsg(`Saved as ${RATING_LABEL[r]}. Next review in ${days} day${days > 1 ? 's' : ''}.`);
  };

  return (
    <>
      <div className="muted" style={{ fontSize: 13 }}>{p.leetcodeSlug ? `#${p.id} · ` : ''}<Pill kind={p.difficulty}>{p.difficulty}</Pill> <Pill>{p.pattern}</Pill></div>
      <h2 style={{ margin: '8px 0 4px' }}>{p.title}</h2>
      {p.summary && <p style={{ margin: '0 0 6px' }}>{p.summary}</p>}
      {p.leetcodeSlug
        ? <a href={`https://leetcode.com/problems/${p.leetcodeSlug}/`} target="_blank" rel="noopener">Solve it on LeetCode ↗</a>
        : <span className="muted" style={{ fontSize: 15 }}>Write it in Python and NumPy in a notebook or your editor, without ML libraries.</span>}
      <div className="pm-grid">
        <div>
          <h4>Target complexity</h4>
          <div style={{ fontSize: 14 }}>Time <code style={{ color: 'var(--green)' }}>{p.timeComplexity}</code> · Space <code style={{ color: 'var(--green)' }}>{p.spaceComplexity}</code></div>
          <h4>Hints</h4>
          <ol className="hints">{p.hints.slice(0, shown).map((h, i) => <li key={i}>{h}</li>)}</ol>
          {p.hints.length > 0 && <button className="btn sm" disabled={shown >= p.hints.length} onClick={() => setShown((s) => s + 1)}>
            {shown >= p.hints.length ? 'All hints shown' : `Show hint ${shown + 1} of ${p.hints.length}`}</button>}
          <h4>My notes</h4>
          <textarea rows={4} defaultValue={prog.notes[p.id] ?? ''} placeholder="Key insight, edge cases, mistakes to avoid next time…" onChange={(e) => progress.saveNote(p.id, e.target.value)} />
        </div>
        <div>
          <h4>Timer</h4>
          <div className="timer" style={{ color: sec > target * 60 ? 'var(--yellow)' : undefined }}>{formatClock(sec)}</div>
          <div className="muted" style={{ fontSize: 13 }}>Aim for about {target} minutes, as in a real interview</div>
          <div className="controls" style={{ marginTop: 8 }}>
            <button className="btn sm" onClick={() => setRunning((r) => !r)}>{running ? 'Pause' : 'Start'}</button>
            <button className="btn sm" onClick={() => { setRunning(false); setSec(0); }}>Reset</button>
          </div>
          <h4>How did it go?</h4>
          <div className="rate">
            <button className="btn" onClick={() => rate('easy')}>✅ Solved it easily</button>
            <button className="btn" onClick={() => rate('hard')}>😓 Solved it, but struggled</button>
            <button className="btn" onClick={() => rate('fail')}>❌ Couldn't solve it</button>
          </div>
          <div className="say">{msg ?? (item ? `Next review: ${item.due}${progress.isDue(reviewId(p.id)) ? ' (due now)' : ''}` : 'Rate each attempt and this problem comes back for review at the right time (1 → 3 → 7 → 14 → 30 days).')}</div>
          {item && item.h.length > 0 && <>
            <h4>History</h4>
            <div className="muted" style={{ fontSize: 13 }}>{item.h.slice(-6).reverse().map((x, i) => <div key={i}>{x.d} · {RATING_LABEL[x.r]}</div>)}</div>
          </>}
        </div>
      </div>
    </>
  );
}
