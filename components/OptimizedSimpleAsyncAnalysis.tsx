import React, { useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, Play, RefreshCw } from 'lucide-react'
import { useAsyncAnalysis } from '@/hooks/useAsyncAnalysis'

interface SimpleAsyncAnalysisProps {
  title: string
  analysisType: 'tiekou' | 'yongshen' | 'ziwei' | 'sihua' | 'tiekou_zhiduan' | 'yongshen_analysis' | 'ziwei_reasoning' | 'sihua_reasoning'
  analysisData?: any
  baziData?: any
  ziweiData?: any
  onComplete?: (result: string) => void
}

// 分析类型说明组件 - 使用memo优化
const AnalysisExplanation = React.memo(({ analysisType }: { analysisType: string }) => {
  const explanationContent = useMemo(() => {
    if (analysisType === 'yongshen' || analysisType === 'yongshen_analysis') {
      return {
        title: '什么是用神？',
        icon: '🎯',
        description: '用神是八字命理学的核心概念，指八字命局中能平衡五行、调和矛盾、增强有利因素的关键元素。其作用类似"药方"，通过补足日干（命主）的五行短板或抑制过旺能量，使命局达到动态平衡。',
        features: [
          {
            icon: '🧭',
            title: '命运指导',
            description: '用神决定命主适合的行业、方位、颜色等（如用神为火→宜南方/红色/能源行业）'
          },
          {
            icon: '📅',
            title: '大运流年',
            description: '当大运或流年强化用神时，运势上升；克制用神则易遇坎坷'
          },
          {
            icon: '⚖️',
            title: '化解冲突',
            description: '用神能缓解八字中的刑冲克害（如子午相冲，取木通关）'
          }
        ],
        bgClass: 'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20',
        borderClass: 'border-amber-200 dark:border-amber-800',
        textClass: 'text-amber-800 dark:text-amber-300',
        contentClass: 'text-amber-700 dark:text-amber-200'
      }
    }
    
    if (analysisType === 'tiekou' || analysisType === 'tiekou_zhiduan') {
      return {
        title: '什么是盲派铁口直断？',
        icon: '👁️',
        description: '盲派八字是中国传统命理学中一个独特分支，起源于古代盲人为谋生而发展的算命技术。其核心特点是弃用传统八字的五行旺衰分析和用神选取，转而通过口诀化规则和生活化象征快速断命。',
        features: [
          {
            icon: '📖',
            title: '口诀直断',
            description: '盲师依赖秘传口诀（如"财藏官库，蓄稀世之宝"），像查字典一样对照八字组合直接得出结论，3分钟内可断人生大事。'
          },
          {
            icon: '🔮',
            title: '象法解读',
            description: '将抽象干支转化为生活符号——比如"子午冲"象征南北奔波、"卯酉冲"代表婚姻变动，类似用"密码本"翻译八字中的故事。'
          }
        ],
        bgClass: 'from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20',
        borderClass: 'border-purple-200 dark:border-purple-800',
        textClass: 'text-purple-800 dark:text-purple-300',
        contentClass: 'text-purple-700 dark:text-purple-200',
        tip: '💡 这种方法虽精准高效，但因依赖师徒口传心授，普通人难以自学掌握精髓。本系统融合了盲派精华，让您也能体验铁口直断的神奇。'
      }
    }
    
    return null
  }, [analysisType])

  if (!explanationContent) return null

  return (
    <div className={`bg-gradient-to-r ${explanationContent.bgClass} rounded-lg p-4 sm:p-6 border ${explanationContent.borderClass}`}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{explanationContent.icon}</span>
          <h3 className={`text-lg sm:text-xl font-bold ${explanationContent.textClass}`}>
            {explanationContent.title}
          </h3>
        </div>
        
        <p className={`text-sm sm:text-base ${explanationContent.contentClass} leading-relaxed`}>
          {explanationContent.description}
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {explanationContent.features.map((feature, index) => (
            <div key={index} className="bg-white/70 dark:bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-current border-opacity-30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{feature.icon}</span>
                <h4 className={`font-semibold ${explanationContent.textClass}`}>{feature.title}</h4>
              </div>
              <p className={`text-xs sm:text-sm ${explanationContent.contentClass}`}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        {explanationContent.tip && (
          <div className="bg-white/50 dark:bg-slate-800/30 rounded-md p-3 border border-current border-opacity-20">
            <p className={`text-xs sm:text-sm ${explanationContent.contentClass} italic`}>
              {explanationContent.tip}
            </p>
          </div>
        )}
      </div>
    </div>
  )
})

AnalysisExplanation.displayName = 'AnalysisExplanation'

// 状态指示器组件 - 使用memo优化
const StatusIndicator = React.memo(({ 
  taskStatus, 
  getStatusText 
}: { 
  taskStatus: string
  getStatusText: () => string 
}) => {
  const statusConfig = useMemo(() => {
    if (taskStatus === 'completed') {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        className: 'text-sm font-medium text-gray-600 dark:text-gray-400'
      }
    }
    
    if (['processing', 'filtering', 'pending'].includes(taskStatus)) {
      return {
        icon: <Clock className="w-4 h-4 animate-spin" />,
        className: 'flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400'
      }
    }
    
    return {
      icon: null,
      className: 'text-sm font-medium text-gray-600 dark:text-gray-400'
    }
  }, [taskStatus])

  return (
    <div className="text-center py-2">
      <div className={statusConfig.className}>
        {statusConfig.icon}
        <span>{getStatusText()}</span>
      </div>
    </div>
  )
})

StatusIndicator.displayName = 'StatusIndicator'

// 按钮组组件 - 使用memo优化
const ActionButtons = React.memo(({ 
  taskStatus,
  isCreating,
  user,
  latestTaskId,
  createTask,
  viewLatestReport,
  restartAnalysis
}: {
  taskStatus: string
  isCreating: boolean
  user: any
  latestTaskId: string | null
  createTask: () => Promise<void>
  viewLatestReport: () => Promise<void>
  restartAnalysis: () => void
}) => {
  const buttonConfig = useMemo(() => {
    if (taskStatus === 'completed') {
      return {
        type: 'completed',
        buttons: [
          {
            key: 'view',
            onClick: viewLatestReport,
            icon: <CheckCircle className="w-4 h-4" />,
            text: '查看报告',
            variant: 'default' as const
          },
          {
            key: 'restart',
            onClick: restartAnalysis,
            icon: <RefreshCw className="w-4 h-4" />,
            text: '重新分析',
            variant: 'outline' as const
          }
        ]
      }
    }
    
    if (['processing', 'filtering', 'pending'].includes(taskStatus)) {
      return {
        type: 'processing',
        message: 'AI分析中，请稍后刷新页面查看结果'
      }
    }
    
    return {
      type: 'idle',
      buttons: [
        {
          key: 'create',
          onClick: createTask,
          disabled: !user || isCreating,
          icon: <Play className="w-4 h-4" />,
          text: isCreating ? '启动中...' : '开始分析',
          variant: 'default' as const
        },
        ...(latestTaskId ? [{
          key: 'latest',
          onClick: viewLatestReport,
          icon: <CheckCircle className="w-4 h-4" />,
          text: '查看上次报告',
          variant: 'outline' as const
        }] : [])
      ]
    }
  }, [taskStatus, isCreating, user, latestTaskId, createTask, viewLatestReport, restartAnalysis])

  if (buttonConfig.type === 'processing') {
    return (
      <div className="text-xs text-center text-muted-foreground bg-blue-50 dark:bg-blue-900/20 rounded-md py-2 px-3">
        {buttonConfig.message}
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
      {buttonConfig.buttons?.map(button => (
        <Button
          key={button.key}
          onClick={button.onClick}
          disabled={button.disabled}
          variant={button.variant}
          size="sm"
          className="flex items-center gap-2"
        >
          {button.icon}
          {button.text}
        </Button>
      ))}
    </div>
  )
})

ActionButtons.displayName = 'ActionButtons'

// 结果显示组件 - 使用memo优化
const ResultDisplay = React.memo(({ 
  result, 
  error 
}: { 
  result: string | null
  error: string | null 
}) => {
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-2">
        <div className="text-red-700 dark:text-red-400 text-sm">{error}</div>
      </div>
    )
  }

  if (result) {
    return (
      <div className="mt-3">
        <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg max-h-80 overflow-y-auto text-sm whitespace-pre-wrap">
          {result}
        </div>
        <div className="mt-2 text-xs text-center text-muted-foreground">
          ✅ AI优化结果
        </div>
      </div>
    )
  }

  return null
})

ResultDisplay.displayName = 'ResultDisplay'

// 主组件 - 使用memo优化
const OptimizedSimpleAsyncAnalysis = React.memo<SimpleAsyncAnalysisProps>(({ 
  title, 
  analysisType, 
  analysisData,
  baziData, 
  ziweiData,
  onComplete 
}) => {
  // 处理分析类型和数据 - 使用useMemo优化
  const { normalizedAnalysisType, finalBaziData, finalZiweiData } = useMemo(() => {
    const normalized = analysisType === 'tiekou' ? 'tiekou_zhiduan' : 
                      analysisType === 'yongshen' ? 'yongshen_analysis' :
                      analysisType === 'ziwei' ? 'ziwei_reasoning' :
                      analysisType === 'sihua' ? 'sihua_reasoning' : analysisType
    
    const finalBazi = baziData || (analysisData && (normalized === 'tiekou_zhiduan' || normalized === 'yongshen_analysis') ? analysisData : null)
    const finalZiwei = ziweiData || (analysisData && (normalized === 'ziwei_reasoning' || normalized === 'sihua_reasoning') ? analysisData : null)
    
    return {
      normalizedAnalysisType: normalized,
      finalBaziData: finalBazi,
      finalZiweiData: finalZiwei
    }
  }, [analysisType, analysisData, baziData, ziweiData])

  // 使用优化的异步分析Hook
  const {
    user,
    taskStatus,
    isCreating,
    error,
    result,
    latestTaskId,
    createTask,
    restartAnalysis,
    viewLatestReport,
    getStatusText
  } = useAsyncAnalysis({
    analysisType: normalizedAnalysisType,
    baziData: finalBaziData,
    ziweiData: finalZiweiData,
    onComplete
  })

  // 优化的事件处理器 - 使用useCallback
  const handleCreateTask = useCallback(() => {
    createTask()
  }, [createTask])

  const handleRestartAnalysis = useCallback(() => {
    restartAnalysis()
  }, [restartAnalysis])

  const handleViewLatestReport = useCallback(() => {
    viewLatestReport()
  }, [viewLatestReport])

  return (
    <div className="w-full space-y-4">
      <AnalysisExplanation analysisType={normalizedAnalysisType} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {taskStatus === 'completed' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (taskStatus === 'processing' || taskStatus === 'filtering' || taskStatus === 'pending') ? (
              <Clock className="w-5 h-5 text-blue-500 animate-pulse" />
            ) : null}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <StatusIndicator 
            taskStatus={taskStatus} 
            getStatusText={getStatusText} 
          />
          
          <ActionButtons
            taskStatus={taskStatus}
            isCreating={isCreating}
            user={user}
            latestTaskId={latestTaskId}
            createTask={handleCreateTask}
            viewLatestReport={handleViewLatestReport}
            restartAnalysis={handleRestartAnalysis}
          />
          
          <ResultDisplay result={result} error={error} />
        </CardContent>
      </Card>
    </div>
  )
})

OptimizedSimpleAsyncAnalysis.displayName = 'OptimizedSimpleAsyncAnalysis'

export default OptimizedSimpleAsyncAnalysis 