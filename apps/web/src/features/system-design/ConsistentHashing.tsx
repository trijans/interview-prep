import { useState } from 'react';
import { RichText } from '@/components/ui';

const COLORS = ['#4C72F0', '#16A075', '#D69214', '#E0564B', '#8B5FE6', '#1597AD', '#E5772C', '#8792A6'];
const KEYS = Array.from({ length: 24 }, (_, i) => 'user' + (i + 1));

function fnv(s: string): number {
  let x = 2166136261;
  for (const c of s) { x ^= c.charCodeAt(0); x = Math.imul(x, 16777619) >>> 0; }
  return x;
}
const angle = (s: string) => (fnv(s) % 3600) / 10;

interface Point { a: number; s: string; si: number }
function ringPoints(servers: string[], virtual: boolean): Point[] {
  const v = virtual ? 4 : 1, pts: Point[] = [];
  servers.forEach((s, si) => { for (let j = 0; j < v; j++) pts.push({ a: angle(s + '#' + j), s, si }); });
  return pts.sort((x, y) => x.a - y.a);
}
function owner(pts: Point[], k: string): Point { const a = angle(k); return pts.find((p) => p.a >= a) ?? pts[0]; }

/** Shows why consistent hashing moves only ~1/N keys when servers change. */
export function ConsistentHashing() {
  const [servers, setServers] = useState(['A', 'B', 'C']);
  const [virtual, setVirtual] = useState(false);
  const [moved, setMoved] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState('24 keys across 3 servers.');
  const pts = ringPoints(servers, virtual);
  const change = (next: string[]) => {
    const before = Object.fromEntries(KEYS.map((k) => [k, owner(pts, k).s]));
    const np = ringPoints(next, virtual);
    const m = new Set(KEYS.filter((k) => owner(np, k).s !== before[k]));
    const modMoved = KEYS.filter((k) => fnv(k) % servers.length !== fnv(k) % next.length).length;
    setServers(next); setMoved(m);
    setMsg(`**${m.size} of 24** keys moved (outlined). With \`hash % N\`, going from ${servers.length} to ${next.length} servers would move **${modMoved} of 24**.`);
  };
  const cx = 180, cy = 180, R = 135, P = (a: number, r = R) => [cx + r * Math.sin((a * Math.PI) / 180), cy - r * Math.cos((a * Math.PI) / 180)];
  const load: Record<string, number> = {};
  KEYS.forEach((k) => { const o = owner(pts, k).s; load[o] = (load[o] || 0) + 1; });
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h3>Try it: consistent hashing</h3>
      <div className="ring-wrap">
        <svg viewBox="0 0 360 360" className="vizsvg">
          <circle cx={cx} cy={cy} r={R} fill="none" style={{ stroke: 'var(--line)' }} strokeWidth={10} />
          {KEYS.map((k) => { const [x, y] = P(angle(k)); return <circle key={k} cx={x} cy={y} r={5} fill={COLORS[owner(pts, k).si % 8]} style={{ stroke: moved.has(k) ? 'var(--text)' : 'none' }} strokeWidth={2} />; })}
          {pts.map((p, i) => { const [x, y] = P(p.a), [lx, ly] = P(p.a, R + 22); return <g key={i}>
            <rect x={x - 9} y={y - 9} width={18} height={18} rx={4} fill={COLORS[p.si % 8]} style={{ stroke: 'var(--panel)' }} strokeWidth={2} />
            <text x={lx} y={ly} className="ts" textAnchor="middle" dominantBaseline="central">{p.s}</text></g>; })}
          <text x={cx} y={cy - 8} className="lbl" textAnchor="middle">hash ring</text>
          <text x={cx} y={cy + 10} className="lbl" textAnchor="middle">■ server ● key</text>
        </svg>
        <div>
          <p style={{ fontSize: 14, marginTop: 0 }}>Servers and keys are hashed onto the same ring. Each key belongs to the first server clockwise from it. When a server is added or removed, only about <b>1/N</b> of keys move. With <code>hash % N</code>, almost all of them would.</p>
          <div className="controls">
            <button className="btn pri" onClick={() => servers.length < 8 && change([...servers, 'ABCDEFGH'[servers.length]])}>Add server</button>
            <button className="btn" onClick={() => servers.length > 1 && change(servers.slice(0, -1))}>Remove server</button>
            <label className="muted" style={{ fontSize: 14 }}><input type="checkbox" checked={virtual} onChange={(e) => { setVirtual(e.target.checked); setMoved(new Set()); setMsg('Each server now owns several points on the ring, so the load is spread more evenly.'); }} /> Virtual nodes (×4)</label>
          </div>
          <div className="say"><RichText text={msg} /></div>
          <div style={{ marginTop: 10, fontSize: 14 }}><b>Keys per server:</b> {servers.map((s, i) => <span key={s} style={{ color: COLORS[i % 8] }}>{s}: {load[s] || 0}{i < servers.length - 1 ? ' · ' : ''}</span>)}</div>
        </div>
      </div>
    </div>
  );
}
