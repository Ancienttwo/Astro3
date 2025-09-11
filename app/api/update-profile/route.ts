import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { invalidateByExactPath } from '@/lib/edge/invalidate'

export async function PUT(request: NextRequest) {
  try {
    console.log('👤 更新用户个人资料...')
    
    // 从Authorization header获取token
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: '用户未登录'
      }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    // 使用token创建客户端
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )

    // 验证用户
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({
        success: false,
        error: '用户未登录'
      }, { status: 401 })
    }

    // 解析请求数据
    const { username } = await request.json()
    
    if (!username || typeof username !== 'string') {
      return NextResponse.json({
        success: false,
        error: '昵称不能为空'
      }, { status: 400 })
    }

    // 验证昵称长度
    if (username.length < 1 || username.length > 20) {
      return NextResponse.json({
        success: false,
        error: '昵称长度必须在1-20个字符之间'
      }, { status: 400 })
    }

    console.log(`👤 用户 ${user.email} 更新昵称为: ${username}`)

    // 更新用户信息
    const { data, error } = await supabase
      .from('users')
      .update({ 
        username: username.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('❌ 更新用户信息失败:', error)
      return NextResponse.json({
        success: false,
        error: '更新失败，请稍后重试'
      }, { status: 500 })
    }

    console.log('✅ 用户信息更新成功:', data)

    // 失效用户相关的边缘缓存（如通过网关读取的 /api/user/profile 等）
    try {
      await invalidateByExactPath('/api/user/profile', 'user')
    } catch (e) {
      console.warn('⚠️ 边缘缓存失效（用户资料）失败:', (e as Error)?.message)
    }

    return NextResponse.json({
      success: true,
      message: '昵称更新成功',
      data: {
        id: data.id,
        email: data.email,
        username: data.username,
        updated_at: data.updated_at
      }
    })

  } catch (error) {
    console.error('❌ 更新用户个人资料失败:', error)
    return NextResponse.json({
      success: false,
      error: '服务器错误，请稍后重试'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('👤 获取用户个人资料...')
    
    // 从Authorization header获取token
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: '用户未登录'
      }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    // 使用token创建客户端
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )

    // 验证用户
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({
        success: false,
        error: '用户未登录'
      }, { status: 401 })
    }

    // 获取用户详细信息
    const { data, error } = await supabase
      .from('users')
      .select('id, email, username, created_at, updated_at')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('❌ 获取用户信息失败:', error)
      return NextResponse.json({
        success: false,
        error: '获取用户信息失败'
      }, { status: 500 })
    }

    console.log('✅ 获取用户信息成功:', data)

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('❌ 获取用户个人资料失败:', error)
    return NextResponse.json({
      success: false,
      error: '服务器错误，请稍后重试'
    }, { status: 500 })
  }
} 
