import { NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getKnowledgeQueue } from '@/lib/queues/connection'

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  const role = (user as any)?.app_metadata?.role
  if (!user || role !== 'admin') {
    return new Response('Forbidden', { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id') || ''
  if (!id) return new Response('Missing id', { status: 400 })

  const encoder = new TextEncoder()
  const queue = getKnowledgeQueue()
  let timer: any

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: any) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`))
      const sendStatus = async () => {
        try {
          const job = await queue.getJob(id)
          if (!job) { send({ state: 'missing' }); return }
          const state = await job.getState()
          const progress = job.progress
          send({ state, progress })
          if (state === 'completed' || state === 'failed') {
            const payload = state === 'completed' ? job.returnvalue : { failedReason: (job as any).failedReason }
            send({ done: true, state, ...payload })
            controller.close()
            clearInterval(timer)
          }
        } catch (err: any) {
          send({ error: String(err?.message || err) })
        }
      }
      await sendStatus()
      timer = setInterval(sendStatus, 1000)
    },
    cancel() { clearInterval(timer) }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  })
}

