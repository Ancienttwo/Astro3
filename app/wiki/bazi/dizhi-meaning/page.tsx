'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdaptiveLayout } from '@/components/layout/adaptive-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users, Clock, MapPin, Sparkles } from 'lucide-react'

export default function DizhiMeaningPage() {
  const router = useRouter()
  const [selectedZhi, setSelectedZhi] = useState<string | null>(null)

  const dizhiData = [
    {
      name: '子',
      element: '阳水',
      animal: '鼠',
      time: '23:00-1:00',
      month: '十一月',
      direction: '正北',
      color: 'from-blue-100 to-cyan-200 dark:from-blue-900/40 dark:to-cyan-800/40',
      meaning: '种子萌发，生命开始',
      characteristics: [
        '性格：机敏灵活，善于应变',
        '象征：种子、开始、萌芽',
        '方位：正北方',
        '季节：仲冬',
        '性质：阳水、动态、聪明'
      ],
      personality: '子水之人聪明机敏，适应力强，善于发现机会，但有时过于急躁。',
      relationships: '在人际关系中善于沟通，但需要学会耐心倾听。'
    },
    {
      name: '丑',
      element: '阴土',
      animal: '牛',
      time: '1:00-3:00',
      month: '十二月',
      direction: '东北',
      color: 'from-amber-100 to-yellow-200 dark:from-amber-900/40 dark:to-yellow-800/40',
      meaning: '勤劳踏实，积累财富',
      characteristics: [
        '性格：勤劳踏实，坚持不懈',
        '象征：耕牛、农田、积累',
        '方位：东北方',
        '季节：季冬',
        '性质：阴土、稳定、勤劳'
      ],
      personality: '丑土之人勤劳踏实，有很强的耐力和毅力，但有时过于固执。',
      relationships: '在感情中忠诚专一，但需要学会表达情感。'
    },
    {
      name: '寅',
      element: '阳木',
      animal: '虎',
      time: '3:00-5:00',
      month: '正月',
      direction: '东北',
      color: 'from-green-100 to-emerald-200 dark:from-green-900/40 dark:to-emerald-800/40',
      meaning: '威猛果敢，领导能力',
      characteristics: [
        '性格：勇敢果断，有领导力',
        '象征：老虎、森林、权威',
        '方位：东北方',
        '季节：孟春',
        '性质：阳木、生发、威猛'
      ],
      personality: '寅木之人勇敢果断，有很强的领导能力，但有时过于冲动。',
      relationships: '在人际关系中具有威信，但需要学会温和待人。'
    },
    {
      name: '卯',
      element: '阴木',
      animal: '兔',
      time: '5:00-7:00',
      month: '二月',
      direction: '正东',
      color: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
      meaning: '温和细腻，善于协调',
      characteristics: [
        '性格：温和细腻，善于协调',
        '象征：兔子、花草、温和',
        '方位：正东方',
        '季节：仲春',
        '性质：阴木、温和、细腻'
      ],
      personality: '卯木之人温和细腻，善于协调关系，但有时过于优柔寡断。',
      relationships: '在感情中体贴入微，但需要增强决断力。'
    },
    {
      name: '辰',
      element: '阳土',
      animal: '龙',
      time: '7:00-9:00',
      month: '三月',
      direction: '东南',
      color: 'from-purple-100 to-indigo-200 dark:from-purple-900/40 dark:to-indigo-800/40',
      meaning: '神秘高贵，变化无常',
      characteristics: [
        '性格：神秘高贵，善于变化',
        '象征：龙、云雾、神秘',
        '方位：东南方',
        '季节：季春',
        '性质：阳土、变化、神秘'
      ],
      personality: '辰土之人神秘高贵，富有想象力，但有时过于理想化。',
      relationships: '在人际关系中有独特魅力，但需要脚踏实地。'
    },
    {
      name: '巳',
      element: '阴火',
      animal: '蛇',
      time: '9:00-11:00',
      month: '四月',
      direction: '东南',
      color: 'from-red-100 to-orange-200 dark:from-red-900/40 dark:to-orange-800/40',
      meaning: '智慧深沉，善于谋划',
      characteristics: [
        '性格：智慧深沉，善于谋划',
        '象征：蛇、智慧、深沉',
        '方位：东南方',
        '季节：孟夏',
        '性质：阴火、智慧、深沉'
      ],
      personality: '巳火之人智慧深沉，善于谋划，但有时过于多疑。',
      relationships: '在感情中深情专一，但需要学会信任。'
    },
    {
      name: '午',
      element: '阳火',
      animal: '马',
      time: '11:00-13:00',
      month: '五月',
      direction: '正南',
      color: 'from-red-100 to-pink-200 dark:from-red-900/40 dark:to-pink-800/40',
      meaning: '热情奔放，积极向上',
      characteristics: [
        '性格：热情奔放，积极向上',
        '象征：马、奔跑、热情',
        '方位：正南方',
        '季节：仲夏',
        '性质：阳火、热情、活跃'
      ],
      personality: '午火之人热情奔放，积极向上，但有时过于急躁。',
      relationships: '在感情中热情主动，但需要学会沉稳。'
    },
    {
      name: '未',
      element: '阴土',
      animal: '羊',
      time: '13:00-15:00',
      month: '六月',
      direction: '西南',
      color: 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20',
      meaning: '温和善良，富有同情心',
      characteristics: [
        '性格：温和善良，富有同情心',
        '象征：羊、温和、同情',
        '方位：西南方',
        '季节：季夏',
        '性质：阴土、温和、善良'
      ],
      personality: '未土之人温和善良，富有同情心，但有时过于软弱。',
      relationships: '在感情中温柔体贴，但需要增强自信。'
    },
    {
      name: '申',
      element: '阳金',
      animal: '猴',
      time: '15:00-17:00',
      month: '七月',
      direction: '西南',
      color: 'from-gray-100 to-slate-200 dark:from-gray-900/40 dark:to-slate-800/40',
      meaning: '聪明机智，善于创新',
      characteristics: [
        '性格：聪明机智，善于创新',
        '象征：猴、机智、创新',
        '方位：西南方',
        '季节：孟秋',
        '性质：阳金、机智、灵活'
      ],
      personality: '申金之人聪明机智，善于创新，但有时过于浮躁。',
      relationships: '在人际关系中机智幽默，但需要学会专注。'
    },
    {
      name: '酉',
      element: '阴金',
      animal: '鸡',
      time: '17:00-19:00',
      month: '八月',
      direction: '正西',
      color: 'from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20',
      meaning: '勤奋细致，注重细节',
      characteristics: [
        '性格：勤奋细致，注重细节',
        '象征：鸡、勤奋、细致',
        '方位：正西方',
        '季节：仲秋',
        '性质：阴金、勤奋、细致'
      ],
      personality: '酉金之人勤奋细致，注重细节，但有时过于挑剔。',
      relationships: '在感情中细心体贴，但需要学会宽容。'
    },
    {
      name: '戌',
      element: '阳土',
      animal: '狗',
      time: '19:00-21:00',
      month: '九月',
      direction: '西北',
      color: 'from-amber-100 to-orange-200 dark:from-amber-900/40 dark:to-orange-800/40',
      meaning: '忠诚可靠，有责任感',
      characteristics: [
        '性格：忠诚可靠，有责任感',
        '象征：狗、忠诚、守护',
        '方位：西北方',
        '季节：季秋',
        '性质：阳土、忠诚、守护'
      ],
      personality: '戌土之人忠诚可靠，有很强的责任感，但有时过于保守。',
      relationships: '在感情中忠诚专一，但需要学会浪漫。'
    },
    {
      name: '亥',
      element: '阴水',
      animal: '猪',
      time: '21:00-23:00',
      month: '十月',
      direction: '西北',
      color: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      meaning: '纯真善良，富有智慧',
      characteristics: [
        '性格：纯真善良，富有智慧',
        '象征：猪、纯真、智慧',
        '方位：西北方',
        '季节：孟冬',
        '性质：阴水、纯真、智慧'
      ],
      personality: '亥水之人纯真善良，富有智慧，但有时过于单纯。',
      relationships: '在感情中真诚深情，但需要学会识别他人。'
    }
  ]

  const elementColors = {
    '阳水': 'text-blue-600 dark:text-blue-400',
    '阴水': 'text-blue-500 dark:text-blue-300',
    '阳木': 'text-green-600 dark:text-green-400',
    '阴木': 'text-green-500 dark:text-green-300',
    '阳火': 'text-red-600 dark:text-red-400',
    '阴火': 'text-red-500 dark:text-red-300',
    '阳土': 'text-yellow-600 dark:text-yellow-400',
    '阴土': 'text-yellow-500 dark:text-yellow-300',
    '阳金': 'text-gray-600 dark:text-gray-400',
    '阴金': 'text-gray-500 dark:text-gray-300'
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">十二地支详解</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">深入了解十二地支的象征意义和生肖特征</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 概述 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>地支概述</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                地支是中国古代的一种文字计序符号，共有十二个：子、丑、寅、卯、辰、巳、午、未、申、酉、戌、亥。
                每个地支都对应一个生肖动物，代表不同的时间、方位和性格特征。
              </p>
              <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-2">
                {dizhiData.map((zhi, index) => (
                  <div key={index} className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{zhi.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{zhi.animal}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 地支详解 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dizhiData.map((zhi, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedZhi === zhi.name ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
                }`}
                onClick={() => setSelectedZhi(selectedZhi === zhi.name ? null : zhi.name)}
              >
                <CardHeader className={`bg-gradient-to-r ${zhi.color} rounded-t-lg`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{zhi.name}</span>
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {zhi.animal}
                        </CardTitle>
                        <Badge className={`${elementColors[zhi.element as keyof typeof elementColors]} bg-white/20`}>
                          {zhi.element}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{zhi.time}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{zhi.month}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">
                    {zhi.meaning}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">方位：{zhi.direction}</span>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">基本特征</h4>
                      <ul className="space-y-1">
                        {zhi.characteristics.map((char, idx) => (
                          <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {char}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {selectedZhi === zhi.name && (
                      <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">性格特点</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{zhi.personality}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">人际关系</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{zhi.relationships}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 地支相关知识 */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  时辰对应
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    古代将一天分为十二个时辰，每个时辰对应一个地支：
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>子时：23-1点</div>
                    <div>丑时：1-3点</div>
                    <div>寅时：3-5点</div>
                    <div>卯时：5-7点</div>
                    <div>辰时：7-9点</div>
                    <div>巳时：9-11点</div>
                    <div>午时：11-13点</div>
                    <div>未时：13-15点</div>
                    <div>申时：15-17点</div>
                    <div>酉时：17-19点</div>
                    <div>戌时：19-21点</div>
                    <div>亥时：21-23点</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  生肖文化
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    十二地支对应的生肖动物，承载着丰富的文化内涵：
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>鼠：机智灵活</div>
                    <div>牛：勤劳踏实</div>
                    <div>虎：威猛勇敢</div>
                    <div>兔：温和细腻</div>
                    <div>龙：神秘高贵</div>
                    <div>蛇：智慧深沉</div>
                    <div>马：热情奔放</div>
                    <div>羊：温和善良</div>
                    <div>猴：机智创新</div>
                    <div>鸡：勤奋细致</div>
                    <div>狗：忠诚可靠</div>
                    <div>猪：纯真善良</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 学习提示 */}
          <Card className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">学习建议</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    点击每个地支卡片可以查看更详细的性格分析。地支与天干结合，构成了完整的八字体系。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/wiki/bazi/tiangan-meaning')}
                      className="text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                    >
                      回顾十天干
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/wiki/bazi/shishen-intro')}
                      className="text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                    >
                      学习十神系统
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