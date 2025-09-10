"use client";

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { DualAuthManager, Web3Auth } from '@/lib/dual-auth-system'

interface CheckinStatus {
  last_checkin_date: string | null;
  consecutive_checkin_days: number;
  total_checkin_days: number;
  free_reports_limit: number;
  free_reports_used: number;
}

interface CheckinResult {
  success: boolean;
  message: string;
  reward?: {
    baseReward: number;
    consecutiveBonus: number;
    totalReward: number;
    bonusReason?: string;
  };
  newStatus?: CheckinStatus;
}

interface CheckinSummary {
  hasCheckedInToday: boolean;
  canCheckin: boolean;
  consecutiveDays: number;
  totalDays: number;
  nextReward: number;
  lastReward?: number;
  freeReportsRemaining: number;
  chatbotRemaining: number;
}

interface NextConsecutiveReward {
  requiredDays: number;
  reward: number;
  daysRemaining: number;
}

export function useDailyCheckin() {
  const [checkinStatus, setCheckinStatus] = useState<CheckinStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCheckinStatus = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // 准备请求头
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      // 优先检查Supabase session（架构修复：先检查session再获取用户）
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      console.log('🔍 签到Hook检查 - Session状态:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
        hasAccessToken: !!session?.access_token,
        sessionError: sessionError?.message,
        tokenLength: session?.access_token?.length || 0
      })
      
      if (session && !sessionError && session.access_token) {
        // Web2用户认证
        headers['Authorization'] = `Bearer ${session.access_token}`
        console.log('✅ 签到Hook - 使用Web2认证，Token长度:', session.access_token.length)
      } else {
        // 检查Web3用户
        const web3User = Web3Auth.getCurrentUser()
        if (web3User) {
          headers['X-Web3-User'] = btoa(encodeURIComponent(JSON.stringify(web3User)))
          console.log('✅ 签到Hook - 使用Web3认证')
        } else {
          console.log('❌ 签到Hook - 无有效认证，Session错误:', sessionError?.message)
          setError('无法获取用户信息，请稍后重试')
          setCheckinStatus(null)
          return null
        }
      }

      const response = await fetch('/api/daily-checkin', {
        method: 'GET',
        headers,
        credentials: 'include', // 确保包含认证信息
      })

      if (response.status === 401) {
        setError('登录已失效，请重新登录')
        setCheckinStatus(null)
        return null
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (parseError) {
          console.warn('解析错误响应失败:', parseError)
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      if (data.success) {
        setCheckinStatus(data.status)
        return data.status
      } else {
        throw new Error(data.error || '获取签到状态失败')
      }
    } catch (err: any) {
      console.error('获取签到状态失败:', err)
      const errorMessage = err.message || '网络错误，请检查连接'
      setError(errorMessage)
      
      // 如果是401错误，清空状态
      if (errorMessage.includes('401') || errorMessage.includes('登录')) {
        setCheckinStatus(null)
      }
      
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const performCheckin = useCallback(async (): Promise<CheckinResult | null> => {
    setLoading(true)
    setError(null)
    
    try {
      // 准备请求头
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      // 优先检查Supabase session（架构修复：先检查session再获取用户）
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      console.log('🔍 签到执行检查 - Session状态:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
        hasAccessToken: !!session?.access_token,
        sessionError: sessionError?.message,
        tokenLength: session?.access_token?.length || 0
      })
      
      if (session && !sessionError && session.access_token) {
        // Web2用户认证
        headers['Authorization'] = `Bearer ${session.access_token}`
        console.log('✅ 签到执行 - 使用Web2认证，Token长度:', session.access_token.length)
      } else {
        // 检查Web3用户
        const web3User = Web3Auth.getCurrentUser()
        if (web3User) {
          headers['X-Web3-User'] = btoa(encodeURIComponent(JSON.stringify(web3User)))
          console.log('✅ 签到执行 - 使用Web3认证')
        } else {
          console.log('❌ 签到执行 - 无有效认证，Session错误:', sessionError?.message)
          const errorMessage = '登录已失效，请重新登录'
          setError(errorMessage)
          throw new Error(errorMessage)
        }
      }

      const response = await fetch('/api/daily-checkin', {
        method: 'POST',
        headers,
        credentials: 'include', // 确保包含认证信息
      })

      if (response.status === 401) {
        const errorMessage = '登录已失效，请重新登录'
        setError(errorMessage)
        throw new Error(errorMessage)
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (parseError) {
          console.warn('解析错误响应失败:', parseError)
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      if (data.success) {
        // 更新本地状态 - 签到成功后需要重新获取状态
        await fetchCheckinStatus()
        return data
      } else {
        throw new Error(data.error || '签到失败')
      }
    } catch (err: any) {
      console.error('签到失败:', err)
      const errorMessage = err.message || '网络错误，请检查连接'
      setError(errorMessage)
      
      // 如果是401错误，抛出错误让组件处理
      if (errorMessage.includes('401') || errorMessage.includes('登录')) {
        throw err
      }
      
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const canCheckinToday = useCallback((): boolean => {
    if (!checkinStatus) return false
    
    const today = new Date().toISOString().split('T')[0]
    const lastCheckinDate = checkinStatus.last_checkin_date
    
    // 如果从未签到过，或者上次签到不是今天，则可以签到
    return !lastCheckinDate || lastCheckinDate !== today
  }, [checkinStatus])

  const getCheckinSummary = useCallback((): CheckinSummary => {
    if (!checkinStatus) {
      return {
        hasCheckedInToday: false,
        canCheckin: false,
        consecutiveDays: 0,
        totalDays: 0,
        nextReward: 1,
        freeReportsRemaining: 0,
      }
    }

    const today = new Date().toISOString().split('T')[0]
    const hasCheckedInToday = checkinStatus.last_checkin_date === today
    const canCheckin = canCheckinToday()
    
    return {
      hasCheckedInToday,
      canCheckin,
      consecutiveDays: checkinStatus.consecutive_checkin_days,
      totalDays: checkinStatus.total_checkin_days,
      nextReward: 1, // 基础每日奖励
      freeReportsRemaining: Math.max(0, checkinStatus.free_reports_limit - checkinStatus.free_reports_used),
      chatbotRemaining: Math.max(0, (checkinStatus.chatbot_limit || 30) - (checkinStatus.chatbot_used || 0)),
    }
  }, [checkinStatus, canCheckinToday])

  const getNextConsecutiveReward = useCallback((): NextConsecutiveReward | null => {
    if (!checkinStatus) return null

    const consecutiveDays = checkinStatus.consecutive_checkin_days
    
    // 定义连续签到奖励规则
    const rewards = [
      { days: 7, reward: 2 },
      { days: 15, reward: 3 },
      { days: 30, reward: 5 },
    ]

    // 找到下一个奖励目标
    for (const rewardInfo of rewards) {
      if (consecutiveDays < rewardInfo.days) {
        return {
          requiredDays: rewardInfo.days,
          reward: rewardInfo.reward,
          daysRemaining: rewardInfo.days - consecutiveDays,
        }
      }
    }

    // 如果已经达到最高奖励，返回30天循环奖励
    return {
      requiredDays: 30,
      reward: 5,
      daysRemaining: 30 - (consecutiveDays % 30),
    }
  }, [checkinStatus])

  // 清除错误状态
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // 重置状态
  const resetStatus = useCallback(() => {
    setCheckinStatus(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    checkinStatus,
    loading,
    error,
    fetchCheckinStatus,
    performCheckin,
    canCheckinToday,
    getCheckinSummary,
    getNextConsecutiveReward,
    clearError,
    resetStatus,
  }
} 