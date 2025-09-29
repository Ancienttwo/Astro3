/**
 * 客户端认证系统
 * 只能在浏览器端使用，不包含服务器端代码
 */

// 使用统一的Supabase客户端实例，避免多实例冲突
import { supabase, getSupabaseAdmin } from '@/lib/supabase'

/**
 * 客户端会话检查（组件中使用）
 * 标准模式：使用 supabase.auth.getSession()
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('获取会话失败:', error)
    return null
  }
  
  return session
}

/**
 * 客户端用户检查（组件中使用）
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('获取用户失败:', error)
    return null
  }
  
  return user
}

/**
 * 登出（客户端使用）- 支持Web2、Web3和自定义邮箱用户
 */
export async function signOut() {
  try {
    // 检查是否有自定义邮箱或Web3用户登录
    const currentUser = localStorage.getItem('current_user')
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser)
        
        if (userData && userData.auth_method === 'custom_email') {
          // 清除自定义邮箱用户相关数据
          localStorage.removeItem('current_user')
          localStorage.removeItem('custom_email_session')
          console.log('✅ 自定义邮箱用户登出成功')
          return
        }
        
        if (userData && userData.auth_method === 'web3auth') {
          // 清除Web3Auth用户相关数据
          localStorage.removeItem('current_user')
          localStorage.removeItem('web3_auth')
          localStorage.removeItem('web3_user')
          console.log('✅ Web3Auth用户登出成功')
          return
        }
        
        if (userData && userData.auth_method === 'web3_jwt') {
          // 清除Web3用户相关数据
          localStorage.removeItem('current_user')
          localStorage.removeItem('web3_auth')
          localStorage.removeItem('web3_user')
          console.log('✅ Web3用户登出成功')
          return
        }
        
        if (userData && userData.auth_method === 'walletconnect') {
          // 清除WalletConnect用户相关数据
          localStorage.removeItem('current_user')
          localStorage.removeItem('wallet_session')
          localStorage.removeItem('walletconnect_auth')
          console.log('✅ WalletConnect用户登出成功')
          return
        }
      } catch (e) {
        console.log('解析用户数据失败:', e)
      }
    }
    
    // Web2用户登出
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Web2用户登出失败:', error)
      throw error
    }
    
    // 清除可能残留的数据
    localStorage.removeItem('current_user')
    localStorage.removeItem('custom_email_session')
    localStorage.removeItem('web3_auth')
    localStorage.removeItem('web3_user')
    
    console.log('✅ Web2用户登出成功')
  } catch (error) {
    console.error('登出失败:', error)
    throw error
  }
}

/**
 * 检查用户是否为管理员（简化版）
 */
export function isAdmin(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
  return adminEmails.includes(email.toLowerCase())
}

// 统一用户接口（匹配实际数据库结构）
export interface UnifiedUser {
  id: string
  email: string
  wallet_address?: string
  username?: string
  user_type?: string // 添加用户类型属性
  auth_type?: string // 添加认证类型属性
  created_at: string
  updated_at: string
  access_token?: string // 添加access_token字段
}

// 管理员邮箱列表
const getAdminEmails = (): string[] => {
  const adminEmails = process.env.ADMIN_EMAILS
  if (!adminEmails) {
    // 管理页面已独立运作，不再需要警告
    return []
  }
  return adminEmails.split(',').map(email => normalizeEmail(email.trim())).filter(Boolean)
}

// 运营人员邮箱列表
const getOperatorEmails = (): string[] => {
  const operatorEmails = process.env.OPERATOR_EMAILS
  if (!operatorEmails) {
    console.log('ℹ️ 未设置OPERATOR_EMAILS环境变量')
    return []
  }
  return operatorEmails.split(',').map(email => normalizeEmail(email.trim())).filter(Boolean)
}

// 用户角色枚举
export type UserRole = 'admin' | 'operator' | 'user'

