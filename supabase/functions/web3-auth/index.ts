// supabase/functions/web3-auth/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ethers } from 'https://esm.sh/ethers@5.7.2'

// 动态CORS配置 - 支持开发和生产环境
const getAllowedOrigins = (): string[] => {
  const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:3001'
  const additionalOrigins = Deno.env.get('ADDITIONAL_CORS_ORIGINS')?.split(',') || []
  
  return [
    siteUrl,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3007',
    'https://astrozi.app',
    'https://www.astrozi.app',
    ...additionalOrigins.filter(Boolean)
  ]
}

const getCorsHeaders = (origin?: string) => {
  const allowedOrigins = getAllowedOrigins()
  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true',
  }
}

// 钱包签名验证器（增强版）
class WalletSignatureVerifier {
  private static signatureCache = new Map<string, { isValid: boolean; timestamp: number }>()
  private static readonly CACHE_TTL = 5 * 60 * 1000 // 5分钟缓存

  async verifySignature({ signature, message, walletAddress }: {
    signature: string
    message: string
    walletAddress: string
  }): Promise<boolean> {
    try {
      // 创建缓存键
      const cacheKey = `${walletAddress}-${signature.slice(0, 10)}`
      const now = Date.now()
      
      // 检查缓存
      const cached = WalletSignatureVerifier.signatureCache.get(cacheKey)
      if (cached && now - cached.timestamp < WalletSignatureVerifier.CACHE_TTL) {
        console.log('📋 使用缓存的签名验证结果')
        return cached.isValid
      }

      console.log('🔍 验证签名:', {
        walletAddress: `${walletAddress.slice(0, 8)}...`,
        messageLength: message?.length,
        signatureLength: signature?.length
      })

      // 输入验证
      if (!signature || !message || !walletAddress) {
        return false
      }

      // 使用 ethers 验证签名
      const recoveredAddress = ethers.utils.verifyMessage(message, signature)
      const isValid = recoveredAddress.toLowerCase() === walletAddress.toLowerCase()

      // 缓存结果
      WalletSignatureVerifier.signatureCache.set(cacheKey, {
        isValid,
        timestamp: now
      })

      // 清理过期缓存（简单的LRU策略）
      if (WalletSignatureVerifier.signatureCache.size > 100) {
        const oldestEntries = Array.from(WalletSignatureVerifier.signatureCache.entries())
          .sort(([,a], [,b]) => a.timestamp - b.timestamp)
          .slice(0, 50)
        
        oldestEntries.forEach(([key]) => WalletSignatureVerifier.signatureCache.delete(key))
      }

      console.log('📝 签名验证结果:', {
        recoveredAddress: `${recoveredAddress.slice(0, 8)}...`,
        expectedAddress: `${walletAddress.slice(0, 8)}...`,
        isValid
      })

      return isValid
    } catch (error) {
      console.error('❌ 签名验证失败:', error)
      return false
    }
  }
}

