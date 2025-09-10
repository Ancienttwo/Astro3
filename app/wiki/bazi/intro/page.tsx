'use client'

import { useState } from 'react'
import { AdaptiveLayout } from '@/components/layout/adaptive-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

import { 
  Calendar,
  History,
  Brain,
  Network,
  Globe,
  AlertTriangle,
  BookOpen,
  TreePine,
  Mountain,
  Clock,
  Star,
  Lightbulb,
  ChevronRight,
  ArrowLeft
} from 'lucide-react'

export default function BaziIntroPage() {
  const [activeSection, setActiveSection] = useState<string | null>('definition')
  const router = useRouter()

  const pillarsData = [
    { name: '年柱', content: '天干＋地支 2字', color: 'bg-purple-100 dark:bg-purple-900/30' },
    { name: '月柱', content: '天干＋地支 2字', color: 'bg-blue-100 dark:bg-blue-900/30' },
    { name: '日柱', content: '天干＋地支 2字', color: 'bg-green-100 dark:bg-green-900/30' },
    { name: '时柱', content: '天干＋地支 2字', color: 'bg-yellow-100 dark:bg-yellow-900/30' }
  ]

  const historyTimeline = [
    {
      period: '夏商周 → 汉',
      title: '干支纪年制奠基',
      icon: <Calendar className="w-5 h-5" />,
      points: [
        '殷墟甲骨文已见「干支」记录；干支组合循环 60 甲子',
        '西汉《淮南子》首次完整列出十干十二支',
        '干支不仅纪年，也用于纪月、纪日、纪时，为四柱形成提供条件'
      ]
    },
    {
      period: '魏晋南北朝',
      title: '「四柱」概念雏形',
      icon: <BookOpen className="w-5 h-5" />,
      points: [
        '文献中出现用年干支论命的占筮，惟仅单柱或双柱',
        '南北朝《五行大义》提出"支配五行、推人休咎"的想法'
      ]
    },
    {
      period: '唐代',
      title: '成体系的「干支命理」出现',
      icon: <Star className="w-5 h-5" />,
      points: [
        '唐开元年间，国师李虚中用「年、月、日三柱」论命，被尊为「三柱始祖」',
        '唐末吕才（或署名徐子平）补足「时柱」，四柱体系正式确立'
      ]
    },
    {
      period: '宋代',
      title: '「子平法」成熟',
      icon: <Brain className="w-5 h-5" />,
      points: [
        '宋初术士徐子平整合前人方法，创立"以日干为我、配十神取用神、纳音、神杀"等完整规则',
        '北宋徐大升《珞琭子三命消息赋》、徐整《渊海子平》推广，八字研究风靡'
      ]
    },
    {
      period: '元明清',
      title: '深化与分流',
      icon: <Network className="w-5 h-5" />,
      points: [
        '元代麻衣道者《麻衣神相》、明代万育吾《三命通会》集大成',
        '清末沈孝瞻《滴天髓》对用神格局、气势、调候作系统阐述',
        '清以降出现星平合参（紫微斗数＋子平）、子平＋大六壬等多元融合'
      ]
    }
  ]

  const coreTheories = [
    {
      title: '阴阳五行',
      icon: <TreePine className="w-5 h-5" />,
      description: '甲乙属木、丙丁属火……以五行相生相克说明事物互动',
      color: 'from-green-100 to-emerald-200 dark:from-green-900/40 dark:to-emerald-800/40'
    },
    {
      title: '日主与十神',
      icon: <Star className="w-5 h-5" />,
      description: '比肩、劫财、食神、伤官、偏财、正财、七杀、正官、偏印、正印',
      color: 'from-purple-100 to-violet-200 dark:from-purple-900/40 dark:to-violet-800/40'
    },
    {
      title: '用神与喜忌',
      icon: <Brain className="w-5 h-5" />,
      description: '根据日主强弱、月令、通根、格局，选出「调候、扶抑、通关」的关键五行',
      color: 'from-blue-100 to-indigo-200 dark:from-blue-900/40 dark:to-indigo-800/40'
    },
    {
      title: '大运流年',
      icon: <Clock className="w-5 h-5" />,
      description: '每10年（或12年）行一次大运，再叠加流年天干地支，判断时间应期',
      color: 'from-orange-100 to-amber-200 dark:from-orange-900/40 dark:to-amber-800/40'
    },
    {
      title: '神煞与格局',
      icon: <Mountain className="w-5 h-5" />,
      description: '桃花、文昌、禄马、羊刃等神煞；正官格、食神生财格、伤官配印格等高级格局',
      color: 'from-red-100 to-pink-200 dark:from-red-900/40 dark:to-pink-800/40'
    }
  ]

  const comparisons = [
    {
      name: '紫微斗数',
      description: '紫微以天体位置（星曜）排12宫，八字以时间代号（干支）排4柱；前者更像「空间天文学」，后者偏「时间密码学」',
      icon: <Star className="w-5 h-5" />
    },
    {
      name: '奇门遁甲、大六壬',
      description: '后两者偏事占（问事择时），八字偏人命（看终身）',
      icon: <BookOpen className="w-5 h-5" />
    },
    {
      name: '风水',
      description: '环境派；八字是时间派，可互补',
      icon: <Mountain className="w-5 h-5" />
    }
  ]

  const applications = [
    '婚配、择日、命名、职业规划、风险管理等',
    '与心理学结合（性格倾向、原生家庭脚本）',
    '数据化、AI排盘与统计学验证逐渐兴起'
  ]

  const misconceptions = [
    {
      title: '「生克制化＝好坏」',
      correction: '实际上重在平衡与动态；忌神也可成事'
    },
    {
      title: '「八字决定论」',
      correction: '传统强调"趋吉避凶"与"修德改运"，并非宿命'
    },
    {
      title: '「只看年柱属相」',
      correction: '八字论命以日主为核心，生肖仅百分之一的信息量'
    }
  ]

  const SectionCard = ({ id, title, icon, children }: { 
    id: string, 
    title: string, 
    icon: React.ReactNode, 
    children: React.ReactNode 
  }) => (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader 
        className="cursor-pointer"
        onClick={() => setActiveSection(activeSection === id ? null : id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 flex items-center justify-center">
              {icon}
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <ChevronRight className={`w-5 h-5 transition-transform ${
            activeSection === id ? 'rotate-90' : ''
          }`} />
        </div>
      </CardHeader>
      
      {activeSection === id && (
        <CardContent className="pt-0 border-t">
          {children}
        </CardContent>
      )}
    </Card>
  )

  return (
    <AdaptiveLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* 页面标题 */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/wiki/bazi')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回八字基础
              </Button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">什么是八字？</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">八字命理概述 - 探索传统文化的时间密码</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* 定义概述 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                八字定义
              </CardTitle>
              <CardDescription>
                八字（Four Pillars of Destiny，四柱命理）一词，特指一个人出生年、月、日、时所对应的「八个字」
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {pillarsData.map((pillar, index) => (
                    <Card key={index} className={`${pillar.color} border-0`}>
                      <CardContent className="p-4 text-center">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{pillar.name}</h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{pillar.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">组合示例</h4>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-2">
                      甲子 丙寅 戊午 庚申
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      年柱：甲子 | 月柱：丙寅 | 日柱：戊午 | 时柱：庚申
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 历史发展 */}
          <SectionCard id="history" title="历史发展脉络" icon={<History className="w-5 h-5" />}>
            <div className="space-y-6">
              {historyTimeline.map((era, index) => (
                <div key={index} className="relative pl-8 pb-6 border-l-2 border-gray-200 dark:border-gray-700 last:border-l-0">
                  <div className="absolute -left-3 top-0 w-6 h-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                        {era.icon}
                      </div>
                      <div>
                        <Badge variant="outline" className="text-xs">{era.period}</Badge>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{era.title}</h4>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {era.points.map((point, idx) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 核心理论 */}
          <SectionCard id="theories" title="核心理论体系" icon={<Brain className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coreTheories.map((theory, index) => (
                <Card key={index} className={`bg-gradient-to-r ${theory.color} border-0`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        {theory.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{theory.title}</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{theory.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </SectionCard>

          {/* 与其他术数的比较 */}
          <SectionCard id="comparisons" title="与其他术数的比较" icon={<Globe className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {comparisons.map((comparison, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        {comparison.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{comparison.name}</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{comparison.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </SectionCard>

          {/* 现代应用 */}
          <SectionCard id="applications" title="现代应用" icon={<Lightbulb className="w-5 h-5" />}>
            <div className="space-y-4">
              {applications.map((app, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 dark:text-gray-300">{app}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 常见误区 */}
          <SectionCard id="misconceptions" title="常见误区澄清" icon={<AlertTriangle className="w-5 h-5" />}>
            <div className="space-y-4">
              {misconceptions.map((misconception, index) => (
                <div key={index} className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                    ❌ 误区：{misconception.title}
                  </h4>
                  <p className="text-red-700 dark:text-red-300">
                    ✅ 正确理解：{misconception.correction}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 深入学习 */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">继续深入学习</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    了解了八字的基本概念，接下来可以学习具体的干支含义和十神系统
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/wiki/bazi/tiangan-meaning')}
                      className="text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                    >
                      十天干含义
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/wiki/bazi/dizhi-meaning')}
                      className="text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                    >
                      十二地支含义
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/wiki/bazi/shishen-intro')}
                      className="text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                    >
                      十神系统
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdaptiveLayout>
  )
} 