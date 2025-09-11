"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getCurrentUnifiedUser } from '@/lib/auth'
import type { UnifiedUser } from '@/lib/auth'
import Logo from './Logo'

interface AuthGuardProps {
  children: React.ReactNode
}

  // 定义不需要登录的页面路径
  const PUBLIC_PATHS = [
    '/',
    '/auth',
    '/auth-select',
    '/auth/callback',
    '/wallet-auth',  // Web3钱包登录页面
    '/privy-auth',   // Privy 登录页面（Web2入口）
    '/privacy-policy',
  '/service-agreement',
  '/fortune',      // 通用签文页面
  '/guandi',       // 关帝灵签页面
  '/help-center',  // 帮助中心
  '/menu',         // 菜单页面
  '/home'          // 首页
]

// 检查路径是否为公开路径
const isPublicPath = (pathname: string): boolean => {
  // 英文页面都是公开的，不需要登录
  if (pathname.startsWith('/en')) {
    return true
  }
  
  return PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/auth/')
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [user, setUser] = useState<UnifiedUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isChecking, setIsChecking] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 AuthGuard 检查路径:', pathname);
        
        // 如果是公开路径，直接允许访问
        if (isPublicPath(pathname)) {
          console.log('✅ 公开路径，直接允许访问:', pathname);
          setLoading(false)
          setIsChecking(false)
          return
        }

        console.log('🔒 受保护路径，检查认证状态:', pathname);
        
        // 检查用户登录状态
        const currentUser = await getCurrentUnifiedUser()
        
        if (!currentUser) {
          // 未登录，重定向到认证页面
          console.log('❌ 用户未登录，重定向到认证页面')
          router.push('/auth')
          return
        }

        // 已登录，允许访问
        console.log('✅ 用户已登录，允许访问');
        setUser(currentUser)
      } catch (error) {
        console.error('❌ 认证检查失败:', error)
        // 认证检查失败，重定向到认证页面
        router.push('/auth')
      } finally {
        setLoading(false)
        setIsChecking(false)
      }
    }

    // 仅在挂载后执行检查，避免SSR/CSR不一致导致的水合问题
    if (mounted) {
      checkAuth()
    }
  }, [pathname, router, mounted])

  // 对于公开路径，直接渲染子组件（不显示加载态）
  const isPublic = isPublicPath(pathname)
  if (isPublic) return <>{children}</>

  // 显示加载状态（仅受保护路径才显示）
  if (!mounted || loading || isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Logo size={88} className="mx-auto opacity-60" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-primary font-rajdhani">AstroZi</h2>
            <p className="text-muted-foreground">正在验证登录状态...</p>
            <div className="flex justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 对于受保护的路径，只有在用户已登录时才渲染
  if (user) {
    return <>{children}</>
  }

  // 这种情况通常不会出现，因为未登录会被重定向
  return null
} 
