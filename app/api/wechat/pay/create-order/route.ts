/**
 * 微信支付创建订单API
 * POST /api/wechat/pay/create-order - 创建微信支付订单
 */

import { NextRequest, NextResponse } from 'next/server'
import { createWechatPay, generateOutTradeNo } from '@/lib/wechat-pay'
import { getWechatUser } from '@/components/wechat/WechatAuth'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { productName, totalAmount, description, orderId } = await request.json()
    
    if (!productName || !totalAmount) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数'
      }, { status: 400 })
    }
    
    // 获取用户信息（这里需要从认证中获取）
    const userAgent = request.headers.get('user-agent') || ''
    const isWechatBrowser = userAgent.toLowerCase().includes('micromessenger')
    
    if (!isWechatBrowser) {
      return NextResponse.json({
        success: false,
        error: '请在微信浏览器中进行支付'
      }, { status: 400 })
    }
    
    // 这里需要从session或token中获取用户的openid
    // 暂时使用请求头或cookie中的openid
    const openid = request.headers.get('x-wechat-openid') || 
                  request.cookies.get('wechat_openid')?.value
    
    if (!openid) {
      return NextResponse.json({
        success: false,
        error: '用户未登录或openid缺失'
      }, { status: 401 })
    }
    
    // 创建微信支付实例
    const wechatPay = createWechatPay()
    
    // 生成商户订单号
    const outTradeNo = orderId || generateOutTradeNo()
    
    // 获取客户端IP
    const clientIP = getClientIP(request)
    
    // 创建订单
    const payOrder = {
      out_trade_no: outTradeNo,
      total_fee: totalAmount,
      body: productName,
      openid: openid,
      spbill_create_ip: clientIP,
      attach: description || '',
      time_expire: getExpireTime(30) // 30分钟过期
    }
    
    const payResult = await wechatPay.createOrder(payOrder)
    
    if (payResult.return_code !== 'SUCCESS' || payResult.result_code !== 'SUCCESS') {
      throw new Error(payResult.return_msg || payResult.err_code_des || '创建订单失败')
    }
    
    // 生成JSAPI支付参数
    const jsApiParams = wechatPay.generateJSAPIParams(payResult.prepay_id!)
    
    // 保存订单信息到数据库
    await saveOrderToDatabase({
      orderId: outTradeNo,
      openid: openid,
      productName,
      totalAmount,
      description,
      prepayId: payResult.prepay_id!,
      status: 'pending'
    })
    
    console.log('微信支付订单创建成功:', outTradeNo)
    
    return NextResponse.json({
      success: true,
      orderId: outTradeNo,
      jsApiParams,
      prepayId: payResult.prepay_id
    })
  } catch (error) {
    console.error('创建微信支付订单失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '创建订单失败'
    }, { status: 500 })
  }
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return '127.0.0.1'
}

function getExpireTime(minutes: number): string {
  const now = new Date()
  const expireTime = new Date(now.getTime() + minutes * 60 * 1000)
  
  return expireTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, '')
}

async function saveOrderToDatabase(orderData: {
  orderId: string
  openid: string
  productName: string
  totalAmount: number
  description?: string
  prepayId: string
  status: string
}) {
  try {
    const { data, error } = await supabase
      .from('wechat_orders')
      .insert({
        order_id: orderData.orderId,
        openid: orderData.openid,
        product_name: orderData.productName,
        total_amount: orderData.totalAmount,
        description: orderData.description,
        prepay_id: orderData.prepayId,
        status: orderData.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    return data
  } catch (error) {
    console.error('保存订单到数据库失败:', error)
    throw error
  }
} 