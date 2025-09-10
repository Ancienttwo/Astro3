'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdaptiveLayout } from '@/components/layout/adaptive-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TreePine, Sun, Flame, Mountain, Droplets, Circle } from 'lucide-react'

export default function TianganMeaningPage() {
  const router = useRouter()
  const [selectedGan, setSelectedGan] = useState<string | null>(null)

  const tianganData = [
    {
      name: '甲',
      element: '阳木',
      icon: <TreePine className="w-5 h-5" />,
      color: 'from-green-100 to-emerald-200 dark:from-green-900/40 dark:to-emerald-800/40',
      meaning: '参天大树，栋梁之材',
      characteristics: [
        '性格：刚健向上，有领导能力',
        '象征：大树、森林、栋梁',
        '方位：东方',
        '季节：春季',
        '性质：生发、向上、刚直'
      ],
      personality: '甲木之人通常性格刚直，有担当，具有领导才能，但有时过于固执。',
      career: '适合管理、领导、教育等需要权威性的工作。',
      relationships: '在感情中比较主动，但需要学会包容和灵活。'
    },
    {
      name: '乙',
      element: '阴木',
      icon: <TreePine className="w-5 h-5" />,
      color: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
      meaning: '柔嫩花草，灵活适应',
      characteristics: [
        '性格：柔韧灵活，善于适应',
        '象征：花草、藤蔓、灌木',
        '方位：东方',
        '季节：春季',
        '性质：柔顺、灵活、生长'
      ],
      personality: '乙木之人性格温和，善于变通，有很强的适应能力和生存智慧。',
      career: '适合创意、设计、咨询等需要灵活性的工作。',
      relationships: '在感情中体贴入微，但有时过于迁就他人。'
    },
    {
      name: '丙',
      element: '阳火',
      icon: <Sun className="w-5 h-5" />,
      color: 'from-red-100 to-orange-200 dark:from-red-900/40 dark:to-orange-800/40',
      meaning: '太阳之火，光明温暖',
      characteristics: [
        '性格：热情开朗，积极向上',
        '象征：太阳、光明、温暖',
        '方位：南方',
        '季节：夏季',
        '性质：热情、光明、向外'
      ],
      personality: '丙火之人热情开朗，具有感染力，喜欢帮助他人，但有时过于冲动。',
      career: '适合销售、演艺、公关等需要表现力的工作。',
      relationships: '在感情中热情主动，但需要学会控制脾气。'
    },
    {
      name: '丁',
      element: '阴火',
      icon: <Flame className="w-5 h-5" />,
      color: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
      meaning: '灯烛之火，精神文明',
      characteristics: [
        '性格：内敛聪慧，富有内涵',
        '象征：灯火、蜡烛、星光',
        '方位：南方',
        '季节：夏季',
        '性质：内敛、精神、文明'
      ],
      personality: '丁火之人聪明内敛，富有文艺气质，思维敏捷，但有时过于敏感。',
      career: '适合文化、教育、研究等需要智慧的工作。',
      relationships: '在感情中细腻深刻，但需要更多安全感。'
    },
    {
      name: '戊',
      element: '阳土',
      icon: <Mountain className="w-5 h-5" />,
      color: 'from-yellow-100 to-amber-200 dark:from-yellow-900/40 dark:to-amber-800/40',
      meaning: '高山厚土，稳重可靠',
      characteristics: [
        '性格：踏实稳重，忠诚可靠',
        '象征：高山、城墙、大地',
        '方位：中央',
        '季节：长夏',
        '性质：稳重、包容、承载'
      ],
      personality: '戊土之人性格稳重，做事踏实，有很强的责任感，但有时过于保守。',
      career: '适合建筑、房地产、管理等需要稳定性的工作。',
      relationships: '在感情中忠诚可靠，但需要学会表达情感。'
    },
    {
      name: '己',
      element: '阴土',
      icon: <Circle className="w-5 h-5" />,
      color: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20',
      meaning: '田园之土，生养万物',
      characteristics: [
        '性格：温和包容，善于协调',
        '象征：田地、花园、沃土',
        '方位：中央',
        '季节：长夏',
        '性质：温和、孕育、协调'
      ],
      personality: '己土之人温和包容，善于调解矛盾，有很强的亲和力，但有时缺乏主见。',
      career: '适合服务、协调、农业等需要耐心的工作。',
      relationships: '在感情中温和体贴，但需要增强自信心。'
    },
    {
      name: '庚',
      element: '阳金',
      icon: <Mountain className="w-5 h-5" />,
      color: 'from-gray-100 to-slate-200 dark:from-gray-900/40 dark:to-slate-800/40',
      meaning: '刚铁之金，坚强不屈',
      characteristics: [
        '性格：刚强果断，意志坚定',
        '象征：钢铁、刀剑、金属',
        '方位：西方',
        '季节：秋季',
        '性质：刚强、果断、锋利'
      ],
      personality: '庚金之人性格刚强，做事果断，有很强的执行力，但有时过于刚硬。',
      career: '适合军警、技术、机械等需要精准性的工作。',
      relationships: '在感情中专一坚定，但需要学会温柔。'
    },
    {
      name: '辛',
      element: '阴金',
      icon: <Circle className="w-5 h-5" />,
      color: 'from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20',
      meaning: '珠玉之金，精致美丽',
      characteristics: [
        '性格：精致敏感，追求完美',
        '象征：珠宝、首饰、精品',
        '方位：西方',
        '季节：秋季',
        '性质：精致、敏感、美丽'
      ],
      personality: '辛金之人精致敏感，有很强的审美能力，追求完美，但有时过于挑剔。',
      career: '适合艺术、设计、奢侈品等需要美感的工作。',
      relationships: '在感情中重视精神契合，但需要降低完美主义。'
    },
    {
      name: '壬',
      element: '阳水',
      icon: <Droplets className="w-5 h-5" />,
      color: 'from-blue-100 to-cyan-200 dark:from-blue-900/40 dark:to-cyan-800/40',
      meaning: '江河之水，奔流不息',
      characteristics: [
        '性格：灵活变通，适应力强',
        '象征：大江、大河、海洋',
        '方位：北方',
        '季节：冬季',
        '性质：流动、变通、包容'
      ],
      personality: '壬水之人灵活变通，善于交际，适应能力强，但有时过于善变。',
      career: '适合贸易、物流、媒体等需要灵活性的工作。',
      relationships: '在感情中富有魅力，但需要增强专一性。'
    },
    {
      name: '癸',
      element: '阴水',
      icon: <Droplets className="w-5 h-5" />,
      color: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      meaning: '雨露之水，滋润万物',
      characteristics: [
        '性格：温柔细腻，善于感化',
        '象征：雨露、云雾、甘露',
        '方位：北方',
        '季节：冬季',
        '性质：温柔、细腻、滋润'
      ],
      personality: '癸水之人温柔细腻，善于感化他人，有很强的洞察力，但有时过于敏感。',
      career: '适合医疗、咨询、心理等需要同理心的工作。',
      relationships: '在感情中善解人意，但需要学会保护自己。'
    }
  ]

  const elementColors = {
    '阳木': 'text-green-600 dark:text-green-400',
    '阴木': 'text-green-500 dark:text-green-300',
    '阳火': 'text-red-600 dark:text-red-400',
    '阴火': 'text-red-500 dark:text-red-300',
    '阳土': 'text-yellow-600 dark:text-yellow-400',
    '阴土': 'text-yellow-500 dark:text-yellow-300',
    '阳金': 'text-gray-600 dark:text-gray-400',
    '阴金': 'text-gray-500 dark:text-gray-300',
    '阳水': 'text-blue-600 dark:text-blue-400',
    '阴水': 'text-blue-500 dark:text-blue-300'
  }

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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">十天干含义详解</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">深入了解十天干的象征意义和性格特征</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 概述 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>天干概述</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                天干是中国古代的一种文字计序符号，共有十个：甲、乙、丙、丁、戊、己、庚、辛、壬、癸。
                在八字命理中，天干代表着不同的五行属性和阴阳特质，反映了人的性格特征和命运倾向。
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {['甲乙木', '丙丁火', '戊己土', '庚辛金', '壬癸水'].map((element, index) => (
                  <div key={index} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{element}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 天干详解 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tianganData.map((gan, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedGan === gan.name ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
                }`}
                onClick={() => setSelectedGan(selectedGan === gan.name ? null : gan.name)}
              >
                <CardHeader className={`bg-gradient-to-r ${gan.color} rounded-t-lg`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      {gan.icon}
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {gan.name}
                      </CardTitle>
                      <Badge className={`${elementColors[gan.element as keyof typeof elementColors]} bg-white/20`}>
                        {gan.element}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">
                    {gan.meaning}
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">基本特征</h4>
                      <ul className="space-y-1">
                        {gan.characteristics.map((char, idx) => (
                          <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {char}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {selectedGan === gan.name && (
                      <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">性格特点</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{gan.personality}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">事业倾向</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{gan.career}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">感情关系</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{gan.relationships}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 学习提示 */}
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                  <TreePine className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">学习建议</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    点击每个天干卡片可以查看更详细的性格分析。理解天干的阴阳五行属性，有助于更好地理解八字命理的核心原理。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/wiki/bazi/dizhi-meaning')}
                      className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                    >
                      学习十二地支
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/wiki/bazi/shishen-intro')}
                      className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                    >
                      了解十神系统
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