import { useRef, useState } from 'react';
import { player, useStepper, type Frame } from '@/lib/playback';
import { Explain, InfoCard, PlayerBar } from '@/components/ui';
import { PATH_CODE, PATH_INFO, type PathAlgo } from './info';
import { COLS, ROWS, EMPTY, WALL, WEIGHT, key, costOf, search, narrate, type Cell, type Visit } from './search';

/** 0 = untouched, 1 = visited, 2 = on the final path */
interface Overlay { status: Uint8Array; cur: number; visited: number; len: number | null; cost: number | null }
type DrawMode = 'wall' | 'weight' | 'erase' | 'start' | 'end';
const LINES: Record<PathAlgo, number[]> = { bfs: [2, 4, 5, 6], dfs: [2, 5, 6], dijkstra: [2, 4, 5, 6], astar: [2, 4, 5, 6] };
const NOTES: Record<PathAlgo, string> = {
  bfs: 'BFS guarantees the fewest steps, but not the lowest cost when some cells cost more.',
  dfs: 'DFS found *a* path, but it is usually not the shortest one.',
  dijkstra: 'Dijkstra found the cheapest path.',
  astar: 'A* found the cheapest path while visiting fewer cells than Dijkstra.',
};
const blank = (): Overlay => ({ status: new Uint8Array(ROWS * COLS), cur: -1, visited: 0, len: null, cost: null });

