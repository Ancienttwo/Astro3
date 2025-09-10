/**
 * Web3 API Client - 支持Web3和Web2认证的统一API客户端
 */

// 获取认证headers
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (typeof window === 'undefined') {
    return headers
  }

  // 优先检查WalletConnect认证
  try {
    const walletConnectAuth = localStorage.getItem('walletconnect_auth')
    const currentUser = localStorage.getItem('current_user')
    
    if (walletConnectAuth && currentUser) {
      const authData = JSON.parse(walletConnectAuth)
      const userData = JSON.parse(currentUser)
      
      if (authData.auth_token && userData.wallet_address && userData.auth_method === 'walletconnect') {
        headers['X-Web3-Auth'] = JSON.stringify({
          wallet_address: userData.wallet_address,
          auth_token: authData.auth_token,
          auth_method: 'walletconnect'
        })
        headers['Authorization'] = `Bearer ${authData.auth_token}`
        console.log('🔑 使用WalletConnect认证header:', userData.wallet_address)
        return headers
      }
    }
  } catch (e) {
    console.log('⚠️ 解析WalletConnect认证失败:', e)
  }

  // 回退到传统Web3认证 (向后兼容)
  try {
    const web3Auth = localStorage.getItem('web3_auth')
    const currentUser = localStorage.getItem('current_user')
    
    if (web3Auth && currentUser) {
      const authData = JSON.parse(web3Auth)
      const userData = JSON.parse(currentUser)
      
      if (authData.auth_token && userData.wallet_address) {
        headers['X-Web3-Auth'] = JSON.stringify({
          wallet_address: userData.wallet_address,
          auth_token: authData.auth_token,
          auth_method: userData.auth_method || 'web3_jwt'
        })
        console.log('🔑 使用传统Web3认证header:', userData.wallet_address)
        return headers
      }
    }
  } catch (e) {
    console.log('⚠️ 解析传统Web3认证失败:', e)
  }

  // 尝试获取Supabase session (Web2用户)
  try {
    // 检查多个可能的key名
    const possibleKeys = [
      'sb-localhost-auth-token',
      'sb-astrozi-auth-token',
      'sb-fbtumedqykpgichytumn-auth-token'
    ]
    
    for (const key of possibleKeys) {
      const supabaseAuth = localStorage.getItem(key)
      if (supabaseAuth) {
        const authData = JSON.parse(supabaseAuth)
        if (authData && authData.access_token) {
          headers['Authorization'] = `Bearer ${authData.access_token}`
          console.log('🔑 使用Supabase Bearer token认证')
          return headers
        }
      }
    }
  } catch (e) {
    console.log('⚠️ 解析Supabase认证失败:', e)
  }

  console.log('⚠️ 未找到有效认证信息')
  return headers
}

// 统一API请求函数
export async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const authHeaders = getAuthHeaders()
  
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers
    }
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data
}

// 专门用于profile API的请求
export async function fetchUserProfile() {
  return apiRequest('/api/user/profile-unified')
}

// 专门用于membership API的请求
export async function fetchMembershipStatus() {
  return apiRequest('/api/membership/status-unified')
}

// 更新用户profile
export async function updateUserProfile(profileData: any) {
  return apiRequest('/api/user/profile-unified', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  })
}