/**
 * Key-value storage adapter.
 *
 * Everything the app saves goes through this interface. Today it is backed by
 * the browser's localStorage. When a backend exists, add an implementation that
 * talks to the API (for example `ApiStore`) and pass it to `createProgressStore`.
 */
export interface KeyValueStore {
  get<T>(key: string, fallback: T): T;
  set(key: string, value: unknown): void;
  /** All keys owned by this app, used for backup and restore. */
  keys(): string[];
  raw(key: string): string | null;
  setRaw(key: string, value: string): void;
}

const PREFIX = 'ipl_';

export const localStore: KeyValueStore = {
  get<T>(key: string, fallback: T): T {
    try {
      const v = localStorage.getItem(PREFIX + key);
      return v == null ? fallback : (JSON.parse(v) as T);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* storage full or unavailable: progress simply is not saved */
    }
  },
  keys() {
    try {
      return Object.keys(localStorage).filter((k) => k.startsWith(PREFIX));
    } catch {
      return [];
    }
  },
  raw(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setRaw(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
  },
};
