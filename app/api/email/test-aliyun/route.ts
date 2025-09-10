import { NextRequest, NextResponse } from 'next/server'
import { aliyunEmailService } from '@/lib/aliyun-email-config'

/**
 * 测试阿里云邮件服务配置和发送
 * GET /api/email/test-aliyun?to=your-email@example.com
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const testEmail = searchParams.get('to')

    // 检查配置状态
    const status = aliyunEmailService.getStatus()
    
    if (!status.configured) {
      return NextResponse.json({
        success: false,
        error: '阿里云邮件服务未配置',
        message: '请检查环境变量配置',
        requiredEnvVars: [
          'ALIYUN_EMAIL_REGION',
          'ALIYUN_ACCESS_KEY_ID', 
          'ALIYUN_ACCESS_KEY_SECRET',
          'ALIYUN_EMAIL_FROM_ADDRESS',
          'ALIYUN_EMAIL_DOMAIN'
        ]
      }, { status: 400 })
    }

    // 测试连接
    const configTest = await aliyunEmailService.testConfiguration()
    
    if (!configTest.success) {
      return NextResponse.json({
        success: false,
        error: '阿里云邮件服务配置测试失败',
        details: configTest.error,
        configDetails: configTest.details
      }, { status: 500 })
    }

    // 如果提供了测试邮箱，发送测试邮件
    if (testEmail) {
      console.log(`🧪 发送测试邮件到: ${testEmail}`)
      
      const sendResult = await aliyunEmailService.sendTestEmail(testEmail)
      
      return NextResponse.json({
        success: sendResult.success,
        message: sendResult.success ? '测试邮件发送成功！' : '测试邮件发送失败',
        messageId: sendResult.messageId,
        error: sendResult.error,
        testEmail,
        configStatus: status,
        timestamp: new Date().toISOString()
      })
    }

    // 只返回配置状态
    return NextResponse.json({
      success: true,
      message: '阿里云邮件服务配置正常',
      configStatus: status,
      configTest: configTest.details,
      usage: {
        testUrl: `/api/email/test-aliyun?to=your-email@example.com`,
        description: '添加 ?to=邮箱地址 参数来发送测试邮件'
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('阿里云邮件测试失败:', error)
    return NextResponse.json({
      success: false,
      error: '测试过程中发生错误',
      details: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * 手动配置阿里云邮件服务（用于调试）
 * POST /api/email/test-aliyun
 */
export async function POST(request: NextRequest) {
  try {
    const config = await request.json()
    
    // 验证必需参数
    const required = ['region', 'accessKeyId', 'accessKeySecret', 'fromAddress', 'domain']
    const missing = required.filter(key => !config[key])
    
    if (missing.length > 0) {
      return NextResponse.json({
        success: false,
        error: '缺少必需参数',
        missing
      }, { status: 400 })
    }

    // 手动配置
    aliyunEmailService.configure(config)
    
    // 测试配置
    const testResult = await aliyunEmailService.testConfiguration()
    
    return NextResponse.json({
      success: testResult.success,
      message: testResult.success ? '配置更新并测试成功' : '配置测试失败',
      error: testResult.error,
      details: testResult.details,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('阿里云邮件配置更新失败:', error)
    return NextResponse.json({
      success: false,
      error: '配置更新失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}