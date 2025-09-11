import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  if (process.env.ENABLE_FORTUNE_AGENT !== 'true') {
    return new Response('Fortune Agent disabled', { status: 403 })
  }

  const { query, category } = await request.json()
  if (!query) {
    return new Response('Missing query', { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`))
      }
      try {
        const { fortuneAgentStream } = await (eval('import')('@/lib/langchain/fortune-agent'))
        await fortuneAgentStream({
          query,
          category,
          onToken: (token: string) => send({ token })
        })
        controller.enqueue(encoder.encode('data: ["DONE"]\n\n'))
        controller.close()
      } catch (err: any) {
        send({ error: 'stream_error', message: String(err?.message || err) })
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  })
}

