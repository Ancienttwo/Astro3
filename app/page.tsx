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

export default function LandingPage() {
  const [language, setLanguage] = useState<"zh" | "ja" | "en">("en") // 默认英文

  // 动态设置页面标题为英文并强制暗色模式
  useEffect(() => {
    document.title = "AstroZi - AI Life Engineering Platform"
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', "World's first dual-system life engineering platform, fusing ancient Eastern wisdom with modern AI technology for precise life optimization.")
    }

    // 强制暗色模式
    document.documentElement.classList.add('dark')

    return () => {
      // 清理：离开页面时移除dark class（可选）
      // document.documentElement.classList.remove('dark')
    }
  }, [])

  const content = {
    zh: {
      nav: { home: "主页", features: "功能", products: "产品", pricing: "价格", about: "关于", docs: "白皮书", login: "登录" },
      hero: {
        title: "生命工程：科学优化您的人生轨迹",
        subtitle: "世界首个双系统生命工程平台，融合古老东方智慧与现代AI技术。通过太阳系潜能工程与月亮系事件工程，将传统命理转化为数据驱动的生命优化协议。",
        highlight: "太阳系工程(八字) + 月亮系工程(紫微) = 完整生命架构",
        cta: "免费注册获取专属报告！",
        ctaZiwei: "月亮系工程 (紫微斗数)",
        ctaBazi: "太阳系工程 (八字分析)",
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
          color: "from-purple-400 to-indigo-500"
        }
      ],
      engineeringTitle: "生命工程应用场景",
      engineeringLabels: {
        solar: "太阳系分析",
        lunar: "月亮系分析", 
        solution: "工程方案"
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
        highlight: "Solar Engineering + Lunar Engineering =\nComplete Life Architecture",
        cta: "Register To Have A Free Report!",
        ctaZiwei: "Lunar Engineering (ZiWei)",
        ctaBazi: "Solar Engineering (BaZi)",
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
          color: "from-purple-400 to-indigo-500"
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
          title: "💼 Career Engineering",
          solar: "Your Capacity Ceiling: Executive Level",
          lunar: "Promotion Opportunity: March 2025",
          combined: "Develop 6-month executive transition strategic positioning protocol",
          icon: Target
        },
        {
          title: "💕 Relationship Engineering", 
          solar: "Compatibility Framework: Optimized with Analytical Personalities",
          lunar: "Meeting Probability Peak: October 2024 Professional Networking",
          combined: "Attend 3-5 professional networking events in Q4 2024 for optimal relationship engineering",
          icon: Users
        },
        {
          title: "🏥 Health Engineering",
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
    },
    ja: {
      nav: { home: "ホーム", features: "機能", products: "製品", pricing: "料金", about: "概要", docs: "ホワイトペーパー", login: "ログイン" },
      hero: {
        title: "生命工学：科学的に人生の軌道を最適化",
        subtitle: "世界初のデュアルシステム生命工学プラットフォーム。古代東洋の知恵と現代のAI技術を融合。太陽系ポテンシャル工学と月系イベント工学により、伝統的な命理をデータ駆動の生命最適化プロトコルに変換します。",
        highlight: "太陽系工学(八字) + 月系工学(紫微) = 完全な生命アーキテクチャ",
        cta: "無料登録で専用レポートを取得！",
        ctaZiwei: "月系工学 (紫微斗数)",
        ctaBazi: "太陽系工学 (八字分析)",
      },
      systemsTitle: "デュアルシステム生命工学フレームワーク",
      systemsSubtitle: "太陽が地球の季節変化を決定し、月が潮汐の流れに影響を与えるように、あなたの人生の軌道も二重の宇宙の力によって精密に影響されています。私たちのAIシステムはこれらの影響をデコードし、科学的な生命最適化ソリューションを提供します。",
      systems: [
        { 
          title: "太陽系ポテンシャル工学", 
          system: "八字システム",
          description: "太陽が地球にエネルギーと活力を提供するように、太陽系工学は八字アルゴリズムを通じてあなたの個人的能力上限、最適化ポテンシャル、人生達成フレームワークを精密に調整します。",
          features: ["個人能力アーキテクチャ", "ポテンシャル最適化パス", "達成上限評価", "才能強み識別"],
          icon: Sun,
          color: "from-yellow-400 to-amber-500"
        },
        { 
          title: "月系イベント工学", 
          system: "紫微システム",
          description: "月が地球の潮汐を精密に制御するように、月系工学は紫微アルゴリズムを通じて外科手術レベルのイベント予測と最適タイミングプロトコルを提供し、あなたの人生ナビゲーションをガイドします。",
          features: ["精密イベント予測", "最適タイミングプロトコル", "詳細シナリオ分析", "戦術的ガイダンスプラン"],
          icon: Moon,
          color: "from-purple-400 to-indigo-500"
        }
      ],
      engineeringTitle: "生命工学アプリケーション",
      engineeringLabels: {
        solar: "太陽系分析",
        lunar: "月系分析", 
        solution: "工学ソリューション"
      },
      engineeringCases: [
        {
          title: "💼 キャリア工学",
          solar: "あなたの能力上限：エグゼクティブレベル",
          lunar: "昇進機会：2025年3月",
          combined: "6ヶ月間のエグゼクティブ移行戦略的ポジショニングプロトコルを開発",
          icon: Target
        },
        {
          title: "💕 関係工学", 
          solar: "互換性フレームワーク：分析的パーソナリティと最適化",
          lunar: "出会いの確率ピーク：2024年10月のプロフェッショナルネットワーキング",
          combined: "最適な関係工学のため2024年第4四半期に3-5回のプロフェッショナルネットワーキングイベントに参加",
          icon: Users
        },
        {
          title: "🏥 健康工学",
          solar: "体質分析：心血管システムの最適化が必要",
          lunar: "重要な介入期間：42-44歳",
          combined: "40歳から四半期監視付き心血管最適化プロトコルを実施",
          icon: TrendingUp
        }
      ],
      revolutionTitle: "生命工学革命",
      revolutionSubtitle: "伝統的な占いから現代の生命工学へ",
      revolutionHighlight: {
        title: "伝統的占い → 現代生命工学",
        description: "これは占いではありません - アルゴリズムタイミングと能力最適化に基づく精密な生命工学です"
      },
      advantages: [
        { title: "AI駆動分析", description: "伝統的アルゴリズムと現代AIを組み合わせ、データ駆動の生命最適化ガイダンスを提供", icon: Bot },
        { title: "デュアルシステム検証", description: "太陽系+月系クロス検証により、分析結果の正確性と信頼性を確保", icon: Zap },
        { title: "ブロックチェーン記録", description: "すべての予測をチェーン上に保存し、透明で検証可能な精度追跡を確立", icon: Lock },
        { title: "コミュニティサポート", description: "予測される困難な期間中に精密なサポートを提供する生命工学師相互援助ネットワーク", icon: Users },
        { title: "精密タイミング", description: "何が起こるかだけでなく、より重要なのはいつ行動を起こすかを教えます", icon: Target },
        { title: "継続的最適化", description: "AIはユーザーフィードバックから継続的に学習し、生命工学アルゴリズムの精度を常に向上させます", icon: TrendingUp }
      ],
      pricingTitle: "あなたの生命工学プランを選択",
      pricingSubtitle: "基本分析から深層工学まで、あらゆる生命最適化ニーズに専門的なソリューションを提供"
    }
  }

  const t = content[language]

  return (
    <MainLayout language={language} setLanguage={setLanguage} t={t}>
      <div className="flex flex-col min-h-screen bg-[rgb(var(--bg-color))]">

        {/* Main Content - Modern Clean Design */}
        <main className="flex-grow w-full">
          {/* Hero Section - Modern Centered Layout */}
          <section id="home" className="relative px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 md:pt-32 pb-16 sm:pb-20 md:pb-24">
            <div className="max-w-4xl mx-auto text-center">
              <FadeUp>
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgb(var(--accent-color))]/10 border border-[rgb(var(--accent-color))]/20 mb-8">
                  <Sparkles className="w-4 h-4 text-[rgb(var(--accent-color))]" />
                  <span className="text-sm font-medium text-[rgb(var(--accent-color))]">
                    {language === 'zh' ? '全球首个 AI 生命工程平台' : language === 'ja' ? '世界初の AI 生命工学プラットフォーム' : 'World\'s First AI Life Engineering Platform'}
                  </span>
                </div>

                {/* Main Heading */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-rajdhani text-[rgb(var(--primary-text-color))] mb-6 leading-tight">
                  {language === 'zh' ? (
                    <>科学优化<span className="text-[rgb(var(--accent-color))]">人生轨迹</span></>
                  ) : language === 'ja' ? (
                    <>科学的に<span className="text-[rgb(var(--accent-color))]">人生を最適化</span></>
                  ) : (
                    <>Life Engineering<br/><span className="text-[rgb(var(--accent-color))]">Scientifically Optimized</span></>
                  )}
                </h1>

                {/* Subtitle */}
                <p className="text-lg sm:text-xl md:text-2xl text-[rgb(var(--secondary-text-color))]/80 mb-12 max-w-2xl mx-auto leading-relaxed">
                  {language === 'zh' ?
                    '融合东方古老智慧与现代 AI 技术，通过双系统分析优化您的生命轨迹' :
                    language === 'ja' ?
                    '東洋の古代の知恵と最新のAI技術を融合し、デュアルシステム分析で人生の軌道を最適化' :
                    'Fusing ancient Eastern wisdom with modern AI technology through dual-system analysis'
                  }
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                  <a href={language === 'zh' ? '/login' : language === 'ja' ? '/ja/login' : '/en/login'}>
                    <button className="group relative px-8 py-4 bg-[rgb(var(--accent-color))] text-[rgb(var(--primary-text-color))] rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(var(--accent-color),0.4)] flex items-center gap-2">
                      <Rocket className="w-5 h-5" />
                      {language === 'zh' ? '开始分析' : language === 'ja' ? '分析を開始' : 'Get Started'}
                      <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                        {language === 'zh' ? 'FREE' : 'FREE'}
                      </span>
                    </button>
                  </a>
                  <a href="#features">
                    <button className="px-8 py-4 bg-transparent border-2 border-[rgb(var(--accent-color))]/30 text-[rgb(var(--secondary-text-color))] rounded-lg font-semibold text-lg transition-all duration-300 hover:border-[rgb(var(--accent-color))]/60 hover:bg-[rgb(var(--accent-color))]/5">
                      {language === 'zh' ? '了解更多' : language === 'ja' ? '詳細を見る' : 'Learn More'}
                    </button>
                  </a>
                </div>

                {/* Feature Pills */}
                <div className="flex flex-wrap justify-center gap-3 text-sm text-[rgb(var(--secondary-text-color))]/70">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgb(var(--card-bg))]/50 border border-[rgb(var(--accent-color))]/10">
                    <Sun className="w-4 h-4 text-[rgb(var(--accent-color))]" />
                    <span>{language === 'zh' ? '八字系统' : language === 'ja' ? '八字システム' : 'BaZi System'}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgb(var(--card-bg))]/50 border border-[rgb(var(--accent-color))]/10">
                    <Moon className="w-4 h-4 text-[rgb(var(--accent-color))]" />
                    <span>{language === 'zh' ? '紫微系统' : language === 'ja' ? '紫微システム' : 'ZiWei System'}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgb(var(--card-bg))]/50 border border-[rgb(var(--accent-color))]/10">
                    <Bot className="w-4 h-4 text-[rgb(var(--accent-color))]" />
                    <span>{language === 'zh' ? 'AI 智能分析' : language === 'ja' ? 'AI 分析' : 'AI Analysis'}</span>
                  </div>
                </div>
              </FadeUp>
            </div>
          </section>

          {/* Dual-System Engineering Section - Modern Redesign */}
          <section id="features" className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 bg-gradient-to-b from-transparent to-[rgb(var(--accent-color))]/5">
            <div className="max-w-6xl mx-auto">
              <FadeUp>
                <div className="text-center mb-16">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-[rgb(var(--primary-text-color))]">
                    {t.systemsTitle}
                  </h2>
                  <p className="text-lg sm:text-xl text-[rgb(var(--secondary-text-color))]/80 max-w-3xl mx-auto">
                    {t.systemsSubtitle}
                  </p>
                </div>
              </FadeUp>

              {/* Systems Grid - Simplified Design */}
              <div className="grid md:grid-cols-2 gap-8">
                {t.systems.map((system, index) => (
                  <FadeUp key={index} delay={index * 0.1}>
                    <div className="group relative p-8 rounded-2xl border border-[rgb(var(--accent-color))]/20 bg-[rgb(var(--card-bg))]/50 backdrop-blur-sm hover:border-[rgb(var(--accent-color))]/40 transition-all duration-300 hover:shadow-lg h-full">
                      {/* Icon */}
                      <div className="mb-6">
                        <div className="inline-flex p-3 rounded-xl bg-[rgb(var(--accent-color))]/10">
                          <system.icon className="w-8 h-8 text-[rgb(var(--accent-color))]" />
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-2xl font-bold text-[rgb(var(--primary-text-color))] mb-2">
                        {system.title}
                      </h3>
                      <p className="text-sm font-medium text-[rgb(var(--accent-color))] mb-4">
                        {system.system}
                      </p>
                      <p className="text-[rgb(var(--secondary-text-color))]/80 mb-6 leading-relaxed">
                        {system.description}
                      </p>

                      {/* Features */}
                      <ul className="space-y-3">
                        {system.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-[rgb(var(--accent-color))] flex-shrink-0 mt-0.5" />
                            <span className="text-[rgb(var(--secondary-text-color))]/70 text-sm">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </FadeUp>
                ))}
              </div>
            </div>
          </section>

          {/* Engineering Applications - Modern Grid */}
          <section id="products" className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
            <div className="max-w-7xl mx-auto">
              <FadeUp>
                <div className="text-center mb-16">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-[rgb(var(--primary-text-color))]">
                    {t.engineeringTitle}
                  </h2>
                </div>
              </FadeUp>

              {/* Applications Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {t.engineeringCases.map((case_, index) => (
                  <FadeUp key={index} delay={index * 0.1}>
                    <div className="group p-6 rounded-xl border border-[rgb(var(--accent-color))]/20 bg-[rgb(var(--card-bg))]/30 backdrop-blur-sm hover:border-[rgb(var(--accent-color))]/40 transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-6">
                        <case_.icon className="w-6 h-6 text-[rgb(var(--accent-color))]" />
                        <h3 className="text-lg font-bold text-[rgb(var(--primary-text-color))]">
                          {case_.title}
                        </h3>
                      </div>

                      {/* Details */}
                      <div className="space-y-4 flex-grow">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--accent-color))]">
                            <Sun className="w-4 h-4" />
                            {t.engineeringLabels.solar}
                          </div>
                          <p className="text-sm text-[rgb(var(--secondary-text-color))]/70 pl-6">
                            {case_.solar}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--accent-color))]">
                            <Moon className="w-4 h-4" />
                            {t.engineeringLabels.lunar}
                          </div>
                          <p className="text-sm text-[rgb(var(--secondary-text-color))]/70 pl-6">
                            {case_.lunar}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-[rgb(var(--accent-color))]/10">
                          <div className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--accent-color))] mb-2">
                            <Target className="w-4 h-4" />
                            {t.engineeringLabels.solution}
                          </div>
                          <p className="text-sm text-[rgb(var(--secondary-text-color))]/70 pl-6">
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

          {/* Pricing Section - Simplified */}
          <section id="pricing" className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
            <div className="max-w-6xl mx-auto">
              <FadeUp>
                <div className="text-center mb-16">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-[rgb(var(--primary-text-color))]">
                    {t.pricingTitle}
                  </h2>
                  <p className="text-lg sm:text-xl text-[rgb(var(--secondary-text-color))]/80 max-w-3xl mx-auto">
                    {t.pricingSubtitle}
                  </p>
                </div>
              </FadeUp>
              <PricingSection language={language} />
            </div>
          </section>

          {/* Web3 Benefits - Clean Modern Design */}
          <section id="about" className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 bg-gradient-to-t from-transparent to-[rgb(var(--accent-color))]/5">
            <div className="max-w-4xl mx-auto">
              <FadeUp>
                {/* Header */}
                <div className="text-center mb-12">
                  <div className="inline-flex p-4 rounded-2xl bg-[rgb(var(--accent-color))]/10 mb-6">
                    <Calendar className="w-12 h-12 text-[rgb(var(--accent-color))]" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-[rgb(var(--primary-text-color))]">
                    {language === 'zh' ? 'Web3 用户福利' : 'Web3 User Benefits'}
                  </h2>
                  <p className="text-lg sm:text-xl text-[rgb(var(--secondary-text-color))]/80 max-w-2xl mx-auto">
                    {language === 'zh' ?
                      '连接钱包即可享受每日签到奖励，获得AI分析次数和积分' :
                      'Connect your wallet for daily rewards, AI analysis credits, and points'
                    }
                  </p>
                </div>

                {/* Benefits Grid - Simplified */}
                <div className="grid sm:grid-cols-3 gap-6 mb-12">
                  <div className="text-center">
                    <div className="inline-flex p-3 rounded-xl bg-[rgb(var(--accent-color))]/10 mb-4">
                      <CheckCircle className="w-8 h-8 text-[rgb(var(--accent-color))]" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-[rgb(var(--primary-text-color))]">
                      {language === 'zh' ? '每日签到' : 'Daily Check-in'}
                    </h3>
                    <p className="text-sm text-[rgb(var(--secondary-text-color))]/70">
                      {language === 'zh' ? '每日获取 AI 分析次数' : 'Daily AI analysis credits'}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex p-3 rounded-xl bg-[rgb(var(--accent-color))]/10 mb-4">
                      <Coins className="w-8 h-8 text-[rgb(var(--accent-color))]" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-[rgb(var(--primary-text-color))]">
                      {language === 'zh' ? '积分累积' : 'Earn Points'}
                    </h3>
                    <p className="text-sm text-[rgb(var(--secondary-text-color))]/70">
                      {language === 'zh' ? '积累积分参与空投' : 'Accumulate for airdrops'}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex p-3 rounded-xl bg-[rgb(var(--accent-color))]/10 mb-4">
                      <Trophy className="w-8 h-8 text-[rgb(var(--accent-color))]" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-[rgb(var(--primary-text-color))]">
                      {language === 'zh' ? '连击奖励' : 'Streak Bonus'}
                    </h3>
                    <p className="text-sm text-[rgb(var(--secondary-text-color))]/70">
                      {language === 'zh' ? '连续签到获得加倍奖励' : 'Consecutive days multiply rewards'}
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <a href={language === 'zh' ? '/login' : language === 'ja' ? '/ja/login' : '/en/login'}>
                  <button className="px-8 py-4 bg-[rgb(var(--accent-color))] text-[rgb(var(--primary-text-color))] rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(var(--accent-color),0.4)] inline-flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    {language === 'zh' ? '连接钱包开始' : 'Connect Wallet to Start'}
                  </button>
                </a>
              </FadeUp>
            </div>
          </section>
          
        </main>
      </div>
    </MainLayout>
  )
}
