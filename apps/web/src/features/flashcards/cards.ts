import { useSyncExternalStore } from 'react';
import { DECKS } from '@ipl/content';

export interface Card { id: string; topic: string; q: string; a: string; deck: 'swe' | 'ai' }

/** Card ids are "Topic:index", which matches the format older versions saved. */
export const ALL_CARDS: Card[] = DECKS.flatMap((d) => d.topics.flatMap((t) => t.cards.map((c, i) => ({ id: `${t.name}:${i}`, topic: t.name, q: c.q, a: c.a, deck: d.id }))));
export const cardReviewId = (id: string) => 'f:' + id;

export type CardMode = 'all' | 'unknown' | 'due';
/* Mode is shared so Home can open "due" cards directly. */
let mode: CardMode = 'all';
const subs = new Set<() => void>();
export function setFlashcardMode(m: CardMode) { mode = m; subs.forEach((f) => f()); }
export const useFlashcardMode = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => mode);
