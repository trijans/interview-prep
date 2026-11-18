import { Panel, Tabs, useTab } from '@/components/ui';
import { StackViz, QueueViz } from './stack-queue';
import { LinkedListViz } from './linked-list';
import { BstViz } from './bst';
import { HeapViz, HashViz } from './heap-hash';

const TABS = [
  { id: 'stack', label: 'Stack', C: StackViz },
  { id: 'queue', label: 'Queue', C: QueueViz },
  { id: 'll', label: 'Linked List', C: LinkedListViz },
  { id: 'bst', label: 'Binary Search Tree', C: BstViz },
  { id: 'heap', label: 'Min-Heap', C: HeapViz },
  { id: 'hash', label: 'Hash Table', C: HashViz },
];

export default function DataStructuresPage() {
  const [tab, setTab] = useTab('ds', 'stack');
  return (
    <>
      <h1>Data Structures</h1>
      <p className="sub">Run each operation and watch what happens. Leave the value box empty to use a random value.</p>
      <Tabs tabs={TABS} active={tab} onChange={setTab} label="Data structure" />
      {TABS.map(({ id, C }) => <Panel key={id} show={tab === id}><C /></Panel>)}
    </>
  );
}
