import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/server/db'

const supabaseAdmin = getSupabaseAdminClient()

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
      return { success: false, error: '认证失败' }
    }
    
    return { success: true, user }
  } catch {
    return { success: false, error: '认证错误' }
  }
}

// AI分析启动前的安全检查 - 简化版
export async function POST(request: NextRequest) {
  try {
    // 用户认证
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const user = authResult.user!
    const body = await request.json()
    const { analysisType } = body

    if (!analysisType) {
      return NextResponse.json({ 
        error: '缺少分析类型参数' 
      }, { status: 400 })
    }

    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'

    console.log(`🛡️ 开始安全检查: 用户=${user.email}, IP=${clientIP}, 类型=${analysisType}`)

    // 🔥 检查1: 余额检查
    const balanceCheck = await checkUserBalance(user.id)
    if (!balanceCheck.hasBalance) {
      return NextResponse.json({
        success: false,
        error: '报告点数不足',
        details: {
          type: 'INSUFFICIENT_BALANCE',
          message: `当前余额：${balanceCheck.totalRemaining}次，需要：1次`,
          balance: balanceCheck
        }
      }, { status: 400 })
    }

    // 🔥 检查2: 简化的频率限制 (基于时间间隔)
    const now = Date.now()
    const rateCheck = await checkSimpleRateLimit(user.id, now)
    if (!rateCheck.canProceed) {
      return NextResponse.json({
        success: false,
        error: '请求过于频繁，请稍后再试',
        details: {
          type: 'RATE_LIMIT',
          message: '请等待至少10秒后再次请求',
          resetTime: new Date(now + 10000).toISOString()
        }
      }, { status: 429 })
    }

    console.log(`✅ 安全检查通过: 用户=${user.email}`)

    return NextResponse.json({
      success: true,
      message: '安全检查通过',
      limits: {
        balance: balanceCheck,
        rate: rateCheck
      }
    })

  } catch (error) {
    console.error('❌ 安全检查失败:', error)
    return NextResponse.json({ 
      error: '安全检查过程中发生错误' 
    }, { status: 500 })
  }
}

// 检查用户余额 - 兼容版本
async function checkUserBalance(userId: string) {
  try {
    // 尝试查询用户余额，处理字段可能不存在的情况
    const { data: usage, error } = await supabaseAdmin
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('获取用户余额失败:', error)
      // 如果查询失败，假设用户有基础免费次数
      return { 
        hasBalance: true, 
        totalRemaining: 5, 
        freeRemaining: 5, 
        paidRemaining: 0,
        note: '使用默认余额（数据库字段待更新）'
      }
    }

    // 兼容处理：如果字段不存在，使用默认值
    const freeLimit = usage.free_reports_limit || usage.freeReportsLimit || 0
    const freeUsed = usage.free_reports_used || usage.freeReportsUsed || 0
    const paidPurchased = usage.paid_reports_purchased || usage.paidReportsPurchased || 0
    const paidUsed = usage.paid_reports_used || usage.paidReportsUsed || 0

    const freeRemaining = Math.max(0, freeLimit - freeUsed)
    const paidRemaining = Math.max(0, paidPurchased - paidUsed)
    const totalRemaining = freeRemaining + paidRemaining

    return {
      hasBalance: totalRemaining > 0,
      totalRemaining,
      freeRemaining,
      paidRemaining
    }
  } catch (error) {
    console.error('余额检查异常:', error)
    // 出错时给予基础权限
    return { 
      hasBalance: true, 
      totalRemaining: 3, 
      freeRemaining: 3, 
      paidRemaining: 0,
      note: '异常处理：使用默认余额'
    }
  }
}

// 简化的频率限制检查
async function checkSimpleRateLimit(userId: string, currentTime: number) {
  try {
    // 简单的内存缓存，实际生产环境应该用Redis
    // 这里基于用户最近的AI分析记录做简单检查
    const tenSecondsAgo = new Date(currentTime - 10000).toISOString()

    const { data: recentAnalyses, error } = await supabaseAdmin
      .from('ai_analyses')
      .select('id, created_at')
      .eq('user_id', userId)
      .gte('created_at', tenSecondsAgo)
      .limit(5)

    if (error) {
      console.log('频率检查查询失败，允许继续:', error.message)
      return { canProceed: true, requestCount: 0 }
    }

    const recentCount = recentAnalyses?.length || 0
    
    // 如果10秒内有超过2个分析记录，则限制
    if (recentCount >= 2) {
      return { 
        canProceed: false, 
        requestCount: recentCount,
        message: '请求过于频繁'
      }
    }

    return { 
      canProceed: true, 
      requestCount: recentCount 
    }
  } catch (error) {
    console.error('频率检查异常，允许继续:', error)
    // 异常时允许继续
    return { canProceed: true, requestCount: 0 }
  }
} 
