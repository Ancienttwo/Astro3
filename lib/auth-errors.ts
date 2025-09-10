import { NextResponse } from 'next/server'

export enum AuthErrorCode {
  // 通用错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  
  // Web3特定错误
  WALLET_ADDRESS_INVALID = 'WALLET_ADDRESS_INVALID',
  WALLET_ADDRESS_MALICIOUS = 'WALLET_ADDRESS_MALICIOUS',
  SIGNATURE_INVALID = 'SIGNATURE_INVALID',
  SIGNATURE_EXPIRED = 'SIGNATURE_EXPIRED',
  NONCE_INVALID = 'NONCE_INVALID',
  
  // 会话错误
  SESSION_CREATION_FAILED = 'SESSION_CREATION_FAILED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // 速率限制
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // 用户相关
  USER_CREATION_FAILED = 'USER_CREATION_FAILED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  
  // 服务器错误
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

interface AuthError {
  code: AuthErrorCode
  message: string
  userMessage: string // 面向用户的友好消息
  statusCode: number
  details?: any
}

const ERROR_DEFINITIONS: Record<AuthErrorCode, Omit<AuthError, 'details'>> = {
  [AuthErrorCode.UNKNOWN_ERROR]: {
    code: AuthErrorCode.UNKNOWN_ERROR,
    message: 'An unknown error occurred',
    userMessage: '发生了未知错误，请稍后重试',
    statusCode: 500
  },
  [AuthErrorCode.INVALID_REQUEST]: {
    code: AuthErrorCode.INVALID_REQUEST,
    message: 'Invalid request parameters',
    userMessage: '请求参数无效',
    statusCode: 400
  },
  [AuthErrorCode.WALLET_ADDRESS_INVALID]: {
    code: AuthErrorCode.WALLET_ADDRESS_INVALID,
    message: 'Invalid wallet address format',
    userMessage: '钱包地址格式无效',
    statusCode: 400
  },
  [AuthErrorCode.WALLET_ADDRESS_MALICIOUS]: {
    code: AuthErrorCode.WALLET_ADDRESS_MALICIOUS,
    message: 'Malicious wallet address detected',
    userMessage: '检测到恶意钱包地址',
    statusCode: 403
  },
  [AuthErrorCode.SIGNATURE_INVALID]: {
    code: AuthErrorCode.SIGNATURE_INVALID,
    message: 'Invalid signature',
    userMessage: '签名验证失败',
    statusCode: 401
  },
  [AuthErrorCode.SIGNATURE_EXPIRED]: {
    code: AuthErrorCode.SIGNATURE_EXPIRED,
    message: 'Signature has expired',
    userMessage: '签名已过期，请重新登录',
    statusCode: 401
  },
  [AuthErrorCode.NONCE_INVALID]: {
    code: AuthErrorCode.NONCE_INVALID,
    message: 'Invalid or expired nonce',
    userMessage: '验证码无效或已过期',
    statusCode: 401
  },
  [AuthErrorCode.SESSION_CREATION_FAILED]: {
    code: AuthErrorCode.SESSION_CREATION_FAILED,
    message: 'Failed to create user session',
    userMessage: '创建会话失败',
    statusCode: 500
  },
  [AuthErrorCode.SESSION_EXPIRED]: {
    code: AuthErrorCode.SESSION_EXPIRED,
    message: 'User session has expired',
    userMessage: '会话已过期，请重新登录',
    statusCode: 401
  },
  [AuthErrorCode.RATE_LIMIT_EXCEEDED]: {
    code: AuthErrorCode.RATE_LIMIT_EXCEEDED,
    message: 'Rate limit exceeded',
    userMessage: '请求过于频繁，请稍后重试',
    statusCode: 429
  },
  [AuthErrorCode.USER_CREATION_FAILED]: {
    code: AuthErrorCode.USER_CREATION_FAILED,
    message: 'Failed to create user account',
    userMessage: '创建用户账户失败',
    statusCode: 500
  },
  [AuthErrorCode.USER_NOT_FOUND]: {
    code: AuthErrorCode.USER_NOT_FOUND,
    message: 'User not found',
    userMessage: '用户不存在',
    statusCode: 404
  },
  [AuthErrorCode.DATABASE_ERROR]: {
    code: AuthErrorCode.DATABASE_ERROR,
    message: 'Database operation failed',
    userMessage: '数据库操作失败',
    statusCode: 500
  },
  [AuthErrorCode.INTERNAL_SERVER_ERROR]: {
    code: AuthErrorCode.INTERNAL_SERVER_ERROR,
    message: 'Internal server error',
    userMessage: '服务器内部错误',
    statusCode: 500
  }
}

export function createAuthError(
  code: AuthErrorCode, 
  details?: any,
  customMessage?: string
): AuthError {
  const definition = ERROR_DEFINITIONS[code]
  return {
    ...definition,
    message: customMessage || definition.message,
    details
  }
}

export function createAuthErrorResponse(
  code: AuthErrorCode, 
  details?: any,
  customMessage?: string,
  includeDetails = false
): NextResponse {
  const error = createAuthError(code, details, customMessage)
  
  const responseBody: any = {
    success: false,
    error: error.userMessage,
    code: error.code,
    timestamp: new Date().toISOString()
  }
  
  // 在开发环境中包含详细错误信息
  if (includeDetails && (process.env.NODE_ENV === 'development' || process.env.INCLUDE_ERROR_DETAILS === 'true')) {
    responseBody.details = error.details
    responseBody.message = error.message
  }
  
  // 对于速率限制错误，添加重试信息
  if (code === AuthErrorCode.RATE_LIMIT_EXCEEDED && details?.blockUntil) {
    responseBody.retryAfter = Math.ceil((details.blockUntil - Date.now()) / 1000)
  }
  
  return NextResponse.json(responseBody, { status: error.statusCode })
}

export function logAuthError(
  error: AuthError,
  context: {
    ip?: string
    userAgent?: string
    walletAddress?: string
    userId?: string
    endpoint?: string
  } = {}
) {
  const logData = {
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    category: 'AUTH',
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
    context,
    details: error.details
  }
  
  // 在生产环境中，这里应该发送到日志服务
  if (process.env.NODE_ENV === 'production') {
    // TODO: 发送到日志聚合服务 (如 Sentry, LogRocket 等)
    console.error('🔐 Auth Error:', JSON.stringify(logData, null, 2))
  } else {
    console.error('🔐 Auth Error:', logData)
  }
  
  // 对于严重错误，发送告警
  if (error.statusCode >= 500) {
    // TODO: 发送告警通知
    console.error('🚨 Critical Auth Error - Alert Required:', logData)
  }
}