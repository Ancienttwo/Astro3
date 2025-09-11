/**
 * 简单Web3钱包连接端点
 * 只保存钱包地址到数据库，不做复杂认证
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { verifyMessage, isAddress } from 'viem'

// Supabase Admin客户端
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface SimpleConnectRequest {
  wallet_address: string
  network?: string
  wallet_type?: string
  message?: string
  signature?: string
  timestamp?: number
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
            request.headers.get('x-real-ip') || 
            'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  try {
    // 解析请求体
    let requestBody: SimpleConnectRequest
    try {
      requestBody = await request.json()
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: '请求体格式无效',
        code: 'INVALID_REQUEST'
      }, { status: 400 })
    }
    
    const { 
      wallet_address, 
      network = 'bsc', 
      wallet_type = 'unknown',
      message,
      signature,
      timestamp
    } = requestBody
    
    if (!wallet_address) {
      return NextResponse.json({
        success: false,
        error: '缺少钱包地址',
        code: 'MISSING_WALLET_ADDRESS'
      }, { status: 400 })
    }
    
    // 验证钱包地址格式（简单验证）
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet_address) || !isAddress(wallet_address as `0x${string}`)) {
      return NextResponse.json({
        success: false,
        error: '钱包地址格式无效',
        code: 'INVALID_WALLET_ADDRESS'
      }, { status: 400 })
    }
    
    // 如果提供了签名，进行验证
    if (signature && message) {
      try {
        console.log('🔍 Verifying signature...', {
          wallet_address: wallet_address.slice(0, 6) + '...',
          message_length: message.length,
          signature_length: signature.length
        })
        
        // 验证签名时间戳（10分钟内有效）
        if (timestamp && (Date.now() - timestamp) > 10 * 60 * 1000) {
          return NextResponse.json({
            success: false,
            error: 'Signature expired',
            code: 'SIGNATURE_EXPIRED'
          }, { status: 400 })
        }
        
        // 验证签名（viem）
        const ok = await verifyMessage({
          address: wallet_address as `0x${string}`,
          message,
          signature: (signature.startsWith('0x') ? signature : `0x${signature}`) as `0x${string}`,
        })
        if (!ok) {
          console.error('❌ Signature verification failed (viem)')
          return NextResponse.json({
            success: false,
            error: 'Invalid signature',
            code: 'INVALID_SIGNATURE'
          }, { status: 400 })
        }
        
        console.log('✅ Signature verified successfully')
        
      } catch (error: any) {
        console.error('❌ Signature verification error:', error)
        
        return NextResponse.json({
          success: false,
          error: 'Failed to verify signature',
          code: 'SIGNATURE_VERIFICATION_FAILED'
        }, { status: 400 })
      }
    } else if (signature || message) {
      // 如果只提供了签名或消息之一，返回错误
      return NextResponse.json({
        success: false,
        error: 'Both message and signature are required for verification',
        code: 'INCOMPLETE_SIGNATURE_DATA'
      }, { status: 400 })
    }
    
    console.log('🔍 Processing Web3 wallet connection:', {
      wallet_address: wallet_address.slice(0, 6) + '...' + wallet_address.slice(-4),
      network,
      wallet_type,
      ip,
      userAgent: userAgent.slice(0, 50)
    })
    
    // 查找或创建用户
    const result = await findOrCreateUser(wallet_address, network, wallet_type, ip, userAgent)
    
    const responseTime = Date.now() - startTime
    console.log(`✅ Web3 wallet connection successful (${responseTime}ms):`, {
      user_id: result.user.id,
      wallet_address: wallet_address.slice(0, 6) + '...' + wallet_address.slice(-4),
      wallet_type,
      is_new_user: result.isNewUser
    })
    
    return NextResponse.json({
      success: true,
      message: result.isNewUser ? 'New user created' : 'Existing user updated',
      user: {
        id: result.user.id,
        email: result.user.email,
        username: result.user.username,
        wallet_address: result.user.wallet_address,
        wallet_type: result.user.raw_user_meta_data?.wallet_type || 'unknown',
        network: result.user.raw_user_meta_data?.network || network,
        auth_type: 'web3',
        created_at: result.user.created_at
      },
      isNewUser: result.isNewUser
    })
    
  } catch (error: any) {
    const responseTime = Date.now() - startTime
    console.error(`❌ Web3 wallet connection error (${responseTime}ms):`, error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Wallet connection failed',
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 })
  }
}

// 查找或创建用户
async function findOrCreateUser(
  walletAddress: string, 
  network: string, 
  walletType: string,
  ip: string,
  userAgent: string
) {
  try {
    // 1. 先尝试通过钱包地址查找现有用户
    const { data: existingUser, error: findError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single()
    
    if (findError && findError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('查找用户时出错:', findError)
      throw new Error('Failed to query existing user')
    }
    
    if (existingUser) {
      console.log('📍 Found existing user by wallet address:', existingUser.id)
      
      // 检查是否存在对应的Auth用户
      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
      const hasAuthUser = authUsers.users.some(u => u.id === existingUser.id)
      
      if (!hasAuthUser) {
        console.log('🔐 Creating missing Auth user for existing user:', existingUser.id)
        
        // 为现有用户创建Auth记录，使用相同的UUID
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: existingUser.email,
          password: `web3_${walletAddress.toLowerCase()}_login`,
          email_confirm: true,
          user_metadata: {
            wallet_address: walletAddress.toLowerCase(),
            auth_type: 'web3',
            wallet_type: walletType,
            network: network
          }
        })
        
        // 注意：这里创建的Auth用户会有新的UUID，与现有用户不匹配
        // 这是一个限制，因为Supabase不允许指定Auth用户的UUID
        
        if (authError) {
          console.error('⚠️ Failed to create Auth user for existing user:', authError)
          // 继续执行，不阻断更新流程
        } else {
          console.log('✅ Created Auth user for existing user:', authUser.user.id)
        }
      } else {
        console.log('✅ Auth user already exists for user:', existingUser.id)
      }
      
      // 更新现有用户的元数据
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          updated_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          metadata: {
            ...existingUser.metadata,
            wallet_type: walletType,
            network: network,
            last_connection_ip: ip,
            last_connection_user_agent: userAgent,
            last_connection_timestamp: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString()
          }
        })
        .eq('id', existingUser.id)
        .select()
        .single()
      
      if (updateError) {
        console.error('❌ Failed to update existing user:', {
          error: updateError,
          user_id: existingUser.id,
          wallet_address: walletAddress.slice(0, 6) + '...',
          update_data: {
            wallet_type: walletType,
            network: network
          }
        })
        throw new Error(`Failed to update user information: ${updateError.message || updateError}`)
      }
      
      console.log('🔄 Updated existing user wallet info:', updatedUser.id)
      return { user: updatedUser, isNewUser: false }
    }
    
    // 2. 创建新用户
    console.log('🆕 Creating new user for wallet:', walletAddress.slice(0, 6) + '...')
    
    const newUserData = {
      wallet_address: walletAddress.toLowerCase(),
      auth_type: 'web3',
      username: `Wallet User ${walletAddress.slice(-6)}`,
      email: `${walletAddress.toLowerCase()}@astro.web3`, // 使用统一的Web3邮箱格式
      user_type: 'regular',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        wallet_address: walletAddress.toLowerCase(),
        wallet_type: walletType,
        network: network,
        connection_ip: ip,
        connection_user_agent: userAgent,
        connection_timestamp: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString()
      }
    }
    
    // 1. 先在 Supabase Auth 中创建用户
    console.log('🔐 Creating Auth user first...')
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: newUserData.email,
      password: `web3_${walletAddress.toLowerCase()}_login`, // 固定密码模式
      email_confirm: true,
      user_metadata: {
        wallet_address: walletAddress.toLowerCase(),
        auth_type: 'web3',
        wallet_type: walletType,
        network: network
      }
    })
    
    if (authError) {
      console.error('Failed to create Auth user:', authError)
      throw new Error(`Failed to create Auth user: ${authError.message}`)
    }
    
    console.log('✅ Created Auth user:', authUser.user.id)
    
    // 2. 使用 Auth 用户的 UUID 在自定义表中创建用户
    const customUserData = {
      ...newUserData,
      id: authUser.user.id // 使用相同的 UUID
    }
    
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert(customUserData)
      .select()
      .single()
    
    if (createError) {
      console.error('Failed to create custom user:', createError)
      // 如果自定义用户创建失败，清理 Auth 用户
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      throw new Error(`Failed to create custom user: ${createError.message}`)
    }
    
    console.log('✅ Created new Web3 user in both tables:', newUser.id)
    return { user: newUser, isNewUser: true }
    
  } catch (error: any) {
    console.error('findOrCreateUser error:', error)
    throw error
  }
}

// GET endpoint - 检查服务状态
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      service: 'simple_web3_connect',
      available: true,
      supported_networks: ['bsc', 'ethereum', 'polygon'],
      supported_wallets: ['OKX Wallet', 'MetaMask', 'WalletConnect'],
      endpoints: {
        connect: '/api/auth/web3/simple-connect'
      },
      message: 'Simple Web3 wallet connection service is available'
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      service: 'simple_web3_connect',
      available: false,
      error: error.message || 'Service check failed'
    }, { status: 500 })
  }
}
