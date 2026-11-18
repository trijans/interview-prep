import { useRef, useState } from 'react';
import { DECKS, PROBLEMS } from '@ipl/content';
import { Pill, ProgressBar } from '@/components/ui';
import { Icon } from '@/components/icons';
import { progress, useProgress, streak, hasStory } from '@/state/progress';
import { dayKey } from '@/lib/dates';
import { isDue } from '@/lib/srs';
import { settingsStore } from '@/state/settings';
import { ALL_PROBLEMS, openProblem, reviewId } from '@/features/problems/problemModal';
import { ALL_CARDS, cardReviewId, setFlashcardMode } from '@/features/flashcards/cards';
import { ALL_QUESTIONS } from '@/features/behavioral/questions';
import { AccentSwatches, ThemeButton } from './Appearance';
import { startTour } from './Tour';

function fnv(s: string) { let x = 2166136261; for (const c of s) { x ^= c.charCodeAt(0); x = Math.imul(x, 16777619) >>> 0; } return x; }

const AREAS = [
  ['ds', 'Data Structures', 'Stack, queue, linked list, BST, heap and hash table, animated operation by operation.'],
  ['algo', 'Algorithms', '6 sorting algorithms, binary search, BFS/DFS/Dijkstra/A* on a grid you can draw on, and 14 pattern templates.'],
  ['problems', 'Top Problems', `${PROBLEMS.length} frequently asked problems with step-by-step hints, a timer, notes and a spaced-repetition review schedule.`],
  ['system', 'System Design', '5 classic designs with animated request flows, guided step-by-step practice with self-scoring, and core concepts.'],
  ['behavioral', 'Behavioral', `${ALL_QUESTIONS.length} common questions, including AI and ML projects, with a STAR builder, a timer and a saved story bank.`],
  ['technical', 'Technical Q&A', `${ALL_CARDS.length} flashcards in two decks: software engineering fundamentals, and AI & ML.`],
  ['ai', 'AI & ML', 'Visual labs, ML coding problems, AI system designs and an interview guide for AI and ML roles.'],
];

const PLAN = [
  ['Week 1', 'Arrays, hashing, two pointers, sliding window, stacks. Aim for 2–3 problems a day.'],
  ['Week 2', 'Linked lists, trees, heaps, binary search. Watch each visualizer before you solve.'],
  ['Week 3', 'Graphs, backtracking, dynamic programming. Practise one system design every two days.'],
  ['Week 4', 'Mock interviews, 8 behavioral stories, and redo the problems you missed.'],
];

function Heatmap({ act }: { act: Record<string, number> }) {
  const now = new Date(), start = new Date(now);
  start.setDate(start.getDate() - (19 * 7 + now.getDay()));
  const cells: [string, number][] = [];
  for (const d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) cells.push([dayKey(d), act[dayKey(d)] || 0]);
  const active = cells.filter(([, n]) => n).length;
  return <>
    <div className="heat">{cells.map(([k, n]) => <i key={k} className={(n >= 6 ? 'l3' : n >= 3 ? 'l2' : n ? 'l1' : '') + (k === dayKey() ? ' today' : '')} title={`${k}: ${n} activit${n === 1 ? 'y' : 'ies'}`} />)}</div>
    <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>Active on {active} day{active === 1 ? '' : 's'}. Solving, reviewing, writing stories and design practice all count.</div>
  </>;
}

function Backup() {
  const [msg, setMsg] = useState('');
  const file = useRef<HTMLInputElement>(null);
  const exportIt = () => {
    const json = progress.exportBackup();
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url; a.download = `interview-prep-backup-${dayKey()}.json`;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    setMsg(`Backup saved as interview-prep-backup-${dayKey()}.json.`);
  };
  const importIt = async (f: File) => {
    try { const n = progress.importBackup(await f.text()); setMsg(`Imported ${n} items. Reloading…`); setTimeout(() => location.reload(), 700); }
    catch { setMsg('That file isn’t an Interview Prep Lab backup.'); }
  };
  return (
    <div className="card">
      <h3>Back up or move your progress</h3>
      <p className="muted" style={{ fontSize: 14.5, margin: '0 0 12px' }}>Progress is saved in this browser only. Export a backup to keep it safe or move it to another device. Importing replaces the progress here.</p>
      <div className="controls" style={{ margin: 0 }}>
        <button className="btn" onClick={exportIt}>Export backup</button>
        <button className="btn" onClick={() => file.current?.click()}>Import backup</button>
        <input ref={file} type="file" accept=".json,application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importIt(f); e.target.value = ''; }} />
      </div>
      {msg && <div className="say">{msg}</div>}
    </div>
  );
}

