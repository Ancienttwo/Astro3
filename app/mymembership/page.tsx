"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Crown, 
  Star, 
  Calendar,
  MessageCircle,
  FileText,
  Zap,
  Users,
  AlertTriangle,
  CheckCircle,
  Info,
  Wallet
} from 'lucide-react'
import { fetchMembershipStatus } from '@/lib/web3-api-client'
import { AdaptiveLayout } from '@/components/layout/adaptive-layout'

interface MembershipData {
  tier: string
  expires_at?: string
  created_at: string
  is_active: boolean
  benefits: {
    daily_ai_chat: number
    monthly_ai_chat: number
    daily_reports: number
    monthly_reports: number
    advanced_features: boolean
    priority_support: boolean
    features: string[]
  }
  daysRemaining?: number
}

interface UserInfo {
  auth_type?: string
  wallet_address?: string
}

export default function MyMembershipPage() {
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [membership, setMembership] = useState<MembershipData | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMembership = async () => {
      try {
        // 检查用户是否已登录
        const currentUser = localStorage.getItem('current_user')
        const web3Auth = localStorage.getItem('web3_auth')
        
        if (!currentUser && !web3Auth) {
          // 检查Supabase认证
          const supabaseAuth = localStorage.getItem('sb-localhost-auth-token') || 
                              localStorage.getItem('sb-astrozi-auth-token')
          if (!supabaseAuth) {
            setError('请先登录')
            setLoading(false)
            return
          }
        }

        const response = await fetchMembershipStatus()
        
        if (response.success) {
          setMembership(response.data)
          setUserInfo(response.data.user_info || {})
        } else {
          setError(response.error || 'Failed to load membership status')
        }
      } catch (err: any) {
        console.error('Failed to load membership:', err)
        
        // 检查是否是Web3认证错误
        if (err.message?.includes('Web3认证会话已失效') || err.message?.includes('请重新连接钱包')) {
          // 显示友好的重连提示
          console.warn('Web3 session expired, user may need to reconnect wallet')
          setError('钱包连接已失效，请重新连接钱包后刷新页面')
        } else {
          setError(err.message || 'Failed to load membership status')
        }
      } finally {
        setLoading(false)
      }
    }

    loadMembership()
  }, [])

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium': return 'from-amber-400 to-orange-500'
      case 'free': return 'from-gray-400 to-gray-500'
      default: return 'from-blue-400 to-purple-500'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'premium': return Crown
      case 'free': return Star
      default: return Star
    }
  }

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'premium': return '高级会员'
      case 'free': return '免费会员'
      default: return '未知会员'
    }
  }

  if (loading) {
    return (
      <AdaptiveLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
        </div>
      </AdaptiveLayout>
    )
  }

  if (error) {
    return (
      <AdaptiveLayout>
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
          
          <div className="mt-4 text-center">
            <Button onClick={() => window.location.href = '/auth'}>
              前往登录
            </Button>
          </div>
        </div>
      </AdaptiveLayout>
    )
  }

  if (!membership) {
    return (
      <AdaptiveLayout>
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Alert className="border-amber-200 bg-amber-50">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              暂无会员信息
            </AlertDescription>
          </Alert>
        </div>
      </AdaptiveLayout>
    )
  }

  const TierIcon = getTierIcon(membership.tier)

  return (
    <AdaptiveLayout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            我的会员
          </h1>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span>查看您的会员权益和状态</span>
            {userInfo.auth_type === 'web3' && (
              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                <Wallet className="w-3 h-3 mr-1" />
                Web3用户
              </Badge>
            )}
          </div>
        </div>

        {/* 会员状态卡片 */}
        <Card className={`mb-6 bg-gradient-to-r ${getTierColor(membership.tier)} text-white`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <TierIcon className="h-8 w-8" />
                <div>
                  <div className="text-2xl font-bold">{getTierName(membership.tier)}</div>
                  <div className="text-sm opacity-90">
                    {membership.is_active ? '有效会员' : '已过期'}
                  </div>
                </div>
              </div>
              <Badge 
                variant={membership.is_active ? "secondary" : "destructive"}
                className={membership.is_active ? "bg-white/20 text-white border-white/30" : ""}
              >
                {membership.is_active ? '激活' : '过期'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white">
            {membership.expires_at && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm opacity-90">
                  <span>有效期至</span>
                  <span>{new Date(membership.expires_at).toLocaleDateString()}</span>
                </div>
                {membership.daysRemaining !== undefined && membership.daysRemaining > 0 && (
                  <div className="space-y-1">
                    <div className="text-sm opacity-90">剩余天数: {membership.daysRemaining}天</div>
                    <Progress 
                      value={Math.max(0, Math.min(100, (membership.daysRemaining / 30) * 100))} 
                      className="h-2 bg-white/20"
                    />
                  </div>
                )}
              </div>
            )}
            {!membership.expires_at && membership.tier === 'free' && (
              <div className="text-sm opacity-90">
                永久免费会员
              </div>
            )}
          </CardContent>
        </Card>

        {/* 使用统计 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              使用额度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">AI对话</span>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {membership.benefits.daily_ai_chat}/日
                </div>
                <div className="text-xs text-gray-500">
                  每月{membership.benefits.monthly_ai_chat}次
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">报告生成</span>
                </div>
                <div className="text-lg font-bold text-green-600">
                  {membership.benefits.daily_reports}/日
                </div>
                <div className="text-xs text-gray-500">
                  每月{membership.benefits.monthly_reports}次
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 会员权益 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-600" />
              会员权益
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {membership.benefits.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
              
              {membership.benefits.advanced_features && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">高级分析功能</span>
                </div>
              )}
              
              {membership.benefits.priority_support && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">优先客服支持</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Web3用户特殊信息 */}
        {userInfo.auth_type === 'web3' && (
          <Alert className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              <strong>Web3用户专享：</strong> 
              除了传统会员权益，您还可以通过智能合约签到获得额外积分和空投权重。
              {userInfo.wallet_address && (
                <div className="mt-1 text-xs font-mono">
                  钱包: {userInfo.wallet_address.slice(0, 6)}...{userInfo.wallet_address.slice(-4)}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* 升级提示 */}
        {membership.tier === 'free' && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Crown className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-amber-800 mb-1">
                    升级高级会员解锁更多功能
                  </div>
                  <div className="text-sm text-amber-700 mb-3">
                    获得50倍AI对话次数、100次高级报告、优先支持等权益
                  </div>
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                    立即升级
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 创建时间信息 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                会员创建时间: {new Date(membership.created_at).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="space-y-3">
          {membership.tier === 'free' && (
            <Button 
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
            >
              <Crown className="w-4 h-4 mr-2" />
              升级高级会员
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="w-full"
          >
            返回
          </Button>
        </div>
      </div>
    </AdaptiveLayout>
  )
}