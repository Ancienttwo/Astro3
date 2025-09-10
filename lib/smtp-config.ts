import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

export interface SMTPConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  from: string
  replyTo?: string
}

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  template?: string
  templateData?: Record<string, any>
  attachments?: any[]
}

export class SMTPEmailService {
  private transporter: nodemailer.Transporter | null = null
  private config: SMTPConfig | null = null
  private templates: Map<string, EmailTemplate> = new Map()

  constructor() {
    this.initializeConfig()
    this.loadTemplates()
  }

  private initializeConfig() {
    // Load SMTP configuration from environment variables
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = process.env.SMTP_PORT
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const smtpFrom = process.env.SMTP_FROM

    if (smtpHost && smtpPort && smtpUser && smtpPass && smtpFrom) {
      this.config = {
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: smtpPort === '465', // Use SSL for port 465
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        from: smtpFrom,
        replyTo: process.env.SMTP_REPLY_TO
      }

      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: this.config.auth,
        pool: true, // Use connection pooling
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 1000, // 1 second between messages
        rateLimit: 10 // Max 10 messages per rateDelta
      })

      // Verify SMTP connection
      this.verifyConnection()
    }
  }

  private async verifyConnection() {
    if (!this.transporter) return

    try {
      await this.transporter.verify()
      console.log('✅ SMTP server connection verified')
    } catch (error) {
      console.error('❌ SMTP server connection failed:', error)
      this.transporter = null
    }
  }

  private loadTemplates() {
    // Email verification template
    this.templates.set('email_verification', {
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email Address</h2>
          <p>Hello {{username}},</p>
          <p>Thank you for signing up! Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{verificationUrl}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p><a href="{{verificationUrl}}">{{verificationUrl}}</a></p>
          <p>This verification link will expire in 24 hours.</p>
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            If you didn't create an account, please ignore this email.
          </p>
        </div>
      `,
      text: `
        Verify Your Email Address
        
        Hello {{username}},
        
        Thank you for signing up! Please visit the following link to verify your email address:
        
        {{verificationUrl}}
        
        This verification link will expire in 24 hours.
        
        If you didn't create an account, please ignore this email.
      `
    })

    // Password reset template
    this.templates.set('password_reset', {
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>Hello {{username}},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{resetUrl}}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p><a href="{{resetUrl}}">{{resetUrl}}</a></p>
          <p>This reset link will expire in 1 hour.</p>
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            If you didn't request a password reset, please ignore this email and your password will remain unchanged.
          </p>
        </div>
      `,
      text: `
        Reset Your Password
        
        Hello {{username}},
        
        We received a request to reset your password. Visit the following link to create a new password:
        
        {{resetUrl}}
        
        This reset link will expire in 1 hour.
        
        If you didn't request a password reset, please ignore this email and your password will remain unchanged.
      `
    })

    // Welcome email template
    this.templates.set('welcome', {
      subject: 'Welcome to AstroZi!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to AstroZi!</h2>
          <p>Hello {{username}},</p>
          <p>Welcome to AstroZi - your AI-powered life engineering platform!</p>
          <p>Here's what you can do next:</p>
          <ul>
            <li>Complete your profile setup</li>
            <li>Create your first astrology chart</li>
            <li>Explore AI-powered insights</li>
            <li>Connect with our community</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{appUrl}}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Get Started
            </a>
          </div>
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Best regards,<br>The AstroZi Team</p>
        </div>
      `,
      text: `
        Welcome to AstroZi!
        
        Hello {{username}},
        
        Welcome to AstroZi - your AI-powered life engineering platform!
        
        Here's what you can do next:
        - Complete your profile setup
        - Create your first astrology chart
        - Explore AI-powered insights
        - Connect with our community
        
        Get started: {{appUrl}}
        
        If you have any questions, feel free to contact our support team.
        
        Best regards,
        The AstroZi Team
      `
    })
  }

  /**
   * Send email using SMTP or fallback to Supabase
   */
  async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Try SMTP first if configured
      if (this.transporter && this.config) {
        return await this.sendViaSMTP(options)
      }

      // Fallback to Supabase Auth (with rate limits)
      return await this.sendViaSupabase(options)

    } catch (error) {
      console.error('Email sending failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private async sendViaSMTP(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.transporter || !this.config) {
      throw new Error('SMTP not configured')
    }

    let { html, text } = options

    // Use template if specified
    if (options.template) {
      const template = this.templates.get(options.template)
      if (template) {
        html = this.renderTemplate(template.html, options.templateData || {})
        text = this.renderTemplate(template.text, options.templateData || {})
        options.subject = options.subject || this.renderTemplate(template.subject, options.templateData || {})
      }
    }

    const mailOptions = {
      from: this.config.from,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      replyTo: this.config.replyTo,
      subject: options.subject,
      html,
      text,
      attachments: options.attachments
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      console.log('✅ Email sent via SMTP:', info.messageId)
      
      return {
        success: true,
        messageId: info.messageId
      }
    } catch (error) {
      console.error('❌ SMTP send failed:', error)
      throw error
    }
  }

  private async sendViaSupabase(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log('📧 Falling back to Supabase Auth email service')
    
    // Note: Supabase Auth has built-in rate limits
    // This is a placeholder - you would implement actual Supabase email sending here
    // For signup/signin emails, they're handled automatically by Supabase Auth
    
    return {
      success: false,
      error: 'Supabase email fallback not implemented for custom emails'
    }
  }

  private renderTemplate(template: string, data: Record<string, any>): string {
    let rendered = template
    
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`
      rendered = rendered.replace(new RegExp(placeholder, 'g'), String(value))
    }
    
    return rendered
  }

  /**
   * Test SMTP configuration
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.transporter) {
      return { success: false, error: 'SMTP not configured' }
    }

    try {
      await this.transporter.verify()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      }
    }
  }

  /**
   * Get SMTP configuration status
   */
  getStatus(): { configured: boolean; verified: boolean } {
    return {
      configured: !!this.config,
      verified: !!this.transporter
    }
  }

  /**
   * Update SMTP configuration
   */
  updateConfig(config: SMTPConfig): void {
    this.config = config
    
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 10
    })

    this.verifyConnection()
  }
}

// Export singleton instance
export const smtpEmailService = new SMTPEmailService()