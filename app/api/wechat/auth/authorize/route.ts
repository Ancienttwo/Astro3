/**
 * 微信授权跳转API
 * GET /api/wechat/auth/authorize - 生成微信授权URL
 */

import { NextRequest, NextResponse } from 'next/server'
import { createWechatAuth } from '@/lib/wechat-auth'

export async function POST(request: NextRequest) {
  try {
    const { redirect_url } = await request.json()
    
    // 创建微信认证实例
    const wechatAuth = createWechatAuth()
    
    // 生成状态参数
    const state = generateState()
    
    // 生成授权URL
    const authUrl = wechatAuth.getAuthUrl(state)
    
    // 可以在这里保存state到数据库或Redis，用于后续验证
    // 示例：await saveStateToCache(state, { redirect_url, timestamp: Date.now() })
    
    console.log('Generated auth URL:', authUrl)
    
    return NextResponse.json({
      success: true,
      authUrl,
      state
    })
  } catch (error) {
    console.error('微信授权失败:', error)
    
    // 检查是否是配置缺失错误
    const errorMessage = error instanceof Error ? error.message : '授权失败'
    if (errorMessage.includes('微信认证配置缺失')) {
      return NextResponse.json({
        success: false,
        error: '微信登录功能暂未配置，请使用 Web3 登录',
        code: 'WECHAT_CONFIG_MISSING'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 })
  }
}

function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
} 
