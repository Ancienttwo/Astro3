/**
 * 双JWT生成器服务
 * 
 * 核心功能：
 * 1. 生成自定义JWT (用于API认证和业务逻辑)
 * 2. 生成Supabase兼容JWT (用于RLS和数据库访问)
 * 3. 确保两个token的一致性和有效性
 */

import jwt from 'jsonwebtoken'
import { 
  UnifiedWeb3User, 
  DualJWTTokens, 
  CustomJWTPayload, 
  SupabaseJWTPayload,
  WalletIntegrationError 
} from '../types/wallet-integration'

export class DualJWTGenerator {
  private jwtSecret: string | null = null
  private supabaseJwtSecret: string | null = null
  private defaultExpiryHours: number = 24
  private initialized: boolean = false

  private ensureInitialized() {
    if (!this.initialized) {
      this.jwtSecret = process.env.JWT_SECRET!
      this.supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET!
      this.validateEnvironment()
      this.initialized = true
      console.log('✅ DualJWTGenerator懒加载初始化完成')
    }
  }

  /**
   * 生成双重JWT tokens
   * 
   * @param web3User Web3用户信息
   * @param expiryHours token过期时间（小时）
   * @returns 双重JWT tokens
   */
  async generateTokens(
    web3User: UnifiedWeb3User, 
    expiryHours: number = this.defaultExpiryHours
  ): Promise<DualJWTTokens> {
    this.ensureInitialized()
    
    console.log('🔑 开始生成双重JWT tokens:', {
      userId: web3User.id,
      walletAddress: web3User.wallet_address,
      email: web3User.email,
      expiryHours
    })

    try {
      const now = Math.floor(Date.now() / 1000)
      const expiresAt = now + (expiryHours * 60 * 60)

      // 生成自定义JWT
      const customJWT = await this.generateCustomJWT(web3User, now, expiresAt)
      console.log('✅ 自定义JWT生成成功')

      // 生成Supabase兼容JWT
      const supabaseJWT = await this.generateSupabaseJWT(web3User, now, expiresAt)
      console.log('✅ Supabase兼容JWT生成成功')

      const tokens: DualJWTTokens = {
        customJWT,
        supabaseJWT,
        expiresAt,
        issuedAt: now
      }

      console.log('🔑 双重JWT tokens生成完成:', {
        customJWTPreview: customJWT.substring(0, 50) + '...',
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
   * 生成自定义JWT (用于API认证和业务逻辑)
   */
  private async generateCustomJWT(
    web3User: UnifiedWeb3User,
    issuedAt: number,
    expiresAt: number
  ): Promise<string> {
    const payload: CustomJWTPayload = {
      userId: web3User.id,
      walletAddress: web3User.wallet_address,
      authType: 'walletconnect',
      email: web3User.email,
      iss: 'astrozi',
      aud: 'astrozi-users',
      iat: issuedAt,
      exp: expiresAt
    }

    console.log('🔐 生成自定义JWT payload:', {
      userId: payload.userId,
      walletAddress: payload.walletAddress,
      authType: payload.authType,
      email: payload.email
    })

    try {
      const token = jwt.sign(payload, this.jwtSecret!, { 
        algorithm: 'HS256',
        noTimestamp: true // 使用我们自己的iat
      })

      // 验证生成的token
      const decoded = jwt.verify(token, this.jwtSecret!) as CustomJWTPayload
      if (decoded.userId !== web3User.id) {
        throw new Error('JWT verification failed: userId mismatch')
      }

      return token

    } catch (error) {
      console.error('❌ 生成自定义JWT失败:', error)
      throw new WalletIntegrationError(
        'Failed to generate custom JWT',
        'JWT_GENERATION_FAILED',
        { error: error instanceof Error ? error.message : error }
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
   * 验证自定义JWT
   */
  async verifyCustomJWT(token: string): Promise<CustomJWTPayload | null> {
    this.ensureInitialized()
    try {
      const decoded = jwt.verify(token, this.jwtSecret!) as CustomJWTPayload
      
      // 检查是否过期
      const currentTime = Math.floor(Date.now() / 1000)
      if (decoded.exp && currentTime > decoded.exp) {
        console.log('⚠️ 自定义JWT已过期')
        return null
      }

      console.log('✅ 自定义JWT验证成功:', decoded.userId)
      return decoded

    } catch (error) {
      console.warn('⚠️ 自定义JWT验证失败:', error instanceof Error ? error.message : error)
      return null
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
   * 刷新JWT tokens
   */
  async refreshTokens(oldCustomJWT: string): Promise<DualJWTTokens | null> {
    console.log('🔄 开始刷新JWT tokens')

    try {
      // 验证旧token
      const payload = await this.verifyCustomJWT(oldCustomJWT)
      if (!payload) {
        console.log('⚠️ 旧token无效，无法刷新')
        return null
      }

      // 从数据库重新获取用户信息
      const { createClient } = await import('@supabase/supabase-js')
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

      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', payload.userId)
        .eq('auth_type', 'web3')
        .single()

      if (error || !user) {
        console.error('❌ 获取用户信息失败，无法刷新tokens:', error)
        return null
      }

      // 生成新的tokens
      const web3User: UnifiedWeb3User = {
        id: user.id,
        email: user.email,
        username: user.username,
        wallet_address: user.wallet_address,
        auth_type: 'web3',
        auth_provider: 'walletconnect',
        display_name: user.username || `Web3User${user.wallet_address?.slice(-6) || ''}`,
        created_at: user.created_at,
        updated_at: user.updated_at
      }

      const newTokens = await this.generateTokens(web3User)
      console.log('✅ JWT tokens刷新成功')
      
      return newTokens

    } catch (error) {
      console.error('❌ 刷新JWT tokens失败:', error)
      return null
    }
  }

  /**
   * 验证环境配置
   */
  private validateEnvironment(): void {
    const requiredEnvVars = [
      'JWT_SECRET',
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
  
  async verifyCustomJWT(token: string): Promise<CustomJWTPayload | null> {
    return this.instance.verifyCustomJWT(token)
  },
  
  async verifySupabaseJWT(token: string): Promise<SupabaseJWTPayload | null> {
    return this.instance.verifySupabaseJWT(token)
  },
  
  async refreshTokens(oldCustomJWT: string): Promise<DualJWTTokens | null> {
    return this.instance.refreshTokens(oldCustomJWT)
  },
  
  getTokenRemainingTime(token: string): number {
    return this.instance.getTokenRemainingTime(token)
  }
}