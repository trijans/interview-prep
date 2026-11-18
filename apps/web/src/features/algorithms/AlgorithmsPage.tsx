import { PATTERNS } from '@ipl/content';
import { Panel, Pill, Tabs, useTab } from '@/components/ui';
import { SortingViz } from './sorting/SortingViz';
import { BinarySearchViz } from './binary-search/BinarySearchViz';
import { PathfindingViz } from './pathfinding/PathfindingViz';

const TABS = [
  { id: 'sort', label: 'Sorting' },
  { id: 'bs', label: 'Binary Search' },
  { id: 'graph', label: 'Graph / Pathfinding' },
  { id: 'patterns', label: 'Pattern Cheat Sheet' },
];

export default function AlgorithmsPage() {
  const [tab, setTab] = useTab('algo', 'sort');
  return (
    <>
      <h1>Algorithms</h1>
      <p className="sub">Sorting, binary search and graph search, step by step, plus templates for the {PATTERNS.length} patterns that cover most coding rounds.</p>
      <Tabs tabs={TABS} active={tab} onChange={setTab} label="Algorithm" />
      <Panel show={tab === 'sort'}><SortingViz /></Panel>
      <Panel show={tab === 'bs'}><BinarySearchViz /></Panel>
      <Panel show={tab === 'graph'}><PathfindingViz /></Panel>
      <Panel show={tab === 'patterns'}>
        <div className="cards">
          {PATTERNS.map((p) => (
            <div className="card" key={p.name}>
              <h3>{p.name}</h3>
              <p className="muted" style={{ fontSize: 14, margin: 0 }}>{p.signal}</p>
              <details style={{ marginTop: 10, background: 'transparent' }}><summary>Python template</summary><pre>{p.template}</pre></details>
              <div>{p.problems.map((x) => <Pill key={x}>{x}</Pill>)}</div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
