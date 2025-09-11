export const runtime = 'edge'

import { checkEdgeRateLimit, ipFromHeaders } from '@/lib/edge/rate-limit'
import { edgeCacheGet, edgeCacheSet } from '@/lib/edge/redis-cache'
import { getBoolean, getNumber, edgeDefaults } from '@/lib/edge/config'

function buildTargetUrl(req: Request, slug: string[]): string {
  const url = new URL(req.url)
  // Map /api/v2/fortune/<rest> -> /api/fortune/<rest>
  const rest = slug.join('/')
  url.pathname = `/api/fortune/${rest}`
  return url.toString()
}

async function proxy(req: Request, slug: string[]): Promise<Response> {
  const ip = ipFromHeaders(req.headers)
  const rl = await checkEdgeRateLimit(ip, 'fortune')
  if (!rl.allowed) {
    return new Response(
      JSON.stringify({ error: 'Too Many Requests' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': String(rl.remaining),
          'X-RateLimit-Reset': String(rl.resetAt),
        },
      },
    )
  }

  const target = buildTargetUrl(req, slug)

  // Simple GET cache for unauthenticated requests
  const method = req.method.toUpperCase()
  const hasAuth = !!req.headers.get('authorization')
  const enableCache = await getBoolean('enable_gateway_cache', true)
  const ttl = await getNumber('cache_ttl_fortune', edgeDefaults.cacheTTL.fortuneSeconds)

  if (method === 'GET' && enableCache && !hasAuth) {
    const cacheKey = `edge:cache:fortune:${new URL(target).pathname}${new URL(target).search}`
    const cached = await edgeCacheGet(cacheKey)
    if (cached) {
      return new Response(cached, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Edge-Cache': 'HIT',
        },
      })
    }

    const resp = await fetch(target, {
      method,
      headers: req.headers,
    })

    // do not cache streams or non-200
    const ct = resp.headers.get('content-type') || ''
    if (resp.ok && !ct.includes('text/event-stream')) {
      const text = await resp.clone().text()
      await edgeCacheSet(cacheKey, text, ttl)
    }
    return resp
  }

  // default pass-through
  return fetch(target, { method, headers: req.headers, body: method === 'GET' || method === 'HEAD' ? undefined : req.body })
}

export async function GET(req: Request, { params }: { params: { slug: string[] } }) {
  return proxy(req, params.slug)
}
export async function POST(req: Request, { params }: { params: { slug: string[] } }) {
  return proxy(req, params.slug)
}
export async function PUT(req: Request, { params }: { params: { slug: string[] } }) {
  return proxy(req, params.slug)
}
export async function DELETE(req: Request, { params }: { params: { slug: string[] } }) {
  return proxy(req, params.slug)
}
export async function PATCH(req: Request, { params }: { params: { slug: string[] } }) {
  return proxy(req, params.slug)
}
export async function OPTIONS() {
  return new Response(null, { status: 204 })
}
