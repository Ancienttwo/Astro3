import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/server/db'
import { getCurrentUnifiedUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cacheKey, analysisType } = body
    
    if (!cacheKey || !analysisType) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }
    
    console.log('🗑️ 清除AI分析数据:', { cacheKey, analysisType })
    
    // 获取当前用户
    const user = await getCurrentUnifiedUser()
    
    if (user?.id) {
      const supabase = getSupabaseAdminClient()
      // 删除数据库中的分析记录
      const { error } = await supabase
        .from('ziwei_analyses')
        .delete()
        .eq('user_id', user.id)
        .eq('cache_key', cacheKey)
        .eq('analysis_type', analysisType)
      
      if (error) {
        console.error('数据库删除失败:', error)
      } else {
        console.log('✅ 数据库分析记录已删除')
      }
    }
    
    return NextResponse.json({ 
      success: true,
      message: '分析数据已清除，请重新生成AI分析'
    })
  } catch (error) {
    console.error('清除分析数据失败:', error)
    return NextResponse.json({ error: '清除失败' }, { status: 500 })
  }
} 