const walletSignatureVerifier = new WalletSignatureVerifier()

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)
  
  try {
    // 处理 CORS 预检请求
    if (req.method === 'OPTIONS') {
      console.log('🔧 处理 CORS 预检请求, origin:', origin)
      return new Response(null, { 
        status: 200,
        headers: corsHeaders 
      })
    }
    console.log('🔐 开始Web3认证流程...')
    
    // 环境变量验证
    const requiredEnvVars = {
      SUPABASE_URL: Deno.env.get('SUPABASE_URL'),
      SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      SITE_URL: Deno.env.get('SITE_URL')
    }
    
    console.log('🔍 环境变量检查:', {
      SUPABASE_URL: requiredEnvVars.SUPABASE_URL ? `${requiredEnvVars.SUPABASE_URL.substring(0, 20)}...` : 'undefined',
      SUPABASE_SERVICE_ROLE_KEY: requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY ? `${requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...` : 'undefined',
      SITE_URL: requiredEnvVars.SITE_URL || 'undefined'
    })
    
    // 检查必要的环境变量
    const missingEnvVars = Object.entries(requiredEnvVars)
      .filter(([key, value]) => key !== 'SITE_URL' && !value)
      .map(([key]) => key)
    
    if (missingEnvVars.length > 0) {
      console.error('❌ 缺少必要的环境变量:', missingEnvVars)
      return new Response(JSON.stringify({
        success: false,
        error: `服务器配置错误: 缺少环境变量 ${missingEnvVars.join(', ')}`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    const { SUPABASE_URL: supabaseUrl, SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey, SITE_URL: siteUrl } = requiredEnvVars
    
    const { walletAddress, signature, message } = await req.json()
    
    if (!walletAddress || !signature || !message) {
      return new Response(JSON.stringify({
        success: false,
        error: '缺少必要参数'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('📋 收到认证请求:', {
      walletAddress,
      signatureLength: signature?.length,
      messageLength: message?.length
    })

    // Step 1: 验证签名
    const isValidSignature = await walletSignatureVerifier.verifySignature({
      signature,
      message,
      walletAddress
    })

    if (!isValidSignature) {
      return new Response(JSON.stringify({
        success: false,
        error: '签名验证失败'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('✅ 签名验证成功')

    // 初始化 Supabase Admin 客户端
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Step 2: 处理用户创建/查找
    const normalizedAddress = walletAddress.toLowerCase()
    const virtualEmail = `${normalizedAddress}@web3.wallet`
    
    console.log('🔍 查找或创建用户:', virtualEmail)
    
    // 查找现有的Supabase Auth用户
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(user => 
      user.email === virtualEmail || 
      user.user_metadata?.wallet_address === normalizedAddress
    )

    let supabaseUser
    let password

    if (existingUser) {
      console.log('✅ 找到现有Web3用户:', virtualEmail)
      
      // 为现有用户生成新密码并更新Supabase Auth
      password = crypto.randomUUID()
      console.log('🔄 为现有用户生成新密码并更新认证信息')
      
      // 更新Supabase Auth中的密码并保持邮箱确认状态
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        { password: password, email_confirm: true }
      )
      
      if (updateError) {
        console.error('❌ 更新用户密码失败:', updateError)
        throw new Error(`更新用户密码失败: ${updateError.message}`)
      }
      
      console.log('✅ 用户密码更新成功')
      
      // 更新或插入密码记录到web3_user_credentials表
      const { error: upsertError } = await supabaseAdmin
        .from('web3_user_credentials')
        .upsert({
          wallet_address: normalizedAddress,
          encrypted_password: password,
          user_id: existingUser.id
        })
        
      if (upsertError) {
        console.error('❌ 更新用户凭证记录失败:', upsertError)
      } else {
        console.log('✅ 用户凭证记录更新成功')
      }

      // 检查users表中是否存在对应记录，如果不存在则创建
      const { data: existingUserRecord, error: checkUserError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', existingUser.id)
        .single()

      if (checkUserError && checkUserError.code === 'PGRST116') {
        // 用户记录不存在，创建新记录
        console.log('🔄 为现有用户创建users表记录')
        const { error: insertUserError } = await supabaseAdmin
          .from('users')
          .insert({
            id: existingUser.id,
            email: virtualEmail,
            wallet_address: normalizedAddress,
            auth_type: 'web3',
            auth_provider: 'walletconnect',
            display_name: existingUser.user_metadata?.display_name || `Web3User${normalizedAddress.slice(-6)}`,
            created_at: existingUser.created_at,
            updated_at: new Date().toISOString()
          })

        if (insertUserError) {
          console.error('❌ 为现有用户创建users表记录失败:', insertUserError)
        } else {
          console.log('✅ 现有用户的users表记录创建成功')
        }
      } else if (existingUserRecord) {
        console.log('✅ 现有用户的users表记录已存在')
      }
      
      supabaseUser = updatedUser.user || existingUser
    } else {
      console.log('🆕 创建新Web3用户:', virtualEmail)
      
      // 创建新的Supabase Auth用户
      password = crypto.randomUUID()
      
      const { data: newUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email: virtualEmail,
        password: password,
        user_metadata: {
          wallet_address: normalizedAddress,
          auth_type: 'web3',
          auth_provider: 'walletconnect',
          display_name: `Web3User${normalizedAddress.slice(-6)}`
        },
        email_confirm: true // 自动确认邮箱
      })

      if (signUpError) {
        console.error('❌ 创建Supabase用户失败:', signUpError)
        return new Response(JSON.stringify({
          success: false,
          error: '创建用户失败'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // 存储密码以供后续登录使用
      const { error: insertError } = await supabaseAdmin
        .from('web3_user_credentials')
        .insert({
          wallet_address: normalizedAddress,
          encrypted_password: password,
          user_id: newUser.user?.id
        })
        
      if (insertError) {
        console.error('❌ 插入用户凭证失败:', insertError)
      }

      supabaseUser = newUser.user
      console.log('✅ 新Web3用户创建成功:', virtualEmail)

      // 在users表中创建对应的记录
      const { error: insertUserError } = await supabaseAdmin
        .from('users')
        .insert({
          id: newUser.user.id,
          email: virtualEmail,
          wallet_address: normalizedAddress,
          auth_type: 'web3',
          auth_provider: 'walletconnect',
          display_name: `Web3User${normalizedAddress.slice(-6)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertUserError) {
        console.error('❌ 在users表中创建用户记录失败:', insertUserError)
        // 不抛出错误，因为Supabase Auth用户已经创建成功
      } else {
        console.log('✅ users表中的用户记录创建成功')
      }
    }

    // Step 3: 生成真正的JWT session
    console.log('🔐 生成Supabase session...')
    
    // 使用admin权限生成magic link包含真正的JWT
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: virtualEmail,
      options: {
        redirectTo: `${siteUrl || 'http://localhost:3001'}/auth/callback`
      }
    })

    console.log('🔍 generateLink 完整返回数据:', JSON.stringify({
      linkData: linkData,
      linkError: linkError
    }, null, 2))

    if (linkError || !linkData) {
      console.error('❌ 生成magic link失败:', linkError)
      return new Response(JSON.stringify({
        success: false,
        error: 'JWT生成失败'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!linkData.properties?.action_link) {
      console.error('❌ Magic link中没有action_link')
      return new Response(JSON.stringify({
        success: false,
        error: 'Magic link生成失败: 缺少action_link'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 从magic link中提取token信息
    const url = new URL(linkData.properties.action_link)
    console.log('🔍 Magic link URL参数:', {
      allParams: Array.from(url.searchParams.entries()),
      token: url.searchParams.get('token'),
      type: url.searchParams.get('type'),
      hashedToken: linkData.properties.hashed_token
    })

    // Magic link 不直接包含 JWT，我们需要使用 hashed_token 来创建 session
    const hashedToken = linkData.properties.hashed_token
    
    if (!hashedToken) {
      console.error('❌ 无法获取hashed token')
      return new Response(JSON.stringify({
        success: false,
        error: '无法获取认证token'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 生成真实的Supabase JWT session
    console.log('✅ 用户验证完成，创建标准Supabase session')
    
    // 使用创建的用户信息和密码，让前端自己管理session
    // 返回必要的信息让前端调用signInWithPassword
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = now + 86400

    // 返回用户数据
    const userData = {
      id: supabaseUser.id,
      email: virtualEmail,
      wallet_address: normalizedAddress,
      auth_type: 'web3',
      auth_provider: 'walletconnect',
      display_name: supabaseUser.user_metadata?.display_name || `Web3User${normalizedAddress.slice(-6)}`,
      created_at: supabaseUser.created_at,
      updated_at: supabaseUser.updated_at
    }

    // 返回登录凭据让前端自己创建session
    const sessionData = {
      email: virtualEmail,
      password: password,
      user: userData,
      expires_at: expiresAt,
      wallet_address: normalizedAddress,
      auth_method: 'web3',
      // 提供给前端用于后续操作的标识
      web3_auth: true
    }

    console.log('🎉 Web3认证完成:', normalizedAddress)

    return new Response(JSON.stringify({
      success: true,
      data: {
        user: userData,
        session: sessionData
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Edge Function执行失败:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : '服务器错误'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})