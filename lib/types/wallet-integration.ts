/**
 * WalletConnect-Supabase集成的基础类型定义
 * 
 * 这个文件定义了所有必要的接口和类型，确保类型安全
 */

// 统一的Web3用户接口
export interface UnifiedWeb3User {
  id: string
  email: string
  username: string
  wallet_address: string
  auth_type: 'web3'
  auth_provider: 'walletconnect'
  display_name: string
  created_at: string
  updated_at: string
}

// Web3认证结果
export interface Web3AuthResult {
  user: UnifiedWeb3User
  customJWT: string
  supabaseJWT: string
  expiresAt: number
  success: boolean
}

// 双JWT tokens结构
export interface DualJWTTokens {
  customJWT: string      // 用于API认证和自定义逻辑
  supabaseJWT: string    // 用于Supabase RLS和数据库访问
  expiresAt: number
  issuedAt: number
}

// 钱包签名验证参数
export interface WalletSignatureParams {
  signature: string
  message: string
  walletAddress: string
}

// Web3用户创建参数
export interface CreateWeb3UserParams {
  wallet_address: string
  email?: string
  username?: string
  display_name?: string
}

// localStorage存储的认证数据结构
export interface StoredAuthData {
  current_user: {
    id: string
    email: string
    username: string
    wallet_address: string
    auth_method: 'walletconnect'
    display_name: string
  }
  walletconnect_auth: {
    auth_token: string
    wallet_address: string
    auth_method: 'walletconnect'
    expires_at: number
  }
  wallet_session: {
    address: string
    timestamp: number
    auth_method: 'walletconnect'
  }
}

// JWT Payload接口
export interface CustomJWTPayload {
  userId: string
  walletAddress: string
  authType: 'walletconnect'
  email: string
  iss: string
  aud: string
  iat: number
  exp: number
}

export interface SupabaseJWTPayload {
  sub: string              // 用户ID
  aud: 'authenticated'     // Supabase audience
  role: 'authenticated'    // Supabase role
  iss: string             // Supabase URL
  iat: number
  exp: number
  app_metadata: {
    provider: 'walletconnect'
    wallet_address: string
    auth_type: 'web3'
  }
  user_metadata: {
    wallet_address: string
    auth_type: 'web3'
    display_name: string
    email: string
  }
}

// 错误类型
export class WalletIntegrationError extends Error {
  constructor(
    message: string,
    public code: 'SIGNATURE_INVALID' | 'USER_CREATE_FAILED' | 'JWT_GENERATION_FAILED' | 'SESSION_SET_FAILED',
    public details?: any
  ) {
    super(message)
    this.name = 'WalletIntegrationError'
  }
}

// 配置接口
export interface WalletIntegrationConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  supabaseServiceKey: string
  jwtSecret: string
  supabaseJwtSecret: string
  tokenExpiryHours: number
}