import { CONCEPTS, DESIGNS } from '@ipl/content';
import { Panel, RichText, Tabs, useTab } from '@/components/ui';
import { DesignViewer } from './DesignViewer';
import { ConsistentHashing } from './ConsistentHashing';

const SWE = DESIGNS.filter((d) => d.track === 'swe');
const TABS = [...SWE.map((d) => ({ id: d.id, label: d.name })), { id: 'concepts', label: 'Core Concepts' }];

const FRAMEWORK = [
  ['Clarify requirements (5 min).', 'Functional scope, users and scale, read/write ratio, latency and consistency needs. Write them down.'],
  ['Estimate (3–5 min).', 'QPS, storage and bandwidth. Only to the precision that changes a decision.'],
  ['API and data model (5 min).', 'Key endpoints, entities, access patterns, then SQL vs NoSQL.'],
  ['High-level design (10 min).', 'Boxes and arrows from client to storage. Walk one request end to end.'],
  ['Deep dives (15 min).', 'Bottlenecks, scaling, failure modes, consistency. The interviewer will usually steer you here.'],
  ['Wrap up (2 min).', 'Trade-offs you made, monitoring and alerting, what you would do next.'],
];

export default function SystemDesignPage() {
  const [tab, setTab] = useTab('sd', SWE[0].id);
  return (
    <>
      <h1>System Design</h1>
      <p className="sub">Play a request flow to watch it move through the architecture. Click any component to see why it's there.</p>
      <Tabs tabs={TABS} active={tab} onChange={setTab} label="Design" />
      {SWE.map((d) => <Panel key={d.id} show={tab === d.id}><DesignViewer d={d} /></Panel>)}
      <Panel show={tab === 'concepts'}>
        <div className="card" style={{ marginBottom: 16 }}>
          <h3>A 45-minute interview framework</h3>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14 }}>{FRAMEWORK.map(([a, b]) => <li key={a}><b>{a}</b> {b}</li>)}</ol>
        </div>
        <ConsistentHashing />
        {CONCEPTS.map((c) => <details key={c.title}><summary>{c.title}</summary><p><RichText text={c.body} /></p></details>)}
      </Panel>
    </>
  );
}