// 获取用户角色 - 基于实际用户权限验证
export async function getUserRole(request?: Request): Promise<UserRole> {
  try {
    // 获取当前认证用户
    const user = await getCurrentUnifiedUser(request)
    
    if (!user) {
      console.log('🔐 用户未认证，返回默认用户角色')
      return 'user'
    }
    
    // 检查是否为管理员
    const adminEmails = getAdminEmails()
    if (adminEmails.includes(user.email)) {
      console.log('🔐 验证管理员权限:', user.email)
      return 'admin'
    }
    
    // 检查是否为运营人员
    const operatorEmails = getOperatorEmails()
    if (operatorEmails.includes(user.email)) {
      console.log('🔐 验证运营人员权限:', user.email)
      return 'operator'
    }
    
    // 默认返回普通用户权限
    console.log('🔐 普通用户权限:', user.email)
    return 'user'
  } catch (error) {
    console.error('获取用户角色失败:', error)
    return 'user' // 安全默认：返回最低权限
  }
}

// 检查用户是否为运营人员或管理员
export async function isUserOperatorOrAdmin(request?: Request): Promise<boolean> {
  try {
    const role = await getUserRole(request)
    return role === 'admin' || role === 'operator'
  } catch (error) {
    console.error('检查运营权限失败:', error)
    return false
  }
}

// 邮箱格式验证
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 邮箱标准化函数（转换为小写）
const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase()
}

