import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { invalidateByExactPath } from '@/lib/edge/invalidate'

const supabaseAdmin = getSupabaseAdmin()

interface TaskResult {
  id: string;
  user_id: string;
  task_type: string;
  status: string;
  input_data: Record<string, unknown>;
  result?: Record<string, unknown>;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

// 定义响应类型
interface ApiResponse {
  success: boolean;
  data?: TaskResult;
  error?: string;
}

// 认证函数
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

// 获取单个分析任务的详细信息
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    if (!id) {
      return NextResponse.json({ error: '缺少任务ID' }, { status: 400 })
    }

    // 用户认证
    const authResult = await authenticateRequest(request)
    
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const user = authResult.user!

    // 查询任务信息
    const { data: task, error: taskError } = await supabaseAdmin
      .from('analysis_tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ 
        error: '任务不存在或无权限访问',
        details: taskError?.message 
      }, { status: 404 })
    }

    console.log(`✅ 返回任务信息: ${id}`, {
      status: task.status,
      has_result: !!task.result,
      saved_to_ai_analyses: task.result?.saved_to_ai_analyses
    })

    return NextResponse.json(task)

  } catch (error) {
    console.error('❌ 获取任务信息失败:', error)
    return NextResponse.json({ 
      error: '服务器错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 删除任务（可选功能）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id
    
    if (!taskId) {
      return NextResponse.json({ error: '缺少任务ID' }, { status: 400 })
    }

    console.log(`🗑️ 删除任务: ${taskId}`)

    // 用户认证
    const authResult = await authenticateRequest(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: authResult.error || '用户认证失败' }, { status: 401 })
    }

    const user = authResult.user

    // 删除任务（只能删除自己的任务）
    const { error: deleteError } = await supabaseAdmin
      .from('analysis_tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('❌ 删除任务失败:', deleteError)
      return NextResponse.json({ error: '删除任务失败' }, { status: 500 })
    }

    console.log(`✅ 任务已删除: ${taskId}`)
    try {
      await invalidateByExactPath('/api/analysis-tasks', 'astrology')
      await invalidateByExactPath(`/api/analysis-tasks/${taskId}`, 'astrology')
    } catch {}
    return NextResponse.json({ message: '任务已删除' })

  } catch (error) {
    console.error('❌ 删除任务失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
} 
