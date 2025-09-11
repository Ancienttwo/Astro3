/**
 * 单个命盘操作API
 * 支持 GET, PUT, DELETE 操作
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCache, CacheKeys } from '@/lib/redis'
import { invalidateByExactPath } from '@/lib/edge/invalidate'

// 环境变量检查
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// 获取单个命盘
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 使用Bearer Token认证
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('用户认证失败:', authError)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    const { id } = params
    
    const { data, error } = await supabaseAdmin
      .from('user_charts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: '命盘不存在' },
          { status: 404 }
        )
      }
      console.error('查询命盘失败:', error)
      throw error
    }
    
    // 转换数据格式以兼容前端
    const formattedChart = {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      birth_year: data.birth_year || data.birth_data?.year,
      birth_month: data.birth_month || data.birth_data?.month,
      birth_day: data.birth_day || data.birth_data?.day,
      birth_hour: data.birth_hour || data.birth_data?.hour,
      gender: data.gender || data.birth_data?.gender,
      chart_type: data.chart_type,
      category: data.category || 'others',
      yongshen_info: data.yongshen_info, // 🔥 添加用神信息字段
      created_at: data.created_at,
      updated_at: data.updated_at
    }
    
    console.log('✅ 获取命盘成功:', id)
    
    return NextResponse.json({
      success: true,
      data: formattedChart
    })
    
  } catch (error) {
    console.error('❌ API错误:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '查询失败'
      },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

// 更新单个命盘
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 使用Bearer Token认证
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('用户认证失败:', authError)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { name, birth_year, birth_month, birth_day, birth_hour, gender } = body
    
    // 先获取现有数据
    const { data: existingChart, error: existingError } = await supabaseAdmin
      .from('user_charts')
      .select('birth_data')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (existingError || !existingChart) {
      return NextResponse.json(
        { success: false, error: '命盘不存在或无权限' },
        { status: 404 }
      )
    }
    
    // 构建更新数据
    const updateData: any = {}
    
    if (name !== undefined) updateData.name = name
    
    // 更新birth_data
    if (birth_year !== undefined || birth_month !== undefined || 
        birth_day !== undefined || birth_hour !== undefined || gender !== undefined) {
      
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
    
    // 更新命盘
    const { error: updateError } = await supabaseAdmin
      .from('user_charts')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('更新命盘失败:', updateError)
      return NextResponse.json({ 
        success: false, 
        error: '更新失败' 
      }, { status: 500 })
    }

    // 获取更新后的命盘数据
    const { data: updatedChart, error: refetchError } = await supabaseAdmin
      .from('user_charts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (refetchError || !updatedChart) {
      console.error('获取更新后的命盘失败:', refetchError)
      return NextResponse.json({ 
        success: false, 
        error: '更新成功但获取数据失败' 
      }, { status: 500 })
    }

    // 转换数据格式以兼容前端
    const formattedChart = {
      id: updatedChart.id,
      user_id: updatedChart.user_id,
      name: updatedChart.name,
      birth_year: updatedChart.birth_year || updatedChart.birth_data?.year,
      birth_month: updatedChart.birth_month || updatedChart.birth_data?.month,
      birth_day: updatedChart.birth_day || updatedChart.birth_data?.day,
      birth_hour: updatedChart.birth_hour || updatedChart.birth_data?.hour,
      gender: updatedChart.gender || updatedChart.birth_data?.gender,
      chart_type: updatedChart.chart_type,
      category: updatedChart.category || 'others',
      yongshen_info: updatedChart.yongshen_info, // 🔥 添加用神信息字段
      created_at: updatedChart.created_at,
      updated_at: updatedChart.updated_at
    }

    console.log('✅ 更新命盘成功:', id)
    
    try {
      await invalidateByExactPath('/api/charts', 'astrology')
      await invalidateByExactPath(`/api/charts/${id}`, 'astrology')
    } catch {}

    return NextResponse.json({ 
      success: true, 
      data: formattedChart,
      message: '更新成功' 
    })
    
  } catch (error) {
    console.error('更新命盘时发生错误:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// 删除单个命盘
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 使用Bearer Token认证
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('用户认证失败:', authError)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    const { id } = params
    
    const { error } = await supabaseAdmin
      .from('user_charts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('删除命盘失败:', error)
      return NextResponse.json({
        success: false,
        error: '删除失败'
      }, { status: 500 })
    }
    
    console.log(`✅ 删除命盘成功:`, id)
    
    // 🔥 清除用户的charts缓存
    const cache = getCache()
    const cacheKey = CacheKeys.charts(user.id)
    await cache.del(cacheKey)
    console.log(`🗑️ Charts cache cleared for user ${user.id}`)
    
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
