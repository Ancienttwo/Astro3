/**
 * Service Factory
 * 
 * Creates and manages service instances with dependency injection
 * Singleton pattern ensures single instances of services
 */

import { BaziOrchestrator, IOrchestratorOptions } from './orchestrator/BaziOrchestrator';
import { ValidationService } from './validation/ValidationService';
import { CalculationService } from './calculation/CalculationService';
import { LRUCache, MultiTierCacheService } from './cache/CacheService';
import { PerformanceMonitor } from './performance/PerformanceMonitor';
import { featureFlags, getServiceConfig } from '../config/feature-flags';
import { IValidationService } from './validation/interfaces';
import { ICalculationService } from './calculation/interfaces';
import { ICacheService } from './cache/interfaces';
import { IPerformanceMonitor } from './performance/interfaces';

/**
 * Service container for dependency injection
 */
class ServiceContainer {
  private services = new Map<string, any>();
  private factories = new Map<string, () => any>();

  /**
   * Register a service instance
   */
  register<T>(name: string, service: T): void {
    this.services.set(name, service);
  }

  /**
   * Register a factory function for lazy instantiation
   */
  registerFactory<T>(name: string, factory: () => T): void {
    this.factories.set(name, factory);
  }

  /**
   * Get a service instance
   */
  get<T>(name: string): T {
    // Check if already instantiated
    if (this.services.has(name)) {
      return this.services.get(name);
    }

    // Check if factory exists
    if (this.factories.has(name)) {
      const factory = this.factories.get(name);
      if (factory) {
        const service = factory();
        this.services.set(name, service);
        return service;
      }
    }

    throw new Error(`Service '${name}' not found in container`);
  }

  /**
   * Check if service exists
   */
  has(name: string): boolean {
    return this.services.has(name) || this.factories.has(name);
  }

  /**
   * Clear all services (for testing)
   */
  clear(): void {
    this.services.clear();
    this.factories.clear();
  }
}

/**
 * Service factory for creating and managing BaZi services
 */
export class ServiceFactory {
  private static instance: ServiceFactory;
  private container: ServiceContainer;
  private orchestrator?: BaziOrchestrator;

  private constructor() {
    this.container = new ServiceContainer();
    this.registerServices();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  /**
   * Register all services
   */
  private registerServices(): void {
    const config = getServiceConfig();

    // Register validation service
    this.container.registerFactory<IValidationService>(
      'validation',
      () => new ValidationService()
    );

    // Register calculation service
    this.container.registerFactory<ICalculationService>(
      'calculation',
      () => new CalculationService()
    );

    // Register cache service based on configuration
    this.container.registerFactory<ICacheService>(
      'cache',
      () => {
        if (config.cache.enabled) {
          // Check if we should use multi-tier cache
          if (process.env.BAZI_PERSISTENT_CACHE === 'true') {
            return new MultiTierCacheService(
              config.cache.maxSize,
              config.cache.timeout
            );
          }
          return new LRUCache(
            config.cache.maxSize,
            config.cache.timeout
          );
        }
        // Return a no-op cache if disabled
        return this.createNoOpCache();
      }
    );

    // Register performance monitor
    this.container.registerFactory<IPerformanceMonitor>(
      'performance',
      () => new PerformanceMonitor()
    );
  }

  /**
   * Create a no-op cache for when caching is disabled
   */
  private createNoOpCache(): ICacheService {
    return {
      async get(key: string) { return null; },
      async set(key: string, value: any, ttl?: number) { },
      async delete(key: string) { return false; },
      async has(key: string) { return false; },
      async clear() { },
      getStats() {
        return {
          hits: 0,
          misses: 0,
          evictions: 0,
          size: 0,
          maxSize: 0
        };
      },
      size() { return 0; },
      keys() { return []; }
    };
  }

  /**
   * Get or create orchestrator instance
   */
  getOrchestrator(options?: IOrchestratorOptions): BaziOrchestrator {
    if (!this.orchestrator) {
      const config = getServiceConfig();
      
      const orchestratorOptions: IOrchestratorOptions = {
        enableCache: config.cache.enabled,
        cacheTimeout: config.cache.timeout,
        enablePerformanceMonitoring: config.monitoring.enabled,
        enableWorkers: config.parallel.useWorkers,
        maxWorkers: config.parallel.maxWorkers,
        ...options
      };

      this.orchestrator = new BaziOrchestrator(
        this.container.get<IValidationService>('validation'),
        this.container.get<ICalculationService>('calculation'),
        this.container.get<ICacheService>('cache'),
        this.container.get<IPerformanceMonitor>('performance'),
        orchestratorOptions
      );
    }

    return this.orchestrator;
  }

  /**
   * Get validation service
   */
  getValidationService(): IValidationService {
    return this.container.get<IValidationService>('validation');
  }

  /**
   * Get calculation service
   */
  getCalculationService(): ICalculationService {
    return this.container.get<ICalculationService>('calculation');
  }

  /**
   * Get cache service
   */
  getCacheService(): ICacheService {
    return this.container.get<ICacheService>('cache');
  }

  /**
   * Get performance monitor
   */
  getPerformanceMonitor(): IPerformanceMonitor {
    return this.container.get<IPerformanceMonitor>('performance');
  }

  /**
   * Reset all services (for testing)
   */
  reset(): void {
    this.container.clear();
    this.orchestrator = undefined;
    this.registerServices();
  }

  /**
   * Get service statistics
   */
  getStatistics() {
    const cache = this.getCacheService();
    const performance = this.getPerformanceMonitor();
    const orchestrator = this.orchestrator;

    return {
      cache: cache.getStats(),
      performance: performance.getStatistics ? performance.getStatistics() : performance.getAverages(),
      orchestrator: orchestrator ? orchestrator.getMetrics() : null,
      config: getServiceConfig()
    };
  }
}

/**
 * Global service factory instance
 */
export const serviceFactory = ServiceFactory.getInstance();

/**
 * Helper functions for easy access
 */
export const getOrchestrator = (options?: IOrchestratorOptions) => 
  serviceFactory.getOrchestrator(options);

export const getValidationService = () => 
  serviceFactory.getValidationService();

export const getCalculationService = () => 
  serviceFactory.getCalculationService();

export const getCacheService = () => 
  serviceFactory.getCacheService();

export const getPerformanceMonitor = () => 
  serviceFactory.getPerformanceMonitor();