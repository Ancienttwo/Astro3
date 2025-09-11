import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { checkRateLimitRedis } from '@/lib/rate-limit-redis'
import { recordFailedAttempt } from '@/lib/rate-limit'
import { validateAddressSecurity } from '@/lib/address-validation'
import { createAuthErrorResponse, AuthErrorCode, logAuthError, createAuthError } from '@/lib/auth-errors'

// 使用管理员权限的Supabase客户端
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Web3InitRequest {
  walletAddress: string
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
            request.headers.get('x-real-ip') || 
            'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  try {
    // 1. 速率限制检查
    const rateLimitResult = await checkRateLimitRedis(request as any, {
      maxAttempts: 10, // Web3初始化允许更多尝试
      windowMs: 15 * 60 * 1000, // 15分钟
      blockDurationMs: 30 * 60 * 1000, // 30分钟封禁
      bucket: 'auth_web3_init'
    })
    
    if (!rateLimitResult.allowed) {
      recordFailedAttempt(ip, 'Rate limit exceeded')
      return createAuthErrorResponse(
        AuthErrorCode.RATE_LIMIT_EXCEEDED,
        { 
          blockUntil: rateLimitResult.blockUntil,
          remainingAttempts: 0
        }
      )
    }
    
    // 2. 解析请求体
    let requestBody: Web3InitRequest
    try {
      requestBody = await request.json()
    } catch (error) {
      recordFailedAttempt(ip, 'Invalid JSON')
      return createAuthErrorResponse(AuthErrorCode.INVALID_REQUEST, null, '请求体格式无效')
    }
    
    const { walletAddress } = requestBody
    
    if (!walletAddress) {
      recordFailedAttempt(ip, 'Missing wallet address')
      return createAuthErrorResponse(AuthErrorCode.INVALID_REQUEST, null, '钱包地址不能为空')
    }
    
    // 3. 完整的地址安全验证
    const addressValidation = validateAddressSecurity(walletAddress)
    
    if (!addressValidation.isValid) {
      recordFailedAttempt(ip, `Invalid address: ${addressValidation.errors.join(', ')}`)
      logAuthError(
        createAuthError(AuthErrorCode.WALLET_ADDRESS_INVALID, addressValidation.errors),
        { ip, userAgent, walletAddress, endpoint: '/api/auth/web3/init' }
      )
      return createAuthErrorResponse(
        AuthErrorCode.WALLET_ADDRESS_INVALID,
        addressValidation.errors
      )
    }
    
    if (addressValidation.isMalicious) {
      recordFailedAttempt(ip, 'Malicious address detected')
      logAuthError(
        createAuthError(AuthErrorCode.WALLET_ADDRESS_MALICIOUS, addressValidation.errors),
        { ip, userAgent, walletAddress, endpoint: '/api/auth/web3/init' }
      )
      return createAuthErrorResponse(
        AuthErrorCode.WALLET_ADDRESS_MALICIOUS,
        addressValidation.errors
      )
    }
    
    // 使用标准化地址
    const normalizedAddress = addressValidation.normalizedAddress!
    
    // 4. 生成nonce和过期时间
    const nonce = uuidv4()
    const issuedAt = new Date()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10分钟后过期
    const requestId = uuidv4()
    
    // 5. 创建EIP-4361标准签名消息
    const domain = process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || 'astrozi.com'
    const uri = process.env.NEXT_PUBLIC_SITE_URL || 'https://astrozi.com'
    
    const message = `${domain} wants you to sign in with your Ethereum account:
${normalizedAddress}

AstroZi Web3 Authentication - Secure access to your personalized astrology platform.

URI: ${uri}
Version: 1
Chain ID: 56
Nonce: ${nonce}
Issued At: ${issuedAt.toISOString()}
Expiration Time: ${expiresAt.toISOString()}
Request ID: ${requestId}`
    
    // 6. 保存认证会话到数据库
    const sessionData = {
      nonce,
      wallet_address: normalizedAddress.toLowerCase(),
      expires_at: expiresAt.toISOString(),
      message,
      request_id: requestId,
      ip_address: ip,
      user_agent: userAgent,
      created_at: issuedAt.toISOString()
    }
    
    const { error: insertError } = await supabaseAdmin
      .from('web3_auth_sessions')
      .insert(sessionData)
    
    if (insertError) {
      console.error('Failed to save auth session:', insertError)
      logAuthError(
        createAuthError(AuthErrorCode.DATABASE_ERROR, insertError),
        { ip, userAgent, walletAddress: normalizedAddress, endpoint: '/api/auth/web3/init' }
      )
      return createAuthErrorResponse(AuthErrorCode.DATABASE_ERROR)
    }
    
    // 7. 成功响应
    const responseTime = Date.now() - startTime
    console.log(`✅ Web3 auth init successful for ${normalizedAddress} (${responseTime}ms)`)
    
    return NextResponse.json({
      success: true,
      nonce,
      message,
      expiresAt: expiresAt.toISOString(),
      requestId,
      remainingAttempts: rateLimitResult.remainingAttempts
    })
    
  } catch (error: any) {
    console.error('Web3 auth init error:', error)
    
    logAuthError(
      createAuthError(AuthErrorCode.INTERNAL_SERVER_ERROR, error),
      { ip, userAgent, endpoint: '/api/auth/web3/init' }
    )
    
    return createAuthErrorResponse(
      AuthErrorCode.INTERNAL_SERVER_ERROR,
      process.env.NODE_ENV === 'development' ? error : null
    )
  }
} 
