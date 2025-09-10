// 双轨认证系统 - 简化版本
export interface DualUser {
  id: string
  email: string
  username?: string
  auth_type: 'web2' | 'web3'
  created_at: string
  updated_at: string
}

// Web3 认证管理器
export class Web3Auth {
  static getCurrentUser(): DualUser | null {
    try {
      // 检查是否有Web3用户信息存储在localStorage
      const web3UserData = localStorage.getItem('web3_user')
      if (web3UserData) {
        return JSON.parse(web3UserData) as DualUser
      }
      return null
    } catch (error) {
      console.error('获取Web3用户失败:', error)
      return null
    }
  }

  static setCurrentUser(user: DualUser | null) {
    try {
      if (user) {
        localStorage.setItem('web3_user', JSON.stringify(user))
      } else {
        localStorage.removeItem('web3_user')
      }
    } catch (error) {
      console.error('设置Web3用户失败:', error)
    }
  }

  static async signOut() {
    try {
      localStorage.removeItem('web3_user')
    } catch (error) {
      console.error('Web3登出失败:', error)
    }
  }
}

// 双轨认证管理器
export class DualAuthManager {
  static getUserDisplayName(user: DualUser): string {
    return user.username || user.email?.split('@')[0] || `用户${user.id.slice(0, 8)}`
  }

  static async getCurrentUser(): Promise<DualUser | null> {
    try {
      // 优先检查Supabase用户
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        return {
          id: session.user.id,
          email: session.user.email?.toLowerCase() || '',
          username: session.user.user_metadata?.name || `用户${session.user.id.slice(0, 8)}`,
          auth_type: 'web2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }

      // 检查Web3用户
      return Web3Auth.getCurrentUser()
    } catch (error) {
      console.error('获取当前用户失败:', error)
      return null
    }
  }

  static async signOut() {
    try {
      // Supabase登出
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase.auth.signOut()

      // Web3登出
      await Web3Auth.signOut()
    } catch (error) {
      console.error('登出失败:', error)
    }
  }
} 