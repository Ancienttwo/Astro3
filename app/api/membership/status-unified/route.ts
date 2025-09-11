import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

/**
 * 会员状态查询API - 支持Web2和Web3用户
 * GET /api/membership/status-unified
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 会员状态API: 开始认证检查...')
    
    // 获取用户认证（使用与user-usage API相同的方式）
    const authHeader = request.headers.get('Authorization')
    console.log('🔍 会员状态API: 认证headers检查:', {
      hasAuthHeader: !!authHeader,
      authHeaderType: authHeader ? (authHeader.startsWith('Bearer ') ? 'Bearer' : 'Other') : 'None',
      headerPreview: authHeader ? (authHeader.substring(0, 20) + '...') : 'none'
    })
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ 会员状态API: 缺少Authorization Bearer token')
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    console.log('🔍 会员状态API: 认证结果:', user ? {
      userId: user.id,
      email: user.email
    } : '未认证', authError ? { error: authError.message } : '')
    
    if (authError || !user) {
      console.log('❌ 会员状态API: 用户认证失败，返回401')
      return NextResponse.json({ error: '用户认证失败' }, { status: 401 })
    }

    console.log(`查询会员状态: ${user.email} (${user.id})`)

    // 先检查表是否存在
    console.log('🔍 开始查询会员信息，用户ID:', user.id)
    
    // 首先测试表是否存在
    console.log('🔍 测试memberships表是否存在...')
    const { data: testQuery, error: testError } = await supabaseAdmin
      .from('memberships')
      .select('count')
      .limit(1)
      
    console.log('🔍 表存在性测试结果:', {
      tableExists: !testError,
      error: testError?.message,
      errorCode: testError?.code
    })
    
    if (testError && (testError.code === '42P01' || testError.message?.includes('does not exist'))) {
      console.log('❌ memberships表不存在，返回默认会员状态')
      return NextResponse.json({
        success: true,
        data: {
          tier: 'free',
          expires_at: null,
          created_at: new Date().toISOString(),
          is_active: true,
          benefits: getMembershipBenefits('free'),
          daysRemaining: 0,
          user_info: {
            auth_type: 'supabase',
            wallet_address: null,
            user_id: user.id,
            user_email: user.email,
            user_type: 'web2'
          }
        }
      })
    }
    
    // 查询会员信息
    const { data: membership, error } = await supabaseAdmin
      .from('memberships')
      .select('*')
      .eq('user_id', user.id)
      .single()
      
    console.log('🔍 查询会员信息结果:', {
      found: !!membership,
      error: error?.message,
      errorCode: error?.code
    })

    if (error && error.code !== 'PGRST116') { // PGRST116 = 未找到记录
      console.error('查询会员状态失败 - 详细错误:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      
      
      return NextResponse.json(
        { success: false, error: '查询会员状态失败', details: error.message },
        { status: 500 }
      )
    }

    // 如果没有会员记录，创建默认免费会员
    if (!membership) {
      console.log('🔍 用户会员记录不存在，准备创建免费会员记录')
      console.log('🔍 用户信息(基础):', { userId: user.id, email: user.email })
      
      // 检查用户类型（Web2还是Web3）
      const { data: userInfo } = await supabaseAdmin
        .from('users')
        .select('auth_type, wallet_address, user_type')
        .eq('id', user.id)
        .single()
      
      const isWeb3User = userInfo?.auth_type === 'web3' || user.email?.endsWith('@web3.wallet') || user.email?.endsWith('@web3.local') || user.email?.endsWith('@web3.astrozi.app') || user.email?.endsWith('@astrozi.ai')
      const walletAddress = userInfo?.wallet_address || null
      
      // 使用与user_usage相同的模式创建membership记录
      const membershipData = {
        user_id: user.id,
        user_email: user.email!,
        wallet_address: walletAddress,
        user_type: isWeb3User ? 'web3' : 'web2',
        tier: 'free',
        started_at: new Date().toISOString(),
        expires_at: null,
        is_active: true
      }
      
      console.log('🔍 会员记录插入数据:', membershipData)
      
      const { data: newMembership, error: createError } = await supabaseAdmin
        .from('memberships')
        .insert(membershipData)
        .select()
        .single()

      if (createError) {
        console.error('创建默认会员记录失败 - 详细错误信息:', {
          code: createError.code,
          message: createError.message,
          details: createError.details,
          hint: createError.hint,
          insertData: membershipData
        })
        
        
        return NextResponse.json(
          { success: false, error: '创建会员记录失败', details: createError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          tier: newMembership.tier,
          expires_at: newMembership.expires_at,
          created_at: newMembership.started_at,
          is_active: true,
          benefits: getMembershipBenefits(newMembership.tier),
          user_info: {
            auth_type: userInfo?.auth_type || 'supabase',
            wallet_address: walletAddress,
            user_id: user.id,
            user_email: user.email,
            user_type: isWeb3User ? 'web3' : 'web2'
          }
        }
      })
    }

    // 检查会员是否过期和活跃状态
    const now = new Date()
    const isActive = membership.is_active && (!membership.expires_at || new Date(membership.expires_at) > now)

    // 如果会员过期，降级为免费会员
    if (!isActive && membership.tier !== 'free') {
      const { data: downgradedMembership, error: downgradeError } = await supabaseAdmin
        .from('memberships')
        .update({
          tier: 'free',
          expires_at: null,
          is_active: true
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (downgradeError) {
        console.error('降级会员失败:', downgradeError)
      } else {
        membership.tier = 'free'
        membership.expires_at = null
        membership.is_active = true
      }
    }

    // 返回会员状态
    return NextResponse.json({
      success: true,
      data: {
        tier: membership.tier,
        expires_at: membership.expires_at,
        created_at: membership.started_at,
        is_active: isActive,
        benefits: getMembershipBenefits(membership.tier),
        daysRemaining: membership && membership.expires_at ? 
          Math.max(0, Math.ceil((new Date(membership.expires_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) :
          0,
        user_info: {
          auth_type: membership.user_type || 'supabase',
          wallet_address: membership.wallet_address,
          user_id: user.id,
          user_email: user.email,
          user_type: membership.user_type || 'web2'
        }
      }
    })

  } catch (error) {
    console.error('会员状态API错误:', error)
    return NextResponse.json(
      { success: false, error: 'Server Error' },
      { status: 500 }
    )
  }
}

/**
 * 获取会员等级对应的权益
 */
function getMembershipBenefits(tier: string) {
  // 将memberships的tier映射到标准tier
  const isPremium = ['monthly', 'yearly', 'halfyear'].includes(tier);
  
  if (isPremium) {
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
  } else {
    // free或其他类型
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
  }
}
