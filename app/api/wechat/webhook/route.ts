/**
 * 微信服务器配置验证API
 * GET /api/wechat/webhook - 微信服务器配置验证
 * POST /api/wechat/webhook - 接收微信消息推送
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// 微信服务器配置的Token（需要在环境变量中配置）
const WECHAT_TOKEN = process.env.WECHAT_TOKEN || 'your_wechat_token_here'

/**
 * 验证微信服务器配置
 * 微信会发送GET请求来验证服务器配置
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const signature = searchParams.get('signature')
    const timestamp = searchParams.get('timestamp')
    const nonce = searchParams.get('nonce')
    const echostr = searchParams.get('echostr')

    console.log('微信服务器配置验证请求:', {
      signature,
      timestamp,
      nonce,
      echostr: echostr?.substring(0, 10) + '...'
    })

    if (!signature || !timestamp || !nonce || !echostr) {
      console.error('微信验证参数缺失')
      return NextResponse.json({
        error: '参数缺失'
      }, { status: 400 })
    }

    // 验证签名
    const isValid = verifySignature(signature, timestamp, nonce, WECHAT_TOKEN)
    
    if (isValid) {
      console.log('✅ 微信服务器配置验证成功')
      // 验证成功，返回echostr
      return new NextResponse(echostr, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain'
        }
      })
    } else {
      console.error('❌ 微信服务器配置验证失败')
      return NextResponse.json({
        error: '签名验证失败'
      }, { status: 403 })
    }
  } catch (error) {
    console.error('微信服务器配置验证异常:', error)
    return NextResponse.json({
      error: '服务器错误'
    }, { status: 500 })
  }
}

/**
 * 接收微信消息推送
 * 微信会发送POST请求推送用户消息和事件
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const signature = searchParams.get('signature')
    const timestamp = searchParams.get('timestamp')
    const nonce = searchParams.get('nonce')

    if (!signature || !timestamp || !nonce) {
      return NextResponse.json({
        error: '参数缺失'
      }, { status: 400 })
    }

    // 验证签名
    const isValid = verifySignature(signature, timestamp, nonce, WECHAT_TOKEN)
    
    if (!isValid) {
      console.error('微信消息推送签名验证失败')
      return NextResponse.json({
        error: '签名验证失败'
      }, { status: 403 })
    }

    // 获取消息内容
    const body = await request.text()
    console.log('收到微信消息推送:', body)

    // 这里可以解析XML消息并进行相应处理
    // 暂时返回success表示已收到消息
    return new NextResponse('success', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  } catch (error) {
    console.error('处理微信消息推送异常:', error)
    return NextResponse.json({
      error: '服务器错误'
    }, { status: 500 })
  }
}

/**
 * 验证微信签名
 * @param signature 微信签名
 * @param timestamp 时间戳
 * @param nonce 随机字符串
 * @param token 配置的Token
 * @returns 是否验证通过
 */
function verifySignature(signature: string, timestamp: string, nonce: string, token: string): boolean {
  try {
    // 1. 将token、timestamp、nonce三个参数进行字典序排序
    const params = [token, timestamp, nonce].sort()
    
    // 2. 将三个参数字符串拼接成一个字符串进行sha1加密
    const str = params.join('')
    const hash = crypto.createHash('sha1').update(str).digest('hex')
    
    // 3. 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
    const result = hash === signature
    
    console.log('微信签名验证:', {
      params,
      str,
      hash,
      signature,
      result
    })
    
    return result
  } catch (error) {
    console.error('签名验证异常:', error)
    return false
  }
} 