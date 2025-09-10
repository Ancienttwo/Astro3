import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface UseAsyncAnalysisOptions {
  analysisType: string
  baziData?: any
  ziweiData?: any
  autoLoad?: boolean
  onComplete?: (result: string) => void
  onError?: (error: string) => void
}

interface AsyncAnalysisState {
  user: any
  taskId: string | null
  taskStatus: 'idle' | 'pending' | 'processing' | 'filtering' | 'completed' | 'failed'
  isCreating: boolean
  error: string | null
  result: string | null
  latestTaskId: string | null
}

interface UseAsyncAnalysisReturn extends AsyncAnalysisState {
  createTask: () => Promise<void>
  restartAnalysis: () => void
  viewLatestReport: () => Promise<void>
  generateCacheKey: () => string
  checkExistingAnalysis: () => any
  getStatusText: () => string
}

// 分析类型映射
const ANALYSIS_TYPE_MAP = {
  'tiekou': 'tiekou_zhiduan',
  'yongshen': 'yongshen_analysis', 
  'ziwei': 'ziwei_reasoning',
  'sihua': 'sihua_reasoning'
} as const

// 任务类型映射
const TASK_TYPE_MAP = {
  'tiekou_zhiduan': 'bazi',
  'yongshen_analysis': 'bazi',
  'ziwei_reasoning': 'ziwei',
  'sihua_reasoning': 'ziwei'
} as const

