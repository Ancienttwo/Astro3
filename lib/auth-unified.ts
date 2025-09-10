/**
 * 统一认证系统 - 支持Web2和Web3
 * 🔒 直接使用auth.ts中已经包含Web3支持的getCurrentUnifiedUser
 */

// 直接导出auth.ts中的函数，它们已经包含了Web3支持
export {
  getCurrentUnifiedUser,
  isUserAdmin,
  signOut
} from '@/lib/auth'

// 导出类型
export type { UnifiedUser } from '@/lib/auth'

/**
 * 统一认证检查
 */
export async function isUserAuthenticated(request?: Request): Promise<boolean> {
  try {
    const { getCurrentUnifiedUser } = await import('@/lib/auth')
    const user = await getCurrentUnifiedUser(request)
    return user !== null
  } catch (error) {
    console.error('Authentication check failed:', error)
    return false
  }
}

/**
 * 获取用户认证类型
 */
export async function getUserAuthType(request?: Request): Promise<'web2' | 'web3' | null> {
  try {
    const { getCurrentUnifiedUser } = await import('@/lib/auth')
    const user = await getCurrentUnifiedUser(request)
    return user?.auth_type || null
  } catch (error) {
    console.error('Get auth type failed:', error)
    return null
  }
}

/**
 * API路由认证中间件助手
 */
export async function authenticateApiRequest(request: Request): Promise<{
  isAuthenticated: boolean
  user: any | null
  authType: 'web2' | 'web3' | null
}> {
  try {
    const { getCurrentUnifiedUser } = await import('@/lib/auth')
    const user = await getCurrentUnifiedUser(request)
    
    return {
      isAuthenticated: user !== null,
      user,
      authType: user?.auth_type || null
    }
  } catch (error) {
    console.error('Authenticate API request failed:', error)
    return {
      isAuthenticated: false,
      user: null,
      authType: null
    }
  }
} 