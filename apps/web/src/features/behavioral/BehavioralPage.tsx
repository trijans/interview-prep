import { useEffect, useRef, useState } from 'react';
import { BEHAVIORAL } from '@ipl/content';
import { progress, useProgress, hasStory, type StarStory } from '@/state/progress';
import { formatClock } from '@/lib/dates';

import { ALL_QUESTIONS, selectQuestion, useCurrentQuestion } from './questions';

const PARTS: [keyof StarStory, string, string, string][] = [
  ['s', 'Situation', '~15–20%', 'Context: company, team, scale, timeline. 1–2 sentences.'],
  ['t', 'Task', '~15–20%', 'Your specific responsibility, or the goal and the challenge.'],
  ['a', 'Action', '~60%', 'What YOU did, step by step: decisions, trade-offs, how you handled pushback. This should be most of the answer.'],
  ['r', 'Result', '~15–20%', 'A measurable outcome (%, $, time saved, users) and what you learned or would do differently.'],
];

function Timer() {
  const [left, setLeft] = useState(120);
  const [on, setOn] = useState(false);
  const t = useRef<number>();
  useEffect(() => {
    if (on) t.current = window.setInterval(() => setLeft((x) => { if (x <= 1) { setOn(false); return 0; } return x - 1; }), 1000);
    return () => clearInterval(t.current);
  }, [on]);
  return (
    <div style={{ textAlign: 'right' }}>
      <div className="timer" style={{ color: left <= 0 ? 'var(--red)' : left <= 20 ? 'var(--yellow)' : undefined }}>{formatClock(left)}</div>
      <button className="btn sm" onClick={() => setOn((x) => !x)}>{on ? 'Pause' : 'Start'} timer</button>{' '}
      <button className="btn sm" onClick={() => { setOn(false); setLeft(120); }}>Reset</button>
    </div>
  );
}

export default function BehavioralPage() {
  const prog = useProgress();
  const cur = useCurrentQuestion();
  const q = ALL_QUESTIONS[cur];
  const story = prog.stories[q] ?? {};
  const [copied, setCopied] = useState('');
  const words = Object.values(story).join(' ').trim().split(/\s+/).filter(Boolean).length;
  const copy = async () => {
    const txt = `${q}\n\n` + PARTS.map(([k, l]) => `${l}: ${story[k] ?? ''}`).join('\n\n');
    try { await navigator.clipboard.writeText(txt); setCopied('Copied ✓'); } catch { setCopied('Copy blocked'); }
    setTimeout(() => setCopied(''), 1500);
  };
  return (
    <>
      <h1>Behavioral</h1>
      <p className="sub">Build a bank of STAR stories. Pick a question, write your story, then time yourself saying it aloud (aim for about 2 minutes).</p>
      <div className="b-layout">
        <div className="card qlist">
          {BEHAVIORAL.map((c) => (
            <div key={c.name}>
              <div className="cat">{c.name}</div>
              {c.questions.map((x) => { const i = ALL_QUESTIONS.indexOf(x); return (
                <button key={x} className={i === cur ? 'active' : ''} onClick={() => selectQuestion(i)}>
                  {hasStory(prog.stories[x]) && <span className="chk">✓</span>}{x}
                </button>); })}
            </div>
          ))}
        </div>
        <div>
          <div className="card star">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <h2 style={{ flex: 1, minWidth: 240 }}>{q}</h2>
              <Timer key={q} />
            </div>
            {PARTS.map(([k, label, share, ph]) => (
              <div key={k}>
                <label htmlFor={'star-' + k}>{label} <span>· {share}</span></label>
                <textarea id={'star-' + k} key={q + k} rows={k === 'a' ? 6 : 3} placeholder={ph} defaultValue={story[k] ?? ''}
                  onChange={(e) => { progress.saveStory(q, k, e.target.value); if (e.target.value.trim().length > 20) progress.logOnce('story'); }} />
              </div>
            ))}
            <div className="controls" style={{ marginTop: 12, justifyContent: 'space-between' }}>
              <span className="muted" style={{ fontSize: 14 }}>{words} words ≈ {Math.round((words / 130) * 60)} s spoken (aim for 250–350 words, about 2 minutes)</span>
              <span>
                <button className="btn sm" onClick={copy}>{copied || 'Copy story'}</button>{' '}
                <button className="btn sm" onClick={() => selectQuestion((cur + 1) % ALL_QUESTIONS.length)}>Next question →</button>
              </span>
            </div>
          </div>
          <div className="card" style={{ marginTop: 16 }}>
            <h3>What interviewers listen for</h3>
            <ul style={{ paddingLeft: 18, margin: 0, fontSize: 14 }}>
              <li>Spend about <b>60% on Action</b>. Keep Situation and Task short (about 20%) and finish with Result (about 20%).</li>
              <li>Say <b>"I"</b>, not "we". They are hiring you, not your team.</li>
              <li><b>Put numbers on results</b>: latency down 40%, saved 10 hours a week, unblocked 3 teams.</li>
              <li>For failure questions, show <b>what you learned and what you changed</b> afterwards.</li>
              <li>Prepare 6–8 strong stories that each fit several questions (conflict, ownership, failure, impact).</li>
              <li>Amazon maps questions to its Leadership Principles. Google looks at "Googleyness" and leadership. Meta focuses on conflict, growth and impact.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
