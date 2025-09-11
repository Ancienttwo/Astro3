import { edgeIncrWithTTL } from './redis-cache'
import { getNumber, edgeDefaults } from './config'

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export async function checkEdgeRateLimit(identifier: string, action: string): Promise<RateLimitResult> {
  const limit = await getNumber('rate_limit_default_limit', edgeDefaults.rateLimit.limit)
  const window = await getNumber('rate_limit_default_window', edgeDefaults.rateLimit.windowSeconds)

  const key = `edge:ratelimit:${action}:${identifier}`
  const now = Date.now()

  try {
    const current = await edgeIncrWithTTL(key, window)
    const remaining = Math.max(0, limit - current)
    return {
      allowed: current <= limit,
      remaining,
      resetAt: now + window * 1000,
    }
  } catch {
    // Fail open if redis unavailable
    return { allowed: true, remaining: limit, resetAt: now + window * 1000 }
  }
}

export function ipFromHeaders(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const real = headers.get('x-real-ip')?.trim()
  return fwd || real || 'unknown'
}

