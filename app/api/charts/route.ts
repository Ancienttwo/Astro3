/**
 * 标准化命盘API
 * 基于新的数据库架构和认证系统
 * 支持 GET, POST, PUT, DELETE 操作
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCache, CacheKeys } from '@/lib/redis'
import { invalidateByExactPath } from '@/lib/edge/invalidate'
import { getCurrentUnifiedUser } from '@/lib/auth'

// 环境变量检查 - 开发和生产环境都需要配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// 获取用户所有命盘
export async function GET(request: NextRequest) {
  console.log('🚨🚨🚨 CHARTS API CALLED - NEW VERSION 🚨🚨🚨')
  
  // 🔍 调试：检查服务端环境变量
  console.log('🔧 服务端环境变量检查:', {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length
  })
  
  try {
    // 获取用户认证 - 使用统一认证系统以支持Web3和Web2用户数据隔离
    const authHeader = request.headers.get('Authorization')
    const web3AuthHeader = request.headers.get('X-Web3-Auth')
    
    // 检查认证：需要Bearer token或Web3认证header之一
    if ((!authHeader || !authHeader.startsWith('Bearer ')) && !web3AuthHeader) {
      return NextResponse.json(
        { error: 'Missing authorization: require Bearer token or Web3 auth header' },
        { status: 401 }
      )
    }

    const token = authHeader?.split(' ')[1]
    
    // 检测用户认证类型以确保数据隔离
    let userContext = null
    
    if (web3AuthHeader) {
      // Web3用户认证流程
      try {
        const web3AuthData = JSON.parse(web3AuthHeader)
        const { data: web3User, error: web3Error } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('wallet_address', web3AuthData.wallet_address?.toLowerCase())
          .in('auth_type', ['web3', 'walletconnect', 'web3auth'])
          .single()
        
        if (web3User && !web3Error) {
          userContext = {
            id: web3User.id,
            auth_type: web3User.auth_type || 'web3',
            wallet_address: web3User.wallet_address
          }
        }
      } catch (e) {
        console.error('Web3认证解析失败:', e)
      }
    } 
    
    if (!userContext) {
      // Web2/Supabase用户认证流程
      if (!token) {
        return NextResponse.json(
          { error: 'Missing Bearer token for Web2 authentication' },
          { status: 401 }
        )
      }
      
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
      
      if (authError || !user) {
        console.error('用户认证失败:', authError)
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        )
      }
      
      // 检查是否是Web3用户（通过邮箱域名判断）
      const isWeb3Email = user.email?.endsWith('@astrozi.ai') || 
                         user.email?.endsWith('@web3.local') || 
                         user.email?.endsWith('@web3.astrozi.app')
      
      // 如果是Web3邮箱，在users表中查找对应记录
      if (isWeb3Email) {
        const { data: web3UserRecord } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        
        userContext = {
          id: user.id,
          auth_type: web3UserRecord?.auth_type || 'web3',
          email: user.email,
          wallet_address: web3UserRecord?.wallet_address
        }
        console.log(`🔍 通过邮箱识别为Web3用户: ${user.email}`)
      } else {
        userContext = {
          id: user.id,
          auth_type: 'web2',
          email: user.email
        }
      }
    }
    
    const cache = getCache()
    const cacheKey = CacheKeys.charts(userContext.id)

    // 清除缓存，确保获取最新的用神信息
    await cache.del(cacheKey)

    // 🚨 EMERGENCY FIX: 立即阻止Web3用户访问其他数据
    console.log(`🔍 用户上下文检查: userId="${userContext.id}", authType="${userContext.auth_type}", email="${userContext.email}"`)
    
    // 🔍 DEBUG: 分析Web3用户数据访问情况
    if (userContext.auth_type === 'web3') {
      console.log('🔍 Web3用户详细信息:', {
        id: userContext.id,
        email: userContext.email,
        wallet_address: userContext.wallet_address
      })
    }
    
    // 🔍 基础调试：检查Supabase查询是否正常工作
    console.log(`🔍 准备查询命盘，user_id = "${userContext.id}"`)
    
    const { data: charts, error } = await supabaseAdmin
      .from('user_charts')
      .select(`
        id, user_id, name, birth_year, birth_month, birth_day, birth_hour, 
        gender, chart_type, category, birth_data, yongshen_info, 
        created_at, updated_at
      `)
      .eq('user_id', userContext.id)
      .order('created_at', { ascending: false })
    
    console.log(`🔍 Supabase查询完成:`)
    console.log(`  - Error: ${error ? JSON.stringify(error) : 'None'}`)
    console.log(`  - Charts count: ${charts?.length || 0}`)
    console.log(`  - Query used user_id: "${userContext.id}"`)
    
    // 如果查询到数据，验证每个命盘的user_id
    if (charts && charts.length > 0) {
      console.log(`🔍 验证查询结果中每个命盘的user_id:`)
      charts.forEach((chart, index) => {
        console.log(`  ${index + 1}. 命盘"${chart.name}" (${chart.id}): user_id="${chart.user_id}"`)
      })
    }
    
    console.log(`📊 查询结果: 找到${charts?.length || 0}个命盘`)
    console.log('📋 命盘详情:', charts?.map(c => ({ 
      id: c.id, 
      name: c.name, 
      user_id: c.user_id,
      created_at: c.created_at
    })))
    
    // 🔍 关键检查：Web3用户的ID是否真的与这些命盘的user_id匹配
    if (userContext.auth_type === 'web3' && charts && charts.length > 0) {
      console.log('🚨 关键检查: Web3用户ID与命盘user_id匹配情况:')
      charts.forEach(chart => {
        const isMatch = chart.user_id === userContext.id
        console.log(`  命盘 ${chart.name}: user_id="${chart.user_id}", 匹配=${isMatch}`)
      })
    }
    
    if (error) {
      console.error('❌ 查询命盘失败:', error)
      
      // 如果是auth_type列不存在的错误，尝试不带auth_type的查询
      if (error.message?.includes('auth_type') || error.code === '42703') {
        console.log('⚠️ auth_type列不存在，回退到基础查询')
        const { data: fallbackCharts, error: fallbackError } = await supabaseAdmin
          .from('user_charts')
          .select(`
            id, user_id, name, birth_year, birth_month, birth_day, birth_hour, 
            gender, chart_type, category, birth_data, yongshen_info, 
            created_at, updated_at
          `)
          .eq('user_id', userContext.id)
          .order('created_at', { ascending: false })
        
        if (fallbackError) {
          console.error('❌ 回退查询也失败:', fallbackError)
          return NextResponse.json({ error: 'Failed to fetch charts' }, { status: 500 })
        }
        
        console.log(`📊 回退查询结果: 找到${fallbackCharts?.length || 0}个命盘`)
        // 使用回退数据，但在返回时标记为需要迁移
        const chartsWithWarning = fallbackCharts?.map(chart => ({
          ...chart,
          auth_type: 'needs_migration'
        })) || []
        
        return NextResponse.json({
          success: true,
          data: chartsWithWarning,
          warning: 'auth_type列不存在，需要执行数据库迁移'
        })
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch charts' },
        { status: 500 }
      )
    }
    
    // 转换数据格式以兼容前端 ChartRecord 接口
    const formattedCharts = charts?.map(chart => {
      // 构建 metadata 对象，包含用神信息
      const metadata: any = {}
      if (chart.yongshen_info) {
        metadata.yongShenInfo = chart.yongshen_info
      }

      // 构建 birthInfo 对象
      const birthInfo = {
        year: chart.birth_year || chart.birth_data?.year,
        month: chart.birth_month || chart.birth_data?.month,
        day: chart.birth_day || chart.birth_data?.day,
        hour: chart.birth_hour || chart.birth_data?.hour,
        gender: chart.gender || chart.birth_data?.gender
      }

      // 构建 timestamps 对象
      const timestamps = {
        createdAt: new Date(chart.created_at),
        updatedAt: new Date(chart.updated_at)
      }

      // 返回符合 ChartRecord 接口的数据
      return {
        id: chart.id,
        userId: chart.user_id,
        name: chart.name,
        birthInfo,
        chartType: chart.chart_type,
        category: chart.category || 'others',
        metadata: Object.keys(metadata).length > 0 ? metadata : {},
        timestamps,
        // 兼容性字段：保留原有字段以防组件还在使用
        user_id: chart.user_id,
        birth_year: birthInfo.year,
        birth_month: birthInfo.month,
        birth_day: birthInfo.day,
        birth_hour: birthInfo.hour,
        gender: birthInfo.gender,
        chart_type: chart.chart_type,
        created_at: chart.created_at,
        updated_at: chart.updated_at
      }
    }) || []
    
    // 缓存结果（缓存1小时）
    try {
      await cache.set(cacheKey, JSON.stringify(formattedCharts), 3600)
    } catch (error) {
      console.error('Cache set error:', error)
    }
    
    return NextResponse.json({
      success: true,
      data: formattedCharts
    })
    
  } catch (error) {
    console.error('Charts API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 获取Agent显示名称的辅助函数
function getAgentDisplayName(analysisType: string): string {
  const agentMap: Record<string, string> = {
    'tiekou_zhiduan': '铁口直断大师',
    'yongshen_analysis': '用神大师',
    'ziwei_reasoning': '紫微推理大师',
    'sihua_reasoning': '四化分析大师'
  }
  return agentMap[analysisType] || '未知Agent'
}

// 创建新命盘
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Charts API POST: 开始认证用户...')
    
    // 使用统一认证系统
    const userContext = await getCurrentUnifiedUser(request)
    
    console.log('🔍 Charts API POST: 认证结果:', userContext ? `用户ID: ${userContext.id}, 认证类型: ${userContext.auth_type}` : '未认证')
    
    if (!userContext) {
      console.log('❌ Charts API POST: 用户认证失败')
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { name, birth_year, birth_month, birth_day, birth_hour, gender, chart_type, category } = body

    
    // 验证必填字段
    if (!name || !birth_year || !birth_month || !birth_day || birth_hour === undefined || !gender || !chart_type) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      )
    }
    
    // 验证数据格式
    if (
      typeof birth_year !== 'number' || birth_year < 1900 || birth_year > 2100 ||
      typeof birth_month !== 'number' || birth_month < 1 || birth_month > 12 ||
      typeof birth_day !== 'number' || birth_day < 1 || birth_day > 31 ||
      typeof birth_hour !== 'number' || birth_hour < 0 || birth_hour > 23 ||
      !['male', 'female'].includes(gender) ||
      !['bazi', 'ziwei'].includes(chart_type) ||
      (category && !['friends', 'family', 'clients', 'favorites', 'others'].includes(category))
    ) {
      return NextResponse.json(
        { success: false, error: '数据格式不正确' },
        { status: 400 }
      )
    }

    
    // 构建birth_data JSONB对象
    const birth_data = {
      year: birth_year,
      month: birth_month,
      day: birth_day,
      hour: birth_hour,
      gender: gender
    }
    
    // 构建插入数据，包含category字段和认证类型以确保数据隔离
    const insertData: any = {
      user_id: userContext.id,
      name,
      birth_data,
      chart_type,
      category: category || 'others',
      auth_type: userContext.auth_type, // 重要：记录创建图表时的认证类型
      // 同时填充独立字段以满足NOT NULL约束
      birth_year,
      birth_month,
      birth_day,
      birth_hour,
      gender
    };

    const { data: chart, error } = await supabaseAdmin
      .from('user_charts')
      .insert(insertData)
      .select()
      .single()
    
    if (error) {
      console.error('创建命盘失败:', error)
      throw error
    }
    
    // 转换返回格式以兼容前端 ChartRecord 接口
    const birthInfo = {
      year: chart.birth_year || chart.birth_data?.year,
      month: chart.birth_month || chart.birth_data?.month,
      day: chart.birth_day || chart.birth_data?.day,
      hour: chart.birth_hour || chart.birth_data?.hour,
      gender: chart.gender || chart.birth_data?.gender
    }

    const timestamps = {
      createdAt: new Date(chart.created_at),
      updatedAt: new Date(chart.updated_at)
    }

    const formattedChart = {
      id: chart.id,
      userId: chart.user_id,
      name: chart.name,
      birthInfo,
      chartType: chart.chart_type,
      category: chart.category || 'others',
      metadata: {},
      timestamps,
      // 兼容性字段
      user_id: chart.user_id,
      birth_year: birthInfo.year,
      birth_month: birthInfo.month,
      birth_day: birthInfo.day,
      birth_hour: birthInfo.hour,
      gender: birthInfo.gender,
      chart_type: chart.chart_type,
      created_at: chart.created_at,
      updated_at: chart.updated_at
    }
    
    // 清除用户的charts缓存
    const cache = getCache()
    const cacheKey = CacheKeys.charts(userContext.id)
    await cache.del(cacheKey)
    
    try {
      await invalidateByExactPath('/api/charts', 'astrology')
    } catch {}

    return NextResponse.json({
      success: true,
      data: formattedChart
    }, { status: 201 })
    
  } catch (error) {
    console.error('Chart creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 更新命盘
export async function PUT(request: NextRequest) {
  try {
    console.log('🔍 Charts API PUT: 开始认证用户...')
    
    // 使用统一认证系统
    const userContext = await getCurrentUnifiedUser(request)
    
    console.log('🔍 Charts API PUT: 认证结果:', userContext ? `用户ID: ${userContext.id}, 认证类型: ${userContext.auth_type}` : '未认证')
    
    if (!userContext) {
      console.log('❌ Charts API PUT: 用户认证失败')
      return NextResponse.json({ error: '用户认证失败' }, { status: 401 })
    }
    
    const body = await request.json()
    const { id, name, birth_year, birth_month, birth_day, birth_hour, gender, category } = body
    
    // 验证必填字段
    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少命盘ID' },
        { status: 400 }
      )
    }
    
    // 构建更新数据
    const updateData: any = {}
    
    if (name !== undefined) updateData.name = name
    if (category !== undefined) updateData.category = category
    
    if (birth_year !== undefined || birth_month !== undefined || 
        birth_day !== undefined || birth_hour !== undefined || gender !== undefined) {
      
      // 先获取现有数据 - 添加认证类型过滤确保数据隔离
      let fetchQuery = supabaseAdmin
        .from('user_charts')
        .select('birth_data, auth_type')
        .eq('id', id)
        .eq('user_id', userContext.id)
      
      // 根据认证类型进行严格过滤
      if (['web3', 'walletconnect', 'web3auth'].includes(userContext.auth_type as string)) {
        fetchQuery = fetchQuery.in('auth_type', ['web3', 'walletconnect', 'web3auth'])
      } else {
        fetchQuery = fetchQuery.or('auth_type.is.null,auth_type.eq.web2')
      }
      
      const { data: existingChart, error: fetchError } = await fetchQuery.single()
      
      if (fetchError || !existingChart) {
        return NextResponse.json(
          { success: false, error: '命盘不存在或无权限' },
          { status: 404 }
        )
      }
      
      // 更新birth_data
      updateData.birth_data = {
        ...existingChart.birth_data,
        ...(birth_year !== undefined && { year: birth_year }),
        ...(birth_month !== undefined && { month: birth_month }),
        ...(birth_day !== undefined && { day: birth_day }),
        ...(birth_hour !== undefined && { hour: birth_hour }),
        ...(gender !== undefined && { gender: gender })
      }
    }
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: '没有需要更新的数据' },
        { status: 400 }
      )
    }
    
    // 更新时也需要添加认证类型过滤确保数据隔离
    let updateQuery = supabaseAdmin
      .from('user_charts')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userContext.id)
    
    // 根据认证类型进行严格过滤
    if (['web3', 'walletconnect', 'web3auth'].includes(userContext.auth_type as string)) {
      updateQuery = updateQuery.in('auth_type', ['web3', 'walletconnect', 'web3auth'])
    } else {
      updateQuery = updateQuery.or('auth_type.is.null,auth_type.eq.web2')
    }
    
    const { data: chart, error } = await updateQuery
      .select()
      .single()
    
    if (error) {
      console.error('更新命盘失败:', error)
      throw error
    }
    
    // 转换返回格式以兼容前端 ChartRecord 接口
    const birthInfo = {
      year: chart.birth_year || chart.birth_data?.year,
      month: chart.birth_month || chart.birth_data?.month,
      day: chart.birth_day || chart.birth_data?.day,
      hour: chart.birth_hour || chart.birth_data?.hour,
      gender: chart.gender || chart.birth_data?.gender
    }

    const timestamps = {
      createdAt: new Date(chart.created_at),
      updatedAt: new Date(chart.updated_at)
    }

    // 构建 metadata 对象，包含用神信息
    const metadata: any = {}
    if (chart.yongshen_info) {
      metadata.yongShenInfo = chart.yongshen_info
    }

    const formattedChart = {
      id: chart.id,
      userId: chart.user_id,
      name: chart.name,
      birthInfo,
      chartType: chart.chart_type,
      category: chart.category || 'others',
      metadata: Object.keys(metadata).length > 0 ? metadata : {},
      timestamps,
      // 兼容性字段
      user_id: chart.user_id,
      birth_year: birthInfo.year,
      birth_month: birthInfo.month,
      birth_day: birthInfo.day,
      birth_hour: birthInfo.hour,
      gender: birthInfo.gender,
      chart_type: chart.chart_type,
      created_at: chart.created_at,
      updated_at: chart.updated_at
    }

    
    try {
      await invalidateByExactPath('/api/charts', 'astrology')
      await invalidateByExactPath(`/api/charts/${id}`, 'astrology')
    } catch {}

    return NextResponse.json({
      success: true,
      data: formattedChart
    })
    
  } catch (error) {
    console.error('❌ API错误:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '更新失败'
      },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

// 删除命盘
export async function DELETE(request: NextRequest) {
  try {
    console.log('🔍 Charts API DELETE: 开始认证用户...')
    
    // 使用统一认证系统
    const userContext = await getCurrentUnifiedUser(request)
    
    console.log('🔍 Charts API DELETE: 认证结果:', userContext ? `用户ID: ${userContext.id}, 认证类型: ${userContext.auth_type}` : '未认证')
    
    if (!userContext) {
      console.log('❌ Charts API DELETE: 用户认证失败')
      return NextResponse.json({ error: '用户认证失败' }, { status: 401 })
    }
    
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少命盘ID' },
        { status: 400 }
      )
    }
    
    // 删除时也需要添加认证类型过滤确保数据隔离
    let deleteQuery = supabaseAdmin
      .from('user_charts')
      .delete()
      .eq('id', id)
      .eq('user_id', userContext.id)
    
    // 根据认证类型进行严格过滤
    if (['web3', 'walletconnect', 'web3auth'].includes(userContext.auth_type as string)) {
      deleteQuery = deleteQuery.in('auth_type', ['web3', 'walletconnect', 'web3auth'])
    } else {
      deleteQuery = deleteQuery.or('auth_type.is.null,auth_type.eq.web2')
    }
    
    const { error } = await deleteQuery
    
    if (error) {
      console.error('删除命盘失败:', error)
      throw error
    }
    
    // 清除用户的charts缓存
    const cache = getCache()
    const cacheKey = CacheKeys.charts(userContext.id)
    await cache.del(cacheKey)
    
    try {
      await invalidateByExactPath('/api/charts', 'astrology')
      await invalidateByExactPath(`/api/charts/${id}`, 'astrology')
    } catch {}

    return NextResponse.json({
      success: true,
      message: '删除成功'
    })
    
  } catch (error) {
    console.error('❌ API错误:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '删除失败'
      },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
} 
