/**
 * 用户类型检测工具
 */

export interface UserType {
  isWeb3: boolean
  isWeb2: boolean
  walletAddress?: string
  email?: string
  username?: string
}

export function detectUserType(): UserType {
  if (typeof window === 'undefined') {
    return { isWeb3: false, isWeb2: false }
  }

  // 优先检查Web3用户
  const currentUser = localStorage.getItem('current_user')
  if (currentUser) {
    try {
      const userData = JSON.parse(currentUser)
      if (userData.wallet_address && (userData.auth_method === 'web3_jwt' || userData.auth_method === 'walletconnect')) {
        console.log('🔍 检测到Web3用户 (' + userData.auth_method + '):', userData.wallet_address)
        return {
          isWeb3: true,
          isWeb2: false,
          walletAddress: userData.wallet_address,
          email: userData.email,
          username: userData.username
        }
      }
    } catch (e) {
      console.log('解析Web3用户数据失败')
    }
  }

  // 检查Supabase认证中的Web3用户（虚拟邮箱系统）
  const supabaseKeys = [
    'sb-localhost-auth-token',
    'sb-astrozi-auth-token', 
    'sb-fbtumedqykpgichytumn-auth-token'
  ]
  
  for (const key of supabaseKeys) {
    const supabaseAuth = localStorage.getItem(key)
    if (supabaseAuth) {
      try {
        const authData = JSON.parse(supabaseAuth)
        if (authData && authData.access_token && authData.user) {
          const userEmail = authData.user.email
          
          // 检查是否为Web3用户（虚拟邮箱）
          if (userEmail && (userEmail.endsWith('@web3.local') || userEmail.endsWith('@web3.astrozi.app') || userEmail.endsWith('@astrozi.ai') || userEmail.endsWith('@web3.wallet'))) {
            console.log('🔍 检测到Web3用户 (虚拟邮箱):', userEmail)
            const walletAddress = userEmail.replace('@web3.local', '').replace('@web3.astrozi.app', '').replace('@astrozi.ai', '').replace('@web3.wallet', '')
            return {
              isWeb3: true,
              isWeb2: false,
              walletAddress: walletAddress,
              email: userEmail,
              username: authData.user.user_metadata?.username || `Web3User${walletAddress.slice(-6)}`
            }
          }
          
          // 普通Web2用户 - 确保不是Web3虚拟邮箱
          if (userEmail && !userEmail.endsWith('@web3.local') && !userEmail.endsWith('@web3.astrozi.app') && !userEmail.endsWith('@astrozi.ai') && !userEmail.endsWith('@web3.wallet')) {
            console.log('🔍 检测到Web2用户:', userEmail)
            return {
              isWeb3: false,
              isWeb2: true,
              email: userEmail
            }
          }
        }
      } catch (e) {
        continue
      }
    }
  }

  return { isWeb3: false, isWeb2: false }
}