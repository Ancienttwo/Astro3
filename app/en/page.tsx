"use client"

import { useState, useEffect } from "react"
import MainLayout from "@/components/MainLayout"
import PricingSection from "@/components/PricingSection"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Bot, Zap, TrendingUp, Users, Lock, Rocket, Target, Sun, Moon, Stars, Sparkles, Gift, Calendar, Coins, Trophy, CheckCircle, Wallet, Link, Mail } from "lucide-react"
import { 
  FadeUp, 
  FadeLeft, 
  FadeRight, 
  StaggerContainer, 
  StaggerItem,
  ScrollReveal 
} from "@/components/ui/scroll-reveal"
import EnglishLayout, { EnglishPageWrapper } from "@/components/EnglishLayout"

export default function LandingPage() {
  const [language, setLanguage] = useState<"zh" | "en">("en") // 默认英文

  // 动态设置页面标题为英文
  useEffect(() => {
    document.title = "AstroZi - AI Life Engineering Platform"
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', "World's first dual-system life engineering platform, fusing ancient Eastern wisdom with modern AI technology for precise life optimization.")
    }
  }, [])

  const content = {
    zh: {
      nav: { home: "主页", features: "功能", products: "产品", pricing: "价格", about: "关于", docs: "白皮书", login: "登录" },
      hero: {
        title: "生命工程：科学优化您的人生轨迹",
        subtitle: "世界首个双系统生命工程平台，融合古老东方智慧与现代AI技术。通过太阳系潜能工程与月亮系事件工程，将传统命理转化为数据驱动的生命优化协议。",
        highlight: "🌞 太阳系工程(八字) + 🌙 月亮系工程(紫微) = 完整生命架构",
        cta: "免费注册获取专属报告！",
        ctaZiwei: "🌙 月亮系工程 (紫微斗数)",
        ctaBazi: "🌞 太阳系工程 (八字分析)",
      },
      systemsTitle: "双系统生命工程框架",
      systemsSubtitle: "就像太阳决定地球的四季变化，月亮影响潮汐起伏一样，您的生命轨迹也受到双重宇宙力量的精准影响。我们的AI系统解码这些影响，为您提供科学的生命优化方案。",
      systems: [
        { 
          title: "太阳系潜能工程", 
          system: "八字系统",
          description: "如同太阳为地球提供能量和生命力，太阳系工程通过八字算法精准校准您的个人能力上限、优化潜能和人生成就天花板。",
          features: ["个人能力架构分析", "潜能优化路径规划", "成就天花板评估", "天赋强项识别"],
          icon: Sun,
          color: "from-yellow-400 to-amber-500"
        },
        { 
          title: "月亮系事件工程", 
          system: "紫微斗数系统",
          description: "如同月亮精确控制地球潮汐，月亮系工程通过紫微算法提供外科手术级的事件预测和最佳时机协议，指导您的人生导航。",
          features: ["精准事件预测", "最佳时机协议", "详细情景分析", "战术指导方案"],
          icon: Moon,
          color: "from-yellow-400 to-amber-500"
        }
      ],
      engineeringTitle: "生命工程应用场景",
      engineeringLabels: {
        solar: "🌞 太阳系分析",
        lunar: "🌙 月亮系分析", 
        solution: "🎯 工程方案"
      },
      engineeringCases: [
        {
          title: "💼 职业工程",
          solar: "您的能力上限：高管级别",
          lunar: "晋升机会：2025年3月",
          combined: "制定6个月高管转型战略定位协议",
          icon: Target
        },
        {
          title: "💕 关系工程", 
          solar: "兼容性框架：与分析型人格最优化",
          lunar: "遇见概率峰值：2024年10月专业社交活动",
          combined: "参加Q4专业社交活动3-5次，优化关系工程",
          icon: Users
        },
        {
          title: "🏥 健康工程",
          solar: "体质分析：心血管系统需要优化",
          lunar: "关键干预期：42-44岁",
          combined: "40岁开始实施心血管优化协议，季度监控",
          icon: TrendingUp
        }
      ],
      revolutionTitle: "生命工程革命",
      revolutionSubtitle: "从传统算命到现代生命工程",
      revolutionHighlight: {
        title: "传统算命 → 现代生命工程",
        description: "这不是算命 - 这是基于算法时机和能力优化的精准生命工程"
      },
      advantages: [
        { title: "AI驱动分析", description: "结合传统算法与现代AI，提供数据驱动的生命优化建议", icon: Bot },
        { title: "双系统验证", description: "太阳系+月亮系交叉验证，确保分析结果的准确性和可靠性", icon: Zap },
        { title: "区块链记录", description: "所有预测结果上链存储，建立透明可验证的准确性追踪系统", icon: Lock },
        { title: "社区互助", description: "生命工程师互助网络，在预测的挑战期提供精准支持", icon: Users },
        { title: "精准时机", description: "不只告诉您会发生什么，更重要的是告诉您何时采取行动", icon: Target },
        { title: "持续优化", description: "AI持续学习用户反馈，不断提升生命工程算法的精确度", icon: TrendingUp }
      ],
      pricingTitle: "选择您的生命工程方案",
      pricingSubtitle: "从基础分析到深度工程，我们为每个生命优化需求提供专业方案"
    },
    en: {
      nav: { home: "Home", features: "Features", products: "Products", pricing: "Pricing", about: "About", docs: "Docs", login: "Login" },
      hero: {
        title: "Life Engineering: Scientifically Optimize Your Life Trajectory",
        subtitle: "World's first dual-system life engineering platform, fusing ancient Eastern wisdom with modern AI technology. Transform traditional metaphysics into data-driven life optimization protocols through Solar Potential Engineering and Lunar Event Engineering.",
        highlight: "🌞 Solar Engineering + 🌙 Lunar Engineering =\nComplete Life Architecture",
        cta: "Register To Have A Free Report!",
        ctaZiwei: "🌙 Lunar Engineering (ZiWei)",
        ctaBazi: "🌞 Solar Engineering (BaZi)",
      },
      systemsTitle: "Dual-System Life Engineering Framework",
      systemsSubtitle: "Just as the Sun determines Earth's seasonal changes and the Moon influences tidal flows, your life trajectory is precisely influenced by dual cosmic forces. Our AI system decodes these influences to provide scientific life optimization solutions.",
      systems: [
        { 
          title: "Solar Potential Engineering", 
          system: "BaZi System",
          description: "Like the Sun providing energy and vitality to Earth, Solar Engineering precisely calibrates your personal capacity ceiling, optimization potential, and life achievement framework through BaZi algorithms.",
          features: ["Personal Capacity Architecture", "Potential Optimization Pathways", "Achievement Ceiling Assessment", "Talent Strength Identification"],
          icon: Sun,
          color: "from-yellow-400 to-amber-500"
        },
        { 
          title: "Lunar Event Engineering", 
          system: "ZiWei System",
          description: "Like the Moon precisely controlling Earth's tides, Lunar Engineering provides surgical-level event prediction and optimal timing protocols through ZiWei algorithms to guide your life navigation.",
          features: ["Precise Event Prediction", "Optimal Timing Protocols", "Detailed Scenario Analysis", "Tactical Guidance Plans"],
          icon: Moon,
          color: "from-yellow-400 to-amber-500"
        }
      ],
      engineeringTitle: "Life Engineering Applications",
      engineeringLabels: {
        solar: "Solar Analysis",
        lunar: "Lunar Analysis",
        solution: "Engineering Solution"
      },
      engineeringCases: [
        {
          title: "Career Engineering",
          solar: "Your Capacity Ceiling: Executive Level",
          lunar: "Promotion Opportunity: March 2025",
          combined: "Develop 6-month executive transition strategic positioning protocol",
          icon: Target
        },
        {
          title: "Relationship Engineering",
          solar: "Compatibility Framework: Optimized with Analytical Personalities",
          lunar: "Meeting Probability Peak: October 2024 Professional Networking",
          combined: "Attend 3-5 professional networking events in Q4 2024 for optimal relationship engineering",
          icon: Users
        },
        {
          title: "Health Engineering",
          solar: "Constitution Analysis: Cardiovascular System Optimization Required",
          lunar: "Critical Intervention Period: Ages 42-44",
          combined: "Implement cardiovascular optimization protocol starting age 40 with quarterly monitoring",
          icon: TrendingUp
        }
      ],
      revolutionTitle: "The Life Engineering Revolution",
      revolutionSubtitle: "From Traditional Fortune Telling to Modern Life Engineering",
      revolutionHighlight: {
        title: "Traditional Fortune Telling → Modern Life Engineering",
        description: "This is not fortune telling - this is precise life engineering based on algorithm timing and capability optimization"
      },
      advantages: [
        { title: "AI-Driven Analysis", description: "Combining traditional algorithms with modern AI for data-driven life optimization guidance", icon: Bot },
        { title: "Dual-System Validation", description: "Solar + Lunar cross-validation ensures accuracy and reliability of analysis results", icon: Zap },
        { title: "Blockchain Records", description: "All predictions stored on-chain, establishing transparent and verifiable accuracy tracking", icon: Lock },
        { title: "Community Support", description: "Life engineer mutual aid network providing precise support during predicted challenging periods", icon: Users },
        { title: "Precision Timing", description: "Not just what will happen, but more importantly, when to take action", icon: Target },
        { title: "Continuous Optimization", description: "AI continuously learns from user feedback, constantly improving life engineering algorithm precision", icon: TrendingUp }
      ],
      pricingTitle: "Choose Your Life Engineering Plan",
      pricingSubtitle: "From basic analysis to deep engineering, we provide professional solutions for every life optimization need"
    }
  }

  const t = content[language]

  return (
    <MainLayout language={language} setLanguage={setLanguage} t={t}>
      <div className="flex flex-col min-h-screen overflow-x-hidden">

        {/* Main Content - Modern Clean Design */}
        <main className="flex-grow w-full overflow-x-hidden">
          {/* Hero Section - Modern Centered Layout */}
          <section id="home" className="relative px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 md:pt-32 pb-16 sm:pb-20 md:pb-24">
            <div className="max-w-4xl mx-auto text-center">
              <FadeUp>
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/30 mb-8">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">
                    World's First AI Life Engineering Platform
                  </span>
                </div>

                {/* Main Heading */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold font-rajdhani text-white mb-4 sm:mb-6 leading-tight px-2">
                  Life Engineering<br/><span className="text-yellow-400">Scientifically Optimized</span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
                  Fusing ancient Eastern wisdom with modern AI technology through dual-system analysis
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-16 w-full px-4 sm:px-0">
                  <a href="/en/login" className="w-full sm:w-auto">
                    <button className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-yellow-400 text-purple-900 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(251,203,10,0.4)] flex items-center justify-center gap-2">
                      <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
                      Get Started
                      <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                        FREE
                      </span>
                    </button>
                  </a>
                  <a href="#features" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-transparent border-2 border-yellow-400/30 text-white rounded-lg font-semibold text-base sm:text-lg transition-all duration-300 hover:border-yellow-400/60 hover:bg-yellow-400/5">
                      Learn More
                    </button>
                  </a>
                </div>

                {/* Feature Pills */}
                <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-300">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-yellow-400/20">
                    <Sun className="w-4 h-4 text-yellow-400" />
                    <span>BaZi System</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-yellow-400/20">
                    <Moon className="w-4 h-4 text-yellow-400" />
                    <span>ZiWei System</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-yellow-400/20">
                    <Bot className="w-4 h-4 text-yellow-400" />
                    <span>AI Analysis</span>
                  </div>
                </div>
              </FadeUp>
            </div>
          </section>

          {/* Dual-System Engineering Section - Modern Redesign */}
          <section id="features" className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 bg-gradient-to-b from-transparent to-yellow-400/5">
            <div className="max-w-6xl mx-auto">
              <FadeUp>
                <div className="text-center mb-16">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-yellow-400" style={{ textShadow: '0 0 20px rgba(251,203,10,0.3)' }}>
                    {t.systemsTitle}
                  </h2>
                  <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto">
                    {t.systemsSubtitle}
                  </p>
                </div>
              </FadeUp>

              {/* Systems Grid - Simplified Design */}
              <div className="grid md:grid-cols-2 gap-8">
                {t.systems.map((system, index) => (
                  <FadeUp key={index} delay={index * 0.1}>
                    <div className="group relative p-8 rounded-2xl border border-yellow-400/20 bg-black/20 backdrop-blur-sm hover:border-yellow-400/40 transition-all duration-300 hover:shadow-lg h-full">
                      {/* Icon */}
                      <div className="mb-6">
                        <div className="inline-flex p-3 rounded-xl bg-yellow-400/10">
                          <system.icon className="w-8 h-8 text-yellow-400" />
                        </div>
                      </div>

                      {/* Title & System */}
                      <h3 className="text-2xl font-bold mb-2 text-white">
                        {system.title}
                      </h3>
                      <p className="text-yellow-400 font-semibold mb-4">
                        {system.system}
                      </p>

                      {/* Description */}
                      <p className="text-gray-200 mb-6 leading-relaxed">
                        {system.description}
                      </p>

                      {/* Features List */}
                      <ul className="space-y-2">
                        {system.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </FadeUp>
                ))}
              </div>
            </div>
          </section>

          {/* Engineering Applications - Modern Cards */}
          <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
            <div className="max-w-6xl mx-auto">
              <FadeUp>
                <div className="text-center mb-16">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-yellow-400" style={{ textShadow: '0 0 20px rgba(251,203,10,0.3)' }}>
                    {t.engineeringTitle}
                  </h2>
                </div>
              </FadeUp>

              <div className="grid md:grid-cols-3 gap-6">
                {t.engineeringCases.map((case_, index) => (
                  <FadeUp key={index} delay={index * 0.1}>
                    <div className="p-6 rounded-xl border border-yellow-400/20 bg-black/20 backdrop-blur-sm hover:border-yellow-400/40 transition-all duration-300 h-full">
                      {/* Title with Icon */}
                      <div className="flex items-center gap-3 mb-6">
                        <case_.icon className="w-6 h-6 text-yellow-400" />
                        <h3 className="text-xl font-bold text-white">
                          {case_.title}
                        </h3>
                      </div>

                      {/* Analysis Cards */}
                      <div className="space-y-3">
                        {/* Solar Analysis */}
                        <div className="p-3 rounded-lg bg-yellow-400/5 border-l-2 border-yellow-400">
                          <p className="text-xs font-semibold text-yellow-400 mb-1">
                            {t.engineeringLabels.solar}
                          </p>
                          <p className="text-sm text-gray-200">
                            {case_.solar}
                          </p>
                        </div>

                        {/* Lunar Analysis */}
                        <div className="p-3 rounded-lg bg-purple-500/5 border-l-2 border-purple-400">
                          <p className="text-xs font-semibold text-purple-400 mb-1">
                            {t.engineeringLabels.lunar}
                          </p>
                          <p className="text-sm text-gray-200">
                            {case_.lunar}
                          </p>
                        </div>

                        {/* Solution */}
                        <div className="p-3 rounded-lg bg-green-500/5 border-l-2 border-green-400">
                          <p className="text-xs font-semibold text-green-400 mb-1">
                            {t.engineeringLabels.solution}
                          </p>
                          <p className="text-sm text-gray-200">
                            {case_.combined}
                          </p>
                        </div>
                      </div>
                    </div>
                  </FadeUp>
                ))}
              </div>
            </div>
          </section>

          {/* Revolution Section - Modern Design */}
          <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 bg-gradient-to-b from-transparent to-yellow-400/5">
            <div className="max-w-6xl mx-auto">
              <FadeUp>
                <div className="text-center mb-16">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-yellow-400" style={{ textShadow: '0 0 20px rgba(251,203,10,0.3)' }}>
                    {t.revolutionTitle}
                  </h2>
                  <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                    {t.revolutionSubtitle}
                  </p>

                  {/* Highlight Card */}
                  <div className="inline-block p-6 rounded-2xl bg-gradient-to-r from-red-500/10 to-green-500/10 border border-yellow-400/20 backdrop-blur-sm mb-12">
                    <p className="text-xl font-bold text-white mb-2">
                      {t.revolutionHighlight.title}
                    </p>
                    <p className="text-gray-200">
                      {t.revolutionHighlight.description}
                    </p>
                  </div>
                </div>
              </FadeUp>

              {/* Advantages Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {t.advantages.map((advantage, index) => (
                  <FadeUp key={index} delay={index * 0.1}>
                    <div className="p-6 rounded-xl border border-yellow-400/20 bg-black/20 backdrop-blur-sm hover:border-yellow-400/40 transition-all duration-300 text-center h-full">
                      <advantage.icon className="w-10 h-10 mx-auto mb-4 text-yellow-400" />
                      <h3 className="text-lg font-bold mb-2 text-white">
                        {advantage.title}
                      </h3>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {advantage.description}
                      </p>
                    </div>
                  </FadeUp>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
            <div className="max-w-5xl mx-auto">
              <FadeUp>
                <div className="text-center mb-16">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-yellow-400" style={{ textShadow: '0 0 20px rgba(251,203,10,0.3)' }}>
                    {t.pricingTitle}
                  </h2>
                  <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto">
                    {t.pricingSubtitle}
                  </p>
                </div>
                <PricingSection language={language} />
              </FadeUp>
            </div>
          </section>

          {/* Final CTA - Modern Design */}
          <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
            <div className="max-w-4xl mx-auto">
              <FadeUp>
                <div className="relative p-8 sm:p-12 rounded-3xl border-2 border-yellow-400/40 bg-gradient-to-br from-purple-900/60 via-black/50 to-purple-900/60 backdrop-blur-lg overflow-hidden shadow-2xl">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

                  <div className="relative z-10">
                    {/* Header */}
                    <div className="text-center mb-10">
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/30 border-2 border-red-400/50 mb-6 shadow-lg">
                        <Gift className="w-4 h-4 text-red-300" />
                        <span className="text-sm font-bold text-red-200 uppercase tracking-wider">Limited Time Offer</span>
                      </div>

                      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white">
                        Start Your Journey Today
                      </h2>

                      <p className="text-xl sm:text-2xl text-gray-100 max-w-2xl mx-auto leading-relaxed">
                        Experience the world's first AI-powered life engineering platform
                      </p>
                    </div>

                    {/* Price & Features Grid */}
                    <div className="grid md:grid-cols-2 gap-8 mb-10">
                      {/* Price Card */}
                      <div className="p-8 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-yellow-400/10 border-2 border-yellow-400/40 shadow-xl">
                        <div className="flex items-baseline justify-center gap-2 mb-4">
                          <span className="text-7xl sm:text-8xl font-bold text-yellow-400 drop-shadow-lg">FREE</span>
                        </div>
                        <p className="text-center text-base font-medium text-gray-200">
                          First-time users only • One-time offer
                        </p>
                      </div>

                      {/* Features List */}
                      <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm">
                          <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-white font-bold text-base mb-1">AI-Powered Analysis</p>
                            <p className="text-gray-200 text-sm">BaZi & ZiWei dual-system insights</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm">
                          <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-white font-bold text-base mb-1">Web3 Authentication</p>
                            <p className="text-gray-200 text-sm">Secure wallet connection, no passwords</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm">
                          <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-white font-bold text-base mb-1">Full Platform Access</p>
                            <p className="text-gray-200 text-sm">Explore all features and tools</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="text-center">
                      <a href="/auth">
                        <button className="group relative inline-flex items-center gap-4 px-14 py-6 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-purple-900 rounded-2xl font-bold text-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(251,203,10,0.7)] overflow-hidden shadow-2xl">
                          <span className="absolute -top-3 -right-3 px-4 py-1.5 bg-red-500 text-white text-sm font-bold rounded-full animate-pulse shadow-lg border-2 border-white">
                            ONE-TIME
                          </span>

                          <Rocket className="w-7 h-7" />
                          <span>Get Started Now</span>
                          <Sparkles className="w-7 h-7" />

                          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>
                      </a>

                      <p className="mt-6 text-base text-gray-200 font-medium">
                        No credit card required • Instant access • Limited availability
                      </p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            </div>
          </section>
        </main>
      </div>
    </MainLayout>
  )
} 
