import { useState, useEffect, useCallback } from 'react'
import { getStripe } from '@/lib/stripe'

interface PaidReportInfo {
  id: string
  reportType: string
  accessLevel: string
  unlockedFeatures: string[]
  paymentTime: string
  expiresAt?: string
  isLifetime: boolean
}

interface PaidReportStatus {
  isPaid: boolean
  isExpired: boolean
  paidReport: PaidReportInfo | null
}

interface BirthInfo {
  birthYear: number
  birthMonth: number
  birthDay: number
  gender: 'male' | 'female'
  reportType?: 'ziwei' | 'bazi' | 'comprehensive'
}

export function usePaidReports() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 检查付费状态
  const checkPaidStatus = useCallback(async (birthInfo: BirthInfo): Promise<PaidReportStatus | null> => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        birth_year: birthInfo.birthYear.toString(),
        birth_month: birthInfo.birthMonth.toString(),
        birth_day: birthInfo.birthDay.toString(),
        gender: birthInfo.gender,
        report_type: birthInfo.reportType || 'ziwei'
      })

      const response = await fetch(`/api/paid-reports?${params}`)
      const data = await response.json()

      if (!data.success) {
        setError(data.error)
        return null
      }

      return {
        isPaid: data.isPaid,
        isExpired: data.isExpired,
        paidReport: data.paidReport
      }
    } catch (err: any) {
      setError(err.message || '检查付费状态失败')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // 创建Stripe支付
  const createStripePayment = useCallback(async (
    birthInfo: BirthInfo,
    productId: string
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true)
    setError(null)

    try {
      // 创建支付意图
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          birthYear: birthInfo.birthYear,
          birthMonth: birthInfo.birthMonth,
          birthDay: birthInfo.birthDay,
          gender: birthInfo.gender,
          reportType: birthInfo.reportType || 'ziwei'
        })
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error)
        return { success: false, error: data.error }
      }

      // 获取Stripe实例
      const stripe = await getStripe()
      if (!stripe) {
        setError('Stripe加载失败')
        return { success: false, error: 'Stripe加载失败' }
      }

      // 确认支付
      const { error: stripeError } = await stripe.confirmCardPayment(data.clientSecret)

      if (stripeError) {
        setError(stripeError.message || '支付失败')
        return { success: false, error: stripeError.message }
      }

      return { success: true }
    } catch (err: any) {
      const errorMessage = err.message || '支付处理失败'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // 创建付费记录（保留原有方法用于其他支付方式）
  const createPaidRecord = useCallback(async (
    birthInfo: BirthInfo,
    paymentInfo: {
      paymentAmount: number
      paymentMethod: string
      transactionId: string
      unlockedFeatures?: string[]
      accessLevel?: 'basic' | 'premium' | 'vip'
    }
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/paid-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birthYear: birthInfo.birthYear,
          birthMonth: birthInfo.birthMonth,
          birthDay: birthInfo.birthDay,
          gender: birthInfo.gender,
          reportType: birthInfo.reportType || 'ziwei',
          ...paymentInfo
        })
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error)
        return false
      }

      return true
    } catch (err: any) {
      setError(err.message || '创建付费记录失败')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // 批量检查多个生日的付费状态
  const checkMultiplePaidStatus = useCallback(async (
    birthInfoList: BirthInfo[]
  ): Promise<Record<string, PaidReportStatus>> => {
    const results: Record<string, PaidReportStatus> = {}

    // 并行检查所有生日的付费状态
    const promises = birthInfoList.map(async (birthInfo) => {
      const key = `${birthInfo.birthYear}-${birthInfo.birthMonth}-${birthInfo.birthDay}-${birthInfo.gender}-${birthInfo.reportType || 'ziwei'}`
      const status = await checkPaidStatus(birthInfo)
      return { key, status }
    })

    const resolvedResults = await Promise.all(promises)
    
    resolvedResults.forEach(({ key, status }) => {
      if (status) {
        results[key] = status
      }
    })

    return results
  }, [checkPaidStatus])

  // 从localStorage获取生日信息并检查付费状态
  const checkCurrentChartPaidStatus = useCallback(async (
    chartType: 'ziwei' | 'bazi' | 'comprehensive' = 'ziwei'
  ): Promise<PaidReportStatus | null> => {
    try {
      // 从localStorage获取排盘数据
      const storageKey = chartType === 'ziwei' ? 'ziweiChart' : chartType === 'bazi' ? 'baziChart' : 'comprehensiveChart'
      const chartDataStr = localStorage.getItem(storageKey)
      
      if (!chartDataStr) {
        setError('未找到排盘数据')
        return null
      }

      const chartData = JSON.parse(chartDataStr)
      
      // 提取生日信息
      const birthInfo: BirthInfo = {
        birthYear: chartData.birthYear || chartData.year,
        birthMonth: chartData.birthMonth || chartData.month,
        birthDay: chartData.birthDay || chartData.day,
        gender: chartData.gender === '男' ? 'male' : 'female',
        reportType: chartType
      }

      return await checkPaidStatus(birthInfo)
    } catch (err: any) {
      setError('解析排盘数据失败')
      return null
    }
  }, [checkPaidStatus])

  return {
    loading,
    error,
    checkPaidStatus,
    createStripePayment,
    createPaidRecord,
    checkMultiplePaidStatus,
    checkCurrentChartPaidStatus,
    clearError: () => setError(null)
  }
} 