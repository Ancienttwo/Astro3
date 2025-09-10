import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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
  } catch (error) {
    return { success: false, error: '认证错误' }
  }
}

// 获取用户的分析任务列表
export async function GET(request: NextRequest) {
  try {
    // 用户认证
    const authResult = await authenticateRequest(request)
    
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const user = authResult.user!
    
    // 从URL参数获取查询选项
    const url = new URL(request.url)
    const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '50'), 1), 100)
    const status = url.searchParams.get('status')
    const taskType = url.searchParams.get('task_type')

    // 构建查询
    let query = supabaseAdmin
      .from('analysis_tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    if (taskType) {
      query = query.eq('task_type', taskType)
    }

    const { data: tasks, error: queryError } = await query

    if (queryError) {
      console.error('❌ 查询任务失败:', queryError)
      return NextResponse.json({ 
        error: `查询任务失败: ${queryError.message}` 
      }, { status: 500 })
    }

    console.log(`✅ 查询到 ${tasks?.length || 0} 个任务`)
    return NextResponse.json({ 
      success: true,
      tasks: tasks || [],
      total: tasks?.length || 0
    })

  } catch (error) {
    console.error('❌ 获取任务列表API错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 创建分析任务
export async function POST(request: NextRequest) {
  try {
    // 用户认证
    const authResult = await authenticateRequest(request)
    
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const user = authResult.user!
    console.log('🔍 认证用户信息:', { 
      id: user.id, 
      email: user.email, 
      email_confirmed_at: user.email_confirmed_at 
    })
    
    // 解析请求体
    const taskData = await request.json()
    
    // 验证必要字段
    if (!taskData.task_type || !taskData.input_data) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 })
    }
    
    // 确保用户ID匹配
    if (taskData.user_id !== user.id) {
      return NextResponse.json({ error: '用户ID不匹配' }, { status: 403 })
    }
    
    // 🔥 关键修复：确保user_email不为null
    let userEmail = user.email
    if (!userEmail) {
      console.log('⚠️ 用户email为空，尝试从数据库获取...')
      
      // 尝试从users表获取邮箱
      const { data: dbUser, error: dbError } = await supabaseAdmin
        .from('users')
        .select('email')
        .eq('id', user.id)
        .single()
      
      if (dbUser?.email) {
        userEmail = dbUser.email
        console.log('✅ 从数据库获取到邮箱:', userEmail)
      } else {
        console.error('❌ 无法获取用户邮箱:', dbError)
        return NextResponse.json({ 
          error: '用户邮箱信息缺失，请联系管理员' 
        }, { status: 400 })
      }
    }
    
    // 构建最终任务数据
    const finalTaskData = {
      ...taskData,
      user_email: userEmail, // 确保不为null
      created_at: new Date().toISOString()
    }
    
    console.log('📝 准备插入任务数据:', {
      user_id: finalTaskData.user_id,
      user_email: finalTaskData.user_email,
      task_type: finalTaskData.task_type,
      status: finalTaskData.status
    })
    
    // 插入任务到数据库 - 使用supabaseAdmin绕过RLS限制
    const { data: task, error: insertError } = await supabaseAdmin
      .from('analysis_tasks')
      .insert([finalTaskData])
      .select()
      .single()

    if (insertError) {
      console.error('❌ 创建任务失败:', insertError)
      return NextResponse.json({ 
        error: `创建任务失败: ${insertError.message}` 
      }, { status: 500 })
    }

    console.log(`✅ 任务创建成功: ${task.id}`)
    return NextResponse.json(task)

  } catch (error) {
    console.error('❌ 创建任务API错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
} 