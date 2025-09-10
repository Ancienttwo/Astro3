import Redis from 'ioredis'

// Redis client for rate limiting
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
})

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  blockDurationMs?: number // Block duration after limit exceeded
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  blocked?: boolean
  blockUntil?: number
}

export class EmailRateLimiter {
  private configs: Map<string, RateLimitConfig> = new Map()

  constructor() {
    // Default rate limit configurations
    this.configs.set('signup', {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3, // 3 signups per hour per IP/email
      blockDurationMs: 24 * 60 * 60 * 1000 // 24 hour block after exceeded
    })

    this.configs.set('signin', {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // 5 attempts per 15 minutes
      blockDurationMs: 60 * 60 * 1000 // 1 hour block
    })

    this.configs.set('password_reset', {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3, // 3 password resets per hour
      blockDurationMs: 2 * 60 * 60 * 1000 // 2 hour block
    })

    this.configs.set('verification_email', {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 5, // 5 verification emails per hour
      blockDurationMs: 60 * 60 * 1000 // 1 hour block
    })
  }

  /**
   * Check rate limit for email operation
   */
  async checkRateLimit(
    operation: string,
    identifier: string, // IP address or email
    customConfig?: RateLimitConfig
  ): Promise<RateLimitResult> {
    const config = customConfig || this.configs.get(operation)
    if (!config) {
      throw new Error(`No rate limit config found for operation: ${operation}`)
    }

    const key = `email_rate_limit:${operation}:${identifier}`
    const blockKey = `email_block:${operation}:${identifier}`

    try {
      // Check if currently blocked
      const blockUntil = await redis.get(blockKey)
      if (blockUntil) {
        const blockTime = parseInt(blockUntil)
        if (Date.now() < blockTime) {
          return {
            allowed: false,
            remaining: 0,
            resetTime: blockTime,
            blocked: true,
            blockUntil: blockTime
          }
        } else {
          // Block expired, remove it
          await redis.del(blockKey)
        }
      }

      // Get current request count
      const currentCount = await redis.get(key)
      const count = currentCount ? parseInt(currentCount) : 0
      
      const now = Date.now()
      const windowStart = now - config.windowMs
      const resetTime = now + config.windowMs

      if (count >= config.maxRequests) {
        // Rate limit exceeded
        if (config.blockDurationMs) {
          const blockUntil = now + config.blockDurationMs
          await redis.setex(blockKey, Math.ceil(config.blockDurationMs / 1000), blockUntil.toString())
        }

        return {
          allowed: false,
          remaining: 0,
          resetTime,
          blocked: !!config.blockDurationMs,
          blockUntil: config.blockDurationMs ? now + config.blockDurationMs : undefined
        }
      }

      // Increment counter
      const newCount = count + 1
      await redis.setex(key, Math.ceil(config.windowMs / 1000), newCount.toString())

      return {
        allowed: true,
        remaining: config.maxRequests - newCount,
        resetTime
      }

    } catch (error) {
      console.error('Rate limit check failed:', error)
      // Fail open - allow request if Redis is down
      return {
        allowed: true,
        remaining: 999,
        resetTime: Date.now() + config.windowMs
      }
    }
  }

  /**
   * Get rate limit status without incrementing
   */
  async getRateLimitStatus(operation: string, identifier: string): Promise<RateLimitResult> {
    const config = this.configs.get(operation)
    if (!config) {
      throw new Error(`No rate limit config found for operation: ${operation}`)
    }

    const key = `email_rate_limit:${operation}:${identifier}`
    const blockKey = `email_block:${operation}:${identifier}`

    try {
      // Check if blocked
      const blockUntil = await redis.get(blockKey)
      if (blockUntil) {
        const blockTime = parseInt(blockUntil)
        if (Date.now() < blockTime) {
          return {
            allowed: false,
            remaining: 0,
            resetTime: blockTime,
            blocked: true,
            blockUntil: blockTime
          }
        }
      }

      const currentCount = await redis.get(key)
      const count = currentCount ? parseInt(currentCount) : 0
      
      return {
        allowed: count < config.maxRequests,
        remaining: Math.max(0, config.maxRequests - count),
        resetTime: Date.now() + config.windowMs
      }

    } catch (error) {
      console.error('Rate limit status check failed:', error)
      return {
        allowed: true,
        remaining: 999,
        resetTime: Date.now() + config.windowMs
      }
    }
  }

  /**
   * Clear rate limit for identifier
   */
  async clearRateLimit(operation: string, identifier: string): Promise<void> {
    const key = `email_rate_limit:${operation}:${identifier}`
    const blockKey = `email_block:${operation}:${identifier}`
    
    try {
      await redis.del(key, blockKey)
    } catch (error) {
      console.error('Failed to clear rate limit:', error)
    }
  }

  /**
   * Add custom rate limit configuration
   */
  addConfig(operation: string, config: RateLimitConfig): void {
    this.configs.set(operation, config)
  }
}

// Export singleton instance
export const emailRateLimiter = new EmailRateLimiter()

/**
 * Middleware function for Next.js API routes
 */
export function withEmailRateLimit(operation: string) {
  return async function rateLimitMiddleware(
    request: Request,
    identifier?: string
  ): Promise<{ allowed: boolean; response?: Response }> {
    
    // Get identifier from IP or email in request body
    let rateLimitId = identifier
    if (!rateLimitId) {
      const forwardedFor = request.headers.get('x-forwarded-for')
      const realIP = request.headers.get('x-real-ip')
      rateLimitId = forwardedFor?.split(',')[0] || realIP || 'unknown'
    }

    const result = await emailRateLimiter.checkRateLimit(operation, rateLimitId)

    if (!result.allowed) {
      const response = new Response(
        JSON.stringify({
          error: result.blocked 
            ? `Too many ${operation} attempts. Blocked until ${new Date(result.blockUntil!).toISOString()}`
            : `Rate limit exceeded for ${operation}. Try again after ${new Date(result.resetTime).toISOString()}`,
          rateLimitExceeded: true,
          resetTime: result.resetTime,
          blocked: result.blocked,
          blockUntil: result.blockUntil
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': emailRateLimiter.configs.get(operation)?.maxRequests.toString() || '0',
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
          }
        }
      )

      return { allowed: false, response }
    }

    return { allowed: true }
  }
}