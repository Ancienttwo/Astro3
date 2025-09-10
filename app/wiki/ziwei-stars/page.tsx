'use client'

import { useState } from 'react'
import MobileAppLayout, { MobileCard, MobilePageHeader } from '@/components/MobileAppLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Star,
  Crown,
  Shield,
  Sword,
  Heart,
  Zap,
  Sun,
  Moon,
  Sparkles,
  Target,
  ChevronRight
} from 'lucide-react'

export default function ZiweiStarsPage() {
  const [selectedStar, setSelectedStar] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'major' | 'minor'>('all')

  const majorStars = [
    {
      id: 'ziwei',
      name: '紫微',
      icon: Crown,
      category: 'major',
      element: '土',
      nature: '帝星',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      personality: '尊贵、领导力强、有责任感',
      career: '管理、政治、高级职位',
      fortune: '贵人运佳，地位尊崇',
      weakness: '过于自负，不易妥协'
    },
    {
      id: 'tianji',
      name: '天机',
      icon: Zap,
      category: 'major',
      element: '木',
      nature: '智星',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      personality: '聪明机智、善于思考、变化快',
      career: '策划、咨询、技术、研究',
      fortune: '智慧过人，善于变通',
      weakness: '多虑不决，缺乏恒心'
    },
    {
      id: 'taiyang',
      name: '太阳',
      icon: Sun,
      category: 'major',
      element: '火',
      nature: '贵星',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      personality: '光明磊落、热情大方、有正义感',
      career: '公职、教育、医疗、慈善',
      fortune: '名声显赫，受人敬重',
      weakness: '过于直率，容易得罪人'
    },
    {
      id: 'wuqu',
      name: '武曲',
      icon: Sword,
      category: 'major',
      element: '金',
      nature: '财星',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      personality: '果断坚毅、重义气、有执行力',
      career: '军警、金融、工程、制造',
      fortune: '财运亨通，事业有成',
      weakness: '过于刚硬，不够圆融'
    },
    {
      id: 'tianfu',
      name: '天府',
      icon: Shield,
      category: 'major',
      element: '土',
      nature: '库星',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      personality: '稳重保守、善于理财、有包容心',
      career: '财务、管理、房地产、储蓄',
      fortune: '财库丰厚，生活安稳',
      weakness: '过于保守，缺乏冒险精神'
    },
    {
      id: 'taiyin',
      name: '太阴',
      icon: Moon,
      category: 'major',
      element: '水',
      nature: '富星',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      personality: '温柔体贴、心思细腻、有艺术天分',
      career: '艺术、设计、服务、女性相关',
      fortune: '财源广进，人缘极佳',
      weakness: '过于敏感，情绪波动大'
    },
    {
      id: 'tanlang',
      name: '贪狼',
      icon: Heart,
      category: 'major',
      element: '水木',
      nature: '桃花星',
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      personality: '多才多艺、善于交际、欲望强烈',
      career: '娱乐、销售、艺术、服务',
      fortune: '桃花运旺，多才多艺',
      weakness: '欲望过多，容易分心'
    }
  ]

  const minorStars = [
    {
      id: 'jumen',
      name: '巨门',
      icon: Target,
      category: 'minor',
      element: '水',
      nature: '暗星',
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
      personality: '口才佳、善辩论、有洞察力',
      career: '律师、记者、销售、演讲',
      fortune: '口才出众，善于表达',
      weakness: '容易口舌是非，得罪人'
    },
    {
      id: 'tianxiang',
      name: '天相',
      icon: Sparkles,
      category: 'minor',
      element: '水',
      nature: '印星',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      personality: '忠诚可靠、有服务精神、重承诺',
      career: '秘书、助理、服务、协调',
      fortune: '贵人相助，事业稳定',
      weakness: '过于依赖他人，缺乏主见'
    }
  ]

  const allStars = [...majorStars, ...minorStars]
  
  const filteredStars = selectedCategory === 'all' ? allStars : 
                       selectedCategory === 'major' ? majorStars : minorStars

  const categories = [
    { key: 'all', label: '全部', count: allStars.length },
    { key: 'major', label: '主星', count: majorStars.length },
    { key: 'minor', label: '辅星', count: minorStars.length }
  ]

  return (
    <MobileAppLayout title="紫微十四星">
      <div className="min-h-screen bg-gray-50">
        {/* 页面标题 */}
        <MobilePageHeader
          title="紫微十四星"
          subtitle="探索紫微斗数星曜奥秘"
        />

        <div className="p-4 space-y-6">
          {/* 星曜概述 */}
          <MobileCard>
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Star className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">星曜体系</h3>
              </div>
              
              <p className="text-sm text-gray-600 leading-relaxed">
                紫微斗数以紫微星为首的十四颗主星为核心，配合众多辅星、煞星，构成完整的命理体系。
                每颗星曜都有其独特的性质和影响力，主宰着人生的不同层面。
              </p>

              {/* 分类标签 */}
              <div className="flex space-x-2">
                {categories.map((category) => (
                  <button
                    key={category.key}
                    onClick={() => setSelectedCategory(category.key as any)}
                    className={`
                      px-3 py-1 rounded-full text-xs font-medium transition-all
                      ${selectedCategory === category.key 
                        ? 'bg-purple-100 text-purple-600 border border-purple-300' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {category.label} ({category.count})
                  </button>
                ))}
              </div>
            </div>
          </MobileCard>

          {/* 星曜列表 */}
          <div className="space-y-3">
            {filteredStars.map((star) => {
              const Icon = star.icon
              return (
                <MobileCard
                  key={star.id}
                  onClick={() => setSelectedStar(selectedStar === star.id ? null : star.id)}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full ${star.bgColor} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${star.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{star.name}星</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {star.element}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {star.nature}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                        selectedStar === star.id ? 'rotate-90' : ''
                      }`} />
                    </div>

                    {/* 展开详情 */}
                    {selectedStar === star.id && (
                      <div className="border-t pt-3 space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">性格特征</h4>
                          <p className="text-sm text-gray-600">{star.personality}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">适合职业</h4>
                          <p className="text-sm text-gray-600">{star.career}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">运势特点</h4>
                          <p className="text-sm text-gray-600">{star.fortune}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">注意事项</h4>
                          <p className="text-sm text-gray-600">{star.weakness}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </MobileCard>
              )
            })}
          </div>

          {/* 星曜组合 */}
          <MobileCard>
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">星曜组合</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                紫微斗数的精髓在于星曜之间的组合关系，不同的组合会产生不同的效果。
              </p>

              <div className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">帝王组合</h4>
                  <p className="text-sm text-purple-700">紫微 + 天府：权威稳重，适合领导管理</p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">财富组合</h4>
                  <p className="text-sm text-blue-700">武曲 + 天府：财运亨通，善于理财</p>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-2">智慧组合</h4>
                  <p className="text-sm text-orange-700">天机 + 太阴：聪明细腻，富有创意</p>
                </div>

                <div className="p-3 bg-pink-50 rounded-lg">
                  <h4 className="font-medium text-pink-900 mb-2">桃花组合</h4>
                  <p className="text-sm text-pink-700">贪狼 + 太阴：魅力十足，人缘极佳</p>
                </div>
              </div>
            </div>
          </MobileCard>

          {/* 学习建议 */}
          <MobileCard>
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Target className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">学习建议</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-green-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">熟记主星特性</h4>
                    <p className="text-sm text-gray-600">先掌握十四主星的基本性质和特征</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-green-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">理解星曜组合</h4>
                    <p className="text-sm text-gray-600">学会分析不同星曜之间的相互作用</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-green-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">结合宫位分析</h4>
                    <p className="text-sm text-gray-600">星曜在不同宫位会有不同的表现</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-green-600">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">实践应用</h4>
                    <p className="text-sm text-gray-600">通过实际案例加深理解和应用</p>
                  </div>
                </div>
              </div>
            </div>
          </MobileCard>

          {/* 底部空白区域 */}
          <div className="h-4"></div>
        </div>
      </div>
    </MobileAppLayout>
  )
} 