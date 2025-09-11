import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'
import { CacheManager } from '@/lib/redis-cache'
import { invalidateByExactPath } from '@/lib/edge/invalidate'

// 使用服务端角色的supabase客户端来绕过RLS
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

// 管理员邮箱列表
const getAdminEmails = (): string[] => {
  const adminEmails = process.env.ADMIN_EMAILS
  if (!adminEmails) {
    // 管理页面已独立运作，直接返回兜底管理员
    return ['doraable3@gmail.com'] // 兜底管理员
  }
  const emails = adminEmails.split(',').map(email => email.trim().toLowerCase()).filter(Boolean)
  return emails
}

// 检查用户是否为管理员
async function isUserAdmin(token: string): Promise<boolean> {
  try {
    // 验证token并获取用户信息
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user || !user.email) {
      return false
    }

    // 检查用户邮箱是否在管理员列表中
    const adminEmails = getAdminEmails()
    const isAdmin = adminEmails.includes(user.email.toLowerCase())
    
    return isAdmin
  } catch (error) {
    console.error('检查管理员权限失败:', error)
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    // 获取认证token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '缺少认证token' }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // 验证管理员权限
    const isAdmin = await isUserAdmin(token)
    if (!isAdmin) {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
    }

    const { userEmails, reportCredits, chatbotCredits, reason, activityName } = await req.json()
    console.log('📋 接收到的请求数据:', { userEmails, reportCredits, chatbotCredits, reason, activityName })

    if (!userEmails || !Array.isArray(userEmails)) {
      return NextResponse.json({ error: '用户邮箱列表不能为空' }, { status: 400 })
    }

    if (!reportCredits && !chatbotCredits) {
      return NextResponse.json({ error: '报告次数和Chatbot次数至少要填写一个' }, { status: 400 })
    }

    const results = []

    // 批量处理用户
    for (const email of userEmails) {
      try {
        console.log(`👤 开始处理用户: ${email}`)
        
        // 1. 检查用户是否存在
        const { data: userData, error: userError } = await supabaseAdmin
          .from('user_usage')
          .select('*')
          .eq('user_email', email)
          .single()

        if (userError && userError.code !== 'PGRST116') {
          console.error(`❌ 查询用户 ${email} 失败:`, userError)
          results.push({ email, status: 'error', message: '用户查询失败' })
          continue
        }

        console.log(`📊 用户 ${email} 当前数据:`, userData)

        // 2. 准备更新数据
        const updateData: Record<string, string | number> = {
          user_email: email,
          updated_at: new Date().toISOString()
        }

        // 添加报告次数 - 修复：管理员发放的应该是付费报告，不是免费报告
        if (reportCredits && reportCredits > 0) {
          updateData.paid_reports_purchased = (userData?.paid_reports_purchased || 0) + reportCredits
        }

        // 添加Chatbot次数 - 保持原有逻辑，因为chatbot没有free/paid区分
        if (chatbotCredits && chatbotCredits > 0) {
          updateData.chatbot_limit = (userData?.chatbot_limit || 0) + chatbotCredits
        }

        console.log(`💾 准备更新用户 ${email} 的数据:`, updateData)

        // 3. 更新用户次数 - 修复：使用update而不是upsert
        let updateResult
        if (userData) {
          // 用户存在，直接更新 - 修复：更新正确的字段
          const updateFields: Record<string, any> = {
            updated_at: updateData.updated_at
          }
          
          // 只更新实际修改的字段
          if (updateData.paid_reports_purchased !== undefined) {
            updateFields.paid_reports_purchased = updateData.paid_reports_purchased
          }
          if (updateData.chatbot_limit !== undefined) {
            updateFields.chatbot_limit = updateData.chatbot_limit
          }
          
          updateResult = await supabaseAdmin
            .from('user_usage')
            .update(updateFields)
            .eq('user_email', email)
        } else {
          // 用户不存在，创建新记录
          updateResult = await supabaseAdmin
            .from('user_usage')
            .insert(updateData)
        }

        if (updateResult.error) {
          console.error(`❌ 更新用户 ${email} 次数失败:`, updateResult.error)
          results.push({ email, status: 'error', message: `次数更新失败: ${updateResult.error.message}` })
          continue
        }

        console.log(`✅ 用户 ${email} 次数更新成功`)

        // 缓存失效：尝试根据邮箱查找用户ID并清除其缓存
        try {
          const { data: userByEmail } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase())
            .single()
          if (userByEmail?.id) {
            await CacheManager.clearUserCache(userByEmail.id)
          }
        } catch {}
        try { await invalidateByExactPath('/api/user-usage', 'user') } catch {}

        // 4. 尝试记录派发历史（如果表存在的话）
        const grantReason = reason || `管理员派发 - ${activityName || '手动添加'}`
        
        try {
          if (reportCredits && reportCredits > 0) {
            await supabaseAdmin
              .from('credit_grants')
              .insert({
                user_email: email,
                credits: reportCredits,
                credit_type: 'paid_report',
                source: 'admin_grant',
                reason: `${grantReason} (付费报告次数)`,
                granted_at: new Date().toISOString()
              })
          }

          if (chatbotCredits && chatbotCredits > 0) {
            await supabaseAdmin
              .from('credit_grants')
              .insert({
                user_email: email,
                credits: chatbotCredits,
                credit_type: 'chatbot',
                source: 'admin_grant',
                reason: `${grantReason} (Chatbot次数)`,
                granted_at: new Date().toISOString()
              })
          }
          
          console.log(`📝 用户 ${email} 的派发历史记录成功`)
        } catch (grantError) {
          console.warn(`⚠️ 记录派发历史失败 (不影响主要功能):`, grantError)
          // 不影响主要功能，继续执行
        }

        results.push({ 
          email, 
          status: 'success', 
          reportCredits: reportCredits || 0,
          chatbotCredits: chatbotCredits || 0
        })

      } catch (error) {
        console.error(`❌ 处理用户 ${email} 失败:`, error)
        results.push({ email, status: 'error', message: `处理失败: ${error}` })
      }
    }

    // 统计结果
    const successful = results.filter(r => r.status === 'success').length
    const failed = results.filter(r => r.status === 'error').length

    const summaryMessage = []
    if (reportCredits && reportCredits > 0) {
      summaryMessage.push(`${reportCredits}次报告`)
    }
    if (chatbotCredits && chatbotCredits > 0) {
      summaryMessage.push(`${chatbotCredits}次Chatbot`)
    }

    const finalMessage = `批量派发完成：${summaryMessage.join('+')} - 成功 ${successful} 个，失败 ${failed} 个`
    console.log('🎉 ' + finalMessage)

    return NextResponse.json({
      message: finalMessage,
      results,
      summary: { successful, failed, total: userEmails.length }
    })

  } catch (error) {
    console.error('❌ 批量派发次数失败:', error)
    return NextResponse.json({ error: `服务器错误: ${error}` }, { status: 500 })
  }
} 
