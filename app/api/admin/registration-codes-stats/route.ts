import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // 这里应该添加管理员权限验证
    // TODO: 验证管理员权限

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 获取统计信息
    const { data, error } = await supabase
      .from('registration_codes')
      .select('*')

    if (error) {
      console.error('查询注册码统计失败:', error)
      return NextResponse.json({ 
        success: false, 
        error: '查询统计失败' 
      }, { status: 500 })
    }

    // 使用生产环境的实际字段结构计算统计
    const stats = {
      total: data.length,
      used: data.filter(item => item.is_used === true).length,
      unused: data.filter(item => item.is_used === false).length,
      expired: 0, // 生产环境表没有expires_at字段
      batches: [...new Set(data.map(item => item.batch_name).filter(Boolean))].length
    }

    return NextResponse.json({ 
      success: true, 
      data: stats 
    })
  } catch (error) {
    console.error('获取注册码统计失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: '获取统计失败，请重试' 
    }, { status: 500 })
  }
} 