import type { ReactNode } from 'react';
import type { Frame } from '@/lib/playback';
import { Explain, InfoCard, PlayerBar } from '@/components/ui';
import { DS_INFO } from './info';

/** Highlight kinds map to CSS classes on SVG nodes (see `svg .n.*` in global.css). */
export type HlKind = 'cur' | 'cmp' | 'new' | 'found' | 'del' | 'done' | 'out';
export type Hl = Record<string | number, HlKind | undefined>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- generators may `return yield …` for early exits
export type Gen<S> = Generator<Frame<S>, any, unknown>;

/** SVG text helper: centered label. */
export function T({ x, y, children, cls = 't' }: { x: number; y: number; children: ReactNode; cls?: string }) {
  return <text x={x} y={y} className={cls} textAnchor="middle" dominantBaseline="central">{children}</text>;
}

export function Arrow({ x1, y1, x2, y2, rev }: { x1: number; y1: number; x2: number; y2: number; rev?: boolean }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} className={'arrow' + (rev ? ' rev' : '')} markerEnd={`url(#${rev ? 'arrA' : 'arr'})`} />;
}

/**
 * Arrow-head markers, rendered ONCE for the whole app (see App.tsx).
 * Markers inside hidden SVGs don't paint, so they must live in an always-visible SVG.
 */
export function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true"><defs>
      <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path className="mk" d="M0,0 L10,5 L0,10 z" /></marker>
      <marker id="arrA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path className="mkA" d="M0,0 L10,5 L0,10 z" /></marker>
    </defs></svg>
  );
}

/** Layout shared by all data-structure visualizers: controls, player, picture, narration, info card. */
export function DsLayout({ id, controls, viewBox, children, frame }: {
  id: keyof typeof DS_INFO; controls: ReactNode; viewBox: string; children: ReactNode; frame: Frame<unknown>;
}) {
  const info = DS_INFO[id];
  return (
    <div className="viz-layout">
      <div className="card">
        <div className="controls">{controls}</div>
        <PlayerBar />
        <svg className="vizsvg" viewBox={viewBox}>{children}</svg>
        <Explain say={frame.say} code={frame.code} line={frame.line} />
      </div>
      <InfoCard title={info.name} desc={info.desc} rows={info.complexity as unknown as [string, string][]}
        sections={[{ title: 'Interview tips', items: [...info.tips] }, { title: 'Practice', items: [...info.practice] }]} />
    </div>
  );
}

/** Reads a number from an input, or returns a random 1–99 when empty. */
export function readValue(el: HTMLInputElement | null): number {
  const n = parseInt(el?.value ?? '', 10);
  if (el) el.value = '';
  return isNaN(n) ? Math.floor(Math.random() * 99) + 1 : n;
}
