import { useEffect, useState } from 'react';

/** Top-level sections. The URL hash (#ds, #ai, …) selects one, which works on GitHub Pages. */
export const SECTIONS = [
  { id: 'home', label: 'Home', short: 'Home' },
  { id: 'ds', label: 'Data Structures', short: 'DS' },
  { id: 'algo', label: 'Algorithms', short: 'Algo' },
  { id: 'problems', label: 'Top Problems', short: 'Problems' },
  { id: 'system', label: 'System Design', short: 'Design' },
  { id: 'behavioral', label: 'Behavioral', short: 'Stories' },
  { id: 'technical', label: 'Technical Q&A', short: 'Q&A' },
  { id: 'ai', label: 'AI & ML', short: 'AI' },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];

function read(): SectionId {
  const h = location.hash.slice(1);
  return (SECTIONS.some((s) => s.id === h) ? h : 'home') as SectionId;
}

export function useRoute(): SectionId {
  const [r, setR] = useState<SectionId>(read);
  useEffect(() => {
    const f = () => { setR(read()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return r;
}

export const go = (id: SectionId) => { location.hash = id; };
