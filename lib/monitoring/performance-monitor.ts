// 性能监控工具 - Web Vitals + 自定义指标
import React from 'react'

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  userId?: string;
}

export interface CustomMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private customMetrics: CustomMetric[] = [];
  private isEnabled = true;
  private reportEndpoint = '/api/performance-metrics';

  constructor() {
    if (typeof window !== 'undefined') {
      this.initWebVitals();
      this.initCustomMetrics();
    }
  }

  private async initWebVitals() {
    // 动态加载 web-vitals，避免构建时缺少依赖导致的类型错误
    let webVitals: any
    try {
      webVitals = await import('web-vitals')
    } catch {
      // 未安装 web-vitals 时跳过
      return
    }

    const reportMetric = (metric: any) => {
      const performanceMetric: PerformanceMetric = {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        timestamp: Date.now(),
        url: window.location.href,
        userId: this.getUserId()
      };
      
      this.addMetric(performanceMetric);
    };

    // 核心Web Vitals指标
    webVitals.getCLS(reportMetric);  // Cumulative Layout Shift
    webVitals.getFID(reportMetric);  // First Input Delay
    webVitals.getFCP(reportMetric);  // First Contentful Paint
    webVitals.getLCP(reportMetric);  // Largest Contentful Paint
    webVitals.getTTFB(reportMetric); // Time to First Byte
  }

  private initCustomMetrics() {
    // 监控页面加载时间
    window.addEventListener('load', () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      this.trackCustomMetric('page_load_time', loadTime, 'ms');
    });

    // 监控资源加载时间
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.trackCustomMetric('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart, 'ms');
            this.trackCustomMetric('dom_interactive', navEntry.domInteractive - navEntry.fetchStart, 'ms');
          }
          
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            if (resourceEntry.name.includes('.js') || resourceEntry.name.includes('.css')) {
              this.trackCustomMetric(`resource_load_${this.getResourceType(resourceEntry.name)}`, resourceEntry.duration, 'ms', {
                resource: resourceEntry.name,
                size: resourceEntry.transferSize
              });
            }
          }
        }
      });
      
      observer.observe({ entryTypes: ['navigation', 'resource'] });
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.webp')) return 'image';
    return 'other';
  }

  private getUserId(): string | undefined {
    // 从localStorage或session中获取用户ID
    try {
      return localStorage.getItem('userId') || undefined;
    } catch {
      return undefined;
    }
  }

  addMetric(metric: PerformanceMetric) {
    if (!this.isEnabled) return;
    
    this.metrics.push(metric);
    
    // 异步发送到服务器
    this.reportMetric(metric);
    
    // 控制台输出（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Performance: ${metric.name} = ${metric.value}${metric.name.includes('time') ? 'ms' : ''} (${metric.rating})`);
    }
  }

  trackCustomMetric(name: string, value: number, unit: string, metadata?: Record<string, any>) {
    if (!this.isEnabled) return;

    const metric: CustomMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      metadata
    };

    this.customMetrics.push(metric);
    
    // 发送自定义指标
    this.reportCustomMetric(metric);
  }

  // 页面特定的性能跟踪
  trackPagePerformance(pageName: string) {
    const startTime = performance.now();
    
    return {
      end: () => {
        const duration = performance.now() - startTime;
        this.trackCustomMetric(`page_render_${pageName}`, duration, 'ms');
      }
    };
  }

  // API请求性能跟踪
  trackAPICall(endpoint: string, method: string = 'GET') {
    const startTime = performance.now();
    
    return {
      success: () => {
        const duration = performance.now() - startTime;
        this.trackCustomMetric('api_call_success', duration, 'ms', { endpoint, method });
      },
      error: (error: string) => {
        const duration = performance.now() - startTime;
        this.trackCustomMetric('api_call_error', duration, 'ms', { endpoint, method, error });
      }
    };
  }

  // 用户交互性能跟踪
  trackUserInteraction(action: string, component: string) {
    const startTime = performance.now();
    
    return {
      end: () => {
        const duration = performance.now() - startTime;
        this.trackCustomMetric('user_interaction', duration, 'ms', { action, component });
      }
    };
  }

  private async reportMetric(metric: PerformanceMetric) {
    try {
      await fetch(this.reportEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'web-vital', ...metric }),
        keepalive: true
      });
    } catch (error) {
      console.warn('Failed to report performance metric:', error);
    }
  }

  private async reportCustomMetric(metric: CustomMetric) {
    try {
      await fetch(this.reportEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'custom', ...metric }),
        keepalive: true
      });
    } catch (error) {
      console.warn('Failed to report custom metric:', error);
    }
  }

  // 获取性能报告
  getPerformanceReport() {
    return {
      webVitals: this.metrics,
      customMetrics: this.customMetrics,
      summary: this.generateSummary()
    };
  }

  private generateSummary() {
    const goodMetrics = this.metrics.filter(m => m.rating === 'good').length;
    const totalMetrics = this.metrics.length;
    
    return {
      score: totalMetrics > 0 ? Math.round((goodMetrics / totalMetrics) * 100) : 0,
      totalMetrics,
      goodMetrics,
      averageLoadTime: this.getAverageCustomMetric('page_load_time'),
      averageAPITime: this.getAverageCustomMetric('api_call_success')
    };
  }

  private getAverageCustomMetric(name: string): number {
    const metrics = this.customMetrics.filter(m => m.name === name);
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
  }

  // 控制监控开关
  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  // 清理旧数据
  cleanup(olderThanHours: number = 24) {
    const cutoff = Date.now() - (olderThanHours * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    this.customMetrics = this.customMetrics.filter(m => m.timestamp > cutoff);
  }
}

// 单例实例
export const performanceMonitor = new PerformanceMonitor();

// React Hook for component performance tracking
export function usePerformanceTracking(componentName: string) {
  const tracker = performanceMonitor.trackPagePerformance(componentName);
  
  React.useEffect(() => {
    return () => tracker.end();
  }, [tracker]);
  
  return {
    trackInteraction: (action: string) => performanceMonitor.trackUserInteraction(action, componentName),
    trackAPI: (endpoint: string, method?: string) => performanceMonitor.trackAPICall(endpoint, method)
  };
}
