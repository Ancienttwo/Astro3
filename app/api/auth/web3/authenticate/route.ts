import { NextRequest, NextResponse } from 'next/server'
import { walletSignatureVerifier } from '@/lib/services/wallet-signature-verifier'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, signature, message } = await request.json()
    
    if (!walletAddress || !signature || !message) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数'
      }, { status: 400 })
    }

    console.log('🔐 开始服务端Web3认证验证...', {
      walletAddress,
      signatureLength: signature?.length,
      signaturePreview: signature?.substring(0, 20) + '...',
      messageLength: message?.length,
      messagePreview: message?.substring(0, 100) + '...'
    })

    // Step 1: 验证签名
    const isValidSignature = await walletSignatureVerifier.verifySignature({
      signature,
      message,
      walletAddress
    })

    if (!isValidSignature) {
      return NextResponse.json({
        success: false,
        error: '签名验证失败'
      }, { status: 401 })
    }

    console.log('✅ 服务端签名验证成功')

    // Step 2: 为钱包地址创建/查找Supabase用户
    const normalizedAddress = walletAddress.toLowerCase()
    const virtualEmail = `${normalizedAddress}@web3.wallet`
    
    // 查找现有的Supabase Auth用户
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(user => 
      user.email === virtualEmail || 
      user.user_metadata?.wallet_address === normalizedAddress
    )

    let supabaseUser
    let password

    if (existingUser) {
      // 用户已存在，获取存储的密码
      const { data: userRecord, error: credentialsError } = await supabaseAdmin
        .from('web3_user_credentials')
        .select('encrypted_password')
        .eq('wallet_address', normalizedAddress)
        .single()
      
      console.log('🔍 查询用户凭证结果:', { userRecord, credentialsError })
      
      if (userRecord) {
        // 解密存储的密码（这里简化处理，实际项目中应该用更安全的方式）
        password = userRecord.encrypted_password
      } else {
        // 旧用户没有密码记录，创建一个
        password = crypto.randomBytes(32).toString('hex')
        const { error: insertError } = await supabaseAdmin
          .from('web3_user_credentials')
          .insert({
            wallet_address: normalizedAddress,
            encrypted_password: password
          })
          
        if (insertError) {
          console.error('❌ 插入现有用户凭证失败:', insertError)
        } else {
          console.log('✅ 现有用户凭证插入成功')
        }
      }
      
      supabaseUser = existingUser
      console.log('✅ 找到现有Web3用户:', virtualEmail)
    } else {
      // 创建新的Supabase Auth用户
      password = crypto.randomBytes(32).toString('hex')
      
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
        return NextResponse.json({
          success: false,
          error: '创建用户失败'
        }, { status: 500 })
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
      } else {
        console.log('✅ 用户凭证插入成功')
      }

      supabaseUser = newUser.user
      console.log('✅ 新Web3用户创建成功:', virtualEmail)
    }

    // Step 3: 使用Admin权限生成真正的JWT token
    console.log('🔐 为Web3用户生成真正的JWT token:', { userId: supabaseUser.id, virtualEmail })
    
    try {
      // 确保用户邮箱已确认，这是generateLink的前提
      if (!supabaseUser.email_confirmed_at) {
        console.log('🔄 用户邮箱未确认，正在确认...')
        const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
          supabaseUser.id,
          { 
            email_confirm: true,
            user_metadata: {
              ...supabaseUser.user_metadata,
              wallet_address: normalizedAddress,
              auth_type: 'web3'
            }
          }
        )
        
        if (confirmError) {
          console.error('❌ 确认用户邮箱失败:', confirmError)
        } else {
          console.log('✅ 用户邮箱已确认')
        }
      }

      // 使用admin权限生成magiclink（包含真正的JWT）
      const { data: linkResp, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: virtualEmail,
        options: {
          redirectTo: 'http://localhost:3001/auth/callback' // 回调URL
        }
      })

      let actionLink: string | null = (linkResp as any)?.properties?.action_link || (linkResp as any)?.action_link || null;

      if (linkError || !actionLink) {
        console.error('❌ 生成magiclink失败:', linkError)
        // 如果magiclink失败，尝试recovery方式
        console.log('🔄 尝试使用recovery方式生成token...')
        
        const { data: recoveryResp, error: recoveryError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: virtualEmail
        })
        
        actionLink = (recoveryResp as any)?.properties?.action_link || (recoveryResp as any)?.action_link || null;

        if (recoveryError || !actionLink) {
          console.error('❌ 生成recovery链接也失败:', recoveryError)
          throw new Error(`生成JWT失败: ${linkError?.message || recoveryError?.message}`)
        }
      }

      // 从链接中提取真正的JWT token
      const url = new URL(actionLink!)
      const accessToken = url.searchParams.get('access_token')
      const refreshToken = url.searchParams.get('refresh_token')

      if (!accessToken) {
        console.error('❌ 无法从链接中提取access token')
        console.log('🔍 完整链接信息:', actionLink)
        throw new Error('无法提取JWT token')
      }

      console.log('✅ 成功生成真正的JWT token:', { 
        tokenLength: accessToken.length,
        tokenPreview: accessToken.substring(0, 50) + '...',
        hasRefreshToken: !!refreshToken
      })

      // 创建标准的Supabase session格式
      const now = new Date()
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24小时后过期
      
      const standardSession = {
        access_token: accessToken,
        refresh_token: refreshToken || accessToken, // 如果没有refresh_token就用access_token
        expires_in: 86400, // 24小时
        expires_at: Math.floor(expiresAt.getTime() / 1000),
        token_type: 'bearer',
        user: {
          id: supabaseUser.id,
          aud: 'authenticated',
          role: 'authenticated',
          email: virtualEmail,
          email_confirmed_at: supabaseUser.email_confirmed_at || now.toISOString(),
          phone: '',
          confirmed_at: supabaseUser.confirmed_at || now.toISOString(),
          last_sign_in_at: now.toISOString(),
          app_metadata: {
            provider: 'walletconnect',
            providers: ['walletconnect']
          },
          user_metadata: {
            ...supabaseUser.user_metadata,
            wallet_address: normalizedAddress,
            auth_type: 'web3'
          },
          identities: [],
          created_at: supabaseUser.created_at,
          updated_at: now.toISOString()
        }
      }

      console.log('✅ 标准JWT session创建成功')

      // Step 4: 返回用户数据和真正的JWT session
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

      return NextResponse.json({
        success: true,
        data: {
          user: userData,
          session: standardSession
        }
      })

    } catch (jwtError) {
      console.error('❌ JWT生成失败，回退到简化session:', jwtError)
      
      // 如果JWT生成失败，返回用户数据但不包含session
      // 客户端可以决定是否需要重新尝试认证
      return NextResponse.json({
        success: false,
        error: `JWT token生成失败: ${jwtError instanceof Error ? jwtError.message : '未知错误'}`,
        details: 'Web3认证成功但JWT生成失败，请重试'
      }, { status: 500 })
    }


  } catch (error) {
    console.error('❌ 服务端Web3认证失败:', error)
    
    let errorMessage = '服务器错误'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 })
  }
}
