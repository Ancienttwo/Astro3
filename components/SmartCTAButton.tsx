"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { isUserAuthenticated } from '@/lib/auth'

interface SmartCTAButtonProps {
  text: string
  href?: string
  className?: string
  language?: 'zh' | 'en'
}

export default function SmartCTAButton({ text, href = '/home', className, language = 'zh' }: SmartCTAButtonProps) {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authenticated = await isUserAuthenticated()
        setIsLoggedIn(authenticated)
      } catch (error) {
        console.error('检查登录状态时出错:', error)
        setIsLoggedIn(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()

    // 监听认证状态变化（可选）
    const interval = setInterval(checkAuthStatus, 30000) // 每30秒检查一次
    
    return () => clearInterval(interval)
  }, [])

  const handleClick = () => {
    if (isLoggedIn) {
      // 已登录：跳转到指定页面
      router.push(href)
    } else {
      // 未登录：跳转到登录/注册页面
      router.push('/auth')
    }
  }

  if (isLoading) {
    return (
      <Button
        size="lg"
        disabled
        className={className}
      >
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>{language === 'zh' ? '加载中...' : 'Loading...'}</span>
        </div>
      </Button>
    )
  }

  return (
    <Button
      onClick={handleClick}
      size="lg"
      className={className}
    >
      <Sparkles className="w-6 h-6 mr-3" />
      {text}
    </Button>
  )
} 