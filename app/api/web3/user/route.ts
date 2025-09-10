/**
 * Web3用户管理API路由
 * 
 * 处理Web3用户的创建、查找等操作
 * 使用服务端环境变量确保安全性
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { 
  UnifiedWeb3User, 
  CreateWeb3UserParams, 
  WalletIntegrationError 
} from '@/lib/types/wallet-integration'

// 创建服务端Supabase客户端
function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

/**
 * 根据钱包地址查找现有Web3用户
 */
async function findUserByWalletAddress(walletAddress: string): Promise<UnifiedWeb3User | null> {
  const supabaseAdmin = createServerClient()
  const normalizedAddress = walletAddress.toLowerCase()
  
  console.log('🔍 查找Web3用户:', normalizedAddress)

  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('wallet_address', normalizedAddress)
      .eq('auth_type', 'web3')

    if (error) {
      console.error('❌ 查找Web3用户失败:', error)
      throw new WalletIntegrationError(
        `查找用户失败: ${error.message}`,
        'DATABASE_ERROR'
      )
    }

    if (!users || users.length === 0) {
      console.log('👤 未找到Web3用户')
      return null
    }

    const user = users[0]
    console.log('✅ 找到Web3用户:', user.email)

    return {
      id: user.id,
      email: user.email,
      wallet_address: user.wallet_address,
      auth_type: user.auth_type,
      created_at: user.created_at,
      updated_at: user.updated_at,
      is_active: user.is_active
    }
  } catch (error) {
    console.error('❌ 查找Web3用户异常:', error)
    throw error instanceof WalletIntegrationError ? error : 
      new WalletIntegrationError('查找用户时发生未知错误', 'UNKNOWN_ERROR')
  }
}

/**
 * 创建新的Web3用户
 */
async function createWeb3User(params: CreateWeb3UserParams): Promise<UnifiedWeb3User> {
  const supabaseAdmin = createServerClient()
  const normalizedAddress = params.wallet_address.toLowerCase()
  
  console.log('👤 创建Web3用户:', normalizedAddress)

  try {
    // 生成Web3用户邮箱
    const web3Email = `${normalizedAddress}@web3.astrozi.com`
    
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        email: web3Email,
        wallet_address: normalizedAddress,
        auth_type: 'web3',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('❌ 创建Web3用户失败:', error)
      throw new WalletIntegrationError(
        `创建用户失败: ${error.message}`,
        'DATABASE_ERROR'
      )
    }

    if (!newUser || newUser.length === 0) {
      throw new WalletIntegrationError('创建用户后未返回数据', 'DATABASE_ERROR')
    }

    const user = newUser[0]
    console.log('✅ Web3用户创建成功:', user.email)

    return {
      id: user.id,
      email: user.email,
      wallet_address: user.wallet_address,
      auth_type: user.auth_type,
      created_at: user.created_at,
      updated_at: user.updated_at,
      is_active: user.is_active
    }
  } catch (error) {
    console.error('❌ 创建Web3用户异常:', error)
    throw error instanceof WalletIntegrationError ? error : 
      new WalletIntegrationError('创建用户时发生未知错误', 'UNKNOWN_ERROR')
  }
}

/**
 * GET - 根据钱包地址查找用户
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'walletAddress is required' },
        { status: 400 }
      )
    }

    const user = await findUserByWalletAddress(walletAddress)
    
    return NextResponse.json({
      success: true,
      data: { user }
    })
  } catch (error) {
    console.error('❌ GET /api/web3/user 错误:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

/**
 * POST - 获取或创建Web3用户
 */
export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json()

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'walletAddress is required' },
        { status: 400 }
      )
    }

    console.log('🔗 获取或创建Web3用户:', walletAddress)

    // 首先尝试查找现有用户
    const existingUser = await findUserByWalletAddress(walletAddress)
    
    if (existingUser) {
      console.log('✅ 使用现有Web3用户')
      return NextResponse.json({
        success: true,
        data: { user: existingUser }
      })
    }

    // 如果不存在，创建新用户
    console.log('👤 创建新Web3用户')
    const newUser = await createWeb3User({
      wallet_address: walletAddress
    })

    return NextResponse.json({
      success: true,
      data: { user: newUser }
    })
  } catch (error) {
    console.error('❌ POST /api/web3/user 错误:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}