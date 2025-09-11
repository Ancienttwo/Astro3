/**
 * Supabase Session管理器
 * 
 * 核心功能：
 * 1. 为Web3用户设置Supabase session
 * 2. 恢复和验证现有session
 * 3. 清理过期或无效session
 * 4. 确保Web3用户能够访问RLS保护的数据
 */

import { createClient, SupabaseClient, Session } from '@supabase/supabase-js'
import { 
  UnifiedWeb3User,
  DualJWTTokens,
  StoredAuthData,
  WalletIntegrationError 
} from '../types/wallet-integration'

export class SupabaseSessionManager {
  private supabase: SupabaseClient | null = null
  private supabaseAdmin: SupabaseClient | null = null
  private initialized: boolean = false

  private ensureInitialized() {
    if (!this.initialized) {
      // 标准客户端 (用于session管理)
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // 管理员客户端只在服务端环境中初始化
      if (typeof window === 'undefined') {
        // 服务端环境
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
        // 客户端环境，不需要管理员客户端
        this.supabaseAdmin = null
      }

      this.initialized = true
      console.log('✅ SupabaseSessionManager懒加载初始化完成')
    }
  }

  /**
   * 获取Supabase客户端实例（用于前端直接使用）
   */
  getSupabaseClient(): SupabaseClient {
    this.ensureInitialized()
    return this.supabase!
  }

  /**
   * 设置标准的Supabase session（用于Web3认证）
   * 直接使用从服务端返回的标准Supabase session
   */
  async setStandardSession(session: Session): Promise<void> {
    this.ensureInitialized()
    console.log('🔑 开始设置标准Supabase session')

    try {
      // 验证session数据完整性
      if (!session || !session.access_token) {
        console.error('❌ Session数据不完整:', session)
        throw new WalletIntegrationError(
          'AuthSessionMissingError: Auth session missing! Session数据为空或缺少access_token',
          'SESSION_SET_FAILED'
        )
      }

      console.log('🔍 Session数据验证:', {
        has_access_token: !!session.access_token,
        has_refresh_token: !!session.refresh_token,
        access_token_length: session.access_token?.length || 0
      })

      const { data, error } = await this.supabase!.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      })

      if (error) {
        console.error('❌ 设置标准Supabase session失败:', error)
        throw new WalletIntegrationError(
          `Failed to set standard Supabase session: ${error.message}`,
          'SESSION_SET_FAILED',
          { error: error.message }
        )
      }

      if (!data.session) {
        console.error('❌ Supabase session data为null，可能是JWT无效')
        throw new WalletIntegrationError(
          'Supabase session data is null - JWT可能无效或过期',
          'SESSION_SET_FAILED'
        )
      }

      console.log('✅ 标准Supabase session设置成功:', {
        userId: data.session.user.id,
        email: data.session.user.email,
        expiresAt: data.session.expires_at
      })

