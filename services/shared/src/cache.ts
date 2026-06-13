import { getRedis } from "./redis";

/**
 * Try to get a cached value; if miss, run loader(), cache the result, return it.
 * @param key   Redis key
 * @param ttl   TTL in seconds
 * @param loader async function that returns the fresh value
 */
export async function withCache<T>(key: string, ttl: number, loader: () => Promise<T>): Promise<T> {
  try {
    const redis = await getRedis();
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached) as T;

    const fresh = await loader();
    await redis.setEx(key, ttl, JSON.stringify(fresh));
    return fresh;
  } catch {
    // Redis unavailable — fall through to DB (fail open)
    return loader();
  }
}

/** Invalidate a cache key (call after writes that would stale a cached query). */
export async function invalidateCache(key: string): Promise<void> {
  try {
    const redis = await getRedis();
    await redis.del(key);
  } catch { /* non-fatal */ }
}

/** Invalidate all keys matching a prefix pattern (uses SCAN, not KEYS). */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    const redis = await getRedis();
    let cursor = 0;
    do {
      const result = await redis.scan(cursor, { MATCH: pattern, COUNT: 100 });
      cursor = result.cursor;
      if (result.keys.length) await redis.del(result.keys);
    } while (cursor !== 0);
  } catch { /* non-fatal */ }
}
