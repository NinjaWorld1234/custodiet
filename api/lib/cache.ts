
interface CacheEntry<T> {
  value: T;
  expiry: number;
}

// Global cache object (survives warm serverless invocations)
const globalCache = new Map<string, CacheEntry<any>>();

export const getCache = <T>(key: string): T | null => {
  const entry = globalCache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiry) {
    globalCache.delete(key);
    return null;
  }

  return entry.value;
};

export const setCache = <T>(key: string, value: T, ttlSeconds: number): void => {
  globalCache.set(key, {
    value,
    expiry: Date.now() + ttlSeconds * 1000,
  });
};

export const clearCache = (key: string) => globalCache.delete(key);
