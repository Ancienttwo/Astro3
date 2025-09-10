/**
 * 互助系统专用认证和权限管理工具
 * 支持Web3和传统认证的统一处理
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import { getCurrentUnifiedUser, UnifiedUser } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 互助系统用户接口
export interface MutualAidUser extends UnifiedUser {
  wallet_address?: string
  display_name?: string
  bio?: string
  reputation_score: number
  verification_status: string
  role: 'user' | 'validator' | 'moderator' | 'admin'
  is_active_validator: boolean
  validation_accuracy: number
  total_validations: number
  total_contributions: number
  permissions: string[]
  is_active: boolean
  is_banned: boolean
  last_active_at: string
}

// 权限检查结果
export interface PermissionCheck {
  allowed: boolean
  reason?: string
  user?: MutualAidUser
}

// 用户权限类型
export type UserPermission = 
  | 'submit_requests'
  | 'validate_requests' 
  | 'moderate_content'
  | 'admin_access'
  | 'view_analytics'
  | 'manage_users'
  | 'system_settings'

/**
 * 获取互助系统用户信息
 */
export async function getMutualAidUser(request: NextRequest): Promise<MutualAidUser | null> {
  try {
    // 首先获取基础认证用户
    const baseUser = await getCurrentUnifiedUser(request)
    if (!baseUser) {
      return null
    }

    console.log('🔍 获取互助系统用户信息:', baseUser.id)

    // 从user_profiles表获取完整的互助系统配置文件
    let userProfile
    
    // 尝试通过不同字段查找用户
    const queries = [
      { field: 'user_id', value: baseUser.id },
      { field: 'wallet_address', value: baseUser.wallet_address },
      { field: 'email', value: baseUser.email }
    ].filter(q => q.value) // 过滤掉空值

    for (const query of queries) {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq(query.field, query.value)
        .single()

      if (profile && !error) {
        userProfile = profile
        break
      }
    }

    if (!userProfile) {
      console.log('❌ 未找到互助系统用户配置文件:', baseUser.id)
      return null
    }

    // 更新最后活跃时间
    await supabase
      .from('user_profiles')
      .update({ last_active_at: new Date().toISOString() })
      .eq('user_id', userProfile.user_id || userProfile.id)

    // 构建互助系统用户对象
    const mutualAidUser: MutualAidUser = {
      id: userProfile.user_id || userProfile.id,
      email: userProfile.email,
      username: userProfile.display_name,
      wallet_address: userProfile.wallet_address,
      display_name: userProfile.display_name,
      bio: userProfile.bio,
      reputation_score: userProfile.reputation_score || 0.0,
      verification_status: userProfile.verification_status || 'unverified',
      role: userProfile.role || 'user',
      is_active_validator: userProfile.is_active_validator || false,
      validation_accuracy: userProfile.validation_accuracy || 0.0,
      total_validations: userProfile.total_validations || 0,
      total_contributions: userProfile.total_contributions || 0.0,
      permissions: userProfile.permissions || [],
      is_active: userProfile.is_active !== false, // 默认true
      is_banned: userProfile.is_banned || false,
      auth_type: baseUser.auth_type,
      created_at: userProfile.created_at,
      updated_at: userProfile.updated_at,
      last_active_at: userProfile.last_active_at
    }

    return mutualAidUser

  } catch (error) {
    console.error('获取互助系统用户失败:', error)
    return null
  }
}

/**
 * 检查用户权限
 */
export async function checkUserPermission(
  request: NextRequest,
  permission: UserPermission,
  additionalChecks?: {
    minimumReputation?: number
    minimumValidations?: number
    requireVerification?: boolean
  }
): Promise<PermissionCheck> {
  try {
    const user = await getMutualAidUser(request)
    
    if (!user) {
      return {
        allowed: false,
        reason: '用户未认证'
      }
    }

    // 检查用户是否被禁用
    if (user.is_banned) {
      return {
        allowed: false,
        reason: '用户账户已被禁用',
        user
      }
    }

    // 检查用户是否激活
    if (!user.is_active) {
      return {
        allowed: false,
        reason: '用户账户未激活',
        user
      }
    }

    // 管理员拥有所有权限
    if (user.role === 'admin') {
      return {
        allowed: true,
        user
      }
    }

    // 根据权限类型检查
    switch (permission) {
      case 'submit_requests':
        // 所有激活用户都可以提交申请
        if (additionalChecks?.minimumReputation && user.reputation_score < additionalChecks.minimumReputation) {
          return {
            allowed: false,
            reason: `需要至少${additionalChecks.minimumReputation}分声誉积分`,
            user
          }
        }
        break

      case 'validate_requests':
        // 需要是验证者或达到一定声誉
        if (!user.is_active_validator && user.reputation_score < 1.0) {
          return {
            allowed: false,
            reason: '需要成为激活的验证者或达到1.0声誉积分',
            user
          }
        }
        
        if (additionalChecks?.minimumValidations && user.total_validations < additionalChecks.minimumValidations) {
          return {
            allowed: false,
            reason: `需要至少完成${additionalChecks.minimumValidations}次验证`,
            user
          }
        }
        break

      case 'moderate_content':
        if (!['moderator', 'admin'].includes(user.role)) {
          return {
            allowed: false,
            reason: '需要版主或管理员权限',
            user
          }
        }
        break

      case 'admin_access':
      case 'manage_users':
      case 'system_settings':
        if (user.role !== 'admin') {
          return {
            allowed: false,
            reason: '需要管理员权限',
            user
          }
        }
        break

      case 'view_analytics':
        if (!['moderator', 'admin'].includes(user.role) && user.reputation_score < 3.0) {
          return {
            allowed: false,
            reason: '需要版主权限或3.0以上声誉积分',
            user
          }
        }
        break

      default:
        return {
          allowed: false,
          reason: '未知的权限类型',
          user
        }
    }

    // 额外检查
    if (additionalChecks) {
      if (additionalChecks.requireVerification && user.verification_status === 'unverified') {
        return {
          allowed: false,
          reason: '需要完成身份验证',
          user
        }
      }
    }

    return {
      allowed: true,
      user
    }

  } catch (error) {
    console.error('权限检查失败:', error)
    return {
      allowed: false,
      reason: '权限检查过程中发生错误'
    }
  }
}

