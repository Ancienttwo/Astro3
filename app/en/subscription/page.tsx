'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Target, Star, Crown, Check, Sparkles, Wallet } from 'lucide-react'
import AuthGuard from '@/components/AuthGuard'
import EnglishLayout from '@/components/EnglishLayout'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getCurrentUnifiedUser } from '@/lib/auth'
import Web3SubscriptionPayment from '@/components/Web3SubscriptionPayment'

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

// English pricing plans
const pricingPlans: PricingPlan[] = [
  {
    id: 'oneday',
    name: '1-Day Trial',
    price: 1.49,
    period: 'day',
    dailyPrice: 'One-time only',
    badge: 'New User Special',
    badgeColor: 'bg-gradient-to-r from-orange-400 to-pink-500',
    features: ["100 AI Chat Sessions", "Unlimited Basic Analysis", "20 Basic Reports", "First-time users only"],
    buttonText: '$1.49 Try Now',
    buttonVariant: 'outline',
    stripeUrl: 'https://buy.stripe.com/4gM3cueMZ8f0eDbfzue7m05'
  },
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 19.99,
    period: 'month',
    dailyPrice: '$0.67/day',
    features: ["50 Daily AI Chats", "100 Premium Reports/month", "Advanced Analysis Features", "Priority Support"],
    buttonText: 'Subscribe Now',
    buttonVariant: 'outline',
    stripeUrl: 'https://buy.stripe.com/monthly-plan'
  },
  {
    id: 'halfyear',
    name: '6-Month Plan',
    price: 89.99,
    period: '6 months',
    dailyPrice: '$0.50/day',
    badge: 'Most Popular',
    badgeColor: 'bg-gradient-to-r from-amber-400 to-orange-500',
    popular: true,
    features: ["50 Daily AI Chats", "100 Premium Reports/month", "Advanced Analysis Features", "Priority Support", "Custom Report Templates"],
    buttonText: 'Subscribe Now',
    buttonVariant: 'default',
    stripeUrl: 'https://buy.stripe.com/halfyear-plan'
  },
  {
    id: 'yearly',
    name: 'Annual Plan',
    price: 149.99,
    period: 'year',
    dailyPrice: '$0.41/day',
    badge: 'Best Value',
    badgeColor: 'bg-gradient-to-r from-yellow-400 to-amber-500',
    features: ["50 Daily AI Chats", "100 Premium Reports/month", "Advanced Analysis Features", "Priority Support", "Custom Report Templates"],
    buttonText: 'Subscribe Now',
    buttonVariant: 'default',
    stripeUrl: 'https://buy.stripe.com/yearly-plan'
  }
]

const creditPlans = [
  {
    id: 'basic',
    name: 'Basic Pack',
    count: 10,
    price: 9.99,
    description: 'One-time purchase',
    icon: Target,
    gradient: 'from-orange-400 to-pink-500',
    stripeUrl: 'https://buy.stripe.com/basic-credits'
  },
  {
    id: 'standard',
    name: 'Standard Pack',
    count: 25,
    price: 19.99,
    description: 'Standard package',
    popular: true,
    icon: Star,
    gradient: 'from-amber-400 to-orange-500',
    stripeUrl: 'https://buy.stripe.com/standard-credits'
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    count: 50,
    price: 34.99,
    description: 'Premium package',
    icon: Crown,
    gradient: 'from-yellow-400 to-amber-500',
    stripeUrl: 'https://buy.stripe.com/premium-credits'
  }
]

const faqs = [
  {
    question: 'What happens when membership expires?',
    answer: 'When membership expires, you will automatically be downgraded to a free user, retaining all historical data, but member-exclusive features will be limited.'
  },
  {
    question: 'Can I upgrade or change membership plans?',
    answer: 'You can choose any new membership plan after your current membership expires. Upgrades during membership are not currently supported.'
  },
  {
    question: 'Do purchased analysis credits expire?',
    answer: 'No, they do not expire. Purchased analysis credits are permanently saved in your account and can be used anytime, stacking with membership benefits.'
  },
  {
    question: 'What payment methods are supported?',
    answer: 'We support credit cards, PayPal, and other mainstream payment methods through secure Stripe payment processing.'
  }
]

