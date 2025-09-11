import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { enqueueIngestJob } from '@/lib/queues/knowledge-ingest-queue'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    const role = (user as any)?.app_metadata?.role
    if (!user || role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const type = body?.type
    const options = body?.options
    if (!type || !options) return NextResponse.json({ success: false, error: 'Missing type/options' }, { status: 400 })

    if (type !== 'notion' && type !== 'drive') {
      return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 })
    }

    const jobId = await enqueueIngestJob({ type, options })
    return NextResponse.json({ success: true, data: { jobId } })
  } catch (error) {
    console.error('Enqueue job error:', error)
    return NextResponse.json({ success: false, error: '队列入列失败' }, { status: 500 })
  }
}

