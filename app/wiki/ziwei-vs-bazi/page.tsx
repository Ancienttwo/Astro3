'use client'

import { useState } from 'react'
import PublicLayout from '@/components/PublicLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useIsMobile } from '@/hooks/use-mobile'
import { 
  Scale,
  Star,
  Target,
  Clock,
  BookOpen,
  Users,
  Lightbulb,
  CheckCircle,
  XCircle,
  ArrowRight,
  Compass,
  Calendar
} from 'lucide-react'

export default function ZiweiVsBaziPage() {
  const [selectedComparison, setSelectedComparison] = useState<'overview' | 'method' | 'application'>('overview')
  const isMobile = useIsMobile()

  const comparisonData = {
    overview: {
      ziwei: {
        name: '紫微斗数',
        icon: Star,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        origin: '道教星象学',
        founder: '陈抟老祖',
        period: '宋代',
        core: '星曜宫位',
        features: ['直观形象', '宫位明确', '星曜丰富', '预测细致']
      },
      bazi: {
        name: '四柱八字',
        icon: Compass,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        origin: '阴阳五行学',
        founder: '徐子平',
        period: '唐宋',
        core: '干支五行',
        features: ['逻辑严密', '五行清晰', '格局分明', '理论深厚']
      }
    },
    method: {
      ziwei: {
        input: '出生年月日时',
        structure: '十二宫位 + 星曜',
        analysis: '星曜组合 + 宫位关系',
        prediction: '大运流年 + 星曜变化',
        difficulty: '入门较易，精通较难',
        timeframe: '适合看具体年份事件'
      },
      bazi: {
        input: '出生年月日时',
        structure: '年月日时四柱',
        analysis: '五行生克 + 十神关系',
        prediction: '大运流年 + 五行变化',
        difficulty: '入门较难，逻辑性强',
        timeframe: '适合看整体运势趋势'
      }
    },
    application: {
      ziwei: {
        personality: '通过主星看性格特质',
        career: '官禄宫星曜看事业发展',
        marriage: '夫妻宫详细分析感情',
        wealth: '财帛宫看财运状况',
        health: '疾厄宫看健康状态',
        timing: '流年星曜看具体时机'
      },
      bazi: {
        personality: '通过日主和十神看性格',
        career: '官杀星和格局看事业',
        marriage: '配偶星看婚姻状况',
        wealth: '财星和财格看财运',
        health: '五行平衡看健康',
        timing: '大运流年看运势起伏'
      }
    }
  }

  const tabs = [
    { key: 'overview', label: '基本概况', icon: BookOpen },
    { key: 'method', label: '分析方法', icon: Target },
    { key: 'application', label: '应用领域', icon: Users }
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

  const advantages = {
    ziwei: [
      '命盘直观，容易理解',
      '宫位明确，分析细致',
      '星曜丰富，信息量大',
      '预测具体，时间精准',
      '适合初学者入门'
    ],
    bazi: [
      '理论完整，逻辑严密',
      '五行清晰，层次分明',
      '格局分析，深度较强',
      '历史悠久，经典传承',
      '适合深入研究'
    ]
  }

  const limitations = {
    ziwei: [
      '星曜过多，容易混乱',
      '组合复杂，难以掌握',
      '流派较多，标准不一',
      '需要大量记忆'
    ],
    bazi: [
      '入门门槛较高',
      '抽象概念较多',
      '需要深厚理论基础',
      '初学者不易理解'
    ]
  }

  return (
    <PublicLayout title="紫微与八字">
      <div className="min-h-screen bg-background">
        {/* 页面内容 */}
        <div className="space-y-6">
          <div className={`space-y-6 ${isMobile ? '' : 'max-w-4xl mx-auto'}`}>
            {/* 选项卡 */}
            <ResponsiveCard>
              <div className="flex space-x-1 bg-muted/50 rounded-lg p-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedComparison(tab.key as any)}
                      className={`
                        flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-md text-sm font-medium transition-all
                        ${selectedComparison === tab.key 
                          ? 'bg-background text-purple-600 shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </ResponsiveCard>

            {/* 基本概况对比 */}
            {selectedComparison === 'overview' && (
              <div className="space-y-4">
                {Object.entries(comparisonData.overview).map(([key, system]) => {
                  const Icon = system.icon
                  return (
                    <ResponsiveCard key={key}>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full ${system.bgColor} flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${system.color}`} />
                          </div>
                          <div>
                            <h3 className="font-bold">{system.name}</h3>
                            <p className="text-sm text-muted-foreground">{system.core}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">起源</div>
                            <div className="font-medium">{system.origin}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">创始人</div>
                            <div className="font-medium">{system.founder}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">时期</div>
                            <div className="font-medium">{system.period}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">核心</div>
                            <div className="font-medium">{system.core}</div>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-muted-foreground mb-2">特点</div>
                          <div className="flex flex-wrap gap-2">
                            {system.features.map((feature, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </ResponsiveCard>
                  )
                })}
              </div>
            )}

            {/* 分析方法对比 */}
            {selectedComparison === 'method' && (
              <div className="space-y-4">
                {Object.entries(comparisonData.method).map(([key, method]) => {
                  const isZiwei = key === 'ziwei'
                  return (
                    <ResponsiveCard key={key}>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          {isZiwei ? (
                            <Star className="w-5 h-5 text-purple-600" />
                          ) : (
                            <Compass className="w-5 h-5 text-orange-600" />
                          )}
                          <h3 className="font-bold">
                            {isZiwei ? '紫微斗数' : '四柱八字'}
                          </h3>
                        </div>

                        <div className="space-y-3">
                          {Object.entries(method).map(([aspect, value]) => (
                            <div key={aspect} className="flex justify-between items-start">
                              <div className="text-sm text-muted-foreground w-20 flex-shrink-0">
                                {aspect === 'input' && '输入'}
                                {aspect === 'structure' && '结构'}
                                {aspect === 'analysis' && '分析'}
                                {aspect === 'prediction' && '预测'}
                                {aspect === 'difficulty' && '难度'}
                                {aspect === 'timeframe' && '时间'}
                              </div>
                              <div className="text-sm flex-1 text-right">
                                {value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </ResponsiveCard>
                  )
                })}
              </div>
            )}

            {/* 应用领域对比 */}
            {selectedComparison === 'application' && (
              <div className="space-y-4">
                {Object.entries(comparisonData.application).map(([key, app]) => {
                  const isZiwei = key === 'ziwei'
                  return (
                    <ResponsiveCard key={key}>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          {isZiwei ? (
                            <Star className="w-5 h-5 text-purple-600" />
                          ) : (
                            <Compass className="w-5 h-5 text-orange-600" />
                          )}
                          <h3 className="font-bold">
                            {isZiwei ? '紫微斗数应用' : '四柱八字应用'}
                          </h3>
                        </div>

                        <div className="space-y-3">
                          {Object.entries(app).map(([field, description]) => (
                            <div key={field} className="p-3 bg-muted/50 rounded-lg">
                              <div className="font-medium mb-1">
                                {field === 'personality' && '性格分析'}
                                {field === 'career' && '事业发展'}
                                {field === 'marriage' && '婚姻感情'}
                                {field === 'wealth' && '财运状况'}
                                {field === 'health' && '健康状态'}
                                {field === 'timing' && '时机把握'}
                              </div>
                              <div className="text-sm text-muted-foreground">{description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </ResponsiveCard>
                  )
                })}
              </div>
            )}

            {/* 优势对比 */}
            <ResponsiveCard>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold">各自优势</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(advantages).map(([key, advList]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {key === 'ziwei' ? (
                          <Star className="w-4 h-4 text-purple-600" />
                        ) : (
                          <Compass className="w-4 h-4 text-orange-600" />
                        )}
                        <span className="font-medium">
                          {key === 'ziwei' ? '紫微斗数' : '四柱八字'}
                        </span>
                      </div>
                      <div className="space-y-1 ml-6">
                        {advList.map((advantage, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-muted-foreground">{advantage}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ResponsiveCard>

            {/* 局限性对比 */}
            <ResponsiveCard>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold">局限性</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(limitations).map(([key, limList]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {key === 'ziwei' ? (
                          <Star className="w-4 h-4 text-purple-600" />
                        ) : (
                          <Compass className="w-4 h-4 text-orange-600" />
                        )}
                        <span className="font-medium">
                          {key === 'ziwei' ? '紫微斗数' : '四柱八字'}
                        </span>
                      </div>
                      <div className="space-y-1 ml-6">
                        {limList.map((limitation, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            <span className="text-sm text-muted-foreground">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ResponsiveCard>

            {/* 学习建议 */}
            <ResponsiveCard>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold">学习建议</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-900 mb-2">初学者建议</h4>
                    <p className="text-sm text-purple-700">
                      建议从紫微斗数开始学习，因为其命盘直观，宫位明确，容易理解和掌握基本概念。
                    </p>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-medium text-orange-900 mb-2">进阶学习</h4>
                    <p className="text-sm text-orange-700">
                      在掌握紫微斗数基础后，可以学习四柱八字，其严密的逻辑体系有助于深化命理理解。
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">综合运用</h4>
                    <p className="text-sm text-blue-700">
                      两种体系各有所长，可以相互印证，综合运用能够得到更全面准确的分析结果。
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