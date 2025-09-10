"use client";

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Zap, 
  Star, 
  Check,
  ShoppingCart,
  Gift,
  ExternalLink
} from 'lucide-react'
import { SafeCrown } from '@/components/ui/safe-icon'
import { useUserUsage } from '@/hooks/useUserUsage'
import { cn } from '@/lib/utils'
import { STRIPE_CONFIG, getReportProduct, formatPrice, redirectToStripeCheckout } from '@/lib/stripe'

interface PurchaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface PurchaseOption {
  id: string
  name: string
  description: string
  count: number
  price: number
  stripeUrl: string
  popular?: boolean
  features: string[]
}

// 使用新的Stripe配置
const purchaseOptions: PurchaseOption[] = [
  {
    id: 'basic',
    name: STRIPE_CONFIG.reports.basic.name,
    description: `${STRIPE_CONFIG.reports.basic.count}次AI分析`,
    count: STRIPE_CONFIG.reports.basic.count,
    price: STRIPE_CONFIG.reports.basic.price,
    stripeUrl: STRIPE_CONFIG.reports.basic.stripeUrl,
    features: STRIPE_CONFIG.reports.basic.features
  },
  {
    id: 'standard',
    name: STRIPE_CONFIG.reports.standard.name,
    description: `${STRIPE_CONFIG.reports.standard.count}次AI分析`,
    count: STRIPE_CONFIG.reports.standard.count,
    price: STRIPE_CONFIG.reports.standard.price,
    stripeUrl: STRIPE_CONFIG.reports.standard.stripeUrl,
    popular: STRIPE_CONFIG.reports.standard.popular,
    features: STRIPE_CONFIG.reports.standard.features
  },
  {
    id: 'premium',
    name: STRIPE_CONFIG.reports.premium.name,
    description: `${STRIPE_CONFIG.reports.premium.count}次AI分析`,
    count: STRIPE_CONFIG.reports.premium.count,
    price: STRIPE_CONFIG.reports.premium.price,
    stripeUrl: STRIPE_CONFIG.reports.premium.stripeUrl,
    features: STRIPE_CONFIG.reports.premium.features
  }
]

export function PurchaseDialog({ open, onOpenChange }: PurchaseDialogProps) {
  const { usage, loading } = useUserUsage()
  const [selectedOption, setSelectedOption] = useState<string>('')

  const handlePurchase = async (option: PurchaseOption) => {
    try {
      // 直接跳转到Stripe支付页面
      redirectToStripeCheckout(option.stripeUrl)
    } catch (error: any) {
      alert(`支付页面打开失败：${error.message}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            购买AI分析次数
          </DialogTitle>
        </DialogHeader>

        {/* 当前使用状态 */}
        {usage && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-slate-600 rounded-full">
                  <Zap className="h-5 w-5 text-purple-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">当前状态</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    免费次数: {usage.remainingFreeReports}/{usage.freeReportsLimit} | 
                    付费次数: {usage.remainingPaidReports}/{usage.paidReportsPurchased}
                  </p>
                </div>
              </div>
              {usage.isPremiumUser && (
                <Badge variant="default" className="bg-yellow-500 text-white">
                  <SafeCrown className="h-3 w-3 mr-1" />
                  VIP会员
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* 购买选项 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {purchaseOptions.map((option) => (
            <Card 
              key={option.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-lg",
                selectedOption === option.id && "ring-2 ring-purple-500 dark:ring-amber-400",
                option.popular && "border-purple-500 dark:border-amber-400 scale-105"
              )}
              onClick={() => setSelectedOption(option.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {option.popular ? (
                      <Star className="h-5 w-5 text-purple-500" />
                    ) : (
                      <Gift className="h-5 w-5 text-green-500" />
                    )}
                    {option.name}
                  </CardTitle>
                  {option.popular && (
                    <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 text-xs">
                      推荐
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* 价格 */}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-purple-600 dark:text-amber-400">
                    {formatPrice(option.price)}
                  </span>
                  {option.count > 1 && (
                    <span className="text-sm text-muted-foreground">
                      (¥{(option.price / option.count).toFixed(1)}/次)
                    </span>
                  )}
                </div>

                {/* 功能列表 */}
                <ul className="space-y-2">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* 购买按钮 */}
                <Button
                  className={cn(
                    "w-full",
                    option.popular && "bg-purple-500 hover:bg-purple-600 text-white"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePurchase(option)
                  }}
                  disabled={loading}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {`支付 ${formatPrice(option.price)}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 说明文字 */}
        <div className="text-center text-sm text-muted-foreground space-y-2 pt-4 border-t">
          <p>• 点击购买按钮将跳转到安全的Stripe支付页面</p>
          <p>• 支持信用卡、支付宝、微信支付等多种支付方式</p>
          <p>• 购买成功后次数将自动充值到您的账户</p>
          <p>• 购买的次数永久有效，支持删除记录后重新生成</p>
        </div>
      </DialogContent>
    </Dialog>
  )
} 