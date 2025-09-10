import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import { CheckCircle, Clock, Play, RefreshCw, ChevronDown, ChevronUp, Lightbulb, Eye, Timer, ExternalLink } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useAnalysisCooldown } from '@/hooks/useAnalysisCooldown'

interface MobileAsyncAnalysisProps {
  title: string
  analysisType: 'tiekou' | 'yongshen' | 'ziwei' | 'sihua' | 'tiekou_zhiduan' | 'yongshen_analysis' | 'ziwei_reasoning' | 'sihua_reasoning'
  analysisData?: any
  baziData?: any
  ziweiData?: any
  onComplete?: (result: string) => void
}

export default function MobileAsyncAnalysis({ 
  title, 
  analysisType, 
  analysisData,
  baziData, 
  ziweiData,
  onComplete 
}: MobileAsyncAnalysisProps) {
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
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
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
  
  // 统一数据处理
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

      // 预扣费
      const session = await supabase.auth.getSession()
      if (!session.data.session?.access_token) {
        throw new Error('认证失败，请重新登录')
      }

      const tempTaskId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
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

      // 创建分析任务
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
          enableFiltering: true,
          chargedTaskId: tempTaskId,
          language: window.location.pathname.includes('/en/') ? 'en' : 'zh' // Detect language from URL
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '创建任务失败')
      }

      const task = await response.json()
      setTaskId(task.id)
      setTaskStatus('pending')
      
      // 启动冷却时间
      startNewAnalysis()
      
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
    }, 3000)

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
          setShowReportModal(true) // 打开弹窗显示报告
        }
      }
    } catch (error) {
      console.error('查看报告失败:', error)
    }
  }

  // 查看当前报告（用于"查看报告"按钮）
  const viewCurrentReport = () => {
    if (result) {
      setShowReportModal(true)
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
      default: return ''
    }
  }

  // 获取简介内容（显示在科普和分析按钮之间）
  const getIntroContent = () => {
    if (analysisType === 'tiekou' || analysisType === 'tiekou_zhiduan') {
      return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Eye className="w-6 h-6 text-orange-500" />
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {isEnglish ? 'What is Categorical Prediction?' : '什么是铁口直断？'}
            </h4>
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
              {isEnglish 
                ? 'Categorical Prediction is an ancient blind fortune-telling technique that uses formula-based rules for rapid destiny analysis, without relying on Five Elements strength analysis.'
                : '盲派八字是古代盲人算命技术，通过口诀化规则快速断命，不依赖五行旺衰分析。'
              }
            </p>
          </div>
        </div>
      )
    } else if (analysisType === 'yongshen' || analysisType === 'yongshen_analysis') {
      return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <span className="text-xl">🎯</span>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {isEnglish ? 'What is Focal Element?' : '什么是用神？'}
            </h4>
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
              {isEnglish 
                ? 'Focal Element is the key element in BaZi that balances the Five Elements and harmonizes contradictions, acting like a "prescription" to regulate the chart.'
                : '用神是八字中平衡五行、调和矛盾的关键元素，如同"药方"般调节命局。'
              }
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  // 获取知识科普内容（详细内容）
  const getKnowledgeContent = () => {
    if (analysisType === 'tiekou' || analysisType === 'tiekou_zhiduan') {
      return (
        <div className="space-y-4">
          {/* 详细内容 */}
          <div className="space-y-4">
            {/* 更详细的定义 */}
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {isEnglish 
                ? 'Categorical Prediction is a unique branch of traditional Chinese destiny study, originating from ancient blind fortune-tellers\' techniques developed for practical divination. Its core feature is utilizing traditional BaZi Five Elements analysis and divine selection methods to quickly determine destiny through oral formulas and life experience.'
                : '盲派八字是中国传统命理学中一个独特分支，起源于古代盲人为谋生而发展的算命技术。其核心特点是弃用传统八字的五行旺衰分析和用神选取，转而通过口诀化规则和生活化象征快速断命。'
              }
            </p>
            
            {/* 特色方法 */}
            <div className="space-y-3">
              <div className="bg-white/70 dark:bg-slate-800/50 rounded-lg p-3 border border-gray-300 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-lg">📖</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {isEnglish ? 'Direct Formula Reading' : '口诀直断'}
                    </h5>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      {isEnglish 
                        ? 'Masters rely on secret formulas passed down through generations (such as "Wealth Palace Official Treasury, Riches Reach the World"), using pictographic classics combined with BaZi combinations to directly derive conclusions, capable of revealing life events within 3 minutes.'
                        : '盲师依赖秘传口诀（如"财藏官库，蓄稀世之宝"），像查字典一样对照八字组合直接得出结论，3分钟内可断人生大事。'
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 dark:bg-slate-800/50 rounded-lg p-3 border border-gray-300 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-lg">🔮</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {isEnglish ? 'Symbolic Interpretation' : '象法解读'}
                    </h5>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      {isEnglish 
                        ? 'Transforms pictographic symbols into life signs - such as "Zi-Wu Clash" representing northern-southern conflicts, "Mao-You Clash" representing marriage changes, similar to using password books to translate stories in BaZi.'
                        : '将抽象干支转化为生活符号——比如"子午冲"象征南北奔波、"卯酉冲"代表婚姻变动，类似用"密码本"翻译八字中的故事。'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 传承提示 */}
            <div className="bg-gray-100/50 dark:bg-gray-800/50 rounded-md p-3 border border-gray-300/50 dark:border-gray-700/50">
              <p className="text-xs text-gray-700 dark:text-gray-300 italic">
                {isEnglish 
                  ? '💡 This method is highly effective but requires deep master-disciple transmission. While ordinary people can learn the basic framework, the essence of the system combines hundreds of years of accumulated wisdom, allowing experienced masters to achieve categorical prediction.'
                  : '💡 这种方法虽精准高效，但因依赖师徒口传心授，普通人难以自学掌握精髓。本系统融合了盲派精华，让您也能体验铁口直断的神奇。'
                }
              </p>
            </div>
          </div>
        </div>
      )
    } else if (analysisType === 'yongshen' || analysisType === 'yongshen_analysis') {
      return (
        <div className="space-y-4">
          {/* 详细内容 */}
          <div className="space-y-4">
            {/* 更详细的定义 */}
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {isEnglish 
                ? 'Focal Element is the core concept of BaZi destiny study, referring to the key element in the BaZi chart that can balance the Five Elements, harmonize contradictions, and enhance beneficial factors. Its function is like a "prescription," achieving dynamic balance in the chart by supplementing the Five Elements deficiencies of the Day Master or suppressing excessive energies.'
                : '用神是八字命理学的核心概念，指八字命局中能平衡五行、调和矛盾、增强有利因素的关键元素。其作用类似"药方"，通过补足日干（命主）的五行短板或抑制过旺能量，使命局达到动态平衡。'
              }
            </p>
            
            {/* 实际意义 */}
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-white/70 dark:bg-slate-800/50 rounded-lg p-3 border border-gray-300 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🧭</span>
                  <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                    {isEnglish ? 'Destiny Guidance' : '命运指导'}
                  </h5>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  {isEnglish 
                    ? 'Focal Element determines suitable industries, directions, colors for the chart owner (e.g., Fire focal element → South/Red/Energy industry)'
                    : '用神决定命主适合的行业、方位、颜色等（如用神为火→宜南方/红色/能源行业）'
                  }
                </p>
              </div>
              
              <div className="bg-white/70 dark:bg-slate-800/50 rounded-lg p-3 border border-gray-300 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📅</span>
                  <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                    {isEnglish ? 'Luck Cycles & Years' : '大运流年'}
                  </h5>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  {isEnglish 
                    ? 'When Major Luck or Fleeting Years strengthen the focal element, fortune rises; when they constrain it, difficulties arise'
                    : '当大运或流年强化用神时，运势上升；克制用神则易遇坎坷'
                  }
                </p>
              </div>
              
              <div className="bg-white/70 dark:bg-slate-800/50 rounded-lg p-3 border border-gray-300 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">⚖️</span>
                  <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                    {isEnglish ? 'Conflict Resolution' : '化解冲突'}
                  </h5>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  {isEnglish 
                    ? 'Focal Element can alleviate clashes and conflicts in BaZi (e.g., Zi-Wu clash, use Wood as mediator)'
                    : '用神能缓解八字中的刑冲克害（如子午相冲，取木通关）'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // 用神分析区域国际化
  const yongshenNotFoundTitle = isEnglish ? 'No Focal Element information found' : '未找到用神信息';
  const yongshenNotFoundDesc = isEnglish ? 'You have not analyzed Focal Element information yet. Please click "Start Analysis" below to begin.' : '您还没有分析过用神信息，请点击下方"开始分析"按钮进行用神推理分析。';
  const yongshenExtractTitle = isEnglish ? 'Extract Focal Element Information' : '提取用神信息';
  const yongshenExtractDesc = isEnglish ? 'Please click "Start Analysis" above to generate the Focal Element report. After completion, you can click "Re-extract" to manually obtain more accurate Focal Element information.' : '请先点击上方"开始分析"生成用神分析报告，分析完成后可以点击"重新提取"按钮手动提取更准确的用神信息。';

  return (
    <>
      <div className="space-y-3">
        {/* 知识科普 - 可折叠 */}
        <Collapsible open={isKnowledgeOpen} onOpenChange={setIsKnowledgeOpen}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {isEnglish ? 'Knowledge' : '科普知识'}
                </span>
              </div>
              {isKnowledgeOpen ? 
                <ChevronUp className="w-4 h-4 text-orange-500" /> : 
                <ChevronDown className="w-4 h-4 text-orange-500" />
              }
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 border-t-0">
            {getKnowledgeContent()}
          </CollapsibleContent>
        </Collapsible>

        {/* 简介内容 */}
        {getIntroContent()}

        {/* 主要分析区域 */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
          {/* 状态显示 */}
          <div className="text-center mb-4">
            {(taskStatus === 'processing' || taskStatus === 'filtering' || taskStatus === 'pending') ? (
              <div className="flex items-center justify-center gap-2 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-600 dark:text-blue-400">{getStatusText()}</span>
              </div>
            ) : taskStatus === 'completed' ? (
              <div className="flex items-center justify-center gap-2 py-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 dark:text-green-400">
                  {isEnglish ? 'Analysis Complete' : '分析完成'}
                </span>
              </div>
            ) : null}
          </div>

          {/* 主要按钮 */}
          <div className="space-y-2">
            {taskStatus === 'completed' ? (
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={viewCurrentReport}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isEnglish ? 'View Report' : '查看报告'}
                </Button>
                <Button 
                  onClick={restartAnalysis}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {isEnglish ? 'Restart Analysis' : '重新分析'}
                </Button>
              </div>
            ) : (taskStatus === 'processing' || taskStatus === 'filtering' || taskStatus === 'pending') ? (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    {isEnglish ? 'AI Analyzing...' : 'AI分析中...'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {isEnglish 
                    ? 'Please keep the page open, results will be displayed automatically when analysis is complete'
                    : '请保持页面打开，分析完成后会自动显示结果'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Button 
                  onClick={createAsyncTask}
                  disabled={!user || isCreating || !canAnalyze}
                  className={`w-full ${!canAnalyze 
                    ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                    : 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600'
                  } text-white`}
                >
                  {!canAnalyze ? (
                    <>
                      <Timer className="w-4 h-4 mr-2" />
                      {isEnglish 
                        ? `Cooldown ${formatRemainingTime(remainingTime)}`
                        : `冷却中 ${formatRemainingTime(remainingTime)}`
                      }
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
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
                    className="w-full"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isEnglish ? 'View Last Report' : '查看上次报告'}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* 错误显示 */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="text-red-700 dark:text-red-400 text-sm">{error}</div>
            </div>
          )}
        </div>
      </div>

      {/* 报告弹窗 */}
      {showReportModal && result && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {isEnglish ? `${title} Analysis Report` : `${title}分析报告`}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                  {isEnglish ? '✅ AI Optimized Result' : '✅ AI优化结果'}
                </span>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title={isEnglish ? 'Close' : '关闭'}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 弹窗内容 - 可滑动 */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                <pre className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-gray-200 font-normal">
                  {result}
                </pre>
              </div>
            </div>

            {/* 弹窗底部操作 */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex gap-2 justify-end">
                <Button 
                  onClick={() => {
                    setShowReportModal(false);
                    restartAnalysis();
                  }}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  {isEnglish ? 'Restart Analysis' : '重新分析'}
                </Button>
                <Button 
                  onClick={() => setShowReportModal(false)}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {isEnglish ? 'Close' : '关闭'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
    </>
  )
} 