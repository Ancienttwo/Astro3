export const runtime = 'edge'

import { checkEdgeRateLimit, ipFromHeaders } from '@/lib/edge/rate-limit'
import { getBoolean, getNumber, edgeDefaults } from '@/lib/edge/config'
import { edgeCacheGet, edgeCacheSet } from '@/lib/edge/redis-cache'

function resolveAstrologyTarget(pathParts: string[]): string {
  // Known mapping for astrology endpoints
  const [head, ...rest] = pathParts
  switch ((head || '').toLowerCase()) {
    case 'charts':
      return `/api/charts/${rest.join('/')}`.replace(/\/$/, '') || '/api/charts'
    case 'bazi':
      return '/api/bazi-analysis'
    case 'ziwei':
      return '/api/ziwei-analysis'
    case 'ai-analyses':
      return `/api/ai-analyses/${rest.join('/')}`.replace(/\/$/, '') || '/api/ai-analyses'
    case 'analysis-stream':
      return `/api/analysis-stream/${rest.join('/')}`.replace(/\/$/, '') || '/api/analysis-stream'
    case 'analysis-tasks':
      return `/api/analysis-tasks/${rest.join('/')}`.replace(/\/$/, '') || '/api/analysis-tasks'
    default:
      // Fallback to direct pass /api/<requested>
      return `/api/${[head, ...rest].join('/')}`
  }
}

function buildTargetUrl(req: Request, slug: string[]): string {
  const url = new URL(req.url)
  url.pathname = resolveAstrologyTarget(slug)
  return url.toString()
}

async function proxy(req: Request, slug: string[]): Promise<Response> {
  const ip = ipFromHeaders(req.headers)
  const rl = await checkEdgeRateLimit(ip, 'astrology')
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
  const method = req.method.toUpperCase()

  // Optional GET cache for public astrology reads
  const hasAuth = !!req.headers.get('authorization')
  const enableCache = await getBoolean('enable_gateway_cache', true)
  const ttl = await getNumber('cache_ttl_astrology', edgeDefaults.cacheTTL.astrologySeconds)
  if (method === 'GET' && enableCache && !hasAuth) {
    const cacheKey = `edge:cache:astrology:${new URL(target).pathname}${new URL(target).search}`
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

    const ct = resp.headers.get('content-type') || ''
    if (resp.ok && !ct.includes('text/event-stream')) {
      const text = await resp.clone().text()
      await edgeCacheSet(cacheKey, text, ttl)
    }
    return resp
  }

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
