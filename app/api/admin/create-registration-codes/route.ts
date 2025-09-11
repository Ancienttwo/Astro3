import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { invalidateByExactPath } from '@/lib/edge/invalidate'

// 生成随机注册码
function generateRegistrationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(req: NextRequest) {
  try {
    // 这里应该添加管理员权限验证
    // TODO: 验证管理员权限

    const { count, batchName, description, expiresAt } = await req.json()

    console.log('收到创建注册码请求:', { count, batchName, description, expiresAt })

    if (!count || !batchName) {
      return NextResponse.json({ 
        success: false, 
        error: '参数不完整：需要数量和批次名称' 
      }, { status: 400 })
    }

    if (count > 1000) {
      return NextResponse.json({ 
        success: false, 
        error: '单次生成数量不能超过1000个' 
      }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Supabase客户端创建成功')

    // 生成注册码 - 使用生产环境的实际字段结构
    const registrationCodes = []
    for (let i = 0; i < count; i++) {
      registrationCodes.push({
        code: generateRegistrationCode(),
        description: description || `批次：${batchName}`,
        batch_name: batchName,
        is_used: false,  // 使用旧字段结构
        expires_at: expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 默认1年后过期
      })
    }

    console.log('准备插入注册码:', registrationCodes.length, '个')

    // 批量插入 - 只使用存在的字段
    const { data, error } = await supabase
      .from('registration_codes')
      .insert(registrationCodes)
      .select()

    if (error) {
      console.error('插入注册码失败:', error)
      return NextResponse.json({ 
        success: false, 
        error: `生成注册码失败: ${error.message}` 
      }, { status: 500 })
    }

    console.log('注册码生成成功:', data?.length)

    try { await invalidateByExactPath('/api/admin/registration-codes-stats','user') } catch {}

    return NextResponse.json({ 
      success: true, 
      message: `成功生成 ${count} 个注册码`,
      data: {
        count: data.length,
        batchName,
        codes: data.map(item => item.code)
      }
    })
  } catch (error) {
    console.error('生成注册码失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: `生成注册码失败，请重试: ${error instanceof Error ? error.message : '未知错误'}` 
    }, { status: 500 })
  }
} 
