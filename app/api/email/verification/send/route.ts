import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { smtpEmailService } from '@/lib/smtp-config'

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

/**
 * 发送邮箱验证邮件
 * POST /api/email/verification/send
 */
export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json()

    if (!email || !userId) {
      return NextResponse.json({ error: '缺少必需参数' }, { status: 400 })
    }

    // 生成验证码
    const verificationCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期

    // 保存验证码到数据库
    const { error: insertError } = await supabaseAdmin
      .from('email_verifications')
      .insert({
        user_id: userId,
        email: email.toLowerCase(),
        code: verificationCode,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('保存验证码失败:', insertError)
      return NextResponse.json({ error: '验证码保存失败' }, { status: 500 })
    }

    // 构建验证链接
    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email?code=${verificationCode}&email=${encodeURIComponent(email)}`

    // 发送验证邮件
    const emailResult = await smtpEmailService.sendEmail({
      to: email,
      subject: '验证您的邮箱地址 - AstroZi',
      template: 'email_verification',
      templateData: {
        username: email.split('@')[0],
        verificationUrl,
        verificationCode
      }
    })

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: '验证邮件发送成功',
        messageId: emailResult.messageId
      })
    } else {
      return NextResponse.json(
        { error: '验证邮件发送失败: ' + emailResult.error },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('发送验证邮件失败:', error)
    return NextResponse.json(
      { error: '发送失败: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    )
  }
}