'use client'

import { useState, useEffect, ReactNode, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MOBILE_APP_BOTTOM_NAV_ITEMS } from '@/lib/navigation'
import { 
  Home, 
  Calendar, 
  MessageCircle, 
  User,
  Menu,
  X,
  ChevronLeft,
  Settings,
  Crown,
  HelpCircle,
  BookOpen,
  Compass,
  Bot,
  ArrowLeft,
  Target,
  SunMoon,
  Book
} from 'lucide-react'
import { useDailyCheckin } from '@/hooks/useDailyCheckin'

interface MobileAppLayoutProps {
  children: ReactNode
  showHeader?: boolean
  showNavigation?: boolean
  title?: string
  showBackButton?: boolean
  onBackClick?: () => void
  className?: string
}

// 使用统一的底部导航配置
const bottomNavItems = MOBILE_APP_BOTTOM_NAV_ITEMS

const sideMenuItems = [
  {
    id: 'records',
    label: '我的档案',
    href: '/records',
    icon: Calendar,
    description: '查看个人命理档案'
  },
  {
    id: 'chat',
    label: '智能对话',
    href: '/chat',
    icon: MessageCircle,
    description: '与AI大师对话'
  },
  {
    id: 'settings',
    label: '个人设置',
    href: '/settings',
    icon: Settings,
    description: '管理个人偏好'
  },
  {
    id: 'premium',
    label: '会员服务',
    href: '/premium',
    icon: Crown,
    description: '升级会员享受更多功能'
  },
  {
    id: 'help',
    label: '帮助中心',
    href: '/help',
    icon: HelpCircle,
    description: '获取使用帮助'
  }
]

export default function MobileAppLayout({
  children,
  showHeader = true,
  showNavigation = true,
  title = 'AstroZi 星玺',
  showBackButton = true,
  onBackClick,
  className
}: MobileAppLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const { canCheckin, performCheckin } = useDailyCheckin()
  const menuRef = useRef<HTMLDivElement>(null)

  // 处理点击外部关闭菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [menuRef])

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick()
    } else {
      router.back()
    }
  }

  const isCurrentPage = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div className={cn('min-h-screen bg-gray-50 flex flex-col', className)}>
      {/* 顶部导航栏 */}
      {showHeader && (
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50 safe-top">
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
              {title}
            </h1>
            
            {/* 右侧菜单图标 */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </button>
              
              {/* 下拉菜单 */}
              {showMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">
                  <button
                    onClick={() => { 
                      router.push('/bazi')
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 transition-colors flex items-center"
                  >
                    <Compass className="w-4 h-4 mr-3" />
                    八字分析
                  </button>
                  <button
                    onClick={() => { 
                      router.push('/ziwei')
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 transition-colors flex items-center"
                  >
                    <SunMoon className="w-4 h-4 mr-3" />
                    紫微斗数
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => { 
                      router.push('/create-chart')
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 transition-colors flex items-center"
                  >
                    <Target className="w-4 h-4 mr-3" />
                    排盘
                  </button>
                  <button
                    onClick={() => { 
                      if (canCheckin) performCheckin()
                      setShowMenu(false)
                    }}
                    disabled={!canCheckin}
                    className={`w-full px-4 py-2 text-left transition-colors flex items-center ${
                      canCheckin 
                        ? 'hover:bg-gray-100 text-gray-700' 
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Book className="w-4 h-4 mr-3" />
                    每日签到
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => { 
                      router.push('/home')
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 transition-colors flex items-center"
                  >
                    <Home className="w-4 h-4 mr-3" />
                    回到首页
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* 主要内容区域 */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* 底部导航栏 */}
      {showNavigation && (
        <nav className="mobile-bottom-nav">
          <div className="flex items-center justify-around">
            {bottomNavItems.map((item) => {
              const Icon = item.icon
              const isActive = isCurrentPage(item.href)
              
              return (
                <button
                  key={item.id}
                  onClick={() => router.push(item.href)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors min-w-0 flex-1"
                >
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="text-xs text-gray-600 truncate">{item.label}</span>
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
  children: ReactNode
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
  description,
  onClick
}: { 
  children: ReactNode
  className?: string
  title?: string
  description?: string
  onClick?: () => void
}) {
  return (
    <div 
      className={cn(
        "bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden",
        onClick && "cursor-pointer hover:shadow-md active:scale-98 transition-all duration-200",
        className
      )}
      onClick={onClick}
    >
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
  children: ReactNode
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

// 移动端页面标题组件
export function MobilePageHeader({
  title,
  subtitle,
  action,
  className
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("px-4 py-6 bg-white border-b border-gray-200", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  )
} 