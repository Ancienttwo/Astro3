import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import { CheckCircle, Clock, Play, RefreshCw, Timer, ExternalLink } from 'lucide-react'
import { useAnalysisCooldown } from '@/hooks/useAnalysisCooldown'

interface SimpleAsyncAnalysisProps {
  title: string
  analysisType: 'tiekou' | 'yongshen' | 'ziwei' | 'sihua' | 'tiekou_zhiduan' | 'yongshen_analysis' | 'ziwei_reasoning' | 'sihua_reasoning'
  analysisData?: any // 兼容原来的接口
  baziData?: any
  ziweiData?: any
  onComplete?: (result: string) => void
}

export default function SimpleAsyncAnalysis({ 
  title, 
  analysisType, 
  analysisData,
  baziData, 
  ziweiData,
  onComplete 
}: SimpleAsyncAnalysisProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isEnglish = pathname.startsWith('/en')
  const [user, setUser] = useState<any>(null)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [taskStatus, setTaskStatus] = useState<string>('idle')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [latestTaskId, setLatestTaskId] = useState<string | null>(null)
  const [showCreditDialog, setShowCreditDialog] = useState(false)

  // 冷却时间管理
  const { 
    isOnCooldown, 
    remainingTime, 
    canAnalyze, 
    startNewAnalysis, 
    formatRemainingTime 
  } = useAnalysisCooldown(analysisType)

  // 获取用户信息
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user || null
      setUser(currentUser)
      
      if (currentUser) {
        await loadLatestCompletedTask()
      }
    }
    getUser()
  }, [analysisType])

  // 获取最新完成的任务
  const loadLatestCompletedTask = async () => {
    try {
      const session = await supabase.auth.getSession()
      if (!session.data.session) return

      const response = await fetch(`/api/analysis-tasks?limit=1&status=completed&task_type=${getTaskType()}`, {
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.tasks && data.tasks.length > 0) {
          setLatestTaskId(data.tasks[0].id)
        }
      }
    } catch (error) {
      console.error('获取最新任务失败:', error)
    }
  }

  // 处理分析类型和数据
  const normalizedAnalysisType = analysisType === 'tiekou' ? 'tiekou_zhiduan' : 
                                 analysisType === 'yongshen' ? 'yongshen_analysis' :
                                 analysisType === 'ziwei' ? 'ziwei_reasoning' :
                                 analysisType === 'sihua' ? 'sihua_reasoning' : analysisType
  
  // 统一数据处理：优先使用传入的数据，然后使用analysisData
  const finalBaziData = baziData || (analysisData && (normalizedAnalysisType === 'tiekou_zhiduan' || normalizedAnalysisType === 'yongshen_analysis') ? analysisData : null)
  const finalZiweiData = ziweiData || (analysisData && (normalizedAnalysisType === 'ziwei_reasoning' || normalizedAnalysisType === 'sihua_reasoning') ? analysisData : null)

  // 获取任务类型
  const getTaskType = () => {
    return (normalizedAnalysisType === 'tiekou_zhiduan' || normalizedAnalysisType === 'yongshen_analysis') ? 'bazi' : 'ziwei'
  }

  // 创建异步分析任务
  const createAsyncTask = async () => {
    if (!user) {
      setError(isEnglish ? 'Please log in first' : '请先登录')
      return
    }

    // 检查冷却时间
    if (!canAnalyze) {
      setError(
        isEnglish 
          ? `Please wait ${formatRemainingTime(remainingTime)} before requesting another analysis. You can check your previous reports in the charts section.`
          : `请等待 ${formatRemainingTime(remainingTime)} 后再次分析，可在命书中查看之前的报告。`
      )
      return
    }

    try {
      setIsCreating(true)
      setError(null)
      setResult(null)

      // 🔥 第一步：在开始分析前先扣费
      console.log('💰 开始预扣费检查...')
      
      const session = await supabase.auth.getSession()
      if (!session.data.session?.access_token) {
        throw new Error('认证失败，请重新登录')
      }

      // 生成任务ID用于扣费
      const tempTaskId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // 调用扣费API
      const chargeResponse = await fetch('/api/consume-report-credit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`
        },
        body: JSON.stringify({
          taskId: tempTaskId,
          analysisType: normalizedAnalysisType,
          amount: 1
        })
      })

      if (!chargeResponse.ok) {
        const chargeError = await chargeResponse.json()
        const errorMessage = chargeError.error || '报告点数不足，请购买更多次数'
        
        // 检查是否是点数不足错误
        if (errorMessage.includes('点数不足') || errorMessage.includes('不足')) {
          setShowCreditDialog(true)
          return // 不抛出错误，显示弹窗
        }
        
        throw new Error(errorMessage)
      }

      const chargeData = await chargeResponse.json()
      
      if (!chargeData.success && !chargeData.alreadyCharged) {
        throw new Error(chargeData.error || '扣费失败')
      }

      console.log('✅ 预扣费成功，开始创建分析任务...')

      // 🔥 第二步：扣费成功后，创建分析任务
      const response = await fetch('/api/async-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`
        },
        body: JSON.stringify({
          analysisType: normalizedAnalysisType,
          baziData: finalBaziData,
          ziweiData: finalZiweiData,
          enableFiltering: true, // 启用AI过滤
          chargedTaskId: tempTaskId // 传递已扣费的任务ID
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        // 如果任务创建失败，理论上应该退还扣费，但为了简化，这里只记录错误
        console.error('❌ 任务创建失败，但已扣费:', errorData.error)
        throw new Error(errorData.error || '创建任务失败')
      }

      const task = await response.json()
      setTaskId(task.id)
      setTaskStatus('pending')

      console.log('✅ 分析任务创建成功，已预扣费')
      
      // 启动冷却时间
      startNewAnalysis()

      // 开始状态监控
      startStatusPolling(task.id)

    } catch (error) {
      console.error('创建异步任务失败:', error)
      setError(error instanceof Error ? error.message : '创建任务失败')
    } finally {
      setIsCreating(false)
    }
  }



  // 状态轮询
  const startStatusPolling = (taskId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/async-analysis/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        })

        if (!response.ok) {
          throw new Error('查询状态失败')
        }

        const task = await response.json()
        setTaskStatus(task.status)

        if (task.status === 'completed') {
          setResult(task.filtered_result)
          setLatestTaskId(taskId)
          clearInterval(pollInterval)
          onComplete?.(task.filtered_result)
        } else if (task.status === 'failed') {
          setError(task.error || '分析失败')
          clearInterval(pollInterval)
        }
      } catch (error) {
        console.error('状态查询失败:', error)
        clearInterval(pollInterval)
      }
    }, 3000) // 每3秒查询一次

    // 6分钟后停止轮询
    setTimeout(() => {
      clearInterval(pollInterval)
      if (taskStatus !== 'completed' && taskStatus !== 'failed') {
        setError('分析超时，请重试')
      }
    }, 6 * 60 * 1000)
  }

  // 重新分析
  const restartAnalysis = () => {
    setTaskId(null)
    setTaskStatus('idle')
    setError(null)
    setResult(null)
  }

  // 查看最新报告
  const viewLatestReport = async () => {
    if (!latestTaskId) return

    try {
      const response = await fetch(`/api/async-analysis/${latestTaskId}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      })

      if (response.ok) {
        const task = await response.json()
        if (task.filtered_result) {
          setResult(task.filtered_result)
          setTaskStatus('completed')
        }
      }
    } catch (error) {
      console.error('查看报告失败:', error)
    }
  }

  // 获取状态显示文本
  const getStatusText = () => {
    switch (taskStatus) {
      case 'pending': return '正在准备分析...'
      case 'processing': return 'AI正在深度分析中...'
      case 'filtering': return '正在优化分析结果...'
      case 'completed': return '分析完成'
      case 'failed': return '分析失败'
      default: return '' // 删除"准备开始"提示
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* 用神解释说明 - 仅在用神分析时显示 */}
      {(analysisType === 'yongshen' || analysisType === 'yongshen_analysis') && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg p-4 sm:p-6 border border-amber-200 dark:border-amber-800">
          <div className="space-y-4">
            {/* 标题部分 */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <h3 className="text-lg sm:text-xl font-bold text-amber-800 dark:text-amber-300">
                什么是用神？
              </h3>
            </div>
            
            {/* 核心定义 */}
            <p className="text-sm sm:text-base text-amber-700 dark:text-amber-200 leading-relaxed">
              用神是八字命理学的核心概念，指八字命局中能平衡五行、调和矛盾、增强有利因素的关键元素。
              其作用类似"药方"，通过补足日干（命主）的五行短板或抑制过旺能量，使命局达到动态平衡。
            </p>
            
            {/* 实际意义 - 响应式网格布局 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white/70 dark:bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-amber-300 dark:border-amber-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🧭</span>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-300">命运指导</h4>
                </div>
                <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-200">
                  用神决定命主适合的行业、方位、颜色等（如用神为火→宜南方/红色/能源行业）
                </p>
              </div>
              
              <div className="bg-white/70 dark:bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-amber-300 dark:border-amber-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📅</span>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-300">大运流年</h4>
                </div>
                <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-200">
                  当大运或流年强化用神时，运势上升；克制用神则易遇坎坷
                </p>
              </div>
              
              <div className="bg-white/70 dark:bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-amber-300 dark:border-amber-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">⚖️</span>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-300">化解冲突</h4>
                </div>
                <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-200">
                  用神能缓解八字中的刑冲克害（如子午相冲，取木通关）
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 铁口直断解释说明 - 仅在铁口直断分析时显示 */}
      {(analysisType === 'tiekou' || analysisType === 'tiekou_zhiduan') && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-lg p-4 sm:p-6 border border-purple-200 dark:border-purple-800">
          <div className="space-y-4">
            {/* 标题部分 */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">👁️</span>
              <h3 className="text-lg sm:text-xl font-bold text-purple-800 dark:text-purple-300">
                什么是盲派铁口直断？
              </h3>
            </div>
            
            {/* 核心定义 */}
            <p className="text-sm sm:text-base text-purple-700 dark:text-purple-200 leading-relaxed">
              盲派八字是中国传统命理学中一个独特分支，起源于古代盲人为谋生而发展的算命技术。
              其核心特点是弃用传统八字的五行旺衰分析和用神选取，转而通过口诀化规则和生活化象征快速断命。
            </p>
            
            {/* 特色方法 - 响应式布局 */}
            <div className="space-y-3">
              <div className="bg-white/70 dark:bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-purple-300 dark:border-purple-700">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                      <span className="text-lg">📖</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">口诀直断</h4>
                    <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-200">
                      盲师依赖秘传口诀（如"财藏官库，蓄稀世之宝"），像查字典一样对照八字组合直接得出结论，3分钟内可断人生大事。
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 dark:bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-purple-300 dark:border-purple-700">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                      <span className="text-lg">🔮</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">象法解读</h4>
                    <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-200">
                      将抽象干支转化为生活符号——比如"子午冲"象征南北奔波、"卯酉冲"代表婚姻变动，类似用"密码本"翻译八字中的故事。
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 传承提示 */}
            <div className="bg-purple-100/50 dark:bg-purple-900/20 rounded-md p-3 border border-purple-300/50 dark:border-purple-700/50">
              <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 italic">
                💡 这种方法虽精准高效，但因依赖师徒口传心授，普通人难以自学掌握精髓。本系统融合了盲派精华，让您也能体验铁口直断的神奇。
              </p>
            </div>
          </div>
        </div>
      )}

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
          {/* 状态显示 - 紧凑版 */}
          <div className="text-center py-2">
            {(taskStatus === 'processing' || taskStatus === 'filtering' || taskStatus === 'pending') ? (
              <div className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                <Clock className="w-4 h-4 animate-spin" />
                <span>{getStatusText()}</span>
              </div>
            ) : (
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {getStatusText()}
              </div>
            )}
          </div>

          {/* 按钮组 - 紧凑版 */}
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
            {taskStatus === 'completed' ? (
              <>
                <Button 
                  onClick={viewLatestReport}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  查看报告
                </Button>
                <Button 
                  onClick={restartAnalysis}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  重新分析
                </Button>
              </>
            ) : (taskStatus === 'processing' || taskStatus === 'filtering' || taskStatus === 'pending') ? (
              <div className="text-xs text-center text-muted-foreground bg-blue-50 dark:bg-blue-900/20 rounded-md py-2 px-3">
                AI分析中，请稍后刷新页面查看结果
              </div>
            ) : (
              <>
                <Button 
                  onClick={createAsyncTask}
                  disabled={!user || isCreating || !canAnalyze}
                  size="sm"
                  className={`flex items-center gap-2 ${!canAnalyze ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {!canAnalyze ? (
                    <>
                      <Timer className="w-4 h-4" />
                      {isEnglish 
                        ? `Cooldown ${formatRemainingTime(remainingTime)}`
                        : `冷却中 ${formatRemainingTime(remainingTime)}`
                      }
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      {isCreating 
                        ? (isEnglish ? 'Starting...' : '启动中...') 
                        : (isEnglish ? 'Start Analysis' : '开始分析')
                      }
                    </>
                  )}
                </Button>
                {latestTaskId && (
                  <Button 
                    onClick={viewLatestReport}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    查看上次报告
                  </Button>
                )}
              </>
            )}
          </div>

          {/* 错误显示 - 紧凑版 */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-2">
              <div className="text-red-700 dark:text-red-400 text-sm">{error}</div>
            </div>
          )}

          {/* 分析结果 - 紧凑版 */}
          {result && (
            <div className="mt-3">
              <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg max-h-80 overflow-y-auto text-sm whitespace-pre-wrap">
                {result}
              </div>
              <div className="mt-2 text-xs text-center text-muted-foreground">
                ✅ AI优化结果
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 点数不足弹窗 */}
      <Dialog open={showCreditDialog} onOpenChange={setShowCreditDialog}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isEnglish ? 'Insufficient Credits' : '点数不足'}
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 dark:text-gray-400 mt-2">
              {isEnglish 
                ? 'You need more credits to generate this analysis report. Please purchase more credits to continue.'
                : '您的报告点数不足，无法生成分析报告。请购买更多点数后继续。'
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowCreditDialog(false)}
              className="flex-1"
            >
              {isEnglish ? 'Cancel' : '取消'}
            </Button>
            <Button
              onClick={() => {
                setShowCreditDialog(false)
                // 根据语言跳转到不同的订阅页面
                const subscriptionUrl = isEnglish ? '/en/subscription' : '/subscription'
                router.push(subscriptionUrl)
              }}
              className="flex-1 flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              {isEnglish ? 'Buy Credits' : '购买点数'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 