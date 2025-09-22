import * as jwt from 'jsonwebtoken'
import { getSupabaseAdminClient } from '@/lib/server/db'

// 安全的JWT实现 - 使用标准jsonwebtoken库
function secureJWTSign(payload: any, secret: string, expiresIn: string = '24h'): string {
  if (!secret || secret.length < 32) {
    throw new Error('JWT secret must be at least 32 characters long')
  }
  
  return jwt.sign(
    {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      iss: 'astrozi',
      aud: 'astrozi-users'
    },
    secret,
    {
      algorithm: 'HS256',
      expiresIn
    }
  )
}

function secureJWTVerify(token: string, secret: string): any | null {
  try {
    if (!secret || secret.length < 32) {
      throw new Error('JWT secret must be at least 32 characters long')
    }
    
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
      issuer: 'astrozi',
      audience: 'astrozi-users',
      clockTolerance: 60 // 允许60秒时钟偏差
    })
    
    return decoded
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

// 使用管理员权限的Supabase客户端
const supabaseAdmin = getSupabaseAdminClient()

export interface JWTPayload {
  userId: string
  walletAddress?: string
  email: string
  authType: 'web3' | 'email' | 'google'
  iat: number
  exp: number
}

export function createJWTToken(
  userId: string,
  email: string,
  authType: 'web3' | 'email' | 'google',
  walletAddress?: string,
  expiresIn: string = '24h'
): string {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId,
    email,
    authType,
    walletAddress
  }
  
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long for security')
  }
  
  return secureJWTSign(payload, process.env.JWT_SECRET, expiresIn)
}

export function verifyJWTToken(token: string): JWTPayload | null {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required')
    }
    
    if (process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long for security')
    }
    
    const decoded = secureJWTVerify(token, process.env.JWT_SECRET!)
    
    if (!decoded) {
      return null
    }
    
    return decoded as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

export async function createSupabaseSession(
  userId: string,
  email: string,
  _authType: 'web3' | 'email' | 'google'
): Promise<{ access_token: string; refresh_token: string | null } | null> {
  try {
    // 为Web3用户创建临时密码并登录
    const tempPassword = 'temp-' + Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15)
    
    // 更新用户密码
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: tempPassword
    })
    
    if (updateError) {
      console.warn('Failed to update user password:', updateError.message)
      // 对于Web3用户，可能没有密码，这是正常的
    }
    
    // 使用密码登录获取session
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password: tempPassword
    })
    
    if (signInError || !signInData.session) {
      console.error('Failed to create Supabase session:', signInError)
      return null
    }
    
    // 验证session属于正确的用户
    const { data: verifyData, error: verifyError } = await supabaseAdmin.auth.getUser(
      signInData.session.access_token
    )
    
    if (verifyError || verifyData.user?.id !== userId) {
      console.error('Session verification failed')
      return null
    }
    
    return {
      access_token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token || null
    }
    
  } catch (error) {
    console.error('Error creating Supabase session:', error)
    return null
  }
}

export function createWeb3FallbackAuth(user: any): {
  user: any
  authToken: string
  authMethod: 'web3_jwt'
} {
  // 创建JWT token作为认证凭证
  const authToken = createJWTToken(
    user.id,
    user.email,
    'web3',
    user.wallet_address
  )
  
  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      wallet_address: user.wallet_address,
      auth_type: user.auth_type,
      created_at: user.created_at
    },
    authToken,
    authMethod: 'web3_jwt'
  }
}
