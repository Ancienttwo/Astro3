import { NextRequest } from 'next/server'

// 内存存储 - 生产环境建议使用Redis
const attempts = new Map<string, number[]>()
const suspiciousIPs = new Set<string>()

interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  blockDurationMs?: number
}

export function checkRateLimit(
  request: NextRequest, 
  config: RateLimitConfig = {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15分钟
    blockDurationMs: 60 * 60 * 1000 // 1小时
  }
): { allowed: boolean; remainingAttempts?: number; blockUntil?: number } {
  const forwarded = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
  
  const now = Date.now()
  const { maxAttempts, windowMs, blockDurationMs } = config
  
  // 检查是否在黑名单中
  if (suspiciousIPs.has(ip)) {
    return { 
      allowed: false, 
      blockUntil: now + (blockDurationMs || windowMs)
    }
  }
  
  // 获取该IP的尝试记录
  const userAttempts = attempts.get(ip) || []
  
  // 清理过期的尝试记录
  const recentAttempts = userAttempts.filter(time => now - time < windowMs)
  
  // 检查是否超过限制
  if (recentAttempts.length >= maxAttempts) {
    // 标记为可疑IP
    suspiciousIPs.add(ip)
    
    // 清理可疑IP列表（1小时后）
    setTimeout(() => {
      suspiciousIPs.delete(ip)
    }, blockDurationMs || windowMs)
    
    console.warn(`🚨 Rate limit exceeded for IP: ${ip}`)
    
    return { 
      allowed: false, 
      remainingAttempts: 0,
      blockUntil: now + (blockDurationMs || windowMs)
    }
  }
  
  // 记录本次尝试
  recentAttempts.push(now)
  attempts.set(ip, recentAttempts)
  
  return { 
    allowed: true, 
    remainingAttempts: maxAttempts - recentAttempts.length 
  }
}

// 清理过期记录的定时任务
setInterval(() => {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000
  
  for (const [ip, attemptTimes] of attempts.entries()) {
    const recentAttempts = attemptTimes.filter(time => now - time < windowMs)
    if (recentAttempts.length === 0) {
      attempts.delete(ip)
    } else {
      attempts.set(ip, recentAttempts)
    }
  }
}, 5 * 60 * 1000) // 每5分钟清理一次

export function recordFailedAttempt(ip: string, reason: string) {
  console.warn(`🔐 Failed auth attempt from ${ip}: ${reason}`)
  
  // 记录到审计日志（如果需要持久化）
  // TODO: 添加到数据库审计表
}

export function getIPAttemptCount(request: NextRequest): number {
  const forwarded = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
  
  const userAttempts = attempts.get(ip) || []
  const now = Date.now()
  const windowMs = 15 * 60 * 1000
  
  return userAttempts.filter(time => now - time < windowMs).length
}
