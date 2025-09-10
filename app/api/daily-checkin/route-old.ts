import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DailyCheckinService } from '@/lib/services/daily-checkin-service'
import { CreditManager, UserIdentifier } from '@/lib/services/credit-manager'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// 获取签到状态
export async function GET(request: NextRequest) {
  try {
    // 获取用户认证
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: '用户认证失败' }, { status: 401 })
    }

    // 使用统一的签到服务
    const userIdentifier: UserIdentifier = {
      type: 'web2',
      id: user.id,
      email: user.email
    }

    const result = await DailyCheckinService.getCheckinStatus(userIdentifier)
    
    // 转换为旧格式兼容性
    return NextResponse.json({
      success: true,
      status: {
        last_checkin_date: result.status.last_checkin_date,
        consecutive_checkin_days: result.status.consecutive_checkin_days,
        total_checkin_days: result.status.total_checkin_days,
        free_reports_limit: result.status.balance.freeReports.earned,
        free_reports_used: result.status.balance.freeReports.consumed,
        chatbot_limit: result.status.balance.chatbot.earned,
        chatbot_used: result.status.balance.chatbot.consumed
      }
    })

  } catch (error) {
    console.error('签到状态查询失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 执行签到
export async function POST(request: NextRequest) {
  try {
    // 获取用户认证
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: '用户认证失败' }, { status: 401 })
    }

    // 查询用户记录
    const { data: userUsage, error: fetchError } = await supabaseAdmin
      .from('user_usage')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (fetchError && fetchError.code === 'PGRST116') {
      // 用户记录不存在，创建新记录
      const { data: newUsage, error: createError } = await supabaseAdmin
        .from('user_usage')
        .insert({
          user_id: user.id,
          user_email: user.email!,
          free_reports_limit: 0,
          free_reports_used: 0,
          paid_reports_used: 0,
          chatbot_limit: 0,
          chatbot_used: 0,
          consecutive_checkin_days: 0,
          total_checkin_days: 0
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json({ error: '创建用户记录失败' }, { status: 500 })
      }
      userUsage = newUsage
    } else if (fetchError) {
      return NextResponse.json({ error: '查询用户记录失败' }, { status: 500 })
    }

    // 检查今天是否已经签到
    const today = new Date().toISOString().split('T')[0]
    if (userUsage.last_checkin_date === today) {
      return NextResponse.json({
        success: false,
        error: '今天已经签到过了',
        status: {
          last_checkin_date: userUsage.last_checkin_date,
          consecutive_checkin_days: userUsage.consecutive_checkin_days,
          total_checkin_days: userUsage.total_checkin_days,
          free_reports_limit: userUsage.free_reports_limit,
          free_reports_used: userUsage.free_reports_used
        }
      })
    }

    // 计算连续签到天数
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    
    let newConsecutiveDays = 1
    if (userUsage.last_checkin_date === yesterdayStr) {
      // 连续签到
      newConsecutiveDays = userUsage.consecutive_checkin_days + 1
    }

    // 计算奖励 - 报告和ChatBot按比例分配
    const baseReportReward = 1
    const baseChatbotReward = 10
    let consecutiveReportBonus = 0
    let consecutiveChatbotBonus = 0
    let bonusReason = ''

    if (newConsecutiveDays >= 7 && newConsecutiveDays % 7 === 0) {
      consecutiveReportBonus = 2
      consecutiveChatbotBonus = 20
      bonusReason = `连续签到${newConsecutiveDays}天奖励`
    } else if (newConsecutiveDays >= 15 && newConsecutiveDays % 15 === 0) {
      consecutiveReportBonus = 3
      consecutiveChatbotBonus = 30
      bonusReason = `连续签到${newConsecutiveDays}天奖励`
    } else if (newConsecutiveDays >= 30 && newConsecutiveDays % 30 === 0) {
      consecutiveReportBonus = 5
      consecutiveChatbotBonus = 50
      bonusReason = `连续签到${newConsecutiveDays}天大奖励`
    }

    const totalReportReward = baseReportReward + consecutiveReportBonus
    const totalChatbotReward = baseChatbotReward + consecutiveChatbotBonus

    // 计算新的限制，确保当前可用次数不超过累积上限
    const currentFreeReportsAvailable = (userUsage.free_reports_limit || 0) - (userUsage.free_reports_used || 0)
    const currentChatbotAvailable = (userUsage.chatbot_limit || 0) - (userUsage.chatbot_used || 0)
    
    // 计算签到后应该增加的次数，但确保当前可用不超过上限
    const maxFreeReportsCanAdd = Math.max(0, 10 - currentFreeReportsAvailable)
    const maxChatbotCanAdd = Math.max(0, 30 - currentChatbotAvailable)
    
    const actualReportReward = Math.min(totalReportReward, maxFreeReportsCanAdd)
    const actualChatbotReward = Math.min(totalChatbotReward, maxChatbotCanAdd)
    
    const newReportsLimit = (userUsage.free_reports_limit || 0) + actualReportReward
    const newChatbotLimit = (userUsage.chatbot_limit || 0) + actualChatbotReward

    // 更新用户记录
    const { data: updatedUsage, error: updateError } = await supabaseAdmin
      .from('user_usage')
      .update({
        last_checkin_date: today,
        consecutive_checkin_days: newConsecutiveDays,
        total_checkin_days: userUsage.total_checkin_days + 1,
        free_reports_limit: newReportsLimit,
        chatbot_limit: newChatbotLimit
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('更新签到记录失败:', updateError)
      return NextResponse.json({ error: '签到失败' }, { status: 500 })
    }

    // 生成签到消息
    let message = '签到成功！'
    if (actualReportReward < totalReportReward) {
      message += ` 免费报告已达当前上限(${currentFreeReportsAvailable + actualReportReward}/10)`
    }
    if (actualChatbotReward < totalChatbotReward) {
      message += ` ChatBot已达当前上限(${currentChatbotAvailable + actualChatbotReward}/30)`
    }

    return NextResponse.json({
      success: true,
      message,
      reward: {
        baseReportReward,
        baseChatbotReward,
        consecutiveReportBonus,
        consecutiveChatbotBonus,
        totalReportReward,
        totalChatbotReward,
        actualReportReward,
        actualChatbotReward,
        bonusReason: bonusReason || undefined
      },
      newStatus: {
        last_checkin_date: updatedUsage.last_checkin_date,
        consecutive_checkin_days: updatedUsage.consecutive_checkin_days,
        total_checkin_days: updatedUsage.total_checkin_days,
        free_reports_limit: updatedUsage.free_reports_limit,
        free_reports_used: updatedUsage.free_reports_used,
        chatbot_limit: updatedUsage.chatbot_limit,
        chatbot_used: updatedUsage.chatbot_used
      }
    })

  } catch (error) {
    console.error('签到执行失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
} 