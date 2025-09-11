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

    const { source } = await request.json()
    if (!source) return NextResponse.json({ success: false, error: 'source required' }, { status: 400 })
    const mod = await (eval('import')('@/lib/services/knowledge-maintenance'))
    const result = await mod.dedupeBySource(source)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Dedupe error:', error)
    return NextResponse.json({ success: false, error: '去重失败' }, { status: 500 })
  }
}

