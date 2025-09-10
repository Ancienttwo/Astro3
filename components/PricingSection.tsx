"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { CheckCircle, ExternalLink, Wallet, CreditCard } from "lucide-react"
import { STRIPE_CONFIG, formatPrice, redirectToStripeCheckout } from '@/lib/stripe'
import { getCurrentUnifiedUser } from '@/lib/auth'

interface PricingSectionProps {
  language?: 'zh' | 'en'
}

// BSC Payment Configuration
const BSC_PAYMENT_CONFIG = {
  recipientAddress: '0xa047FFa6923BfE296B633A7b88f37dFcaAB93Cf3',
  chainId: 56, // BSC Mainnet
  prices: {
    oneDay: '1.49', // USDT
    monthly: '19.99', // USDT
    halfyear: '89.99', // USDT
    yearly: '149.99' // USDT
  }
}

const pricingContent = {
  zh: {
    popular: "推荐",
    selectPlan: "立即购买",
    oneDayPlan: {
      name: "1天体验",
      price: "¥9.9",
      period: "",
      features: ["100次AI对话体验", "不限基础分析次数", "20次基础报告", "仅限首次用户"],
      badge: "限购一次",
      stripeUrl: "https://buy.stripe.com/oneday-experience"
    },
    plans: [
      {
        name: STRIPE_CONFIG.memberships.monthly.name,
        price: formatPrice(STRIPE_CONFIG.memberships.monthly.price),
        period: "/月",
        features: ["每日50次AI对话", "每月100次高级报告", "高级分析功能", "优先客服支持"],
        stripeUrl: STRIPE_CONFIG.memberships.monthly.stripeUrl
      },
      {
        name: STRIPE_CONFIG.memberships.halfyear.name,
        price: formatPrice(STRIPE_CONFIG.memberships.halfyear.price),
        period: "/半年",
        features: ["每日50次AI对话", "每月100次高级报告", "高级分析功能", "优先客服支持", "定制报告模板"],
        popular: STRIPE_CONFIG.memberships.halfyear.popular,
        stripeUrl: STRIPE_CONFIG.memberships.halfyear.stripeUrl
      },
      {
        name: STRIPE_CONFIG.memberships.yearly.name,
        price: formatPrice(STRIPE_CONFIG.memberships.yearly.price),
        period: "/年",
        features: ["每日50次AI对话", "每月100次高级报告", "高级分析功能", "优先客服支持", "定制报告模板"],
        stripeUrl: STRIPE_CONFIG.memberships.yearly.stripeUrl
      }
    ]
  },
  en: {
    popular: "Most Popular",
    selectPlan: "Select Plan",
    oneDayPlan: {
      name: "1-Day Trial",
      price: "$1.4",
      period: "",
      features: ["100 AI Chat Experience", "Unlimited Basic Analysis", "20 Basic Reports", "First-time Users Only"],
      badge: "One-time Only",
      stripeUrl: "https://buy.stripe.com/oneday-experience"
    },
    plans: [
      {
        name: "Monthly Member",
        price: "$9.5",
        period: "/month",
        features: ["50 Daily AI Chats", "100 Monthly Premium Reports", "Advanced Features", "Priority Support"],
        stripeUrl: STRIPE_CONFIG.memberships.monthly.stripeUrl
      },
      {
        name: "6-Month Member",
        price: "$42.5",
        period: "/6 months",
        features: ["50 Daily AI Chats", "100 Monthly Premium Reports", "Advanced Features", "Priority Support", "Custom Report Templates"],
        popular: true,
        stripeUrl: STRIPE_CONFIG.memberships.halfyear.stripeUrl
      },
      {
        name: "Annual Member",
        price: "$71",
        period: "/year",
        features: ["50 Daily AI Chats", "100 Monthly Premium Reports", "Advanced Features", "Priority Support", "Custom Report Templates"],
        stripeUrl: STRIPE_CONFIG.memberships.yearly.stripeUrl
      }
    ]
  }
}

