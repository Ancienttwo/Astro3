import { getEdgeRedis } from './redis-cache'

export async function invalidateAstrologyChart(chartId: string) {
  const keys = [
    `edge:cache:astrology:/api/charts/${chartId}`,
  ]
  try {
    const client = getEdgeRedis()
    if (client && keys.length) await client.del(...keys)
  } catch {}
}

export async function invalidateFortuneSlip(temple: string, slip: string) {
  const path = `/api/fortune/slips/${temple}/${slip}`
  const key = `edge:cache:fortune:${path}`
  try { const c = getEdgeRedis(); if (c) await c.del(key) } catch {}
}

export async function invalidateByExactPath(path: string, namespace: 'fortune' | 'astrology' | 'user' = 'fortune') {
  const key = `edge:cache:${namespace}:${path}`
  try { const c = getEdgeRedis(); if (c) await c.del(key) } catch {}
}
