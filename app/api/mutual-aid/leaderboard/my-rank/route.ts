import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { isAddress } from 'viem'

function fmt(addr: string) {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''
}

/**
 * GET /api/mutual-aid/leaderboard/my-rank
 * 计算当前用户（优先Web3地址）的排名（真实数据源）
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()

    // 获取用户上下文：优先 Web3 地址
    let wallet = request.headers.get('X-Wallet-Address') || ''
    if (wallet && !isAddress(wallet as `0x${string}`)) wallet = ''

    let userId: string | null = null
    const authHeader = request.headers.get('Authorization')
    if (!wallet && authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      // 如果是钱包地址，则不作为Supabase Token处理
      if (!isAddress(token as `0x${string}`)) {
        try {
          const { data: { user } } = await supabase.auth.getUser(token)
          userId = user?.id || null
        } catch {}
      } else {
        wallet = token
      }
    }

    if (!wallet && !userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // 仅实现 Web3 排名（数据表：user_points_web3）
    if (wallet) {
      const { data: userPoints, error } = await supabase
        .from('user_points_web3')
        .select('*')
        .eq('wallet_address', wallet.toLowerCase())
        .eq('is_active', true)
        .single()

      if (error || !userPoints) {
        return NextResponse.json({
          success: true,
          data: {
            ranked: false,
            rank: null,
            points: 0,
            user: { wallet, display: fmt(wallet) },
            message: 'Welcome! Complete your first task to appear on the leaderboard.'
          }
        })
      }

      // 计算三项排名
      const [{ count: higherByTotal }, { count: higherByBalance }, { count: higherByStreak }] = await Promise.all([
        supabase.from('user_points_web3').select('*', { count: 'exact', head: true }).eq('is_active', true).gt('total_chain_earned', userPoints.total_chain_earned),
        supabase.from('user_points_web3').select('*', { count: 'exact', head: true }).eq('is_active', true).gt('chain_points_balance', userPoints.chain_points_balance),
        supabase.from('user_points_web3').select('*', { count: 'exact', head: true }).eq('is_active', true).gt('consecutive_days', userPoints.consecutive_days),
      ])

      return NextResponse.json({
        success: true,
        data: {
          ranked: true,
          rank: {
            total: (higherByTotal || 0) + 1,
            balance: (higherByBalance || 0) + 1,
            consecutive: (higherByStreak || 0) + 1,
          },
          points: userPoints.total_chain_earned || 0,
          user: {
            wallet,
            display: fmt(wallet),
            chainPointsBalance: userPoints.chain_points_balance,
            totalChainEarned: userPoints.total_chain_earned,
            consecutiveDays: userPoints.consecutive_days,
          }
        }
      })
    }

    // TODO: Web2 用户排行接入（如有 web2 积分表）
    return NextResponse.json({
      success: true,
      data: { ranked: false, rank: null, points: 0, user: { id: userId } }
    })
  } catch (error) {
    console.error('My-rank API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch user rank' }, { status: 500 })
  }
}
