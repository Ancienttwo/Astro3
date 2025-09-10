import { SMTPConfig, smtpEmailService } from './smtp-config'

/**
 * 阿里云邮件服务配置
 * Aliyun Email Service Configuration
 */
export interface AliyunEmailConfig {
  // SMTP配置
  region: string // 例如: cn-hangzhou, cn-beijing
  accessKeyId: string
  accessKeySecret: string
  
  // 发信地址配置  
  fromAddress: string // 发信邮箱地址
  fromName?: string // 发信人姓名
  replyToAddress?: string // 回信地址
  
  // 域名配置
  domain: string // 已验证的发信域名
  
  // SMTP服务器信息 (基于region)
  smtpHost?: string
  smtpPort?: number
}

/**
 * 阿里云邮件服务区域配置
 */
export const ALIYUN_EMAIL_REGIONS = {
  'cn-hangzhou': {
    smtpHost: 'smtpdm.aliyun.com',
    smtpPort: 465, // SSL
    smtpPortTLS: 587 // TLS
  },
  'cn-beijing': {
    smtpHost: 'smtpdm.aliyun.com', 
    smtpPort: 465,
    smtpPortTLS: 587
  },
  'cn-qingdao': {
    smtpHost: 'smtpdm.aliyun.com',
    smtpPort: 465,
    smtpPortTLS: 587
  },
  'cn-shenzhen': {
    smtpHost: 'smtpdm.aliyun.com',
    smtpPort: 465,
    smtpPortTLS: 587
  },
  'ap-southeast-1': {
    smtpHost: 'smtpdm.ap-southeast-1.aliyuncs.com',
    smtpPort: 465,
    smtpPortTLS: 587
  },
  'ap-southeast-2': {
    smtpHost: 'smtpdm.ap-southeast-2.aliyuncs.com',
    smtpPort: 465,
    smtpPortTLS: 587
  }
}

export class AliyunEmailService {
  private config: AliyunEmailConfig | null = null

  constructor() {
    this.loadConfigFromEnv()
  }

  /**
   * 从环境变量加载阿里云邮件配置
   */
  private loadConfigFromEnv() {
    const region = process.env.ALIYUN_EMAIL_REGION
    const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID
    const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET
    const fromAddress = process.env.ALIYUN_EMAIL_FROM_ADDRESS
    const fromName = process.env.ALIYUN_EMAIL_FROM_NAME
    const replyToAddress = process.env.ALIYUN_EMAIL_REPLY_TO
    const domain = process.env.ALIYUN_EMAIL_DOMAIN

    if (region && accessKeyId && accessKeySecret && fromAddress && domain) {
      this.config = {
        region,
        accessKeyId,
        accessKeySecret,
        fromAddress,
        fromName,
        replyToAddress,
        domain
      }

      // 配置SMTP服务
      this.configureSMTP()
    }
  }

  /**
   * 配置SMTP服务器
   */
  private configureSMTP() {
    if (!this.config) return

    const regionConfig = ALIYUN_EMAIL_REGIONS[this.config.region as keyof typeof ALIYUN_EMAIL_REGIONS]
    if (!regionConfig) {
      console.error(`❌ 不支持的阿里云邮件区域: ${this.config.region}`)
      return
    }

    // 阿里云邮件使用发信地址和SMTP密码
    const smtpConfig: SMTPConfig = {
      host: this.config.smtpHost || regionConfig.smtpHost,
      port: this.config.smtpPort || regionConfig.smtpPort,
      secure: (this.config.smtpPort || regionConfig.smtpPort) === 465,
      auth: {
        user: this.config.fromAddress,
        pass: process.env.SMTP_PASS || this.config.accessKeySecret
      },
      from: this.config.fromName ? 
        `${this.config.fromName} <${this.config.fromAddress}>` : 
        this.config.fromAddress,
      replyTo: this.config.replyToAddress
    }

    // 更新SMTP服务配置
    smtpEmailService.updateConfig(smtpConfig)
    
    console.log('✅ 阿里云邮件服务已配置')
    console.log(`   区域: ${this.config.region}`)
    console.log(`   SMTP: ${smtpConfig.host}:${smtpConfig.port}`)
    console.log(`   发信地址: ${this.config.fromAddress}`)
  }

