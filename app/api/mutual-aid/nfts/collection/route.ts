import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { isAddress } from 'viem'

/**
 * GET /api/mutual-aid/nfts/collection
 * 依据用户积分/成就派生NFT合集概览（真实数据：user_points_web3）
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()

    // Web3地址为主
    let wallet = request.headers.get('X-Wallet-Address') || ''
    if (wallet && !isAddress(wallet as `0x${string}`)) wallet = ''

    if (!wallet) {
      const authHeader = request.headers.get('Authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '')
        if (isAddress(token as `0x${string}`)) wallet = token
      }
    }

    // 未登录/未连接钱包返回空集合
    if (!wallet) {
      return NextResponse.json({ success: true, data: emptyCollection() })
    }

    const { data: points } = await supabase
      .from('user_points_web3')
      .select('total_chain_earned, consecutive_days, chain_points_balance')
      .eq('wallet_address', wallet.toLowerCase())
      .eq('is_active', true)
      .single()

    // 基于数据派生里程碑：7/30天连续签到、100/1000总积分
    const streak = points?.consecutive_days || 0
    const earned = points?.total_chain_earned || 0

    const milestoneRewards: Record<number, boolean> = {
      7: streak >= 7,
      30: streak >= 30,
      100: earned >= 100,
      1000: earned >= 1000,
    }

    const legendaryCount = streak >= 30 ? 1 : 0
    const epicCount = earned >= 1000 ? 1 : 0
    const commonCount = earned >= 100 ? 1 : 0
    const totalCount = legendaryCount + epicCount + commonCount

    const data = {
      totalCount,
      legendaryCount,
      epicCount,
      commonCount,
      milestoneRewards,
      collectionValue: String(points?.chain_points_balance || 0)
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('NFT collection API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch NFT collection' },
      { status: 500 }
    )
  }
}

function emptyCollection() {
  return {
    totalCount: 0,
    legendaryCount: 0,
    epicCount: 0,
    commonCount: 0,
    milestoneRewards: {},
    collectionValue: '0'
  }
}
