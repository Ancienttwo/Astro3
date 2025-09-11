import { Redis } from '@upstash/redis'

// Upstash Redis client for Edge Runtime
let _edgeRedis: Redis | null = null
export function getEdgeRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  if (!_edgeRedis) {
    _edgeRedis = new Redis({ url, token })
  }
  return _edgeRedis
}

export async function edgeCacheGet(key: string): Promise<string | null> {
  const client = getEdgeRedis()
  if (!client) return null
  try { return (await client.get<string>(key)) ?? null } catch { return null }
}

export async function edgeCacheSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  const client = getEdgeRedis()
  if (!client) return
  try { await client.set(key, value, { ex: ttlSeconds }) } catch {}
}

export async function edgeIncrWithTTL(key: string, ttlSeconds: number): Promise<number> {
  const client = getEdgeRedis()
  if (!client) return 1
  const count = await client.incr(key)
  if (count === 1 && ttlSeconds > 0) {
    await client.expire(key, ttlSeconds)
  }
  return count
}
