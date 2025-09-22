/**
 * Performance Monitoring Service
 * 
 * Tracks and analyzes performance metrics for BaZi calculations
 */

import { IPerformanceMonitor, PerformanceMetric, ErrorMetric, AverageMetrics } from './interfaces';

export class PerformanceMonitor implements IPerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private errors: ErrorMetric[] = [];
  private maxMetrics: number = 1000;
  private maxErrors: number = 100;

  constructor(maxMetrics?: number, maxErrors?: number) {
    if (maxMetrics) this.maxMetrics = maxMetrics;
    if (maxErrors) this.maxErrors = maxErrors;
  }

  /**
   * Record a performance metric
   */
  record(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Prevent memory leak by limiting stored metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * Record an error
   */
  recordError(error: ErrorMetric): void {
    this.errors.push(error);

    // Prevent memory leak
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by type
   */
  getMetricsByType(type: string, subType?: string): PerformanceMetric[] {
    return this.metrics.filter(m => {
      if (subType) {
        return m.type === type && m.subType === subType;
      }
      return m.type === type;
    });
  }

  /**
   * Get average metrics
   */
  getAverages(): AverageMetrics {
    const calculations = this.getMetricsByType('bazi-calculation', 'calculation');
    const cacheHits = this.getMetricsByType('bazi-calculation', 'cache-hit');
    const validations = this.getMetricsByType('validation');

    return {
      averageCalculationTime: this.calculateAverage(calculations),
      averageCacheHitTime: this.calculateAverage(cacheHits),
      averageValidationTime: this.calculateAverage(validations),
      errorRate: this.calculateErrorRate()
    };
  }

  /**
   * Calculate average duration
   */
  private calculateAverage(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, m) => acc + m.duration, 0);
    return sum / metrics.length;
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(): number {
    const totalOperations = this.metrics.length;
    if (totalOperations === 0) return 0;
    return (this.errors.length / totalOperations) * 100;
  }

  /**
   * Get performance statistics
   */
  getStatistics() {
    const averages = this.getAverages();
    const recentMetrics = this.metrics.slice(-100);
    const recentErrors = this.errors.slice(-10);

    return {
      summary: {
        totalMetrics: this.metrics.length,
        totalErrors: this.errors.length,
        errorRate: `${averages.errorRate.toFixed(2)}%`
      },
      averages: {
        calculation: `${averages.averageCalculationTime.toFixed(2)}ms`,
        cacheHit: `${averages.averageCacheHitTime.toFixed(2)}ms`,
        validation: `${averages.averageValidationTime.toFixed(2)}ms`
      },
      recent: {
        metrics: recentMetrics.length,
        errors: recentErrors.length
      },
      distribution: this.getDistribution()
    };
  }

  /**
   * Get performance distribution
   */
  private getDistribution() {
    const calculations = this.getMetricsByType('bazi-calculation', 'calculation');
    if (calculations.length === 0) return null;

    const durations = calculations.map(m => m.duration).sort((a, b) => a - b);
    const len = durations.length;

    return {
      p50: durations[Math.floor(len * 0.5)].toFixed(2),
      p75: durations[Math.floor(len * 0.75)].toFixed(2),
      p90: durations[Math.floor(len * 0.9)].toFixed(2),
      p95: durations[Math.floor(len * 0.95)].toFixed(2),
      p99: durations[Math.floor(len * 0.99)].toFixed(2)
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = [];
    this.errors = [];
  }

  /**
   * Export metrics for analysis
   */
  export(): string {
    return JSON.stringify({
      metrics: this.metrics,
      errors: this.errors,
      statistics: this.getStatistics()
    }, null, 2);
  }

  /**
   * Get performance report
   */
  generateReport(): string {
    const stats = this.getStatistics();
    const report = [];

    report.push('=== Performance Report ===\n');
    report.push(`Total Operations: ${stats.summary.totalMetrics}`);
    report.push(`Total Errors: ${stats.summary.totalErrors}`);
    report.push(`Error Rate: ${stats.summary.errorRate}\n`);

    report.push('Average Times:');
    report.push(`  Calculation: ${stats.averages.calculation}`);
    report.push(`  Cache Hit: ${stats.averages.cacheHit}`);
    report.push(`  Validation: ${stats.averages.validation}\n`);

    if (stats.distribution) {
      report.push('Performance Distribution:');
      report.push(`  P50: ${stats.distribution.p50}ms`);
      report.push(`  P75: ${stats.distribution.p75}ms`);
      report.push(`  P90: ${stats.distribution.p90}ms`);
      report.push(`  P95: ${stats.distribution.p95}ms`);
      report.push(`  P99: ${stats.distribution.p99}ms`);
    }

    return report.join('\n');
  }
}

/**
 * Global performance monitor instance
 */
export const globalPerformanceMonitor = new PerformanceMonitor();