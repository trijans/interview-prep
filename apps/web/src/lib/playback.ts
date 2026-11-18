import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { localStore } from './storage';

/**
 * Shared playback for every visualizer.
 *
 * A visualization is written as a generator of `Frame`s: each frame is the
 * full picture to draw, plus a plain-English sentence and the pseudocode line
 * that is running. `useStepper` plays the frames at the chosen pace, pausing
 * between them, or waiting for "Next step" in step-by-step mode.
 */
export interface Frame<S> {
  state: S;
  say?: string;
  /** Highlighted pseudocode line(s). */
  line?: number | number[];
  /** Pseudocode to show, if it changes during the animation. */
  code?: string[];
  /** How long to hold this frame, as a multiple of the pace (default 1). */
  hold?: number;
}

export type Pace = 'step' | 'slow' | 'normal' | 'fast';
export const PACES: Record<Pace, [label: string, ms: number]> = {
  step: ['Step by step', 1300],
  slow: ['Slow', 2000],
  normal: ['Normal', 1000],
  fast: ['Fast', 350],
};

interface PlayerState { pace: Pace; paused: boolean; waiting: boolean; busy: number }
let ps: PlayerState = { pace: PACES[localStore.get<Pace>('pace', 'slow')] ? localStore.get<Pace>('pace', 'slow') : 'slow', paused: false, waiting: false, busy: 0 };
const listeners = new Set<() => void>();
let resume: (() => void) | null = null;
/** Set when the user leaves a page mid-animation: remaining frames play instantly. */
let fastForward = false;

function set(patch: Partial<PlayerState>) {
  ps = { ...ps, ...patch };
  listeners.forEach((l) => l());
}

export const player = {
  get: () => ps,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  /** Base duration of one frame at the current pace, in ms. */
  speed: () => PACES[ps.pace][1],
  setPace(p: Pace) {
    localStore.set('pace', p);
    set({ pace: p });
    if (p !== 'step' && !ps.paused && resume) resume();
  },
  togglePause() {
    set({ paused: !ps.paused });
    if (!ps.paused && ps.pace !== 'step' && resume) resume();
  },
  next() {
    if (resume) resume();
  },
  /** Finish any running animation instantly (used when switching pages). */
  interrupt() {
    if (ps.busy) fastForward = true;
    set({ paused: false });
    if (resume) resume();
  },
  wait(mult = 1): Promise<void> {
    return new Promise((res) => {
      if (fastForward) return res();
      const go = () => {
        resume = null;
        set({ waiting: false });
        res();
      };
      if (ps.pace === 'step' || ps.paused) {
        resume = go;
        set({ waiting: true });
        return;
      }
      setTimeout(() => {
        if (fastForward) return res();
        if (ps.paused) {
          resume = go;
          set({ waiting: true });
        } else go();
      }, Math.max(16, PACES[ps.pace][1] * mult));
    });
  },
  begin() {
    set({ busy: ps.busy + 1, paused: false });
  },
  end() {
    const busy = Math.max(0, ps.busy - 1);
    if (!busy) fastForward = false;
    set({ busy });
  },
  isFastForward: () => fastForward,
};

export function usePlayer(): PlayerState {
  return useSyncExternalStore(player.subscribe, player.get);
}

type FrameSource<S> = Generator<Frame<S>, unknown, unknown> | AsyncGenerator<Frame<S>, unknown, unknown>;

/** Holds the current frame of one visualizer and plays generators into it. */
export function useStepper<S>(initial: S, initialSay = '', initialCode?: string[]) {
  const [frame, setFrame] = useState<Frame<S>>({ state: initial, say: initialSay, code: initialCode });
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const stateRef = useRef(initial);
  stateRef.current = frame.state;

  const play = useCallback(async (make: (current: S) => FrameSource<S>) => {
    if (busyRef.current || player.get().busy) return;
    busyRef.current = true;
    setBusy(true);
    player.begin();
    try {
      let code: string[] | undefined;
      for await (const f of make(stateRef.current)) {
        if (f.code) code = f.code;
        stateRef.current = f.state;
        setFrame((prev) => ({ ...f, code: f.code ?? code ?? prev.code, say: f.say ?? prev.say }));
        if (f.hold !== 0) await player.wait(f.hold ?? 1);
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
      player.end();
    }
  }, []);

  /** Replace the picture without animating (e.g. "New data"). */
  const show = useCallback((state: S, say?: string, code?: string[], line?: number | number[]) => {
    stateRef.current = state;
    setFrame((prev) => ({ state, say: say ?? prev.say, code: code ?? prev.code, line }));
  }, []);

  return { frame, state: frame.state, busy, play, show, current: () => stateRef.current };
}

/** Interrupt running animations when a component unmounts or a page changes. */
export function useInterruptOnHide(visible: boolean) {
  useEffect(() => {
    if (!visible) player.interrupt();
  }, [visible]);
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export const rnd = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
export function randn(): number {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
