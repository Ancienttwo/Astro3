/**
 * @astroall/bazi-core Performance Manager
 *
 * 性能优化和缓存管理系统
 * 为能力评估引擎提供缓存、内存管理和性能监控功能
 *
 * @ai-context PERFORMANCE_MANAGER
 * @purpose 提供缓存和性能优化功能
 * @version 1.0.0
 * @created 2025-09-06
 */

import {
  AlgorithmOutput,
  BaziInput,
  CapabilityCalculationResult,
  StrengthCalculationResult,
  TenGodStrength,
} from './types';

// ========================= 缓存接口定义 =========================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

interface PerformanceMetrics {
  totalCalculations: number;
  cacheHits: number;
  cacheMisses: number;
  averageCalculationTime: number;
  memoryUsage: {
    cacheSize: number;
    totalEntries: number;
  };
}

interface CacheConfig {
  maxSize: number; // 最大缓存条目数
  ttl: number; // 缓存生存时间（毫秒）
  cleanupInterval: number; // 清理间隔（毫秒）
  enableLRU: boolean; // 启用LRU淘汰策略
  enableMetrics: boolean; // 启用性能指标收集
}

// ========================= 缓存管理器 =========================

export class CacheManager<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;
  private cleanupTimer?: ReturnType<typeof setInterval>;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      ttl: 30 * 60 * 1000, // 30分钟
      cleanupInterval: 5 * 60 * 1000, // 5分钟
      enableLRU: true,
      enableMetrics: true,
      ...config,
    };

    this.startCleanupTimer();
  }

  /**
   * 获取缓存项
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return null;
    }

    // 更新访问统计
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.data;
  }

  /**
   * 设置缓存项
   */
  set(key: string, data: T): void {
    // 检查缓存大小限制
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastUsed();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
    };

    this.cache.set(key, entry);
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 获取缓存键列表
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 淘汰最少使用的缓存项
   */
  private evictLeastUsed(): void {
    if (!this.config.enableLRU) {
      // 如果不启用LRU，删除最旧的项
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
      return;
    }

    let leastUsedKey: string | null = null;
    let minScore = Infinity;

    for (const [key, entry] of Array.from(this.cache.entries())) {
      // LRU评分 = 访问次数 × 最后访问时间权重
      const timeWeight = (Date.now() - entry.lastAccessed) / 1000; // 秒
      const score = entry.accessCount / (1 + timeWeight);

      if (score < minScore) {
        minScore = score;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }

  /**
   * 清理过期项
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (now - entry.timestamp > this.config.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * 停止清理定时器
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.cache.clear();
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    size: number;
    totalEntries: number;
    memoryUsage: number;
    config: CacheConfig;
  } {
    return {
      size: this.cache.size,
      totalEntries: this.cache.size,
      memoryUsage: this.getMemoryUsage(),
      config: { ...this.config },
    };
  }

  /**
   * 估算内存使用量（字节）
   */
  private getMemoryUsage(): number {
    // 简单估算：每个条目约占用的内存
    const avgEntrySize = 1024; // 1KB per entry
    return this.cache.size * avgEntrySize;
  }
}

// ========================= 性能监控器 =========================

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    totalCalculations: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageCalculationTime: 0,
    memoryUsage: {
      cacheSize: 0,
      totalEntries: 0,
    },
  };

  private calculationTimes: number[] = [];
  private readonly maxHistorySize = 1000;

  /**
   * 记录计算开始
   */
  startCalculation(): number {
    return performance.now();
  }

  /**
   * 记录计算结束
   */
  endCalculation(startTime: number, isCacheHit: boolean = false): void {
    const duration = performance.now() - startTime;

    this.metrics.totalCalculations++;

    if (isCacheHit) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;

      // 只记录实际计算的时间
      this.calculationTimes.push(duration);

      // 保持历史记录大小限制
      if (this.calculationTimes.length > this.maxHistorySize) {
        this.calculationTimes.shift();
      }

      // 更新平均计算时间
      this.updateAverageCalculationTime();
    }
  }

  /**
   * 更新平均计算时间
   */
  private updateAverageCalculationTime(): void {
    if (this.calculationTimes.length === 0) {
      this.metrics.averageCalculationTime = 0;
      return;
    }

    const total = this.calculationTimes.reduce((sum, time) => sum + time, 0);
    this.metrics.averageCalculationTime = total / this.calculationTimes.length;
  }

  /**
   * 更新内存使用情况
   */
  updateMemoryUsage(cacheSize: number, totalEntries: number): void {
    this.metrics.memoryUsage.cacheSize = cacheSize;
    this.metrics.memoryUsage.totalEntries = totalEntries;
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * 获取缓存命中率
   */
  getCacheHitRate(): number {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    return total > 0 ? this.metrics.cacheHits / total : 0;
  }

  /**
   * 获取性能摘要
   */
  getSummary(): {
    cacheHitRate: number;
    averageCalculationTime: number;
    totalCalculations: number;
    memoryUsage: string;
  } {
    const memoryMB = (this.metrics.memoryUsage.cacheSize / 1024 / 1024).toFixed(2);

    return {
      cacheHitRate: this.getCacheHitRate(),
      averageCalculationTime: this.metrics.averageCalculationTime,
      totalCalculations: this.metrics.totalCalculations,
      memoryUsage: `${memoryMB}MB (${this.metrics.memoryUsage.totalEntries} entries)`,
    };
  }

  /**
   * 重置指标
   */
  reset(): void {
    this.metrics = {
      totalCalculations: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageCalculationTime: 0,
      memoryUsage: {
        cacheSize: 0,
        totalEntries: 0,
      },
    };
    this.calculationTimes = [];
  }
}

