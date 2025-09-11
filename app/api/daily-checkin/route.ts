import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DailyCheckinService } from '@/lib/services/daily-checkin-service'
import { CacheManager } from '@/lib/redis-cache'
import { invalidateByExactPath } from '@/lib/edge/invalidate'
import { checkRateLimitRedis } from '@/lib/rate-limit-redis'
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
    // 速率限制：防止频繁签到请求
    const rl = await checkRateLimitRedis(request as any, {
      maxAttempts: 10,
      windowMs: 60 * 1000,
      blockDurationMs: 10 * 60 * 1000,
      bucket: 'daily_checkin_web2'
    })
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 })
    }
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

    const result = await DailyCheckinService.performCheckin(userIdentifier)

    // 缓存失效：用户用量相关
    try {
      await CacheManager.clearUserCache(user.id)
    } catch (e) {
      console.warn('Failed to clear user cache after checkin:', (e as Error)?.message)
    }
    try { await invalidateByExactPath('/api/user-usage', 'user') } catch {}

    // 转换为旧格式兼容性
    return NextResponse.json({
      success: result.success,
      message: result.message,
      reward: result.reward,
      newStatus: {
        last_checkin_date: new Date().toISOString().split('T')[0],
        consecutive_checkin_days: result.newStatus.consecutiveDays,
        total_checkin_days: result.newStatus.totalDays,
        free_reports_limit: result.newStatus.newBalance.freeReports.earned,
        free_reports_used: result.newStatus.newBalance.freeReports.consumed,
        chatbot_limit: result.newStatus.newBalance.chatbot.earned,
        chatbot_used: result.newStatus.newBalance.chatbot.consumed
      }
    })

  } catch (error) {
    console.error('签到失败:', error)
    
    // 如果是已签到错误，返回特殊格式
    if (error instanceof Error && error.message === '今天已经签到过了') {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
