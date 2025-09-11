import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { isAddress } from 'viem'

/**
 * GET /api/notifications
 * 读取用户最近的任务/积分活动，生成通知列表（真实数据源：user_tasks）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
    const limit = Math.max(parseInt(searchParams.get('limit') || '20', 10), 1)
    const offset = (page - 1) * limit

    const supabase = getSupabaseAdmin()

    // 用户识别：优先 X-Wallet-Address，再尝试 Authorization Bearer（钱包或Supabase token）
    let wallet = request.headers.get('X-Wallet-Address') || ''
    if (wallet && !isAddress(wallet as `0x${string}`)) wallet = ''

    let userId: string | null = null
    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      if (isAddress(token as `0x${string}`)) {
        wallet = wallet || token
      } else {
        try {
          const { data: { user } } = await supabase.auth.getUser(token)
          userId = user?.id || null
        } catch {}
      }
    }

    // 查询 user_tasks 作为事件源（如无记录则返回空）
    let query = supabase
      .from('user_tasks')
      .select('id, status, created_at, updated_at, task_id')
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (wallet) query = query.eq('wallet_address', wallet.toLowerCase())
    if (!wallet && userId) query = query.eq('user_id', userId)

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
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}
