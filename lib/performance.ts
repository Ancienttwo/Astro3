/**
 * Performance monitoring and tracking utilities
 * Provides helpers for measuring page load times, API calls, and user interactions
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private marks = new Map<string, number>();

  /**
   * Start a performance measurement
   * @param name Measurement name
   */
  mark(name: string): void {
    this.marks.set(name, performance.now());

    if (typeof performance.mark === 'function') {
      performance.mark(name);
    }
  }

  /**
   * End a performance measurement and record duration
   * @param name Measurement name
   * @param startMark Optional start mark name (if different from end name)
   * @returns Duration in milliseconds
   */
  measure(name: string, startMark?: string): number | null {
    const start = this.marks.get(startMark || name);

    if (!start) {
      console.warn(`Performance mark "${startMark || name}" not found`);
      return null;
    }

    const duration = performance.now() - start;

    this.metrics.push({
      name,
      value: duration,
      timestamp: Date.now(),
    });

    // Clean up mark
    this.marks.delete(startMark || name);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ [Perf] ${name}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by name pattern
   */
  getMetricsByName(pattern: string | RegExp): PerformanceMetric[] {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    return this.metrics.filter((m) => regex.test(m.name));
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.marks.clear();
  }

  /**
   * Get Core Web Vitals if available
   */
  getWebVitals(): {
    lcp?: number;
    fid?: number;
    cls?: number;
    fcp?: number;
    ttfb?: number;
  } {
    const vitals: any = {};

    if (typeof PerformanceObserver === 'undefined') {
      return vitals;
    }

    try {
      // LCP (Largest Contentful Paint)
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length > 0) {
        const lcp = lcpEntries[lcpEntries.length - 1] as any;
        vitals.lcp = lcp.renderTime || lcp.loadTime;
      }

      // FCP (First Contentful Paint)
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find((e) => e.name === 'first-contentful-paint');
      if (fcpEntry) {
        vitals.fcp = fcpEntry.startTime;
      }

      // TTFB (Time to First Byte)
      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries.length > 0) {
        const nav = navEntries[0] as any;
        vitals.ttfb = nav.responseStart - nav.requestStart;
      }
    } catch (error) {
      console.error('Error getting web vitals:', error);
    }

    return vitals;
  }

  /**
   * Log performance summary to console
   */
  logSummary(): void {
    const vitals = this.getWebVitals();

    console.group('📊 Performance Summary');
    console.log('Core Web Vitals:');
    if (vitals.lcp) console.log(`  LCP: ${vitals.lcp.toFixed(0)}ms`);
    if (vitals.fcp) console.log(`  FCP: ${vitals.fcp.toFixed(0)}ms`);
    if (vitals.ttfb) console.log(`  TTFB: ${vitals.ttfb.toFixed(0)}ms`);

    if (this.metrics.length > 0) {
      console.log('\nCustom Metrics:');
      this.metrics.forEach((m) => {
        console.log(`  ${m.name}: ${m.value.toFixed(2)}ms`);
      });
    }
    console.groupEnd();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Helper function to measure async operations
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  performanceMonitor.mark(name);

  try {
    const result = await fn();
    performanceMonitor.measure(name);
    return result;
  } catch (error) {
    performanceMonitor.measure(name);
    throw error;
  }
}

/**
 * Track dashboard load performance
 */
export function trackDashboardLoad(): void {
  if (typeof window === 'undefined') return;

  // Mark dashboard loaded
  performanceMonitor.mark('dashboard-loaded');

  // Wait for next frame to ensure all content is rendered
  requestAnimationFrame(() => {
    performanceMonitor.measure('dashboard-load-time', 'dashboard-loaded');

    // Log summary after 2 seconds
    setTimeout(() => {
      performanceMonitor.logSummary();
    }, 2000);
  });
}

/**
 * Track API call performance
 */
export function trackAPICall(endpoint: string, duration: number): void {
  performanceMonitor.metrics.push({
    name: `api:${endpoint}`,
    value: duration,
    timestamp: Date.now(),
  });

  if (duration > 1000 && process.env.NODE_ENV === 'development') {
    console.warn(`⚠️ Slow API call: ${endpoint} took ${duration.toFixed(0)}ms`);
  }
}