export default function PricingSection({ language = 'zh' }: PricingSectionProps) {
  const content = pricingContent[language]
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
      alert(language === 'zh' ? '支付失败，请重试' : 'Payment failed, please try again')
    }
  }

  const verifyPayment = async (txHash: string, planType: string, amount: string) => {
    try {
      const response = await fetch('/api/verify-web3-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          txHash,
          planType,
          amount,
          userEmail: user?.email
        }),
      })

      if (response.ok) {
        alert(language === 'zh' ? '支付成功！正在激活订阅...' : 'Payment successful! Activating subscription...')
        window.location.reload()
      } else {
        throw new Error('Payment verification failed')
      }
    } catch (error) {
      console.error('Payment verification failed:', error)
      alert(language === 'zh' ? '支付验证失败，请联系客服' : 'Payment verification failed, please contact support')
    }
  }
  
  const handlePurchase = (stripeUrl: string | null, planIndex: number) => {
    // 如果用户未登录，跳转到wallet connect
    if (!user) {
      window.location.href = '/wallet-auth'
      return
    }

    // 如果是免费计划（没有stripeUrl）
    if (!stripeUrl) {
      window.location.href = '/wallet-auth'
      return
    }

    // 已登录用户的付费计划
    if (isWeb3User) {
      // Web3用户使用链上支付
      const planTypes = ['oneDay', 'monthly', 'halfyear', 'yearly']
      const amounts = [BSC_PAYMENT_CONFIG.prices.oneDay, BSC_PAYMENT_CONFIG.prices.monthly, BSC_PAYMENT_CONFIG.prices.halfyear, BSC_PAYMENT_CONFIG.prices.yearly]
      handleWeb3Payment(planTypes[planIndex], amounts[planIndex])
    } else {
      // Web2用户使用Stripe
      redirectToStripeCheckout(stripeUrl)
    }
  }
  
  // 合并1天体验和付费计划
  const allPlans = [content.oneDayPlan, ...content.plans]
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {allPlans.map((plan, index) => (
        <div
          key={index}
          className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 text-center transform hover:scale-105 hover:bg-white/15 transition-all duration-300 ${
            plan.popular ? "ring-2 ring-yellow-400 shadow-xl shadow-yellow-400/20" : ""
          } h-full flex flex-col justify-between relative`}
        >
          <div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
              {plan.popular && (
                <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  {content.popular}
                </span>
              )}
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-yellow-400">{plan.price}</span>
              <span className="text-slate-300 text-lg ml-1">{plan.period}</span>
            </div>
            <ul className="space-y-3 mb-8 text-left">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center text-slate-300 text-base">
                  <CheckCircle className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <Button
            onClick={() => handlePurchase(plan.stripeUrl, index)}
            disabled={loading}
            className={`w-full py-3 text-lg font-semibold rounded-lg transition-all duration-300 ${
              plan.popular
                ? "bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black shadow-lg"
                : "bg-gradient-to-r from-yellow-400/80 to-amber-500/80 hover:from-yellow-400 hover:to-amber-500 text-black border border-yellow-400/30"
            }`}
          >
            {loading ? (
              <span>{language === 'zh' ? '加载中...' : 'Loading...'}</span>
            ) : (
              <>
                {user && isWeb3User ? (
                  <Wallet className="w-4 h-4 mr-2" />
                ) : (
                  plan.stripeUrl && <CreditCard className="w-4 h-4 mr-2" />
                )}
                {index === 0 ? (
                  user && isWeb3User ? 
                    (language === 'zh' ? '1.49 USDT 立即体验' : '1.49 USDT Try Now') :
                    (language === 'zh' ? '¥9.9 立即体验' : '$1.4 Try Now')
                ) : (
                  user && isWeb3User ?
                    `${Object.values(BSC_PAYMENT_CONFIG.prices)[index]} USDT ${content.selectPlan}` :
                    content.selectPlan
                )}
              </>
            )}
          </Button>
        </div>
      ))}
    </div>
  )
} 