export default function EnglishSubscriptionPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isWeb3User, setIsWeb3User] = useState(false)
  const [loading, setLoading] = useState(true)
  const t = getDictionary('en')

  // Get user info
  useEffect(() => {
    const getUser = async () => {
      const unifiedUser = await getCurrentUnifiedUser()
      setUser(unifiedUser)
      
      // Detect Web3 user
      const web3User = unifiedUser?.email?.endsWith('@web3.local') || 
                      unifiedUser?.email?.endsWith('@web3.astrozi.app') || 
                      unifiedUser?.email?.endsWith('@astrozi.ai') || 
                      unifiedUser?.auth_type === 'web3' || 
                      (unifiedUser?.wallet_address && (unifiedUser?.email?.includes('@web3.local') || unifiedUser?.email?.includes('@web3.astrozi.app') || unifiedUser?.email?.includes('@astrozi.ai')))
      setIsWeb3User(web3User)
      setLoading(false)
    }
    getUser()
  }, [])

  const handlePurchase = async (plan: PricingPlan) => {
    try {
      setIsProcessing(true)
      // Open Stripe checkout
      window.open(plan.stripeUrl, '_blank')
    } catch (error) {
      console.error('Payment page failed to open:', error)
      alert('Payment page failed to open, please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreditPurchase = async (credit: any) => {
    try {
      setIsProcessing(true)
      window.open(credit.stripeUrl, '_blank')
    } catch (error) {
      console.error('Payment page failed to open:', error)
      alert('Payment page failed to open, please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <EnglishLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
          </div>
        </EnglishLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <EnglishLayout>
        <div className="mx-auto w-full max-w-page px-page-inline py-section-stack">
          {/* Page Title */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
              <Crown className="w-6 h-6 md:w-8 md:h-8 text-purple-600 dark:text-amber-400 flex-shrink-0" />
              <h1 className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-amber-400 leading-none flex items-center">
                {t.subscription.title}
              </h1>
            </div>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 px-4 leading-relaxed">
              {t.subscription.subtitle}
            </p>
            
            {/* User Type Badge */}
            {user && (
              <div className="mt-4">
                {isWeb3User ? (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    <Wallet className="w-4 h-4 mr-2" />
                    Web3 User - Blockchain Payments Available
                  </Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Traditional Payment Methods
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Web3 Subscription Section */}
          {user && isWeb3User && (
            <div className="mb-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-blue-600 mb-2">
                  Web3 Subscription Plans
                </h2>
                <p className="text-gray-600">
                  Pay with USDT on BSC network for stable pricing and instant activation
                </p>
              </div>
              <Web3SubscriptionPayment 
                walletAddress={user.wallet_address}
                onPaymentSuccess={(plan, txHash) => {
                  console.log('Payment successful:', plan, txHash)
                  // Here you can call an API to activate the subscription
                }}
              />
            </div>
          )}

          {/* Traditional Payment Section */}
          {(!user || !isWeb3User) && (
            <>
              <div className="mb-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-purple-600 mb-2">
                    Traditional Payment Plans
                  </h2>
                  <p className="text-gray-600">
                    Pay with credit card or PayPal via Stripe
                  </p>
                </div>
              </div>

          {/* Membership Plans */}
          <div className="mb-section-stack grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative border border-slate-200 bg-white p-card-padding shadow-soft transition-all duration-300 hover:shadow-medium dark:border-slate-700 dark:bg-slate-800 ${
                  plan.popular 
                    ? 'border-purple-500 shadow-lg shadow-purple-100 dark:shadow-purple-900/20 scale-105' 
                    : 'hover:border-purple-300'
                }`}
              >
                {/* Popular Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 md:-top-5 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className={`${plan.badgeColor} text-white px-2 md:px-3 py-1 text-xs md:text-sm font-medium shadow-lg whitespace-nowrap`}>
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pt-6 md:pt-8 pb-3 text-center">
                  <CardTitle className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">
                    {plan.name}
                  </CardTitle>
                  <div className="space-y-1">
                    <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-amber-400">
                      ${plan.price}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      /{plan.period}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {plan.dailyPrice}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 md:space-y-6">
                  <div className="space-y-2 md:space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 md:gap-3">
                        <Check className="w-4 h-4 md:w-5 md:h-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant={plan.buttonVariant as any}
                    className={`w-full py-2 md:py-3 text-sm md:text-base font-semibold transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg'
                        : ''
                    }`}
                    onClick={() => handlePurchase(plan)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Credit Purchase Section */}
          <div className="mb-section-stack">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2">
                {t.subscription.purchaseCredits}
              </h2>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                {t.subscription.purchaseCreditsDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
              {creditPlans.map((credit) => (
                <Card key={credit.id} className={`relative border border-slate-200 bg-white p-card-padding shadow-soft transition-all duration-300 hover:shadow-medium dark:border-slate-700 dark:bg-slate-800 ${
                  credit.popular ? 'border-purple-500 scale-105' : 'hover:border-purple-300'
                }`}>
                  {credit.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 text-sm font-medium shadow-lg">
                        {t.subscription.mostPopular}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-3 text-center">
                    <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r ${credit.gradient} md:h-16 md:w-16`}>
                      <credit.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </div>
                    <CardTitle className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">
                      {credit.name}
                    </CardTitle>
                    <div className="space-y-1">
                      <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-amber-400">
                        ${credit.price}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {credit.count} {t.subscription.aiAnalysisReports}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        ${(credit.price / credit.count).toFixed(2)} {t.subscription.perCredit}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {t.subscription.permanentValidity}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {t.subscription.stackable}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full py-2 md:py-3 text-sm md:text-base font-semibold"
                      onClick={() => handleCreditPurchase(credit)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : `Buy ${credit.count} Credits`}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm text-amber-700 dark:text-amber-300">
                  {t.subscription.creditsStackingTip}
                </span>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-8 md:mb-12">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                {t.subscription.faq}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="hover:shadow-md transition-all duration-300">
                  <CardHeader className="pb-2 md:pb-3">
                    <CardTitle className="text-base md:text-lg font-semibold text-gray-800 dark:text-white">
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
            </>
          )}
        </div>
      </EnglishLayout>
    </AuthGuard>
  )
} 
