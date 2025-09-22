/**
 * BaZi Orchestrator Service
 * 
 * Central coordination service for all BaZi calculations.
 * Implements pipeline pattern with caching, validation, and performance monitoring.
 * 
 * @architecture Service-Oriented Architecture (SOA)
 * @pattern Pipeline, Strategy, Factory
 * @performance Optimized with caching and lazy loading
 */

import { performance } from 'perf_hooks';
import { BaziInput, BaziResult, ValidationResult } from '../types';
import { IValidationService } from '../validation/interfaces';
import { ICalculationService } from '../calculation/interfaces';
import { ICacheService } from '../cache/interfaces';
import { IPerformanceMonitor } from '../performance/interfaces';
import { BaziError, ErrorCode } from '../../utils/errors';

export interface IOrchestratorOptions {
  enableCache?: boolean;
  cacheTimeout?: number;
  enablePerformanceMonitoring?: boolean;
  enableWorkers?: boolean;
  maxWorkers?: number;
}

export interface IOrchestratorMetrics {
  totalCalculations: number;
  cacheHits: number;
  cacheMisses: number;
  averageCalculationTime: number;
  errors: number;
}

/**
 * Main orchestrator for BaZi calculations
 * Coordinates between validation, calculation, caching, and monitoring services
 */
export class BaziOrchestrator {
  private metrics: IOrchestratorMetrics = {
    totalCalculations: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageCalculationTime: 0,
    errors: 0
  };

  constructor(
    private validationService: IValidationService,
    private calculationService: ICalculationService,
    private cacheService: ICacheService,
    private performanceMonitor: IPerformanceMonitor,
    private options: IOrchestratorOptions = {}
  ) {
    this.options = {
      enableCache: true,
      cacheTimeout: 3600000, // 1 hour
      enablePerformanceMonitoring: true,
      enableWorkers: false,
      maxWorkers: 4,
      ...options
    };
  }

  /**
   * Main calculation pipeline
   * Validates input -> Checks cache -> Calculates -> Caches result -> Returns
   */
  async calculate(input: BaziInput): Promise<BaziResult> {
    const startTime = performance.now();
    let calculationStarted = false;

    try {
      // Step 1: Validation
      const validation = await this.validate(input);
      if (!validation.isValid) {
        throw new BaziError(
          `Validation failed: ${validation.errors.join(', ')}`,
          ErrorCode.VALIDATION_ERROR,
          { input, validation }
        );
      }

      this.metrics.totalCalculations++;
      calculationStarted = true;

      // Step 2: Check cache
      if (this.options.enableCache) {
        const cacheKey = this.getCacheKey(input);
        const cached = await this.cacheService.get(cacheKey) as BaziResult | null;
        
        if (cached) {
          this.metrics.cacheHits++;
          this.recordPerformance(startTime, 'cache-hit');
          return cached;
        }
        
        this.metrics.cacheMisses++;
      }

      // Step 3: Calculate
      const result = await this.performCalculation(input);

      // Step 4: Cache result
      if (this.options.enableCache) {
        const cacheKey = this.getCacheKey(input);
        await this.cacheService.set(
          cacheKey, 
          result, 
          this.options.cacheTimeout
        );
      }

      // Step 5: Record performance
      this.recordPerformance(startTime, 'calculation');

      return result;

    } catch (error) {
      this.handleError(error, input);
      if (calculationStarted) {
        this.metrics.errors++;
      }
      throw error;
    }
  }

  /**
   * Batch calculation with optimizations
   */
  async calculateBatch(inputs: BaziInput[]): Promise<BaziResult[]> {
    if (this.options.enableWorkers && inputs.length > 10) {
      return this.calculateBatchWithWorkers(inputs);
    }

    // Process in parallel batches to avoid overwhelming system
    const batchSize = 10;
    const results: BaziResult[] = [];
    
    for (let i = 0; i < inputs.length; i += batchSize) {
      const batch = inputs.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(input => this.calculate(input))
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Stream calculation for large datasets
   */
  async *calculateStream(inputs: BaziInput[]): AsyncGenerator<BaziResult> {
    for (const input of inputs) {
      yield await this.calculate(input);
    }
  }

  /**
   * Validation delegation
   */
  private async validate(input: BaziInput): Promise<ValidationResult> {
    return this.validationService.validate(input);
  }

  /**
   * Calculation delegation with strategy selection
   */
  private async performCalculation(input: BaziInput): Promise<BaziResult> {
    // Select calculation strategy based on input
    const strategy = this.selectCalculationStrategy(input);
    return this.calculationService.calculate(input, strategy);
  }

  /**
   * Generate cache key from input
   */
  private getCacheKey(input: BaziInput): string {
    const { year, month, day, hour, minute, gender, isLunar } = input;
    return `bazi:${year}-${month}-${day}-${hour}:${minute}-${gender}-${isLunar}`;
  }

  /**
   * Select optimal calculation strategy
   */
  private selectCalculationStrategy(input: BaziInput): string {
    // Strategy selection logic
    if (input.options?.quickMode) return 'quick';
    if (input.options?.includeCapabilityAssessment) return 'comprehensive';
    return 'standard';
  }

  /**
   * Calculate with worker threads for better performance
   */
  private async calculateBatchWithWorkers(inputs: BaziInput[]): Promise<BaziResult[]> {
    // Worker implementation would go here
    // For now, fallback to regular batch
    return this.calculateBatch(inputs);
  }

  /**
   * Record performance metrics
   */
  private recordPerformance(startTime: number, type: 'cache-hit' | 'calculation'): void {
    if (!this.options.enablePerformanceMonitoring) return;

    const duration = performance.now() - startTime;
    this.performanceMonitor.record({
      type: 'bazi-calculation',
      subType: type,
      duration,
      timestamp: Date.now()
    });

    // Update average calculation time
    const total = this.metrics.totalCalculations;
    if (total > 0) {
      const currentAvg = this.metrics.averageCalculationTime;
      this.metrics.averageCalculationTime =
        (currentAvg * (total - 1) + duration) / total;
    }
  }

  /**
   * Error handling with context preservation
   */
  private handleError(error: unknown, input: BaziInput): void {
    if (this.options.enablePerformanceMonitoring) {
      this.performanceMonitor.recordError({
        error: error instanceof Error ? error : new Error(String(error)),
        context: { input },
        timestamp: Date.now()
      });
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): IOrchestratorMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalCalculations: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageCalculationTime: 0,
      errors: 0
    };
  }

  /**
   * Warm up cache with common calculations
   */
  async warmupCache(inputs: BaziInput[]): Promise<void> {
    if (!this.options.enableCache) return;

    for (const input of inputs) {
      const cacheKey = this.getCacheKey(input);
      const cached = await this.cacheService.get(cacheKey);
      
      if (!cached) {
        const result = await this.performCalculation(input);
        await this.cacheService.set(
          cacheKey,
          result,
          this.options.cacheTimeout
        );
      }
    }
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    if (this.options.enableCache) {
      await this.cacheService.clear();
    }
  }
}
