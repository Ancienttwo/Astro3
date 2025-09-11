import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { CacheManager } from '@/lib/redis-cache'
import { invalidateByExactPath } from '@/lib/edge/invalidate'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    console.log('开始处理推荐奖励...')
    
    const { referralCode, newUserEmail } = await request.json()
    
    if (!referralCode || !newUserEmail) {
      return NextResponse.json({
        success: false,
        error: '参数错误',
        details: '推荐码和新用户邮箱不能为空'
      }, { status: 400 })
    }

    console.log(`处理推荐: 推荐码=${referralCode}, 新用户=${newUserEmail}`)

    // 1. 验证推荐码是否存在
    const { data: referralCodeData, error: codeError } = await supabaseAdmin
      .from('referral_codes')
      .select('*')
      .eq('code', referralCode.toUpperCase())
      .single()

    if (codeError || !referralCodeData) {
      console.error('推荐码不存在:', referralCode)
      return NextResponse.json({
        success: false,
        error: '推荐码无效',
        details: '推荐码不存在或已失效'
      }, { status: 400 })
    }

    const referrerEmail = referralCodeData.user_email
    console.log(`找到推荐人: ${referrerEmail}`)

    // 2. 检查是否已经处理过这个用户的推荐
    const { data: existingRecord, error: existingError } = await supabaseAdmin
      .from('referral_usage')
      .select('*')
      .eq('referral_code_id', referralCodeData.id)
      .eq('referee_email', newUserEmail.toLowerCase())
      .single()

    if (existingRecord && !existingError) {
      console.log('该用户已经使用过此推荐码')
      return NextResponse.json({
        success: false,
        error: '已使用推荐码',
        details: '您已经使用过此推荐码'
      }, { status: 400 })
    }

    // 3. 防止自我推荐
    if (referrerEmail.toLowerCase() === newUserEmail.toLowerCase()) {
      console.log('检测到自我推荐')
      return NextResponse.json({
        success: false,
        error: '无效推荐',
        details: '不能使用自己的推荐码'
      }, { status: 400 })
    }

    console.log('推荐验证通过，开始发放奖励...')

    // 4. 记录推荐使用
    const { data: usageRecord, error: usageError } = await supabaseAdmin
      .from('referral_usage')
      .insert({
        referral_code_id: referralCodeData.id,
        referrer_user_id: referralCodeData.user_id,
        referrer_email: referrerEmail,
        referee_email: newUserEmail.toLowerCase(),
        referrer_reward: 3, // 推荐人获得3次
        referee_reward: 3,  // 被推荐人获得3次
        status: 'completed',
        reward_granted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (usageError) {
      console.error('记录推荐使用失败:', usageError)
      return NextResponse.json({
        success: false,
        error: '记录推荐失败',
        details: usageError.message
      }, { status: 500 })
    }

    console.log('推荐记录创建成功:', usageRecord.id)

    // 5. 给推荐人发放3次奖励
    try {
      await grantReward(referrerEmail, 3, `推荐奖励 - 成功推荐 ${newUserEmail}`, usageRecord.id)
      console.log(`推荐人 ${referrerEmail} 奖励发放成功`)
    } catch (error) {
      console.error('推荐人奖励发放失败:', error)
    }

    // 6. 给被推荐人发放3次奖励
    try {
      await grantReward(newUserEmail, 3, `新用户奖励 - 通过推荐码 ${referralCode} 注册`, usageRecord.id)
      console.log(`被推荐人 ${newUserEmail} 奖励发放成功`)
    } catch (error) {
      console.error('被推荐人奖励发放失败:', error)
    }

    // 7. 更新推荐码统计
    const { error: updateError } = await supabaseAdmin
      .from('referral_codes')
      .update({
        total_referred: referralCodeData.total_referred + 1,
        total_rewards: referralCodeData.total_rewards + 6 // 推荐人3次 + 被推荐人3次
      })
      .eq('id', referralCodeData.id)

    if (updateError) {
      console.error('更新推荐码统计失败:', updateError)
    }

    console.log('推荐奖励处理完成')

    return NextResponse.json({
      success: true,
      message: '推荐奖励处理成功',
      data: {
        referrerEmail,
        referrerReward: 3,
        refereeReward: 3,
        totalRewards: 6
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('推荐奖励处理失败:', error)
    return NextResponse.json({
      success: false,
      error: '推荐奖励处理失败',
      details: (error as Error).message
    }, { status: 500 })
  }
}

// 奖励发放辅助函数
async function grantReward(userEmail: string, credits: number, reason: string, referralRecordId?: number) {
  // 1. 更新用户次数
  const { data: userUsage, error: usageQueryError } = await supabaseAdmin
    .from('user_usage')
    .select('*')
    .eq('user_email', userEmail.toLowerCase())
    .single()

  if (usageQueryError && usageQueryError.code !== 'PGRST116') {
    console.error('查询用户使用情况失败:', usageQueryError)
  }

  // 2. 计算推荐奖励，确保不超过累积上限
  const currentFreeReportsAvailable = (userUsage?.free_reports_limit || 0) - (userUsage?.free_reports_used || 0)
  const maxFreeReportsCanAdd = Math.max(0, 10 - currentFreeReportsAvailable)
  const actualCredits = Math.min(credits, maxFreeReportsCanAdd)
  
  // 3. 更新或创建用户使用记录
  const { error: updateError } = await supabaseAdmin
    .from('user_usage')
    .upsert({
      user_email: userEmail.toLowerCase(),
      free_reports_limit: (userUsage?.free_reports_limit || 0) + actualCredits,
      free_reports_used: userUsage?.free_reports_used || 0,
      chatbot_limit: userUsage?.chatbot_limit || 0,
      chatbot_used: userUsage?.chatbot_used || 0,
      updated_at: new Date().toISOString()
    })

  if (updateError) {
    console.error('更新用户次数失败:', updateError)
    throw new Error(`更新用户次数失败: ${updateError.message}`)
  }

  // 3. 记录奖励发放历史
  const { error: grantError } = await supabaseAdmin
    .from('credit_grants')
    .insert({
      user_email: userEmail.toLowerCase(),
      credits: credits,
      source: 'referral_reward',
      reason: reason,
      referral_record_id: referralRecordId,
      granted_at: new Date().toISOString()
    })

  if (grantError) {
    console.error('记录奖励发放历史失败:', grantError)
    // 记录失败不影响奖励发放
  }

  console.log(`成功为用户 ${userEmail} 发放 ${credits} 次奖励`)

  // 缓存失效：尝试根据邮箱清理用户缓存
  try {
    const { data: userByEmail } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', userEmail.toLowerCase())
      .single()
    if (userByEmail?.id) {
      await CacheManager.clearUserCache(userByEmail.id)
    }
  } catch {}
  try { await invalidateByExactPath('/api/user-usage', 'user') } catch {}
}