      // 验证session是否正常工作
      await this.validateSessionAccess()

    } catch (error) {
      console.error('❌ 设置标准Supabase session过程中出现错误:', error)
      
      if (error instanceof WalletIntegrationError) {
        throw error
      }

      throw new WalletIntegrationError(
        'Error occurred while setting standard Supabase session',
        'SESSION_SET_FAILED',
        { originalError: error }
      )
    }
  }

  /**
   * 使用邮箱+密码创建 Supabase session（配合 Edge Function 返回的凭据）
   * 带有限次重试，缓解密码更新后的短暂传播延迟
   */
  async createSupabaseSessionFromCredentials(email: string, password: string): Promise<Session | null> {
    this.ensureInitialized()
    console.log('🔑 使用凭据创建Supabase session (password grant) ...')

    const tryOnce = async () => {
      try {
        const { data, error } = await this.supabase!.auth.signInWithPassword({ email, password })
        if (error) {
          console.warn('⚠️ signInWithPassword 失败:', error.message)
          return { session: null as Session | null, error }
        }
        return { session: data.session as Session | null, error: null as any }
      } catch (e: any) {
        console.error('❌ 调用 signInWithPassword 异常:', e?.message || e)
        return { session: null as Session | null, error: e }
      }
    }

    // 最多重试3次，指数退避 200ms / 400ms / 800ms
    const delays = [200, 400, 800]
    for (let i = 0; i < delays.length; i++) {
      const attempt = i + 1
      const { session, error } = await tryOnce()
      if (session && !error) {
        console.log('✅ 使用凭据登录成功，session已创建')
        // 额外验证访问
        await this.validateSessionAccess().catch(() => {})
        return session
      }
      if (i < delays.length - 1) {
        console.log(`🔁 第${attempt}次尝试失败，${delays[i+1]}ms 后重试 ...`)
        await new Promise(r => setTimeout(r, delays[i+1]))
      }
    }

    console.error('❌ 多次尝试仍无法通过凭据创建session')
    return null
  }

  /**
   * 恢复Web3用户的Supabase session
   * 从localStorage读取认证数据并重新设置session
   */
  async restoreWeb3Session(): Promise<UnifiedWeb3User | null> {
    if (typeof window === 'undefined') {
      console.log('⚠️ 服务端环境，跳过session恢复')
      return null
    }

    console.log('🔄 尝试恢复Web3用户的Supabase session')

    try {
      // 读取localStorage中的认证数据
      const storedAuthData = this.getStoredAuthData()
      if (!storedAuthData) {
        console.log('📭 未找到存储的认证数据')
        return null
      }

      const { current_user, walletconnect_auth } = storedAuthData

      // 验证是否是Web3用户
      if (current_user.auth_method !== 'walletconnect' || !current_user.wallet_address) {
        console.log('⚠️ 非Web3用户，跳过session恢复')
        return null
      }

      // 检查token是否过期（给予30秒的容错时间）
      const currentTime = Math.floor(Date.now() / 1000)
      if (walletconnect_auth.expires_at && currentTime >= (walletconnect_auth.expires_at + 30)) {
        console.log('⚠️ Web3认证token已过期（超过30秒容错时间），清理数据')
        this.clearStoredAuthData()
        return null
      }
      
      // 如果token即将过期（还有5分钟），警告但继续使用
      if (walletconnect_auth.expires_at && currentTime >= (walletconnect_auth.expires_at - 300)) {
        console.log('⚠️ Web3认证token即将过期（还有', Math.floor((walletconnect_auth.expires_at - currentTime) / 60), '分钟），但继续使用')
      }

      console.log('🔍 找到有效的Web3认证数据，使用现有session恢复')
      
      // 调试：打印完整的认证数据结构
      console.log('📊 存储的认证数据结构:', {
        current_user: {
          id: current_user.id,
          email: current_user.email,
          wallet_address: current_user.wallet_address,
          auth_method: current_user.auth_method
        },
        walletconnect_auth: {
          hasAuthToken: !!walletconnect_auth.auth_token,
          hasRefreshToken: !!(walletconnect_auth as any).refresh_token,
          wallet_address: walletconnect_auth.wallet_address,
          auth_method: walletconnect_auth.auth_method,
          expires_at: walletconnect_auth.expires_at
        }
      })

      // 验证关键认证数据的完整性
      if (!walletconnect_auth.auth_token || !current_user.id) {
        console.error('⚠️ 关键认证数据缺失:', {
          hasAuthToken: !!walletconnect_auth.auth_token,
          hasUserId: !!current_user.id,
          authToken: walletconnect_auth.auth_token ? '[隐藏]' : 'undefined',
          userId: current_user.id,
          walletconnect_auth_keys: Object.keys(walletconnect_auth),
          current_user_keys: Object.keys(current_user)
        })
        console.log('🧹 清理不完整的认证数据，需要重新登录')
        this.clearStoredAuthData()
        return null
      }

      // 使用localStorage中的现有session数据
      const standardSession: Session = {
        access_token: walletconnect_auth.auth_token,
        refresh_token: (walletconnect_auth as any).refresh_token || walletconnect_auth.auth_token,
        expires_at: walletconnect_auth.expires_at,
        expires_in: Math.max(0, walletconnect_auth.expires_at - Math.floor(Date.now() / 1000)),
        token_type: 'bearer',
        user: {
          id: current_user.id,
          aud: 'authenticated',
          role: 'authenticated',
          email: current_user.email,
          created_at: (current_user as any).created_at || new Date().toISOString(),
          updated_at: (current_user as any).updated_at || new Date().toISOString(),
          user_metadata: {
            wallet_address: current_user.wallet_address,
            auth_type: 'web3',
            auth_provider: 'walletconnect'
          },
          app_metadata: {}
        }
      }
      
      // 使用标准session设置Supabase session（带额外验证）
      try {
        await this.setStandardSession(standardSession)
      } catch (error) {
        console.error('❌ 设置Supabase session失败:', error)
        console.log('🧹 清理损坏的认证数据')
        this.clearStoredAuthData()
        return null
      }

      // 构造用户对象
      const web3User: UnifiedWeb3User = {
        id: current_user.id,
        email: current_user.email,
        username: current_user.username,
        wallet_address: current_user.wallet_address,
        auth_type: 'web3',
        auth_provider: 'walletconnect',
        display_name: current_user.display_name,
        created_at: (current_user as any).created_at || new Date().toISOString(),
        updated_at: (current_user as any).updated_at || new Date().toISOString()
      }

      console.log('✅ Web3用户session恢复成功:', current_user.wallet_address)
      return web3User

    } catch (error) {
      console.error('❌ 恢复Web3 session失败:', error)
      this.clearStoredAuthData()
      return null
    }
  }

  /**
   * 获取当前Supabase session
   */
  async getCurrentSession(): Promise<Session | null> {
    this.ensureInitialized()
    try {
      const { data: { session }, error } = await this.supabase!.auth.getSession()
      
      if (error) {
        console.warn('⚠️ 获取当前session失败:', error.message)
        return null
      }

      if (session) {
        console.log('✅ 找到当前session:', session.user.id)
      } else {
        console.log('📭 未找到当前session')
      }

      return session

    } catch (error) {
      console.error('❌ 获取当前session过程中出现错误:', error)
      return null
    }
  }

  /**
   * 验证session访问权限
   * 通过查询用户表来确认RLS访问正常
   */
  private async validateSessionAccess(): Promise<boolean> {
    this.ensureInitialized()
    try {
      console.log('🔍 验证session访问权限...')

      // 尝试查询当前用户信息（测试RLS访问）
      const { error } = await this.supabase!
        .from('users')
        .select('id, email, wallet_address')
        .limit(1)

      if (error) {
        console.warn('⚠️ Session访问验证失败:', error.message)
        return false
      }

      console.log('✅ Session访问权限验证通过，RLS正常工作')
      return true

    } catch (error) {
      console.warn('⚠️ Session访问验证过程中出现错误:', error)
      return false
    }
  }

  /**
   * 清理Web3用户的Supabase session
   */
  async clearWeb3Session(): Promise<void> {
    this.ensureInitialized()
    console.log('🧹 清理Web3用户的Supabase session')

    try {
      // 清理Supabase session
      const { error } = await this.supabase!.auth.signOut()
      
      if (error) {
        console.warn('⚠️ 清理Supabase session时出现警告:', error.message)
      } else {
        console.log('✅ Supabase session已清理')
      }

      // 清理localStorage
      this.clearStoredAuthData()

    } catch (error) {
      console.error('❌ 清理Web3 session过程中出现错误:', error)
      // 即使出错也要尝试清理本地数据
      this.clearStoredAuthData()
    }
  }

  /**
   * 检查session是否即将过期并自动刷新
   */
  async checkAndRefreshSession(): Promise<boolean> {
    if (typeof window === 'undefined') return false

    try {
      const currentSession = await this.getCurrentSession()
      if (!currentSession) {
        console.log('📭 无当前session，尝试从localStorage恢复')
        const restoredUser = await this.restoreWeb3Session()
        return restoredUser !== null
      }

      // 检查session是否即将过期（还有2分钟过期时才需要重新认证）
      const expiresAt = currentSession.expires_at
      const currentTime = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = expiresAt ? expiresAt - currentTime : 0

      if (timeUntilExpiry < 120) { // 优化：从5分钟改为2分钟，给用户更多缓冲时间
        console.log('⏰ Session即将过期（还有', Math.floor(timeUntilExpiry / 60), '分钟），尝试恢复session')
        
        // 先尝试从 localStorage 恢复 session
        try {
          const restoredUser = await this.restoreWeb3Session()
          if (restoredUser) {
            console.log('✅ Session自动恢复成功')
            return true
          }
        } catch (restoreError) {
          console.log('❌ Session恢复尝试失败:', restoreError)
        }
        
        // 只有在恢复失败后才清理数据
        console.log('⚠️ Session无法恢复，需要重新认证')
        this.clearStoredAuthData()
        return false
      }

      console.log('✅ Session状态良好，剩余时间:', Math.floor(timeUntilExpiry / 60), '分钟')
      return true

    } catch (error) {
      console.error('❌ 检查和刷新session失败:', error)
      return false
    }
  }

  /**
   * 从localStorage获取存储的认证数据
   */
  private getStoredAuthData(): StoredAuthData | null {
    if (typeof window === 'undefined') return null

    try {
      const currentUser = localStorage.getItem('current_user')
      const walletconnectAuth = localStorage.getItem('walletconnect_auth')
      const walletSession = localStorage.getItem('wallet_session')

      if (!currentUser || !walletconnectAuth || !walletSession) {
        return null
      }

      return {
        current_user: JSON.parse(currentUser),
        walletconnect_auth: JSON.parse(walletconnectAuth),
        wallet_session: JSON.parse(walletSession)
      }

    } catch (error) {
      console.error('❌ 解析存储的认证数据失败:', error)
      return null
    }
  }

  /**
   * 更新localStorage中的token
   */
  private updateStoredTokens(tokens: DualJWTTokens): void {
    if (typeof window === 'undefined') return

    try {
      const walletconnectAuth = localStorage.getItem('walletconnect_auth')
      if (walletconnectAuth) {
        const authData = JSON.parse(walletconnectAuth)
        authData.auth_token = tokens.customJWT
        authData.expires_at = tokens.expiresAt
        localStorage.setItem('walletconnect_auth', JSON.stringify(authData))
        
        console.log('✅ localStorage中的tokens已更新')
      }

    } catch (error) {
      console.error('❌ 更新存储的tokens失败:', error)
    }
  }

  /**
   * 清理localStorage中的认证数据
   */
  private clearStoredAuthData(): void {
    if (typeof window === 'undefined') return

    const keysToRemove = [
      'current_user',
      'walletconnect_auth', 
      'wallet_session',
      'web3_auth',
      'web3_user'
    ]

    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })

    console.log('✅ 存储的认证数据已清理')
  }

  /**
   * 监听Supabase auth状态变化
   */
  onAuthStateChange(callback: (session: Session | null) => void): () => void {
    this.ensureInitialized()
    console.log('👂 开始监听Supabase auth状态变化')

    const { data: { subscription } } = this.supabase!.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Supabase auth状态变化:', event, session?.user?.id)
        
        if (event === 'SIGNED_OUT') {
          this.clearStoredAuthData()
        }
        
        callback(session)
      }
    )

    // 返回取消订阅的函数
    return () => {
      subscription.unsubscribe()
      console.log('👂 取消监听Supabase auth状态变化')
    }
  }
}

// 导出懒加载单例实例
let _supabaseSessionManagerInstance: SupabaseSessionManager | null = null

export const supabaseSessionManager = {
  get instance(): SupabaseSessionManager {
    if (!_supabaseSessionManagerInstance) {
      _supabaseSessionManagerInstance = new SupabaseSessionManager()
    }
    return _supabaseSessionManagerInstance
  },
  
  // 代理所有方法
  getSupabaseClient() {
    return this.instance.getSupabaseClient()
  },

  async setStandardSession(session: Session): Promise<void> {
    return this.instance.setStandardSession(session)
  },
  
  async restoreWeb3Session(): Promise<UnifiedWeb3User | null> {
    return this.instance.restoreWeb3Session()
  },
  
  async getCurrentSession(): Promise<Session | null> {
    return this.instance.getCurrentSession()
  },
  
  async clearWeb3Session(): Promise<void> {
    return this.instance.clearWeb3Session()
  },
  
  async checkAndRefreshSession(): Promise<boolean> {
    return this.instance.checkAndRefreshSession()
  },
  
  onAuthStateChange(callback: (session: Session | null) => void): () => void {
    return this.instance.onAuthStateChange(callback)
  }
}
