/**
 * Cache Service with LRU Implementation
 * 
 * High-performance caching layer for BaZi calculations.
 * Implements Least Recently Used (LRU) eviction policy.
 * 
 * @pattern LRU Cache, Observer
 * @performance O(1) get/set operations
 */

import { ICacheService, CacheEntry, CacheStats } from './interfaces';

/**
 * Node for doubly linked list in LRU cache
 */
class LRUNode<T> {
  key: string;
  value: T;
  timestamp: number;
  accessCount = 0;
  ttl: number;
  expiresAt: number;
  prev: LRUNode<T> | null = null;
  next: LRUNode<T> | null = null;

  constructor(key: string, value: T, ttl: number, now: number) {
    this.key = key;
    this.value = value;
    this.ttl = ttl;
    this.timestamp = now;
    this.expiresAt = ttl === Number.POSITIVE_INFINITY ? ttl : now + ttl;
  }
}

/**
 * LRU Cache implementation with TTL support
 */
export class LRUCache<T = any> implements ICacheService<T> {
  private cache = new Map<string, LRUNode<T>>();
  private head: LRUNode<T> | null = null;
  private tail: LRUNode<T> | null = null;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
    maxSize: 0
  };

  constructor(
    private maxSize: number = 100,
    private defaultTTL: number = 3600000 // 1 hour
  ) {
    this.stats.maxSize = maxSize;
  }

  /**
   * Get value from cache
   */
  async get(key: string): Promise<T | null> {
    const node = this.cache.get(key);

    if (!node) {
      this.stats.misses++;
      return null;
    }

    if (this.isExpired(node)) {
      this.removeNode(node);
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.evictions++;
      this.updateSizeMetric();
      return null;
    }

    this.moveToFront(node);
    node.accessCount++;
    this.stats.hits++;

    return node.value;
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: T, ttl?: number): Promise<void> {
    // Check if key exists
    if (this.cache.has(key)) {
      const node = this.cache.get(key)!;
      const resolvedTtl = this.resolveTTL(ttl);
      node.value = value;
      node.ttl = resolvedTtl;
      const now = Date.now();
      node.timestamp = now;
      node.expiresAt =
        resolvedTtl === Number.POSITIVE_INFINITY ? resolvedTtl : now + resolvedTtl;
      this.moveToFront(node);
      return;
    }

    const resolvedTtl = this.resolveTTL(ttl);
    if (resolvedTtl <= 0) {
      return;
    }

    const now = Date.now();
    const node = new LRUNode(key, value, resolvedTtl, now);

    // Add to cache
    this.cache.set(key, node);
    this.addToFront(node);
    this.updateSizeMetric();

    // Evict if necessary
    if (this.cache.size > this.maxSize) {
      await this.evictLRU();
    }
  }

  /**
   * Delete from cache
   */
  async delete(key: string): Promise<boolean> {
    const node = this.cache.get(key);
    
    if (!node) {
      return false;
    }

    this.removeNode(node);
    this.cache.delete(key);
    this.updateSizeMetric();
    
    return true;
  }

  /**
   * Check if key exists
   */
  async has(key: string): Promise<boolean> {
    const node = this.cache.get(key);
    
    if (!node) {
      return false;
    }

    // Check expiration
    if (this.isExpired(node)) {
      this.removeNode(node);
      this.cache.delete(key);
      this.stats.evictions++;
      this.updateSizeMetric();
      return false;
    }

    return true;
  }

  /**
   * Clear entire cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
    this.head = null;
    this.tail = null;
    this.stats.size = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache entries for debugging
   */
  entries(): Array<CacheEntry<T>> {
    const entries: Array<CacheEntry<T>> = [];

    for (const [key, node] of this.cache.entries()) {
      entries.push({
        key,
        value: node.value,
        timestamp: node.timestamp,
        accessCount: node.accessCount,
        ttl: node.ttl,
        expiresAt: node.expiresAt,
      });
    }

    return entries;
  }

  /**
   * Check if node is expired
   */
  private isExpired(node: LRUNode<T>): boolean {
    if (node.ttl === Number.POSITIVE_INFINITY) {
      return false;
    }
    return Date.now() > node.expiresAt;
  }

  /**
   * Move node to front of list
   */
  private moveToFront(node: LRUNode<T>): void {
    if (node === this.head) {
      return;
    }

    this.removeNode(node);
    this.addToFront(node);
  }

  /**
   * Add node to front of list
   */
  private addToFront(node: LRUNode<T>): void {
    node.next = this.head;
    node.prev = null;

    if (this.head) {
      this.head.prev = node;
    }

    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  /**
   * Remove node from list
   */
  private removeNode(node: LRUNode<T>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  /**
   * Evict least recently used item
   */
  private async evictLRU(): Promise<void> {
    if (!this.tail) {
      return;
    }

    const keyToRemove = this.tail.key;
    await this.delete(keyToRemove);
    this.stats.evictions++;
  }

  private resolveTTL(ttl?: number): number {
    if (typeof ttl === 'number') {
      if (ttl <= 0) {
        return 0;
      }
      if (!Number.isFinite(ttl)) {
        return Number.POSITIVE_INFINITY;
      }
      return ttl;
    }
    return this.defaultTTL;
  }

  private updateSizeMetric(): void {
    this.stats.size = Math.max(0, this.cache.size);
  }
}

/**
 * Multi-tier cache service with memory and optional persistent storage
 */
export class MultiTierCacheService<T = any> implements ICacheService<T> {
  private memoryCache: LRUCache<T>;
  private persistentCache?: ICacheService<T>;

  constructor(
    maxMemorySize: number = 100,
    memoryTTL: number = 3600000,
    persistentCache?: ICacheService<T>
  ) {
    this.memoryCache = new LRUCache<T>(maxMemorySize, memoryTTL);
    this.persistentCache = persistentCache;
  }

  /**
   * Get from memory first, then persistent storage
   */
  async get(key: string): Promise<T | null> {
    // Try memory cache first
    let value = await this.memoryCache.get(key);
    
    if (value !== null) {
      return value;
    }

    // Try persistent cache
    if (this.persistentCache) {
      value = await this.persistentCache.get(key);
      
      if (value !== null) {
        // Promote to memory cache
        await this.memoryCache.set(key, value);
        return value;
      }
    }

    return null;
  }

  /**
   * Set in both caches
   */
  async set(key: string, value: T, ttl?: number): Promise<void> {
    // Set in memory cache
    await this.memoryCache.set(key, value, ttl);

    // Set in persistent cache if available
    if (this.persistentCache) {
      await this.persistentCache.set(key, value, ttl);
    }
  }

  /**
   * Delete from both caches
   */
  async delete(key: string): Promise<boolean> {
    const memoryDeleted = await this.memoryCache.delete(key);
    let persistentDeleted = false;

    if (this.persistentCache) {
      persistentDeleted = await this.persistentCache.delete(key);
    }

    return memoryDeleted || persistentDeleted;
  }

  /**
   * Check existence in either cache
   */
  async has(key: string): Promise<boolean> {
    const inMemory = await this.memoryCache.has(key);
    
    if (inMemory) {
      return true;
    }

    if (this.persistentCache) {
      return this.persistentCache.has(key);
    }

    return false;
  }

  /**
   * Clear both caches
   */
  async clear(): Promise<void> {
    await this.memoryCache.clear();
    
    if (this.persistentCache) {
      await this.persistentCache.clear();
    }
  }

  /**
   * Get combined statistics
   */
  getStats(): CacheStats {
    const memoryStats = this.memoryCache.getStats();
    
    if (!this.persistentCache) {
      return memoryStats;
    }

    const persistentStats = this.persistentCache.getStats();
    
    return {
      hits: memoryStats.hits + persistentStats.hits,
      misses: memoryStats.misses + persistentStats.misses,
      evictions: memoryStats.evictions + persistentStats.evictions,
      size: memoryStats.size + persistentStats.size,
      maxSize: memoryStats.maxSize + persistentStats.maxSize
    };
  }

  /**
   * Get total size
   */
  size(): number {
    let size = this.memoryCache.size();
    
    if (this.persistentCache) {
      size += this.persistentCache.size();
    }

    return size;
  }

  /**
   * Get all keys from both caches
   */
  keys(): string[] {
    const memoryKeys = this.memoryCache.keys();
    
    if (!this.persistentCache) {
      return memoryKeys;
    }

    const persistentKeys = this.persistentCache.keys();
    const allKeys = new Set([...memoryKeys, ...persistentKeys]);
    
    return Array.from(allKeys);
  }

  /**
   * Warm up memory cache from persistent storage
   */
  async warmup(keys: string[]): Promise<void> {
    if (!this.persistentCache) {
      return;
    }

    for (const key of keys) {
      const value = await this.persistentCache.get(key);
      
      if (value !== null) {
        await this.memoryCache.set(key, value);
      }
    }
  }
}

/**
 * Cache key generator for BaZi calculations
 */
export class BaziCacheKeyGenerator {
  /**
   * Generate cache key for basic calculation
   */
  static generateBasicKey(input: any): string {
    const { year, month, day, hour, minute, gender, isLunar } = input;
    return `bazi:basic:${year}-${month}-${day}-${hour}:${minute || 0}-${gender}-${isLunar ? 'L' : 'S'}`;
  }

  /**
   * Generate cache key for capability assessment
   */
  static generateCapabilityKey(input: any): string {
    const basicKey = this.generateBasicKey(input);
    return `${basicKey}:capability`;
  }

  /**
   * Generate cache key for shensha
   */
  static generateShenShaKey(input: any): string {
    const basicKey = this.generateBasicKey(input);
    return `${basicKey}:shensha`;
  }

  /**
   * Generate cache key for major periods
   */
  static generateMajorPeriodKey(input: any, count: number = 8): string {
    const basicKey = this.generateBasicKey(input);
    return `${basicKey}:periods:${count}`;
  }
}