// 获取或创建统一用户（简化版本）
export async function getOrCreateUserByEmail(
  email: string, 
  provider: 'supabase' | 'web3',
  externalId: string,
  username?: string
): Promise<UnifiedUser> {
  // 标准化邮箱地址
  const normalizedEmail = normalizeEmail(email)
  
  try {
    if (!isValidEmail(normalizedEmail)) {
      throw new Error('邮箱格式不正确')
    }

    console.log('🔍 查找用户:', normalizedEmail, '(原始:', email, ')')

    // 1. 获取当前认证用户的上下文
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser) {
      console.log('⚠️ 没有认证用户上下文')
      throw new Error('需要先完成认证才能创建用户记录')
    } else {
      console.log('✅ 有认证用户上下文:', authUser.id, authUser.email)
    }

    // 2. 先尝试查询用户（有了认证上下文应该能查询）
    console.log('🔍 尝试查询现有用户（有认证上下文）...')
    const { data: existingUser, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .single()

    if (existingUser && !queryError) {
      console.log('✅ 找到现有用户:', existingUser.email)
      return existingUser
    }

    console.log('👤 用户不存在，开始创建:', queryError?.code)

    // 3. 创建新用户
    const newUser = {
      id: authUser.id, // 使用Supabase Auth的用户ID
      email: normalizedEmail,
      username: username || `用户${Date.now().toString().slice(-6)}`
    }

    console.log('📝 准备插入用户数据:', newUser)

    const { data: createdUser, error: createError } = await supabase
      .from('users')
      .insert(newUser)
      .select()
      .single()

    if (createError) {
      console.error('❌ 用户创建失败:', createError)
      console.error('❌ 错误详情:', {
        code: createError.code,
        message: createError.message,
        details: createError.details,
        hint: createError.hint
      })
      
      // 如果是主键冲突错误（用户ID已存在）
      if (createError.code === '23505' && createError.message?.includes('users_pkey')) {
        console.log('🔄 检测到用户ID冲突，查找现有用户...')
        
        // 查询是否有相同ID的用户
        const { data: existingUserById, error: queryByIdError } = await supabase
          .from('users')
          .select('*')
          .eq('id', externalId)
          .single()
          
        if (existingUserById && !queryByIdError) {
          console.log('✅ 找到相同ID的现有用户:', existingUserById.email)
          return existingUserById
        }
        
        // 如果没有找到相同ID的用户，可能是邮箱重复，查找相同邮箱的用户
        const { data: existingUserByEmail, error: queryByEmailError } = await supabase
          .from('users')
          .select('*')
          .eq('email', normalizedEmail)
          .single()
          
        if (existingUserByEmail && !queryByEmailError) {
          console.log('🔄 找到相同邮箱的现有用户，更新ID:', existingUserByEmail.email, '旧ID:', existingUserByEmail.id, '新ID:', externalId)
          
          // 删除旧记录
          const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', existingUserByEmail.id)
          
          if (deleteError) {
            console.error('❌ 删除旧用户记录失败:', deleteError)
            return existingUserByEmail // 返回现有用户
          }
          
          // 重新创建用户记录，使用新的ID
          const { data: newCreatedUser, error: newCreateError } = await supabase
            .from('users')
            .insert({
              id: externalId,
              email: normalizedEmail,
              username: username || existingUserByEmail.username || `用户${Date.now().toString().slice(-6)}`
            })
            .select()
            .single()
          
          if (newCreateError) {
            console.error('❌ 重新创建用户失败:', newCreateError)
            // 如果重新创建失败，尝试恢复旧记录
            await supabase
              .from('users')
              .insert(existingUserByEmail)
            return existingUserByEmail
          }
          
          console.log('✅ 用户ID更新成功:', newCreatedUser.email)
          return newCreatedUser
        }
        
        console.error('❌ 未找到冲突的用户记录')
        throw new Error('用户ID冲突但无法找到冲突记录')
      }
      
      // 如果是邮箱重复错误
      if (createError.code === '23505' && createError.message?.includes('users_email_key')) {
        console.log('🔄 检测到重复邮箱，统一用户ID...')
        
        // 查询现有用户
        const { data: existingUser, error: queryError } = await supabase
          .from('users')
          .select('*')
          .eq('email', normalizedEmail)
          .single()
          
        if (existingUser && !queryError) {
          console.log('🔄 找到现有用户，统一ID:', existingUser.email, '旧ID:', existingUser.id, '新ID:', externalId)
          
          // 🔑 关键修复：更新用户ID为新的认证ID，确保一致性
          const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({
              id: externalId, // 使用新的认证ID
              username: username || existingUser.username,
              updated_at: new Date().toISOString()
            })
            .eq('email', normalizedEmail)
            .select()
            .single()
          
          if (updateError) {
            console.error('❌ 统一用户ID失败:', updateError)
            // 如果更新失败，返回现有用户（保持兼容性）
            return existingUser
          }
          
          console.log('✅ 用户ID统一成功:', updatedUser.email)
          return updatedUser
        } else {
          console.error('❌ 重新查询用户也失败:', queryError)
          throw new Error(`用户已存在但无法查询: ${queryError?.message}`)
        }
      }
      
      // 如果是RLS错误，说明没有权限
      if (createError.code === '42501') {
        console.log('🔒 检测到RLS权限错误，尝试其他方案...')
        throw new Error('数据库权限不足，请联系管理员')
      }
      
      throw createError
    }
    
    console.log('✅ 用户创建成功:', createdUser.email)
    return createdUser

  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || '未知错误'
    const errorCode = error?.code || 'UNKNOWN'
    const errorDetails = {
      message: errorMessage,
      code: errorCode,
      details: error?.details || null,
      hint: error?.hint || null,
      email: normalizedEmail,
      originalEmail: email,
      provider: provider,
      externalId: externalId,
      username: username,
      fullError: JSON.stringify(error, null, 2)
    }
    
    console.error('获取或创建用户失败:', errorDetails)
    throw new Error(`用户操作失败: ${errorMessage}`)
  }
}

