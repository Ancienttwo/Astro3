'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface CreditCheckResult {
  canProceed: boolean
  totalRemaining: number
  freeRemaining: number
  paidRemaining: number
  error?: string
}

interface ConsumeResult {
  success: boolean
  message: string
  remaining?: {
    free: number
    paid: number
  }
  error?: string
}

export function useReportCredit() {
  const [isChecking, setIsChecking] = useState(false)
  const [isConsuming, setIsConsuming] = useState(false)

  // 检查用户是否有足够的报告点数余额
  const checkCreditBalance = useCallback(async (amount: number = 1): Promise<CreditCheckResult> => {
    setIsChecking(true)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        return {
          canProceed: false,
          totalRemaining: 0,
          freeRemaining: 0,
          paidRemaining: 0,
          error: '用户未登录'
        }
      }

      // 获取用户当前余额
      const response = await fetch('/api/user-usage', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('获取用户余额失败')
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || '获取余额信息失败')
      }

      // 计算剩余次数
      const usage = data.usage
      const freeRemaining = Math.max(0, (usage.freeReportsLimit || 0) - (usage.freeReportsUsed || 0))
      const paidRemaining = Math.max(0, (usage.paidReportsPurchased || 0) - (usage.paidReportsUsed || 0))
      const totalRemaining = freeRemaining + paidRemaining

      console.log(`📊 余额检查: 免费=${freeRemaining}, 付费=${paidRemaining}, 总计=${totalRemaining}, 需要=${amount}`)

      return {
        canProceed: totalRemaining >= amount,
        totalRemaining,
        freeRemaining,
        paidRemaining
      }

    } catch (error) {
      console.error('❌ 余额检查失败:', error)
      return {
        canProceed: false,
        totalRemaining: 0,
        freeRemaining: 0,
        paidRemaining: 0,
        error: error instanceof Error ? error.message : '检查余额失败'
      }
    } finally {
      setIsChecking(false)
    }
  }, [])

  // 消费报告点数
  const consumeCredit = useCallback(async (
    taskId: string, 
    analysisType: string, 
    amount: number = 1
  ): Promise<ConsumeResult> => {
    setIsConsuming(true)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        return {
          success: false,
          message: '用户未登录',
          error: '请先登录后再试'
        }
      }

      console.log(`💰 开始扣费: taskId=${taskId}, type=${analysisType}, amount=${amount}`)

      const response = await fetch('/api/consume-report-credit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          taskId,
          analysisType,
          amount
        })
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: data.error || '扣费失败',
          error: data.error
        }
      }

      if (data.alreadyCharged) {
        console.log('⚠️ 该分析已经扣费，跳过重复扣费')
        return {
          success: true,
          message: '该分析已经扣费'
        }
      }

      console.log('✅ 扣费成功:', data.message)

      return {
        success: true,
        message: data.message,
        remaining: data.remaining
      }

    } catch (error) {
      console.error('❌ 扣费失败:', error)
      return {
        success: false,
        message: '扣费过程中发生错误',
        error: error instanceof Error ? error.message : '未知错误'
      }
    } finally {
      setIsConsuming(false)
    }
  }, [])

  // 检查并显示余额不足提示
  const checkAndShowBalance = useCallback(async (amount: number = 1): Promise<boolean> => {
    const result = await checkCreditBalance(amount)
    
    if (!result.canProceed) {
      const message = result.error || 
        `报告点数不足！当前余额：${result.totalRemaining}次，需要：${amount}次`
      
      // 可以在这里触发全局提示或购买弹窗
      console.warn('⚠️ 余额不足:', message)
      alert(message) // 临时用alert，后续可以改为更优雅的提示
      
      return false
    }
    
    return true
  }, [checkCreditBalance])

  return {
    // 状态
    isChecking,
    isConsuming,
    
    // 方法
    checkCreditBalance,
    consumeCredit,
    checkAndShowBalance
  }
} 