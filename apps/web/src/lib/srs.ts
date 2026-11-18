import { addDays, dayKey } from './dates';

/** Spaced repetition: review after 1, 3, 7, 14, then 30 days. */
export const INTERVALS = [1, 3, 7, 14, 30];

export type Rating = 'easy' | 'hard' | 'fail';

export const RATING_LABEL: Record<Rating, string> = {
  easy: '✅ solved easily',
  hard: '😓 solved with struggle',
  fail: '❌ not solved',
};

export interface ReviewItem {
  box: number;
  due: string;
  h: { d: string; r: Rating }[];
}

/** Returns the updated item and how many days until the next review. */
export function schedule(prev: ReviewItem | undefined, rating: Rating): { item: ReviewItem; days: number } {
  const o: ReviewItem = prev ? { ...prev, h: [...prev.h] } : { box: 0, due: '', h: [] };
  let box = o.box || 0;
  if (rating === 'easy') box = o.h.length ? Math.min(box + 1, INTERVALS.length - 1) : 1;
  else if (rating === 'fail') box = 0;
  const days = rating === 'hard' ? Math.max(1, Math.ceil(INTERVALS[box] / 2)) : INTERVALS[box];
  o.box = box;
  o.due = addDays(days);
  o.h = [...o.h, { d: dayKey(), r: rating }].slice(-20);
  return { item: o, days };
}

export function isDue(item: ReviewItem | undefined): boolean {
  return !!item && item.due <= dayKey();
}
