/**
 * RLS策略辅助服务
 * 
 * 提供与Supabase Row Level Security策略交互的辅助函数
 * 确保Web3用户能够正确访问他们的数据，同时保持数据隔离
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { UnifiedWeb3User, WalletIntegrationError } from '../types/wallet-integration'

export class RLSPolicyHelper {
  private supabase: SupabaseClient | null = null
  private supabaseAdmin: SupabaseClient | null = null
  private initialized: boolean = false

  private ensureInitialized() {
    if (!this.initialized) {
      // 检查必要的环境变量
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('supabaseKey is required.')
      }

      // 标准客户端（使用用户的JWT进行RLS访问）
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // 管理员客户端（绕过RLS，用于系统操作）
      // 只在服务端环境或有服务角色密钥时初始化
      if (typeof window === 'undefined' && process.env.SUPABASE_SERVICE_ROLE_KEY) {
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
      } else {
        // 客户端环境，不初始化管理员客户端
        this.supabaseAdmin = null
      }

      this.initialized = true
      console.log('✅ RLSPolicyHelper懒加载初始化完成')
    }
  }

  /**
   * 测试Web3用户的RLS访问权限
   * 验证用户只能访问自己的数据
   */
  async testWeb3UserAccess(userId: string): Promise<boolean> {
    this.ensureInitialized()
    console.log('🔍 测试Web3用户RLS访问权限:', userId)

    try {
      // 首先检查当前Supabase session状态
      const { data: sessionData, error: sessionError } = await this.supabase!.auth.getSession()
      console.log('🔍 当前Supabase session状态:', {
        hasSession: !!sessionData?.session,
        hasUser: !!sessionData?.session?.user,
        userId: sessionData?.session?.user?.id,
        userEmail: sessionData?.session?.user?.email,
        sessionError: sessionError?.message
      })
      // 1. 测试用户表访问
      const { data: userAccess, error: userError } = await this.supabase!
        .from('users')
        .select('id, email, wallet_address, auth_type')
        .eq('id', userId)
        .single()

      if (userError) {
        console.warn('⚠️ 用户表访问测试失败:', {
          code: userError.code,
          message: userError.message,
          details: userError.details,
          hint: userError.hint,
          userId,
          sessionUserId: sessionData?.session?.user?.id,
          sessionEmail: sessionData?.session?.user?.email
        })
        // 不要因为RLS测试失败就阻止登录流程，只记录警告
        console.warn('⚠️ RLS测试失败但继续登录流程，这可能是正常的初始化过程')
        return false // 返回false表示测试失败，但不抛出错误
      }

      if (!userAccess) {
        console.error('❌ 无法访问用户数据（RLS阻止）')
        return false
      }

      console.log('✅ 用户表访问正常:', userAccess.email)

      // 2. 测试是否能访问其他用户的数据（应该被RLS阻止）
      const { data: otherUsers, error: otherError } = await this.supabase
        .from('users')
        .select('id')
        .neq('id', userId)
        .limit(5)

      if (otherError) {
        console.log('✅ RLS正确阻止访问其他用户数据')
      } else if (otherUsers && otherUsers.length === 0) {
        console.log('✅ RLS正确限制数据访问范围')
      } else {
        console.warn('⚠️ RLS可能配置不正确，允许访问其他用户数据')
        return false
      }

      // 3. 测试用户数据表访问（如果存在）
      const result = await this.testUserDataTableAccess(userId)
      
      return result

    } catch (error) {
      console.error('❌ RLS访问测试过程中出现错误:', error)
      return false
    }
  }

  /**
   * 测试用户数据表的访问权限
   */
  private async testUserDataTableAccess(userId: string): Promise<boolean> {
    const dataTables = ['charts', 'user_charts', 'readings', 'user_data', 'profiles']
    let allTestsPassed = true

    for (const tableName of dataTables) {
      try {
        // 尝试访问表（如果存在）
        const { data, error } = await this.supabase
          .from(tableName)
          .select('*')
          .limit(1)

        if (error) {
          // 如果表不存在，跳过测试
          if (error.code === '42P01') {
            console.log(`ℹ️ 表 ${tableName} 不存在，跳过测试`)
            continue
          }
          
          // 其他错误可能是RLS相关的
          console.log(`ℹ️ 表 ${tableName} 的RLS访问测试:`, error.message)
        } else {
          console.log(`✅ 表 ${tableName} 访问正常`)
        }

      } catch (error) {
        console.warn(`⚠️ 测试表 ${tableName} 时出现错误:`, error)
        allTestsPassed = false
      }
    }

    return allTestsPassed
  }

  /**
   * 为Web3用户创建安全的数据查询
   * 确保所有查询都通过RLS过滤
   */
  async getSecureUserData(userId: string): Promise<any> {
    this.ensureInitialized()
    console.log('🔒 获取Web3用户的安全数据:', userId)

    try {
      // 使用用户的JWT上下文进行查询，自动应用RLS
      const { data: userData, error: userError } = await this.supabase
        .from('user_profile_secure') // 使用安全视图
        .select('*')
        .single()

      if (userError) {
        console.error('❌ 获取安全用户数据失败:', userError)
        throw new WalletIntegrationError(
          'Failed to get secure user data',
          'USER_CREATE_FAILED',
          { error: userError.message, userId }
        )
      }

      console.log('✅ 安全用户数据获取成功:', userData.email)
      return userData

    } catch (error) {
      console.error('❌ 获取安全用户数据过程中出现错误:', error)
      
      if (error instanceof WalletIntegrationError) {
        throw error
      }

      throw new WalletIntegrationError(
        'Error occurred while getting secure user data',
        'USER_CREATE_FAILED',
        { originalError: error, userId }
      )
    }
  }

  /**
   * 记录Web3用户操作到审计日志
   */
  async logWeb3UserAction(
    userId: string,
    walletAddress: string,
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: any
  ): Promise<void> {
    this.ensureInitialized()
    console.log('📝 记录Web3用户操作:', { userId, action, resourceType })

    try {
      // 使用管理员客户端写入审计日志（如果可用）
      if (!this.supabaseAdmin) {
        console.log('ℹ️ 审计日志跳过（客户端环境）')
        return
      }

      const { error } = await this.supabaseAdmin
        .from('web3_audit_log')
        .insert({
          user_id: userId,
          wallet_address: walletAddress,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details: details ? JSON.stringify(details) : null,
          ip_address: null, // 在实际应用中应该从请求中获取
          user_agent: null  // 在实际应用中应该从请求中获取
        })

      if (error) {
        console.warn('⚠️ 记录审计日志失败:', error.message)
        // 不抛出错误，因为审计日志失败不应该阻止业务操作
      } else {
        console.log('✅ 审计日志记录成功')
      }

    } catch (error) {
      console.warn('⚠️ 记录审计日志过程中出现错误:', error)
    }
  }

  /**
   * 检查Web3用户的数据隔离
   * 确保Web3用户无法访问Web2用户的数据
   */
  async verifyDataIsolation(web3UserId: string): Promise<boolean> {
    this.ensureInitialized()
    console.log('🔒 验证Web3用户数据隔离:', web3UserId)

    try {
      // 1. 尝试查询所有用户（应该只返回当前用户）
      const { data: allUsers, error: allUsersError } = await this.supabase
        .from('users')
        .select('id, auth_type')

      if (allUsersError) {
        console.error('❌ 查询用户列表失败:', allUsersError)
        return false
      }

      // 检查是否只返回了当前用户的数据
      if (!allUsers || allUsers.length === 0) {
        console.error('❌ 无法获取用户数据')
        return false
      }

      if (allUsers.length > 1) {
        console.error('❌ RLS配置错误：返回了多个用户的数据')
        return false
      }

      const currentUser = allUsers[0]
      if (currentUser.id !== web3UserId) {
        console.error('❌ RLS配置错误：返回了其他用户的数据')
        return false
      }

      console.log('✅ 数据隔离验证通过')

      // 2. 使用管理员权限验证实际的数据隔离情况（如果可用）
      if (this.supabaseAdmin) {
        const { data: adminUsers, error: adminError } = await this.supabaseAdmin
          .from('users')
          .select('id, auth_type, email')
          .order('created_at', { ascending: false })
          .limit(10)

        if (adminError) {
          console.error('❌ 管理员查询失败:', adminError)
          return false
        }

        const web2Users = adminUsers?.filter(u => u.auth_type === 'web2') || []
        const web3Users = adminUsers?.filter(u => u.auth_type === 'web3') || []

        console.log('📊 数据隔离统计:', {
          totalUsers: adminUsers?.length || 0,
          web2Users: web2Users.length,
          web3Users: web3Users.length,
          currentWeb3User: web3UserId
        })
      } else {
        console.log('ℹ️ 跳过管理员权限验证（客户端环境）')
      }

      return true

    } catch (error) {
      console.error('❌ 验证数据隔离过程中出现错误:', error)
      return false
    }
  }

  /**
   * 获取Web3用户的审计日志
   */
  async getWeb3UserAuditLog(userId: string, limit: number = 50): Promise<any[]> {
    this.ensureInitialized()
    console.log('📋 获取Web3用户审计日志:', userId)

    try {
      const { data: auditLogs, error } = await this.supabase
        .from('web3_audit_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('❌ 获取审计日志失败:', error)
        return []
      }

      console.log('✅ 审计日志获取成功，记录数:', auditLogs?.length || 0)
      return auditLogs || []

    } catch (error) {
      console.error('❌ 获取审计日志过程中出现错误:', error)
      return []
    }
  }

  /**
   * 执行RLS测试函数
   */
  async runRLSTest(): Promise<any[]> {
    this.ensureInitialized()
    console.log('🧪 执行RLS测试函数')

    try {
      const { data: testResults, error } = await this.supabase
        .rpc('test_web3_rls')

      if (error) {
        console.error('❌ RLS测试执行失败:', error)
        return []
      }

      console.log('✅ RLS测试执行成功')
      return testResults || []

    } catch (error) {
      console.error('❌ RLS测试过程中出现错误:', error)
      return []
    }
  }

  /**
   * 检查用户是否为Web3用户
   */
  async isWeb3User(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .rpc('is_web3_user')

      if (error) {
        console.warn('⚠️ 检查Web3用户状态失败:', error.message)
        return false
      }

      return data === true

    } catch (error) {
      console.warn('⚠️ 检查Web3用户状态过程中出现错误:', error)
      return false
    }
  }

  /**
   * 获取用户的钱包地址
   */
  async getUserWalletAddress(): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_user_wallet_address')

      if (error) {
        console.warn('⚠️ 获取钱包地址失败:', error.message)
        return null
      }

      return data || null

    } catch (error) {
      console.warn('⚠️ 获取钱包地址过程中出现错误:', error)
      return null
    }
  }
}

