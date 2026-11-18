import { useSyncExternalStore } from 'react';
import { localStore } from '@/lib/storage';

export type Theme = 'light' | 'dark';
export type AccentName = 'blue' | 'violet' | 'teal' | 'rose' | 'orange';

/** [label, light accent, light soft, dark accent, dark soft] */
export const ACCENTS: Record<AccentName, [string, string, string, string, string]> = {
  blue: ['Blue', '#2F5BEA', '#E6ECFE', '#86A2FF', '#24304F'],
  violet: ['Violet', '#6D4AE0', '#EEE9FD', '#B39CFF', '#2E2650'],
  teal: ['Teal', '#0E7F75', '#DDF3F0', '#4FD1C1', '#173F3B'],
  rose: ['Rose', '#C93565', '#FCE6EE', '#FF8FB1', '#4A2232'],
  orange: ['Orange', '#C4560F', '#FDEBDD', '#FFA06A', '#4A2D1B'],
};

interface Settings { theme: Theme; accent: AccentName; toured: boolean; fcDeck: 'swe' | 'ai' }

let settings: Settings = {
  theme: (document.documentElement.dataset.theme as Theme) || 'light',
  accent: ACCENTS[localStore.get<AccentName>('accent', 'blue')] ? localStore.get<AccentName>('accent', 'blue') : 'blue',
  toured: !!localStore.get('toured', 0),
  fcDeck: localStore.get<'swe' | 'ai'>('fcdeck', 'swe'),
};
const listeners = new Set<() => void>();

function apply() {
  const root = document.documentElement;
  root.dataset.theme = settings.theme;
  const a = ACCENTS[settings.accent];
  const dark = settings.theme === 'dark';
  root.style.setProperty('--accent', dark ? a[3] : a[1]);
  root.style.setProperty('--accent-soft', dark ? a[4] : a[2]);
}
apply();

function update(patch: Partial<Settings>) {
  settings = { ...settings, ...patch };
  localStore.set('theme', settings.theme);
  localStore.set('accent', settings.accent);
  localStore.set('toured', settings.toured ? 1 : 0);
  localStore.set('fcdeck', settings.fcDeck);
  apply();
  listeners.forEach((l) => l());
}

export const settingsStore = {
  get: () => settings,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  toggleTheme: () => update({ theme: settings.theme === 'dark' ? 'light' : 'dark' }),
  setAccent: (accent: AccentName) => update({ accent }),
  setToured: (toured: boolean) => update({ toured }),
  setDeck: (fcDeck: 'swe' | 'ai') => update({ fcDeck }),
};

export function useSettings(): Settings {
  return useSyncExternalStore(settingsStore.subscribe, settingsStore.get);
}
