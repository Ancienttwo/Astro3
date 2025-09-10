"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { isAdmin as checkIsAdmin } from '@/lib/auth'
import Logo from './Logo'

interface AdminAuthGuardProps {
  children: React.ReactNode
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [user, setUser] = useState<any | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        console.log('🔍 开始客户端管理员权限检查...')
        
        // 1. 获取当前用户session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session || !session.user) {
          console.log('❌ 没有有效的用户session，重定向到认证页面')
          setError('请先登录后访问管理员功能')
          setTimeout(() => {
            router.push('/auth')
          }, 2000)
          return
        }
        
        console.log('✅ 获取到用户session:', session.user.email)
        setUser(session.user)
        
        // 2. 检查管理员权限
        const hasPermission = checkIsAdmin(session.user.email || '')
        
        if (!hasPermission) {
          console.log('❌ 非管理员用户，权限不足')
          setError('权限不足：此页面仅管理员可访问')
          return
        }

        console.log('✅ 管理员权限验证通过')
        setIsAdmin(true)
        
      } catch (error) {
        console.error('❌ 管理员权限检查失败:', error)
        setError('权限检查失败，请重新登录')
      } finally {
        setLoading(false)
      }
    }

    checkAdminAuth()
  }, [router])

  // 显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Logo size={88} className="mx-auto opacity-60" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-primary font-rajdhani">AstroZi</h2>
            <p className="text-muted-foreground">正在验证管理员权限...</p>
            <div className="flex justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 显示权限错误
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto p-6">
          <Logo size={88} className="mx-auto opacity-60" />
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-primary font-rajdhani">AstroZi</h2>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 font-medium">访问被拒绝</p>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push('/home')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                返回首页
              </button>
              <button
                onClick={() => router.push('/auth')}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                重新登录
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 只有管理员才能访问
  if (user && isAdmin) {
    return <>{children}</>
  }

  // 这种情况通常不会出现
  return null
} 