// 导出懒加载单例实例
let _rlsPolicyHelperInstance: RLSPolicyHelper | null = null

export const rlsPolicyHelper = {
  get instance(): RLSPolicyHelper {
    if (!_rlsPolicyHelperInstance) {
      _rlsPolicyHelperInstance = new RLSPolicyHelper()
    }
    return _rlsPolicyHelperInstance
  },
  
  // 代理所有方法
  async testWeb3UserAccess(userId: string): Promise<boolean> {
    return this.instance.testWeb3UserAccess(userId)
  },
  
  async getSecureUserData(userId: string): Promise<any> {
    return this.instance.getSecureUserData(userId)
  },
  
  async logWeb3UserAction(
    userId: string,
    walletAddress: string,
    action: string,
    category: string,
    targetResource?: string,
    metadata?: any
  ): Promise<void> {
    return this.instance.logWeb3UserAction(userId, walletAddress, action, category, targetResource, metadata)
  },
  
  async verifyDataIsolation(web3UserId: string): Promise<boolean> {
    return this.instance.verifyDataIsolation(web3UserId)
  },
  
  async getWeb3UserAuditLog(userId: string, limit?: number): Promise<any[]> {
    return this.instance.getWeb3UserAuditLog(userId, limit)
  },
  
  async runRLSTest(): Promise<any[]> {
    return this.instance.runRLSTest()
  },
  
  async isWeb3User(): Promise<boolean> {
    return this.instance.isWeb3User()
  },
  
  async getUserWalletAddress(): Promise<string | null> {
    return this.instance.getUserWalletAddress()
  }
}