/**
 * 微信授权回调API
 * POST /api/wechat/auth/callback - 处理微信授权回调
 */

import { NextRequest, NextResponse } from 'next/server'
import { createWechatAuth } from '@/lib/wechat-auth'
import { getSupabaseAdminClient } from '@/lib/server/db'

export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json()
    
    if (!code || !state) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数'
      }, { status: 400 })
    }
    
    // 创建微信认证实例
    const wechatAuth = createWechatAuth()
    
    // 验证状态参数
    if (!wechatAuth.validateState(state)) {
      return NextResponse.json({
        success: false,
        error: '无效的状态参数'
      }, { status: 400 })
    }
    
    // 获取访问令牌
    const tokenData = await wechatAuth.getAccessToken(code)
    
    if (!tokenData.access_token) {
      return NextResponse.json({
        success: false,
        error: '获取访问令牌失败'
      }, { status: 400 })
    }
    
    // 获取用户信息
    const userInfo = await wechatAuth.getUserInfo(tokenData.access_token, tokenData.openid)
    
    // 创建或更新Supabase用户
    const supabaseAdmin = getSupabaseAdminClient()
    const { user, session } = await createOrUpdateSupabaseUser(supabaseAdmin, userInfo, tokenData)
    
    console.log('微信用户认证成功:', user)
    
    return NextResponse.json({
      success: true,
      user: user,
      session: session,
      wechat_info: userInfo
    })
  } catch (error) {
    console.error('微信授权回调失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '授权回调失败'
    }, { status: 500 })
  }
}

async function createOrUpdateSupabaseUser(supabaseAdmin: ReturnType<typeof getSupabaseAdminClient>, userInfo: any, tokenData: any) {
  try {
    // 使用OpenID作为邮箱创建唯一标识
    const wechatEmail = `${userInfo.openid}@wechat.local`
    
    // 先检查是否已存在该用户
    const { data: existingUser, error: queryError } = await supabaseAdmin.auth.admin.getUserByEmail(wechatEmail)
    
    if (existingUser && existingUser.user) {
      // 用户已存在，更新用户信息
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.user.id,
        {
          user_metadata: {
            wechat_openid: userInfo.openid,
            wechat_unionid: userInfo.unionid || null,
            nickname: userInfo.nickname,
            avatar_url: userInfo.headimgurl,
            gender: userInfo.sex === 1 ? 'male' : userInfo.sex === 2 ? 'female' : 'unknown',
            city: userInfo.city,
            province: userInfo.province,
            country: userInfo.country,
            auth_type: 'wechat',
            last_login_at: new Date().toISOString()
          }
        }
      )
      
      if (updateError) {
        throw updateError
      }
      
      // 创建会话
      const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.createSession({
        user_id: existingUser.user.id,
        session_data: {}
      })
      
      if (sessionError) {
        throw sessionError
      }
      
      return {
        user: updatedUser.user,
        session: sessionData.session
      }
    } else {
      // 创建新用户
      const { data: newUserData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: wechatEmail,
        email_confirm: true, // 微信用户无需邮箱验证
        user_metadata: {
          wechat_openid: userInfo.openid,
          wechat_unionid: userInfo.unionid || null,
          nickname: userInfo.nickname,
          avatar_url: userInfo.headimgurl,
          gender: userInfo.sex === 1 ? 'male' : userInfo.sex === 2 ? 'female' : 'unknown',
          city: userInfo.city,
          province: userInfo.province,
          country: userInfo.country,
          auth_type: 'wechat',
          // 新用户默认次数
          free_reports_limit: 0,
          chatbot_limit: 0,
          created_at: new Date().toISOString()
        }
      })
      
      if (createError) {
        throw createError
      }
      
      // 创建会话
      const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.createSession({
        user_id: newUserData.user.id,
        session_data: {}
      })
      
      if (sessionError) {
        throw sessionError
      }
      
      return {
        user: newUserData.user,
        session: sessionData.session
      }
    }
  } catch (error) {
    console.error('创建或更新Supabase用户失败:', error)
    throw error
  }
}

// 处理GET请求（用于微信直接跳转）
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  
  if (!code || !state) {
    return NextResponse.redirect(new URL('/auth?error=missing_params', request.url))
  }
  
  try {
    // 调用POST处理逻辑
    const response = await POST(
      new NextRequest(request.url, {
        method: 'POST',
        body: JSON.stringify({ code, state }),
        headers: { 'Content-Type': 'application/json' }
      })
    )
    
    const result = await response.json()
    
    if (result.success) {
      // 成功后重定向到应用首页，并传递session信息
      const redirectUrl = new URL('/home', request.url)
      redirectUrl.searchParams.set('wechat_login', 'success')
      return NextResponse.redirect(redirectUrl)
    } else {
      // 失败后重定向到错误页面
      return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent(result.error)}`, request.url))
    }
  } catch (error) {
    console.error('处理微信授权回调失败:', error)
    return NextResponse.redirect(new URL('/auth?error=callback_failed', request.url))
  }
} 
