import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getKnowledgeQueue } from '@/lib/queues/connection'

export async function DELETE(request: NextRequest) {
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

    const queue = getKnowledgeQueue()
    const job = await queue.getJob(id)
    if (!job) return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 })
    const state = await job.getState()
    if (state === 'waiting' || state === 'delayed' || state === 'paused') {
      await job.remove()
      return NextResponse.json({ success: true, data: { id, state: 'removed' } })
    }
    return NextResponse.json({ success: false, error: `Cannot cancel job in state: ${state}` }, { status: 409 })
  } catch (error) {
    console.error('Cancel job error:', error)
    return NextResponse.json({ success: false, error: '取消失败' }, { status: 500 })
  }
}

