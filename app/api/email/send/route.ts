import { NextRequest, NextResponse } from 'next/server'
import { smtpEmailService } from '@/lib/smtp-config'
import { aliyunEmailService } from '@/lib/aliyun-email-config'

/**
 * 发送邮件API - 支持阿里云邮件服务
 * POST /api/email/send
 */
export async function POST(request: NextRequest) {
  try {
    const { to, subject, template, templateData, html, text } = await request.json()

    if (!to || !subject) {
      return NextResponse.json({ error: '缺少必需参数: to, subject' }, { status: 400 })
    }

    // 发送邮件
    const result = await smtpEmailService.sendEmail({
      to,
      subject,
      template,
      templateData,
      html,
      text
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: '邮件发送成功'
      })
    } else {
      return NextResponse.json(
        { error: result.error || '邮件发送失败' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('邮件发送API错误:', error)
    return NextResponse.json(
      { error: '邮件发送失败: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    )
  }
}

/**
 * 测试邮件配置
 * GET /api/email/send?test=true&to=email@example.com
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isTest = searchParams.get('test') === 'true'
    const testEmail = searchParams.get('to')

    if (isTest && testEmail) {
      // 发送测试邮件
      const result = await aliyunEmailService.sendTestEmail(testEmail)
      return NextResponse.json(result)
    }

    // 返回配置状态
    const smtpStatus = smtpEmailService.getStatus()
    const aliyunStatus = aliyunEmailService.getStatus()

    return NextResponse.json({
      smtp: smtpStatus,
      aliyun: aliyunStatus,
      timestamp: Date.now()
    })

  } catch (error) {
    console.error('邮件状态检查失败:', error)
    return NextResponse.json(
      { error: '状态检查失败: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    )
  }
}