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
    console.log('🎯 保存用神信息API被调用')

    // 获取认证token
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ 缺少认证token')
      return NextResponse.json({ error: '缺少认证token' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    console.log('🔑 认证token长度:', token.length)
    
    // 验证用户身份
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      console.error('❌ 用户认证失败:', authError)
      return NextResponse.json({ error: '用户认证失败' }, { status: 401 })
    }

    console.log('✅ 用户认证成功:', user.id)

    // 解析请求数据
    let requestBody
    try {
      requestBody = await request.json()
      console.log('📋 接收到的原始数据:', JSON.stringify(requestBody, null, 2))
    } catch (parseError) {
      console.error('❌ JSON解析失败:', parseError)
      return NextResponse.json({ error: 'JSON数据格式错误' }, { status: 400 })
    }

    const { birth_data, chart_type, yongshen_info } = requestBody

    console.log('📋 解析后的数据:', {
      birth_data,
      chart_type,
      yongshen_info: {
        primaryYongShen: yongshen_info?.primaryYongShen,
        confidence: yongshen_info?.confidence
      }
    })

    // 验证必要字段
    if (!birth_data || !yongshen_info) {
      console.error('❌ 缺少必要数据:', { hasBirthData: !!birth_data, hasYongShenInfo: !!yongshen_info })
      return NextResponse.json({ error: '缺少必要数据' }, { status: 400 })
    }

    // 验证birth_data的必要字段
    if (!birth_data.name || !birth_data.year || !birth_data.month || !birth_data.day || !birth_data.hour || !birth_data.gender) {
      console.error('❌ birth_data字段不完整:', birth_data)
      return NextResponse.json({ error: 'birth_data字段不完整' }, { status: 400 })
    }

    console.log('🔍 开始查询现有命书记录...')

    // 查找或创建对应的命书记录
    const { data: existingCharts, error: queryError } = await supabaseAdmin
      .from('user_charts')
      .select('*')
      .eq('user_id', user.id)
      .eq('name', birth_data.name)
      .eq('birth_year', birth_data.year)
      .eq('birth_month', birth_data.month)
      .eq('birth_day', birth_data.day)
      .eq('birth_hour', birth_data.hour)
      .eq('gender', birth_data.gender === '男' ? 'male' : 'female')
      .eq('chart_type', chart_type)

    if (queryError) {
      console.error('❌ 查询命书记录失败:', queryError)
      return NextResponse.json({ error: `查询命书记录失败: ${queryError.message}` }, { status: 500 })
    }

    console.log('🔍 查询结果:', { 
      foundCharts: existingCharts?.length || 0,
      charts: existingCharts?.map(c => ({ id: c.id, name: c.name })) || []
    })

    let chartId: string

    if (existingCharts && existingCharts.length > 0) {
      // 更新现有记录
      chartId = existingCharts[0].id
      console.log('🔄 更新现有命书记录:', chartId)

      const { error: updateError } = await supabaseAdmin
        .from('user_charts')
        .update({
          yongshen_info: yongshen_info,
          updated_at: new Date().toISOString()
        })
        .eq('id', chartId)

      if (updateError) {
        console.error('❌ 更新命书记录失败:', updateError)
        return NextResponse.json({ error: `更新命书记录失败: ${updateError.message}` }, { status: 500 })
      }

      console.log('✅ 命书记录更新成功')

    } else {
      // 创建新记录
      console.log('➕ 创建新命书记录')

      const newChartData = {
        user_id: user.id,
        name: birth_data.name,
        birth_year: birth_data.year,
        birth_month: birth_data.month,
        birth_day: birth_data.day,
        birth_hour: birth_data.hour,
        gender: birth_data.gender === '男' ? 'male' : 'female',
        chart_type: chart_type,
        yongshen_info: yongshen_info,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('📋 准备插入的数据:', JSON.stringify(newChartData, null, 2))

      const { data: newChart, error: insertError } = await supabaseAdmin
        .from('user_charts')
        .insert([newChartData])
        .select('id')
        .single()

      if (insertError) {
        console.error('❌ 创建命书记录失败:', insertError)
        return NextResponse.json({ error: `创建命书记录失败: ${insertError.message}` }, { status: 500 })
      }

      if (!newChart) {
        console.error('❌ 创建命书记录失败: 返回数据为空')
        return NextResponse.json({ error: '创建命书记录失败: 返回数据为空' }, { status: 500 })
      }

      chartId = newChart.id
      console.log('✅ 新命书记录创建成功:', chartId)
    }

    console.log('✅ 用神信息保存成功:', chartId)

    return NextResponse.json({
      success: true,
      chart_id: chartId,
      message: '用神信息已保存到命书'
    })

  } catch (error) {
    console.error('❌ 保存用神信息失败:', error)
    console.error('❌ 错误堆栈:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({
      error: error instanceof Error ? error.message : '保存用神信息失败'
    }, { status: 500 })
  }
} 