import { NextRequest, NextResponse } from 'next/server'
import { securityMonitor } from '@/lib/security-monitor'

// 获取安全状态 - 仅管理员可访问
export async function GET(request: NextRequest) {
  try {
    // 简单的管理员验证（生产环境应该使用更严格的验证）
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '需要认证' }, { status: 401 })
    }

    // 检查是否为管理员（这里简化处理）
    const adminToken = process.env.ADMIN_ACCESS_TOKEN
    if (!adminToken || authHeader !== `Bearer ${adminToken}`) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    // 获取安全统计
    const stats = securityMonitor.getSecurityStats()
    
    // 系统健康检查
    const healthCheck = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }

    return NextResponse.json({
      success: true,
      data: {
        security: stats,
        health: healthCheck,
        recommendations: generateSecurityRecommendations(stats)
      }
    })

  } catch (error) {
    console.error('获取安全状态失败:', error)
    return NextResponse.json({ 
      error: '获取安全状态失败' 
    }, { status: 500 })
  }
}

// 生成安全建议
function generateSecurityRecommendations(stats: any) {
  const recommendations = []

  // 检查认证失败次数
  if (stats.eventsByType?.AUTH_FAILURE > 10) {
    recommendations.push({
      type: 'AUTH_SECURITY',
      level: 'HIGH',
      message: '检测到大量认证失败，建议启用账户锁定机制'
    })
  }

  // 检查频率限制触发
  if (stats.eventsByType?.RATE_LIMIT > 5) {
    recommendations.push({
      type: 'RATE_LIMITING',
      level: 'MEDIUM',
      message: '频繁触发频率限制，建议优化频率限制策略'
    })
  }

  // 检查可疑请求
  if (stats.eventsByType?.SUSPICIOUS_REQUEST > 3) {
    recommendations.push({
      type: 'SUSPICIOUS_ACTIVITY',
      level: 'HIGH',
      message: '检测到可疑请求，建议加强IP过滤'
    })
  }

  // 检查高危事件
  if (stats.eventsBySeverity?.HIGH > 0 || stats.eventsBySeverity?.CRITICAL > 0) {
    recommendations.push({
      type: 'CRITICAL_EVENTS',
      level: 'CRITICAL',
      message: '检测到高危安全事件，需要立即处理'
    })
  }

  return recommendations
} 