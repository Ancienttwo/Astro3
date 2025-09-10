'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  Calendar, 
  MessageCircle, 
  User, 
  Sparkles,
  Menu,
  X,
  ChevronLeft,
  ArrowLeft
} from 'lucide-react'
import { BOTTOM_NAV_ITEMS } from '@/lib/navigation'
import { useRouter } from 'next/navigation'

interface MobileLayoutProps {
  children: React.ReactNode
  showHeader?: boolean
  showNavigation?: boolean
  title?: string
  showBackButton?: boolean
  onBackClick?: () => void
}

// 使用统一的底部导航配置
const navigationItems = BOTTOM_NAV_ITEMS.map(item => ({
  id: item.id,
  label: item.label,
  href: item.route,
  icon: item.icon,
  color: 'text-blue-500' // 默认颜色，可以根据需要调整
}))

export default function MobileLayout({ 
  children, 
  showHeader = true,
  showNavigation = true,
  title,
  showBackButton = false,
  onBackClick
}: MobileLayoutProps) {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isWechatBrowser, setIsWechatBrowser] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // 检测微信浏览器
    const userAgent = navigator.userAgent.toLowerCase()
    setIsWechatBrowser(userAgent.includes('micromessenger'))
    
    // 设置viewport和安全区域
    const viewport = document.querySelector('meta[name="viewport"]')
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      )
    }
    
    // 禁止页面滚动回弹
    document.body.style.overscrollBehavior = 'none'
    
    return () => {
      document.body.style.overscrollBehavior = 'auto'
    }
  }, [])

  const getPageTitle = () => {
    if (title) return title
    
    const currentNav = navigationItems.find(item => item.href === pathname)
    return currentNav?.label || 'AstroZi'
  }

  const isCurrentPage = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick()
    } else {
      window.history.back()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 微信浏览器状态栏适配 */}
      {isWechatBrowser && (
        <div className="h-safe-top bg-white" />
      )}
      
      {/* 顶部导航栏 */}
      {showHeader && (
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
          <div className="bg-white px-4 py-1 flex items-center justify-between border-b border-gray-100 relative">
            {showBackButton ? (
              <button
                onClick={handleBackClick}
                className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
            ) : (
              <button
                onClick={() => router.push('/home')}
                className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Home className="w-5 h-5 text-gray-700" />
              </button>
            )}
            
            <h1 className="text-lg font-bold text-gray-900">
              {getPageTitle()}
            </h1>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
          </div>
          
          {/* 侧边菜单 */}
          {isMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
              <div className="py-2">
                <Link
                  href="/records"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Calendar className="w-5 h-5 mr-3" />
                  我的记录
                </Link>
                <Link
                  href="/membership"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Sparkles className="w-5 h-5 mr-3" />
                  会员中心
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-5 h-5 mr-3" />
                  设置
                </Link>
              </div>
            </div>
          )}
        </header>
      )}
      
      {/* 主内容区域 */}
      <main className={cn(
        "flex-1 flex flex-col",
        showNavigation && "pb-16"
      )}>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
      
      {/* 底部导航栏 */}
      {showNavigation && (
        <nav className="mobile-bottom-nav">
          <div className="flex items-center justify-around">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = isCurrentPage(item.href)
              
              return (
                <button
                  key={item.id}
                  onClick={() => router.push(item.href)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-0 flex-1 ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs truncate">{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}

// 移动端容器组件
export function MobileContainer({ 
  children, 
  className,
  padding = true 
}: { 
  children: React.ReactNode
  className?: string
  padding?: boolean
}) {
  return (
    <div className={cn(
      "w-full max-w-md mx-auto bg-white min-h-full",
      padding && "p-4",
      className
    )}>
      {children}
    </div>
  )
}

// 移动端卡片组件
export function MobileCard({ 
  children, 
  className,
  title,
  description
}: { 
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
}) {
  return (
    <div className={cn(
      "bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden",
      className
    )}>
      {(title || description) && (
        <div className="px-4 py-3 border-b border-gray-100">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}

// 移动端按钮组
export function MobileButtonGroup({ 
  children,
  direction = 'horizontal'
}: { 
  children: React.ReactNode
  direction?: 'horizontal' | 'vertical'
}) {
  return (
    <div className={cn(
      "flex gap-3",
      direction === 'vertical' ? "flex-col" : "flex-row"
    )}>
      {children}
    </div>
  )
}

// 微信浏览器检测Hook
export function useWechatBrowser() {
  const [isWechat, setIsWechat] = useState(false)
  
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    setIsWechat(userAgent.includes('micromessenger'))
  }, [])
  
  return isWechat
} 