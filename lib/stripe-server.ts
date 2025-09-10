import Stripe from 'stripe'

// 服务端专用的Stripe实例
const secretKey = process.env.STRIPE_SECRET_KEY

if (!secretKey) {
  throw new Error('STRIPE_SECRET_KEY 环境变量未设置！请检查.env.local文件')
}

export const stripe = new Stripe(secretKey, {
  apiVersion: '2025-05-28.basil',
  typescript: true,
})

// 创建支付会话（服务端函数）
export const createPaymentSession = async (
  priceId: string,
  customerId?: string,
  metadata?: Record<string, string>
) => {
  return stripe.checkout.sessions.create({
    payment_method_types: ['card', 'alipay', 'wechat_pay'],
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?cancelled=true`,
    customer: customerId,
    metadata,
  })
}

// 创建订阅会话（服务端函数）
export const createSubscriptionSession = async (
  priceId: string,
  customerId?: string,
  metadata?: Record<string, string>
) => {
  return stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?cancelled=true`,
    customer: customerId,
    metadata,
  })
}

// 验证Webhook签名（服务端函数）
export const validateWebhookSignature = (
  payload: string | Buffer,
  signature: string,
  secret: string
) => {
  return stripe.webhooks.constructEvent(payload, signature, secret)
} 