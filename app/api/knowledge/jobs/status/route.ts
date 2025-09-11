import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getKnowledgeQueue } from '@/lib/queues/connection'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    const role = (user as any)?.app_metadata?.role
    if (!user || role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || ''
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })

    const queue = await getKnowledgeQueue()
    const job = await queue.getJob(id)
    if (!job) return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 })
    const state = await job.getState()
    const progress = job.progress
    const returnvalue = job.returnvalue
    const failedReason = (job as any).failedReason
    return NextResponse.json({ success: true, data: { id, state, progress, returnvalue, failedReason } })
  } catch (error) {
    console.error('Job status error:', error)
    return NextResponse.json({ success: false, error: '状态查询失败' }, { status: 500 })
  }
}