export default function HomePage() {
  const prog = useProgress();
  const solved = new Set(prog.solved);
  const pool = PROBLEMS.filter((p) => !solved.has(p.id));
  const list = pool.length ? pool : PROBLEMS;
  const potd = list[fnv(dayKey()) % list.length];
  const dueP = ALL_PROBLEMS.filter((p) => isDue(prog.sr[reviewId(p.id)]));
  const dueC = ALL_CARDS.filter((c) => isDue(prog.sr[cardReviewId(c.id)]));
  const s = streak(prog.act);
  const hr = new Date().getHours();
  const nDue = dueP.length + dueC.length;
  const stories = ALL_QUESTIONS.filter((q) => hasStory(prog.stories[q])).length;
  const stat = (v: number, t: number, k: string) => (
    <div className="stat"><div className="v">{v}<span className="muted" style={{ fontSize: 15, fontWeight: 600 }}> / {t}</span></div><div className="k">{k}</div><ProgressBar value={v} max={t} /></div>
  );
  return (
    <>
      <div className="home-head"><div>
        <h1>{hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening'}</h1>
        <p className="sub">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}. {nDue ? `You have ${nDue} review${nDue > 1 ? 's' : ''} due today.` : 'Start with the problem of the day, or pick an area below.'}</p>
      </div></div>

      <div className="today-grid" id="home-today">
        <div className="card today-main">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0 }}>Today</h2>
            <div className="streak" title="Days in a row with at least one activity">🔥 {s}<span className="muted" style={{ fontSize: 15, fontWeight: 600 }}>day streak</span></div>
          </div>
          <h4>Problem of the day</h4>
          <button className="potd" onClick={() => openProblem(potd.id)}>
            <div className="t">{potd.title}</div>
            <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}><Pill kind={potd.difficulty}>{potd.difficulty}</Pill><Pill>{potd.pattern}</Pill><span className="muted" style={{ fontSize: 14 }}>Hints, timer and notes inside</span></div>
          </button>
          <h4>Due for review</h4>
          {dueP.length
            ? <div className="duelist">{dueP.slice(0, 6).map((p) => <div key={p.id}><button className="linkbtn" onClick={() => openProblem(p.id)}>{p.title}</button> <Pill kind={p.difficulty}>{p.difficulty}</Pill></div>)}
              {dueP.length > 6 && <a href="#problems" className="muted" style={{ fontSize: 14 }}>{dueP.length - 6} more in Top Problems</a>}</div>
            : <div className="muted" style={{ fontSize: 15 }}>Nothing to review yet. When you rate a problem after solving it, it comes back here on the right day.</div>}
          {dueC.length > 0 && <div style={{ marginTop: 12 }}><button className="btn sm" onClick={() => { settingsStore.setDeck(dueC[0].deck); setFlashcardMode('due'); location.hash = 'technical'; }}>Review {dueC.length} due flashcard{dueC.length > 1 ? 's' : ''}</button></div>}
        </div>
        <div className="card">
          <h3>Your progress</h3>
          <div className="stat-row">{stat(prog.solved.length, ALL_PROBLEMS.length, 'coding problems solved')}{stat(prog.known.length, DECKS.reduce((a, d) => a + d.topics.reduce((b, t) => b + t.cards.length, 0), 0), 'flashcards known')}{stat(stories, ALL_QUESTIONS.length, 'STAR stories written')}</div>
          <h4 style={{ marginTop: 20 }}>Activity, last 20 weeks</h4>
          <Heatmap act={prog.act} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>A 4-week plan</h3>
        <ul className="plan">{PLAN.map(([w, t]) => <li key={w}><b>{w}</b><span>{t}</span></li>)}</ul>
      </div>

      <h2 style={{ margin: '28px 0 14px' }}>Practice areas</h2>
      <div className="cards">
        {AREAS.map(([id, t, d]) => (
          <div key={id} className="card go" role="link" tabIndex={0} onClick={() => (location.hash = id)} onKeyDown={(e) => e.key === 'Enter' && (location.hash = id)}>
            <div className="em"><Icon name={id} /></div>
            <h3 style={{ marginTop: 12 }}>{t}</h3>
            <p className="muted" style={{ fontSize: 15, margin: 0 }}>{d}</p>
          </div>
        ))}
      </div>

      <div className="home-row" style={{ marginTop: 16 }}>
        <div className="card" id="appearance">
          <h3>Appearance</h3>
          <p className="muted" style={{ fontSize: 14.5, margin: '0 0 12px' }}>Choose light or dark mode and an accent colour. New here? Take the quick tour.</p>
          <div className="controls" style={{ margin: 0, gap: 14 }}><ThemeButton /><AccentSwatches /><button className="btn sm" onClick={startTour}>Take the tour</button></div>
        </div>
        <Backup />
      </div>
    </>
  );
}
