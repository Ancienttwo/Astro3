import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// 生成随机推荐码
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 确保推荐码唯一性
async function generateUniqueCode(): Promise<string> {
  let attempts = 0
  const maxAttempts = 10
  
  while (attempts < maxAttempts) {
    const code = generateReferralCode()
    
    // 检查代码是否已存在
    const { data: existing } = await supabaseAdmin
      .from('referral_codes')
      .select('id')
      .eq('code', code)
      .single()
    
    if (!existing) {
      return code
    }
    
    attempts++
  }
  
  throw new Error('无法生成唯一推荐码，请稍后重试')
}

// 查询推荐码信息
export async function GET(request: NextRequest) {
  try {
    console.log('查询用户推荐码...')
    
    // 获取用户认证
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: '需要登录',
        details: '请先登录后再查询推荐码'
      }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: '需要登录',
        details: '用户认证失败'
      }, { status: 401 })
    }

    console.log(`查询用户 ${user.email} 的推荐码`)

    // 查询用户的推荐码信息
    const { data: referralCode, error: queryError } = await supabaseAdmin
      .from('referral_codes')
      .select(`
        *,
        referral_usage:referral_usage(
          id,
          referee_email,
          referrer_reward,
          referee_reward,
          status,
          created_at,
          reward_granted_at
        )
      `)
      .eq('user_id', user.id)
      .single()

    if (queryError && queryError.code !== 'PGRST116') {
      console.error('查询推荐码失败:', queryError)
      return NextResponse.json({
        success: false,
        error: '查询推荐码失败',
        details: queryError.message
      }, { status: 500 })
    }

    if (!referralCode) {
      // 用户还没有推荐码
      return NextResponse.json({
        success: true,
        message: '尚未生成推荐码',
        data: null,
        timestamp: new Date().toISOString()
      })
    }

    // 构造返回数据
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3007'
    const shareUrl = `${baseUrl}/auth?ref=${referralCode.code}`
    
    return NextResponse.json({
      success: true,
      message: '推荐码查询成功',
      data: {
        code: referralCode.code,
        totalReferred: referralCode.total_referred,
        totalRewards: referralCode.total_rewards,
        createdAt: referralCode.created_at,
        records: referralCode.referral_usage || [],
        shareUrl,
        shareText: `快来试试这个超准超专业的AI命理分析工具！使用我的推荐码 ${referralCode.code} 注册可获得额外免费次数！`,
        isExisting: true
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('查询推荐码失败:', error)
    return NextResponse.json({
      success: false,
      error: '查询推荐码失败',
      details: (error as Error).message
    }, { status: 500 })
  }
}

// 生成推荐码
export async function POST(request: NextRequest) {
  try {
    console.log('开始生成推荐码...')
    
    // 获取用户认证
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: '需要登录',
        details: '请先登录后再生成推荐码'
      }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: '需要登录',
        details: '用户认证失败'
      }, { status: 401 })
    }

    console.log(`为用户 ${user.email} 生成推荐码`)

    // 1. 检查用户是否已有推荐码
    const { data: existingCode, error: checkError } = await supabaseAdmin
      .from('referral_codes')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('检查推荐码失败:', checkError)
      return NextResponse.json({
        success: false,
        error: '检查推荐码失败',
        details: checkError.message
      }, { status: 500 })
    }

    if (existingCode) {
      console.log('用户已有推荐码:', existingCode.code)
      
      // 构造返回数据
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3007'
      const shareUrl = `${baseUrl}/auth?ref=${existingCode.code}`
      
      return NextResponse.json({
        success: true,
        message: '您的推荐码已存在',
        data: {
          code: existingCode.code,
          totalReferred: existingCode.total_referred,
          totalRewards: existingCode.total_rewards,
          createdAt: existingCode.created_at,
          records: [],
          shareUrl,
          shareText: `快来试试这个超准超专业的AI命理分析工具！使用我的推荐码 ${existingCode.code} 注册可获得额外免费次数！`,
          isExisting: true
        },
        timestamp: new Date().toISOString()
      })
    }

    // 2. 生成新的推荐码
    console.log('生成新推荐码...')
    const code = await generateUniqueCode()

    // 3. 保存到数据库
    const { data: newReferralCode, error: insertError } = await supabaseAdmin
      .from('referral_codes')
      .insert({
        user_id: user.id,
        user_email: user.email!.toLowerCase(),
        code,
        total_referred: 0,
        total_rewards: 0
      })
      .select()
      .single()

    if (insertError) {
      console.error('保存推荐码失败:', insertError)
      return NextResponse.json({
        success: false,
        error: '生成推荐码失败',
        details: insertError.message
      }, { status: 500 })
    }

    console.log(`推荐码生成成功: ${code} (用户: ${user.email})`)

    // 构造返回数据
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3007'
    const shareUrl = `${baseUrl}/auth?ref=${code}`
    
    return NextResponse.json({
      success: true,
      message: '推荐码生成成功！',
      data: {
        code,
        totalReferred: 0,
        totalRewards: 0,
        createdAt: newReferralCode.created_at,
        records: [],
        shareUrl,
        shareText: `快来试试这个超准超专业的AI命理分析工具！使用我的推荐码 ${code} 注册可获得额外免费次数！`,
        isExisting: false
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('推荐码生成失败:', error)
    return NextResponse.json({
      success: false,
      error: '推荐码生成失败',
      details: (error as Error).message
    }, { status: 500 })
  }
} 