import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

const supabaseAdmin = getSupabaseAdmin()

// 认证函数
async function authenticateRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return { success: false, error: '缺少认证token' }
    }
    
    const token = authHeader.substring(7)
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !user) {
      return { success: false, error: '认证失败' }
    }
    
    return { success: true, user }
  } catch (error) {
    return { success: false, error: '认证错误' }
  }
}

// 查询异步任务状态和结果
export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params
    
    if (!taskId) {
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
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ 
        error: '任务不存在或无权限访问' 
      }, { status: 404 })
    }

    // 构建响应数据 (使用正式环境的字段名)
    const response: any = {
      id: task.id,
      status: task.status,
      created_at: task.created_at,
      started_at: task.started_at,
      completed_at: task.completed_at,
      error: task.result?.error || null // 从result字段获取错误信息
    }

    // 如果任务完成且已保存到ai_analyses表，从ai_analyses表获取分析结果
    if (task.status === 'completed' && task.result?.saved_to_ai_analyses && task.result?.analysis_id) {
      try {
        const { data: analysisData, error: analysisError } = await supabaseAdmin
          .from('ai_analyses')
          .select('content, analysis_type, agent_name, created_at')
          .eq('id', task.result.analysis_id)
          .single()

        if (analysisData) {
          response.filtered_result = analysisData.content
          response.content_length = analysisData.content?.length || 0
          response.filtering_enabled = task.result.filtering_enabled
          response.powered_by = analysisData.agent_name || task.result.powered_by
          response.analysis_type = analysisData.analysis_type
          response.saved_to_ai_analyses = true
          
          // 🔐 不返回原始内容，保护算法机密
        } else {
          console.error(`❌ 无法从ai_analyses表获取分析结果: ${task.result.analysis_id}`, analysisError)
          response.error = '分析结果获取失败'
        }
      } catch (error) {
        console.error(`❌ 查询ai_analyses表失败:`, error)
        response.error = '分析结果查询异常'
      }
    }

    // 添加进度信息
    if (task.status === 'processing') {
      response.progress = 50
      response.message = 'AI正在进行完整分析...'
    } else if (task.status === 'filtering') {
      response.progress = 75
      response.message = 'AI正在过滤思考过程...'
    } else if (task.status === 'completed') {
      response.progress = 100
      response.message = '分析完成！'
    } else if (task.status === 'failed') {
      response.progress = 0
      response.message = '分析失败'
    } else {
      response.progress = 25
      response.message = '任务等待处理中...'
    }

    console.log(`✅ 返回异步任务状态: ${taskId} - ${task.status}`)
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ 查询异步任务失败:', error)
    return NextResponse.json({ 
      error: '服务器错误' 
    }, { status: 500 })
  }
} 
