/**
 * Performance Monitoring Interfaces
 */

export interface IPerformanceMonitor {
  record(metric: PerformanceMetric): void;
  recordError(error: ErrorMetric): void;
  getMetrics(): PerformanceMetric[];
  getAverages(): AverageMetrics;
  getStatistics?(): any;
  generateReport?(): string;
  reset(): void;
}

export interface PerformanceMetric {
  type: string;
  subType?: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface ErrorMetric {
  error: Error;
  context: any;
  timestamp: number;
}

export interface AverageMetrics {
  averageCalculationTime: number;
  averageCacheHitTime: number;
  averageValidationTime: number;
  errorRate: number;
}