// Supabase邮箱注册（改为使用自定义API，绕过邮箱确认）
export async function signUpWithEmail(email: string, password: string, registrationCode?: string): Promise<UnifiedUser> {
  try {
    // 标准化邮箱地址
    const normalizedEmail = normalizeEmail(email)
    
    // 验证注册码（如果提供）
    if (registrationCode) {
      try {
        const response = await fetch('/api/verify-registration-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: registrationCode })
        })
        
        const result = await response.json()
        
        if (!response.ok || !result.valid) {
          throw new Error(result.message || '注册码无效或已过期')
        }
        
        console.log('注册码验证成功，继续邮箱注册')
      } catch (error) {
        console.error('注册码验证失败:', error)
        throw new Error(error instanceof Error ? error.message : '注册码验证失败')
      }
    } else {
      throw new Error('邮箱注册需要有效的注册码')
    }
    
    // 1. 使用自定义API注册（绕过邮箱确认步骤）
    const response = await fetch('/api/custom-email-signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: normalizedEmail,
        password,
        registrationCode
      })
    })
    
    const authData = await response.json()
    
    if (!response.ok) {
      const errorMessage = authData.error || '注册失败'
      console.error('自定义邮箱注册错误:', authData)
      
      // 处理常见错误类型
      if (errorMessage.includes('该邮箱已注册')) {
        throw new Error('该邮箱已注册，请直接登录')
      } else if (errorMessage.includes('注册码无效')) {
        throw new Error('注册码无效或已过期')
      } else if (errorMessage.includes('密码')) {
        throw new Error('密码至少需要6个字符')
      } else {
        throw new Error(errorMessage)
      }
    }
    
    if (!authData.user) {
      throw new Error('注册失败：未返回用户信息')
    }

    // 2. 返回创建的用户（注册码已在自定义API中处理）
    console.log('✅ 自定义邮箱注册成功:', authData.user.email)
    
    return {
      id: authData.user.id,
      email: authData.user.email,
      username: authData.user.username,
      user_type: 'email',
      auth_type: 'email',
      created_at: authData.user.created_at,
      updated_at: authData.user.updated_at
    }
  } catch (error: any) {
    console.error('邮箱注册失败:', error)
    throw error
  }
}

// 发送重置密码邮件
export async function resetPassword(email: string): Promise<void> {
  try {
    // 标准化邮箱地址
    const normalizedEmail = normalizeEmail(email)
    
    if (!isValidEmail(normalizedEmail)) {
      throw new Error('请输入有效的邮箱地址')
    }

    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3007'}/auth/callback?type=recovery`,
    })

    if (error) {
      if (error.message.includes('User not found') || error.message.includes('Invalid email')) {
        throw new Error('该邮箱未注册，请先注册账户')
      } else {
        throw error
      }
    }
  } catch (error: any) {
    console.error('重置密码失败:', error)
    throw error
  }
}

// 检查邮箱是否已注册（简化版本）
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    // 标准化邮箱地址
    const normalizedEmail = normalizeEmail(email)
    
    if (!isValidEmail(normalizedEmail)) {
      return false
    }

    // 由于Supabase的安全策略，无法准确检测邮箱是否存在
    // 我们返回false，让用户尝试注册，如果邮箱已存在会在注册时得到明确错误
    console.log('邮箱检查（安全模式）:', normalizedEmail)
    return false
  } catch (error) {
    console.error('检查邮箱存在性失败:', error)
    return false
  }
}

// 自定义邮箱登录（绕过Supabase Auth）
export async function signInWithEmail(email: string, password: string): Promise<UnifiedUser> {
  try {
    // 标准化邮箱地址
    const normalizedEmail = normalizeEmail(email)
    
    // 1. 首先尝试自定义邮箱登录
    try {
      const response = await fetch('/api/custom-email-signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password
        })
      })
      
      if (response.ok) {
        const authData = await response.json()
        console.log('✅ 自定义邮箱登录成功:', authData.user.email)
        
        // 保存自定义会话到localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('custom_email_session', JSON.stringify(authData.session))
          localStorage.setItem('current_user', JSON.stringify({
            ...authData.user,
            auth_method: 'custom_email'
          }))
        }
        
        return {
          id: authData.user.id,
          email: authData.user.email,
          username: authData.user.username,
          user_type: 'email',
          auth_type: 'custom_email',
          created_at: authData.user.created_at,
          updated_at: authData.user.updated_at
        }
      }
    } catch (customError) {
      console.log('自定义邮箱登录失败，尝试Supabase登录:', customError)
    }
    
    // 2. 如果自定义登录失败，回退到Supabase登录
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('登录失败')

    // 3. 获取或创建统一用户记录
    const unifiedUser = await getOrCreateUserByEmail(
      normalizedEmail,
      'supabase',
      authData.user.id
    )

    return unifiedUser
  } catch (error) {
    console.error('邮箱登录失败:', error)
    throw error
  }
}

