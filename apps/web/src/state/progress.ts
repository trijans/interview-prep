import { useSyncExternalStore } from 'react';
import { localStore, type KeyValueStore } from '@/lib/storage';
import { dayKey } from '@/lib/dates';
import { schedule, isDue, type Rating, type ReviewItem } from '@/lib/srs';

/**
 * All user progress lives in one small store.
 *
 * Components read it with `useProgress()` and change it only through the
 * actions below. Persistence goes through a `KeyValueStore`, so swapping
 * localStorage for a backend API later touches one place.
 */
export interface StarStory { s?: string; t?: string; a?: string; r?: string }
export interface DesignPractice { step: number; ans: Record<number, string>; chk: Record<number, boolean[]>; rev: Record<number, boolean> }

export interface ProgressState {
  solved: string[];
  sr: Record<string, ReviewItem>;
  known: string[];
  stories: Record<string, StarStory>;
  notes: Record<string, string>;
  act: Record<string, number>;
  actonce: Record<string, string>;
  sdp: Record<string, DesignPractice>;
}

function load(store: KeyValueStore): ProgressState {
  return {
    // Older versions stored LeetCode ids as numbers.
    solved: store.get<(string | number)[]>('solved', []).map(String),
    sr: store.get('sr', {}),
    known: store.get('known', []),
    stories: store.get('stories', {}),
    notes: store.get('notes', {}),
    act: store.get('act', {}),
    actonce: store.get('actonce', {}),
    sdp: store.get('sdp', {}),
  };
}

function createProgressStore(store: KeyValueStore) {
  let state = load(store);
  const listeners = new Set<() => void>();
  const commit = (patch: Partial<ProgressState>) => {
    state = { ...state, ...patch };
    for (const k of Object.keys(patch) as (keyof ProgressState)[]) store.set(k, state[k]);
    listeners.forEach((l) => l());
  };
  const logActivity = () => {
    const k = dayKey();
    commit({ act: { ...state.act, [k]: (state.act[k] || 0) + 1 } });
  };

  return {
    get: () => state,
    subscribe(l: () => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    logActivity,
    /** Counts at most once per day for the given tag. */
    logOnce(tag: string) {
      if (state.actonce[tag] === dayKey()) return;
      commit({ actonce: { ...state.actonce, [tag]: dayKey() } });
      logActivity();
    },
    setSolved(id: string, on: boolean) {
      const s = new Set(state.solved);
      if (on) s.add(id);
      else s.delete(id);
      commit({ solved: [...s] });
    },
    /** Rate an attempt; schedules the next review. Returns days until it is due. */
    rate(reviewId: string, rating: Rating): number {
      const { item, days } = schedule(state.sr[reviewId], rating);
      commit({ sr: { ...state.sr, [reviewId]: item } });
      logActivity();
      return days;
    },
    setKnown(cardId: string, on: boolean) {
      const s = new Set(state.known);
      if (on) s.add(cardId);
      else s.delete(cardId);
      commit({ known: [...s] });
    },
    saveStory(question: string, part: keyof StarStory, text: string) {
      commit({ stories: { ...state.stories, [question]: { ...state.stories[question], [part]: text } } });
    },
    saveNote(id: string, text: string) {
      commit({ notes: { ...state.notes, [id]: text } });
    },
    savePractice(designId: string, p: DesignPractice) {
      commit({ sdp: { ...state.sdp, [designId]: p } });
    },
    isDue: (reviewId: string) => isDue(state.sr[reviewId]),
    /** Export everything this app stores, for backup. */
    exportBackup(): string {
      const data: Record<string, string> = {};
      for (const k of store.keys()) data[k] = store.raw(k) ?? '';
      return JSON.stringify({ app: 'interview-prep-lab', version: 2, exported: new Date().toISOString(), data });
    },
    importBackup(json: string): number {
      const o = JSON.parse(json);
      if (o.app !== 'interview-prep-lab' || !o.data) throw new Error('Not an Interview Prep Lab backup');
      let n = 0;
      for (const [k, v] of Object.entries(o.data as Record<string, string>))
        if (k.startsWith('ipl_')) {
          store.setRaw(k, v);
          n++;
        }
      state = load(store);
      listeners.forEach((l) => l());
      return n;
    },
  };
}

export const progress = createProgressStore(localStore);

export function useProgress(): ProgressState {
  return useSyncExternalStore(progress.subscribe, progress.get);
}

export function hasStory(s: StarStory | undefined): boolean {
  return !!s && Object.values(s).some((v) => v && v.trim());
}

export function streak(act: Record<string, number>): number {
  const d = new Date();
  let n = 0;
  if (!act[dayKey(d)]) d.setDate(d.getDate() - 1);
  while (act[dayKey(d)]) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
