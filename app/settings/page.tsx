'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Crown,
  CreditCard,
  Palette,
  HelpCircle,
  LogOut,
  ChevronRight,
  User,
  Mail,
  Settings as SettingsIcon,
  Shield,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import AuthGuard from '@/components/AuthGuard'
import SmartLayout from '@/components/SmartLayout'
import { supabase } from '@/lib/supabase'
import { useI18n } from '@/hooks/useI18n'
import { getLanguage } from '@/lib/utils/language'
import { apiClient } from '@/lib/api-client'

// 🎯 类型定义
interface SettingsItem {
  id: string
  name: string
  href: string
  icon: React.ComponentType<any>
  description: string
  category: 'account' | 'services' | 'support' | 'system'
  badge?: {
    text: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
  }
}

interface UserInfo {
  id: string
  email: string
  nickname?: string
  profile_complete?: boolean
  membership_level?: 'free' | 'premium' | 'vip'
}

export default function SettingsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)

  // 获取当前语言环境 - 同时检查路径和查询参数
  const langParam = searchParams.get('lang')
  const isEnglish = pathname.startsWith('/en') || langParam === 'en'
  const language = isEnglish ? 'en' : 'zh'
  const t = useI18n(language)

  // 🎨 设置项配置 - 分类组织
  const settingsCategories = [
    {
      title: t.settings.accountManagement,
      category: 'account' as const,
      items: [
        {
          id: 'profile',
          name: t.settings.myProfile,
          href: isEnglish ? '/en/settings/profile' : '/settings/profile',
          icon: User,
          description: t.settings.manageBirthInfo,
          category: 'account' as const
        },
        {
          id: 'preferences',
          name: t.settings.preferences,
          href: isEnglish ? '/en/preferences' : '/preferences',
          icon: Palette,
          description: t.settings.personalizeExperience,
          category: 'account' as const
        }
      ]
    },
    {
      title: t.settings.serviceSubscription,
      category: 'services' as const,
      items: [
        {
          id: 'membership',
          name: t.settings.membershipCenter,
          href: isEnglish ? '/en/membership' : '/membership',
          icon: Crown,
          description: t.settings.viewMembershipStatus,
          category: 'services' as const,
          badge: userInfo?.membership_level === 'free' 
            ? { text: t.settings.freeVersion, variant: 'secondary' as const }
            : { text: t.settings.member, variant: 'default' as const }
        },
        {
          id: 'subscription',
          name: t.settings.subscriptionService,
          href: isEnglish ? '/en/subscription' : '/subscription',
          icon: CreditCard,
          description: t.settings.manageSubscription,
          category: 'services' as const
        }
      ]
    },
    {
      title: t.settings.helpSupport,
      category: 'support' as const,
      items: [
        {
          id: 'help',
          name: t.settings.helpCenter,
          href: isEnglish ? '/en/help-center' : '/help-center',
          icon: HelpCircle,
          description: t.settings.faqGuide,
          category: 'support' as const
        }
      ]
    },
    {
      title: t.settings.systemSettings,
      category: 'system' as const,
      items: [
        {
          id: 'logout',
          name: t.settings.logout,
          href: '#logout',
          icon: LogOut,
          description: t.settings.secureLogout,
          category: 'system' as const
        }
      ]
    }
  ]

  // 🔄 获取用户信息
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // WalletConnect认证由apiClient自动处理
        // 获取用户档案信息
        const response = await apiClient.get('/api/user/profile')

        if (response.success) {
          const profileData = response.data?.profile || {};
          setUserInfo({
            id: profileData.id || 'unknown',
            email: profileData.email || '',
            nickname: profileData.nickname,
            profile_complete: profileData.profile_complete,
            membership_level: 'free' // 默认免费版，可以从API获取
          })
        } else {
          // 如果获取档案失败，设置默认用户信息
          setUserInfo({
            id: 'unknown',
            email: '',
            membership_level: 'free'
          })
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
  }, [])

  // 🎯 处理设置项点击
  const handleItemClick = async (item: SettingsItem) => {
    if (item.id === 'logout') {
      await handleLogout()
    } else if (item.href.startsWith('#')) {
      console.log('处理锚点:', item.href)
    } else {
      router.push(item.href)
    }
  }

  // 🚪 登出处理
  const handleLogout = async () => {
    const confirmed = window.confirm('确定要退出登录吗？')
    if (!confirmed) return

    setLoggingOut(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('登出失败:', error)
        alert('登出失败，请重试')
      } else {
        // 清理本地状态
        setUserInfo(null)
        // 跳转到首页
        router.push('/')
      }
    } catch (error) {
      console.error('登出过程中发生错误:', error)
      alert('登出失败，请重试')
    } finally {
      setLoggingOut(false)
    }
  }

  if (loading) {
    const LayoutComponent = SmartLayout
    return (
      <AuthGuard>
        <LayoutComponent>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </LayoutComponent>
      </AuthGuard>
    )
  }

  const LayoutComponent = isEnglish ? EnglishLayout : AdaptiveLayout

  return (
    <AuthGuard>
      <LayoutComponent>
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          {/* 页面标题 */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <SettingsIcon className="h-8 w-8 text-purple-600" />
              {t.pages.settings.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t.pages.settings.subtitle}
            </p>
          </div>

          {/* 用户信息卡片 */}
          {userInfo && (
            <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-purple-600" />
                  {isEnglish ? 'Account Overview' : '账户概览'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* 基本信息 */}
                  <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {userInfo.nickname || '未设置昵称'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {userInfo.email}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={userInfo.profile_complete ? "default" : "secondary"}
                      className={userInfo.profile_complete ? "bg-green-100 text-green-800 border-green-200" : ""}
                    >
                      {userInfo.profile_complete ? '已激活' : '待完善'}
                    </Badge>
                  </div>

                  {/* 会员状态 */}
                  <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Crown className="h-5 w-5 text-amber-500" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          会员等级
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          享受专属权益和服务
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-white/50">
                      {userInfo.membership_level === 'free' ? '免费版' : '会员'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 档案完善提醒 */}
          {userInfo && !userInfo.profile_complete && (
            <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                <strong>提醒：</strong> 您的档案尚未完善，
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-amber-700 dark:text-amber-300 underline"
                  onClick={() => router.push('/profile')}
                >
                  完善档案信息
                </Button>
                后可享受更精准的分析服务。
              </AlertDescription>
            </Alert>
          )}

          {/* 设置分类 */}
          <div className="space-y-6">
            {settingsCategories.map((category) => (
              <div key={category.category}>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  {category.title}
                </h2>
                
                <div className="space-y-2">
                  {category.items.map((item) => {
                    const Icon = item.icon
                    const isLogout = item.id === 'logout'
                    
                    return (
                      <Card 
                        key={item.id}
                        className={`cursor-pointer hover:shadow-sm transition-all duration-200 hover:bg-accent/5 border-gray-100 ${
                          isLogout ? 'hover:border-red-200 hover:bg-red-50/50' : ''
                        }`}
                        onClick={() => handleItemClick(item)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Icon className={`w-5 h-5 ${
                                isLogout ? 'text-red-500' : 'text-primary dark:text-yellow-400'
                              }`} />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className={`font-medium text-sm ${
                                    isLogout ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                                  }`}>
                                    {loggingOut && isLogout ? '正在退出...' : item.name}
                                  </h3>
                                  {item.badge && (
                                    <Badge variant={item.badge.variant} className="text-xs">
                                      {item.badge.text}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className={`w-4 h-4 ${
                              isLogout ? 'text-red-400' : 'text-muted-foreground'
                            }`} />
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
                
                {category.category !== 'system' && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>

          {/* 版本信息 */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              星玺命理 v1.0.0 | 
              <Button 
                variant="link" 
                className="p-0 h-auto text-xs text-gray-500 dark:text-gray-400"
                onClick={() => router.push('/help-center')}
              >
                联系客服
              </Button>
            </p>
          </div>
        </div>
      </LayoutComponent>
    </AuthGuard>
  )
} 