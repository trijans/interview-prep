import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { SECTIONS, useRoute, type SectionId } from './routes';
import { Icon } from '@/components/icons';
import { player } from '@/lib/playback';
import { AccentSwatches, ThemeButton } from '@/features/home/Appearance';
import { ProblemModalHost } from '@/features/problems/problemModal';
import { Tour } from '@/features/home/Tour';
import { SvgDefs } from '@/features/data-structures/shared';

// Each page is its own chunk, so the first load stays small as content grows.
const PAGES: Record<SectionId, React.LazyExoticComponent<() => JSX.Element>> = {
  home: lazy(() => import('@/features/home/HomePage')),
  ds: lazy(() => import('@/features/data-structures/DataStructuresPage')),
  algo: lazy(() => import('@/features/algorithms/AlgorithmsPage')),
  problems: lazy(() => import('@/features/problems/ProblemsPage')),
  system: lazy(() => import('@/features/system-design/SystemDesignPage')),
  behavioral: lazy(() => import('@/features/behavioral/BehavioralPage')),
  technical: lazy(() => import('@/features/flashcards/FlashcardsPage')),
  ai: lazy(() => import('@/features/ai/AiPage')),
};

export default function App() {
  const route = useRoute();
  useEffect(() => { player.interrupt(); }, [route]);
  return (
    <div className="app">
      <nav id="nav" aria-label="Sections">
        <div className="brand"><div className="logo"><Icon name="logo" /></div>Interview Prep Lab</div>
        {SECTIONS.map((s) => (
          <button key={s.id} data-go={s.id} className={route === s.id ? 'active' : ''} onClick={() => { location.hash = s.id; }}>
            <Icon name={s.id} /><span className="lbl">{s.label}</span><span className="short">{s.short}</span>
          </button>
        ))}
        <div className="navfoot"><AccentSwatches /><ThemeButton /></div>
      </nav>
      <main>
        {SECTIONS.map(({ id }) => {
          const Page = PAGES[id];
          // Pages stay mounted after the first visit so their state survives navigation.
          return <VisitedPage key={id} active={route === id}><Page /></VisitedPage>;
        })}
      </main>
      <SvgDefs />
      <ProblemModalHost />
      <Tour />
    </div>
  );
}

function VisitedPage({ active, children }: { active: boolean; children: ReactNode }) {
  const [visited, setVisited] = useState(active);
  useEffect(() => { if (active) setVisited(true); }, [active]);
  if (!visited) return null;
  return <section hidden={!active}><Suspense fallback={<p className="muted">Loading…</p>}>{children}</Suspense></section>;
}