  /**
   * 手动配置阿里云邮件服务
   */
  configure(config: AliyunEmailConfig) {
    this.config = config
    this.configureSMTP()
  }

  /**
   * 验证配置和连接
   */
  async testConfiguration(): Promise<{ success: boolean; error?: string; details?: any }> {
    if (!this.config) {
      return { 
        success: false, 
        error: '阿里云邮件服务未配置' 
      }
    }

    // 测试SMTP连接
    const smtpTest = await smtpEmailService.testConnection()
    
    if (!smtpTest.success) {
      return {
        success: false,
        error: `SMTP连接失败: ${smtpTest.error}`,
        details: {
          region: this.config.region,
          host: ALIYUN_EMAIL_REGIONS[this.config.region as keyof typeof ALIYUN_EMAIL_REGIONS]?.smtpHost,
          fromAddress: this.config.fromAddress
        }
      }
    }

    return {
      success: true,
      details: {
        region: this.config.region,
        configured: true,
        smtpVerified: true,
        fromAddress: this.config.fromAddress,
        domain: this.config.domain
      }
    }
  }

  /**
   * 发送测试邮件
   */
  async sendTestEmail(toAddress: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.config) {
      return {
        success: false,
        error: '阿里云邮件服务未配置'
      }
    }

    return await smtpEmailService.sendEmail({
      to: toAddress,
      subject: '阿里云邮件服务测试',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>阿里云邮件服务测试成功！</h2>
          <p>这是一封来自AstroZi应用的测试邮件。</p>
          <p><strong>配置信息：</strong></p>
          <ul>
            <li>区域: ${this.config.region}</li>
            <li>发信域名: ${this.config.domain}</li>
            <li>发信地址: ${this.config.fromAddress}</li>
          </ul>
          <p>如果您收到这封邮件，说明阿里云邮件服务配置正确。</p>
          <hr>
          <p><small>测试时间: ${new Date().toLocaleString('zh-CN')}</small></p>
        </div>
      `,
      text: `
        阿里云邮件服务测试成功！
        
        这是一封来自AstroZi应用的测试邮件。
        
        配置信息：
        - 区域: ${this.config.region}
        - 发信域名: ${this.config.domain}
        - 发信地址: ${this.config.fromAddress}
        
        如果您收到这封邮件，说明阿里云邮件服务配置正确。
        
        测试时间: ${new Date().toLocaleString('zh-CN')}
      `
    })
  }

  /**
   * 获取配置状态
   */
  getStatus() {
    return {
      configured: !!this.config,
      region: this.config?.region,
      fromAddress: this.config?.fromAddress,
      domain: this.config?.domain,
      smtpStatus: smtpEmailService.getStatus()
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): AliyunEmailConfig | null {
    return this.config
  }
}

// 导出单例实例
export const aliyunEmailService = new AliyunEmailService()

/**
 * 环境变量配置示例
 * 
 * 在 .env.local 中添加以下配置：
 * 
 * # 阿里云邮件服务配置
 * ALIYUN_EMAIL_REGION=cn-hangzhou
 * ALIYUN_ACCESS_KEY_ID=your_access_key_id
 * ALIYUN_ACCESS_KEY_SECRET=your_access_key_secret
 * ALIYUN_EMAIL_FROM_ADDRESS=noreply@yourdomain.com
 * ALIYUN_EMAIL_FROM_NAME=AstroZi
 * ALIYUN_EMAIL_REPLY_TO=support@yourdomain.com
 * ALIYUN_EMAIL_DOMAIN=yourdomain.com
 * 
 * # Redis配置 (用于速率限制)
 * REDIS_HOST=localhost
 * REDIS_PORT=6379
 * REDIS_PASSWORD=your_redis_password
 */