// Google登录
export async function signInWithGoogle(callbackUrl?: string): Promise<void> {
  try {
    // 构建重定向URL，优先使用回调URL
    const redirectUrl = callbackUrl || '/home';
    const fullRedirectUrl = `${window.location.origin}${redirectUrl}`;
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: fullRedirectUrl
      }
    })

    if (error) {
      console.error('Google登录失败:', error)
      throw error
    }

    // OAuth登录会自动重定向，不需要返回数据
  } catch (error) {
    console.error('Google登录失败:', error)
    throw error
  }
}

// 处理OAuth回调
export async function handleOAuthCallback(): Promise<UnifiedUser | null> {
  try {
    // 获取当前session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('获取session失败:', error)
      throw error
    }

    if (!session || !session.user) {
      throw new Error('未找到有效的认证会话')
    }

    const user = session.user
    console.log('OAuth用户信息:', user)

    // 创建或获取统一用户记录
    const unifiedUser = await getOrCreateUserByEmail(
      user.email || '',
      'supabase',
      user.id,
      user.user_metadata?.full_name || user.user_metadata?.name
    )

    return unifiedUser
  } catch (error) {
    console.error('OAuth回调处理失败:', error)
    throw error
  }
}

// 获取当前统一用户（支持服务器端和客户端）
export async function getCurrentUnifiedUser(request?: Request): Promise<UnifiedUser | null> {
  try {
    // 服务器端：从request中提取认证信息
    if (typeof window === 'undefined' && request) {
      console.log('🔍 服务器端模式，解析认证信息...')
      
      // 检查Authorization Bearer token / 以及简化的Web3头
      const authHeader = request.headers.get('Authorization')
      const web3Header = request.headers.get('X-Web3-Auth')
      const xWalletHeader = request.headers.get('X-Wallet-Address')
      console.log('🔍 服务器端检查认证headers:', {
        hasAuthorizationHeader: !!authHeader,
        hasWeb3Header: !!web3Header,
        hasXWalletHeader: !!xWalletHeader
      })
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // 1) 简化Web3头（X-Wallet-Address）
        if (xWalletHeader && /^0x[0-9a-fA-F]{40}$/.test(xWalletHeader)) {
          try {
            const admin = getSupabaseAdmin()
            const wallet = xWalletHeader.toLowerCase()
            const { data: web3User } = await admin
              .from('users')
              .select('*')
              .eq('wallet_address', wallet)
              .in('auth_type', ['web3', 'walletconnect', 'web3auth'])
              .single()
            if (web3User) {
              return web3User
            }
          } catch (e) {
            console.log('❌ X-Wallet-Address解析失败:', e)
          }
        }

        // 2) 兼容旧的X-Web3-Auth JSON头
        if (web3Header) {
          try {
            const payload = JSON.parse(web3Header)
            const wallet = (payload.wallet_address || '').toLowerCase()
            if (!wallet) {
              console.log('❌ X-Web3-Auth缺少wallet_address')
              return null
            }
            const admin = getSupabaseAdmin()
            const { data: web3User, error: web3Error } = await admin
              .from('users')
              .select('*')
              .eq('wallet_address', wallet)
              .in('auth_type', ['web3', 'walletconnect', 'web3auth'])
              .single()
            if (web3Error || !web3User) {
              console.log('❌ X-Web3-Auth查无此Web3用户:', web3Error?.message)
              return null
            }
            return web3User
          } catch (e) {
            console.log('❌ 解析X-Web3-Auth失败:', e)
            return null
          }
        }
        console.log('❌ 缺少Authorization Bearer token')
        return null
      }
      
      const token = authHeader.substring(7) // 移除 "Bearer " 前缀
      console.log('🔍 提取到token:', token.substring(0, 20) + '...')
      
      // 如果不是有效JWT：兼容“Bearer 钱包地址”
      if (/^0x[0-9a-fA-F]{40}$/.test(token)) {
        try {
          const admin = getSupabaseAdmin()
          const wallet = token.toLowerCase()
          const { data: web3User } = await admin
            .from('users')
            .select('*')
            .eq('wallet_address', wallet)
            .in('auth_type', ['web3', 'walletconnect', 'web3auth'])
            .single()
          if (web3User) {
            return web3User
          }
        } catch (e) {
          console.log('❌ Bearer钱包地址认证失败:', e)
        }
      }

      // 如果不是自定义JWT，尝试Supabase认证 (Web2 或 Web3 通过 Supabase session)
      try {
        const { data, error } = await supabase.auth.getUser(token)
        if (error || !data.user) {
          console.log('❌ Supabase token验证失败:', error?.message)
          return null
        }
        
        const user = data.user

        // 服务器端后端操作需要使用管理员客户端避免RLS限制
        const admin = getSupabaseAdmin()

        // 标识是否为Web3虚拟邮箱（多种历史格式兼容）
        const email = user.email || ''
        const isWeb3Email = email.endsWith('@web3.local') ||
                            email.endsWith('@web3.astrozi.app') ||
                            email.endsWith('@astrozi.ai') ||
                            email.endsWith('@web3.wallet')

        // 优先按用户ID查找（避免仅凭邮箱导致的类型误判）
        let { data: unifiedUser, error: dbError } = await admin
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (dbError && dbError.code !== 'PGRST116') {
          // 非“未找到”错误，直接记录并返回null
          console.log('❌ 查询统一用户失败:', dbError)
          return null
        }

        if (!unifiedUser) {
          // 未找到用户记录，创建之（根据类型填充必要字段）
          const now = new Date().toISOString()
          const newRecord: any = {
            id: user.id,
            email: email ? normalizeEmail(email) : undefined,
            username: (user.user_metadata?.full_name || user.user_metadata?.name || undefined),
            created_at: now,
            updated_at: now
          }

          if (isWeb3Email || user.user_metadata?.wallet_address) {
            newRecord.auth_type = 'web3'
            newRecord.wallet_address = (user.user_metadata?.wallet_address || '').toLowerCase()
          } else {
            newRecord.auth_type = 'web2'
          }

          const { data: created, error: createError } = await admin
            .from('users')
            .insert(newRecord)
            .select('*')
            .single()

          if (createError) {
            console.error('❌ 创建统一用户失败:', createError)
            return null
          }

          unifiedUser = created
        }

        return unifiedUser
      } catch (error) {
        console.log('❌ Supabase认证失败:', error)
        return null
      }
    
    } else if (typeof window !== 'undefined') {
      // 客户端：分别处理Web2、Web3和自定义邮箱认证
      
      // 首先检查是否有自定义邮箱用户登录
      const customEmailSession = localStorage.getItem('custom_email_session')
      const currentUser = localStorage.getItem('current_user')
      
      if (customEmailSession && currentUser) {
        try {
          const sessionData = JSON.parse(customEmailSession)
          const userData = JSON.parse(currentUser)
          
          if (userData && userData.auth_method === 'custom_email') {
            console.log('🔍 检测到自定义邮箱用户:', userData.email)
            
            // 检查会话是否过期
            if (sessionData.expires_at && sessionData.expires_at * 1000 > Date.now()) {
              return {
                id: userData.id,
                email: userData.email,
                username: userData.username,
                user_type: 'email',
                auth_type: 'custom_email',
                created_at: userData.created_at,
                updated_at: userData.updated_at
              }
            } else {
              // 会话过期，清理
              localStorage.removeItem('custom_email_session')
              localStorage.removeItem('current_user')
            }
          }
        } catch (e) {
          console.log('解析自定义邮箱用户数据失败:', e)
        }
      }
      
      // 然后检查是否有Web3用户登录（包括Web3Auth和传统Web3）
      if (currentUser) {
        try {
          const walletUserData = JSON.parse(currentUser)
          
          // 检查Web3Auth用户
          if (walletUserData && walletUserData.auth_method === 'web3auth' && walletUserData.wallet_address) {
            console.log('🔍 检测到Web3Auth用户:', walletUserData.wallet_address)
            
            return {
              id: walletUserData.id || walletUserData.wallet_address,
              email: walletUserData.email,
              username: walletUserData.username || `Web3User${walletUserData.wallet_address?.slice(-6) || ''}`,
              wallet_address: walletUserData.wallet_address,
              auth_type: 'web3auth',
              created_at: walletUserData.created_at || new Date().toISOString(),
              updated_at: walletUserData.updated_at || new Date().toISOString()
            }
          }
          
          // 检查传统Web3 JWT用户
          if (walletUserData && walletUserData.auth_method === 'web3_jwt' && walletUserData.wallet_address) {
            console.log('🔍 检测到Web3钱包用户:', walletUserData.wallet_address)
            
            // 返回Web3用户数据
            return {
              id: walletUserData.id,
              email: walletUserData.email,
              username: walletUserData.username || `Web3User${walletUserData.wallet_address?.slice(-6) || ''}`,
              wallet_address: walletUserData.wallet_address,
              auth_type: 'web3',
              created_at: walletUserData.created_at || new Date().toISOString(),
              updated_at: walletUserData.updated_at || new Date().toISOString()
            }
          }
          
          // 检查WalletConnect用户
          if (walletUserData && walletUserData.auth_method === 'walletconnect' && walletUserData.wallet_address) {
            console.log('🔍 检测到WalletConnect用户:', walletUserData.wallet_address)
            
            // 返回WalletConnect用户数据
            return {
              id: walletUserData.id || walletUserData.wallet_address,
              email: walletUserData.email,
              username: walletUserData.username || `Web3User${walletUserData.wallet_address?.slice(-6) || ''}`,
              wallet_address: walletUserData.wallet_address,
              auth_type: 'walletconnect',
              created_at: walletUserData.created_at || new Date().toISOString(),
              updated_at: walletUserData.updated_at || new Date().toISOString()
            }
          }
        } catch (e) {
          console.log('解析Web3用户数据失败:', e)
        }
      }
      
      // 检查Supabase Web2认证
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user || !data.user.email) {
        return null
      }
      
      // 确保用户邮箱不是Web3虚拟邮箱
      if (
        data.user.email.endsWith('@web3.local') || 
        data.user.email.endsWith('@web3.astrozi.app') || 
        data.user.email.endsWith('@astrozi.ai') ||
        data.user.email.endsWith('@web3.wallet')
      ) {
        console.log('🔍 检测到Web3虚拟邮箱，跳过Web2处理')
        return null
      }
      
      // 查找Web2用户
      const normalizedEmail = normalizeEmail(data.user.email)
      const { data: unifiedUser, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('email', normalizedEmail)
        .neq('auth_type', 'web3') // 排除Web3用户
        .single()

      if (dbError || !unifiedUser) {
        // 创建Web2用户
        return await getOrCreateUserByEmail(
          normalizedEmail,
          'supabase',
          data.user.id
        )
      }

      return unifiedUser
    }
    
    return null
  } catch (error) {
    console.error('获取当前用户失败:', error)
    return null
  }
}

// 检查用户是否为管理员
export async function isUserAdmin(request?: Request): Promise<boolean> {
  try {
    const unifiedUser = await getCurrentUnifiedUser(request)
    
    if (!unifiedUser) {
      return false
    }

    // 检查用户邮箱是否在管理员列表中
    const adminEmails = getAdminEmails()
    const isAdmin = adminEmails.includes(unifiedUser.email)
    
    return isAdmin
  } catch (error) {
    console.error('检查管理员权限失败:', error)
    return false
  }
}

// 检查用户是否已登录
export async function isUserAuthenticated(): Promise<boolean> {
  try {
    const user = await getCurrentUnifiedUser()
    return !!user
  } catch (error) {
    console.error('检查用户登录状态失败:', error)
    return false
  }
} 
