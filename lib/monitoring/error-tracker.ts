import { getSupabaseAdminClient } from '@/lib/server/db';

interface ErrorLog {
  message: string;
  stack?: string;
  level: 'error' | 'warning' | 'info';
  context?: Record<string, any>;
  userAgent?: string;
  url?: string;
  userId?: string;
  sessionId?: string;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
}

export class ErrorTracker {
  private static instance: ErrorTracker;
  private queue: ErrorLog[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly maxQueueSize = 50;
  private readonly flushIntervalMs = 5000;
  
  private constructor() {
    if (typeof window !== 'undefined') {
      this.setupBrowserErrorHandlers();
    }
    this.startFlushInterval();
  }
  
  static getInstance(): ErrorTracker {
    if (!this.instance) {
      this.instance = new ErrorTracker();
    }
    return this.instance;
  }
  
  // Setup browser error handlers
  private setupBrowserErrorHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        level: 'error',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });
    
    // Unhandled promise rejection
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        level: 'error',
        context: {
          promise: event.promise,
        },
      });
    });
  }
  
  // Log error
  logError(error: ErrorLog) {
    // Add metadata
    const enrichedError: ErrorLog = {
      ...error,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      sessionId: this.getSessionId(),
    };
    
    // Filter out sensitive data
    enrichedError.context = this.sanitizeContext(enrichedError.context);
    
    // Add to queue
    this.queue.push(enrichedError);
    
    // Flush if queue is full
    if (this.queue.length >= this.maxQueueSize) {
      this.flush();
    }
  }
  
  // Sanitize context to remove sensitive data
  private sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context) return undefined;
    
    const sensitiveKeys = ['password', 'token', 'secret', 'api_key', 'credit_card'];
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(context)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeContext(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
  
  // Get or create session ID
  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server';
    
    let sessionId = sessionStorage.getItem('error_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('error_session_id', sessionId);
    }
    return sessionId;
  }
  
  // Start flush interval
  private startFlushInterval() {
    this.flushInterval = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, this.flushIntervalMs);
  }
  
  // Flush errors to database
  async flush() {
    if (this.queue.length === 0) return;
    
    const errors = [...this.queue];
    this.queue = [];
    
    try {
      if (typeof window !== 'undefined') {
        // 客户端环境不直接写库，可在此改为调用后端API
        return;
      }
      const supabase = getSupabaseAdminClient();
      
      const { error } = await supabase
        .from('error_logs')
        .insert(
          errors.map(err => ({
            message: err.message,
            stack: err.stack,
            level: err.level,
            context: err.context,
            user_agent: err.userAgent,
            url: err.url,
            user_id: err.userId,
            session_id: err.sessionId,
            created_at: new Date().toISOString(),
          }))
        );
      
      if (error) {
        console.error('Failed to log errors:', error);
        // Put errors back in queue if failed
        this.queue.unshift(...errors);
      }
    } catch (err) {
      console.error('Error tracker flush failed:', err);
    }
  }
  
  // Clean up
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flush();
  }
}

// Performance monitoring without Sentry
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  
  static getInstance(): PerformanceMonitor {
    if (!this.instance) {
      this.instance = new PerformanceMonitor();
    }
    return this.instance;
  }
  
  // Track API performance
  trackApiPerformance(route: string, duration: number, status: number) {
    this.recordMetric({
      name: `api.${route.replace(/\//g, '_')}`,
      value: duration,
      unit: 'ms',
      tags: {
        status: status.toString(),
        slow: duration > 3000 ? 'true' : 'false',
      },
    });
  }
  
  // Track database query
  trackDatabaseQuery(query: string, duration: number) {
    const queryType = query.trim().split(' ')[0].toLowerCase();
    this.recordMetric({
      name: `db.${queryType}`,
      value: duration,
      unit: 'ms',
      tags: {
        slow: duration > 1000 ? 'true' : 'false',
      },
    });
  }
  
  // Track external API
  trackExternalApi(service: string, endpoint: string, duration: number, status: number) {
    this.recordMetric({
      name: `external.${service}`,
      value: duration,
      unit: 'ms',
      tags: {
        endpoint,
        status: status.toString(),
      },
    });
  }
  
  // Track business metric
  trackBusinessMetric(name: string, value: number, tags?: Record<string, string>) {
    this.recordMetric({
      name: `business.${name}`,
      value,
      unit: 'count',
      tags,
    });
  }
  
  // Track page load
  trackPageLoad(pageName: string) {
    if (typeof window !== 'undefined' && window.performance) {
      const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (perfData) {
        this.recordMetric({
          name: `pageload.${pageName}`,
          value: perfData.loadEventEnd - perfData.fetchStart,
          unit: 'ms',
          tags: {
            dns: Math.round(perfData.domainLookupEnd - perfData.domainLookupStart).toString(),
            tcp: Math.round(perfData.connectEnd - perfData.connectStart).toString(),
            ttfb: Math.round(perfData.responseStart - perfData.requestStart).toString(),
          },
        });
      }
    }
  }
  
  // Record metric
  private recordMetric(metric: PerformanceMetric) {
    this.metrics.push({
      ...metric,
      tags: {
        ...metric.tags,
        timestamp: new Date().toISOString(),
      },
    });
    
    // Batch write to database every 10 metrics
    if (this.metrics.length >= 10) {
      this.flushMetrics();
    }
  }
  
  // Flush metrics to database
  async flushMetrics() {
    if (this.metrics.length === 0) return;
    
    const metricsToSend = [...this.metrics];
    this.metrics = [];
    
    try {
      if (typeof window !== 'undefined') {
        // 客户端环境不直接写库
        return;
      }
      const supabase = getSupabaseAdmin();
      
      const { error } = await supabase
        .from('performance_metrics')
        .insert(
          metricsToSend.map(metric => ({
            name: metric.name,
            value: metric.value,
            unit: metric.unit,
            tags: metric.tags,
            created_at: new Date().toISOString(),
          }))
        );
      
      if (error) {
        console.error('Failed to log metrics:', error);
      }
    } catch (err) {
      console.error('Performance monitor flush failed:', err);
    }
  }
}

// Export singleton instances
export const errorTracker = ErrorTracker.getInstance();
export const performanceMonitor = PerformanceMonitor.getInstance();
