/**
 * JWT Token验证端点
 * 用于验证Web3用户的JWT token是否有效
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyJWTToken } from '@/lib/jwt-auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Missing or invalid Authorization header',
        code: 'MISSING_TOKEN'
      }, { status: 401 })
    }
    
    const token = authHeader.substring(7)
    
    // 验证JWT token
    const payload = verifyJWTToken(token)
    
    if (!payload) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      }, { status: 401 })
    }
    
    // 返回token信息
    return NextResponse.json({
      success: true,
      valid: true,
      payload: {
        userId: payload.userId,
        email: payload.email,
        authType: payload.authType,
        walletAddress: payload.walletAddress,
        expiresAt: new Date(payload.exp * 1000).toISOString()
      }
    })
    
  } catch (error: any) {
    console.error('Token verification error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Token verification failed',
      code: 'VERIFICATION_ERROR'
    }, { status: 500 })
  }
}