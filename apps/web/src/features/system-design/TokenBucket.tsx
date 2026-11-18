import { useEffect, useRef, useState } from 'react';

/** Rate limiting demo: capacity 5 tokens, refilled at 1 token per second. */
export function TokenBucket() {
  const cap = 5;
  const tokens = useRef(cap), last = useRef(performance.now());
  const [, force] = useState(0);
  const [log, setLog] = useState<{ ok: boolean; text: string }[]>([]);
  const refill = () => { const now = performance.now(); tokens.current = Math.min(cap, tokens.current + (now - last.current) / 1000); last.current = now; };
  useEffect(() => { const t = setInterval(() => { refill(); force((x) => x + 1); }, 100); return () => clearInterval(t); }, []);
  const send = (n: number) => {
    const out: { ok: boolean; text: string }[] = [];
    for (let i = 0; i < n; i++) {
      refill();
      const t = new Date().toLocaleTimeString();
      if (tokens.current >= 1) { tokens.current -= 1; out.push({ ok: true, text: `${t}  200 OK      (${tokens.current.toFixed(1)} tokens left)` }); }
      else out.push({ ok: false, text: `${t}  429 Too Many Requests` });
    }
    setLog((l) => [...out.reverse(), ...l].slice(0, 30));
  };
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h3>Try it: token bucket (capacity 5, refill 1 token/s)</h3>
      <div className="tb-tokens">
        {Array.from({ length: cap }, (_, i) => <i key={i} className={i < Math.floor(tokens.current) ? 'on' : ''} />)}
        <span className="muted" style={{ fontSize: 13, alignSelf: 'center' }}>{tokens.current.toFixed(1)} tokens</span>
      </div>
      <div className="controls"><button className="btn pri" onClick={() => send(1)}>Send request</button><button className="btn" onClick={() => send(8)}>Burst of 8</button></div>
      <div className="tb-log">{log.map((l, i) => <div key={i} className={l.ok ? 'ok' : 'bad'}>{l.text}</div>)}</div>
    </div>
  );
}
