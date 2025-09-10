import { loadStripe } from '@stripe/stripe-js'

// 客户端Stripe实例 - 带安全检查
let stripePromise: Promise<any> | null = null

export const getStripe = (): Promise<any> => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    
    if (!publishableKey) {
      console.warn('⚠️ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 未设置，使用fallback模式')
      // 返回一个mock对象而不是抛出错误
      stripePromise = Promise.resolve(null)
    } else {
      console.log('🔑 初始化Stripe客户端')
      stripePromise = loadStripe(publishableKey)
    }
  }
  return stripePromise
}

// 支付配置
export const STRIPE_CONFIG = {
  currency: 'cny', // 人民币
  paymentMethods: ['card', 'alipay', 'wechat_pay'],
  
  // AI报告产品配置
  reports: {
    basic: {
      id: 'report_basic',
      name: '基础AI报告',
      price: 3.3,
      count: 1,
      stripeUrl: 'https://buy.stripe.com/7sY9ASdIVgLw0Ml72Ye7m08',
      features: ['1次AI分析', '基础命理解读', '永久保存']
    },
    standard: {
      id: 'report_standard', 
      name: '标准AI报告套餐',
      price: 29.9,
      count: 10,
      stripeUrl: 'https://buy.stripe.com/00w6oGfR3eDoeDbafae7m0b',
      features: ['10次AI分析', '详细命理解读', '永久保存', '优先支持'],
      popular: true
    },
    premium: {
      id: 'report_premium',
      name: '高级AI报告套餐', 
      price: 133.30,
      count: 50,
      stripeUrl: 'https://buy.stripe.com/dRmfZgcERcvg66F2MIe7m0a',
      features: ['50次AI分析', '深度命理解读', '永久保存', '优先支持', '高级分析模式']
    }
  },

  // 会员订阅配置
  memberships: {
    trial: {
      id: 'member_trial',
      name: '体验会员',
      price: 0, // Trial免费
      period: '试用',
      stripeUrl: 'https://buy.stripe.com/4gM3cueMZ8f0eDbfzue7m05',
      features: ['免费体验', '基础功能', '限时使用']
    },
    monthly: {
      id: 'member_monthly',
      name: '月度会员',
      price: 66.6,
      period: '月',
      stripeUrl: 'https://buy.stripe.com/00w6oGfR3cvg8eN2MIe7m04',
      features: ['无限AI对话', '月度报告配额', '高级功能', '优先支持']
    },
    halfyear: {
      id: 'member_halfyear',
      name: '半年会员',
      price: 299.9,
      period: '半年',
      stripeUrl: 'https://buy.stripe.com/fZu00i8oBcvgeDbgDye7m06',
      features: ['无限AI对话', '半年报告配额', '全部高级功能', 'VIP支持'],
      popular: true
    },
    yearly: {
      id: 'member_yearly',
      name: '年度会员',
      price: 499.9,
      period: '年',
      stripeUrl: 'https://buy.stripe.com/28E9AS7kx1QC8eN4UQe7m07',
      features: ['无限AI对话', '年度报告配额', '全部功能', '专属VIP服务']
    }
  }
}

// 格式化价格显示
export const formatPrice = (price: number): string => {
  return `¥${price.toFixed(2)}`
}

// 获取AI报告产品信息
export const getReportProduct = (productId: keyof typeof STRIPE_CONFIG.reports) => {
  return STRIPE_CONFIG.reports[productId]
}

// 获取会员产品信息
export const getMembershipProduct = (productId: keyof typeof STRIPE_CONFIG.memberships) => {
  return STRIPE_CONFIG.memberships[productId]
}

// 重定向到Stripe支付页面（优先使用托管页面）
export const redirectToStripeCheckout = (stripeUrl: string) => {
  if (typeof window !== 'undefined') {
    console.log('🔗 重定向到Stripe支付页面:', stripeUrl)
    window.open(stripeUrl, '_blank')
  } else {
    console.warn('⚠️ redirectToStripeCheckout只能在客户端使用')
  }
}

// 创建Stripe Checkout Session（备用方案，需要API支持）
export const createCheckoutSession = async (priceId: string, quantity: number = 1) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        quantity,
      }),
    })

    const session = await response.json()
    
    if (session.url) {
      window.location.href = session.url
    } else {
      throw new Error('无法创建支付会话')
    }
  } catch (error) {
    console.error('创建支付会话失败:', error)
    throw error
  }
}

// 验证Stripe URL格式
export const isValidStripeUrl = (url: string): boolean => {
  return url.startsWith('https://buy.stripe.com/') || url.startsWith('https://checkout.stripe.com/')
}

// 获取支付成功后的重定向URL
export const getSuccessUrl = (): string => {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3007'
  
  return `${baseUrl}/payment-success`
}

// 获取支付取消后的重定向URL
export const getCancelUrl = (): string => {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3007'
  
  return `${baseUrl}/subscription?cancelled=true`
}

// 检查Stripe环境配置
export const checkStripeConfig = (): { 
  server: boolean, 
  client: boolean, 
  messages: string[] 
} => {
  const messages: string[] = []
  
  // 检查服务端配置
  const hasServerKey = !!process.env.STRIPE_SECRET_KEY
  if (!hasServerKey) {
    messages.push('❌ STRIPE_SECRET_KEY 未配置')
  }
  
  // 检查客户端配置
  const hasClientKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (!hasClientKey) {
    messages.push('⚠️ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 未配置（将使用托管页面模式）')
  }
  
  return {
    server: hasServerKey,
    client: hasClientKey,
    messages
  }
} 