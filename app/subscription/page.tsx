'use client'

import React, { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n/useI18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SafeCrown, SafeCheck, SafeSparkles, SafeExternalLink } from '@/components/ui/safe-icon'
import { Wallet, CreditCard } from 'lucide-react'
import AuthGuard from '@/components/AuthGuard'
import SmartLayout from '@/components/SmartLayout'
import { STRIPE_CONFIG, formatPrice, redirectToStripeCheckout } from '@/lib/stripe'
import { getCurrentUnifiedUser } from '@/lib/auth'
import { apiClient } from '@/lib/api-client'

// BSC Payment Configuration
const BSC_PAYMENT_CONFIG = {
  recipientAddress: '0xa047FFa6923BfE296B633A7b88f37dFcaAB93Cf3',
  chainId: 56, // BSC Mainnet
  prices: {
    oneday: '1.49', // USDT
    monthly: '19.99', // USDT
    halfyear: '89.99', // USDT
    yearly: '149.99' // USDT
  }
}

interface PricingPlan {
  id: string
  name: string
  price: number
  period: string
  dailyPrice: string
  badge?: string
  badgeColor?: string
  features: string[]
  popular?: boolean
  buttonText: string
  buttonVariant: 'default' | 'outline' | 'secondary'
  stripeUrl: string
}

// 使用新的Stripe配置
const pricingPlans: PricingPlan[] = [
  {
    id: 'oneday',
    name: '🎯 1天体验',
    price: 9.9,
    period: '天',
    dailyPrice: '限购一次',
    badge: '新人专享',
    badgeColor: 'bg-gradient-to-r from-orange-400 to-pink-500',
    features: ["💬 100次AI对话体验", "🔍 不限基础分析次数", "📊 20次基础报告", "⭐ 仅限首次用户"],
    buttonText: '¥9.9 立即体验',
    buttonVariant: 'outline',
    stripeUrl: 'https://buy.stripe.com/4gM3cueMZ8f0eDbfzue7m05' // 正确的试用版链接
  },
  {
    id: 'monthly',
    name: '📅 月度会员',
    price: STRIPE_CONFIG.memberships.monthly.price,
    period: '月',
    dailyPrice: `¥${(STRIPE_CONFIG.memberships.monthly.price / 30).toFixed(2)}/天`,
    features: ["💬 每日50次AI对话", "📊 每月100次高级报告", "🚀 高级分析功能", "👨‍💼 优先客服支持"],
    buttonText: '立即购买',
    buttonVariant: 'outline',
    stripeUrl: STRIPE_CONFIG.memberships.monthly.stripeUrl
  },
  {
    id: 'halfyear',
    name: '🌟 半年会员',
    price: STRIPE_CONFIG.memberships.halfyear.price,
    period: '半年',
    dailyPrice: `¥${(STRIPE_CONFIG.memberships.halfyear.price / 180).toFixed(2)}/天`,
    badge: '最受欢迎',
    badgeColor: 'bg-gradient-to-r from-purple-500 to-blue-500',
    popular: STRIPE_CONFIG.memberships.halfyear.popular,
    features: ["💬 每日50次AI对话", "📊 每月100次高级报告", "🚀 高级分析功能", "👨‍💼 优先客服支持", "🎨 定制报告模板"],
    buttonText: '立即购买',
    buttonVariant: 'default',
    stripeUrl: STRIPE_CONFIG.memberships.halfyear.stripeUrl
  },
  {
    id: 'yearly',
    name: '💎 年度会员',
    price: STRIPE_CONFIG.memberships.yearly.price,
    period: '年',
    dailyPrice: `¥${(STRIPE_CONFIG.memberships.yearly.price / 365).toFixed(2)}/天`,
    badge: '超值划算',
    badgeColor: 'bg-gradient-to-r from-yellow-400 to-orange-500',
    features: ["💬 每日50次AI对话", "📊 每月100次高级报告", "🚀 高级分析功能", "👨‍💼 优先客服支持", "🎨 定制报告模板"],
    buttonText: '立即购买',
    buttonVariant: 'default',
    stripeUrl: STRIPE_CONFIG.memberships.yearly.stripeUrl
  }
]

