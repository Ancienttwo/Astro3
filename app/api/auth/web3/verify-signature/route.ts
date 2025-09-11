import { NextResponse } from 'next/server'
import { verifyMessage, isAddress } from 'viem'
import * as jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  try {
    const { message, signature, address } = await request.json()

    if (!message || !signature || !address) {
      return NextResponse.json(
        { error: 'Message, signature, and address are required' },
        { status: 400 }
      )
    }

    // Validate Ethereum address format
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/
    if (!ethAddressRegex.test(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400 }
      )
    }

    const normalizedAddress = address.toLowerCase()

    // Verify signature using viem
    try {
      console.log('🔐 验证签名数据:', {
        messageLength: message.length,
        signatureLength: signature.length,
        address: normalizedAddress,
        messageStart: message.substring(0, 100),
        signatureFormat: signature.startsWith('0x') ? 'hex' : 'unknown'
      });
      
      // 验证签名
      try {
        const ok = await verifyMessage({
          address: normalizedAddress as `0x${string}`,
          message,
          signature: (signature.startsWith('0x') ? signature : `0x${signature}`) as `0x${string}`,
        })
        if (!ok) {
          console.error('❌ 签名验证失败: viem 验证不通过');
          return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 400 }
          )
        }
      } catch (ethersError) {
        console.error('❌ 签名验证失败:', ethersError);
        return NextResponse.json(
          { error: 'Signature verification failed - invalid format' },
          { status: 400 }
        );
      }
      
      console.log('🔐 期望的地址:', normalizedAddress);

      console.log('✅ 签名验证成功:', normalizedAddress)

      // 创建或查找Web3用户记录以获取正确的UUID
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase environment variables are required')
      }
      
      const { createClient } = require('@supabase/supabase-js')
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
      
      // 查找或创建Web3用户
      const email = `${normalizedAddress}@web3.astrozi.app`
      let userId: string
      
      // 首先尝试查找现有用户
      const { data: existingUser, error: findError } = await supabaseAdmin
        .from('users')
        .select('id, wallet_address, email, username, auth_type, created_at')
        .eq('wallet_address', normalizedAddress)
        .eq('auth_type', 'walletconnect')
        .single()
      
      if (existingUser && !findError) {
        userId = existingUser.id
        console.log('✅ 找到现有Web3用户:', userId)
      } else {
        // 创建新用户记录
        const newUserData = {
          wallet_address: normalizedAddress,
          email: email,
          username: `Web3User${normalizedAddress.slice(-6)}`,
          auth_type: 'walletconnect',
          user_type: 'web3'
        }
        
        const { data: newUser, error: createError } = await supabaseAdmin
          .from('users')
          .insert(newUserData)
          .select('id, created_at')
          .single()
        
        if (createError || !newUser) {
          console.error('❌ 创建Web3用户失败:', createError)
          throw new Error('Failed to create user record')
        }
        
        userId = newUser.id
        console.log('✅ 创建新Web3用户:', userId)
      }

      // Generate secure JWT token
      const jwtSecret = process.env.JWT_SECRET
      
      if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is required')
      }
      
      if (jwtSecret.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long for security')
      }
      
      const token = jwt.sign(
        { 
          userId: userId, // 使用数据库中的UUID作为用户ID
          address: normalizedAddress,
          walletAddress: normalizedAddress,
          authType: 'walletconnect',
          auth_method: 'walletconnect',
          email: email,
          iss: 'astrozi',
          aud: 'astrozi-users'
        },
        jwtSecret,
        {
          algorithm: 'HS256',
          expiresIn: '24h'
        }
      )

      // 获取完整的用户数据用于返回
      let completeUserData: any
      if (existingUser && !findError) {
        completeUserData = {
          id: existingUser.id,
          wallet_address: existingUser.wallet_address,
          email: existingUser.email,
          username: existingUser.username,
          auth_method: 'walletconnect',
          provider: 'Direct Verification',
          is_web3_user: true,
          created_at: existingUser.created_at
        }
      } else {
        // 新创建的用户 - 重新查询以获取完整数据
        const { data: createdUser } = await supabaseAdmin
          .from('users')
          .select('id, wallet_address, email, username, created_at')
          .eq('id', userId)
          .single()
        
        completeUserData = {
          id: userId,
          wallet_address: normalizedAddress,
          email: email,
          username: `Web3User${normalizedAddress.slice(-6)}`,
          auth_method: 'walletconnect',
          provider: 'Direct Verification',
          is_web3_user: true,
          created_at: createdUser?.created_at || new Date().toISOString()
        }
      }

      return NextResponse.json({ 
        token,
        user: completeUserData
      })

    } catch (verifyError) {
      console.error('Signature verification error:', verifyError)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Verify signature API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
