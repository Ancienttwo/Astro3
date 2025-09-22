/**
 * Cache Service Interfaces
 * 
 * Defines contracts for cache implementations
 */

export interface ICacheService<T = any> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  has(key: string): Promise<boolean>;
  clear(): Promise<void>;
  getStats(): CacheStats;
  size(): number;
  keys(): string[];
}

export interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: number;
  accessCount: number;
  ttl: number;
  expiresAt: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  maxSize: number;
}

export interface CacheOptions {
  maxSize?: number;
  ttl?: number;
  evictionPolicy?: 'LRU' | 'LFU' | 'FIFO';
  persistent?: boolean;
  compressionEnabled?: boolean;
}
