/**
 * WalletConnect与Supabase完美集成层
 * 
 * 核心功能：
 * 1. Supabase JWT 统一会话管理
 * 2. RLS兼容的Web3用户认证
 * 3. 无缝的Web2/Web3用户体验
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import { verifyMessage } from 'viem'

export interface Web3AuthResult {
  user: UnifiedWeb3User
  supabaseJWT: string
  expiresAt: number
}

export interface UnifiedWeb3User {
  id: string
  email: string
  username: string
  wallet_address: string
  auth_type: 'web3'
  auth_provider: 'walletconnect'
  display_name: string
  created_at: string
  updated_at: string
}

export interface DualJWTTokens {
  supabaseJWT: string    // 用于Supabase RLS和数据库访问
  expiresAt: number
}

export class WalletSupabaseIntegration {
  private supabase: SupabaseClient
  private supabaseAdmin: SupabaseClient

  constructor() {
    // 标准Supabase客户端
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 管理员客户端（服务端使用）
    this.supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  }

  /**
   * 核心方法：WalletConnect认证并创建Supabase兼容session
   */
  async authenticateWallet(
    walletAddress: string, 
    signature: string, 
    message: string
  ): Promise<Web3AuthResult> {
    console.log('🔗 开始WalletConnect-Supabase集成认证...')

    // 1. 验证钱包签名
    const isValidSignature = await this.verifyWalletSignature(signature, message, walletAddress)
    if (!isValidSignature) {
      throw new Error('Invalid wallet signature')
    }

    console.log('✅ 钱包签名验证成功:', walletAddress)

    // 2. 创建或获取Web3用户
    const web3User = await this.getOrCreateWeb3User(walletAddress)
    console.log('✅ Web3用户已准备:', web3User.email)

    // 3. 生成Supabase JWT
    const tokens = await this.generateSupabaseJWT(web3User)
    console.log('✅ Supabase JWT已生成')

    // 4. 🔑 关键步骤：设置Supabase session
    await this.setSupabaseSession(tokens.supabaseJWT)
    console.log('✅ Supabase session已设置，Web3用户现在可以使用RLS')

    // 5. 存储自定义认证数据到localStorage
    await this.storeWeb3AuthData(web3User, tokens)
    console.log('✅ Web3认证数据已存储')

    return {
      user: web3User,
      supabaseJWT: tokens.supabaseJWT,
      expiresAt: tokens.expiresAt
    }
  }

  /**
   * 验证钱包签名
   */
  private async verifyWalletSignature(
    signature: string,
    message: string,
    expectedAddress: string
  ): Promise<boolean> {
    try {
      const ok = await verifyMessage({
        address: expectedAddress as `0x${string}`,
        message,
        signature: (signature.startsWith('0x') ? signature : `0x${signature}`) as `0x${string}`,
      })
      return ok
    } catch (error) {
      console.error('钱包签名验证失败:', error)
      return false
    }
  }

  /**
   * 创建或获取Web3用户
   */
  private async getOrCreateWeb3User(walletAddress: string): Promise<UnifiedWeb3User> {
    const normalizedAddress = walletAddress.toLowerCase()
    const email = `${normalizedAddress}@web3.astrozi.app`

    // 首先尝试查找现有用户
    const { data: existingUsers, error: findError } = await this.supabaseAdmin
      .from('users')
      .select('*')
      .eq('wallet_address', normalizedAddress)
      .eq('auth_type', 'web3')

    if (!findError && existingUsers && existingUsers.length > 0) {
      const existingUser = existingUsers[0]
      console.log('✅ 找到现有Web3用户:', existingUser.email)
      
      return {
        id: existingUser.id,
        email: existingUser.email,
        username: existingUser.username,
        wallet_address: existingUser.wallet_address,
        auth_type: 'web3',
        auth_provider: 'walletconnect',
        display_name: existingUser.username,
        created_at: existingUser.created_at,
        updated_at: existingUser.updated_at
      }
    }

    // 创建新的Web3用户
    console.log('👤 创建新Web3用户:', normalizedAddress)
    
    const newUserData = {
      wallet_address: normalizedAddress,
      email: email,
      username: `Web3User${normalizedAddress.slice(-6)}`,
      auth_type: 'web3',
      auth_provider: 'walletconnect',
      user_type: 'web3'
    }

    const { data: newUser, error: createError } = await this.supabaseAdmin
      .from('users')
      .insert(newUserData)
      .select()
      .single()

    if (createError || !newUser) {
      console.error('❌ 创建Web3用户失败:', createError)
      throw new Error('Failed to create Web3 user')
    }

    console.log('✅ 新Web3用户创建成功:', newUser.email)

    return {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      wallet_address: newUser.wallet_address,
      auth_type: 'web3',
      auth_provider: 'walletconnect',
      display_name: newUser.username,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at
    }
  }

  /**
   * 生成双重JWT tokens
   */
  private async generateSupabaseJWT(web3User: UnifiedWeb3User): Promise<DualJWTTokens> {
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = now + (24 * 60 * 60) // 24小时

    // Supabase兼容JWT (用于RLS和数据库访问)
    const supabaseJWT = jwt.sign({
      sub: web3User.id,                    // Supabase期望的用户ID
      aud: 'authenticated',                // Supabase role
      role: 'authenticated',               // Supabase role
      iss: process.env.NEXT_PUBLIC_SUPABASE_URL, // Supabase issuer
      iat: now,
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
    }, process.env.SUPABASE_JWT_SECRET!, { algorithm: 'HS256' })

    return {
      supabaseJWT,
      expiresAt
    }
  }

  /**
   * 设置Supabase session
   */
  private async setSupabaseSession(supabaseJWT: string): Promise<void> {
    const { data, error } = await this.supabase.auth.setSession({
      access_token: supabaseJWT,
      refresh_token: supabaseJWT // 使用相同的token作为refresh token
    })

    if (error) {
      console.error('❌ 设置Supabase session失败:', error)
      throw new Error('Failed to set Supabase session')
    }

    console.log('✅ Supabase session设置成功，Web3用户现在可以访问受RLS保护的数据')
  }

  /**
   * 存储Web3认证数据到localStorage
   */
  private async storeWeb3AuthData(
    web3User: UnifiedWeb3User, 
    tokens: DualJWTTokens
  ): Promise<void> {
    if (typeof window !== 'undefined') {
      // 存储用户信息
      localStorage.setItem('current_user', JSON.stringify({
        ...web3User,
        auth_method: 'walletconnect'
      }))

      // 存储WalletConnect认证信息
      localStorage.setItem('walletconnect_auth', JSON.stringify({
        auth_token: tokens.supabaseJWT,
        refresh_token: tokens.supabaseJWT,
        supabase_access_token: tokens.supabaseJWT,
        wallet_address: web3User.wallet_address,
        auth_method: 'walletconnect',
        expires_at: tokens.expiresAt
      }))

      try {
        localStorage.setItem('supabase_jwt', tokens.supabaseJWT)
      } catch (error) {
        console.warn('无法写入supabase_jwt到localStorage:', (error as Error)?.message || error)
      }

      // 存储钱包会话信息
      localStorage.setItem('wallet_session', JSON.stringify({
        address: web3User.wallet_address,
        timestamp: Date.now(),
        auth_method: 'walletconnect'
      }))

      console.log('✅ Web3认证数据已存储到localStorage')
    }
  }

  /**
   * 检查并恢复Web3用户的Supabase session
   */
  async restoreWeb3Session(): Promise<UnifiedWeb3User | null> {
    if (typeof window === 'undefined') return null

    try {
      const currentUser = localStorage.getItem('current_user')
      const walletconnectAuth = localStorage.getItem('walletconnect_auth')

      if (!currentUser || !walletconnectAuth) {
        return null
      }

      const userData = JSON.parse(currentUser)
      const authData = JSON.parse(walletconnectAuth)

      // 检查是否是Web3用户
      if (userData.auth_method !== 'walletconnect' || !userData.wallet_address) {
        return null
      }

      // 检查token是否过期
      const currentTime = Math.floor(Date.now() / 1000)
      if (authData.expires_at && currentTime > authData.expires_at) {
        console.log('⚠️ Web3 token已过期，清理认证数据')
        this.clearWeb3AuthData()
        return null
      }

      // 重新生成Supabase JWT并设置session
      const tokens = await this.generateSupabaseJWT(userData)
      await this.setSupabaseSession(tokens.supabaseJWT)
      try {
        localStorage.setItem('supabase_jwt', tokens.supabaseJWT)
      } catch (error) {
        console.warn('恢复session时写入supabase_jwt失败:', (error as Error)?.message || error)
      }

      console.log('✅ Web3用户session已恢复:', userData.wallet_address)
      return userData

    } catch (error) {
      console.error('❌ 恢复Web3 session失败:', error)
      this.clearWeb3AuthData()
      return null
    }
  }

  /**
   * 清理Web3认证数据
   */
  clearWeb3AuthData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('current_user')
      localStorage.removeItem('walletconnect_auth')
      localStorage.removeItem('wallet_session')
      localStorage.removeItem('web3_auth')
      localStorage.removeItem('web3_user')
      localStorage.removeItem('supabase_jwt')
      
      console.log('✅ Web3认证数据已清理')
    }
  }

  /**
   * 登出Web3用户
   */
  async logoutWeb3User(): Promise<void> {
    // 清理Supabase session
    await this.supabase.auth.signOut()
    
    // 清理localStorage
    this.clearWeb3AuthData()
    
    console.log('✅ Web3用户已登出')
  }
}

// 导出单例实例
export const walletSupabaseIntegration = new WalletSupabaseIntegration()
