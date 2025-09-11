import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    if (process.env.ENABLE_FORTUNE_AGENT !== 'true') {
      return NextResponse.json({ success: false, error: 'Fortune Agent disabled' }, { status: 403 })
    }

    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    const role = (user as any)?.app_metadata?.role
    if (!user || role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { source, category, all, batchSize = 16, concurrency = 4 } = await request.json()
    const mod = await (eval('import')('@/lib/services/knowledge-maintenance'))
    let result
    if (source) result = await mod.reembedBySource(source, batchSize, concurrency)
    else if (category) result = await mod.reembedByCategory(category, batchSize, concurrency)
    else if (all) result = await mod.reembedAll(batchSize, concurrency)
    else return NextResponse.json({ success: false, error: 'Missing selector' }, { status: 400 })
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Reembed error:', error)
    return NextResponse.json({ success: false, error: '重嵌入失败' }, { status: 500 })
  }
}

