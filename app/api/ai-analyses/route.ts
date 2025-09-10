import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUnifiedUser } from '@/lib/auth'

// 创建Supabase管理员客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// 获取AI分析结果
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 AI分析API: 开始认证用户...')
    
    // 调试：检查请求headers
    const authHeader = request.headers.get('Authorization')
    console.log('🔍 AI分析API: 请求headers检查:', {
      hasAuthHeader: !!authHeader,
      authHeaderPrefix: authHeader ? (authHeader.substring(0, 20) + '...') : 'none'
    })
    
    // 使用统一认证系统
    const user = await getCurrentUnifiedUser(request)
    
    console.log('🔍 AI分析API: 认证结果:', user ? `用户ID: ${user.id}, 认证类型: ${user.auth_type}, 钱包地址: ${user.wallet_address}` : '未认证')
    
    if (!user) {
      console.log('❌ AI分析API: 用户认证失败')
      return NextResponse.json({ error: '未认证' }, { status: 401 })
    }
    const url = new URL(request.url)
    const chartId = url.searchParams.get('chart_id')
    const recordId = url.searchParams.get('record_id')
    const analysisType = url.searchParams.get('analysis_type')
    const limitParam = url.searchParams.get('limit')
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam), 1), 100) : 50 // 默认50，最大100
    
    if (!chartId && !recordId) {
      return NextResponse.json({ 
        error: '需要提供chart_id或record_id参数' 
      }, { status: 400 })
    }

    let analyses: any[] = []

    // 如果提供了chart_id，从ai_analyses表查询（V2架构）
    if (chartId) {
      // 首先验证chart_id属于当前用户
      const { data: chart, error: chartError } = await supabaseAdmin
        .from('user_charts')
        .select('id, name, chart_type')
        .eq('id', chartId)
        .eq('user_id', user.id)
        .single()

      if (chartError || !chart) {
        console.warn(`命盘不存在或无权限访问: ${chartId}`, chartError?.message)
        // 🔥 修改：返回空列表而不是404错误，避免循环调用
        return NextResponse.json({
          success: true,
          data: [],
          message: '命盘不存在或无权限访问'
        })
      }

      // 构建查询
      let query = supabaseAdmin
        .from('ai_analyses')
        .select(`
          id,
          analysis_type,
          content,
          created_at,
          chart_id
        `)
        .eq('chart_id', chartId)
        .order('created_at', { ascending: false })
        .limit(limit)

      // 如果指定了分析类型，添加过滤条件
      if (analysisType) {
        query = query.eq('analysis_type', analysisType)
      }

      const { data: aiAnalyses, error: analysisError } = await query

      if (analysisError) {
        console.error('查询AI分析失败:', analysisError)
        throw analysisError
      }

      // 转换格式并添加额外信息
      analyses = (aiAnalyses || []).map(analysis => ({
        id: analysis.id,
        chart_id: analysis.chart_id,
        analysis_type: analysis.analysis_type,
        content: analysis.content,
        created_at: analysis.created_at,
        updated_at: analysis.created_at, // 添加更新时间
        powered_by: `DIFY流式分析 - ${getAgentDisplayName(analysis.analysis_type)}`,
        character_count: analysis.content?.length || 0,
        confidence: 1.0, // 添加置信度
        source: 'streaming',
        chart_info: {
          name: chart.name || '未知',
          birthday: '未知',
          type: analysis.analysis_type.includes('ziwei') ? 'ziwei' : 'bazi'
        }
      }))
    }

    // 如果提供了record_id，尝试从fate_records表查询（V1架构兼容）
    if (recordId && analyses.length === 0) {
      // TODO: 实现V1架构兼容查询
      console.log('暂不支持V1架构的record_id查询')
    }

    console.log(`✅ 查询AI分析成功，找到 ${analyses.length} 个结果`)

    return NextResponse.json({
      success: true,
      data: analyses
    })

  } catch (error) {
    console.error('❌ 查询AI分析失败:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '查询失败' 
    }, { status: 500 })
  }
}

// 获取Agent显示名称
function getAgentDisplayName(analysisType: string): string {
  const agentMap: Record<string, string> = {
    'tiekou_zhiduan': '铁口直断大师',
    'yongshen_analysis': '用神大师',
    'ziwei_reasoning': '紫微推理大师',
    'sihua_reasoning': '四化分析大师'
  }
  return agentMap[analysisType] || '未知Agent'
}

