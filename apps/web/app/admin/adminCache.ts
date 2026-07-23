type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const cacheStore = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 1000 * 60 * 3; // 3 minutes

export function getAdminCache<T>(key: string): T | null {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cacheStore.delete(key);
    return null;
  }
  return entry.data;
}

export function setAdminCache<T>(key: string, data: T) {
  cacheStore.set(key, { data, timestamp: Date.now() });
}

export function clearAdminCache(key: string) {
  cacheStore.delete(key);
}