export function useAsyncAnalysis(options: UseAsyncAnalysisOptions): UseAsyncAnalysisReturn {
  const {
    analysisType: rawAnalysisType,
    baziData,
    ziweiData,
    autoLoad = true,
    onComplete,
    onError
  } = options

  // 状态管理
  const [state, setState] = useState<AsyncAnalysisState>({
    user: null,
    taskId: null,
    taskStatus: 'idle',
    isCreating: false,
    error: null,
    result: null,
    latestTaskId: null
  })

  // 轮询清理引用
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 标准化分析类型
  const analysisType = ANALYSIS_TYPE_MAP[rawAnalysisType as keyof typeof ANALYSIS_TYPE_MAP] || rawAnalysisType

  // 获取任务类型
  const getTaskType = useCallback(() => {
    return TASK_TYPE_MAP[analysisType as keyof typeof TASK_TYPE_MAP] || 'bazi'
  }, [analysisType])

  // 生成缓存键
  const generateCacheKey = useCallback(() => {
    if (baziData) {
      const baziString = `${baziData.yearPillar}_${baziData.monthPillar}_${baziData.dayPillar}_${baziData.hourPillar}`
      return `${baziString}_${baziData.gender}`
    }
    
    if (ziweiData) {
      // 简化的紫微缓存键生成
      const keyData = {
        ming: ziweiData.mingGong ? `${ziweiData.mingGong.heavenlyStem}${ziweiData.mingGong.branch}` : '',
        birth: `${ziweiData.year}_${ziweiData.month}_${ziweiData.day}_${ziweiData.hour}`
      }
      return `ziwei_${JSON.stringify(keyData)}`
    }
    
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [baziData, ziweiData])

  // 检查现有分析结果（需要外部传入record数据）
  const checkExistingAnalysis = useCallback(() => {
    // 这个函数需要在组件中配合使用，因为需要访问record数据
    return null
  }, [])

  // 清理轮询
  const clearPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // 获取用户信息
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user || null
      
      setState(prev => ({ ...prev, user: currentUser }))
      
      if (currentUser && autoLoad) {
        await loadLatestCompletedTask()
      }
    }
    getUser()
  }, [analysisType, autoLoad])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearPolling()
    }
  }, [clearPolling])

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
          setState(prev => ({ ...prev, latestTaskId: data.tasks[0].id }))
        }
      }
    } catch (error) {
      console.error('获取最新任务失败:', error)
    }
  }

  // 状态轮询
  const startStatusPolling = useCallback((taskId: string) => {
    clearPolling() // 清理之前的轮询
    
    pollIntervalRef.current = setInterval(async () => {
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
        setState(prev => ({ ...prev, taskStatus: task.status }))

        if (task.status === 'completed') {
          setState(prev => ({ 
            ...prev, 
            result: task.filtered_result,
            latestTaskId: taskId 
          }))
          clearPolling()
          onComplete?.(task.filtered_result)
        } else if (task.status === 'failed') {
          setState(prev => ({ 
            ...prev, 
            error: task.error || '分析失败' 
          }))
          clearPolling()
          onError?.(task.error || '分析失败')
        }
      } catch (error) {
        console.error('状态查询失败:', error)
        clearPolling()
        const errorMessage = '状态查询失败'
        setState(prev => ({ ...prev, error: errorMessage }))
        onError?.(errorMessage)
      }
    }, 3000) // 每3秒查询一次

    // 6分钟后停止轮询
    timeoutRef.current = setTimeout(() => {
      clearPolling()
      setState(prev => {
        if (prev.taskStatus !== 'completed' && prev.taskStatus !== 'failed') {
          const errorMessage = '分析超时，请重试'
          onError?.(errorMessage)
          return { ...prev, error: errorMessage }
        }
        return prev
      })
    }, 6 * 60 * 1000)
  }, [clearPolling, onComplete, onError])

  // 创建异步分析任务
  const createTask = useCallback(async () => {
    if (!state.user) {
      const errorMessage = '请先登录'
      setState(prev => ({ ...prev, error: errorMessage }))
      onError?.(errorMessage)
      return
    }

    try {
      setState(prev => ({ 
        ...prev, 
        isCreating: true, 
        error: null, 
        result: null 
      }))

      // 第一步：预扣费
      console.log('💰 开始预扣费检查...')
      
      const session = await supabase.auth.getSession()
      if (!session.data.session?.access_token) {
        throw new Error('认证失败，请重新登录')
      }

      // 生成临时任务ID用于扣费
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
          analysisType: analysisType,
          amount: 1
        })
      })

      if (!chargeResponse.ok) {
        const chargeError = await chargeResponse.json()
        throw new Error(chargeError.error || '报告点数不足，请购买更多次数')
      }

      const chargeData = await chargeResponse.json()
      
      if (!chargeData.success && !chargeData.alreadyCharged) {
        throw new Error(chargeData.error || '扣费失败')
      }

      console.log('✅ 预扣费成功，开始创建分析任务...')

      // 第二步：创建分析任务
      const response = await fetch('/api/async-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`
        },
        body: JSON.stringify({
          analysisType: analysisType,
          baziData: baziData,
          ziweiData: ziweiData,
          enableFiltering: true,
          chargedTaskId: tempTaskId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ 任务创建失败，但已扣费:', errorData.error)
        throw new Error(errorData.error || '创建任务失败')
      }

      const task = await response.json()
      setState(prev => ({ 
        ...prev, 
        taskId: task.id, 
        taskStatus: 'pending' 
      }))

      console.log('✅ 分析任务创建成功，已预扣费')

      // 开始状态监控
      startStatusPolling(task.id)

    } catch (error) {
      console.error('创建异步任务失败:', error)
      const errorMessage = error instanceof Error ? error.message : '创建任务失败'
      setState(prev => ({ ...prev, error: errorMessage }))
      onError?.(errorMessage)
    } finally {
      setState(prev => ({ ...prev, isCreating: false }))
    }
  }, [state.user, analysisType, baziData, ziweiData, startStatusPolling, onError])

  // 重新分析
  const restartAnalysis = useCallback(() => {
    clearPolling()
    setState(prev => ({
      ...prev,
      taskId: null,
      taskStatus: 'idle',
      error: null,
      result: null
    }))
  }, [clearPolling])

  // 查看最新报告
  const viewLatestReport = useCallback(async () => {
    if (!state.latestTaskId) return

    try {
      const response = await fetch(`/api/async-analysis/${state.latestTaskId}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      })

      if (response.ok) {
        const task = await response.json()
        if (task.filtered_result) {
          setState(prev => ({
            ...prev,
            result: task.filtered_result,
            taskStatus: 'completed'
          }))
          onComplete?.(task.filtered_result)
        }
      }
    } catch (error) {
      console.error('查看报告失败:', error)
      const errorMessage = '查看报告失败'
      setState(prev => ({ ...prev, error: errorMessage }))
      onError?.(errorMessage)
    }
  }, [state.latestTaskId, onComplete, onError])

  // 获取状态显示文本
  const getStatusText = useCallback(() => {
    switch (state.taskStatus) {
      case 'pending': return '正在准备分析...'
      case 'processing': return 'AI正在深度分析中...'
      case 'filtering': return '正在优化分析结果...'
      case 'completed': return '分析完成'
      case 'failed': return '分析失败'
      default: return ''
    }
  }, [state.taskStatus])

  return {
    ...state,
    createTask,
    restartAnalysis,
    viewLatestReport,
    generateCacheKey,
    checkExistingAnalysis,
    getStatusText
  }
} 