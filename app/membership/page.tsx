'use client'
// @ts-expect-error next-dynamic-flag
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useI18n } from '@/hooks/useI18n'
import { getCurrentLanguage } from '@/lib/i18n/useI18n'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api-client'
import { DailyCheckinCard } from '@/components/DailyCheckinCard'
import { UsageIndicator } from '@/components/UsageIndicator'
import SmartLayout from '@/components/SmartLayout'
import { 
  Loader2, Crown, Calendar, Clock, CheckCircle, 
  Trash2, AlertTriangle, User, Database, 
  Download, Upload, RotateCcw, Shield 
} from 'lucide-react'

// 安全的图标渲染组件
const SafeIcon = ({ Icon, fallback, className }: { Icon?: any, fallback: string, className?: string }) => {
  if (Icon && typeof Icon !== 'undefined') {
    try {
      return <Icon className={className} />
    } catch (error) {
      console.warn('Icon render failed, using fallback')
    }
  }
  return <span className={className}>{fallback}</span>
}

// 专门的 Crown 图标组件
const SafeCrown = ({ className }: { className?: string }) => {
  return <SafeIcon Icon={Crown} fallback="👑" className={className} />
}

interface UserUsage {
  freeReportsLimit: number
  freeReportsUsed: number
  freeReportsRemaining: number
  paidReportsPurchased: number
  paidReportsUsed: number
  paidReportsRemaining: number
  chatbotLimit: number
  chatbotUsed: number
  chatbotRemaining: number
  lastCheckinDate?: string
  consecutiveCheckinDays: number
  totalCheckinDays: number
  hasUnlimitedAccess: boolean
  canUseService: boolean
  canUseChatbot: boolean
  createdAt: string
  updatedAt: string
  isPremiumUser?: boolean
  premiumExpiresAt?: string
}