// POST /api/ai-analyses - 手动保存分析结果
export async function POST(request: NextRequest) {
  try {
    // 使用统一认证系统
    const user = await getCurrentUnifiedUser(request)
    
    if (!user) {
      return NextResponse.json({ error: '未认证' }, { status: 401 })
    }

    const body = await request.json()
    const { chart_id, analysis_type, content, birth_data, chart_type, agent_name } = body

    if (!analysis_type || !content) {
      return NextResponse.json({ error: '缺少必要参数：analysis_type和content' }, { status: 400 })
    }

    let finalChartId = chart_id

    // 如果没有提供chart_id，但提供了birth_data，尝试查找或创建命盘
    if (!finalChartId && birth_data) {
      console.log('🔍 未提供chart_id，尝试通过出生数据查找或创建命盘...')
      
      const { name, year, month, day, hour, gender } = birth_data
      const recordType = chart_type || (analysis_type.includes('ziwei') || analysis_type.includes('sihua') ? 'ziwei' : 'bazi')
      
      // 先尝试查找现有的命盘记录
      const { data: existingCharts } = await supabaseAdmin
        .from('user_charts')
        .select('id, name, birth_year, birth_month, birth_day')
        .eq('user_id', user.id)
        .eq('chart_type', recordType)
        .eq('birth_year', year)
        .eq('birth_month', month)
        .eq('birth_day', day)
        .order('created_at', { ascending: false })
        .limit(1)

      if (existingCharts && existingCharts.length > 0) {
        finalChartId = existingCharts[0].id
        console.log('✅ 找到匹配的命盘记录:', finalChartId)
      } else {
        // 创建新的命盘记录
        console.log('🆕 创建新的命盘记录...')
        const { data: newChart, error: createError } = await supabaseAdmin
          .from('user_charts')
          .insert({
            user_id: user.id,
            name: name || `${analysis_type}分析`,
            birth_year: year,
            birth_month: month,
            birth_day: day,
            birth_hour: hour || 12,
            gender: gender || 'male',
            chart_type: recordType
          })
          .select('id')
          .single()

        if (createError || !newChart) {
          console.error('❌ 创建命盘记录失败:', createError)
          return NextResponse.json({ error: '创建命盘记录失败' }, { status: 500 })
        }

        finalChartId = newChart.id
        console.log('✅ 创建新命盘记录成功:', finalChartId)
      }
    }

    if (!finalChartId) {
      return NextResponse.json({ error: '无法确定命盘ID，需要提供chart_id或birth_data' }, { status: 400 })
    }

    // 验证用户是否拥有该命盘（对于已存在的chart_id）
    if (chart_id) {
      const { data: chartRecord, error: chartError } = await supabaseAdmin
        .from('user_charts')
        .select('id, user_id')
        .eq('id', finalChartId)
        .eq('user_id', user.id)
        .single()

      if (chartError || !chartRecord) {
        return NextResponse.json({ error: '命盘不存在或无权限' }, { status: 403 })
      }
    }

    // 🔥 实施3份限制：检查是否已有3份同类型分析
    const { data: existingAnalyses } = await supabaseAdmin
      .from('ai_analyses')
      .select('id, created_at')
      .eq('chart_id', finalChartId)
      .eq('analysis_type', analysis_type)
      .order('created_at', { ascending: true })

    if (existingAnalyses && existingAnalyses.length >= 3) {
      // 删除最早的分析
      const oldestAnalysis = existingAnalyses[0]
      const { error: deleteError } = await supabaseAdmin
        .from('ai_analyses')
        .delete()
        .eq('id', oldestAnalysis.id)
      
      if (deleteError) {
        console.error('❌ 删除最早分析失败:', deleteError)
      } else {
        console.log(`🗑️ 删除最早的${analysis_type}分析: ${oldestAnalysis.id}`)
      }
    }

    // 保存新的分析结果
    const { data, error } = await supabaseAdmin
      .from('ai_analyses')
      .insert({
        chart_id: finalChartId,
        analysis_type,
        content,
        agent_name: agent_name || getAgentDisplayName(analysis_type)
      })
      .select()
      .single()

    if (error) {
      console.error('❌ 保存分析结果失败:', error)
      throw error
    }

    console.log(`✅ 手动保存${analysis_type}分析成功: ${data.id}`)
    return NextResponse.json({ 
      success: true, 
      analysis: data,
      chart_id: finalChartId,
      message: '分析结果已保存到命书'
    })

  } catch (error) {
    console.error('❌ 保存AI分析结果失败:', error)
    return NextResponse.json({ 
      error: '保存失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
} 