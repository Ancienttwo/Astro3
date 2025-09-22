import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/server/db'

// 清理失败和卡住的任务
export async function POST() {
  try {
    console.log('🧹 开始清理失败的分析任务...')

    // 清理超时任务（5分钟前创建的pending或processing任务）
    const timeoutCutoff = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    
    const supabaseAdmin = getSupabaseAdminClient()
    const { data: timeoutTasks } = await supabaseAdmin
      .from('analysis_tasks')
      .select('id, status, created_at')
      .in('status', ['pending', 'processing'])
      .lt('created_at', timeoutCutoff)

    if (timeoutTasks && timeoutTasks.length > 0) {
      console.log(`⏰ 发现 ${timeoutTasks.length} 个超时任务`)
      
      const { error: timeoutError } = await supabaseAdmin
        .from('analysis_tasks')
        .update({
          status: 'timeout',
          error_message: '任务超时',
          completed_at: new Date().toISOString()
        })
        .in('id', timeoutTasks.map(task => task.id))

      if (timeoutError) {
        console.error('❌ 更新超时任务失败:', timeoutError)
      } else {
        console.log(`✅ 成功将 ${timeoutTasks.length} 个任务标记为超时`)
      }
    }

    // 清理失败任务（状态为failed的任务）
    const { data: failedTasks } = await supabaseAdmin
      .from('analysis_tasks')
      .select('id, status, created_at')
      .eq('status', 'failed')

    if (failedTasks && failedTasks.length > 0) {
      console.log(`🗑️ 发现 ${failedTasks.length} 个失败任务`)
      
      const { error: deleteError } = await supabaseAdmin
        .from('analysis_tasks')
        .delete()
        .eq('status', 'failed')

      if (deleteError) {
        console.error('❌ 删除失败任务失败:', deleteError)
      } else {
        console.log(`✅ 成功删除 ${failedTasks.length} 个失败任务`)
      }
    }

    // 清理7天前的已完成任务
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    
    const { data: oldTasks } = await supabaseAdmin
      .from('analysis_tasks')
      .select('id')
      .in('status', ['completed', 'timeout'])
      .lt('completed_at', weekAgo)

    if (oldTasks && oldTasks.length > 0) {
      console.log(`🧹 发现 ${oldTasks.length} 个7天前的旧任务`)
      
      const { error: cleanError } = await supabaseAdmin
        .from('analysis_tasks')
        .delete()
        .in('id', oldTasks.map(task => task.id))

      if (cleanError) {
        console.error('❌ 清理旧任务失败:', cleanError)
      } else {
        console.log(`✅ 成功清理 ${oldTasks.length} 个旧任务`)
      }
    }

    return NextResponse.json({
      success: true,
      message: '任务清理完成',
      summary: {
        timeoutTasks: timeoutTasks?.length || 0,
        failedTasks: failedTasks?.length || 0,
        oldTasks: oldTasks?.length || 0
      }
    })

  } catch (error) {
    console.error('❌ 清理失败任务失败:', error)
    return NextResponse.json({ 
      error: '清理失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 获取任务状态统计
export async function GET() {
  try {
    // 获取任务统计信息
    const { data: stats } = await supabaseAdmin
      .from('analysis_tasks')
      .select('status, created_at')
      .order('created_at', { ascending: false })
      .limit(1000)

    if (!stats) {
      return NextResponse.json({ stats: {} })
    }

    const statusCount = stats.reduce((acc: Record<string, number>, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    }, {})

    const now = new Date()
    const oldTasks = stats.filter(task => {
      const createdAt = new Date(task.created_at)
      const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
      return hoursDiff > 24 // 24小时前的任务
    }).length

    return NextResponse.json({
      stats: statusCount,
      totalTasks: stats.length,
      oldTasks
    })

  } catch (error) {
    console.error('❌ 获取任务统计失败:', error)
    return NextResponse.json({ error: '获取统计信息失败' }, { status: 500 })
  }
} 
