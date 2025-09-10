'use client'

import { useState } from 'react'
import PublicLayout from '@/components/PublicLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useIsMobile } from '@/hooks/use-mobile'
import { 
  Zap,
  ArrowRight,
  ArrowDown,
  RotateCcw,
  Target,
  Flame,
  Droplets,
  Mountain,
  TreePine,
  Coins
} from 'lucide-react'

export default function WuxingPage() {
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const isMobile = useIsMobile()

  const elements = [
    {
      id: 'wood',
      name: '木',
      icon: TreePine,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
      description: '生长、发展、仁慈',
      season: '春季',
      direction: '东方',
      organ: '肝胆',
      emotion: '怒',
      personality: '仁慈、正直、有条理',
      career: '教育、文化、林业、医疗'
    },
    {
      id: 'fire',
      name: '火',
      icon: Flame,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300',
      description: '热情、光明、礼貌',
      season: '夏季',
      direction: '南方',
      organ: '心小肠',
      emotion: '喜',
      personality: '热情、开朗、有礼貌',
      career: '娱乐、广告、电子、能源'
    },
    {
      id: 'earth',
      name: '土',
      icon: Mountain,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-300',
      description: '稳重、包容、信用',
      season: '长夏',
      direction: '中央',
      organ: '脾胃',
      emotion: '思',
      personality: '稳重、诚信、包容',
      career: '房地产、农业、建筑、金融'
    },
    {
      id: 'metal',
      name: '金',
      icon: Coins,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-300',
      description: '坚毅、果断、义气',
      season: '秋季',
      direction: '西方',
      organ: '肺大肠',
      emotion: '悲',
      personality: '果断、坚毅、有义气',
      career: '金融、机械、军警、珠宝'
    },
    {
      id: 'water',
      name: '水',
      icon: Droplets,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300',
      description: '智慧、灵活、智慧',
      season: '冬季',
      direction: '北方',
      organ: '肾膀胱',
      emotion: '恐',
      personality: '智慧、灵活、善变',
      career: '科技、研究、物流、旅游'
    }
  ]

  const relationships = [
    {
      type: '相生',
      icon: ArrowRight,
      color: 'text-green-600',
      description: '相互促进、相互滋养',
      cycles: [
        { from: '木', to: '火', desc: '木生火 - 燃烧木材生火' },
        { from: '火', to: '土', desc: '火生土 - 燃烧后成灰土' },
        { from: '土', to: '金', desc: '土生金 - 土中蕴含金属' },
        { from: '金', to: '水', desc: '金生水 - 金属凝结水珠' },
        { from: '水', to: '木', desc: '水生木 - 水分滋养树木' }
      ]
    },
    {
      type: '相克',
      icon: Target,
      color: 'text-red-600',
      description: '相互制约、相互克制',
      cycles: [
        { from: '木', to: '土', desc: '木克土 - 树木吸收土壤养分' },
        { from: '土', to: '水', desc: '土克水 - 土壤吸收水分' },
        { from: '水', to: '火', desc: '水克火 - 水能灭火' },
        { from: '火', to: '金', desc: '火克金 - 火能融化金属' },
        { from: '金', to: '木', desc: '金克木 - 金属能砍伐树木' }
      ]
    }
  ]

  // 响应式卡片组件
  const ResponsiveCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    if (isMobile) {
      return (
        <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
          {children}
        </div>
      )
    }
    return (
      <Card className={className}>
        {children}
      </Card>
    )
  }

  return (
    <PublicLayout title="五行百科">
      <div className="min-h-screen bg-background">
        {/* 页面内容 */}
        <div className="space-y-6">
          <div className={`space-y-6 ${isMobile ? '' : 'max-w-4xl mx-auto'}`}>
            {/* 五行概述 */}
            {isMobile ? (
              <ResponsiveCard>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold">五行理论</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    五行学说是中国古代的一种物质观，认为宇宙万物由木、火、土、金、水五种基本元素构成。
                    这五种元素相互作用，相生相克，维持着宇宙的平衡与和谐。
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {elements.map((element) => {
                      const Icon = element.icon
                      return (
                        <button
                          key={element.id}
                          onClick={() => setSelectedElement(element.id)}
                          className={`
                            flex flex-col items-center p-3 rounded-lg border-2 transition-all
                            ${selectedElement === element.id 
                              ? `${element.bgColor} ${element.borderColor}` 
                              : 'bg-card border-border hover:bg-muted'
                            }
                          `}
                        >
                          <Icon className={`w-6 h-6 mb-1 ${element.color}`} />
                          <span className="text-sm font-medium">{element.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </ResponsiveCard>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <span>五行理论</span>
                  </CardTitle>
                  <CardDescription>
                    五行学说是中国古代的一种物质观，认为宇宙万物由木、火、土、金、水五种基本元素构成。
                    这五种元素相互作用，相生相克，维持着宇宙的平衡与和谐。
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4">
                    {elements.map((element) => {
                      const Icon = element.icon
                      return (
                        <button
                          key={element.id}
                          onClick={() => setSelectedElement(element.id)}
                          className={`
                            flex flex-col items-center p-3 rounded-lg border-2 transition-all
                            ${selectedElement === element.id 
                              ? `${element.bgColor} ${element.borderColor}` 
                              : 'bg-card border-border hover:bg-muted'
                            }
                          `}
                        >
                          <Icon className={`w-6 h-6 mb-1 ${element.color}`} />
                          <span className="text-sm font-medium">{element.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 选中元素详情 */}
            {selectedElement && (
              <ResponsiveCard>
                {(() => {
                  const element = elements.find(e => e.id === selectedElement)!
                  const Icon = element.icon
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full ${element.bgColor} flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${element.color}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{element.name}行</h3>
                          <p className="text-sm text-muted-foreground">{element.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">对应季节</div>
                          <div className="font-medium">{element.season}</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">对应方位</div>
                          <div className="font-medium">{element.direction}</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">对应脏腑</div>
                          <div className="font-medium">{element.organ}</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">对应情志</div>
                          <div className="font-medium">{element.emotion}</div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">性格特征</div>
                          <p className="text-sm">{element.personality}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">适合职业</div>
                        <p className="text-sm">{element.career}</p>
                      </div>
                    </div>
                  )
                })()}
              </ResponsiveCard>
            )}

            {/* 五行关系 */}
            {relationships.map((relationship) => {
              const Icon = relationship.icon
              return (
                <ResponsiveCard key={relationship.type}>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Icon className={`w-5 h-5 ${relationship.color}`} />
                      <h3 className="font-semibold">五行{relationship.type}</h3>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{relationship.description}</p>

                    <div className="space-y-3">
                      {relationship.cycles.map((cycle, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {cycle.from}
                            </Badge>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <Badge variant="outline" className="text-xs">
                              {cycle.to}
                            </Badge>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">{cycle.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ResponsiveCard>
              )
            })}

            {/* 五行应用 */}
            <ResponsiveCard>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <RotateCcw className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold">五行应用</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">命理分析</h4>
                    <p className="text-sm text-muted-foreground">
                      通过分析个人八字中五行的分布，了解性格特征、运势走向，指导人生决策。
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">养生保健</h4>
                    <p className="text-sm text-muted-foreground">
                      根据五行对应的脏腑理论，调节饮食起居，保持身心健康。
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">风水布局</h4>
                    <p className="text-sm text-muted-foreground">
                      运用五行相生相克原理，调整居住和工作环境，营造和谐氛围。
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">择日择时</h4>
                    <p className="text-sm text-muted-foreground">
                      结合五行理论选择吉日良时，提高成功几率。
                    </p>
                  </div>
                </div>
              </div>
            </ResponsiveCard>

            {/* 底部空白区域 */}
            <div className="h-4"></div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
} 