// ========================= 综合性能管理器 =========================

export class PerformanceManager {
  private strengthCache: CacheManager<StrengthCalculationResult>;
  private capabilityCache: CacheManager<CapabilityCalculationResult>;
  private completeCache: CacheManager<AlgorithmOutput>;
  private monitor: PerformanceMonitor;

  constructor(config: Partial<CacheConfig> = {}) {
    // 为不同类型的计算创建独立的缓存
    this.strengthCache = new CacheManager<StrengthCalculationResult>(config);
    this.capabilityCache = new CacheManager<CapabilityCalculationResult>(config);
    this.completeCache = new CacheManager<AlgorithmOutput>({
      ...config,
      maxSize: (config.maxSize || 1000) * 2, // 完整计算缓存更大
    });

    this.monitor = new PerformanceMonitor();
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(input: BaziInput, config?: Record<string, unknown>): string {
    const inputKey = JSON.stringify({
      pillars: input.pillars,
      gender: input.gender,
      solarDate: input.solarDate,
    });

    const configKey = config ? JSON.stringify(config) : 'default';

    return `${inputKey}_${configKey}`;
  }

  /**
   * 缓存十神强度计算结果
   */
  cacheStrengthResult(input: BaziInput, result: StrengthCalculationResult, config?: Record<string, unknown>): void {
    const key = this.generateCacheKey(input, config);
    this.strengthCache.set(key, result);
  }

  /**
   * 获取缓存的十神强度计算结果
   */
  getCachedStrengthResult(input: BaziInput, config?: Record<string, unknown>): StrengthCalculationResult | null {
    const key = this.generateCacheKey(input, config);
    return this.strengthCache.get(key);
  }

  /**
   * 缓存能力评分结果
   */
  cacheCapabilityResult(strengths: TenGodStrength, result: CapabilityCalculationResult): void {
    const key = JSON.stringify(strengths);
    this.capabilityCache.set(key, result);
  }

  /**
   * 获取缓存的能力评分结果
   */
  getCachedCapabilityResult(strengths: TenGodStrength): CapabilityCalculationResult | null {
    const key = JSON.stringify(strengths);
    return this.capabilityCache.get(key);
  }

  /**
   * 缓存完整评估结果
   */
  cacheCompleteResult(input: BaziInput, result: AlgorithmOutput, config?: Record<string, unknown>): void {
    const key = this.generateCacheKey(input, config);
    this.completeCache.set(key, result);
  }

  /**
   * 获取缓存的完整评估结果
   */
  getCachedCompleteResult(input: BaziInput, config?: Record<string, unknown>): AlgorithmOutput | null {
    const key = this.generateCacheKey(input, config);
    return this.completeCache.get(key);
  }

  /**
   * 记录计算性能
   */
  recordCalculation(startTime: number, isCacheHit: boolean): void {
    this.monitor.endCalculation(startTime, isCacheHit);

    // 更新内存使用情况
    const totalCacheSize =
      this.strengthCache.getStats().memoryUsage +
      this.capabilityCache.getStats().memoryUsage +
      this.completeCache.getStats().memoryUsage;

    const totalEntries =
      this.strengthCache.size() + this.capabilityCache.size() + this.completeCache.size();

    this.monitor.updateMemoryUsage(totalCacheSize, totalEntries);
  }

  /**
   * 开始计算计时
   */
  startTiming(): number {
    return this.monitor.startCalculation();
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return this.monitor.getMetrics();
  }

  /**
   * 获取性能摘要
   */
  getPerformanceSummary(): {
    cacheHitRate: number;
    averageCalculationTime: number;
    totalCalculations: number;
    memoryUsage: string;
    cacheStats: {
      strength: ReturnType<CacheManager<StrengthCalculationResult>['getStats']>;
      capability: ReturnType<CacheManager<CapabilityCalculationResult>['getStats']>;
      complete: ReturnType<CacheManager<AlgorithmOutput>['getStats']>;
    };
  } {
    return {
      ...this.monitor.getSummary(),
      cacheStats: {
        strength: this.strengthCache.getStats(),
        capability: this.capabilityCache.getStats(),
        complete: this.completeCache.getStats(),
      },
    };
  }

  /**
   * 清除所有缓存
   */
  clearAllCaches(): void {
    this.strengthCache.clear();
    this.capabilityCache.clear();
    this.completeCache.clear();
  }

  /**
   * 优化内存使用
   */
  optimizeMemory(): {
    before: number;
    after: number;
    cleared: number;
  } {
    const beforeSize =
      this.strengthCache.size() + this.capabilityCache.size() + this.completeCache.size();

    // 清除最少使用的缓存项
    const clearCount = Math.floor(beforeSize * 0.3); // 清除30%

    let cleared = 0;
    const caches = [this.strengthCache, this.capabilityCache, this.completeCache];

    for (const cache of caches) {
      const keysToDelete = Array.from(cache.keys()).slice(0, Math.floor(clearCount / 3));
      keysToDelete.forEach((key) => {
        cache.delete(key);
        cleared++;
      });
    }

    const afterSize =
      this.strengthCache.size() + this.capabilityCache.size() + this.completeCache.size();

    return {
      before: beforeSize,
      after: afterSize,
      cleared,
    };
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.strengthCache.destroy();
    this.capabilityCache.destroy();
    this.completeCache.destroy();
    this.monitor.reset();
  }
}

// ========================= 单例实例 =========================

let globalPerformanceManager: PerformanceManager | null = null;

/**
 * 获取全局性能管理器实例
 */
export function getGlobalPerformanceManager(): PerformanceManager {
  if (!globalPerformanceManager) {
    globalPerformanceManager = new PerformanceManager();
  }
  return globalPerformanceManager;
}

/**
 * 设置全局性能管理器配置
 */
export function configureGlobalPerformanceManager(config: Partial<CacheConfig>): void {
  if (globalPerformanceManager) {
    globalPerformanceManager.destroy();
  }
  globalPerformanceManager = new PerformanceManager(config);
}

/**
 * 销毁全局性能管理器
 */
export function destroyGlobalPerformanceManager(): void {
  if (globalPerformanceManager) {
    globalPerformanceManager.destroy();
    globalPerformanceManager = null;
  }
}

// ========================= 导出 =========================

// 类已通过 export class 导出，只需导出类型
export type { CacheConfig, PerformanceMetrics };
