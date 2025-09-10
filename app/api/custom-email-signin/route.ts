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
    const { email, password } = await request.json()
    
    // 应用邮件登录速率限制
    const rateLimitCheck = await withEmailRateLimit('signin')(request, email.toLowerCase())
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!
    }

    // 1. 查找用户
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('auth_type', 'custom_email')
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
    }

    // 2. 验证密码（简化版本，实际生产环境应该验证哈希）
    if (user.password_hash !== password) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
    }

    // 3. 生成自定义JWT令牌
    const sessionToken = Buffer.from(JSON.stringify({
      userId: user.id,
      email: user.email,
      exp: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7天过期
      type: 'custom_email_auth'
    })).toString('base64')

    // 4. 更新最后登录时间
    await supabaseAdmin
      .from('users')
      .update({ 
        updated_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString()
      })
      .eq('id', user.id)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        auth_type: user.auth_type,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      session: {
        access_token: sessionToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          auth_type: user.auth_type
        },
        expires_at: Math.floor((Date.now() + (7 * 24 * 60 * 60 * 1000)) / 1000)
      }
    })

  } catch (error) {
    console.error('自定义邮箱登录失败:', error)
    return NextResponse.json(
      { error: '登录失败: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    )
  }
}