export function PathfindingViz() {
  const [alg, setAlg] = useState<PathAlgo>('bfs');
  const [mode, setMode] = useState<DrawMode>('wall');
  const [grid, setGrid] = useState(() => new Uint8Array(ROWS * COLS));
  const [start, setStart] = useState<Cell>([8, 4]);
  const [end, setEnd] = useState<Cell>([8, 30]);
  const drawing = useRef(false);
  const st = useStepper<Overlay>(blank(), 'Click and drag on the grid to draw walls, then press **Run**. Green is the start and red is the end.', PATH_CODE.bfs);
  const info = PATH_INFO[alg];

  const clearPath = () => st.show(blank(), undefined, PATH_CODE[alg], -1);
  const apply = (r: number, c: number) => {
    if (st.busy) return;
    if ((r === start[0] && c === start[1]) || (r === end[0] && c === end[1])) return;
    const g = new Uint8Array(grid);
    if (mode === 'start') setStart([r, c]);
    else if (mode === 'end') setEnd([r, c]);
    g[r * COLS + c] = mode === 'wall' ? WALL : mode === 'weight' ? WEIGHT : EMPTY;
    if (mode === 'start' || mode === 'end') g[r * COLS + c] = EMPTY;
    setGrid(g);
  };
  const randomize = (kind: 'walls' | 'weights') => {
    if (st.busy) return;
    const g = new Uint8Array(grid);
    for (let i = 0; i < g.length; i++) {
      if (kind === 'walls') g[i] = Math.random() < 0.28 ? WALL : g[i] === WEIGHT ? WEIGHT : EMPTY;
      else if (g[i] !== WALL && Math.random() < 0.25) g[i] = WEIGHT;
    }
    g[key(start)] = EMPTY; g[key(end)] = EMPTY;
    setGrid(g); clearPath();
  };

  const run = () => st.play(function* (): Generator<Frame<Overlay>> {
    const prev = new Map<number, Cell>(), it = search(alg, grid, start, end, prev), status = new Uint8Array(ROWS * COLS);
    let visited = 0, res: IteratorResult<Visit, boolean>;
    yield { state: blank(), code: PATH_CODE[alg], line: 0, say: info.intro, hold: 1.5 };
    while (!(res = it.next()).done) {
      const v = res.value;
      status[key(v.u)] = 1;
      visited++;
      const pace = player.get().pace;
      const hold = pace === 'step' ? 1 : pace === 'slow' ? (visited < 10 ? 0.7 : 0.05) : pace === 'normal' ? 0.03 : 0.02;
      yield { state: { status: new Uint8Array(status), cur: key(v.u), visited, len: null, cost: null }, line: v.end ? 3 : LINES[alg], hold,
        say: narrate(alg, v) + (pace === 'slow' && visited === 10 ? ' (Speeding up now. Choose "Step by step" to follow every cell.)' : '') };
    }
    if (!res.value) return yield { state: { status, cur: -1, visited, len: null, cost: null }, line: 1, hold: 0, say: 'The search ran out of cells before reaching the end: there is no path, because the end is walled off.' };
    const path: Cell[] = [];
    let cur: Cell | undefined = end;
    while (cur && key(cur) !== key(start)) { path.push(cur); cur = prev.get(key(cur)); }
    path.reverse();
    yield { state: { status: new Uint8Array(status), cur: -1, visited, len: null, cost: null }, line: -1, hold: 1.2, say: 'Found the end. Every cell remembered which cell it was reached from, so follow those links backwards from the end to the start. That is the path (yellow).' };
    let cost = 0;
    for (const c of path) { cost += costOf(grid, c); status[key(c)] = 2; yield { state: { status: new Uint8Array(status), cur: -1, visited, len: null, cost: null }, hold: 0.01 }; }
    yield { state: { status, cur: -1, visited, len: path.length, cost }, hold: 0, say: `${info.name} visited **${visited}** cells. Path: ${path.length} steps, cost ${cost}. ${NOTES[alg]}` };
  });

  const { status, cur, visited, len, cost } = st.state;
  return (
    <div className="viz-layout">
      <div className="card">
        <div className="controls">
          <select value={alg} aria-label="Algorithm" onChange={(e) => { const a = e.target.value as PathAlgo; setAlg(a); st.show(st.current(), undefined, PATH_CODE[a], -1); }}>
            <option value="bfs">BFS</option><option value="dfs">DFS</option><option value="dijkstra">Dijkstra</option><option value="astar">A*</option>
          </select>
          <button className="btn pri" onClick={run} disabled={st.busy}>▶ Run</button>
          <select value={mode} aria-label="Draw mode" onChange={(e) => setMode(e.target.value as DrawMode)}>
            <option value="wall">Draw: walls</option><option value="weight">Draw: weights (cost 5)</option><option value="erase">Erase</option><option value="start">Move start</option><option value="end">Move end</option>
          </select>
          <button className="btn" onClick={() => randomize('walls')}>Random walls</button>
          <button className="btn" onClick={() => randomize('weights')}>Random weights</button>
          <button className="btn" onClick={() => !st.busy && clearPath()}>Clear path</button>
          <button className="btn" onClick={() => { if (!st.busy) { setGrid(new Uint8Array(ROWS * COLS)); clearPath(); } }}>Clear all</button>
        </div>
        <PlayerBar />
        <div className="grid" onPointerDown={() => { drawing.current = true; if (!st.busy) clearPath(); }} onPointerUp={() => (drawing.current = false)} onPointerLeave={() => (drawing.current = false)}>
          {Array.from({ length: ROWS * COLS }, (_, i) => {
            const r = Math.floor(i / COLS), c = i % COLS;
            const cls = ['cell', grid[i] === WALL && 'wall', grid[i] === WEIGHT && 'weight', status[i] === 1 && 'visited', status[i] === 2 && 'path', i === cur && 'cur',
              r === start[0] && c === start[1] && 'start', r === end[0] && c === end[1] && 'end'].filter(Boolean).join(' ');
            return <div key={i} className={cls} onPointerDown={() => apply(r, c)} onPointerEnter={() => drawing.current && mode !== 'start' && mode !== 'end' && apply(r, c)} />;
          })}
        </div>
        <div className="legend"><span style={{ ['--c' as string]: 'var(--green)' }}>start</span><span style={{ ['--c' as string]: 'var(--red)' }}>end</span><span style={{ ['--c' as string]: 'var(--wall)' }}>wall</span><span style={{ ['--c' as string]: 'var(--weight)' }}>weight (cost 5)</span><span style={{ ['--c' as string]: 'var(--visited)' }}>visited</span><span style={{ ['--c' as string]: 'var(--yellow)' }}>path</span></div>
        <div className="stats"><span>Visited: <b>{visited}</b></span><span>Path length: <b>{len ?? '–'}</b></span><span>Path cost: <b>{cost ?? '–'}</b></span></div>
        <Explain say={st.frame.say} code={st.frame.code ?? PATH_CODE[alg]} line={st.frame.line} />
      </div>
      <InfoCard title={info.name} desc={info.desc} rows={[['Time', info.time]]}
        sections={[{ title: 'Use it for', items: [info.useFor] }, { title: 'Try this', items: ['Add random walls, then compare how many cells BFS and A* visit.', 'Add weights. BFS goes straight through them, while Dijkstra goes around.'] }]} />
    </div>
  );
}