const creditPlans = [
  {
    id: 'basic',
    name: '🎯 基础包',
    count: STRIPE_CONFIG.reports.basic.count,
    price: STRIPE_CONFIG.reports.basic.price,
    description: '单次购买',
    emoji: '🎯',
    stripeUrl: STRIPE_CONFIG.reports.basic.stripeUrl
  },
  {
    id: 'standard',
    name: '🌟 标准包',
    count: STRIPE_CONFIG.reports.standard.count,
    price: STRIPE_CONFIG.reports.standard.price,
    description: '标准套餐',
    popular: STRIPE_CONFIG.reports.standard.popular,
    emoji: '🌟',
    stripeUrl: STRIPE_CONFIG.reports.standard.stripeUrl
  },
  {
    id: 'premium',
    name: '💎 高级包',
    count: STRIPE_CONFIG.reports.premium.count,
    price: STRIPE_CONFIG.reports.premium.price,
    description: '高级套餐',
    emoji: '💎',
    stripeUrl: STRIPE_CONFIG.reports.premium.stripeUrl
  }
]

const faqs = [
  {
    question: '🤔 会员到期后会怎样？',
    answer: '会员到期后将自动降级为免费用户，保留所有历史数据，但会员专享功能将受到限制。'
  },
  {
    question: '⬆️ 可以升级或更换会员计划吗？',
    answer: '当前会员到期后可以选择任意新的会员计划，暂不支持会员期间升级。'
  },
  {
    question: '⏰ 购买的分析次数会过期吗？',
    answer: '不会过期。购买的分析次数将永久保存在您的账户中，可以随时使用，与会员权益叠加。'
  },
  {
    question: '💳 支持哪些支付方式？',
    answer: '支持信用卡、微信支付、支付宝等主流支付方式（通过Stripe安全支付）。'
  }
]

