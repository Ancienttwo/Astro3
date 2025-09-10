'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdaptiveLayout } from '@/components/layout/adaptive-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users, Heart, Coins, Shield, Crown, Sword, Star, Brain, Zap } from 'lucide-react'

export default function ShishenIntroPage() {
  const router = useRouter()
  const [selectedShen, setSelectedShen] = useState<string | null>(null)

  const shishenData = [
    {
      name: '比肩',
      type: '同类',
      icon: <Users className="w-5 h-5" />,
      color: 'from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40',
      meaning: '与日主同性同类，代表兄弟姐妹、朋友、同事',
      characteristics: [
        '性格：自立、自强、竞争心强',
        '象征：兄弟姐妹、朋友、同事',
        '含义：平等、竞争、独立',
        '表现：自尊心强、不服输',
        '关系：同辈、平等关系'
      ],
      positive: '独立自强，有竞争精神，能够自立门户，朋友关系良好。',
      negative: '过分自我，不善合作，容易与人发生冲突，缺乏包容心。',
      career: '适合独立创业、自由职业、竞争性行业。',
      wealth: '靠自己努力赚钱，不喜欢依赖他人，理财较为保守。',
      relationships: '朋友多，但感情上比较独立，不太愿意迁就他人。'
    },
    {
      name: '劫财',
      type: '同类',
      icon: <Sword className="w-5 h-5" />,
      color: 'from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40',
      meaning: '与日主异性同类，代表竞争对手、合作伙伴',
      characteristics: [
        '性格：果断、冲动、争强好胜',
        '象征：竞争者、合作伙伴',
        '含义：抢夺、竞争、冒险',
        '表现：行动力强、敢于冒险',
        '关系：竞争、合作关系'
      ],
      positive: '行动力强，敢于冒险，能够抓住机会，具有开拓精神。',
      negative: '冲动鲁莽，容易破财，人际关系复杂，易有纠纷。',
      career: '适合销售、投资、冒险性行业，但需要控制风险。',
      wealth: '财运起伏较大，容易大起大落，需要谨慎理财。',
      relationships: '感情容易有竞争，需要学会处理复杂的人际关系。'
    },
    {
      name: '食神',
      type: '生类',
      icon: <Heart className="w-5 h-5" />,
      color: 'from-pink-100 to-pink-200 dark:from-pink-900/40 dark:to-pink-800/40',
      meaning: '日主所生的同性干支，代表才华、享受、子女',
      characteristics: [
        '性格：温和、享受、有才华',
        '象征：才华、享受、子女',
        '含义：表达、创造、享受',
        '表现：乐观、有艺术天赋',
        '关系：子女、学生、作品'
      ],
      positive: '有才华，善于表达，乐观开朗，享受生活，子女缘佳。',
      negative: '过度享受，缺乏进取心，容易沉溺于享乐，不够踏实。',
      career: '适合文艺、娱乐、教育、餐饮等服务性行业。',
      wealth: '通过才华赚钱，财运平稳，但不适合投机。',
      relationships: '人缘好，子女缘佳，但需要控制享乐欲望。'
    },
    {
      name: '伤官',
      type: '生类',
      icon: <Star className="w-5 h-5" />,
      color: 'from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40',
      meaning: '日主所生的异性干支，代表才能、变动、克官',
      characteristics: [
        '性格：聪明、叛逆、有才能',
        '象征：才能、技术、变动',
        '含义：表现、反抗、创新',
        '表现：聪明、不服管束',
        '关系：技艺、反抗、创新'
      ],
      positive: '聪明有才，善于创新，技艺出众，敢于突破传统。',
      negative: '叛逆心强，不服管束，容易得罪人，变动较多。',
      career: '适合技术、创新、艺术等需要才能的工作。',
      wealth: '通过技能赚钱，收入不稳定，需要多元化发展。',
      relationships: '聪明有魅力，但容易因为叛逆而影响人际关系。'
    },
    {
      name: '偏财',
      type: '克类',
      icon: <Coins className="w-5 h-5" />,
      color: 'from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/40',
      meaning: '日主所克的异性干支，代表横财、投机、异性',
      characteristics: [
        '性格：灵活、善交际、重享受',
        '象征：偏财、投机、异性',
        '含义：机会、投机、外财',
        '表现：善于理财、重视享受',
        '关系：投资、异性、机会'
      ],
      positive: '善于理财，有投资眼光，异性缘佳，生活富足。',
      negative: '贪图享受，容易投机，感情复杂，理财不够稳健。',
      career: '适合投资、贸易、金融、娱乐等行业。',
      wealth: '偏财运佳，但需要谨慎投资，避免过度投机。',
      relationships: '异性缘佳，但容易有感情纠葛，需要专一。'
    },
    {
      name: '正财',
      type: '克类',
      icon: <Shield className="w-5 h-5" />,
      color: 'from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40',
      meaning: '日主所克的同性干支，代表正当收入、妻子、财产',
      characteristics: [
        '性格：踏实、守财、有责任心',
        '象征：正财、妻子、财产',
        '含义：正当、稳定、积累',
        '表现：理财谨慎、重视家庭',
        '关系：配偶、财产、稳定'
      ],
      positive: '理财能力强，收入稳定，家庭和睦，生活富足。',
      negative: '过分守财，缺乏冒险精神，容易错失机会。',
      career: '适合稳定的工作，如公务员、银行、会计等。',
      wealth: '正财运佳，收入稳定，但需要学会投资理财。',
      relationships: '重视家庭，夫妻关系和睦，但需要增加浪漫。'
    },
    {
      name: '七杀',
      type: '被克',
      icon: <Zap className="w-5 h-5" />,
      color: 'from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40',
      meaning: '克制日主的异性干支，代表威严、压力、小人',
      characteristics: [
        '性格：威严、果断、有魄力',
        '象征：威严、压力、挑战',
        '含义：权威、压制、挑战',
        '表现：有领导力、能承受压力',
        '关系：上司、权威、挑战'
      ],
      positive: '有威严，能承受压力，具有领导才能，能够成就大事。',
      negative: '压力大，容易冲动，人际关系紧张，易有小人。',
      career: '适合管理、军警、竞争激烈的行业。',
      wealth: '通过权威地位获得财富，但需要承受较大压力。',
      relationships: '威严有余，温柔不足，需要学会柔和待人。'
    },
    {
      name: '正官',
      type: '被克',
      icon: <Crown className="w-5 h-5" />,
      color: 'from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40',
      meaning: '克制日主的同性干支，代表地位、名声、丈夫',
      characteristics: [
        '性格：正直、有责任心、守纪律',
        '象征：地位、名声、丈夫',
        '含义：正当、权威、责任',
        '表现：遵纪守法、有原则',
        '关系：上级、权威、责任'
      ],
      positive: '正直有原则，有责任心，能够获得地位和名声。',
      negative: '过于拘谨，缺乏灵活性，容易受制于人。',
      career: '适合公务员、管理、法律、教育等正统行业。',
      wealth: '通过正当途径获得财富，收入稳定但增长缓慢。',
      relationships: '重视名声，夫妻关系正当，但需要增加情趣。'
    },
    {
      name: '偏印',
      type: '被生',
      icon: <Brain className="w-5 h-5" />,
      color: 'from-teal-100 to-teal-200 dark:from-teal-900/40 dark:to-teal-800/40',
      meaning: '生助日主的异性干支，代表偏门学问、继母',
      characteristics: [
        '性格：聪明、孤僻、有才华',
        '象征：偏门学问、继母',
        '含义：特殊、偏门、才华',
        '表现：有独特见解、善于学习',
        '关系：师长、偏门、特殊'
      ],
      positive: '聪明有才华，善于学习，有独特见解，适合专业领域。',
      negative: '性格孤僻，不善交际，容易钻牛角尖，理想主义。',
      career: '适合研究、技术、医学、玄学等专业性强的工作。',
      wealth: '通过专业技能获得财富，但收入可能不稳定。',
      relationships: '交际圈较小，但感情深厚，需要学会开放心态。'
    },
    {
      name: '正印',
      type: '被生',
      icon: <Star className="w-5 h-5" />,
      color: 'from-cyan-100 to-cyan-200 dark:from-cyan-900/40 dark:to-cyan-800/40',
      meaning: '生助日主的同性干支，代表学问、母亲、贵人',
      characteristics: [
        '性格：仁慈、有学问、重精神',
        '象征：学问、母亲、贵人',
        '含义：教育、保护、提升',
        '表现：好学、有贵人运',
        '关系：母亲、老师、贵人'
      ],
      positive: '有学问，贵人运佳，性格仁慈，善于教导他人。',
      negative: '依赖心强，缺乏进取心，容易理想主义，不够实际。',
      career: '适合教育、文化、宗教、慈善等精神性工作。',
      wealth: '不太重视金钱，通过贵人帮助获得财富。',
      relationships: '重视精神交流，母子关系良好，但需要独立。'
    }
  ]

  const shishenTypes = {
    '同类': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', description: '与日主同类的十神，代表平等关系' },
    '生类': { color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200', description: '日主所生的十神，代表付出和表达' },
    '克类': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', description: '日主所克的十神，代表控制和财富' },
    '被克': { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', description: '克制日主的十神，代表压力和权威' },
    '被生': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', description: '生助日主的十神，代表帮助和学习' }
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">十神系统详解</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">深入了解八字命理的核心概念：十神关系</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 概述 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>十神概述</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                十神是八字命理中的核心概念，是以日主（日干）为中心，根据五行生克关系推导出的十种关系。
                每种关系都代表着不同的人生领域和性格特征，帮助我们深入理解命运的奥秘。
              </p>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {Object.entries(shishenTypes).map(([type, info]) => (
                  <Card key={type} className="text-center">
                    <CardContent className="p-4">
                      <Badge className={`${info.color} mb-2`}>{type}</Badge>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{info.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 十神详解 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shishenData.map((shen, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedShen === shen.name ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
                }`}
                onClick={() => setSelectedShen(selectedShen === shen.name ? null : shen.name)}
              >
                <CardHeader className={`bg-gradient-to-r ${shen.color} rounded-t-lg`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        {shen.icon}
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {shen.name}
                        </CardTitle>
                        <Badge className={`${shishenTypes[shen.type as keyof typeof shishenTypes].color} bg-white/20`}>
                          {shen.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">
                    {shen.meaning}
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">基本特征</h4>
                      <ul className="space-y-1">
                        {shen.characteristics.map((char, idx) => (
                          <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {char}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {selectedShen === shen.name && (
                      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">✅ 正面特质</h4>
                            <p className="text-sm text-green-700 dark:text-green-300">{shen.positive}</p>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                            <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">❌ 负面特质</h4>
                            <p className="text-sm text-red-700 dark:text-red-300">{shen.negative}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">💼 事业倾向</h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300">{shen.career}</p>
                          </div>
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">💰 财运特点</h4>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">{shen.wealth}</p>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                            <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">👥 人际关系</h4>
                            <p className="text-sm text-purple-700 dark:text-purple-300">{shen.relationships}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 十神应用 */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>十神应用技巧</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">性格分析</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    通过十神组合了解个人性格特征，发现优势和不足
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Coins className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">事业规划</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    根据十神特质选择适合的职业方向和发展路径
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">人际关系</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    理解不同十神在人际关系中的表现，改善交往方式
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 学习提示 */}
          <Card className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">学习建议</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    点击每个十神卡片可以查看详细的正负面特质和应用分析。十神系统是八字命理的核心，需要结合实际命盘来理解。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/wiki/bazi/intro')}
                      className="text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                    >
                      八字基础概念
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/bazi')}
                      className="text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                    >
                      实战排盘练习
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