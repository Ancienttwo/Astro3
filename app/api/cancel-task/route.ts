import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

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

// 手动取消分析任务
export async function POST(request: NextRequest) {
  try {
    const { taskId } = await request.json()
    
    if (!taskId) {
      return NextResponse.json({ error: '缺少taskId参数' }, { status: 400 })
    }

    console.log(`🚫 用户请求取消任务: ${taskId}`)

    // 用户认证
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const user = authResult.user!
    console.log(`👤 用户: ${user.email}`)

    // 查询任务是否存在且属于当前用户
    const { data: task, error: taskError } = await supabase
      .from('analysis_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single()

    if (taskError || !task) {
      console.error('❌ 任务不存在或无权限:', taskError)
      return NextResponse.json({ error: '任务不存在或无权限访问' }, { status: 404 })
    }

    // 检查任务状态，只能取消pending或processing状态的任务
    if (!['pending', 'processing'].includes(task.status)) {
      return NextResponse.json({ 
        error: `任务状态为${task.status}，无法取消` 
      }, { status: 400 })
    }

    // 更新任务状态为已取消
    const { error: updateError } = await supabase
      .from('analysis_tasks')
      .update({
        status: 'failed',
        error_message: '用户手动取消',
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId)

    if (updateError) {
      console.error('❌ 取消任务失败:', updateError)
      return NextResponse.json({ error: '取消任务失败' }, { status: 500 })
    }

    console.log(`✅ 任务已取消: ${taskId}`)

    return NextResponse.json({
      success: true,
      message: '任务已成功取消',
      taskId: taskId
    })

  } catch (error) {
    console.error('❌ 取消任务失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 批量取消用户的所有进行中任务
export async function DELETE(request: NextRequest) {
  try {
    console.log(`🚫 用户请求取消所有进行中的任务`)

    // 用户认证
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const user = authResult.user!
    console.log(`👤 用户: ${user.email}`)

    // 查询用户的所有进行中任务
    const { data: tasks, error: tasksError } = await supabase
      .from('analysis_tasks')
      .select('id, task_type, status, input_data')
      .eq('user_id', user.id)
      .in('status', ['pending', 'processing'])

    if (tasksError) {
      console.error('❌ 查询任务失败:', tasksError)
      return NextResponse.json({ error: '查询任务失败' }, { status: 500 })
    }

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ 
        success: true,
        message: '没有需要取消的任务',
        cancelledCount: 0
      })
    }

    // 批量取消所有进行中的任务
    const { error: updateError } = await supabase
      .from('analysis_tasks')
      .update({
        status: 'failed',
        error_message: '用户批量取消',
        completed_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .in('status', ['pending', 'processing'])

    if (updateError) {
      console.error('❌ 批量取消任务失败:', updateError)
      return NextResponse.json({ error: '批量取消任务失败' }, { status: 500 })
    }

    console.log(`✅ 已批量取消${tasks.length}个任务`)

    return NextResponse.json({
      success: true,
      message: `已成功取消${tasks.length}个进行中的任务`,
      cancelledCount: tasks.length,
      cancelledTasks: tasks.map(t => ({
        id: t.id,
        type: t.task_type,
        analysisType: t.input_data?.analysisType
      }))
    })

  } catch (error) {
    console.error('❌ 批量取消任务失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
} 