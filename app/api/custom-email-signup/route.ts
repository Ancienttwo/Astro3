import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { withEmailRateLimit } from '@/lib/email-rate-limiter'

// 使用Service Role Key创建管理员客户端
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { email, password, registrationCode } = await request.json()
    
    // 应用邮件注册速率限制
    const rateLimitCheck = await withEmailRateLimit('signup')(request, email.toLowerCase())
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!
    }

    // 1. 验证注册码
    const codeResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/verify-registration-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: registrationCode })
    })
    
    const codeResult = await codeResponse.json()
    if (!codeResult.valid) {
      return NextResponse.json({ error: '注册码无效' }, { status: 400 })
    }

    // 2. 检查邮箱是否已存在
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('email', email.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json({ error: '该邮箱已注册' }, { status: 400 })
    }

    // 3. 生成用户ID（UUID格式）
    const userId = crypto.randomUUID()

    // 4. 直接在自定义users表中创建用户记录（不使用Supabase Auth）
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email: email.toLowerCase(),
        username: email.split('@')[0],
        auth_type: 'custom_email', // 标记为自定义邮箱认证
        password_hash: password, // 简单存储，实际生产环境应该加密
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (userError) {
      console.error('创建用户记录失败:', userError)
      return NextResponse.json({ error: '用户数据创建失败: ' + userError.message }, { status: 500 })
    }

    // 5. 使用注册码
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/use-registration-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: registrationCode,
        email: email.toLowerCase(),
        userId: userId
      })
    })

    // 6. 生成自定义JWT令牌（简化版本，用于维持登录状态）
    const sessionToken = Buffer.from(JSON.stringify({
      userId: userId,
      email: email.toLowerCase(),
      exp: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7天过期
      type: 'custom_email_auth'
    })).toString('base64')

    return NextResponse.json({
      user: userData,
      session: {
        access_token: sessionToken,
        user: userData,
        expires_at: Math.floor((Date.now() + (7 * 24 * 60 * 60 * 1000)) / 1000)
      }
    })

  } catch (error) {
    console.error('自定义邮箱注册失败:', error)
    return NextResponse.json(
      { error: '注册失败: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    )
  }
}