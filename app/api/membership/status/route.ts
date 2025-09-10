import { NextResponse } from 'next/server'
import { requireAuth, createServerSupabaseClient } from '@/lib/auth-server'

/**
 * 会员状态查询API
 * GET /api/membership/status
 */
export async function GET() {
  try {
    // 1. 认证检查
    const user = await requireAuth()
    
    // 2. 创建服务器端客户端
    const supabase = await createServerSupabaseClient()
    
    // 3. 查询会员信息
    const { data: membership, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = 未找到记录
      console.error('查询会员状态失败:', error)
      return NextResponse.json(
        { success: false, error: '查询会员状态失败' },
        { status: 500 }
      )
    }

    // 4. 如果没有会员记录，创建默认免费会员
    if (!membership) {
      const { data: newMembership, error: createError } = await supabase
        .from('memberships')
        .insert({
          user_id: user.id,
          tier: 'free'
        })
        .select()
        .single()

      if (createError) {
        console.error('创建默认会员记录失败:', createError)
        return NextResponse.json(
          { success: false, error: '创建会员记录失败' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          tier: newMembership.tier,
          expires_at: newMembership.expires_at,
          created_at: newMembership.created_at,
          is_active: true,
          benefits: getMembershipBenefits(newMembership.tier)
        }
      })
    }

    // 5. 检查会员是否过期
    const now = new Date()
    const isActive = !membership.expires_at || new Date(membership.expires_at) > now

    // 6. 如果会员过期，降级为免费会员
    if (!isActive && membership.tier !== 'free') {
      const { data: downgradedMembership, error: downgradeError } = await supabase
        .from('memberships')
        .update({
          tier: 'free',
          expires_at: null
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (downgradeError) {
        console.error('降级会员失败:', downgradeError)
      } else {
        membership.tier = 'free'
        membership.expires_at = null
      }
    }

    // 7. 返回会员状态
    return NextResponse.json({
      success: true,
      data: {
        tier: membership.tier,
        expires_at: membership.expires_at,
        created_at: membership.created_at,
        is_active: isActive,
        benefits: getMembershipBenefits(membership.tier),
        daysRemaining: membership && membership.expires_at ? 
          Math.max(0, Math.ceil((new Date(membership.expires_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) :
          0
      }
    })

  } catch (error) {
    console.error('会员状态API错误:', error)
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

/**
 * 获取会员等级对应的权益
 */
function getMembershipBenefits(tier: string) {
  switch (tier) {
    case 'free':
      return {
        daily_ai_chat: 3,
        monthly_ai_chat: 30,
        daily_reports: 1,
        monthly_reports: 5,
        advanced_features: false,
        priority_support: false,
        features: [
          '每日3次AI对话',
          '每月5次基础报告',
          '基础命盘功能'
        ]
      }
    
    case 'premium':
      return {
        daily_ai_chat: 50,
        monthly_ai_chat: 1000,
        daily_reports: 10,
        monthly_reports: 100,
        advanced_features: true,
        priority_support: true,
        features: [
          '每日50次AI对话', 
          '每月100次高级报告',
          '高级分析功能',
          '优先客服支持',
          '定制报告模板'
        ]
      }
    
    default:
      return {
        daily_ai_chat: 1,
        monthly_ai_chat: 5,
        daily_reports: 0,
        monthly_reports: 1,
        advanced_features: false,
        priority_support: false,
        features: ['基础功能']
      }
  }
} 