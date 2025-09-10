import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 使用服务端角色的supabase客户端来绕过RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 提取用神信息API被调用')

    // 获取认证token
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ 缺少认证token')
      return NextResponse.json({ error: '缺少认证token' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // 验证用户身份
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      console.error('❌ 用户认证失败:', authError)
      return NextResponse.json({ error: '用户认证失败' }, { status: 401 })
    }

    console.log('✅ 用户认证成功:', user.id)

    // 解析请求数据
    const { chartId } = await request.json()

    if (!chartId) {
      return NextResponse.json({ error: '缺少chartId参数' }, { status: 400 })
    }

    console.log('🔍 开始处理chartId:', chartId)

    // 1. 验证chartId属于当前用户
    const { data: chart, error: chartError } = await supabaseAdmin
      .from('user_charts')
      .select('id, name, user_id')
      .eq('id', chartId)
      .eq('user_id', user.id)
      .single()

    if (chartError || !chart) {
      console.error('❌ 命盘不存在或无权限访问:', chartError)
      return NextResponse.json({ error: '命盘不存在或无权限访问' }, { status: 404 })
    }

    console.log('✅ 命盘验证成功:', chart.name)

    // 2. 查找最新的用神分析报告
    const { data: reports, error: reportError } = await supabaseAdmin
      .from('ai_analyses')
      .select('id, content, created_at')
      .eq('chart_id', chartId)
      .eq('analysis_type', 'yongshen_analysis')
      .order('created_at', { ascending: false })
      .limit(1)

    if (reportError) {
      console.error('❌ 查询AI分析报告失败:', reportError)
      return NextResponse.json({ error: '查询AI分析报告失败' }, { status: 500 })
    }

    if (!reports || reports.length === 0) {
      return NextResponse.json({ 
        error: '没有找到用神分析报告，请先生成用神推理报告' 
      }, { status: 404 })
    }

    const latestReport = reports[0]

    if (!latestReport.content || latestReport.content.trim().length === 0) {
      return NextResponse.json({ 
        error: '分析报告内容为空，请重新生成用神分析报告' 
      }, { status: 400 })
    }

    console.log('✅ 找到用神分析报告，内容长度:', latestReport.content.length)
    console.log('📄 报告内容预览:', latestReport.content.substring(0, 200))

    // 3. 动态导入用神提取器并提取信息
    try {
      const { extractYongShenFromReport } = await import('@/lib/services/yongshen-extractor')
      
      console.log('🔍 开始提取用神信息...')
      const extractedData = extractYongShenFromReport(latestReport.content)
      
      if (!extractedData) {
        console.error('❌ 用神信息提取失败，报告内容:', latestReport.content.substring(0, 500))
        return NextResponse.json({ 
          error: '用神信息提取失败，可能是报告格式不符合要求' 
        }, { status: 400 })
      }
      
      console.log('✅ 用神信息提取成功:', extractedData)

      // 4. 保存提取的用神信息到命盘记录
      const { error: updateError } = await supabaseAdmin
        .from('user_charts')
        .update({
          yongshen_info: extractedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', chartId)

      if (updateError) {
        console.error('❌ 保存用神信息失败:', updateError)
        return NextResponse.json({ error: '保存用神信息失败' }, { status: 500 })
      }

      console.log('✅ 用神信息保存成功')

      return NextResponse.json({
        success: true,
        data: extractedData,
        message: '用神信息提取并保存成功'
      })

    } catch (importError) {
      console.error('❌ 导入用神提取器失败:', importError)
      return NextResponse.json({ 
        error: '系统错误：无法加载用神提取器' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ 提取用神信息失败:', error)
    console.error('❌ 错误堆栈:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({
      error: error instanceof Error ? error.message : '提取用神信息失败'
    }, { status: 500 })
  }
} 