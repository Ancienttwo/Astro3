import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getKnowledgeQueue } from '@/lib/queues/connection'

const ALL_STATES = ['waiting', 'active', 'delayed', 'completed', 'failed', 'paused'] as const

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    const role = (user as any)?.app_metadata?.role
    if (!user || role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const stateParam = (searchParams.get('state') || 'all').toLowerCase()
    const typeFilter = (searchParams.get('type') || '').toLowerCase()
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const pageSize = Math.max(1, Math.min(100, parseInt(searchParams.get('pageSize') || '20', 10)))
    const start = (page - 1) * pageSize
    const end = start + pageSize - 1

    const queue = getKnowledgeQueue()
    const states = stateParam === 'all' ? ALL_STATES as unknown as string[] : [stateParam]
    const jobs = await queue.getJobs(states as any, start, end)

    const items = await Promise.all(jobs.map(async (job) => {
      const state = await job.getState()
      return {
        id: job.id,
        name: job.name,
        state,
        progress: job.progress,
        timestamp: job.timestamp,
        attemptsMade: job.attemptsMade,
        data: job.data,
        failedReason: (job as any).failedReason,
      }
    }))

    const filtered = typeFilter ? items.filter(it => (it.data?.type || it.name || '').toLowerCase().includes(typeFilter)) : items
    const counts = await queue.getJobCounts(...ALL_STATES as any)

    return NextResponse.json({ success: true, data: { page, pageSize, items: filtered, counts } })
  } catch (error) {
    console.error('Jobs list error:', error)
    return NextResponse.json({ success: false, error: '列表获取失败' }, { status: 500 })
  }
}

