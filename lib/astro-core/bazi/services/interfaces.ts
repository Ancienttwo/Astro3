/**
 * Consolidated Service Interfaces
 * 
 * Central location for all service interface exports
 */

export type { 
  IValidationService,
  IValidator
} from './validation/interfaces';

export type {
  ICalculationService,
  ICalculationStrategy
} from './calculation/interfaces';

export type {
  ICacheService,
  CacheEntry,
  CacheStats,
  CacheOptions
} from './cache/interfaces';

export type {
  IPerformanceMonitor,
  PerformanceMetric,
  ErrorMetric,
  AverageMetrics
} from './performance/interfaces';