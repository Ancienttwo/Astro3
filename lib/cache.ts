/**
 * Client-side cache utilities for dashboard data
 * Implements time-based caching to reduce API calls
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class ClientCache {
  private cache = new Map<string, CacheEntry<any>>();

  /**
   * Get cached data if not expired
   * @param key Cache key
   * @returns Cached data or null if expired/missing
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.expiresIn;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cache entry with TTL
   * @param key Cache key
   * @param data Data to cache
   * @param expiresIn TTL in milliseconds (default: 1 minute)
   */
  set<T>(key: string, data: T, expiresIn: number = 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn,
    });
  }

  /**
   * Clear specific cache entry
   * @param key Cache key
   */
  clear(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * Check if cache entry exists and is valid
   * @param key Cache key
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

// Singleton instance
export const cache = new ClientCache();

// Cache duration constants
export const CACHE_DURATION = {
  STATS: 60 * 1000,           // 1 minute for user stats
  LEADERBOARD: 5 * 60 * 1000, // 5 minutes for leaderboard
  TASKS: 2 * 60 * 1000,       // 2 minutes for tasks
  ACTIVITY: 30 * 1000,        // 30 seconds for activity feed
} as const;

// Cache key generators
export const getCacheKey = {
  stats: (userId: string) => `stats:${userId}`,
  leaderboard: () => 'leaderboard:global',
  tasks: (userId: string) => `tasks:${userId}`,
  activity: (userId: string) => `activity:${userId}`,
} as const;
