import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const jwtSecret = process.env.JWT_SECRET || 'your-fallback-secret-key'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables:', {
    hasUrl: !!supabaseUrl,
    hasServiceKey: !!supabaseServiceKey
  })
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// 获取用户使用统计
export async function GET(request: NextRequest) {
  try {
    // 获取用户认证
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    let userId: string | null = null
    let walletAddress: string | null = null
    let isWeb3User = false

    // 尝试解析Web3 JWT token
    try {
      const decoded = jwt.verify(token, jwtSecret) as any
      if (decoded.wallet_address) {
        console.log('🔍 检测到Web3 JWT token:', decoded.wallet_address)
        walletAddress = decoded.wallet_address
        userId = decoded.id || decoded.wallet_address
        isWeb3User = true
      }
    } catch (web3Error) {
      // 如果不是Web3 JWT，尝试Supabase JWT
      console.log('尝试Supabase JWT认证...')
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
      
      if (authError || !user) {
        return NextResponse.json({ error: '用户认证失败' }, { status: 401 })
      }
      
      userId = user.id
      isWeb3User = false
    }

    if (!userId) {
      return NextResponse.json({ error: '无法确定用户ID' }, { status: 401 })
    }

    // 查询或创建用户使用记录
    let { data: userUsage, error: fetchError } = await supabaseAdmin
      .from('user_usage')
      .select('*')
      .eq(isWeb3User ? 'wallet_address' : 'user_id', isWeb3User ? walletAddress : userId)
      .single()

    if (fetchError && fetchError.code === 'PGRST116') {
      // 用户记录不存在，创建新记录
      console.log('🔄 创建新的用户使用记录:', { userId, walletAddress, isWeb3User })
      
      const { data: newUsage, error: createError } = await supabaseAdmin
        .from('user_usage')
        .insert({
          user_id: userId,
          user_email: isWeb3User ? `web3_${walletAddress}@astrozi.app` : '',
          wallet_address: walletAddress,
          user_type: isWeb3User ? 'web3' : 'web2',
          free_reports_limit: 0,
          free_reports_used: 0,
          paid_reports_purchased: 0,
          paid_reports_used: 0,
          chatbot_limit: 0,
          chatbot_used: 0,
          consecutive_checkin_days: 0,
          total_checkin_days: 0
        })
        .select()
        .single()

      if (createError) {
        console.error('创建用户记录失败:', createError)
        console.error('用户信息:', { userId, walletAddress, isWeb3User })
        return NextResponse.json({ 
          error: `创建用户记录失败: ${createError.message}`, 
          details: createError 
        }, { status: 500 })
      }
      userUsage = newUsage
    } else if (fetchError) {
      console.error('查询用户记录失败:', fetchError)
      return NextResponse.json({ error: '查询用户记录失败' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: userUsage
    })

  } catch (error) {
    console.error('用户使用统计API错误:', error)
    return NextResponse.json({ 
      error: '服务器内部错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 更新用户使用统计
export async function PUT(request: NextRequest) {
  try {
    // 获取用户认证
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    let userId: string | null = null
    let walletAddress: string | null = null
    let isWeb3User = false

    // 尝试解析Web3 JWT token
    try {
      const decoded = jwt.verify(token, jwtSecret) as any
      if (decoded.wallet_address) {
        walletAddress = decoded.wallet_address
        userId = decoded.id || decoded.wallet_address
        isWeb3User = true
      }
    } catch (web3Error) {
      // 如果不是Web3 JWT，尝试Supabase JWT
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
      
      if (authError || !user) {
        return NextResponse.json({ error: '用户认证失败' }, { status: 401 })
      }
      
      userId = user.id
      isWeb3User = false
    }

    if (!userId) {
      return NextResponse.json({ error: '无法确定用户ID' }, { status: 401 })
    }

    const body = await request.json()
    const updates = body.updates

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: '更新数据格式错误' }, { status: 400 })
    }

    // 更新用户使用记录
    const { data: updatedUsage, error: updateError } = await supabaseAdmin
      .from('user_usage')
      .update(updates)
      .eq(isWeb3User ? 'wallet_address' : 'user_id', isWeb3User ? walletAddress : userId)
      .select()
      .single()

    if (updateError) {
      console.error('更新用户记录失败:', updateError)
      return NextResponse.json({ error: '更新用户记录失败' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: updatedUsage
    })

  } catch (error) {
    console.error('更新用户使用统计API错误:', error)
    return NextResponse.json({ 
      error: '服务器内部错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}