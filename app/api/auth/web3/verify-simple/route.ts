import { NextRequest, NextResponse } from 'next/server'
import { verifyMessage } from 'viem'
import { web3SessionManager } from '@/lib/web3-sessions'

interface Web3VerifyRequest {
  walletAddress: string
  signature: string
  nonce: string
}

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    let requestBody: Web3VerifyRequest
    try {
      requestBody = await request.json()
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        error: '请求体格式无效'
      }, { status: 400 })
    }
    
    const { walletAddress, signature, nonce } = requestBody
    
    // 基本验证
    if (!walletAddress || !signature || !nonce) {
      return NextResponse.json({
        success: false,
        error: '缺少必需参数'
      }, { status: 400 })
    }
    
    // 使用改进的会话管理器获取会话
    const session = await web3SessionManager.getSession(nonce)
    
    console.log('🔍 Web3验证调试信息:', {
      nonce,
      walletAddress,
      sessionExists: !!session,
      requestTime: new Date().toISOString(),
      env: process.env.NODE_ENV,
      sessionWallet: session?.walletAddress,
      sessionExpiry: session?.expiresAt?.toISOString()
    })
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: '会话不存在或已过期'
      }, { status: 401 })
    }
    
    // 检查过期时间
    if (new Date() > session.expiresAt) {
      await web3SessionManager.deleteSession(nonce)
      return NextResponse.json({
        success: false,
        error: '会话已过期'
      }, { status: 401 })
    }
    
    // 验证钱包地址匹配
    if (session.walletAddress !== walletAddress.toLowerCase()) {
      return NextResponse.json({
        success: false,
        error: '钱包地址不匹配'
      }, { status: 401 })
    }
    
    // 验证签名
    try {
      const ok = await verifyMessage({
        address: walletAddress as `0x${string}`,
        message: session.message,
        signature: (signature.startsWith('0x') ? signature : `0x${signature}`) as `0x${string}`,
      })
      if (!ok) {
        return NextResponse.json({
          success: false,
          error: '签名验证失败'
        }, { status: 401 })
      }
    } catch (error: any) {
      console.error('签名验证错误:', error)
      return NextResponse.json({
        success: false,
        error: '签名格式无效'
      }, { status: 401 })
    }
    
    // 清理使用过的会话
    await web3SessionManager.deleteSession(nonce)
    
    // 为Web3用户创建虚拟邮箱地址，然后使用Bearer认证
    const email = `${walletAddress.toLowerCase()}@astrozi.ai`
    const username = `Web3User${walletAddress.slice(-6)}`
    // 生成符合Supabase要求的强密码（至少6位，包含字母和数字）
    const password = `Web3_${walletAddress.toLowerCase()}_${Date.now().toString().slice(-6)}`
    
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    console.log('🔧 Supabase配置检查:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      urlStart: supabaseUrl?.substring(0, 30) + '...',
      keyStart: supabaseServiceKey?.substring(0, 30) + '...'
    })
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    try {
      // 1. 先尝试使用虚拟邮箱登录
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })
      
      if (signInData.user && !signInError) {
        // 用户已存在，直接登录成功
        console.log(`✅ Web3用户登录成功: ${walletAddress}`)
        
        // 更新用户的钱包地址
        await supabase
          .from('users')
          .update({
            wallet_address: walletAddress.toLowerCase(),
            auth_type: 'web3',
            updated_at: new Date().toISOString()
          })
          .eq('id', signInData.user.id)
        
        return NextResponse.json({
          success: true,
          user: {
            id: signInData.user.id,
            email: signInData.user.email,
            username: username,
            wallet_address: walletAddress.toLowerCase(),
            auth_method: 'supabase_session',
            created_at: signInData.user.created_at
          },
          access_token: signInData.session?.access_token,
          refresh_token: signInData.session?.refresh_token,
          auth_method: 'supabase_session',
          message: 'Web3认证成功'
        })
      }
      
      // 2. 如果登录失败，创建新用户
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: username,
            wallet_address: walletAddress.toLowerCase()
          }
        }
      })
      
      if (signUpError) {
        console.error('❌ Web3用户注册失败详细信息:', {
          error: signUpError,
          walletAddress: walletAddress,
          email: email,
          errorMessage: signUpError?.message,
          errorCode: signUpError?.code
        })
        throw signUpError
      }
      
      if (signUpData.user) {
        console.log(`✅ 创建新Web3用户: ${walletAddress}`)
        
        // 创建或更新用户记录
        await supabase
          .from('users')
          .upsert({
            id: signUpData.user.id,
            email: signUpData.user.email,
            username: username,
            wallet_address: walletAddress.toLowerCase(),
            auth_type: 'web3',
            created_at: signUpData.user.created_at,
            updated_at: new Date().toISOString()
          })
        
        return NextResponse.json({
          success: true,
          user: {
            id: signUpData.user.id,
            email: signUpData.user.email,
            username: username,
            wallet_address: walletAddress.toLowerCase(),
            auth_method: 'supabase_session',
            created_at: signUpData.user.created_at
          },
          access_token: signUpData.session?.access_token,
          refresh_token: signUpData.session?.refresh_token,
          auth_method: 'supabase_session',
          message: 'Web3认证成功'
        })
      }
      
    } catch (error) {
      console.error('❌ Web3 Supabase认证详细错误:', {
        error: error as any,
        walletAddress: walletAddress,
        email: email,
        errorMessage: (error as any)?.message,
        errorCode: (error as any)?.code
      })
      
      // 如果Supabase认证失败，回退到JWT模式，但仍需在数据库中创建用户记录
      const tempUser = {
        id: `web3_${walletAddress.toLowerCase()}`,
        email: email,
        username: username,
        wallet_address: walletAddress.toLowerCase(),
        auth_method: 'web3_jwt',
        created_at: new Date().toISOString()
      }
      
      // 尝试直接在数据库中创建Web3用户记录
      try {
        await supabase
          .from('users')
          .upsert({
            id: tempUser.id,
            email: tempUser.email,
            username: tempUser.username,
            wallet_address: walletAddress.toLowerCase(),
            auth_type: 'web3',
            created_at: tempUser.created_at,
            updated_at: tempUser.created_at
          })
        
        console.log(`✅ 通过JWT模式创建Web3用户记录: ${walletAddress}`)
      } catch (dbError) {
        console.error('❌ 数据库用户创建也失败:', dbError)
      }
      
      const authToken = Buffer.from(JSON.stringify({
        userId: tempUser.id,
        walletAddress: walletAddress.toLowerCase(),
        issuedAt: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24小时
      })).toString('base64')
      
      console.log(`⚠️ Web3 authentication fallback for ${walletAddress}`)
      
      return NextResponse.json({
        success: true,
        user: tempUser,
        auth_token: authToken,
        auth_method: 'web3_jwt',
        message: 'Web3认证成功（临时模式）'
      })
    }
    
    // 兜底返回，避免类型检查"未返回"错误
    return NextResponse.json({ success: false, error: '认证失败' }, { status: 500 })
  } catch (error: any) {
    console.error('Web3 verify error:', error)
    
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}