export default function MembershipPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const language = getCurrentLanguage(pathname, searchParams)
  const isEnglish = language === 'en'
  const t = useI18n(language)
  
  const [user, setUser] = useState<any>(null)
  const [usage, setUsage] = useState<UserUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const provider = user?.app_metadata?.provider ?? user?.user_metadata?.auth_provider ?? user?.user_metadata?.auth_type
  const loginIndicator = (() => {
    switch (provider) {
      case 'walletconnect':
      case 'wallet':
      case 'web3':
        return { color: 'bg-purple-500', label: isEnglish ? 'Web3 Wallet' : 'Web3 钱包' }
      case 'privy':
        return { color: 'bg-indigo-500', label: isEnglish ? 'Privy Social Login' : 'Privy 社交登录' }
      case 'google':
        return { color: 'bg-red-500', label: isEnglish ? 'Google Account' : 'Google 账号' }
      default:
        return { color: 'bg-blue-500', label: isEnglish ? 'Legacy Email' : '旧邮箱账号' }
    }
  })()

  const handleExportData = () => {
    alert(t.membership.exportDataInProgress)
  }

  const handleImportData = () => {
    alert(t.membership.importDataInProgress)
  }

  const handleResetSettings = () => {
    if (confirm(t.membership.resetSettingsConfirm)) {
      localStorage.clear()
      alert(t.membership.settingsReset)
      window.location.reload()
    }
  }

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        setError('请先登录')
        setLoading(false)
        return
      }

      setUser(user)
      await fetchUsage(user)
    } catch (err) {
      console.error('检查用户状态失败:', err)
      setError('加载用户信息失败')
      setLoading(false)
    }
  }

  const fetchUsage = async (currentUser: any) => {
    try {
      // WalletConnect认证由apiClient自动处理
      const response = await apiClient.get('/api/user-usage')
      
      if (response.success) {
        console.log('获取到的用户使用数据:', response.data.data)
        setUsage(response.data.data)
      } else {
        setError(response.data?.error || '获取使用统计失败')
      }
    } catch (err) {
      console.error('获取使用统计失败:', err)
      setError('获取使用统计失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    const confirmText = prompt(
      `⚠️ 删除账号是不可逆操作！\n\n将删除您的所有数据：\n• 所有命盘记录\n• 所有AI分析结果\n• 用户资料和设置\n• 会员权益\n\n请输入您的邮箱地址确认删除：\n${user.email}`
    )

    if (confirmText !== user.email) {
      alert('邮箱地址不匹配，取消删除操作')
      return
    }

    setDeleteLoading(true)
    
    try {
      // WalletConnect认证由apiClient自动处理
      // 调用删除账号API  
      const response = await apiClient.delete('/api/delete-account')

      if (!response.success) {
        throw new Error(response.data?.error || '删除账号失败')
      }

      alert('账号删除成功。感谢您使用我们的服务。')
      
      // 登出并跳转到首页
      await supabase.auth.signOut()
      window.location.href = '/'
      
    } catch (err) {
      console.error('删除账号失败:', err)
      alert(`删除账号失败: ${err instanceof Error ? err.message : '未知错误'}`)
    } finally {
      setDeleteLoading(false)
    }
  }

  // 确保翻译对象已加载
  if (!t || !t.membership) {
    return (
      <SmartLayout forceLayout={isEnglish ? 'english' : undefined}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <SafeIcon Icon={Loader2} fallback="⏳" className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </SmartLayout>
    )
  }

  if (loading) {
    return (
      <SmartLayout forceLayout={isEnglish ? 'english' : undefined}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <SafeIcon Icon={Loader2} fallback="⏳" className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">{t?.membership?.loading || 'Loading...'}</p>
          </div>
        </div>
      </SmartLayout>
    )
  }

  if (error) {
    return (
      <SmartLayout forceLayout={isEnglish ? 'english' : undefined}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-destructive">{t.membership.loadingFailed}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} className="w-full">
                {t.membership.reload}
              </Button>
            </CardContent>
          </Card>
        </div>
      </SmartLayout>
    )
  }

  return (
    <SmartLayout forceLayout={isEnglish ? 'english' : undefined}>
      <div className="p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 会员状态卡片 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SafeCrown className="w-6 h-6 text-yellow-500" />
                  <CardTitle className="text-primary dark:text-yellow-400">{t.membership.membershipStatus}</CardTitle>
                </div>
                {usage?.isPremiumUser && (
                  <Badge variant="default" className="bg-yellow-500">
                    <SafeCrown className="w-3 h-3 mr-1" />
                    {t.membership.premiumMember}
                  </Badge>
                )}
              </div>
              <CardDescription>
                {user?.email} {t.membership.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {usage ? `${usage.freeReportsRemaining ?? 0}/${usage.freeReportsLimit ?? 10}` : '0/10'}
                  </div>
                  <div className="text-sm text-muted-foreground">{t.membership.freeReports}</div>
                  <div className="text-xs text-muted-foreground mt-1">当前可用/上限</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {usage ? `${usage.paidReportsRemaining ?? 0}/${usage.paidReportsPurchased ?? 0}` : '0/0'}
                  </div>
                  <div className="text-sm text-muted-foreground">{t.membership.paidReports}</div>
                  <div className="text-xs text-muted-foreground mt-1">当前可用/总购买</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {usage ? `${usage.chatbotRemaining ?? 0}/${usage.chatbotLimit ?? 30}` : '0/30'}
                  </div>
                  <div className="text-sm text-muted-foreground">{t.membership.chatbotDialogs}</div>
                  <div className="text-xs text-muted-foreground mt-1">当前可用/上限</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    0
                  </div>
                  <div className="text-sm text-muted-foreground">{t.membership.expertReports}</div>
                  <div className="text-xs text-muted-foreground mt-1">敬请期待</div>
                </div>
              </div>

              {/* 如果次数都是0，显示提示 */}
              {usage && usage.freeReportsRemaining === 0 && usage.paidReportsRemaining === 0 && usage.chatbotRemaining === 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    {t.membership.newUserTip}
                  </p>
                </div>
              )}

              {usage?.premiumExpiresAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <SafeIcon Icon={Calendar} fallback="📅" className="w-4 h-4" />
                  {t.membership.membershipExpiry}: {new Date(usage.premiumExpiresAt).toLocaleDateString()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 每日签到 */}
          <DailyCheckinCard />

          {/* 使用统计 */}
          <UsageIndicator onUpgradeClick={() => router.push('/subscription')} />

          {/* 个人资料 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <SafeIcon Icon={User} fallback="👤" className="w-5 h-5 text-primary dark:text-yellow-400" />
                <CardTitle className="text-primary dark:text-yellow-400">{t.membership.personalInfo}</CardTitle>
              </div>
              <CardDescription>
                {t.membership.personalInfoDesc}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t.membership.emailAddress}</label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <p className="text-sm font-mono">{user?.email}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{isEnglish ? 'Login Method' : '登录方式'}</label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 ${loginIndicator.color} rounded-full`}></div>
                      <span className="text-sm">{loginIndicator.label}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">注册时间</label>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <p className="text-sm">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '未知'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 数据管理 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <SafeIcon Icon={Database} fallback="💾" className="w-5 h-5 text-primary dark:text-yellow-400" />
                <CardTitle className="text-primary dark:text-yellow-400">{t.membership.accountActions}</CardTitle>
              </div>
              <CardDescription>
                {t.membership.accountActionsDesc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={handleExportData}
                >
                  <SafeIcon Icon={Download} fallback="⬇️" className="w-4 h-4" />
                  {t.membership.exportData}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={handleImportData}
                >
                  <SafeIcon Icon={Upload} fallback="⬆️" className="w-4 h-4" />
                  {t.membership.importData}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={handleResetSettings}
                >
                  <SafeIcon Icon={RotateCcw} fallback="🔄" className="w-4 h-4" />
                  {t.membership.resetSettings}
                </Button>
              </div>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <SafeIcon Icon={Shield} fallback="🛡️" className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">数据安全</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      您的所有数据都经过加密存储，我们严格遵守隐私保护法规。
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 账号操作 */}
          <Card className="border-destructive/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <SafeIcon Icon={AlertTriangle} fallback="⚠️" className="w-5 h-5 text-destructive" />
                <CardTitle className="text-destructive">危险操作</CardTitle>
              </div>
              <CardDescription>
                请谨慎操作，以下操作不可撤销
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="flex items-center gap-2"
                    disabled={deleteLoading}
                  >
                    <SafeIcon Icon={Trash2} fallback="🗑️" className="w-4 h-4" />
                    {deleteLoading ? '删除中...' : '删除账号'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                      <SafeIcon Icon={AlertTriangle} fallback="⚠️" className="w-5 h-5" />
                      确认删除账号
                    </DialogTitle>
                    <DialogDescription className="space-y-2">
                      <p>删除账号将永久删除以下数据：</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>所有命盘记录和AI分析结果</li>
                        <li>个人资料和设置</li>
                        <li>会员权益和购买记录</li>
                        <li>聊天历史和使用统计</li>
                      </ul>
                      <p className="text-destructive font-medium">此操作不可撤销！</p>
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2">
                    <Button variant="outline">
                      取消
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? (
                        <>
                          <SafeIcon Icon={Loader2} fallback="⏳" className="w-4 h-4 mr-2 animate-spin" />
                          删除中...
                        </>
                      ) : (
                        <>
                          <SafeIcon Icon={Trash2} fallback="🗑️" className="w-4 h-4 mr-2" />
                          确认删除
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </SmartLayout>
  )
} 
