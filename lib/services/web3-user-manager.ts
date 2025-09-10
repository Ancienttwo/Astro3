/**
 * Web3用户管理服务
 * 
 * 负责Web3用户的创建、查找、更新等操作
 * 确保与现有数据库结构兼容
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { 
  UnifiedWeb3User, 
  CreateWeb3UserParams, 
  WalletIntegrationError 
} from '../types/wallet-integration'

export class Web3UserManager {
  private supabaseAdmin: SupabaseClient

  constructor() {
    // 初始化管理员客户端
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

    console.log('✅ Web3UserManager初始化完成')
  }

  /**
   * 根据钱包地址查找现有Web3用户
   */
  async findUserByWalletAddress(walletAddress: string): Promise<UnifiedWeb3User | null> {
    const normalizedAddress = walletAddress.toLowerCase()
    
    console.log('🔍 查找Web3用户:', normalizedAddress)

    try {
      const { data: users, error } = await this.supabaseAdmin
        .from('users')
        .select('*')
        .eq('wallet_address', normalizedAddress)
        .eq('auth_type', 'web3')

      if (error) {
        console.error('❌ 查找Web3用户失败:', error)
        throw new WalletIntegrationError(
          'Failed to find Web3 user',
          'USER_CREATE_FAILED',
          { error: error.message, walletAddress: normalizedAddress }
        )
      }

      if (!users || users.length === 0) {
        console.log('🔍 未找到Web3用户:', normalizedAddress)
        return null
      }

      // 如果找到多个用户，使用第一个并记录警告
      if (users.length > 1) {
        console.warn('⚠️ 发现多个Web3用户记录，使用第一个:', users.length)
      }

      const user = users[0]
      console.log('✅ 找到现有Web3用户:', user.email)

      return this.mapToUnifiedWeb3User(user)

    } catch (error) {
      console.error('❌ 查找Web3用户过程中出现错误:', error)
      
      if (error instanceof WalletIntegrationError) {
        throw error
      }

      throw new WalletIntegrationError(
        'Error occurred while finding Web3 user',
        'USER_CREATE_FAILED',
        { originalError: error, walletAddress: normalizedAddress }
      )
    }
  }

  /**
   * 创建新的Web3用户
   */
  async createWeb3User(params: CreateWeb3UserParams): Promise<UnifiedWeb3User> {
    const normalizedAddress = params.wallet_address.toLowerCase()
    const defaultEmail = `${normalizedAddress}@web3.astrozi.app`
    
    console.log('👤 创建新Web3用户:', normalizedAddress)

    const newUserData = {
      wallet_address: normalizedAddress,
      email: params.email || defaultEmail,
      username: params.username || `Web3User${normalizedAddress.slice(-6)}`,
      auth_type: 'web3',
      auth_provider: 'walletconnect',
      user_type: 'web3'
    }

    console.log('📝 准备插入用户数据:', {
      wallet_address: newUserData.wallet_address,
      email: newUserData.email,
      username: newUserData.username,
      auth_type: newUserData.auth_type
    })

    try {
      const { data: newUser, error: createError } = await this.supabaseAdmin
        .from('users')
        .insert(newUserData)
        .select()
        .single()

      if (createError) {
        console.error('❌ 创建Web3用户失败:', createError)
        
        // 处理可能的重复用户错误
        if (createError.code === '23505') { // 唯一约束违反
          if (createError.message.includes('wallet_address')) {
            throw new WalletIntegrationError(
              'Wallet address already exists',
              'USER_CREATE_FAILED',
              { walletAddress: normalizedAddress, error: createError.message }
            )
          }
          
          if (createError.message.includes('email')) {
            throw new WalletIntegrationError(
              'Email already exists',
              'USER_CREATE_FAILED',
              { email: newUserData.email, error: createError.message }
            )
          }
        }

        throw new WalletIntegrationError(
          'Failed to create Web3 user',
          'USER_CREATE_FAILED',
          { 
            error: createError.message,
            code: createError.code,
            details: createError.details
          }
        )
      }

      if (!newUser) {
        throw new WalletIntegrationError(
          'User creation returned no data',
          'USER_CREATE_FAILED'
        )
      }

      console.log('✅ 新Web3用户创建成功:', newUser.email)
      return this.mapToUnifiedWeb3User(newUser)

    } catch (error) {
      console.error('❌ 创建Web3用户过程中出现错误:', error)
      
      if (error instanceof WalletIntegrationError) {
        throw error
      }

      throw new WalletIntegrationError(
        'Error occurred while creating Web3 user',
        'USER_CREATE_FAILED',
        { originalError: error, params }
      )
    }
  }

  /**
   * 获取或创建Web3用户 - 主要入口方法
   */
  async getOrCreateWeb3User(walletAddress: string): Promise<UnifiedWeb3User> {
    console.log('🔗 获取或创建Web3用户:', walletAddress)

    // 首先尝试查找现有用户
    const existingUser = await this.findUserByWalletAddress(walletAddress)
    
    if (existingUser) {
      console.log('✅ 使用现有Web3用户')
      return existingUser
    }

    // 如果不存在，创建新用户
    console.log('👤 创建新Web3用户')
    return await this.createWeb3User({
      wallet_address: walletAddress
    })
  }

  /**
   * 更新Web3用户的最后登录时间
   */
  async updateLastLoginTime(userId: string): Promise<void> {
    try {
      const { error } = await this.supabaseAdmin
        .from('users')
        .update({ 
          updated_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        console.warn('⚠️ 更新最后登录时间失败:', error.message)
        // 不抛出错误，因为这不是关键操作
      } else {
        console.log('✅ 更新最后登录时间成功:', userId)
      }
    } catch (error) {
      console.warn('⚠️ 更新最后登录时间过程中出现错误:', error)
    }
  }

  /**
   * 将数据库用户记录映射为统一Web3用户接口
   */
  private mapToUnifiedWeb3User(dbUser: any): UnifiedWeb3User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      wallet_address: dbUser.wallet_address,
      auth_type: 'web3',
      auth_provider: 'walletconnect',
      display_name: dbUser.username || `Web3User${dbUser.wallet_address?.slice(-6) || ''}`,
      created_at: dbUser.created_at,
      updated_at: dbUser.updated_at
    }
  }

  /**
   * 验证钱包地址格式
   */
  private validateWalletAddress(walletAddress: string): boolean {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/
    return ethAddressRegex.test(walletAddress)
  }

  /**
   * 检查环境变量配置
   */
  private checkEnvironmentConfig(): void {
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ]

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new WalletIntegrationError(
          `Missing required environment variable: ${envVar}`,
          'USER_CREATE_FAILED'
        )
      }
    }
  }
}

// 导出单例实例
export const web3UserManager = new Web3UserManager()