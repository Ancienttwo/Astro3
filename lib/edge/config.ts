import { get } from '@vercel/edge-config'

type EdgeNumberKey =
  | 'rate_limit_default_limit'
  | 'rate_limit_default_window'
  | 'cache_ttl_default'
  | 'cache_ttl_fortune'
  | 'cache_ttl_astrology'

type EdgeBooleanKey = 'enable_gateway_cache'

// Small typed helpers around Edge Config with sensible defaults
export async function getNumber(key: EdgeNumberKey, fallback: number): Promise<number> {
  try {
    const v = await get<number>(key)
    if (typeof v === 'number' && !Number.isNaN(v)) return v
  } catch {}
  return fallback
}

export async function getBoolean(key: EdgeBooleanKey, fallback: boolean): Promise<boolean> {
  try {
    const v = await get<boolean>(key)
    if (typeof v === 'boolean') return v
  } catch {}
  return fallback
}

export const edgeDefaults = {
  rateLimit: {
    limit: 60, // requests
    windowSeconds: 60,
  },
  cacheTTL: {
    defaultSeconds: 60,
    fortuneSeconds: 120,
    astrologySeconds: 60,
  },
}

