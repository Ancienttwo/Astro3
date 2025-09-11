import { NextRequest } from 'next/server'
import Redis from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
})

interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  blockDurationMs?: number
  bucket?: string // logical namespace, optional
}

export async function checkRateLimitRedis(
  request: NextRequest,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remainingAttempts?: number; blockUntil?: number }> {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    (request as any).ip ||
    'unknown'

  const bucket = config.bucket || 'default'
  const key = `rl:${bucket}:${ip}`
  const blockKey = `rl:block:${bucket}:${ip}`
  const now = Date.now()

  try {
    const blockedUntil = await redis.get(blockKey)
    if (blockedUntil) {
      const until = parseInt(blockedUntil)
      if (now < until) {
        return { allowed: false, remainingAttempts: 0, blockUntil: until }
      }
      await redis.del(blockKey)
    }

    const current = parseInt((await redis.get(key)) || '0')
    if (current >= config.maxAttempts) {
      if (config.blockDurationMs) {
        const until = now + config.blockDurationMs
        await redis.setex(blockKey, Math.ceil(config.blockDurationMs / 1000), String(until))
      }
      return { allowed: false, remainingAttempts: 0, blockUntil: now + (config.blockDurationMs || config.windowMs) }
    }

    const next = await redis.incr(key)
    if (next === 1) {
      await redis.expire(key, Math.ceil(config.windowMs / 1000))
    }

    return {
      allowed: true,
      remainingAttempts: Math.max(0, config.maxAttempts - next),
    }
  } catch (e) {
    // Fail open if Redis has issues
    return { allowed: true, remainingAttempts: config.maxAttempts }
  }
}
