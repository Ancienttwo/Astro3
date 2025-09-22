import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/server/db'
import { isAddress } from 'viem'
import { resolveAuth, requireAuth } from '@/lib/auth-adapter'

/**
 * GET /api/notifications
 * 读取用户最近的任务/积分活动，生成通知列表（真实数据源：user_tasks）
 */
export async function GET(request: NextRequest) {
  try {
    // 强制要求认证，缺少/无效token则直接返回401
    let mustAuth
    try {
      mustAuth = await requireAuth(request)
    } catch (e: any) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
    const limit = Math.max(parseInt(searchParams.get('limit') || '20', 10), 1)
    const offset = (page - 1) * limit

    const supabase = getSupabaseAdminClient()
    // 认证通过后再解析详细身份（wallet/id）
    const auth = await resolveAuth(request)
    const wallet = auth.walletAddress || mustAuth.walletAddress || ''
    const userId = auth.id || mustAuth.id

    // 查询 user_tasks 作为事件源（如无记录则返回空）
    let query = supabase
      .from('user_tasks')
      .select('id, status, created_at, updated_at, task_id')
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // 安全过滤：必须绑定到当前用户（wallet或userId），否则返回空
    if (wallet) {
      query = query.eq('wallet_address', wallet.toLowerCase())
    } else if (userId) {
      query = query.eq('user_id', userId)
    } else {
      return NextResponse.json({ success: true, data: [], pagination: { page, limit, hasNext: false, hasPrev: page > 1 } })
    }

    const { data: rows, error } = await query
    if (error) {
      console.warn('Notifications query error:', error)
    }

    const notifications = (rows || []).map((r: any) => ({
      id: `notif-${r.id}`,
      type: r.status === 'claimed' ? 'validation_reward' : 'aid_request',
      title: r.status === 'claimed' ? '奖励已领取' : '任务更新',
      message: r.status === 'claimed' ? '您已成功领取任务奖励' : `任务状态: ${r.status}`,
      timestamp: r.updated_at || r.created_at,
      read: false
    }))

    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total: undefined,
        totalPages: undefined,
        hasNext: notifications.length === limit,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Notifications API error:', error)
    const anyErr: any = error
    if (anyErr?.status === 401) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 })
  }
}
