export const runtime = 'edge'

import { checkEdgeRateLimit, ipFromHeaders } from '@/lib/edge/rate-limit'

function buildTargetUrl(req: Request, slug: string[]): string {
  const url = new URL(req.url)
  // Map /api/v2/user/<rest> -> /api/user/<rest>
  const rest = slug.join('/')
  url.pathname = `/api/user/${rest}`
  return url.toString()
}

async function proxy(req: Request, slug: string[]): Promise<Response> {
  const ip = ipFromHeaders(req.headers)
  const rl = await checkEdgeRateLimit(ip, 'user')
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
