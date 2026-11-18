import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { PACES, player, usePlayer, type Pace } from '@/lib/playback';

/** Renders **bold**, *italic* and `code` from content strings. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') ? <b key={i}>{p.slice(2, -2)}</b>
        : p.startsWith('`') ? <code key={i}>{p.slice(1, -1)}</code>
        : p.startsWith('*') && p.length > 2 ? <i key={i}>{p.slice(1, -1)}</i>
        : <Fragment key={i}>{p}</Fragment>,
      )}
    </>
  );
}

export interface TabDef { id: string; label: string }

/** Segmented tabs. Panels stay mounted (state survives), only the active one is visible. */
export function Tabs({ tabs, active, onChange, label }: { tabs: TabDef[]; active: string; onChange: (id: string) => void; label?: string }) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={t.id === active} className={t.id === active ? 'active' : ''}
          onClick={() => { if (t.id !== active) { player.interrupt(); onChange(t.id); } }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Panel({ show, children }: { show: boolean; children: ReactNode }) {
  return <div className="pane" hidden={!show}>{children}</div>;
}

/** Remembers the active tab across re-renders and page visits. */
export function useTab(key: string, first: string) {
  const [t, setT] = useState<string>(() => sessionStorage.getItem('tab_' + key) || first);
  return [t, (id: string) => { sessionStorage.setItem('tab_' + key, id); setT(id); }] as const;
}

export function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" role="dialog" aria-modal="true">
        <button className="modal-x" aria-label="Close" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );
}

/** Pace / pause / next-step controls shared by every visualizer. */
export function PlayerBar() {
  const p = usePlayer();
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.key === 'ArrowRight' || e.key === 'n') && player.get().waiting && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement as HTMLElement)?.tagName)) {
        e.preventDefault();
        player.next();
      }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, []);
  return (
    <div className="player" role="group" aria-label="Animation controls">
      <span className="muted pl-l">Pace</span>
      <div className="seg">
        {(Object.keys(PACES) as Pace[]).map((k) => (
          <button key={k} className={p.pace === k ? 'active' : ''} onClick={() => player.setPace(k)}>{PACES[k][0]}</button>
        ))}
      </div>
      {p.pace !== 'step' && <button className="btn sm" onClick={player.togglePause}>{p.paused ? 'Resume' : 'Pause'}</button>}
      <button className={'btn sm' + (p.waiting ? ' pri' : '')} disabled={!p.waiting} onClick={player.next}>Next step ▸</button>
      <span className="muted pl-hint">{p.waiting ? 'Press Next step (or the → key) to continue' : p.pace === 'step' ? 'Each move waits for you' : ''}</span>
    </div>
  );
}

/** "What's happening" narration next to the pseudocode, with the running line highlighted. */
export function Explain({ say, code, line }: { say?: ReactNode; code?: string[]; line?: number | number[] }) {
  const on = new Set(Array.isArray(line) ? line : line == null ? [] : [line]);
  return (
    <div className="explain">
      <div className="say" aria-live="polite">{typeof say === 'string' ? <RichText text={say} /> : say}</div>
      {code && (
        <pre className="pseudo">
          <span className="ttl">Pseudocode</span>
          {code.map((l, i) => <span key={i} className={on.has(i) ? 'on' : ''}>{l || ' '}</span>)}
        </pre>
      )}
    </div>
  );
}

export function Pill({ children, kind }: { children: ReactNode; kind?: string }) {
  return <span className={'pill' + (kind ? ' ' + kind : '')}>{children}</span>;
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  return <div className="bar-bg"><div className="bar-fg" style={{ width: `${max ? (value / max) * 100 : 0}%` }} /></div>;
}

/** Side card with title, description, complexity table and lists. */
export function InfoCard({ title, desc, rows, sections }: { title: string; desc?: ReactNode; rows?: [string, string][]; sections?: { title: string; items: ReactNode[] }[] }) {
  return (
    <div className="card side">
      <h3>{title}</h3>
      {desc && <p>{desc}</p>}
      {rows && <table className="cx"><tbody>{rows.map(([a, b]) => <tr key={a}><td>{a}</td><td><code>{b}</code></td></tr>)}</tbody></table>}
      {sections?.map((s) => (
        <Fragment key={s.title}>
          <h4>{s.title}</h4>
          <ul>{s.items.map((it, i) => <li key={i}>{typeof it === 'string' ? <RichText text={it} /> : it}</li>)}</ul>
        </Fragment>
      ))}
    </div>
  );
}
