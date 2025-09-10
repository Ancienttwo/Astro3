"use client";

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface UserUsage {
  id: string
  userId: string
  freeReportsUsed: number
  freeReportsLimit: number
  paidReportsUsed: number
  paidReportsPurchased: number
  chatbotUsed: number
  chatbotLimit: number
  chatbotRemaining: number
  ziweiReportsCount: number
  baziReportsCount: number
  comprehensiveReportsCount: number
  dailyLimit: number
  dailyUsed: number
  lastResetDate: string
  isPremiumUser: boolean
  premiumExpiresAt?: string
  canGenerateReport: boolean
  canUseChatbot: boolean
  remainingFreeReports: number
  remainingPaidReports: number
  remainingDailyReports: number
}

export function useUserUsage() {
  const [usage, setUsage] = useState<UserUsage | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 获取用户使用统计
  const fetchUsage = useCallback(async (): Promise<UserUsage | null> => {
    setLoading(true)
    setError(null)

    try {
      // 优先检查Web3钱包用户
      const currentUser = typeof window !== 'undefined' ? localStorage.getItem('current_user') : null
      if (currentUser) {
        try {
          const userData = JSON.parse(currentUser)
          if (userData.wallet_address && (userData.auth_method === 'web3_jwt' || userData.auth_method === 'walletconnect')) {
            console.log('🔍 检测到Web3钱包用户，获取使用统计:', userData.wallet_address)
            
            // 获取Web3认证token
            const walletConnectAuth = localStorage.getItem('walletconnect_auth')
            let authToken = null
            
            if (walletConnectAuth) {
              try {
                const authData = JSON.parse(walletConnectAuth)
                authToken = authData.auth_token
              } catch (e) {
                console.log('解析walletconnect_auth失败:', e)
              }
            }
            
            // 如果没有找到token，跳过Web3认证
            if (!authToken) {
              console.log('未找到Web3认证token，跳过Web3认证')
            } else {
              const response = await fetch('/api/user-usage', {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${authToken}`,
                },
                credentials: 'include',
              })
              
              if (response.ok) {
                const data = await response.json()
                if (data.success) {
                  // 将API返回的数据转换为UserUsage格式
                  const usage: UserUsage = {
                    id: data.data.user_id || '',
                    userId: data.data.user_id || '',
                    freeReportsUsed: data.data.free_reports_used ?? 0,
                    freeReportsLimit: data.data.free_reports_limit ?? 0,
                    paidReportsUsed: data.data.paid_reports_used ?? 0,
                    paidReportsPurchased: data.data.paid_reports_purchased ?? 0,
                    chatbotUsed: data.data.chatbot_used ?? 0,
                    chatbotLimit: data.data.chatbot_limit ?? 30,
                    chatbotRemaining: Math.max(0, (data.data.chatbot_limit ?? 30) - (data.data.chatbot_used ?? 0)),
                    ziweiReportsCount: 0, // 暂时使用默认值
                    baziReportsCount: 0, // 暂时使用默认值
                    comprehensiveReportsCount: 0, // 暂时使用默认值
                    dailyLimit: 10, // 暂时使用默认值
                    dailyUsed: 0, // 暂时使用默认值
                    lastResetDate: '', // 暂时使用默认值
                    isPremiumUser: false, // 暂时使用默认值
                    canGenerateReport: true, // Web3用户默认可以生成报告
                    canUseChatbot: (data.data.chatbot_limit ?? 30) > (data.data.chatbot_used ?? 0),
                    remainingFreeReports: Math.max(0, (data.data.free_reports_limit ?? 0) - (data.data.free_reports_used ?? 0)),
                    remainingPaidReports: Math.max(0, (data.data.paid_reports_purchased ?? 0) - (data.data.paid_reports_used ?? 0)),
                    remainingDailyReports: 10 // 暂时使用默认值
                  }
                  
                  setUsage(usage)
                  return usage
                } else {
                  console.log('Web3用户获取使用统计失败:', data.error)
                }
              } else {
                console.log('Web3用户API调用失败:', response.status)
              }
            }
          }
        } catch (e) {
          console.log('解析Web3用户数据失败:', e)
        }
      }

      // 检查Supabase session用户
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.log('❌ 用户未登录，无法获取使用统计')
        setError(null)
        setUsage(null)
        return null
      }

      const response = await fetch('/api/user-usage', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        credentials: 'include',
      })
      
      if (response.status === 401) {
        console.log('❌ 认证失败，用户未登录')
        setError(null)
        setUsage(null)
        return null
      }
      
      const data = await response.json()

      if (!data.success) {
        console.log('❌ 获取使用统计失败:', data.error)
        setError(null)
        setUsage(null)
        return null
      }

      // 将API返回的数据转换为UserUsage格式
      const usage: UserUsage = {
        id: data.data.userId || '',
        userId: data.data.userId || '',
        freeReportsUsed: data.data.freeReportsUsed ?? 0,
        freeReportsLimit: data.data.freeReportsLimit ?? 0,
        paidReportsUsed: data.data.paidReportsUsed ?? 0,
        paidReportsPurchased: 0, // 暂时使用默认值
        chatbotUsed: data.data.chatbotUsed ?? 0,
        chatbotLimit: data.data.chatbotLimit ?? 30,
        chatbotRemaining: data.data.chatbotRemaining ?? 30,
        ziweiReportsCount: 0, // 暂时使用默认值
        baziReportsCount: 0, // 暂时使用默认值
        comprehensiveReportsCount: 0, // 暂时使用默认值
        dailyLimit: 10, // 暂时使用默认值
        dailyUsed: 0, // 暂时使用默认值
        lastResetDate: '', // 暂时使用默认值
        isPremiumUser: data.data.hasUnlimitedAccess ?? false,
        canGenerateReport: data.data.canUseService ?? false,
        canUseChatbot: data.data.canUseChatbot ?? false,
        remainingFreeReports: data.data.freeReportsRemaining ?? 0,
        remainingPaidReports: 0, // 暂时使用默认值
        remainingDailyReports: 10 // 暂时使用默认值
      }

      setUsage(usage)
      return usage
    } catch (err: any) {
      console.log('❌ 获取使用统计异常:', err.message)
      setError(null)
      setUsage(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // 检查是否可以生成报告
  const canGenerateReport = useCallback(async (reportType: 'ziwei' | 'bazi' | 'comprehensive' = 'ziwei'): Promise<{
    canGenerate: boolean
    reason?: string
    useFree?: boolean
    remainingFree?: number
    remainingPaid?: number
  }> => {
    const currentUsage = usage || await fetchUsage()
    
    if (!currentUsage) {
      return {
        canGenerate: false,
        reason: '无法获取使用统计'
      }
    }

    // 检查每日限制
    if (currentUsage.remainingDailyReports <= 0) {
      return {
        canGenerate: false,
        reason: '今日生成次数已用完，请明天再试'
      }
    }

    // 检查免费次数
    if (currentUsage.remainingFreeReports > 0) {
      return {
        canGenerate: true,
        useFree: true,
        remainingFree: currentUsage.remainingFreeReports,
        remainingPaid: currentUsage.remainingPaidReports
      }
    }

    // 检查付费次数
    if (currentUsage.remainingPaidReports > 0) {
      return {
        canGenerate: true,
        useFree: false,
        remainingFree: 0,
        remainingPaid: currentUsage.remainingPaidReports
      }
    }

    return {
      canGenerate: false,
      reason: '生成次数不足，请购买更多次数',
      remainingFree: 0,
      remainingPaid: 0
    }
  }, [usage, fetchUsage])

  // 消费一次生成次数
  const consumeUsage = useCallback(async (
    reportType: 'ziwei' | 'bazi' | 'comprehensive' = 'ziwei',
    useFreeTrial: boolean = true
  ): Promise<{
    success: boolean
    error?: string
    usedFree?: boolean
    remainingFreeReports?: number
    remainingPaidReports?: number
    remainingDailyReports?: number
  }> => {
    setLoading(true)
    setError(null)

    try {
      // 获取认证token - 优先Web3，后备Supabase
      let authToken = null
      let isWeb3Auth = false
      
      // 检查Web3用户
      const currentUser = typeof window !== 'undefined' ? localStorage.getItem('current_user') : null
      if (currentUser) {
        try {
          const userData = JSON.parse(currentUser)
          if (userData.wallet_address && (userData.auth_method === 'web3_jwt' || userData.auth_method === 'walletconnect')) {
            const walletConnectAuth = localStorage.getItem('walletconnect_auth')
            if (walletConnectAuth) {
              const authData = JSON.parse(walletConnectAuth)
              authToken = authData.auth_token
              isWeb3Auth = true
            }
          }
        } catch (e) {
          console.log('解析Web3用户数据失败:', e)
        }
      }
      
      // 如果不是Web3用户，使用Supabase认证
      if (!authToken) {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) {
          console.log('❌ 用户未登录，无法消费使用次数')
          return {
            success: false,
            error: '用户未登录'
          }
        }
        authToken = session.access_token
      }

      const response = await fetch('/api/user-usage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          updates: {
            // 根据报告类型更新相应计数
            [`${reportType}_reports_used`]: useFreeTrial ? 'increment_free' : 'increment_paid'
          }
        })
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error)
        return {
          success: false,
          error: data.error
        }
      }

      // 刷新使用统计
      await fetchUsage()

      return {
        success: true,
        usedFree: data.usedFree,
        remainingFreeReports: data.remainingFreeReports,
        remainingPaidReports: data.remainingPaidReports,
        remainingDailyReports: data.remainingDailyReports
      }
    } catch (err: any) {
      const errorMsg = err.message || '消费使用次数失败'
      setError(errorMsg)
      return {
        success: false,
        error: errorMsg
      }
    } finally {
      setLoading(false)
    }
  }, [fetchUsage])

  // 购买付费次数
  const purchaseReports = useCallback(async (
    purchaseCount: number,
    paymentInfo: {
      paymentAmount: number
      paymentMethod: string
      transactionId: string
      isPremiumUpgrade?: boolean
    }
  ): Promise<{
    success: boolean
    error?: string
    purchasedCount?: number
    totalPaidReports?: number
    isPremiumUser?: boolean
  }> => {
    setLoading(true)
    setError(null)

    try {
      // 获取认证token - 优先Web3，后备Supabase
      let authToken = null
      
      // 检查Web3用户
      const currentUser = typeof window !== 'undefined' ? localStorage.getItem('current_user') : null
      if (currentUser) {
        try {
          const userData = JSON.parse(currentUser)
          if (userData.wallet_address && (userData.auth_method === 'web3_jwt' || userData.auth_method === 'walletconnect')) {
            const walletConnectAuth = localStorage.getItem('walletconnect_auth')
            if (walletConnectAuth) {
              const authData = JSON.parse(walletConnectAuth)
              authToken = authData.auth_token
            }
          }
        } catch (e) {
          console.log('解析Web3用户数据失败:', e)
        }
      }
      
      // 如果不是Web3用户，使用Supabase认证
      if (!authToken) {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) {
          setError('登录已失效，请重新登录')
          return {
            success: false,
            error: '登录已失效，请重新登录'
          }
        }
        authToken = session.access_token
      }

      const response = await fetch('/api/user-usage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          updates: {
            paid_reports_purchased: purchaseCount,
            payment_info: paymentInfo
          }
        })
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error)
        return {
          success: false,
          error: data.error
        }
      }

      // 刷新使用统计
      await fetchUsage()

      return {
        success: true,
        purchasedCount: data.purchasedCount,
        totalPaidReports: data.totalPaidReports,
        isPremiumUser: data.isPremiumUser
      }
    } catch (err: any) {
      const errorMsg = err.message || '购买报告次数失败'
      setError(errorMsg)
      return {
        success: false,
        error: errorMsg
      }
    } finally {
      setLoading(false)
    }
  }, [fetchUsage])

  // 重置使用次数
  const resetUsage = useCallback(async (
    resetType: 'daily' | 'free' | 'all' = 'daily'
  ): Promise<{
    success: boolean
    error?: string
    resetType?: string
  }> => {
    setLoading(true)
    setError(null)

    try {
      // 获取认证token - 优先Web3，后备Supabase
      let authToken = null
      
      // 检查Web3用户
      const currentUser = typeof window !== 'undefined' ? localStorage.getItem('current_user') : null
      if (currentUser) {
        try {
          const userData = JSON.parse(currentUser)
          if (userData.wallet_address && (userData.auth_method === 'web3_jwt' || userData.auth_method === 'walletconnect')) {
            const walletConnectAuth = localStorage.getItem('walletconnect_auth')
            if (walletConnectAuth) {
              const authData = JSON.parse(walletConnectAuth)
              authToken = authData.auth_token
            }
          }
        } catch (e) {
          console.log('解析Web3用户数据失败:', e)
        }
      }
      
      // 如果不是Web3用户，使用Supabase认证
      if (!authToken) {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) {
          setError('登录已失效，请重新登录')
          return {
            success: false,
            error: '登录已失效，请重新登录'
          }
        }
        authToken = session.access_token
      }

      const response = await fetch(`/api/user-usage?type=${resetType}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        credentials: 'include',
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error)
        return {
          success: false,
          error: data.error
        }
      }

      // 刷新使用统计
      await fetchUsage()

      return {
        success: true,
        resetType: data.resetType
      }
    } catch (err: any) {
      const errorMsg = err.message || '重置使用次数失败'
      setError(errorMsg)
      return {
        success: false,
        error: errorMsg
      }
    } finally {
      setLoading(false)
    }
  }, [fetchUsage])

  // 获取使用统计摘要
  const getUsageSummary = useCallback(() => {
    if (!usage) return null

    return {
      totalReports: usage.ziweiReportsCount + usage.baziReportsCount + usage.comprehensiveReportsCount,
      freeUsagePercent: usage.freeReportsLimit > 0 ? (usage.freeReportsUsed / usage.freeReportsLimit) * 100 : 0,
      paidUsagePercent: usage.paidReportsPurchased > 0 ? (usage.paidReportsUsed / usage.paidReportsPurchased) * 100 : 0,
      dailyUsagePercent: usage.dailyLimit > 0 ? (usage.dailyUsed / usage.dailyLimit) * 100 : 0,
      canGenerate: usage.canGenerateReport,
      needsPurchase: usage.remainingFreeReports === 0 && usage.remainingPaidReports === 0,
      isPremium: usage.isPremiumUser
    }
  }, [usage])

  // 组件挂载时自动获取使用统计
  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  return {
    usage,
    loading,
    error,
    fetchUsage,
    canGenerateReport,
    consumeUsage,
    purchaseReports,
    resetUsage,
    getUsageSummary,
    clearError: () => setError(null)
  }
} 