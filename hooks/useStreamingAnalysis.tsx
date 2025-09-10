'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

interface StreamingData {
  type: 'start' | 'progress' | 'complete' | 'error'
  content?: string
  fullContent?: string
  message?: string
  timestamp: number
  taskId: string
}

interface UseStreamingAnalysisOptions {
  taskId: string | null
  enabled?: boolean
  onComplete?: (fullContent: string) => void
  onError?: (error: string) => void
}

interface UseStreamingAnalysisReturn {
  // 状态
  isStreaming: boolean
  isCompleted: boolean
  isFailed: boolean
  
  // 内容
  content: string
  fullContent: string
  
  // 统计
  elapsedTime: number
  formattedElapsedTime: string
  characterCount: number
  
  // 操作
  startStreaming: () => void
  stopStreaming: () => void
  resetStream: () => void
  
  // 自动滚动
  setContentRef: (element: HTMLElement | null) => void
  scrollToBottom: () => void
  
  // 错误
  error: string | null
}

export function useStreamingAnalysis({
  taskId,
  enabled = true,
  onComplete,
  onError
}: UseStreamingAnalysisOptions): UseStreamingAnalysisReturn {
  
  // 状态管理
  const [isStreaming, setIsStreaming] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isFailed, setIsFailed] = useState(false)
  
  // 内容管理
  const [content, setContent] = useState('')
  const [fullContent, setFullContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  // 时间管理
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  
  // refs
  const eventSourceRef = useRef<EventSource | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const contentElementRef = useRef<HTMLElement | null>(null)
  const stoppedTaskIdRef = useRef<string | null>(null)  // 记录被用户手动停止的taskId
  
  // 计算格式化时间
  const formattedElapsedTime = useMemo(() => {
    const minutes = Math.floor(elapsedTime / 60)
    const seconds = elapsedTime % 60
    return minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`
  }, [elapsedTime])
  
  // 字符计数
  const characterCount = content.length

  // 设置内容元素引用
  const setContentRef = useCallback((element: HTMLElement | null) => {
    contentElementRef.current = element
  }, [])

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    if (contentElementRef.current) {
      contentElementRef.current.scrollTop = contentElementRef.current.scrollHeight
    }
  }, [])

  // 自动滚动到最新内容
  useEffect(() => {
    if (isStreaming && content) {
      // 延迟一小段时间确保DOM更新完成
      const timer = setTimeout(() => {
        scrollToBottom()
      }, 50)
      
      return () => clearTimeout(timer)
    }
  }, [content, isStreaming, scrollToBottom])

  // 获取认证头 - 使用Supabase直接获取
  const getAuthHeaders = useCallback(async () => {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        return { Authorization: `Bearer ${session.access_token}` }
      }
    } catch (error) {
      console.error('获取认证信息失败:', error)
    }
    return {}
  }, [])

  // 自动扣费处理
  const handleAutoCharge = useCallback(async (taskId: string, analysisType: string) => {
    try {
      console.log(`💰 开始自动扣费: taskId=${taskId}, type=${analysisType}`)

      // 1. 获取认证头
      const authHeaders = await getAuthHeaders()
      if (!authHeaders.Authorization) {
        throw new Error('未找到认证token')
      }

      // 2. 调用扣费API
      const chargeResponse = await fetch('/api/consume-report-credit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          taskId,
          analysisType,
          amount: 1
        })
      })

      const chargeData = await chargeResponse.json()

      if (!chargeResponse.ok) {
        // 扣费失败只记录日志，不影响分析结果
        console.warn(`⚠️ 自动扣费失败但不影响分析: ${chargeData.error}`)
        return
      }

      if (chargeData.alreadyCharged) {
        console.log(`ℹ️ 该分析已经扣费: ${taskId}`)
      } else {
        console.log(`✅ 自动扣费成功: ${chargeData.message}`)
      }

    } catch (error) {
      console.error('❌ 自动扣费异常:', error)
      // 扣费失败不影响分析结果的显示
    }
  }, [getAuthHeaders])

  // 自动保存分析结果 - 复用手动保存的API逻辑
  const autoSaveAnalysis = useCallback(async (taskId: string, content: string) => {
    try {
      console.log(`🔍 获取任务详情以便自动保存: ${taskId}`)
      
      // 1. 获取认证头
      const authHeaders = await getAuthHeaders()
      if (!authHeaders.Authorization) {
        throw new Error('未找到认证token')
      }

      // 2. 获取任务详细信息
      const taskResponse = await fetch(`/api/analysis-tasks/${taskId}`, {
        headers: authHeaders
      })

      if (!taskResponse.ok) {
        const errorText = await taskResponse.text()
        throw new Error(`获取任务信息失败: ${errorText}`)
      }

      const taskData = await taskResponse.json()
      
      if (!taskData.input_data) {
        throw new Error('任务输入数据缺失')
      }

      console.log(`🔍 任务信息获取成功，分析类型: ${taskData.input_data.analysisType}`)

      // 3. 提取生日信息
      const birthYear = taskData.input_data.ziweiData?.year || taskData.input_data.baziData?.year || taskData.input_data.sihuaData?.year
      const birthMonth = taskData.input_data.ziweiData?.month || taskData.input_data.baziData?.month || taskData.input_data.sihuaData?.month
      const birthDay = taskData.input_data.ziweiData?.day || taskData.input_data.baziData?.day || taskData.input_data.sihuaData?.day
      const birthHour = taskData.input_data.ziweiData?.hour || taskData.input_data.baziData?.hour || taskData.input_data.sihuaData?.hour
      const gender = taskData.input_data.ziweiData?.gender || taskData.input_data.baziData?.gender || taskData.input_data.sihuaData?.gender || 'male'

      // 4. 构建保存数据（使用API支持的格式）
      const saveData = {
        analysis_type: taskData.input_data.analysisType,
        content: content,
        agent_name: getAgentDisplayName(taskData.input_data.analysisType),
        // 使用birth_data格式，让API自动匹配或创建命盘
        birth_data: {
          name: `${getAnalysisTypeName(taskData.input_data.analysisType)}分析`,
          year: birthYear,
          month: birthMonth,
          day: birthDay,
          hour: birthHour,
          gender: gender
        },
        chart_type: getChartType(taskData.input_data.analysisType)
      }

      console.log(`💾 准备自动保存:`, {
        analysis_type: saveData.analysis_type,
        content_length: saveData.content.length,
        birth_info: saveData.birth_data,
        chart_type: saveData.chart_type
      })

      // 5. 调用保存API（复用手动保存的逻辑）
      const saveResponse = await fetch('/api/ai-analyses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(saveData)
      })

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json()
        
        // 特殊处理命盘不存在的错误
        if (errorData.error && 
            (errorData.error.includes('命盘不存在') || 
             errorData.error.includes('无权限访问') || 
             saveResponse.status === 404)) {
          console.log('⚠️ 命盘不存在或无权限访问，跳过自动保存');
          return {
            analysis_type: saveData.analysis_type,
            skipped: true
          };
        }
        
        throw new Error(errorData.error || '自动保存失败')
      }

      const result = await saveResponse.json()
      console.log(`✅ 自动保存成功:`, result)
      
      // 返回保存结果，包含analysis_type用于后续扣费
      return {
        ...result,
        analysis_type: saveData.analysis_type
      }

    } catch (error) {
      console.error('❌ 自动保存异常:', error)
      
      // 如果是命盘不存在相关错误，不抛出到上层
      if (error instanceof Error && 
          (error.message.includes('命盘不存在') || 
           error.message.includes('无权限访问') || 
           error.message.includes('HTTP 404'))) {
        console.log('⚠️ 命盘已被删除或无权限访问，跳过自动保存');
        return {
          analysis_type: taskData?.input_data?.analysisType || 'unknown',
          skipped: true
        };
      }
      
      throw error
    }
  }, [getAuthHeaders])

  // 获取Agent显示名称的工具函数
  const getAgentDisplayName = useCallback((analysisType: string): string => {
    const agentMap: Record<string, string> = {
      'tiekou_zhiduan': '铁口直断大师',
      'yongshen_analysis': '用神大师',
      'ziwei_reasoning': '紫微推理大师',
      'sihua_reasoning': '四化分析大师'
    }
    return agentMap[analysisType] || '未知Agent'
  }, [])

  // 获取分析类型中文名称
  const getAnalysisTypeName = useCallback((analysisType: string): string => {
    const typeMap: Record<string, string> = {
      'tiekou_zhiduan': '铁口直断',
      'yongshen_analysis': '用神推理',
      'ziwei_reasoning': '紫微推理',
      'sihua_reasoning': '四化分析',
      'bazi_analysis': '八字分析'
    }
    return typeMap[analysisType] || '未知分析'
  }, [])

  // 获取命盘类型
  const getChartType = useCallback((analysisType: string): string => {
    if (analysisType === 'ziwei_reasoning' || analysisType === 'sihua_reasoning') {
      return 'ziwei'
    } else if (analysisType.includes('tiekou') || analysisType.includes('yongshen') || analysisType.includes('bazi')) {
      return 'bazi'
    }
    return 'bazi' // 默认为八字
  }, [])

  // 启动计时器
  const startTimer = useCallback(() => {
    setStartTime(Date.now())
    setElapsedTime(0)
    
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)
  }, [])

  // 停止计时器
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // 重置状态
  const resetStream = () => {
    setIsStreaming(false)
    setContent('')
    setFullContent('')
    setError(null)
    setElapsedTime(0)
    setStartTime(null)
    stoppedTaskIdRef.current = null
  }

  // 启动流式分析 - 支持直接传递taskId
  const startStreamingWithTaskId = useCallback(async (directTaskId?: string) => {
    const actualTaskId = directTaskId || taskId
    
    if (!actualTaskId || !enabled) {
      console.warn('无法启动流式分析: taskId缺失或未启用', { directTaskId, taskId, enabled })
      return
    }

    // 🚫 检查是否是被停止的taskId，如果是则拒绝启动
    if (stoppedTaskIdRef.current === actualTaskId) {
      console.warn(`🚫 拒绝启动被停止的任务: ${actualTaskId}`)
      return
    }

    try {
      console.log(`🌊 启动流式分析: ${actualTaskId}`)
      
      // 🔥 重要：启动新任务时，只重置UI状态，不重置防护机制
      setIsStreaming(true)
      setIsCompleted(false)
      setIsFailed(false)
      setContent('')
      setFullContent('')
      setError(null)
      setElapsedTime(0)
      setStartTime(null)
      
      // 关闭之前的连接（如果存在）
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      
      startTimer()

      // 设置最大时间限制（5分钟）
      const maxTimeLimit = 5 * 60 * 1000 // 5分钟
      const timeoutId = setTimeout(() => {
        console.log(`⏰ 流式分析超时，自动停止: ${actualTaskId}`)
        setIsStreaming(false)
        setIsFailed(true)
        setError('分析超时，请重试')
        stopTimer()
        
        // 🚫 超时后标记为停止，防止重启
        stoppedTaskIdRef.current = actualTaskId
        
        onError?.('分析超时，请重试')
        if (eventSourceRef.current) {
          eventSourceRef.current.close()
          eventSourceRef.current = null
        }
      }, maxTimeLimit)

      // 获取认证token
      let authToken = ''
      try {
        const { supabase } = await import('@/lib/supabase')
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          authToken = session.access_token
        }
      } catch (error) {
        console.error('获取认证token失败:', error)
      }
      
      // 构建SSE URL，将token作为查询参数传递
      const url = new URL(`/api/analysis-stream/${actualTaskId}`, window.location.origin)
      if (authToken) {
        url.searchParams.set('token', authToken)
      }
      
      console.log(`🔗 构建EventSource URL:`, url.toString())
      console.log(`🔗 window.location.origin:`, window.location.origin)
      console.log(`🔗 actualTaskId:`, actualTaskId)
      console.log(`🔗 authToken长度:`, authToken?.length || 0)
      
      // 创建EventSource连接
      const eventSource = new EventSource(url.toString())
      eventSourceRef.current = eventSource

      // 处理消息
      eventSource.onmessage = (event) => {
        try {
          const data: StreamingData = JSON.parse(event.data)
          console.log(`📡 收到流式数据:`, data.type, data.content?.length || 0, '字符')

          switch (data.type) {
            case 'start':
              console.log(`🚀 流式分析开始: ${data.message}`)
              break

            case 'progress':
              if (data.content) {
                setContent(prev => {
                  const newContent = prev + data.content
                  // 检查内容长度限制（最大50000字符）
                  if (newContent.length > 50000) {
                    console.log(`📏 内容长度超限，停止接收: ${newContent.length}字符`)
                    clearTimeout(timeoutId)
                    setIsStreaming(false)
                    setIsCompleted(true)
                    stopTimer()
                    onComplete?.(newContent)
                    eventSource.close()
                    return newContent
                  }
                  return newContent
                })
              }
              if (data.fullContent) {
                setFullContent(data.fullContent)
              }
              break

            case 'complete':
              console.log(`✅ 流式分析完成: ${data.message}`)
              clearTimeout(timeoutId)
              setIsStreaming(false)
              setIsCompleted(true)
              stopTimer()
              
              if (data.fullContent) {
                setFullContent(data.fullContent)
                
                // 🔥 关键：收到complete通知后主动调用保存API
                console.log(`💾 开始自动保存分析结果，任务ID: ${actualTaskId}`)
                autoSaveAnalysis(actualTaskId, data.fullContent)
                  .then(async (saveResult) => {
                    if (saveResult.skipped) {
                      console.log(`⚠️ 自动保存被跳过（命盘不存在），不执行扣费: ${actualTaskId}`)
                    } else {
                      console.log(`✅ 自动保存成功: ${actualTaskId}`)
                      
                      // 🔥 保存成功后自动扣费
                      await handleAutoCharge(actualTaskId, saveResult.analysis_type)
                    }
                  })
                  .catch((error) => {
                    console.error(`❌ 自动保存失败: ${actualTaskId}`, error)
                    // 自动保存失败不影响complete回调
                  })
                
                onComplete?.(data.fullContent)
              }
              
              eventSource.close()
              break

            case 'error':
              console.error(`❌ 流式分析错误: ${data.message}`)
              clearTimeout(timeoutId)
              setIsStreaming(false)
              setIsFailed(true)
              setError(data.message || '分析失败')
              stopTimer()
              
              // 🚫 错误后标记为停止，防止重启
              stoppedTaskIdRef.current = actualTaskId
              
              onError?.(data.message || '分析失败')
              eventSource.close()
              break
          }
        } catch (parseError) {
          console.error('❌ 解析流式数据失败:', parseError)
        }
      }

      // 处理连接错误
      eventSource.onerror = (event) => {
        console.error('❌ EventSource连接错误:', event)
        console.error('❌ EventSource readyState:', eventSource.readyState)
        console.error('❌ EventSource URL:', eventSource.url)
        
        let errorMessage = '连接中断，请重试'
        
        // 提供更详细的错误信息
        switch (eventSource.readyState) {
          case EventSource.CONNECTING:
            errorMessage = '正在连接服务器...'
            break
          case EventSource.OPEN:
            errorMessage = '连接已建立但发生错误'
            break
          case EventSource.CLOSED:
            errorMessage = '连接已关闭'
            break
        }
        
        clearTimeout(timeoutId)
        setIsStreaming(false)
        setIsFailed(true)
        setError(errorMessage)
        stopTimer()
        
        // 🚫 连接错误后标记为停止，防止重启
        stoppedTaskIdRef.current = actualTaskId
        
        onError?.(errorMessage)
        eventSource.close()
      }

      // 处理连接打开
      eventSource.onopen = () => {
        console.log(`🔗 EventSource连接已建立: ${actualTaskId}`)
      }

    } catch (error) {
      console.error('❌ 启动流式分析失败:', error)
      setIsStreaming(false)
      setIsFailed(true)
      setError(error instanceof Error ? error.message : '启动失败')
      stopTimer()
      
      // 🚫 启动失败后标记为停止，防止重启
      stoppedTaskIdRef.current = actualTaskId
      
      onError?.(error instanceof Error ? error.message : '启动失败')
    }
  }, [taskId, enabled, startTimer, stopTimer, getAuthHeaders, onComplete, onError, autoSaveAnalysis, handleAutoCharge])

  // 启动流式分析 - 兼容旧接口
  const startStreaming = useCallback(() => {
    return startStreamingWithTaskId()
  }, [startStreamingWithTaskId])

  // 停止流式分析
  const stopStreaming = useCallback(() => {
    console.log(`🛑 用户手动停止流式分析: ${taskId}`)
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    
    setIsStreaming(false)
    stoppedTaskIdRef.current = taskId  // 🔥 记录被停止的taskId，防止该taskId自动重启
    stopTimer()
  }, [taskId, stopTimer])

  // 🔥 恢复自动启动机制 - 但保持防护措施
  useEffect(() => {
    if (taskId && enabled && !isStreaming && !isCompleted && stoppedTaskIdRef.current !== taskId) {
      console.log(`🔄 检测到新任务ID，准备自动启动: ${taskId}`)
      const timer = setTimeout(() => {
        console.log(`🚀 自动启动流式分析: ${taskId}`)
        startStreaming()
      }, 500) // 延迟500ms启动，确保组件完全挂载
      
      return () => clearTimeout(timer)
    }
  }, [taskId, enabled, isStreaming, isCompleted, startStreaming])

  // 清理资源
  useEffect(() => {
    return () => {
      stopStreaming()
      stopTimer()
    }
  }, [stopStreaming, stopTimer])

  return {
    // 状态
    isStreaming,
    isCompleted,
    isFailed,
    
    // 内容
    content,
    fullContent,
    
    // 统计
    elapsedTime,
    formattedElapsedTime,
    characterCount,
    
    // 操作
    startStreaming,
    stopStreaming,
    resetStream,
    
    // 自动滚动
    setContentRef,
    scrollToBottom,
    
    // 错误
    error
  }
}

 