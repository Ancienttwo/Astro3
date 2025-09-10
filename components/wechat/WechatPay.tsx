'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, CreditCard, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'

interface WechatPayProps {
  orderInfo: {
    productName: string
    totalAmount: number // 金额（分）
    description?: string
    orderId?: string
  }
  onPaymentSuccess?: (result: any) => void
  onPaymentError?: (error: string) => void
  onPaymentCancel?: () => void
}

interface PaymentStatus {
  status: 'idle' | 'preparing' | 'paying' | 'success' | 'failed' | 'cancelled'
  message?: string
  orderId?: string
}

// 声明微信JSAPI
declare global {
  interface Window {
    WeixinJSBridge: {
      invoke: (
        method: string,
        params: any,
        callback: (result: any) => void
      ) => void
      on: (event: string, callback: () => void) => void
    }
  }
}

export default function WechatPay({
  orderInfo,
  onPaymentSuccess,
  onPaymentError,
  onPaymentCancel
}: WechatPayProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'idle' })
  const [isWechatBrowser, setIsWechatBrowser] = useState(false)
  const [orderId, setOrderId] = useState<string>('')

  useEffect(() => {
    // 检测微信浏览器
    const userAgent = navigator.userAgent.toLowerCase()
    const isWechat = userAgent.includes('micromessenger')
    setIsWechatBrowser(isWechat)

    // 监听微信支付桥接
    if (isWechat && window.WeixinJSBridge) {
      window.WeixinJSBridge.on('menu:share:weibo', () => {
        // 处理微信分享
      })
    }
  }, [])

  const formatAmount = (amount: number): string => {
    return (amount / 100).toFixed(2)
  }

  const handlePayment = async () => {
    if (!isWechatBrowser) {
      toast.error('请在微信中打开此页面进行支付')
      return
    }

    setPaymentStatus({ status: 'preparing', message: '正在准备支付...' })

    try {
      // 1. 创建订单
      const createOrderResponse = await fetch('/api/wechat/pay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: orderInfo.productName,
          totalAmount: orderInfo.totalAmount,
          description: orderInfo.description,
          orderId: orderInfo.orderId
        }),
      })

      if (!createOrderResponse.ok) {
        throw new Error('创建订单失败')
      }

      const orderResult = await createOrderResponse.json()
      
      if (!orderResult.success) {
        throw new Error(orderResult.error || '创建订单失败')
      }

      setOrderId(orderResult.orderId)
      setPaymentStatus({ status: 'paying', message: '正在调起微信支付...' })

      // 2. 调起微信支付
      const { jsApiParams } = orderResult
      
      if (window.WeixinJSBridge) {
        window.WeixinJSBridge.invoke(
          'getBrandWCPayRequest',
          {
            appId: jsApiParams.appId,
            timeStamp: jsApiParams.timeStamp,
            nonceStr: jsApiParams.nonceStr,
            package: jsApiParams.package,
            signType: jsApiParams.signType,
            paySign: jsApiParams.paySign,
          },
          (res) => {
            handlePaymentResult(res, orderResult.orderId)
          }
        )
      } else {
        // 等待微信桥接加载
        setTimeout(() => {
          if (window.WeixinJSBridge) {
            window.WeixinJSBridge.invoke(
              'getBrandWCPayRequest',
              jsApiParams,
              (res) => {
                handlePaymentResult(res, orderResult.orderId)
              }
            )
          } else {
            throw new Error('微信支付环境未准备好')
          }
        }, 1000)
      }
    } catch (error) {
      console.error('Payment error:', error)
      const errorMessage = error instanceof Error ? error.message : '支付失败'
      setPaymentStatus({ status: 'failed', message: errorMessage })
      toast.error(errorMessage)
      onPaymentError?.(errorMessage)
    }
  }

  const handlePaymentResult = async (result: any, orderId: string) => {
    console.log('Payment result:', result)
    
    if (result.err_msg === 'get_brand_wcpay_request:ok') {
      // 支付成功，验证订单状态
      await verifyPaymentStatus(orderId)
    } else if (result.err_msg === 'get_brand_wcpay_request:cancel') {
      // 用户取消支付
      setPaymentStatus({ status: 'cancelled', message: '支付已取消' })
      toast.info('支付已取消')
      onPaymentCancel?.()
    } else {
      // 支付失败
      const errorMessage = result.err_msg || '支付失败'
      setPaymentStatus({ status: 'failed', message: errorMessage })
      toast.error(errorMessage)
      onPaymentError?.(errorMessage)
    }
  }

  const verifyPaymentStatus = async (orderId: string) => {
    try {
      const response = await fetch(`/api/wechat/pay/verify-order?orderId=${orderId}`)
      const result = await response.json()
      
      if (result.success && result.isPaid) {
        setPaymentStatus({ status: 'success', message: '支付成功！' })
        toast.success('支付成功！')
        onPaymentSuccess?.(result)
      } else {
        setPaymentStatus({ status: 'failed', message: '支付验证失败' })
        toast.error('支付验证失败')
        onPaymentError?.('支付验证失败')
      }
    } catch (error) {
      console.error('Verify payment error:', error)
      setPaymentStatus({ status: 'failed', message: '支付验证失败' })
      toast.error('支付验证失败')
      onPaymentError?.('支付验证失败')
    }
  }

  const handleRetry = () => {
    setPaymentStatus({ status: 'idle' })
    setOrderId('')
  }

  const renderPaymentStatus = () => {
    switch (paymentStatus.status) {
      case 'preparing':
        return (
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
            <p className="text-sm text-gray-600">{paymentStatus.message}</p>
          </div>
        )
      
      case 'paying':
        return (
          <div className="text-center space-y-4">
            <CreditCard className="w-8 h-8 mx-auto text-green-500" />
            <p className="text-sm text-gray-600">{paymentStatus.message}</p>
            <p className="text-xs text-gray-500">请在微信支付界面完成支付</p>
          </div>
        )
      
      case 'success':
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="w-8 h-8 mx-auto text-green-500" />
            <p className="text-green-600 font-medium">支付成功！</p>
            <p className="text-sm text-gray-600">感谢您的支持</p>
            {orderId && (
              <p className="text-xs text-gray-500">订单号: {orderId}</p>
            )}
          </div>
        )
      
      case 'failed':
        return (
          <div className="text-center space-y-4">
            <XCircle className="w-8 h-8 mx-auto text-red-500" />
            <p className="text-red-600 font-medium">支付失败</p>
            <p className="text-sm text-gray-600">{paymentStatus.message}</p>
            <Button 
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="w-full"
            >
              重新支付
            </Button>
          </div>
        )
      
      case 'cancelled':
        return (
          <div className="text-center space-y-4">
            <Clock className="w-8 h-8 mx-auto text-yellow-500" />
            <p className="text-yellow-600 font-medium">支付已取消</p>
            <p className="text-sm text-gray-600">您可以重新发起支付</p>
            <Button 
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="w-full"
            >
              重新支付
            </Button>
          </div>
        )
      
      default:
        return (
          <div className="space-y-4">
            {/* 订单信息 */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{orderInfo.productName}</h4>
                  {orderInfo.description && (
                    <p className="text-sm text-gray-600 mt-1">{orderInfo.description}</p>
                  )}
                </div>
                <Badge variant="secondary" className="ml-2">
                  ¥{formatAmount(orderInfo.totalAmount)}
                </Badge>
              </div>
            </div>
            
            {/* 支付信息 */}
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600">支付金额</span>
                <span className="text-2xl font-bold text-green-600">
                  ¥{formatAmount(orderInfo.totalAmount)}
                </span>
              </div>
              
              <div className="text-xs text-gray-500 mb-4">
                支付方式：微信支付
              </div>
              
              <Button 
                onClick={handlePayment}
                disabled={!isWechatBrowser}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                {isWechatBrowser ? (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    立即支付
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    请在微信中打开
                  </>
                )}
              </Button>
            </div>
            
            {!isWechatBrowser && (
              <div className="text-center">
                <p className="text-xs text-red-500">
                  请在微信浏览器中打开此页面进行支付
                </p>
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">微信支付</CardTitle>
        <CardDescription className="text-center">
          安全便捷的支付方式
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderPaymentStatus()}
      </CardContent>
    </Card>
  )
}

// 微信支付环境检测
export function isWechatPayAvailable(): boolean {
  if (typeof window === 'undefined') return false
  
  const userAgent = navigator.userAgent.toLowerCase()
  const isWechat = userAgent.includes('micromessenger')
  
  return isWechat && !!window.WeixinJSBridge
}

// 格式化金额显示
export function formatPaymentAmount(amount: number): string {
  return (amount / 100).toFixed(2)
} 