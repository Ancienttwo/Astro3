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

        {/* Header - Mobile Optimized */}
        <header className="py-4 sm:py-6 md:py-8 bg-transparent text-center">
          <StaggerContainer>
            <StaggerItem>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-rajdhani text-[rgb(var(--accent-color))] mb-2 sm:mb-4">
                ASTROZI
              </h1>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold font-rajdhani text-[rgb(var(--accent-color))] mb-2 px-4">
                {language === 'zh' ? '生命工程' : language === 'ja' ? '生命工学' : 'The First AI Life Engineering Platform'}
              </h2>
            </StaggerItem>
            <StaggerItem>
              <p className="mt-2 sm:mt-4 text-base sm:text-lg md:text-xl lg:text-2xl text-[rgb(var(--secondary-text-color))] font-medium px-4">
                {language === 'zh' ?
                  '科学优化人生轨迹 • AI + 古老智慧' :
                  language === 'ja' ?
                  '科学的人生軌道最適化 • AI + 古代の知恵' :
                  'Scientific Life Trajectory Optimization • AI + Ancient Wisdom'
                }
              </p>
            </StaggerItem>
          </StaggerContainer>
        </header>

        {/* Main Content - Mobile Optimized */}
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 flex flex-col items-center justify-center">
          {/* Hero Section - Responsive Grid */}
          <div id="home" className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center mb-12 sm:mb-16">
            {/* Left Content */}
            <FadeRight delay={0.2}>
              <div className="space-y-4 sm:space-y-6 text-center md:text-left">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-rajdhani text-[rgb(var(--accent-color))] leading-tight">
                  {t.hero.title}
                </h2>
                <p className="text-sm sm:text-base md:text-lg leading-relaxed text-[rgb(var(--secondary-text-color))]">
                  {t.hero.subtitle}
                </p>

                <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl backdrop-blur-md bg-[rgba(var(--card-bg))] border border-[rgb(var(--accent-color))]/30 shadow-2xl">
                  <div className="font-bold text-center text-[rgb(var(--accent-color))] text-base sm:text-lg space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Sun className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="text-sm sm:text-base">{language === 'zh' ? '太阳系工程(八字)' : language === 'ja' ? '太陽系工学(八字)' : 'Solar Engineering'}</span>
                    </div>
                    <div className="text-center text-lg sm:text-xl">+</div>
                    <div className="flex items-center justify-center gap-2">
                      <Moon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="text-sm sm:text-base">{language === 'zh' ? '月亮系工程(紫微)' : language === 'ja' ? '月系工学(紫微)' : 'Lunar Engineering'}</span>
                    </div>
                    <div className="text-center text-lg sm:text-xl">=</div>
                    <div className="flex items-center justify-center gap-2">
                      <Stars className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="text-sm sm:text-base">{language === 'zh' ? '完整生命架构' : language === 'ja' ? '完全な生命アーキテクチャ' : 'Complete Life Architecture'}</span>
                    </div>
                  </div>
                </div>

                <Alert className="backdrop-blur-md bg-[rgba(var(--card-bg))] border-[rgb(var(--accent-color))]/30 shadow-xl">
                  <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-[rgb(var(--accent-color))]" />
                  <AlertTitle className="font-bold text-[rgb(var(--accent-color))] text-base sm:text-lg">
                    {language === 'zh' ? '生命工程精度' : language === 'ja' ? '生命工学精度' : 'Life Engineering Precision'}
                  </AlertTitle>
                  <AlertDescription className="text-[rgb(var(--secondary-text-color))] text-sm sm:text-base">
                    {language === 'zh' ?
                      '精确的出生时间是生命工程算法的关键输入参数，影响双系统分析的准确性。' :
                      'Precise birth time is crucial for life engineering algorithm accuracy and dual-system analysis.'
                    }
                  </AlertDescription>
                </Alert>
              </div>
            </FadeRight>

            {/* Right CTA Card - Mobile Optimized */}
            <FadeLeft delay={0.4}>
              <Card className="w-full max-w-lg shadow-2xl backdrop-blur-md border-2 rounded-xl sm:rounded-2xl bg-[rgba(var(--card-bg))] border-[rgb(var(--accent-color))]/30 hover:border-[rgb(var(--accent-color))]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(var(--accent-color),0.3)]">
                <CardHeader className="text-center px-4 sm:px-6">
                  <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-[rgb(var(--accent-color))] rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-xl">
                    <Stars className="w-8 h-8 sm:w-10 sm:h-10 text-[rgb(var(--primary-text-color))]" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl md:text-2xl text-center font-bold text-[rgb(var(--accent-color))]">
                    {language === 'zh' ? '开始您的生命工程项目' : language === 'ja' ? 'あなたの生命工学プロジェクトを始めましょう' : 'Start Your Life Engineering Project'}
                  </CardTitle>
                  <CardDescription className="text-center text-[rgb(var(--secondary-text-color))] text-sm sm:text-base md:text-lg">
                    {language === 'zh' ?
                      '体验 AI 驱动的双系统生命工程分析，优化您的人生轨迹' :
                      'Experience AI-driven dual-system life engineering analysis to optimize your life trajectory'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                  <div className="space-y-3 sm:space-y-4">
                    <a href={language === 'zh' ? '/login' : language === 'ja' ? '/ja/login' : '/en/login'} className="w-full block">
                      <button
                        className="relative w-full py-4 sm:py-5 px-4 sm:px-6 text-base sm:text-lg font-bold rounded-lg sm:rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden group border-2 bg-[rgb(var(--accent-color))] text-[rgb(var(--primary-text-color))] border-[rgb(var(--accent-color))] hover:opacity-90 hover:shadow-[0_0_30px_rgba(var(--accent-color),0.5)]"
                      >
                        <span className="absolute top-0 right-0 px-2 py-1 text-xs font-bold bg-[rgb(var(--primary-text-color))] text-[rgb(var(--accent-color))] rounded-bl-lg shadow-lg flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          {language === 'zh' ? '推荐' : 'GIFT'}
                        </span>
                        <span className="flex items-center justify-center gap-2 sm:gap-3">
                          <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-sm sm:text-base">{language === 'zh' ? 'Web3钱包登录' : language === 'ja' ? 'ウォレット接続' : 'Connect Wallet'}</span>
                        </span>
                      </button>
                    </a>

                    <a href={language === 'zh' ? '/login' : language === 'ja' ? '/ja/login' : '/en/login'} className="w-full block">
                      <button
                        className="relative w-full py-4 sm:py-5 px-4 sm:px-6 text-base sm:text-lg font-bold rounded-lg sm:rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden group border-2 bg-[rgba(var(--card-bg))] text-[rgb(var(--secondary-text-color))] border-[rgb(var(--accent-color))]/50"
                      >
                        <span className="absolute top-0 right-0 px-2 py-1 text-xs font-bold bg-[rgb(var(--accent-color))] text-[rgb(var(--primary-text-color))] rounded-bl-lg shadow-lg">
                          {language === 'zh' ? '¥9.9' : 'Web2 Users'}
                        </span>
                        <span className="flex items-center justify-center gap-2 sm:gap-3">
                          <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-sm sm:text-base">{language === 'zh' ? '邮箱密码登录' : language === 'ja' ? 'メールログイン' : 'Email Login'}</span>
                        </span>
                      </button>
                    </a>
                  </div>


                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-[rgb(var(--secondary-text-color))]">
                      {language === 'zh' ?
                        'Web3免费 • 邮箱¥9.9 • AI智能分析 • 区块链验证' :
                        'Web3 Free • Email Login • AI Analysis • Blockchain Verified'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </FadeLeft>
          </div>

          {/* Dual-System Engineering Section - Mobile Optimized */}
          <div id="features" className="w-full max-w-7xl mb-12 sm:mb-16 md:mb-20">
            <FadeUp>
              <div className="text-center mb-8 sm:mb-12 md:mb-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-[rgb(var(--accent-color))]">{t.systemsTitle}</h2>
                <p className="text-base sm:text-lg md:text-xl leading-relaxed max-w-5xl mx-auto text-[rgb(var(--secondary-text-color))]">{t.systemsSubtitle}</p>
              </div>
            </FadeUp>

            {/* Systems Comparison - Responsive Grid */}
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 mb-12 sm:mb-16">
              {t.systems.map((system, index) => (
                <StaggerItem key={index}>
                  <Card className="backdrop-blur-md border-2 transition-all duration-300 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-[0_0_30px_rgba(var(--accent-color),0.2)] hover:-translate-y-2 bg-[rgba(var(--card-bg))] border-[rgb(var(--accent-color))]/30 hover:border-[rgb(var(--accent-color))]/50 h-full">
                    <CardContent className="p-4 sm:p-6 md:p-8">
                      <div className="flex items-center space-x-4 sm:space-x-6 mb-6 sm:mb-8">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[rgb(var(--accent-color))] flex items-center justify-center shadow-2xl flex-shrink-0">
                          <system.icon className="w-8 h-8 sm:w-10 sm:h-10 text-[rgb(var(--primary-text-color))]" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[rgb(var(--accent-color))] leading-tight">{system.title}</h3>
                          <p className="font-bold text-[rgb(var(--secondary-text-color))] text-sm sm:text-base md:text-lg">{system.system}</p>
                        </div>
                      </div>
                      <p className="leading-relaxed mb-6 sm:mb-8 text-[rgb(var(--secondary-text-color))] text-sm sm:text-base md:text-lg">{system.description}</p>
                      <div className="space-y-3 sm:space-y-4">
                        {system.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start space-x-3">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[rgb(var(--accent-color))] shadow-lg flex-shrink-0 mt-1.5 sm:mt-2"></div>
                            <span className="text-[rgb(var(--secondary-text-color))] text-sm sm:text-base">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          {/* Engineering Applications - Mobile Optimized */}
          <div id="products" className="w-full max-w-7xl mb-12 sm:mb-16 md:mb-20">
            <FadeUp>
              <div className="text-center mb-8 sm:mb-12 md:mb-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-[rgb(var(--accent-color))]">{t.engineeringTitle}</h2>
              </div>
            </FadeUp>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {t.engineeringCases.map((case_, index) => (
                <StaggerItem key={index}>
                  <Card className="backdrop-blur-md border-2 transition-all duration-300 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-[0_0_30px_rgba(var(--accent-color),0.2)] hover:-translate-y-2 bg-[rgba(var(--card-bg))] border-[rgb(var(--accent-color))]/30 hover:border-[rgb(var(--accent-color))]/50 h-full">
                    <CardContent className="p-4 sm:p-6 md:p-8">
                      <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                        <case_.icon className="w-8 h-8 sm:w-10 sm:h-10 text-[rgb(var(--accent-color))] flex-shrink-0" />
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-[rgb(var(--accent-color))] leading-tight">{case_.title}</h3>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                        <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl border-l-4 bg-[rgb(var(--accent-color))]/10 border-l-[rgb(var(--accent-color))] backdrop-blur-sm">
                          <p className="font-bold text-[rgb(var(--accent-color))] mb-2 flex items-center gap-2 text-sm sm:text-base"><Sun className="w-3 h-3 sm:w-4 sm:h-4" />{t.engineeringLabels.solar}</p>
                          <p className="text-[rgb(var(--secondary-text-color))] text-xs sm:text-sm">{case_.solar}</p>
                        </div>

                        <div className="bg-[rgb(var(--accent-color))]/20 p-3 sm:p-4 rounded-lg sm:rounded-xl border-l-4 border-[rgb(var(--accent-color))] backdrop-blur-sm">
                          <p className="text-[rgb(var(--accent-color))] font-bold mb-2 flex items-center gap-2 text-sm sm:text-base"><Moon className="w-3 h-3 sm:w-4 sm:h-4" />{t.engineeringLabels.lunar}</p>
                          <p className="text-[rgb(var(--secondary-text-color))] text-xs sm:text-sm">{case_.lunar}</p>
                        </div>

                        <div className="bg-[rgb(var(--accent-color))]/20 p-3 sm:p-4 rounded-lg sm:rounded-xl border-l-4 border-[rgb(var(--accent-color))] backdrop-blur-sm">
                          <p className="text-[rgb(var(--accent-color))] font-bold mb-2 flex items-center gap-2 text-sm sm:text-base"><Target className="w-3 h-3 sm:w-4 sm:h-4" />{t.engineeringLabels.solution}</p>
                          <p className="text-[rgb(var(--secondary-text-color))] text-xs sm:text-sm">{case_.combined}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          {/* Revolution Section - Mobile Optimized */}
          <div className="w-full max-w-7xl mb-12 sm:mb-16 md:mb-20">
            <FadeUp>
              <div className="text-center mb-8 sm:mb-12 md:mb-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-[rgb(var(--accent-color))]">
                  {t.revolutionTitle}
                </h2>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-4xl mx-auto mb-8 sm:mb-12 text-[rgb(var(--secondary-text-color))]">
                  {t.revolutionSubtitle}
                </p>

                <ScrollReveal direction="fade" delay={0.3}>
                  <div className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border-2 backdrop-blur-md shadow-2xl bg-[rgba(var(--card-bg))] border-[rgb(var(--accent-color))]/40 hover:border-[rgb(var(--accent-color))]/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(var(--accent-color),0.3)]">
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-[rgb(var(--accent-color))]">{t.revolutionHighlight.title}</p>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[rgb(var(--secondary-text-color))]">{t.revolutionHighlight.description}</p>
                  </div>
                </ScrollReveal>
              </div>
            </FadeUp>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {t.advantages.map((advantage, index) => (
                <StaggerItem key={index}>
                  <Card className="backdrop-blur-md border-2 transition-all duration-300 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-[0_0_30px_rgba(var(--accent-color),0.2)] hover:-translate-y-2 bg-[rgba(var(--card-bg))] border-[rgb(var(--accent-color))]/30 hover:border-[rgb(var(--accent-color))]/50 h-full">
                    <CardContent className="p-4 sm:p-6 md:p-8 text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 bg-[rgb(var(--accent-color))] rounded-full flex items-center justify-center shadow-xl">
                        <advantage.icon className="w-6 h-6 sm:w-8 sm:h-8 text-[rgb(var(--primary-text-color))]" />
                      </div>
                      <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-[rgb(var(--accent-color))]">{advantage.title}</h3>
                      <p className="leading-relaxed text-[rgb(var(--secondary-text-color))] text-sm sm:text-base">{advantage.description}</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          {/* Pricing Section - Mobile Optimized */}
          <FadeUp>
            <div id="pricing" className="w-full max-w-6xl mb-12 sm:mb-16 md:mb-20">
              <div className="text-center mb-8 sm:mb-12 md:mb-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-[rgb(var(--accent-color))]">
                  {t.pricingTitle}
                </h2>
                <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto text-[rgb(var(--secondary-text-color))]">
                  {t.pricingSubtitle}
                </p>
              </div>
              <PricingSection language={language} />
            </div>
          </FadeUp>

          {/* Web3 Daily Check-in Benefits - Mobile Optimized */}
          <FadeUp delay={0.2}>
            <div id="about" className="w-full max-w-6xl text-center">
              <Card className="backdrop-blur-md border-2 transition-all duration-300 rounded-xl sm:rounded-2xl shadow-2xl bg-[rgba(var(--card-bg))] border-[rgb(var(--accent-color))]/40 hover:border-[rgb(var(--accent-color))]/60 hover:shadow-[0_0_30px_rgba(var(--accent-color),0.3)]">
                <CardContent className="p-6 sm:p-8 md:p-12">
                  <div className="flex justify-center mb-4 sm:mb-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-[rgb(var(--accent-color))] rounded-full flex items-center justify-center shadow-2xl">
                      <Calendar className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[rgb(var(--primary-text-color))]" />
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-[rgb(var(--accent-color))]">
                    {language === 'zh' ? 'Web3用户每日签到福利' : 'Web3 Users Daily Check-in Benefits'}
                  </h2>

                  <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 leading-relaxed text-[rgb(var(--secondary-text-color))] max-w-4xl mx-auto">
                    {language === 'zh' ? 
                      '连接钱包即可享受每日签到奖励，获得AI分析次数、积累积分、参与未来空投分配，打造区块链驱动的命理分析体验' :
                      'Connect your wallet to enjoy daily check-in rewards, earn AI analysis credits, accumulate points, and participate in future airdrop distributions with blockchain-powered astrology experience'
                    }
                  </p>
                  
                  {/* Benefits Grid - Mobile Optimized */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {/* Daily Check-in Mechanism */}
                    <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border backdrop-blur-sm bg-[rgba(var(--card-bg))] border-[rgb(var(--accent-color))]/30">
                      <div className="flex justify-center mb-3 sm:mb-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[rgb(var(--accent-color))] rounded-full flex items-center justify-center shadow-xl">
                          <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-[rgb(var(--primary-text-color))]" />
                        </div>
                      </div>
                      <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 text-[rgb(var(--accent-color))]">
                        {language === 'zh' ? '每日签到机制' : 'Daily Check-in System'}
                      </h3>
                      <div className="space-y-2 text-[rgb(var(--secondary-text-color))] text-xs sm:text-sm">
                        <div className="flex items-center justify-between p-2 bg-white/10 rounded">
                          <span>{language === 'zh' ? '基础奖励' : 'Base Reward'}</span>
                          <span className="text-[rgb(var(--accent-color))]">{language === 'zh' ? '1次AI分析' : '1 AI Analysis'}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white/10 rounded">
                          <span>{language === 'zh' ? '连续7天' : '7-Day Streak'}</span>
                          <span className="text-[rgb(var(--accent-color))]">{language === 'zh' ? '2倍奖励' : '2x Rewards'}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white/10 rounded">
                          <span>{language === 'zh' ? '连续30天' : '30-Day Streak'}</span>
                          <span className="text-[rgb(var(--accent-color))]">{language === 'zh' ? '5倍奖励' : '5x Rewards'}</span>
                        </div>
                        <div className="text-xs text-[rgb(var(--secondary-text-color))]/70 mt-3">
                          {language === 'zh' ? '※ 仅需0.0002 BNB燃料费' : '※ Only 0.0002 BNB gas fee'}
                        </div>
                      </div>
                    </div>

                    {/* AI Report Mechanism */}
                    <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border backdrop-blur-sm bg-[rgba(var(--card-bg))] border-[rgb(var(--accent-color))]/30">
                      <div className="flex justify-center mb-3 sm:mb-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[rgb(var(--accent-color))] rounded-full flex items-center justify-center shadow-xl">
                          <Bot className="w-6 h-6 sm:w-8 sm:h-8 text-[rgb(var(--primary-text-color))]" />
                        </div>
                      </div>
                      <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 text-[rgb(var(--accent-color))]">
                        {language === 'zh' ? 'AI报告机制' : 'AI Report System'}
                      </h3>
                      <div className="space-y-2 text-[rgb(var(--secondary-text-color))] text-xs sm:text-sm">
                        <div className="flex items-center justify-between p-2 bg-white/10 rounded">
                          <span>{language === 'zh' ? '用神大师' : 'Yong Shen Master'}</span>
                          <span className="text-[rgb(var(--accent-color))]">{language === 'zh' ? '元素分析' : 'Element Analysis'}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white/10 rounded">
                          <span>{language === 'zh' ? '铁口直断' : 'Direct Fortune'}</span>
                          <span className="text-[rgb(var(--accent-color))]">{language === 'zh' ? '直接预测' : 'Direct Prediction'}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white/10 rounded">
                          <span>{language === 'zh' ? '四化分析' : 'Four Changes'}</span>
                          <span className="text-[rgb(var(--accent-color))]">{language === 'zh' ? '紫微专精' : 'ZiWei Expert'}</span>
                        </div>
                        <div className="text-xs text-[rgb(var(--secondary-text-color))]/70 mt-3">
                          {language === 'zh' ? '※ 签到获得分析次数，永不过期' : '※ Get analysis credits via check-in, never expire'}
                        </div>
                      </div>
                    </div>

                    {/* Points & Airdrop Mechanism */}
                    <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border backdrop-blur-sm bg-[rgba(var(--card-bg))] border-[rgb(var(--accent-color))]/30">
                      <div className="flex justify-center mb-3 sm:mb-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[rgb(var(--accent-color))] rounded-full flex items-center justify-center shadow-xl">
                          <Coins className="w-6 h-6 sm:w-8 sm:h-8 text-[rgb(var(--primary-text-color))]" />
                        </div>
                      </div>
                      <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 text-[rgb(var(--accent-color))]">
                        {language === 'zh' ? '积分空投机制' : 'Points & Airdrop System'}
                      </h3>
                      <div className="space-y-2 text-[rgb(var(--secondary-text-color))] text-xs sm:text-sm">
                        <div className="flex items-center justify-between p-2 bg-white/10 rounded">
                          <span>{language === 'zh' ? '基础积分' : 'Base Points'}</span>
                          <span className="text-[rgb(var(--accent-color))]">{language === 'zh' ? '10分/天' : '10 pts/day'}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white/10 rounded">
                          <span>{language === 'zh' ? '连击奖励' : 'Streak Bonus'}</span>
                          <span className="text-[rgb(var(--accent-color))]">{language === 'zh' ? '最高5倍' : 'Up to 5x'}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white/10 rounded">
                          <span>{language === 'zh' ? '空投权重' : 'Airdrop Weight'}</span>
                          <span className="text-[rgb(var(--accent-color))]">{language === 'zh' ? '积分累积' : 'Points Accumulate'}</span>
                        </div>
                        <div className="text-xs text-[rgb(var(--secondary-text-color))]/70 mt-3">
                          {language === 'zh' ? '※ 积分决定未来代币分配比例' : '※ Points determine future token allocation ratio'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* CTA Buttons - Mobile Optimized */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-3xl mx-auto mb-4 sm:mb-6 px-4">
                    <a href={language === 'zh' ? '/login' : language === 'ja' ? '/ja/login' : '/en/login'} className="flex-1">
                      <button
                        className="relative w-full px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-base sm:text-lg md:text-xl lg:text-2xl font-bold rounded-xl sm:rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden group border-2 bg-[rgb(var(--accent-color))] text-[rgb(var(--primary-text-color))] border-[rgb(var(--accent-color))] hover:opacity-90 hover:shadow-[0_0_40px_rgba(var(--accent-color),0.6)]"
                      >
                        <span className="absolute top-0 right-0 px-2 sm:px-3 py-1 text-xs font-bold bg-[rgb(var(--accent-color))] text-[rgb(var(--primary-text-color))] rounded-bl-lg shadow-lg flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          {language === 'zh' ? '推荐' : 'GIFT'}
                        </span>
                        <span className="flex items-center justify-center gap-2 sm:gap-3">
                          <Wallet className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                          <span className="text-sm sm:text-base md:text-lg">{language === 'zh' ? '连接钱包' : 'Connect Wallet'}</span>
                        </span>
                      </button>
                    </a>

                    <a href={language === 'zh' ? '/login' : language === 'ja' ? '/ja/login' : '/en/login'} className="flex-1">
                      <button
                        className="relative w-full px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-base sm:text-lg md:text-xl lg:text-2xl font-bold rounded-xl sm:rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden group border-2 bg-[rgba(var(--card-bg))] text-[rgb(var(--secondary-text-color))] border-[rgb(var(--accent-color))]/50"
                      >
                        <span className="absolute top-0 right-0 px-2 sm:px-3 py-1 text-xs font-bold bg-[rgb(var(--accent-color))] text-[rgb(var(--primary-text-color))] rounded-bl-lg shadow-lg">
                          {language === 'zh' ? '¥9.9' : 'Web2 Users'}
                        </span>
                        <span className="flex items-center justify-center gap-2 sm:gap-3">
                          <Mail className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                          <span className="text-sm sm:text-base md:text-lg">{language === 'zh' ? '打开 Web3 登录' : language === 'ja' ? 'Web3 ログインを開く' : 'Open Web3 Login'}</span>
                        </span>
                      </button>
                    </a>
                  </div>

                  <div className="flex items-center justify-center space-x-6 text-sm text-[rgb(var(--secondary-text-color))]">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-[rgb(var(--accent-color))]" />
                      <span>{language === 'zh' ? '每日签到奖励' : 'Daily Check-in Rewards'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-[rgb(var(--accent-color))]" />
                      <span>{language === 'zh' ? '连击奖励加成' : 'Streak Bonus Multiplier'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Coins className="w-4 h-4 text-[rgb(var(--accent-color))]" />
                      <span>{language === 'zh' ? '空投积分累积' : 'Airdrop Points Accumulation'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </FadeUp>
          
        </main>
      </div>
    </MainLayout>
  )
}
