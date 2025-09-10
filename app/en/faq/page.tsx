'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Wallet,
  CreditCard,
  Shield,
  Zap,
  Users,
  Bot,
  Star,
  Gift,
  Link,
  DollarSign,
  Clock,
  BookOpen,
  MessageCircle
} from 'lucide-react'
import EnglishLayout from '@/components/EnglishLayout'

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const categories = [
    { id: 'all', name: 'All Questions', icon: HelpCircle, color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' },
    { id: 'getting-started', name: 'Getting Started', icon: Star, color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' },
    { id: 'web3', name: 'Web3 & Wallets', icon: Wallet, color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' },
    { id: 'astrology', name: 'Astrology', icon: BookOpen, color: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' },
    { id: 'payments', name: 'Payments & Plans', icon: CreditCard, color: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400' },
    { id: 'technical', name: 'Technical', icon: Zap, color: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' }
  ]

  const faqData = [
    // Getting Started
    {
      id: 'what-is-astrozi',
      category: 'getting-started',
      question: 'What is AstroZi?',
      answer: 'AstroZi is the world\'s first dual-system life engineering platform that combines ancient Chinese astrology wisdom with modern AI technology. We offer professional BaZi (Eight Characters) and Zi Wei Dou Shu analysis powered by specialized AI masters to help you discover hidden life patterns and optimize your life trajectory.'
    },
    {
      id: 'how-to-start',
      category: 'getting-started',
      question: 'How do I get started with AstroZi?',
      answer: 'Getting started is easy! You can choose between two authentication methods:\n\n1. **Web3 Wallet Login**: Connect your MetaMask or compatible wallet for instant access with airdrops eligibility\n2. **Email Login**: Traditional registration with email and password\n\nAfter signing up, input your birth details (date, time, location) to generate your first astrology chart and receive AI-powered analysis.'
    },
    {
      id: 'accurate-birth-time',
      category: 'getting-started',
      question: 'Why is accurate birth time important?',
      answer: 'Precise birth time is crucial for life engineering algorithm accuracy. Even a few minutes difference can affect:\n\n• Your BaZi chart calculation\n• Zi Wei Dou Shu palace positions\n• AI analysis accuracy\n• Timing predictions\n\nIf you don\'t know your exact birth time, check your birth certificate or contact the hospital where you were born.'
    },
    {
      id: 'ai-masters',
      category: 'getting-started',
      question: 'What are the four AI masters?',
      answer: 'Our platform features four specialized AI masters:\n\n• **用神大师 (Yong Shen Master)**: Analyzes favorable and unfavorable elements\n• **铁口直断大师 (Direct Fortune Master)**: Provides straightforward predictions\n• **四化分析大师 (Four Transformations Master)**: Specializes in Zi Wei analysis\n• **紫微推理大师 (Zi Wei Reasoning Master)**: Expert in palace interpretations\n\nEach master has unique expertise to provide comprehensive life analysis.'
    },

    // Web3 & Wallets
    {
      id: 'why-web3',
      category: 'web3',
      question: 'Why should I choose Web3 wallet login?',
      answer: 'Web3 wallet login offers several advantages:\n\n• **🪂 Airdrops from foundation**: Participate in future token distributions\n• **🔐 Enhanced Security**: Decentralized authentication, no passwords needed\n• **🚀 One-Click Access**: Sign in with just your wallet signature\n• **💎 Blockchain Benefits**: Transparent payments, enhanced privacy\n• **🎁 Special Features**: Access to exclusive Web3-only features'
    },
    {
      id: 'supported-wallets',
      category: 'web3',
      question: 'Which wallets are supported?',
      answer: 'We support all major Web3 wallets:\n\n• **MetaMask** (Recommended)\n• **Trust Wallet**\n• **WalletConnect** compatible wallets\n• **Coinbase Wallet**\n• **Any BSC-compatible wallet**\n\nMake sure your wallet is connected to BSC Mainnet (Chain ID: 56) for optimal experience.'
    },
    {
      id: 'bsc-network',
      category: 'web3',
      question: 'Why does AstroZi use BSC network?',
      answer: 'We chose Binance Smart Chain (BSC) for:\n\n• **Low Transaction Fees**: Minimal costs for payments and check-ins\n• **Fast Confirmation**: Quick transaction processing\n• **USDT Stability**: Stable pricing in USDT\n• **Wide Adoption**: Most users already have BSC setup\n• **Smart Contract Features**: Advanced functionality for points and airdrops'
    },
    {
      id: 'daily-checkin',
      category: 'web3',
      question: 'What is the daily check-in system?',
      answer: 'Our Web3 daily check-in system allows you to:\n\n• **Earn Points**: Base 10 points per check-in\n• **Build Streaks**: Up to 5x multiplier for consecutive days\n• **Airdrop Weight**: Accumulate eligibility for future tokens\n• **Low Cost**: Only 0.0002 BNB per check-in\n• **Smart Contract**: Transparent and secure point tracking'
    },

    // Astrology
    {
      id: 'bazi-vs-ziwei',
      category: 'astrology',
      question: 'What\'s the difference between BaZi and Zi Wei Dou Shu?',
      answer: 'Both are Chinese astrology systems with different focuses:\n\n**BaZi (Eight Characters)**:\n• Based on birth year, month, day, hour\n• Focuses on Five Elements balance\n• Great for personality and potential analysis\n• Uses Heavenly Stems and Earthly Branches\n\n**Zi Wei Dou Shu**:\n• Uses 12 palaces and 14 main stars\n• Excellent for timing and event prediction\n• More detailed life aspect analysis\n• Features Four Transformations system'
    },
    {
      id: 'accuracy-claims',
      category: 'astrology',
      question: 'How accurate are the predictions?',
      answer: 'Our accuracy comes from:\n\n• **Traditional Methods**: Authentic Chinese calculation algorithms\n• **AI Enhancement**: Modern technology improves interpretation\n• **Dual System Validation**: BaZi and Zi Wei cross-verification\n• **Continuous Learning**: AI improves from user feedback\n\n**Important**: Astrology provides guidance and insights, not absolute predictions. Results should be used for self-reflection and decision-making support.'
    },
    {
      id: 'multiple-charts',
      category: 'astrology',
      question: 'Can I create charts for family and friends?',
      answer: 'Yes! AstroZi supports multiple chart management:\n\n• **Unlimited Charts**: Create charts for anyone with their permission\n• **Family Analysis**: Understand family dynamics and compatibility\n• **Professional Use**: Great for consultation businesses\n• **Chart Organization**: Save and categorize charts easily\n• **Privacy Respect**: Always get consent before creating someone\'s chart'
    },
    {
      id: 'languages',
      category: 'astrology',
      question: 'What languages are supported?',
      answer: 'AstroZi currently supports:\n\n• **English**: Full platform experience with comprehensive wiki\n• **Chinese (Simplified)**: Native language support with traditional terminology\n• **Educational Content**: Bilingual knowledge base for learning\n• **AI Analysis**: Available in both languages\n\nWe\'re working on adding more languages based on user demand.'
    },

    // Payments & Plans
    {
      id: 'pricing-plans',
      category: 'payments',
      question: 'What are the subscription plans?',
      answer: 'We offer flexible pricing for both Web2 and Web3 users:\n\n**Traditional Payment (Credit Card)**:\n• 1-Day Trial: $1.49\n• Monthly: $19.99\n• 6-Month: $89.99 (Most Popular)\n• Annual: $149.99 (Best Value)\n\n**Web3 Payment (USDT on BSC)**:\n• Same pricing in USDT\n• Instant activation\n• Transparent blockchain transactions\n\n**Credit Packs** (No expiration):\n• Basic: 10 reports for $9.99\n• Standard: 25 reports for $19.99\n• Premium: 50 reports for $34.99'
    },
    {
      id: 'payment-methods',
      category: 'payments',
      question: 'What payment methods do you accept?',
      answer: 'We support multiple payment options:\n\n**Web2 Users**:\n• Credit/Debit Cards (Visa, MasterCard, Amex)\n• PayPal\n• Processed securely through Stripe\n\n**Web3 Users**:\n• USDT on BSC Mainnet\n• Direct smart contract payments\n• No intermediaries, fully decentralized\n\n**Security**: All payments are processed securely with industry-standard encryption.'
    },
    {
      id: 'refund-policy',
      category: 'payments',
      question: 'What is your refund policy?',
      answer: 'Our refund policy:\n\n• **7-Day Guarantee**: Full refund within 7 days if unsatisfied\n• **Technical Issues**: Immediate refund for platform problems\n• **Web3 Payments**: Handled case-by-case due to blockchain nature\n• **Contact Support**: Email support@astrozi.com for refund requests\n• **Fair Use**: Refunds subject to fair usage policy\n\nWe aim to ensure every user has a positive experience with AstroZi.'
    },
    {
      id: 'subscription-benefits',
      category: 'payments',
      question: 'What do I get with a subscription?',
      answer: 'Subscription benefits include:\n\n• **Unlimited Reports**: Generate as many charts as needed\n• **All AI Masters**: Access to all four specialized AI experts\n• **Advanced Features**: Deep analysis and interpretation tools\n• **Chart Management**: Save and organize unlimited charts\n• **Priority Support**: Faster customer service response\n• **Educational Content**: Full access to knowledge base\n• **Mobile Access**: Use anywhere on any device'
    },

    // Technical
    {
      id: 'technical-requirements',
      category: 'technical',
      question: 'What are the technical requirements?',
      answer: 'AstroZi works on:\n\n**Devices**:\n• Desktop computers (Windows, Mac, Linux)\n• Tablets (iPad, Android tablets)\n• Smartphones (iOS, Android)\n\n**Browsers**:\n• Chrome (Recommended)\n• Firefox\n• Safari\n• Edge\n\n**For Web3**:\n• MetaMask or compatible wallet\n• BSC network support\n• Small amount of BNB for transactions'
    },
    {
      id: 'data-privacy',
      category: 'technical',
      question: 'How is my data protected?',
      answer: 'We take privacy seriously:\n\n• **Encryption**: All data encrypted in transit and at rest\n• **Minimal Collection**: Only essential information collected\n• **Web3 Privacy**: Wallet users have enhanced privacy\n• **No Selling**: We never sell user data to third parties\n• **GDPR Compliant**: Meeting international privacy standards\n• **Secure Infrastructure**: Enterprise-grade security measures\n\nYour birth data and analysis results are kept completely confidential.'
    },
    {
      id: 'mobile-app',
      category: 'technical',
      question: 'Is there a mobile app?',
      answer: 'Currently, AstroZi is a web-based platform optimized for mobile browsers. Benefits:\n\n• **No App Store Required**: Access instantly through any browser\n• **Always Updated**: Latest features without app updates\n• **Cross-Platform**: Works on any device with internet\n• **Full Features**: Complete functionality on mobile\n\nWe\'re considering a native mobile app based on user feedback and demand.'
    },
    {
      id: 'troubleshooting',
      category: 'technical',
      question: 'What if I encounter technical issues?',
      answer: 'For technical problems:\n\n1. **Check Internet**: Ensure stable connection\n2. **Clear Cache**: Refresh browser cache and cookies\n3. **Try Different Browser**: Test with Chrome or Firefox\n4. **Disable Extensions**: Some browser extensions may interfere\n5. **Contact Support**: Email support@astrozi.com with details\n\n**Web3 Issues**:\n• Ensure wallet is connected to BSC Mainnet\n• Check if you have enough BNB for transactions\n• Try disconnecting and reconnecting wallet'
    }
  ]

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <EnglishLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        {/* Page Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-xl">
                  <HelpCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
                Find answers to common questions about AstroZi, Web3 authentication, astrology analysis, and more.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search FAQ..."
                    className="pl-10 pr-4 py-3 w-full border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Category Filter */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center space-x-2 ${
                    activeCategory === category.id 
                      ? 'bg-purple-500 text-white' 
                      : 'border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <Card key={faq.id} className="dark:bg-slate-800 dark:border-slate-700">
                <CardHeader>
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleExpanded(faq.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant="secondary" 
                        className={categories.find(c => c.id === faq.category)?.color}
                      >
                        {categories.find(c => c.id === faq.category)?.name}
                      </Badge>
                      <CardTitle className="text-gray-900 dark:text-white text-left">
                        {faq.question}
                      </CardTitle>
                    </div>
                    {expandedItems.includes(faq.id) ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
                {expandedItems.includes(faq.id) && (
                  <CardContent>
                    <div className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                      {faq.answer}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No questions found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Try adjusting your search terms or category filter.
              </p>
            </div>
          )}

          {/* Contact Support */}
          <Card className="mt-12 dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Still Have Questions?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" className="border-gray-300 dark:border-slate-600">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Knowledge Base
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </EnglishLayout>
  )
}