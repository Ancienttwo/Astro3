import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 创建管理员客户端实例 - 确保安全
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// 简化的认证函数
async function authenticateRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return { success: false, error: '缺少认证token' }
    }
    
    const token = authHeader.substring(7)
    
    // 验证token
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !user) {
      console.error('❌ 认证失败:', error)
      return { success: false, error: '认证失败' }
    }
    
    return { success: true, user }
  } catch (error) {
    console.error('❌ 认证异常:', error)
    return { success: false, error: '认证错误' }
  }
}

// 消费报告点数API - 修复版
export async function POST(request: NextRequest) {
  console.log('🎯 consume-report-credit API 被调用')
  
  try {
    // 首先检查环境变量
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ 缺少Supabase环境变量')
      return NextResponse.json({ 
        error: '服务器配置错误' 
      }, { status: 500 })
    }

    // 用户认证
    console.log('🔐 开始用户认证...')
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      console.log('❌ 用户认证失败:', authResult.error)
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const user = authResult.user!
    console.log('✅ 用户认证成功:', user.email)

    // 解析请求体
    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error('❌ 请求体解析失败:', error)
      return NextResponse.json({ 
        error: '请求格式错误' 
      }, { status: 400 })
    }

    const { taskId, analysisType, amount = 1 } = body
    console.log('📋 请求参数:', { taskId, analysisType, amount })

    if (!taskId || !analysisType) {
      console.log('❌ 缺少必要参数')
      return NextResponse.json({ 
        error: '缺少必要参数：taskId 和 analysisType' 
      }, { status: 400 })
    }

    console.log(`💰 开始处理扣费: 用户=${user.email}, 任务=${taskId}, 分析类型=${analysisType}, 金额=${amount}`)

    // 🔥 简化防重复扣费：使用简单的时间间隔检查
    const recentChargeCheck = await checkRecentCharges(user.id)
    if (!recentChargeCheck.canProceed) {
      console.log(`⚠️ 检测到重复扣费请求，跳过扣费`)
      return NextResponse.json({
        success: true,
        alreadyCharged: true,
        message: '检测到重复请求，已跳过扣费',
        note: '基于时间间隔的重复检测'
      })
    }

    // 🔥 获取当前余额并检查是否足够
    const { data: currentUsage, error: usageError } = await supabaseAdmin
      .from('user_usage')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (usageError) {
      console.error('❌ 获取用户使用情况失败:', usageError)
      console.error('❌ 错误详情:', JSON.stringify(usageError, null, 2))
      
      // 如果用户没有usage记录，尝试创建一个
      if (usageError.code === 'PGRST116') {
        console.log('👤 用户没有usage记录，尝试创建...')
        
        const { data: newUsage, error: createError } = await supabaseAdmin
          .from('user_usage')
          .insert([{
            user_id: user.id,
            user_email: user.email,
            free_reports_limit: 0,
            free_reports_used: 0,
            paid_reports_purchased: 0,
            paid_reports_used: 0,
            chatbot_limit: 0,
            chatbot_used: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (createError) {
          console.error('❌ 创建usage记录失败:', createError)
          return NextResponse.json({ 
            error: '创建用户记录失败，请联系客服' 
          }, { status: 500 })
        }

        console.log('✅ 用户usage记录已创建:', newUsage)
        // 🔥 重要：使用新创建的记录
        currentUsage = newUsage
      } else {
        return NextResponse.json({ 
          error: '获取用户余额失败，请重试' 
        }, { status: 500 })
      }
    }

    // 🔥 确保currentUsage存在
    if (!currentUsage) {
      console.error('❌ 无法获取用户使用情况')
      return NextResponse.json({ 
        error: '无法获取用户使用情况，请重试' 
      }, { status: 500 })
    }

    console.log('📊 用户usage原始数据:', currentUsage)

    // 兼容处理：支持两种字段命名方式（下划线和驼峰）
    const freeLimit = currentUsage.free_reports_limit || 0
    const freeUsed = currentUsage.free_reports_used || 0
    const paidPurchased = currentUsage.paid_reports_purchased || 0
    const paidUsed = currentUsage.paid_reports_used || 0

    // 计算可用余额
    const freeRemaining = Math.max(0, freeLimit - freeUsed)
    const paidRemaining = Math.max(0, paidPurchased - paidUsed)
    const totalRemaining = freeRemaining + paidRemaining

    console.log(`📊 当前余额: 免费=${freeRemaining}(${freeLimit}-${freeUsed}), 付费=${paidRemaining}(${paidPurchased}-${paidUsed}), 总计=${totalRemaining}`)

    // 检查余额是否足够
    if (totalRemaining < amount) {
      console.log(`❌ 余额不足: 需要${amount}次，可用${totalRemaining}次`)
      return NextResponse.json({
        success: false,
        error: '报告点数不足',
        details: {
          required: amount,
          available: totalRemaining,
          freeRemaining,
          paidRemaining
        }
      }, { status: 400 })
    }

    // 🔥 执行扣费：优先使用免费次数
    const updateData: Record<string, number> = {}
    
    if (freeRemaining >= amount) {
      // 使用免费次数
      const newFreeUsed = freeUsed + amount
      updateData.free_reports_used = newFreeUsed
      console.log(`💳 使用免费次数扣费: ${amount}次 (${freeUsed} → ${newFreeUsed})`)
    } else {
      // 先用完免费次数，再用付费次数
      const useFree = freeRemaining
      const usePaid = amount - useFree
      
      const newFreeUsed = freeLimit
      const newPaidUsed = paidUsed + usePaid
      
      updateData.free_reports_used = newFreeUsed
      updateData.paid_reports_used = newPaidUsed
      
      console.log(`💳 混合扣费: 免费=${useFree}次 (${freeUsed} → ${newFreeUsed}), 付费=${usePaid}次 (${paidUsed} → ${newPaidUsed})`)
    }

    // 🔥 原子性更新使用情况
    console.log('🔄 准备更新数据:', updateData)
    
    const { data: updateResult, error: updateError } = await supabaseAdmin
      .from('user_usage')
      .update(updateData)
      .eq('user_id', user.id)
      .select()

    if (updateError) {
      console.error('❌ 更新使用情况失败:', updateError)
      console.error('❌ 更新错误详情:', JSON.stringify(updateError, null, 2))
      console.error('❌ 尝试更新的数据:', JSON.stringify(updateData, null, 2))
      return NextResponse.json({ 
        error: '扣费失败，请重试' 
      }, { status: 500 })
    }

    console.log('✅ 更新结果:', updateResult)

    console.log(`✅ 扣费成功: 用户=${user.email}, 任务=${taskId}, 扣除=${amount}次`)

    return NextResponse.json({
      success: true,
      message: `成功扣除 ${amount} 次报告点数`,
      charged: {
        amount,
        taskId,
        analysisType,
        chargedAt: new Date().toISOString()
      },
      remaining: {
        free: Math.max(0, freeLimit - (updateData.free_reports_used || freeUsed)),
        paid: Math.max(0, paidPurchased - (updateData.paid_reports_used || paidUsed))
      }
    })

  } catch (error) {
    console.error('❌ 扣费API错误:', error)
    return NextResponse.json({ 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// 简化的重复检查：基于时间间隔
async function checkRecentCharges(userId: string) {
  try {
    // 检查最近5秒内是否有扣费记录（通过user_usage表的更新时间）
    const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString()
    
    const { data: usage, error } = await supabaseAdmin
      .from('user_usage')
      .select('updated_at')
      .eq('user_id', userId)
      .single()

    if (error) {
      // 如果查询失败，允许继续
      return { canProceed: true }
    }

    // 如果user_usage表最近5秒内有更新，可能是重复请求
    if (usage.updated_at && new Date(usage.updated_at) > new Date(fiveSecondsAgo)) {
      return { 
        canProceed: false,
        message: '检测到可能的重复请求'
      }
    }

    return { canProceed: true }
  } catch (error) {
    console.error('重复检查异常，允许继续:', error)
    // 异常时允许继续
    return { canProceed: true }
  }
} 