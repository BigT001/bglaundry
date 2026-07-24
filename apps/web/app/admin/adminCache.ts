type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const cacheStore = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes
const STORAGE_PREFIX = 'bglaundry:admin-cache:';

function isFresh(entry: CacheEntry<unknown>) {
  return Date.now() - entry.timestamp <= CACHE_TTL;
}

export function getAdminCache<T>(key: string): T | null {
  const memoryEntry = cacheStore.get(key);
  if (memoryEntry && isFresh(memoryEntry)) return memoryEntry.data as T;

  if (memoryEntry) cacheStore.delete(key);
  if (typeof window === 'undefined') return null;

  try {
    const stored = window.sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!stored) return null;
    const entry = JSON.parse(stored) as CacheEntry<T>;
    if (!isFresh(entry)) {
      window.sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`);
      return null;
    }
    cacheStore.set(key, entry);
    return entry.data;
  } catch {
    // Storage may be unavailable in private browsing; the in-memory cache still works.
    return null;
  }
}

export function setAdminCache<T>(key: string, data: T) {
  const entry = { data, timestamp: Date.now() };
  cacheStore.set(key, entry);
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(entry));
  } catch {
    // Keep the faster in-memory result when session storage is full or unavailable.
  }
}

export function clearAdminCache(key: string) {
  cacheStore.delete(key);
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch {
    // Nothing else is required when session storage is unavailable.
  }
}
