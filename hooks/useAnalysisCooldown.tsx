import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface CooldownState {
  isOnCooldown: boolean
  remainingTime: number
  lastAnalysisTime: Date | null
  canAnalyze: boolean
}

const COOLDOWN_DURATION = 2 * 60 * 1000 // 2分钟（毫秒）

// 将analysisType映射到task_type的函数
function mapAnalysisTypeToTaskType(analysisType: string): string {
  // 八字类型分析
  if (analysisType === 'tiekou_zhiduan' || analysisType === 'yongshen_analysis' || 
      analysisType === 'tiekou' || analysisType === 'yongshen') {
    return 'bazi'
  }
  // 紫微类型分析 (默认)
  return 'ziwei'
}

export function useAnalysisCooldown(analysisType: string) {
  // 将analysisType转换为task_type
  const taskType = mapAnalysisTypeToTaskType(analysisType)
  const [cooldownState, setCooldownState] = useState<CooldownState>({
    isOnCooldown: false,
    remainingTime: 0,
    lastAnalysisTime: null,
    canAnalyze: true
  })

  // 检查冷却状态
  const checkCooldownStatus = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        setCooldownState({
          isOnCooldown: false,
          remainingTime: 0,
          lastAnalysisTime: null,
          canAnalyze: true
        })
        return
      }

      // 获取用户最近的分析记录
      const { data: tasks, error } = await supabase
        .from('analysis_tasks')
        .select('created_at')
        .eq('user_id', session.user.id)
        .eq('task_type', taskType)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Error checking cooldown:', error)
        return
      }

      if (tasks && tasks.length > 0) {
        const lastAnalysisTime = new Date(tasks[0].created_at)
        const currentTime = new Date()
        const timeDiff = currentTime.getTime() - lastAnalysisTime.getTime()
        
        if (timeDiff < COOLDOWN_DURATION) {
          const remainingTime = COOLDOWN_DURATION - timeDiff
          setCooldownState({
            isOnCooldown: true,
            remainingTime: Math.ceil(remainingTime / 1000),
            lastAnalysisTime,
            canAnalyze: false
          })
          
          // 设置定时器更新剩余时间
          const timer = setInterval(() => {
            const now = new Date()
            const newTimeDiff = now.getTime() - lastAnalysisTime.getTime()
            
            if (newTimeDiff >= COOLDOWN_DURATION) {
              setCooldownState({
                isOnCooldown: false,
                remainingTime: 0,
                lastAnalysisTime,
                canAnalyze: true
              })
              clearInterval(timer)
            } else {
              const newRemainingTime = COOLDOWN_DURATION - newTimeDiff
              setCooldownState(prev => ({
                ...prev,
                remainingTime: Math.ceil(newRemainingTime / 1000)
              }))
            }
          }, 1000)

          return () => clearInterval(timer)
        } else {
          setCooldownState({
            isOnCooldown: false,
            remainingTime: 0,
            lastAnalysisTime,
            canAnalyze: true
          })
        }
      } else {
        setCooldownState({
          isOnCooldown: false,
          remainingTime: 0,
          lastAnalysisTime: null,
          canAnalyze: true
        })
      }
    } catch (error) {
      console.error('Error in checkCooldownStatus:', error)
    }
  }, [analysisType])

  // 开始新的分析（更新冷却状态）
  const startNewAnalysis = useCallback(() => {
    const now = new Date()
    setCooldownState({
      isOnCooldown: true,
      remainingTime: COOLDOWN_DURATION / 1000,
      lastAnalysisTime: now,
      canAnalyze: false
    })
  }, [])

  // 格式化剩余时间显示
  const formatRemainingTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  useEffect(() => {
    checkCooldownStatus()
  }, [checkCooldownStatus])

  return {
    ...cooldownState,
    startNewAnalysis,
    formatRemainingTime,
    refreshCooldownStatus: checkCooldownStatus
  }
}