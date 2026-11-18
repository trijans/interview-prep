import { useSyncExternalStore } from 'react';
import { BEHAVIORAL } from '@ipl/content';

export const ALL_QUESTIONS = BEHAVIORAL.flatMap((c) => c.questions);

/* The selected question is shared so other pages (e.g. the AI overview) can jump to one. */
let current = 0;
const subs = new Set<() => void>();
export function selectQuestion(i: number) { current = Math.max(0, i); subs.forEach((f) => f()); }
export const useCurrentQuestion = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => current);