/**
 * 认证中间件装饰器
 */
export function withMutualAidAuth(
  handler: (request: NextRequest, user: MutualAidUser) => Promise<NextResponse>,
  options?: {
    requiredPermission?: UserPermission
    additionalChecks?: {
      minimumReputation?: number
      minimumValidations?: number
      requireVerification?: boolean
    }
  }
) {
  return async (request: NextRequest) => {
    try {
      // 基础认证检查
      const user = await getMutualAidUser(request)
      if (!user) {
        return NextResponse.json(
          { error: '需要认证才能访问此资源' },
          { status: 401 }
        )
      }

      // 权限检查
      if (options?.requiredPermission) {
        const permissionCheck = await checkUserPermission(
          request,
          options.requiredPermission,
          options.additionalChecks
        )

        if (!permissionCheck.allowed) {
          return NextResponse.json(
            { error: permissionCheck.reason },
            { status: 403 }
          )
        }
      }

      // 执行原处理函数
      return await handler(request, user)

    } catch (error) {
      console.error('认证中间件错误:', error)
      return NextResponse.json(
        { error: '认证过程中发生内部错误' },
        { status: 500 }
      )
    }
  }
}

/**
 * 计算用户请求限制
 */
export function getUserRequestLimits(user: MutualAidUser): {
  dailyRequestLimit: number
  monthlyRequestLimit: number
  maxRequestAmount: number
  validationRequiredThreshold: number
} {
  const baseConfig = {
    dailyRequestLimit: 1,
    monthlyRequestLimit: 3,
    maxRequestAmount: 100,
    validationRequiredThreshold: 50
  }

  // 根据用户角色和声誉调整限制
  if (user.role === 'admin') {
    return {
      dailyRequestLimit: -1, // 无限制
      monthlyRequestLimit: -1,
      maxRequestAmount: -1,
      validationRequiredThreshold: 0
    }
  }

  if (user.role === 'moderator') {
    return {
      dailyRequestLimit: 10,
      monthlyRequestLimit: 30,
      maxRequestAmount: 1000,
      validationRequiredThreshold: 100
    }
  }

  // 根据声誉积分调整
  const reputationMultiplier = Math.min(user.reputation_score / 5.0, 2.0)
  
  return {
    dailyRequestLimit: Math.ceil(baseConfig.dailyRequestLimit * (1 + reputationMultiplier)),
    monthlyRequestLimit: Math.ceil(baseConfig.monthlyRequestLimit * (1 + reputationMultiplier)),
    maxRequestAmount: Math.ceil(baseConfig.maxRequestAmount * (1 + reputationMultiplier)),
    validationRequiredThreshold: baseConfig.validationRequiredThreshold
  }
}

/**
 * 更新用户声誉积分
 */
export async function updateUserReputation(
  userId: string,
  reputationChange: number,
  reason: string
): Promise<boolean> {
  try {
    // 获取当前用户信息
    const { data: currentUser, error: fetchError } = await supabase
      .from('user_profiles')
      .select('reputation_score, total_validations')
      .eq('user_id', userId)
      .single()

    if (fetchError || !currentUser) {
      console.error('获取用户信息失败:', fetchError)
      return false
    }

    const newReputation = Math.max(0, Math.min(5.0, 
      (currentUser.reputation_score || 0) + reputationChange
    ))

    // 更新声誉积分
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        reputation_score: newReputation,
        updated_at: new Date().toISOString(),
        // 如果声誉达到1.0且总验证数大于5，自动激活验证者权限
        is_active_validator: newReputation >= 1.0 && currentUser.total_validations >= 5
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('更新用户声誉失败:', updateError)
      return false
    }

    console.log(`✅ 用户${userId}声誉更新: ${reputationChange > 0 ? '+' : ''}${reputationChange} (${reason})`)
    return true

  } catch (error) {
    console.error('更新用户声誉失败:', error)
    return false
  }
}

/**
 * 验证JWT令牌（用于API调用）
 */
export function verifyMutualAidJWT(token: string): any {
  try {
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error('JWT_SECRET未配置')
    }

    const payload = jwt.verify(token, jwtSecret, {
      algorithms: ['HS256'],
      issuer: 'astrozi',
      audience: 'mutual-aid-system'
    })

    return payload
  } catch (error) {
    console.error('JWT验证失败:', error)
    return null
  }
}