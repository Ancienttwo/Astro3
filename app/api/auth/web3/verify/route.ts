import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyMessage } from 'viem'
import { checkRateLimitRedis } from '@/lib/rate-limit-redis'
import { recordFailedAttempt } from '@/lib/rate-limit'
import { validateAddressSecurity } from '@/lib/address-validation'
import { createAuthErrorResponse, AuthErrorCode, logAuthError, createAuthError } from '@/lib/auth-errors'
import { createSupabaseSession, createWeb3FallbackAuth } from '@/lib/jwt-auth'

// 使用管理员权限的Supabase客户端
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Web3VerifyRequest {
  walletAddress: string
  signature: string
  nonce: string
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
      maxAttempts: 5, // 验证签名限制更严格
      windowMs: 15 * 60 * 1000, // 15分钟
      blockDurationMs: 60 * 60 * 1000, // 1小时封禁
      bucket: 'auth_web3_verify'
    })
    
    if (!rateLimitResult.allowed) {
      recordFailedAttempt(ip, 'Rate limit exceeded on verify')
      return createAuthErrorResponse(
        AuthErrorCode.RATE_LIMIT_EXCEEDED,
        { blockUntil: rateLimitResult.blockUntil }
      )
    }
    
    // 2. 解析和验证请求体
    let requestBody: Web3VerifyRequest
    try {
      requestBody = await request.json()
    } catch (error) {
      recordFailedAttempt(ip, 'Invalid JSON in verify')
      return createAuthErrorResponse(AuthErrorCode.INVALID_REQUEST, null, '请求体格式无效')
    }
    
    const { walletAddress, signature, nonce } = requestBody
    
    if (!walletAddress || !signature || !nonce) {
      recordFailedAttempt(ip, 'Missing required fields in verify')
      return createAuthErrorResponse(AuthErrorCode.INVALID_REQUEST, null, '缺少必需字段')
    }
    
    // 3. 验证钱包地址
    const addressValidation = validateAddressSecurity(walletAddress)
    if (!addressValidation.isValid || addressValidation.isMalicious) {
      recordFailedAttempt(ip, 'Invalid wallet address in verify')
      return createAuthErrorResponse(AuthErrorCode.WALLET_ADDRESS_INVALID)
    }
    
    const normalizedAddress = addressValidation.normalizedAddress!
    
    // 4. 验证认证会话
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('web3_auth_sessions')
      .select('*')
      .eq('nonce', nonce)
      .eq('wallet_address', normalizedAddress.toLowerCase())
      .gt('expires_at', new Date().toISOString())
      .single()
    
    if (sessionError || !session) {
      recordFailedAttempt(ip, 'Invalid or expired nonce')
      logAuthError(
        createAuthError(AuthErrorCode.NONCE_INVALID, sessionError),
        { ip, userAgent, walletAddress: normalizedAddress, endpoint: '/api/auth/web3/verify' }
      )
      return createAuthErrorResponse(AuthErrorCode.NONCE_INVALID)
    }
    
    // 5. 验证签名（使用 viem）
    try {
      const isValid = await verifyMessage({
        address: normalizedAddress as `0x${string}`,
        message: session.message,
        signature: (signature.startsWith('0x') ? signature : `0x${signature}`) as `0x${string}`,
      })
      if (!isValid) {
        recordFailedAttempt(ip, 'Signature invalid (viem)')
        logAuthError(
          createAuthError(AuthErrorCode.SIGNATURE_INVALID, { reason: 'verifyMessage=false' }),
          { ip, userAgent, walletAddress: normalizedAddress, endpoint: '/api/auth/web3/verify' }
        )
        return createAuthErrorResponse(AuthErrorCode.SIGNATURE_INVALID)
      }
    } catch (error) {
      recordFailedAttempt(ip, 'Signature verification failed')
      console.error('Signature verification failed:', error)
      logAuthError(
        createAuthError(AuthErrorCode.SIGNATURE_INVALID, error),
        { ip, userAgent, walletAddress: normalizedAddress, endpoint: '/api/auth/web3/verify' }
      )
      return createAuthErrorResponse(AuthErrorCode.SIGNATURE_INVALID)
    }
    
    // 6. 删除已使用的认证会话（防止重放攻击）
    const { error: deleteError } = await supabaseAdmin
      .from('web3_auth_sessions')
      .delete()
      .eq('nonce', nonce)
    
    if (deleteError) {
      console.warn('Failed to delete used session:', deleteError)
      // 不阻断流程，但记录警告
    }
    
    // 7. 查找或创建用户
    let user
    const { data: existingUser, error: queryError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('wallet_address', normalizedAddress.toLowerCase())
      .single()
    
    if (existingUser && !queryError) {
      // 确保现有用户的auth_type正确设置为web3
      if (existingUser.auth_type !== 'web3') {
        const { data: updatedUser, error: updateError } = await supabaseAdmin
          .from('users')
          .update({ 
            auth_type: 'web3',
            wallet_address: normalizedAddress.toLowerCase(), // 确保使用标准化地址
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id)
          .select()
          .single()
        
        if (updateError) {
          console.error('Failed to update user auth_type:', updateError)
          logAuthError(
            createAuthError(AuthErrorCode.DATABASE_ERROR, updateError),
            { ip, userAgent, walletAddress: normalizedAddress, userId: existingUser.id, endpoint: '/api/auth/web3/verify' }
          )
          user = existingUser // 使用原数据，继续流程
        } else {
          user = updatedUser
          console.log('✅ Updated existing user auth_type to web3')
        }
      } else {
        user = existingUser
      }
    } else {
      // 创建新的Web3用户
      const newUser = {
        email: `${normalizedAddress.toLowerCase()}@web3.astrozi.app`,
        wallet_address: normalizedAddress.toLowerCase(),
        auth_type: 'web3',
        username: `Web3User${normalizedAddress.slice(-6)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data: createdUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert(newUser)
        .select()
        .single()
      
      if (createError) {
        console.error('Failed to create Web3 user:', createError)
        logAuthError(
          createAuthError(AuthErrorCode.USER_CREATION_FAILED, createError),
          { ip, userAgent, walletAddress: normalizedAddress, endpoint: '/api/auth/web3/verify' }
        )
        return createAuthErrorResponse(AuthErrorCode.USER_CREATION_FAILED)
      }
      
      user = createdUser
      console.log(`✅ Created new Web3 user: ${user.id}`)
    }
    
    // 8. 创建认证会话
    try {
      console.log('🔐 Creating session for Web3 user:', user.id)
      
      // 首先尝试创建Supabase session
      const supabaseSession = await createSupabaseSession(user.id, user.email, 'web3')
      
      if (supabaseSession) {
        // Supabase session创建成功
        const responseTime = Date.now() - startTime
        console.log(`✅ Web3 auth successful with Supabase session for ${normalizedAddress} (${responseTime}ms)`)
        
        return NextResponse.json({
          success: true,
          access_token: supabaseSession.access_token,
          refresh_token: supabaseSession.refresh_token,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            wallet_address: user.wallet_address,
            auth_type: user.auth_type,
            created_at: user.created_at
          },
          auth_method: 'supabase_session'
        })
      } else {
        // Fallback到JWT认证
        console.log('🔄 Using JWT fallback authentication for user:', user.id)
        const fallbackAuth = createWeb3FallbackAuth(user)
        
        const responseTime = Date.now() - startTime
        console.log(`✅ Web3 auth successful with JWT fallback for ${normalizedAddress} (${responseTime}ms)`)
        
        return NextResponse.json({
          success: true,
          auth_token: fallbackAuth.authToken,
          user: fallbackAuth.user,
          auth_method: fallbackAuth.authMethod,
          message: 'Web3 authentication successful (JWT mode)'
        })
      }
      
    } catch (sessionError) {
      console.error('Session creation failed:', sessionError)
      logAuthError(
        createAuthError(AuthErrorCode.SESSION_CREATION_FAILED, sessionError),
        { ip, userAgent, walletAddress: normalizedAddress, userId: user.id, endpoint: '/api/auth/web3/verify' }
      )
      return createAuthErrorResponse(AuthErrorCode.SESSION_CREATION_FAILED)
    }
    
  } catch (error: any) {
    const responseTime = Date.now() - startTime
    console.error(`❌ Web3 auth verification error (${responseTime}ms):`, error)
    
    logAuthError(
      createAuthError(AuthErrorCode.INTERNAL_SERVER_ERROR, error),
      { ip, userAgent, endpoint: '/api/auth/web3/verify' }
    )
    
    return createAuthErrorResponse(
      AuthErrorCode.INTERNAL_SERVER_ERROR,
      process.env.NODE_ENV === 'development' ? error : null
    )
  }
} 