export default function SubscriptionPage() {
  const { dict: t, isEnglish } = useI18n()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isWeb3User, setIsWeb3User] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const unifiedUser = await getCurrentUnifiedUser()
        setUser(unifiedUser)
        
        // 检测是否为Web3用户
        const web3User = unifiedUser?.email?.endsWith('@web3.local') || 
                        unifiedUser?.email?.endsWith('@web3.astrozi.app') || 
                        unifiedUser?.email?.endsWith('@astrozi.ai') || 
                        unifiedUser?.email?.endsWith('@web3.wallet') || 
                        unifiedUser?.auth_type === 'web3' || 
                        (unifiedUser?.wallet_address && (unifiedUser?.email?.includes('@web3.local') || unifiedUser?.email?.includes('@web3.astrozi.app') || unifiedUser?.email?.includes('@astrozi.ai') || unifiedUser?.email?.includes('@web3.wallet')))
        setIsWeb3User(web3User)
      } catch (error) {
        console.error('Failed to get user:', error)
      } finally {
        setLoading(false)
      }
    }
    getUser()
  }, [])

  const handleWeb3Payment = async (planType: string, amount: string) => {
    try {
      setIsProcessing(true)
      
      // 检查是否有Web3钱包
      if (!window.ethereum) {
        alert('Please install MetaMask wallet')
        return
      }

      // 请求连接钱包
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      // 检查网络
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      if (chainId !== '0x38') { // BSC Mainnet
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x38' }],
        })
      }

      // 构建转账参数
      const transactionParameters = {
        to: BSC_PAYMENT_CONFIG.recipientAddress,
        value: window.ethereum.utils?.toWei(amount, 'ether') || `0x${(parseFloat(amount) * 1e18).toString(16)}`,
        data: `0x${Buffer.from(`AstroZi-${planType}-${Date.now()}`, 'utf8').toString('hex')}`,
      }

      // 发起转账
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      })

      // 验证支付
      await verifyPayment(txHash, planType, amount)
      
    } catch (error) {
      console.error('Web3 payment failed:', error)
      alert('Payment failed, please try again')
    } finally {
      setIsProcessing(false)
    }
  }

  const verifyPayment = async (txHash: string, planType: string, amount: string) => {
    try {
      const response = await apiClient.post('/api/verify-web3-payment', {
        txHash,
        planType,
        amount,
        userEmail: user?.email
      })

      if (response.success) {
        alert('Payment successful! Activating subscription...')
        window.location.reload()
      } else {
        throw new Error('Payment verification failed')
      }
    } catch (error) {
      console.error('Payment verification failed:', error)
      alert('Payment verification failed, please contact customer service')
    }
  }

  const handlePurchase = async (plan: PricingPlan) => {
    try {
      setIsProcessing(true)
      
      // 如果用户未登录，跳转到wallet connect
      if (!user) {
        window.location.href = '/wallet-auth'
        return
      }

      // 已登录用户的付费计划
      if (isWeb3User) {
        // Web3用户使用链上支付
        const amount = BSC_PAYMENT_CONFIG.prices[plan.id as keyof typeof BSC_PAYMENT_CONFIG.prices]
        if (amount) {
          await handleWeb3Payment(plan.id, amount)
        } else {
          alert('Price configuration error')
        }
      } else {
        // Web2用户使用Stripe
        redirectToStripeCheckout(plan.stripeUrl)
      }
      
    } catch (error) {
      console.error('Failed to open payment page:', error)
      alert('Failed to open payment page, please try again later.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreditPurchase = async (credit: any) => {
    try {
      redirectToStripeCheckout(credit.stripeUrl)
    } catch (error) {
      console.error('Failed to open payment page:', error)
      alert('Failed to open payment page, please try again later.')
    }
  }

  return (
    <AuthGuard>
      <SmartLayout forceLayout={isEnglish ? 'english' : undefined}>
        <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-7xl">
          {/* 页面标题 - 移动端优化 */}
          <div className="text-center mb-8 md:mb-12">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
              <SafeCrown className="w-6 h-6 md:w-8 md:h-8 text-purple-600 dark:text-yellow-400 flex-shrink-0" />
              <h1 className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-yellow-400 leading-none flex items-center">
                {t.subscription.title}
              </h1>
            </div>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 px-4 leading-relaxed">
              {t.subscription.subtitle}
            </p>
          </div>

          {/* 会员价格卡片 - 移动端优化 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative transition-all duration-300 hover:shadow-lg ${
                  plan.popular 
                    ? 'border-purple-500 shadow-lg shadow-purple-100 dark:shadow-purple-900/20 scale-105' 
                    : 'hover:border-purple-300'
                }`}
              >
                {/* 推荐标签 */}
                {plan.badge && (
                  <div className="absolute -top-2 md:-top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className={`${plan.badgeColor} text-white px-2 md:px-3 py-1 text-xs md:text-sm font-medium shadow-lg`}>
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-3 md:pb-4 pt-4 md:pt-6">
                  <CardTitle className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">
                    {plan.name}
                  </CardTitle>
                  
                  <div className="space-y-1 md:space-y-2">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        {plan.price === 0 ? '免费' : formatPrice(plan.price)}
                      </span>
                    </div>
                    
                    <div className="text-xs md:text-sm text-gray-500">
                      {plan.dailyPrice}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 md:space-y-6 px-3 md:px-6">
                  {/* 功能列表 */}
                  <div className="space-y-2 md:space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 md:gap-3">
                        <SafeCheck className="w-3 h-3 md:w-4 md:h-4 text-green-500 flex-shrink-0" />
                        <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* 购买按钮 */}
                  <Button
                    onClick={() => handlePurchase(plan)}
                    disabled={isProcessing || loading}
                    variant={plan.buttonVariant}
                    className={`w-full text-sm md:text-base py-2 md:py-3 ${
                      plan.popular 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg' 
                        : ''
                    }`}
                  >
                    {loading || isProcessing ? (
                      <span>Loading...</span>
                    ) : (
                      <>
                        {user && isWeb3User ? (
                          <Wallet className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        ) : (
                          <CreditCard className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        )}
                        {user && isWeb3User ? (
                          plan.id === 'oneday' ? '1.49 USDT 立即体验' : 
                          `${BSC_PAYMENT_CONFIG.prices[plan.id as keyof typeof BSC_PAYMENT_CONFIG.prices]} USDT 购买`
                        ) : (
                          plan.buttonText
                        )}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 购买分析次数 - 移动端优化 */}
          <div className="max-w-5xl mx-auto mb-12 md:mb-16">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2 md:mb-4">
                💰 购买分析次数
              </h2>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 px-4">
                灵活购买AI分析次数，按需付费
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {creditPlans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative transition-all duration-300 hover:shadow-lg ${
                    plan.popular 
                      ? 'border-yellow-500 shadow-lg shadow-yellow-100 dark:shadow-yellow-900/20 scale-105' 
                      : 'hover:border-yellow-300'
                  }`}
                >
                  {/* 推荐标签 */}
                  {plan.popular && (
                    <div className="absolute -top-2 md:-top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 md:px-3 py-1 text-xs md:text-sm font-medium shadow-lg">
                        最受欢迎
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-3 md:pb-4 pt-4 md:pt-6">
                    <div className="text-3xl md:text-4xl mb-2">{plan.emoji}</div>
                    <CardTitle className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">
                      {plan.name}
                    </CardTitle>
                    
                    <div className="space-y-1 md:space-y-2">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                          {formatPrice(plan.price)}
                        </span>
                      </div>
                      
                      <div className="text-xs md:text-sm text-gray-500">
                        单价 ¥{(plan.price / plan.count).toFixed(2)}/次
                      </div>
                      
                      <div className="text-xs text-gray-400">
                        {plan.description}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 md:space-y-4 px-3 md:px-6">
                    {/* 功能说明 */}
                    <div className="text-center space-y-2 text-xs md:text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center justify-center gap-2">
                        <SafeCheck className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                        <span>📊 {plan.count}次AI分析报告</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <SafeCheck className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                        <span>⏰ 永久有效，不过期</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <SafeCheck className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                        <span>🔄 可叠加使用</span>
                      </div>
                    </div>

                    {/* 购买按钮 */}
                    <Button
                      onClick={() => handleCreditPurchase(plan)}
                      disabled={isProcessing}
                      variant={plan.popular ? 'default' : 'outline'}
                      className={`w-full text-sm md:text-base py-2 md:py-3 ${
                        plan.popular 
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg' 
                          : ''
                      }`}
                    >
                      <SafeExternalLink className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                      购买 {plan.count}次
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-4 md:mt-6 text-center text-xs md:text-sm text-gray-500 dark:text-gray-400 px-4">
              <p>💡 购买的分析次数将直接充值到您的账户，与会员权益叠加使用</p>
            </div>
          </div>

          {/* 常见问题 - 移动端优化 */}
          <div className="max-w-4xl mx-auto mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8 text-gray-800 dark:text-white">
              🤔 常见问题
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="p-4 md:p-6 hover:shadow-lg transition-shadow">
                  <h3 className="font-semibold text-sm md:text-base text-gray-800 dark:text-white mb-2 md:mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* 底部说明 - 移动端优化 */}
          <div className="text-center p-4 md:p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900 rounded-lg md:rounded-xl shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-2 md:mb-3">
              <SafeSparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
              <span className="font-medium text-sm md:text-base text-gray-800 dark:text-white">
                🔒 安全支付保障
              </span>
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mb-2">
              所有支付均通过Stripe安全处理，支持信用卡、支付宝、微信支付等多种方式
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              点击购买按钮将跳转到安全的Stripe支付页面完成付款
            </p>
          </div>
        </div>
      </SmartLayout>
    </AuthGuard>
  )
}
