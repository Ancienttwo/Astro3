import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { calculatePeachBlossomStars, getPeachBlossomAnalysis } from '@/lib/bazi/peach-blossom-stars'

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

export async function POST(request: NextRequest) {
  try {
    // 认证检查
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const body = await request.json()
    console.log('🎯 收到八字分析请求:', body)

    const { year, month, day, hour, gender, yearBranch, dayBranch, dayStem, allBranches } = body

    // 参数验证
    if (!year || !month || !day || !hour || !gender) {
      return NextResponse.json({
        error: '缺少必要参数',
        details: '需要提供完整的出生信息'
      }, { status: 400 })
    }

    console.log('🔍 准备发送八字分析请求')

    // 计算桃花星
    let peachBlossomAnalysis = ""
    if (yearBranch && dayBranch && dayStem && allBranches) {
      const peachBlossomStars = calculatePeachBlossomStars(yearBranch, dayBranch, dayStem, allBranches)
      peachBlossomAnalysis = getPeachBlossomAnalysis(peachBlossomStars)
      console.log('🌸 桃花星分析:', peachBlossomStars)
    }

    // 基础八字分析
    const analysis = `八字分析结果：
    
出生信息：${year}年${month}月${day}日${hour}时
性别：${gender}

${peachBlossomAnalysis ? `桃花星分析：${peachBlossomAnalysis}` : ''}

注：完整的八字分析功能正在开发中。`

    // 保存分析记录（这里可以添加保存到数据库的逻辑）
    console.log('💾 保存八字分析记录')

    return NextResponse.json({
      success: true,
      analysis,
      peachBlossomStars: yearBranch && dayBranch && dayStem && allBranches ? 
        calculatePeachBlossomStars(yearBranch, dayBranch, dayStem, allBranches) : null,
      metadata: {
        analysisType: 'bazi',
        timestamp: new Date().toISOString(),
        powered_by: '传统命理分析'
      }
    })

  } catch (error) {
    console.error('❌ 八字分析失败:', error)
    return NextResponse.json({
      error: '分析失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
} 