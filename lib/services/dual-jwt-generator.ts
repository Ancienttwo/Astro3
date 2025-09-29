/**
 * Supabase JWT 生成器服务
 * 
 * 核心功能：
 * 1. 生成Supabase兼容JWT (用于RLS和数据库访问)
 * 2. 确保token有效性并提供工具函数
 */

import jwt from 'jsonwebtoken'
import { 
  UnifiedWeb3User, 
  DualJWTTokens, 
  SupabaseJWTPayload,
  WalletIntegrationError 
} from '../types/wallet-integration'

export class DualJWTGenerator {
  private supabaseJwtSecret: string | null = null
  private defaultExpiryHours: number = 24
  private initialized: boolean = false

  private ensureInitialized() {
    if (!this.initialized) {
      this.supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET!
      this.validateEnvironment()
      this.initialized = true
      console.log('✅ DualJWTGenerator懒加载初始化完成')
    }
  }

  /**
   * 生成 Supabase JWT
   * 
   * @param web3User Web3用户信息
   * @param expiryHours token过期时间（小时）
   * @returns 含 Supabase JWT 的结构
   */
  async generateTokens(
    web3User: UnifiedWeb3User, 
    expiryHours: number = this.defaultExpiryHours
  ): Promise<DualJWTTokens> {
    this.ensureInitialized()
    
    console.log('🔑 开始生成Supabase JWT:', {
      userId: web3User.id,
      walletAddress: web3User.wallet_address,
      email: web3User.email,
      expiryHours
    })

    try {
      const now = Math.floor(Date.now() / 1000)
      const expiresAt = now + (expiryHours * 60 * 60)

      // 生成Supabase兼容JWT
      const supabaseJWT = await this.generateSupabaseJWT(web3User, now, expiresAt)
      console.log('✅ Supabase兼容JWT生成成功')

      const tokens: DualJWTTokens = {
        supabaseJWT,
        expiresAt,
        issuedAt: now
      }

      console.log('🔑 Supabase JWT生成完成:', {
        supabaseJWTPreview: supabaseJWT.substring(0, 50) + '...',
        expiresAt: new Date(expiresAt * 1000).toISOString()
      })

      return tokens

    } catch (error) {
      console.error('❌ 生成JWT tokens失败:', error)
      
      if (error instanceof WalletIntegrationError) {
        throw error
      }

      throw new WalletIntegrationError(
        'Failed to generate JWT tokens',
        'JWT_GENERATION_FAILED',
        { originalError: error, userId: web3User.id }
      )
    }
  }

  /**
   * 生成Supabase兼容JWT (用于RLS和数据库访问)
   */
  private async generateSupabaseJWT(
    web3User: UnifiedWeb3User,
    issuedAt: number,
    expiresAt: number
  ): Promise<string> {
    const payload: SupabaseJWTPayload = {
      sub: web3User.id,                          // Supabase期望的用户ID
      aud: 'authenticated',                      // Supabase audience
      role: 'authenticated',                     // Supabase role
      iss: process.env.NEXT_PUBLIC_SUPABASE_URL!, // Supabase issuer
      iat: issuedAt,
      exp: expiresAt,
      app_metadata: {
        provider: 'walletconnect',
        wallet_address: web3User.wallet_address,
        auth_type: 'web3'
      },
      user_metadata: {
        wallet_address: web3User.wallet_address,
        auth_type: 'web3',
        display_name: web3User.display_name,
        email: web3User.email
      }
    }

    console.log('🔐 生成Supabase JWT payload:', {
      sub: payload.sub,
      aud: payload.aud,
      role: payload.role,
      provider: payload.app_metadata.provider,
      walletAddress: payload.app_metadata.wallet_address
    })

    try {
      const token = jwt.sign(payload, this.supabaseJwtSecret!, { 
        algorithm: 'HS256',
        noTimestamp: true // 使用我们自己的iat
      })

      // 验证生成的token
      const decoded = jwt.verify(token, this.supabaseJwtSecret!) as SupabaseJWTPayload
      if (decoded.sub !== web3User.id) {
        throw new Error('Supabase JWT verification failed: sub mismatch')
      }

      return token

    } catch (error) {
      console.error('❌ 生成Supabase JWT失败:', error)
      throw new WalletIntegrationError(
        'Failed to generate Supabase JWT',
        'JWT_GENERATION_FAILED',
        { error: error instanceof Error ? error.message : error }
      )
    }
  }

  /**
   * 验证Supabase JWT
   */
  async verifySupabaseJWT(token: string): Promise<SupabaseJWTPayload | null> {
    this.ensureInitialized()
    try {
      const decoded = jwt.verify(token, this.supabaseJwtSecret!) as SupabaseJWTPayload
      
      // 检查是否过期
      const currentTime = Math.floor(Date.now() / 1000)
      if (decoded.exp && currentTime > decoded.exp) {
        console.log('⚠️ Supabase JWT已过期')
        return null
      }

      console.log('✅ Supabase JWT验证成功:', decoded.sub)
      return decoded

    } catch (error) {
      console.warn('⚠️ Supabase JWT验证失败:', error instanceof Error ? error.message : error)
      return null
    }
  }

  /**
   * 验证环境配置
   */
  private validateEnvironment(): void {
    const requiredEnvVars = [
      'SUPABASE_JWT_SECRET',
      'NEXT_PUBLIC_SUPABASE_URL'
    ]

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new WalletIntegrationError(
          `Missing required environment variable: ${envVar}`,
          'JWT_GENERATION_FAILED'
        )
      }
    }

    console.log('✅ 环境变量验证通过')
  }

  /**
   * 获取token剩余有效时间（秒）
   */
  getTokenRemainingTime(token: string): number {
    try {
      const decoded = jwt.decode(token) as any
      if (!decoded || !decoded.exp) {
        return 0
      }

      const currentTime = Math.floor(Date.now() / 1000)
      const remainingTime = decoded.exp - currentTime
      
      return Math.max(0, remainingTime)

    } catch (error) {
      console.warn('⚠️ 无法解析token过期时间:', error)
      return 0
    }
  }
}

// 导出懒加载单例实例
let _dualJWTGeneratorInstance: DualJWTGenerator | null = null

export const dualJWTGenerator = {
  get instance(): DualJWTGenerator {
    if (!_dualJWTGeneratorInstance) {
      _dualJWTGeneratorInstance = new DualJWTGenerator()
    }
    return _dualJWTGeneratorInstance
  },
  
  // 代理所有方法
  async generateTokens(web3User: UnifiedWeb3User, expiryHours?: number): Promise<DualJWTTokens> {
    return this.instance.generateTokens(web3User, expiryHours)
  },

  async verifySupabaseJWT(token: string): Promise<SupabaseJWTPayload | null> {
    return this.instance.verifySupabaseJWT(token)
  },

  getTokenRemainingTime(token: string): number {
    return this.instance.getTokenRemainingTime(token)
  }
}
