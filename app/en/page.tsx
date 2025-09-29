"use client"

import { useState, useEffect } from "react"
import MainLayout from "@/components/MainLayout"
import PricingSection from "@/components/PricingSection"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Bot, Zap, TrendingUp, Users, Lock, Rocket, Target, Sun, Moon } from "lucide-react"
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
        solar: "🌞 Solar Analysis",
        lunar: "🌙 Lunar Analysis", 
        solution: "🎯 Engineering Solution"
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
    }
  }

  const t = content[language]

  return (
    <MainLayout language={language} setLanguage={setLanguage} t={t}>
      <div className="flex flex-col min-h-screen bg-transparent">
        {/* Header */}
        <header className="py-6 bg-transparent text-center px-page-inline">
          <StaggerContainer>
            <StaggerItem>
              <h1 className="text-5xl font-extrabold text-yellow-400 font-rajdhani">
                ASTROZI <span className="text-yellow-400">{language === 'zh' ? '生命工程' : 'Life Engineering'}</span>
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="mt-2 text-lg text-gray-200 dark:text-gray-200">
                {language === 'zh' ? 
                  '科学优化人生轨迹 • AI + 古老智慧' : 
                  'Life Engineering Platform • AI + Ancient Wisdom'
                }
              </p>
            </StaggerItem>
          </StaggerContainer>
        </header>

        {/* Main Content */}
        <main className="flex-grow mx-auto flex w-full max-w-page flex-col items-center justify-center gap-section-stack px-page-inline py-section-stack">
          {/* Hero Section */}
          <div className="grid w-full items-center gap-8 md:grid-cols-2 md:gap-12">
            {/* Left Content */}
            <FadeRight delay={0.2}>
              <div className="space-y-6 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-yellow-400">
                  {t.hero.title}
                </h2>
                <p className="text-gray-200 dark:text-gray-200 text-base md:text-lg leading-relaxed">
                  {t.hero.subtitle}
                </p>
              
              <Card className="border border-yellow-500/30 bg-gradient-to-r from-yellow-500/20 to-purple-500/20 p-card-padding shadow-soft backdrop-blur-sm">
                <p className="text-center text-sm font-semibold text-yellow-400 whitespace-pre-line">
                  {t.hero.highlight}
                </p>
              </Card>
              
              <Alert className="bg-purple-900/30 border-purple-500/30 backdrop-blur-sm">
                <Rocket className="h-5 w-5 text-yellow-400" />
                <AlertTitle className="font-semibold text-yellow-400">
                  {language === 'zh' ? '生命工程精度' : 'Life Engineering Precision'}
                </AlertTitle>
                <AlertDescription className="text-gray-200 dark:text-gray-200">
                  {language === 'zh' ? 
                    '精确的出生时间是生命工程算法的关键输入参数，影响双系统分析的准确性。' :
                    'Precise birth time is crucial for life engineering algorithm accuracy and dual-system analysis.'
                  }
                </AlertDescription>
              </Alert>
              </div>
            </FadeRight>

            {/* Right CTA Card */}
            <FadeLeft delay={0.4}>
              <Card className="w-full max-w-md shadow-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-center text-yellow-400">
                    {language === 'zh' ? '开始您的生命工程项目' : 'Start Your Life Engineering Project'}
                  </CardTitle>
                  <CardDescription className="text-center text-gray-200 dark:text-gray-200">
                    {language === 'zh' ? 
                      '体验 AI 驱动的双系统生命工程分析，优化您的人生轨迹' :
                      'Experience AI-driven dual-system life engineering analysis to optimize your life trajectory'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-center">
                    <a href="/auth" className="w-full">
                      <button className="relative w-full bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 py-5 px-6 text-xl font-bold rounded-lg shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden group border-2 border-yellow-400 hover:border-yellow-300">
                        <span className="absolute top-0 right-0 px-3 py-1 text-xs font-bold bg-red-500 text-white rounded-bl-lg shadow-lg animate-pulse">
                          {language === 'zh' ? '限时免费' : 'FREE'}
                        </span>
                        <span className="text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300 flex items-center justify-center gap-2">
                          <span className="text-2xl">🎁</span>
                          {t.hero.cta}
                        </span>
                      </button>
                    </a>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-300 dark:text-gray-300">
                      {language === 'zh' ? 
                        '免费体验 • AI智能分析 • 区块链验证 • 社区互助' :
                        'Free Trial • AI Analysis • Blockchain Verification • Community Support'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </FadeLeft>
          </div>

          {/* Dual-System Engineering Section */}
          <div className="w-full">
            <FadeUp>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-6">{t.systemsTitle}</h2>
                <p className="text-lg text-gray-200 dark:text-gray-200 leading-relaxed max-w-4xl mx-auto">{t.systemsSubtitle}</p>
              </div>
            </FadeUp>

            {/* Systems Comparison */}
            <StaggerContainer className="grid md:grid-cols-2 gap-8 mb-12">
              {t.systems.map((system, index) => (
                <StaggerItem key={index}>
                  <Card className="border border-white/20 bg-white/10 backdrop-blur-md transition-all duration-300 hover:bg-white/15">
                    <CardContent className="space-y-6 p-card-padding">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${system.color} flex items-center justify-center`}>
                        <system.icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{system.title}</h3>
                        <p className="text-yellow-400 font-semibold">{system.system}</p>
                      </div>
                    </div>
                    <p className="text-gray-200 dark:text-gray-200 leading-relaxed">{system.description}</p>
                    <div className="space-y-2">
                      {system.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <span className="text-gray-200 dark:text-gray-200 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          {/* Engineering Applications */}
          <div className="w-full">
            <FadeUp>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-6">{t.engineeringTitle}</h2>
              </div>
            </FadeUp>

            <StaggerContainer className="grid md:grid-cols-3 gap-6">
              {t.engineeringCases.map((case_, index) => (
                <StaggerItem key={index}>
                  <Card
                    className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300"
                  >
                  <CardContent className="space-y-3 p-card-padding">
                    <div className="flex items-center space-x-3 mb-4">
                      <case_.icon className="w-8 h-8 text-yellow-400" />
                      <h3 className="text-lg font-bold text-white">{case_.title}</h3>
                    </div>
                    
                      <div className="space-y-3 text-sm">
                      <Card className="border-l-4 border-l-yellow-500 bg-yellow-500/20 p-card-padding shadow-soft">
                        <p className="text-yellow-400 font-semibold">{t.engineeringLabels.solar}</p>
                        <p className="text-gray-200 dark:text-gray-200">{case_.solar}</p>
                      </Card>
                      
                      <Card className="border-l-4 border-l-purple-500 bg-purple-500/20 p-card-padding shadow-soft">
                        <p className="text-purple-400 font-semibold">{t.engineeringLabels.lunar}</p>
                        <p className="text-gray-200 dark:text-gray-200">{case_.lunar}</p>
                      </Card>
                      
                      <Card className="border-l-4 border-l-green-500 bg-green-500/20 p-card-padding shadow-soft">
                        <p className="text-green-400 font-semibold">{t.engineeringLabels.solution}</p>
                        <p className="text-gray-200 dark:text-gray-200">{case_.combined}</p>
                      </Card>
                      </div>
                  </CardContent>
                </Card>
              </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          {/* Revolution Section */}
          <div className="w-full">
            <FadeUp>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-400">
                  {t.revolutionTitle}
                </h2>
                <p className="text-xl text-gray-200 dark:text-gray-200 max-w-3xl mx-auto mb-8">
                  {t.revolutionSubtitle}
                </p>
                
                <ScrollReveal direction="fade" delay={0.3}>
                  <Card className="border border-white/20 bg-gradient-to-r from-red-500/20 to-green-500/20 p-card-padding shadow-soft backdrop-blur-sm">
                    <p className="mb-2 text-2xl font-bold text-white">{t.revolutionHighlight.title}</p>
                    <p className="text-gray-200 dark:text-gray-200">{t.revolutionHighlight.description}</p>
                  </Card>
                </ScrollReveal>
              </div>
            </FadeUp>
            
            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {t.advantages.map((advantage, index) => (
                <StaggerItem key={index}>
                  <Card className="border border-white/20 bg-white/10 backdrop-blur-md transition-all duration-300 hover:bg-white/15">
                    <CardContent className="p-card-padding text-center">
                    <advantage.icon className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                    <h3 className="text-xl font-semibold mb-3 text-white">{advantage.title}</h3>
                    <p className="text-gray-200 dark:text-gray-200 leading-relaxed text-sm">{advantage.description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          {/* Pricing Section */}
          <FadeUp>
            <div className="w-full max-w-5xl mb-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-400">
                  {t.pricingTitle}
                </h2>
                <p className="text-xl text-gray-200 dark:text-gray-200 max-w-2xl mx-auto">
                  {t.pricingSubtitle}
                </p>
              </div>
              <PricingSection language={language} />
            </div>
          </FadeUp>

          {/* Final CTA */}
          <FadeUp delay={0.2}>
            <div className="w-full max-w-3xl text-center">
              <Card className="border border-white/20 bg-white/10 backdrop-blur-md transition-all duration-300 hover:bg-white/15">
                <CardContent className="space-y-6 p-card-padding">
                  <h2 className="text-3xl font-bold mb-4 text-yellow-400">
                    {language === 'zh' ? '1天体验 - 限购一次' : '1-Day Trial - One-time Only'}
                  </h2>
                  
                  <p className="text-xl text-gray-200 dark:text-gray-200 mb-6 leading-relaxed">
                    {language === 'zh' ? 
                      '首次用户专享1天完整体验，深度感受AI驱动的生命工程分析' :
                      'First-time users exclusive 1-day full experience, deep dive into AI-driven life engineering analysis'
                    }
                  </p>
                  
                  <Card className="mb-6 border border-yellow-500/30 bg-gradient-to-r from-yellow-500/20 to-purple-500/20 p-card-padding shadow-soft backdrop-blur-sm">
                    <div className="text-center space-y-3">
                      <div className="text-4xl font-bold text-yellow-400 mb-3">
                        {language === 'zh' ? '¥9.9' : 'FREE'}
                      </div>
                      <div className="text-sm text-white space-y-1">
                        {language === 'zh' ? (
                          <>
                            <p>• 体验完整AI命理分析功能</p>
                            <p>• 包含详细报告和专业解读</p>
                            <p>• 仅限首次用户购买</p>
                            <p>• 一次性付费，无月费</p>
                          </>
                        ) : (
                          <>
                            <p>• Connect your wallet securely</p>
                            <p>• Access AI-powered BaZi & ZiWei analysis</p>
                            <p>• Educational Chinese astrology content</p>
                            <p>• Web3 authentication - no passwords needed</p>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                  
                  <a href={language === 'zh' ? "/subscription" : "/auth"}>
                    <button className="relative bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 px-12 py-6 text-2xl font-bold rounded-lg shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden group border-2 border-yellow-400 hover:border-yellow-300">
                      <span className="absolute top-0 right-0 px-4 py-2 text-sm font-bold bg-red-500 text-white rounded-bl-lg shadow-lg animate-pulse">
                        {language === 'zh' ? '限购一次' : 'ONE-TIME'}
                      </span>
                      <span className="text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300 flex items-center justify-center gap-3">
                        <span className="text-3xl">⚡</span>
                        {language === 'zh' ? '立即体验 ¥9.9' : 'Get Started'}
                        <span className="text-3xl">⚡</span>
                      </span>
                    </button>
                  </a>
                  
                  <p className="mt-4 text-sm text-gray-300 dark:text-gray-300">
                    {language === 'zh' ? 
                      '⚡ 首次用户专享 • 🎯 完整功能体验 • 🔒 限购一次 • 💎 超值价格' :
                      '⚡ First-time Users Only • 🎯 Full Feature Experience • 🔒 One-time Purchase • 💎 Great Value'
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </FadeUp>
        </main>
      </div>
    </MainLayout>
  )
} 
