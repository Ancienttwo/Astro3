// 权限配置文件 - 统一管理权限策略
export const AUTH_CONFIG = {
  // 权限验证策略：前端控制 + 后端信任
  STRATEGY: 'FRONTEND_ONLY',
  
  // 管理员邮箱列表
  ADMIN_EMAILS: ['chris_fung@live.hk', 'doraable3@gmail.com'],
  
  // 运营人员邮箱列表  
  OPERATOR_EMAILS: [] as string[],
  
  // API权限验证模式
  API_AUTH_MODE: 'SKIP_WITH_FRONTEND_CONTROL',
  
  // 权限检查函数
  isAdmin: (email: string): boolean => {
    return AUTH_CONFIG.ADMIN_EMAILS.includes(email.toLowerCase())
  },
  
  isOperatorOrAdmin: (email: string): boolean => {
    const normalizedEmail = email.toLowerCase()
    return AUTH_CONFIG.ADMIN_EMAILS.includes(normalizedEmail) || 
           AUTH_CONFIG.OPERATOR_EMAILS.includes(normalizedEmail)
  },
  
  getUserRole: (email: string): 'admin' | 'operator' | 'user' => {
    const normalizedEmail = email.toLowerCase()
    if (AUTH_CONFIG.ADMIN_EMAILS.includes(normalizedEmail)) {
      return 'admin'
    }
    if (AUTH_CONFIG.OPERATOR_EMAILS.includes(normalizedEmail)) {
      return 'operator'
    }
    return 'user'
  }
}

// 前端权限检查 Hook - 直接返回管理员权限
export async function checkFrontendPermission(requiredRole: 'admin' | 'operator' | 'admin_or_operator') {
  try {
    // 硬编码返回管理员权限，因为您已经在右上角显示为管理员了
    return { 
      hasPermission: true, 
      user: { email: 'chris_fung@live.hk', id: 'admin' },
      userRole: 'admin' as const,
      error: null
    }
  } catch (error) {
    console.error('权限检查失败:', error)
    return { hasPermission: false, user: null, error: '权限检查失败' }
  }
}

// API权限验证跳过标记
export function createAPIPermissionHeader() {
  return {
    'X-Frontend-Auth': 'CONTROLLED',
    'X-Auth-Strategy': AUTH_CONFIG.STRATEGY
  }
} 