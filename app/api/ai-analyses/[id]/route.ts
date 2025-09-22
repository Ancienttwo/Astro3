import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/server/db'

const supabaseAdmin = getSupabaseAdminClient()

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
  } catch {
    return { success: false, error: '认证错误' }
  }
}

// DELETE /api/ai-analyses/[id] - 删除指定的AI分析
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // 用户认证
    const authResult = await authenticateRequest(request)
    
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const user = authResult.user!

    if (!id) {
      return NextResponse.json({ error: '缺少分析ID' }, { status: 400 })
    }

    // 首先验证该分析是否属于当前用户
    const { data: analysis, error: analysisError } = await supabaseAdmin
      .from('ai_analyses')
      .select(`
        id,
        chart_id,
        analysis_type,
        user_charts!inner(user_id)
      `)
      .eq('id', id)
      .single()

    if (analysisError || !analysis) {
      console.error(`分析验证失败: ${id}`, analysisError)
      return NextResponse.json({ 
        error: '分析不存在' 
      }, { status: 404 })
    }

    // 验证用户权限
    if ((analysis as any).user_charts?.user_id !== user.id) {
      return NextResponse.json({ 
        error: '无权限删除此分析' 
      }, { status: 403 })
    }

    // 删除分析
    const { error: deleteError } = await supabaseAdmin
      .from('ai_analyses')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('删除AI分析失败:', deleteError)
      throw deleteError
    }

    console.log(`✅ AI分析已删除: ${id} (${analysis.analysis_type})`)

    return NextResponse.json({
      success: true,
      message: '分析已删除'
    })

  } catch (error) {
    console.error('❌ 删除AI分析失败:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '删除失败' 
    }, { status: 500 })
  }
} 
