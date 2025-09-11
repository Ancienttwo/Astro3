import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { CacheManager } from '@/lib/redis-cache'
import { invalidateByExactPath } from '@/lib/edge/invalidate'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // 支持多种参数格式
    const registrationCode = body.registrationCode || body.code
    const userEmail = body.userEmail || body.email
    const userId = body.userId

    if (!registrationCode || !userEmail) {
      return NextResponse.json({ success: false, error: '参数不完整' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('使用注册码:', registrationCode.toUpperCase(), '用户:', userEmail, 'UserId:', userId)

    // 查找并验证注册码 - 使用生产环境实际字段
    const { data: registrationCodeData, error: findError } = await supabase
      .from('registration_codes')
      .select('*')
      .eq('code', registrationCode.toUpperCase())
      .eq('is_used', false)
      .single()

    if (findError) {
      console.error('查询注册码失败:', findError)
      return NextResponse.json({ success: false, error: '注册码无效或已使用' }, { status: 400 })
    }

    if (!registrationCodeData) {
      console.log('注册码不存在:', registrationCode.toUpperCase())
      return NextResponse.json({ success: false, error: '注册码无效或已使用' }, { status: 400 })
    }

    console.log('找到注册码数据:', registrationCodeData)

    // 检查过期时间
    if (registrationCodeData.expires_at) {
      const now = new Date()
      const expiresAt = new Date(registrationCodeData.expires_at)
      if (now > expiresAt) {
        console.log('注册码已过期:', expiresAt)
        return NextResponse.json({ success: false, error: '注册码已过期' }, { status: 400 })
      }
    }

    // 标记注册码为已使用 - 只使用确认存在的字段
    const updateData = {
      is_used: true,
      used_by: userEmail,
      used_at: new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('registration_codes')
      .update(updateData)
      .eq('id', registrationCodeData.id)

    if (updateError) {
      console.error('标记注册码为已使用失败:', updateError)
      return NextResponse.json({ success: false, error: '使用注册码失败' }, { status: 500 })
    }

    console.log('注册码使用成功:', registrationCode.toUpperCase())

    // 缓存失效：用户用量与管理端统计
    try {
      if (userId) {
        await CacheManager.clearUserCache(userId)
      } else if (userEmail) {
        const { data: userByEmail } = await supabase
          .from('users')
          .select('id')
          .eq('email', userEmail.toLowerCase())
          .single()
        if (userByEmail?.id) {
          await CacheManager.clearUserCache(userByEmail.id)
        }
      }
    } catch {}
    try { await invalidateByExactPath('/api/user-usage','user') } catch {}
    try { await invalidateByExactPath('/api/admin/registration-codes-stats','user') } catch {}

    return NextResponse.json({ 
      success: true, 
      message: '注册码使用成功',
      data: {
        code: registrationCodeData.code,
        description: registrationCodeData.description
      }
    })
  } catch (error) {
    console.error('使用注册码失败:', error)
    return NextResponse.json({ success: false, error: '使用注册码失败，请重试' }, { status: 500 })
  }
} 
