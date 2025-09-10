// 安全监控和日志记录工具
import { NextRequest } from 'next/server'

interface SecurityEvent {
  type: 'AUTH_FAILURE' | 'RATE_LIMIT' | 'SUSPICIOUS_REQUEST' | 'API_ERROR'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  userId?: string
  ip?: string
  userAgent?: string
  endpoint?: string
  details?: Record<string, any>
  timestamp: string
}

class SecurityMonitor {
  private events: SecurityEvent[] = []
  private readonly MAX_EVENTS = 1000

  // 记录安全事件
  logEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString()
    }

    this.events.push(securityEvent)
    
    // 保持事件数量在限制内
    if (this.events.length > this.MAX_EVENTS) {
      this.events.shift()
    }

    // 高危事件立即输出到控制台
    if (event.severity === 'HIGH' || event.severity === 'CRITICAL') {
      console.error('🚨 安全警告:', securityEvent)
    }

    // 在生产环境中，这里可以发送到外部监控服务
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(securityEvent)
    }
  }

  // 从请求中提取安全相关信息
  extractRequestInfo(request: NextRequest) {
    return {
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      endpoint: request.nextUrl.pathname,
      method: request.method
    }
  }

  // 检查可疑请求模式
  checkSuspiciousPatterns(request: NextRequest): boolean {
    const info = this.extractRequestInfo(request)
    
    // 检查可疑的User-Agent
    const suspiciousUserAgents = [
      'curl', 'wget', 'python-requests', 'bot', 'crawler', 'scanner'
    ]
    
    if (suspiciousUserAgents.some(agent => 
      info.userAgent.toLowerCase().includes(agent)
    )) {
      this.logEvent({
        type: 'SUSPICIOUS_REQUEST',
        severity: 'MEDIUM',
        ip: info.ip,
        userAgent: info.userAgent,
        endpoint: info.endpoint,
        details: { reason: 'suspicious_user_agent' }
      })
      return true
    }

    // 检查可疑的请求路径
    const suspiciousPaths = [
      '/admin', '/wp-admin', '/.env', '/config', '/api/debug'
    ]
    
    if (suspiciousPaths.some(path => 
      info.endpoint.toLowerCase().includes(path)
    )) {
      this.logEvent({
        type: 'SUSPICIOUS_REQUEST',
        severity: 'HIGH',
        ip: info.ip,
        endpoint: info.endpoint,
        details: { reason: 'suspicious_path' }
      })
      return true
    }

    return false
  }

  // 记录认证失败
  logAuthFailure(request: NextRequest, userId?: string, reason?: string) {
    const info = this.extractRequestInfo(request)
    
    this.logEvent({
      type: 'AUTH_FAILURE',
      severity: 'MEDIUM',
      userId,
      ip: info.ip,
      userAgent: info.userAgent,
      endpoint: info.endpoint,
      details: { reason }
    })
  }

  // 记录频率限制触发
  logRateLimit(request: NextRequest, userId?: string) {
    const info = this.extractRequestInfo(request)
    
    this.logEvent({
      type: 'RATE_LIMIT',
      severity: 'MEDIUM',
      userId,
      ip: info.ip,
      endpoint: info.endpoint,
      details: { 
        reason: 'rate_limit_exceeded',
        method: info.method
      }
    })
  }

  // 获取安全统计
  getSecurityStats() {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    
    const recentEvents = this.events.filter(
      event => new Date(event.timestamp) > oneHourAgo
    )

    return {
      totalEvents: this.events.length,
      recentEvents: recentEvents.length,
      eventsByType: this.groupEventsByType(recentEvents),
      eventsBySeverity: this.groupEventsBySeverity(recentEvents),
      topIPs: this.getTopIPs(recentEvents)
    }
  }

  private groupEventsByType(events: SecurityEvent[]) {
    return events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  private groupEventsBySeverity(events: SecurityEvent[]) {
    return events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  private getTopIPs(events: SecurityEvent[]) {
    const ipCounts = events.reduce((acc, event) => {
      if (event.ip) {
        acc[event.ip] = (acc[event.ip] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return Object.entries(ipCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }))
  }

  // 发送到外部监控服务（生产环境）
  private async sendToMonitoringService(event: SecurityEvent) {
    try {
      // 这里可以集成外部监控服务，如：
      // - Sentry
      // - DataDog
      // - 自定义监控API
      
      // 示例：发送到webhook
      if (process.env.SECURITY_WEBHOOK_URL) {
        await fetch(process.env.SECURITY_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event)
        })
      }
    } catch (error) {
      console.error('发送安全事件到监控服务失败:', error)
    }
  }
}

// 单例实例
export const securityMonitor = new SecurityMonitor()

// 安全中间件函数
export function createSecurityMiddleware() {
  return (request: NextRequest) => {
    // 检查可疑请求
    if (securityMonitor.checkSuspiciousPatterns(request)) {
      // 可疑请求已被记录，但不阻止继续处理
      // 在生产环境中，可以选择返回403或进行其他处理
    }
    
    return true // 允许继续处理
  }
}

// 导出类型
export type { SecurityEvent } 