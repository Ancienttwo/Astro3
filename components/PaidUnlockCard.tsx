import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Lock, Unlock, Star, CheckCircle, CreditCard } from 'lucide-react'
import { SafeIcon, SafeCrown } from '@/components/ui/safe-icon'
import { usePaidReports } from '@/hooks/usePaidReports'
import { STRIPE_CONFIG, formatPrice, getProductInfo } from '@/lib/stripe'

interface PaidUnlockCardProps {
  title: string
  description: string
  features: string[]
  price?: number // 可选，如果不提供则从productId获取
  currency?: string
  productId: keyof typeof STRIPE_CONFIG.products // Stripe产品ID
  reportType: 'ziwei' | 'bazi' | 'comprehensive'
  className?: string
  onPaymentSuccess?: () => void
  children?: React.ReactNode
}

export function PaidUnlockCard({
  title,
  description,
  features,
  price,
  currency = '¥',
  productId,
  reportType,
  className = '',
  onPaymentSuccess,
  children
}: PaidUnlockCardProps) {
  const { loading, error, checkCurrentChartPaidStatus, createStripePayment, clearError } = usePaidReports()
  const [paidStatus, setPaidStatus] = useState<{
    isPaid: boolean
    isExpired: boolean
    paidReport: any
  } | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  // 获取产品信息
  const productInfo = getProductInfo(productId)
  const actualPrice = price || productInfo.price
  const displayPrice = formatPrice(actualPrice)

  // 检查当前排盘的付费状态
  useEffect(() => {
    const checkStatus = async () => {
      setIsChecking(true)
      const status = await checkCurrentChartPaidStatus(reportType)
      setPaidStatus(status)
      setIsChecking(false)
    }

    checkStatus()
  }, [reportType, checkCurrentChartPaidStatus])

  // Stripe支付流程
  const handleStripePayment = async () => {
    try {
      // 从localStorage获取排盘数据
      const storageKey = reportType === 'ziwei' ? 'ziweiChart' : 'baziChart'
      const chartDataStr = localStorage.getItem(storageKey)
      
      if (!chartDataStr) {
        clearError()
        return
      }

      const chartData = JSON.parse(chartDataStr)
      
      // 提取生日信息
      const birthInfo = {
        birthYear: chartData.birthYear || chartData.year,
        birthMonth: chartData.birthMonth || chartData.month,
        birthDay: chartData.birthDay || chartData.day,
        gender: chartData.gender === '男' ? 'male' as const : 'female' as const,
        reportType
      }

      // 创建Stripe支付
      const result = await createStripePayment(birthInfo, productId)

      if (result.success) {
        // 支付成功
        if (onPaymentSuccess) {
          onPaymentSuccess()
        }
        // 重新检查付费状态
        const newStatus = await checkCurrentChartPaidStatus(reportType)
        setPaidStatus(newStatus)
      }
    } catch (err: unknown) {
      console.error('支付处理失败:', err)
    }
  }

  const isPaid = paidStatus?.isPaid && !paidStatus?.isExpired
  const isExpired = paidStatus?.isExpired

  if (isChecking) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-muted-foreground">检查付费状态...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`w-full ${className} ${isPaid ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isPaid ? (
              <Unlock className="h-5 w-5 text-green-600" />
            ) : (
              <Lock className="h-5 w-5 text-orange-600" />
            )}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          
          {isPaid ? (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-3 w-3 mr-1" />
              已解锁
            </Badge>
          ) : (
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <SafeCrown className="h-3 w-3 mr-1" />
              会员价: ¥{Math.round(actualPrice * 0.8)}
            </div>
          )}
        </div>
        
        <CardDescription className="text-sm">
          {isPaid ? '您已购买此功能，可以无限制使用' : description}
        </CardDescription>

        {isExpired && (
          <Alert className="border-red-500 bg-red-50 dark:bg-red-950/20">
            <AlertDescription className="text-red-700 dark:text-red-400">
              您的付费已过期，请重新购买以继续使用高级功能
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 功能列表 */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground mb-2">包含功能：</h4>
          <ul className="space-y-1">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm">
                <Star className={`h-3 w-3 mr-2 ${isPaid ? 'text-green-600' : 'text-orange-600'}`} />
                <span className={isPaid ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'}>
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* 付费状态信息 */}
        {isPaid && paidStatus?.paidReport && (
          <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
            <div className="text-sm space-y-1">
              <p className="font-medium text-green-800 dark:text-green-400">付费信息</p>
              <p className="text-green-700 dark:text-green-300">
                购买时间: {new Date(paidStatus.paidReport.paymentTime).toLocaleDateString('zh-CN')}
              </p>
              <p className="text-green-700 dark:text-green-300">
                访问级别: {paidStatus.paidReport.accessLevel === 'premium' ? '高级版' : '基础版'}
              </p>
              {paidStatus.paidReport.isLifetime && (
                <p className="text-green-700 dark:text-green-300">有效期: 终身有效</p>
              )}
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <Alert className="border-red-500 bg-red-50 dark:bg-red-950/20">
            <AlertDescription className="text-red-700 dark:text-red-400">
              {error}
              <Button 
                variant="link" 
                size="sm" 
                onClick={clearError}
                className="ml-2 h-auto p-0 text-red-700 dark:text-red-400"
              >
                关闭
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* 内容区域 */}
        {isPaid ? (
          <div className="pt-2">
            {children}
          </div>
        ) : (
          <div className="space-y-4">
            {/* 预览内容（模糊处理） */}
            <div className="relative">
              <div className="filter blur-sm opacity-50 pointer-events-none">
                {children}
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80">
                <div className="text-center">
                  <Lock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-400">
                    解锁后可查看完整内容
                  </p>
                </div>
              </div>
            </div>

            {/* Stripe支付按钮 */}
            <Button 
              onClick={handleStripePayment}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  处理中...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  立即解锁 {displayPrice}
                </>
              )}
            </Button>

            {/* 支付说明 */}
            <div className="text-center text-xs text-muted-foreground space-y-1">
              <p>💳 支持信用卡、借记卡安全支付</p>
              <p>🔒 256位SSL加密保护您的支付信息</p>
              <p>✅ 支付成功后立即解锁，终身有效</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 