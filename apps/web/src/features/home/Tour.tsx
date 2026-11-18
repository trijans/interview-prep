import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { settingsStore } from '@/state/settings';

const STEPS = [
  { target: null, title: 'Welcome to Interview Prep Lab', body: 'A quick tour of where everything is. It takes about 20 seconds, and you can skip it at any time.' },
  { target: '#home-today', title: 'Start here every day', body: 'Your problem of the day, your streak, and anything that is due for review today.' },
  { target: '#nav', title: 'Practice areas', body: 'Data structures, algorithms, top problems, system design, behavioral stories and technical flashcards.' },
  { target: '#nav [data-go=ai]', title: 'AI & ML track', body: 'Visual labs, ML coding problems, AI system designs and flashcards for AI engineer and ML engineer interviews.' },
  { target: '#appearance', title: 'Make it yours', body: 'Switch between light and dark mode and pick an accent colour. Your progress is saved in this browser.' },
];

let open = false;
const subs = new Set<() => void>();
const setOpen = (v: boolean) => { open = v; subs.forEach((f) => f()); };
export function startTour() { if (location.hash && location.hash !== '#home') location.hash = 'home'; setOpen(true); }

/** First-visit guided tour: spotlights one element at a time. */
export function Tour() {
  const isOpen = useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => open);
  const [i, setI] = useState(0);
  const [, relayout] = useState(0);
  const pop = useRef<HTMLDivElement>(null);
  const end = () => { setOpen(false); setI(0); settingsStore.setToured(true); };

  useEffect(() => {
    // Open on the first visit, but only if the person is still on Home.
    if (settingsStore.get().toured) return;
    const t = setTimeout(() => { if (!location.hash || location.hash === '#home') setOpen(true); }, 800);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!isOpen) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && end();
    const r = () => relayout((x) => x + 1);
    // Leaving Home hides the tour (without marking it as seen).
    const h = () => { if (location.hash && location.hash !== '#home') { setOpen(false); setI(0); } };
    document.addEventListener('keydown', k); window.addEventListener('resize', r); window.addEventListener('hashchange', h);
    return () => { document.removeEventListener('keydown', k); window.removeEventListener('resize', r); window.removeEventListener('hashchange', h); };
  }, [isOpen]);
  useLayoutEffect(() => { if (isOpen) relayout((x) => x + 1); }, [isOpen, i]);

  if (!isOpen) return null;
  const step = STEPS[i];
  const el = step.target ? (document.querySelector(step.target) as HTMLElement | null) : null;
  const pw = pop.current?.offsetWidth ?? 340, ph = pop.current?.offsetHeight ?? 180;
  let hl = { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 }, x = (innerWidth - pw) / 2, y = (innerHeight - ph) / 2;
  if (el && el.offsetParent !== null) {
    el.scrollIntoView({ block: 'nearest' });
    const r = el.getBoundingClientRect(), pad = 6;
    hl = { left: r.left - pad, top: r.top - pad, width: r.width + 2 * pad, height: r.height + 2 * pad };
    if (r.right + pw + 24 < innerWidth) { x = r.right + 18; y = Math.min(Math.max(12, r.top), innerHeight - ph - 12); }
    else if (r.bottom + ph + 24 < innerHeight) { x = Math.min(Math.max(12, r.left), innerWidth - pw - 12); y = r.bottom + 16; }
    else { x = Math.min(Math.max(12, r.left), innerWidth - pw - 12); y = Math.max(12, r.top - ph - 16); }
  }
  return (
    <div id="tour" role="dialog" aria-modal="true" aria-labelledby="tour-h" onClick={(e) => e.target === e.currentTarget && end()}>
      <div className="tour-hl" style={hl} />
      <div className="tour-pop" ref={pop} style={{ left: x, top: y }}>
        <h3 id="tour-h">{step.title}</h3>
        <p>{step.body}</p>
        <div className="tour-foot">
          <div className="tour-dots">{STEPS.map((_, j) => <i key={j} className={j === i ? 'on' : ''} />)}</div>
          <span>
            <button className="btn sm" onClick={end}>Skip</button>{' '}
            <button className="btn sm pri" autoFocus onClick={() => (i + 1 >= STEPS.length ? end() : setI(i + 1))}>{i === STEPS.length - 1 ? 'Finish' : 'Next'}</button>
          </span>
        </div>
      </div>
    </div>
  );
}
