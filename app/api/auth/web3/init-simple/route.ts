import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { web3SessionManager } from '@/lib/web3-sessions'

interface Web3InitRequest {
  walletAddress: string
}

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    let requestBody: Web3InitRequest
    try {
      requestBody = await request.json()
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: '请求体格式无效'
      }, { status: 400 })
    }
    
    const { walletAddress } = requestBody
    
    // 基本验证
    if (!walletAddress) {
      return NextResponse.json({
        success: false,
        error: '钱包地址不能为空'
      }, { status: 400 })
    }
    
    // 简单的以太坊地址格式验证
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json({
        success: false,
        error: '钱包地址格式无效'
      }, { status: 400 })
    }
    
    // 生成nonce和消息
    const nonce = uuidv4()
    const issuedAt = new Date()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10分钟后过期
    const requestId = uuidv4()
    
    // 创建简化的签名消息
    const domain = 'astrozi.com'
    const message = `${domain} wants you to sign in with your Ethereum account:
${walletAddress}

AstroZi Web3 Authentication - Secure access to your personalized astrology platform.

URI: https://astrozi.com
Version: 1
Chain ID: 97
Nonce: ${nonce}
Issued At: ${issuedAt.toISOString()}
Expiration Time: ${expiresAt.toISOString()}
Request ID: ${requestId}`
    
    // 使用改进的会话管理器保存会话
    await web3SessionManager.saveSession(nonce, {
      walletAddress: walletAddress.toLowerCase(),
      message,
      nonce,
      expiresAt,
      createdAt: issuedAt
    })
    
    // 异步清理过期会话（不阻塞响应）
    web3SessionManager.cleanExpiredSessions().catch(err => 
      console.error('清理过期会话失败:', err)
    )
    
    console.log(`✅ Web3 auth init successful for ${walletAddress}`)
    
    return NextResponse.json({
      success: true,
      nonce,
      message,
      expiresAt: expiresAt.toISOString(),
      requestId
    })
    
  } catch (error: any) {
    console.error('Web3 auth init error:', error)
    
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}