import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-server'
import { supabase } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: '缺少Stripe签名' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: unknown) {
    const error = err as { message?: string }
    console.error('Webhook签名验证失败:', error.message)
    return NextResponse.json({ error: '签名验证失败' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
        break
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'invoice.payment_succeeded':
        await handleSubscriptionPayment(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`未处理的事件类型: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: unknown) {
    console.error('Webhook处理失败:', error)
    return NextResponse.json({ error: 'Webhook处理失败' }, { status: 500 })
  }
}

// 处理Checkout会话完成
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {}
  
  try {
    // 获取用户信息（通过邮箱或metadata中的userId）
    let userId = metadata.userId
    
    if (!userId && session.customer_email) {
      // 通过邮箱查找用户
      const { data: userData } = await supabase.auth.admin.getUserByEmail(session.customer_email)
      userId = userData?.user?.id
    }

    if (!userId) {
      console.error('无法找到用户ID')
      return
    }

    // 根据产品类型处理
    const productType = metadata.productType || 'report' // 'report' 或 'membership'
    
    if (productType === 'report') {
      await handleReportPurchase(userId, metadata, session)
    } else if (productType === 'membership') {
      await handleMembershipPurchase(userId, metadata, session)
    }

    console.log('Checkout完成处理成功:', session.id)
  } catch (error) {
    console.error('处理Checkout完成事件失败:', error)
    throw error
  }
}

// 处理报告购买
async function handleReportPurchase(userId: string, metadata: any, session: Stripe.Checkout.Session) {
  const reportCount = parseInt(metadata.reportCount) || 1
  
  try {
    // 查询当前用户的使用统计
    const { data: currentUsage } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (currentUsage) {
      // 更新现有记录
      const { error: updateError } = await supabase
        .from('user_usage')
        .update({
          paid_reports_purchased: (currentUsage.paid_reports_purchased || 0) + reportCount,
          remaining_paid_reports: (currentUsage.remaining_paid_reports || 0) + reportCount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (updateError) throw updateError
    } else {
      // 创建新记录
      const { error: insertError } = await supabase
        .from('user_usage')
        .insert({
          user_id: userId,
          paid_reports_purchased: reportCount,
          remaining_paid_reports: reportCount,
          free_reports_limit: 0,
          remaining_free_reports: 0,
          chatbot_limit: 0,
          remaining_chatbot_usage: 0
        })

      if (insertError) throw insertError
    }

    // 记录购买历史
    const { error: historyError } = await supabase
      .from('purchase_history')
      .insert({
        user_id: userId,
        product_type: 'ai_reports',
        product_name: metadata.productName || '未知产品',
        quantity: reportCount,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency || 'cny',
        payment_method: 'stripe',
        transaction_id: session.id,
        metadata: {
          stripeSessionId: session.id,
          productId: metadata.productId
        }
      })

    if (historyError) throw historyError

    console.log(`用户 ${userId} 购买了 ${reportCount} 次AI报告`)
  } catch (error) {
    console.error('处理报告购买失败:', error)
    throw error
  }
}

// 处理会员购买
async function handleMembershipPurchase(userId: string, metadata: any, session: Stripe.Checkout.Session) {
  const membershipType = metadata.membershipType || 'monthly'
  const duration = getMembershipDuration(membershipType)
  
  try {
    // 计算会员到期时间
    const now = new Date()
    const expiresAt = new Date(now.getTime() + duration)

    // 更新用户会员状态
    const { error: membershipError } = await supabase
      .from('user_memberships')
      .upsert({
        user_id: userId,
        membership_type: membershipType,
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        is_active: true,
        payment_method: 'stripe',
        transaction_id: session.id
      })

    if (membershipError) throw membershipError

    // 记录购买历史
    const { error: historyError } = await supabase
      .from('purchase_history')
      .insert({
        user_id: userId,
        product_type: 'membership',
        product_name: metadata.productName || `${membershipType}会员`,
        quantity: 1,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency || 'cny',
        payment_method: 'stripe',
        transaction_id: session.id,
        metadata: {
          stripeSessionId: session.id,
          membershipType: membershipType,
          expiresAt: expiresAt.toISOString()
        }
      })

    if (historyError) throw historyError

    console.log(`用户 ${userId} 购买了 ${membershipType} 会员`)
  } catch (error) {
    console.error('处理会员购买失败:', error)
    throw error
  }
}

// 处理支付成功（兼容旧版本）
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log('PaymentIntent成功:', paymentIntent.id)
  // 这里保留旧的处理逻辑，主要处理通过PaymentIntent的支付
}

// 处理支付失败
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('支付失败:', {
    paymentIntentId: paymentIntent.id,
    userId: paymentIntent.metadata.userId,
    amount: paymentIntent.amount,
    lastPaymentError: paymentIntent.last_payment_error
  })
}

// 处理订阅支付成功
async function handleSubscriptionPayment(invoice: Stripe.Invoice) {
  console.log('订阅支付成功:', invoice.id)
  // 这里可以处理定期订阅的续费逻辑
}

// 获取会员持续时间（毫秒）
function getMembershipDuration(membershipType: string): number {
  const durations: Record<string, number> = {
    'trial': 1 * 24 * 60 * 60 * 1000, // 1天
    'monthly': 30 * 24 * 60 * 60 * 1000, // 30天
    'halfyear': 180 * 24 * 60 * 60 * 1000, // 180天
    'yearly': 365 * 24 * 60 * 60 * 1000 // 365天
  }
  
  return durations[membershipType] || durations['monthly']
} 