'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Wallet, 
  Zap, 
  TrendingUp, 
  Star, 
  Globe, 
  Shield, 
  BarChart3,
  Compass,
  Calendar,
  Gift,
  Users,
  ArrowRight,
  ExternalLink,
  Copy,
  Sparkles,
  Target,
  Bot,
  BookOpen,
  Award,
  Activity,
  Menu,
  X,
  Home,
  CreditCard,
  Settings,
  User,
  Crown,
  ChevronRight,
  Lock,
  Trophy
} from 'lucide-react'
import Logo from '@/components/Logo'
import { supabaseSessionManager } from '@/lib/services/supabase-session-manager'
import AuthGuard from '@/components/AuthGuard'
import Web3Layout from '@/components/Web3Layout'
import {useLocale} from 'next-intl'
import {assertLocale} from '@/i18n/messages'
import {buildLocaleHref} from '@/lib/i18n/routing'
import {useNamespaceTranslations} from '@/lib/i18n/useI18n'

// Note: metadata export removed due to 'use client' directive

interface Web3User {
  id: string
  wallet_address: string
  email: string
  username: string
  credits?: number
  level?: string
}

interface WalletStats {
  balance: string
  network: string
  transactions: number
  nfts: number
}

export default function Web3HomePage() {
  const router = useRouter()
  const locale = assertLocale(useLocale())
  const toLocaleHref = (path: string, hash?: string, options?: { localize?: boolean }) =>
    buildLocaleHref(locale, path, hash, options)
  const tLayout = useNamespaceTranslations('web3/layout')
  const tDashboard = useNamespaceTranslations('web3/dashboard')
  const [user, setUser] = useState<Web3User | null>(null)
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [dailyProgress, setDailyProgress] = useState(0)
  const [streak, setStreak] = useState(0)
  const missionsSnapshot = {
    daily: {
      completed: 2,
      total: 3,
      pointsToday: 25,
      remainingTasks: 1
    },
    leaderboard: {
      rank: 47,
      trend: 5
    }
  }
  const badgesSnapshot = {
    collected: 12,
    total: 24
  }
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const initializeWeb3Dashboard = async () => {
      try {
        setLoading(true)
        
        // 恢复Web3用户会话
        const web3User = await supabaseSessionManager.restoreWeb3Session()
        
        if (!web3User) {
          // 未认证，重定向到Web3认证页
          router.push(toLocaleHref('/wallet-auth'))
          return
        }

        setUser(web3User)
        
        // 模拟获取钱包统计数据
        setWalletStats({
          balance: '0.0 ETH',
          network: 'Ethereum',
          transactions: 0,
          nfts: 0
        })
        
        // 模拟每日进度和连击
        setDailyProgress(65)
        setStreak(7)

      } catch (error) {
        console.error('❌ Web3 dashboard initialization failed:', error)
        router.push(toLocaleHref('/wallet-auth'))
      } finally {
        setLoading(false)
      }
    }

    initializeWeb3Dashboard()
  }, [router])

  const copyWalletAddress = () => {
    if (user?.wallet_address) {
      navigator.clipboard.writeText(user.wallet_address)
    }
  }

  const brandGradients: Record<'primary' | 'accent', string> = {
    primary: 'from-[#3D0B5B] via-[#2B1250] to-[#1A0B38]',
    accent: 'from-[#FBCB0A] to-[#D6A108]'
  }

  const brandButtonText: Record<'primary' | 'accent', string> = {
    primary: 'text-[#FBCB0A]',
    accent: 'text-[#3D0B5B]'
  }

  const brandIconColor: Record<'primary' | 'accent', string> = {
    primary: 'text-[#FBCB0A]',
    accent: 'text-[#3D0B5B]'
  }

  const featureCards = useMemo(() => [
    {
      id: 'fortune-badges',
      title: tDashboard('features.fortuneBadges.title'),
      description: tDashboard('features.fortuneBadges.description'),
      icon: Award,
      variant: 'primary' as const,
      route: toLocaleHref('/badges', undefined, { localize: false }),
      credits: 0,
      badge: tDashboard('features.fortuneBadges.badge'),
      motto: tDashboard('features.fortuneBadges.motto')
    },
    {
      id: 'cosmic-shop',
      title: tDashboard('features.cosmicShop.title'),
      description: tDashboard('features.cosmicShop.description'),
      icon: Gift,
      variant: 'accent' as const,
      route: toLocaleHref('/shop', undefined, { localize: false }),
      credits: 0,
      badge: tDashboard('features.cosmicShop.badge'),
      motto: tDashboard('features.cosmicShop.motto')
    },
    {
      id: 'daid',
      title: tDashboard('features.daid.title'),
      description: tDashboard('features.daid.description'),
      icon: Users,
      variant: 'primary' as const,
      route: toLocaleHref('/daid', undefined, { localize: false }),
      credits: 0,
      badge: tDashboard('features.daid.badge'),
      motto: tDashboard('features.daid.motto')
    },
    {
      id: 'bazi-analysis',
      title: tDashboard('features.baziAnalysis.title'),
      description: tDashboard('features.baziAnalysis.description'),
      icon: Target,
      variant: 'accent' as const,
      route: toLocaleHref('/create-chart'),
      credits: 0,
      badge: tDashboard('features.baziAnalysis.badge'),
      motto: tDashboard('features.baziAnalysis.motto')
    },
    {
      id: 'guandi-oracle',
      title: tDashboard('features.guandiOracle.title'),
      description: tDashboard('features.guandiOracle.description'),
      icon: Compass,
      variant: 'accent' as const,
      route: toLocaleHref('/fortune'),
      credits: 0,
      badge: tDashboard('features.guandiOracle.badge'),
      motto: tDashboard('features.guandiOracle.motto')
    },
    {
      id: 'ai-chatbot',
      title: tDashboard('features.aiChatbot.title'),
      description: tDashboard('features.aiChatbot.description'),
      icon: Bot,
      variant: 'primary' as const,
      route: toLocaleHref('/chatbot'),
      credits: 0,
      badge: tDashboard('features.aiChatbot.badge'),
      motto: tDashboard('features.aiChatbot.motto')
    },
    {
      id: 'web3-rewards',
      title: tDashboard('features.web3Rewards.title'),
      description: tDashboard('features.web3Rewards.description'),
      icon: Zap,
      variant: 'accent' as const,
      route: toLocaleHref('/web3-rewards', undefined, { localize: false }),
      credits: 0,
      badge: tDashboard('features.web3Rewards.badge'),
      motto: tDashboard('features.web3Rewards.motto')
    }
  ], [locale, tDashboard])

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-b from-[#FFF4C4] via-[#FBE79B] to-[#F6D969] dark:from-[#120B2E] dark:via-[#1A103F] dark:to-[#080318] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#3D0B5B] dark:border-[#FBCB0A] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-[#333333] dark:text-[#E0E0E0] font-rajdhani">{tDashboard('loading')}</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <Web3Layout user={user}>
        {/* Fortune Hunter 欢迎区域 */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3D0B5B] via-[#2B1250] to-[#1A0B38] flex items-center justify-center mr-4">
              <Trophy className="w-8 h-8 text-[#FBCB0A]" />
            </div>
            <div>
              <h1 className="text-[3.5rem] font-bold text-[#3D0B5B] dark:text-[#FBCB0A] mb-2 font-rajdhani leading-tight">
                {tLayout('hero.title')}
              </h1>
              <p className="text-[1.5rem] text-[#3D0B5B]/70 dark:text-[#FBCB0A]/80 font-normal font-rajdhani">
                {tLayout('hero.subtitle')}
              </p>
            </div>
          </div>
          
          {/* Fortune Hunter 状态徽章 */}
          <div className="flex justify-center items-center space-x-4">
            <Badge className="bg-gradient-to-r from-[#3D0B5B] via-[#2B1250] to-[#1A0B38] text-[#FBCB0A] px-4 py-2 text-lg">
              {tLayout('status.eliteBadge')}
            </Badge>
            <Badge variant="outline" className="border-[#3D0B5B] text-[#3D0B5B] dark:border-[#FBCB0A] dark:text-[#FBCB0A] px-4 py-2">
              {tLayout('status.rankLabel', { rank: user?.rank || '???' })}
            </Badge>
            <Badge className="bg-gradient-to-r from-[#FBCB0A] to-[#D6A108] text-[#3D0B5B] px-4 py-2">
              {tLayout('status.streak', { streak })}
            </Badge>
          </div>
        </div>

          {/* Fortune Hunter 统计面板 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Cosmic Points 卡片 */}
            <Card className="bg-gradient-to-br from-[#F5EDFF] to-[#E5D5FF] dark:from-[#1B0E3A]/70 dark:to-[#12082B]/70 border-2 border-[#3D0B5B]/15 dark:border-[#3D0B5B]/40 hover:border-[#3D0B5B]/40 dark:hover:border-[#FBCB0A]/40 transition-all hover:-translate-y-1 rounded-xl shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[1.5rem]">{tDashboard('stats.score.title')}</CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3D0B5B] via-[#2B1250] to-[#1A0B38] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#FBCB0A]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A]">2,847</span>
                  <span className="text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70 text-sm">{tDashboard('stats.score.trend')}</span>
                </div>
                <p className="text-sm text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70 mt-2">{tDashboard('stats.score.subtitle')}</p>
              </CardContent>
            </Card>

            {/* Daily Streak 卡片 */}
            <Card className="bg-gradient-to-br from-[#FFF4C4] to-[#F9E28F] dark:from-[#3A2904]/60 dark:to-[#241700]/60 border-2 border-[#FBCB0A]/30 dark:border-[#FBCB0A]/40 hover:border-[#FBCB0A]/50 dark:hover:border-[#FBCB0A]/60 transition-all hover:-translate-y-1 rounded-xl shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[1.5rem]">{tDashboard('stats.streak.title')}</CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FBCB0A] to-[#D6A108] flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#3D0B5B]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A]">{streak}</span>
                  <span className="text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70">{tDashboard('status.streakLabel', { count: streak })}</span>
                </div>
                <p className="text-sm text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70 mt-2">{tDashboard('stats.streak.subtitle')}</p>
              </CardContent>
            </Card>

            {/* Leaderboard Rank 卡片 */}
            <Card className="bg-gradient-to-br from-[#FFF4C4] to-[#F9E28F] dark:from-[#3A2904]/60 dark:to-[#241700]/60 border-2 border-[#FBCB0A]/30 dark:border-[#FBCB0A]/40 hover:border-[#FBCB0A]/50 dark:hover:border-[#FBCB0A]/60 transition-all hover:-translate-y-1 rounded-xl shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[1.5rem]">{tDashboard('stats.rank.title')}</CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FBCB0A] to-[#D6A108] flex items-center justify-center">
                    <Crown className="w-5 h-5 text-[#3D0B5B]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A]">#47</span>
                  <span className="text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70 text-sm">{tDashboard('stats.rank.trend')}</span>
                </div>
                <p className="text-sm text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70 mt-2">{tDashboard('stats.rank.subtitle')}</p>
              </CardContent>
            </Card>

            {/* Badges Collected 卡片 */}
            <Card className="bg-gradient-to-br from-[#F5EDFF] to-[#E5D5FF] dark:from-[#1B0E3A]/70 dark:to-[#12082B]/70 border-2 border-[#3D0B5B]/15 dark:border-[#3D0B5B]/40 hover:border-[#3D0B5B]/40 dark:hover:border-[#FBCB0A]/40 transition-all hover:-translate-y-1 rounded-xl shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[1.5rem]">
                    {tDashboard('badgesCard.title')}
                  </CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3D0B5B] via-[#2B1250] to-[#1A0B38] flex items-center justify-center">
                    <Award className="w-5 h-5 text-[#FBCB0A]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A]">
                    {badgesSnapshot.collected}
                  </span>
                  <span className="text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70 text-sm">
                    {tDashboard('badgesCard.progress', {
                      collected: badgesSnapshot.collected,
                      total: badgesSnapshot.total
                    })}
                  </span>
                </div>
                <p className="text-sm text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70 mt-2">
                  {tDashboard('badgesCard.tagline')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Fortune Hunter 任务中心 - 按Fortune Hunter PRD设计 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Fortune Hunter 任务中心 */}
            <Card
              id="daily-tasks"
              className="bg-gradient-to-br from-[#F5EDFF] to-[#E5D5FF] dark:from-[#1B0E3A]/70 dark:to-[#12082B]/70 border-2 border-[#3D0B5B]/15 dark:border-[#3D0B5B]/40 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <CardHeader>
                <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[2rem] flex items-center">
                  <Trophy className="w-6 h-6 mr-2" />
                  {tDashboard('missionsSection.title')}
                </CardTitle>
                <CardDescription className="text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70">
                  {tDashboard('missionsSection.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 每日任务快捷链接 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-[#FFF4C4] to-[#F9E28F] dark:from-[#3A2904]/60 dark:to-[#241700]/60 border-2 border-[#FBCB0A]/30 dark:border-[#FBCB0A]/40 hover:border-[#FBCB0A]/50 dark:hover:border-[#FBCB0A]/60 transition-all cursor-pointer group" onClick={() => router.push(toLocaleHref('/tasks', undefined, { localize: false }))}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FBCB0A] to-[#D6A108] flex items-center justify-center shadow-lg">
                        <Calendar className="w-5 h-5 text-[#3D0B5B]" />
                      </div>
                      <div>
                        <p className="text-[#3D0B5B] dark:text-[#FBCB0A] font-bold font-rajdhani text-lg">
                          {tDashboard('missionsSection.cards.daily.title')}
                        </p>
                        <p className="text-xs text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70">
                          {tDashboard('missionsSection.cards.daily.subtitle', {
                            streak,
                            points: missionsSnapshot.daily.pointsToday
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-[#F6E7A3] dark:bg-[#3A2904] text-[#3D0B5B] dark:text-[#FBCB0A] font-bold">
                        {tDashboard('missionsSection.cards.daily.badge', {
                          completed: missionsSnapshot.daily.completed,
                          total: missionsSnapshot.daily.total
                        })}
                      </Badge>
                      <ChevronRight className="w-5 h-5 text-[#3D0B5B] dark:text-[#FBCB0A] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-[#F5EDFF] to-[#E5D5FF] dark:from-[#1B0E3A]/70 dark:to-[#12082B]/70 border-2 border-[#3D0B5B]/15 dark:border-[#3D0B5B]/40 hover:border-[#3D0B5B]/40 dark:hover:border-[#FBCB0A]/40 transition-all cursor-pointer group" onClick={() => router.push(toLocaleHref('/leaderboard', undefined, { localize: false }))}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3D0B5B] via-[#2B1250] to-[#1A0B38] flex items-center justify-center shadow-lg">
                        <Crown className="w-5 h-5 text-[#FBCB0A]" />
                      </div>
                      <div>
                        <p className="text-[#3D0B5B] dark:text-[#FBCB0A] font-bold font-rajdhani text-lg">
                          {tDashboard('missionsSection.cards.leaderboard.title')}
                        </p>
                        <p className="text-xs text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70">
                          {tDashboard('missionsSection.cards.leaderboard.subtitle', {
                            rank: missionsSnapshot.leaderboard.rank,
                            trend: missionsSnapshot.leaderboard.trend
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-[#E8DDFE] dark:bg-[#1B0E3A] text-[#3D0B5B] dark:text-[#FBCB0A] font-bold">
                        {tDashboard('missionsSection.cards.leaderboard.badge')}
                      </Badge>
                      <ChevronRight className="w-5 h-5 text-[#3D0B5B] dark:text-[#FBCB0A] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
                
                {/* 进度条 */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-purple-800 dark:text-purple-300 font-rajdhani">
                      {tDashboard('missionsSection.progress.title')}
                    </span>
                    <span className="text-sm text-purple-600 dark:text-purple-400 font-rajdhani">{dailyProgress}%</span>
                  </div>
                  <Progress value={dailyProgress} className="h-2" />
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-rajdhani">
                    {tDashboard('missionsSection.progress.hint', {
                      count: missionsSnapshot.daily.remainingTasks
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Fortune Hunter 成就与特权 */}
            <Card
              id="privileges"
              className="bg-gradient-to-br from-[#FFF4C4] to-[#F9E28F] dark:from-[#3A2904]/60 dark:to-[#241700]/60 border-2 border-[#FBCB0A]/30 dark:border-[#FBCB0A]/40 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <CardHeader>
                <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[2rem] flex items-center">
                  <Award className="w-6 h-6 mr-2" />
                  {tDashboard('privileges.title')}
                </CardTitle>
                <CardDescription className="text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70">
                  {tDashboard('privileges.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 最新获得的徽章 */}
                  <div className="bg-gradient-to-r from-[#FFF4C4] to-[#F9E28F] dark:from-[#3A2904]/60 dark:to-[#241700]/60 p-4 rounded-lg border-2 border-[#FBCB0A]/40 dark:border-[#FBCB0A]/50">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FBCB0A] to-[#D6A108] flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-[#3D0B5B]" />
                      </div>
                      <div>
                        <p className="font-bold text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani">
                          {tDashboard('privileges.latest.title')}
                        </p>
                        <p className="text-sm text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70">
                          {tDashboard('privileges.latest.description', { streak })}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* 特权列表 */}
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F5EDFF] dark:bg-[#1B0E3A] flex items-center justify-center mt-0.5">
                        <Shield className="w-5 h-5 text-[#3D0B5B] dark:text-[#FBCB0A]" />
                      </div>
                      <div>
                        <p className="text-[#3D0B5B] dark:text-[#FBCB0A] font-medium font-rajdhani">
                          {tDashboard('privileges.perks.multiplier.title')}
                        </p>
                        <p className="text-sm text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70 mt-1">
                          {tDashboard('privileges.perks.multiplier.description')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F5EDFF] dark:bg-[#1B0E3A] flex items-center justify-center mt-0.5">
                        <Lock className="w-5 h-5 text-[#3D0B5B] dark:text-[#FBCB0A]" />
                      </div>
                      <div>
                        <p className="text-[#3D0B5B] dark:text-[#FBCB0A] font-medium font-rajdhani">
                          {tDashboard('privileges.perks.earlyAccess.title')}
                        </p>
                        <p className="text-sm text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70 mt-1">
                          {tDashboard('privileges.perks.earlyAccess.description')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F5EDFF] dark:bg-[#1B0E3A] flex items-center justify-center mt-0.5">
                        <Star className="w-5 h-5 text-[#3D0B5B] dark:text-[#FBCB0A]" />
                      </div>
                      <div>
                        <p className="text-[#3D0B5B] dark:text-[#FBCB0A] font-medium font-rajdhani">
                          {tDashboard('privileges.perks.community.title')}
                        </p>
                        <p className="text-sm text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70 mt-1">
                          {tDashboard('privileges.perks.community.description')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fortune Hunter 特色功能: {tDashboard('fortuneSection.title')} */}
          <Card className="mb-8 bg-gradient-to-br from-[#FFF4C4] to-[#F9E28F] dark:from-[#3A2904]/60 dark:to-[#241700]/60 border-2 border-[#FBCB0A]/30 dark:border-[#FBCB0A]/40 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1" onClick={() => router.push(toLocaleHref('/fortune'))}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FBCB0A] to-[#D6A108] flex items-center justify-center shadow-lg">
                    <Compass className="w-8 h-8 text-[#3D0B5B]" />
                  </div>
                  <div>
                    <CardTitle className="text-[2.5rem] font-rajdhani font-bold text-[#3D0B5B] dark:text-[#FBCB0A]">
                      {tDashboard('fortuneSection.title')}
                    </CardTitle>
                    <CardDescription className="text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70 text-lg font-medium">
                      {tDashboard('fortuneSection.tagline')}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <Badge className="bg-[#F6E7A3] dark:bg-[#3A2904] border-[#FBCB0A]/40 dark:border-[#FBCB0A]/50 text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold px-4 py-2 text-lg">
                    {tDashboard('fortuneSection.badges.quest')}
                  </Badge>
                  <Badge variant="outline" className="border-[#3D0B5B]/40 text-[#3D0B5B] dark:border-[#FBCB0A]/50 dark:text-[#FBCB0A] font-rajdhani font-bold">
                    {tDashboard('fortuneSection.pointsBadge')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[#3D0B5B] dark:text-[#FBCB0A] text-lg leading-relaxed mb-4">
                    {tDashboard('fortuneSection.subtitle')}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="border-[#3D0B5B]/40 text-[#3D0B5B] dark:border-[#FBCB0A]/40 dark:text-[#FBCB0A]">{tDashboard('fortuneSection.badges.sacredSigns')}</Badge>
                    <Badge variant="outline" className="border-[#3D0B5B]/40 text-[#3D0B5B] dark:border-[#FBCB0A]/40 dark:text-[#FBCB0A]">{tDashboard('fortuneSection.badges.quest')}</Badge>
                    <Badge variant="outline" className="border-[#3D0B5B]/40 text-[#3D0B5B] dark:border-[#FBCB0A]/40 dark:text-[#FBCB0A]">{tDashboard('fortuneSection.badges.rewards')}</Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F5EDFF] dark:bg-[#1B0E3A] flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#3D0B5B] dark:text-[#FBCB0A]" />
                    </div>
                    <span className="text-[#3D0B5B] dark:text-[#FBCB0A] font-medium">{tDashboard('fortuneSection.highlights.daily')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F5EDFF] dark:bg-[#1B0E3A] flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-[#3D0B5B] dark:text-[#FBCB0A]" />
                    </div>
                    <span className="text-[#3D0B5B] dark:text-[#FBCB0A] font-medium">{tDashboard('fortuneSection.highlights.rewards')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F5EDFF] dark:bg-[#1B0E3A] flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#3D0B5B] dark:text-[#FBCB0A]" />
                    </div>
                    <span className="text-[#3D0B5B] dark:text-[#FBCB0A] font-medium">{tDashboard('fortuneSection.highlights.community')}</span>
                  </div>
                </div>
              </div>
              <Button 
                className="w-full mt-6 bg-gradient-to-r from-[#FBCB0A] to-[#D6A108] hover:from-[#E6B70F] hover:to-[#C79D06] text-[#3D0B5B] font-rajdhani font-bold text-lg py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {tDashboard('fortuneSection.cta')}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Fortune Hunter 功能生态 */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A] mb-2 font-rajdhani">
                {tDashboard('ecosystem.title')}
              </h2>
              <p className="text-[#333333]/70 dark:text-[#E0E0E0]/70 font-rajdhani">
                {tDashboard('ecosystem.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featureCards.slice(2).map((feature) => {
                const IconComponent = feature.icon
                const isComingSoon = feature.id === 'cosmic-shop'
                return (
                  <Card 
                    key={feature.id}
                    className="group bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 hover:border-[#3D0B5B]/40 dark:hover:border-[#FBCB0A]/40 transition-all duration-300 cursor-pointer hover:-translate-y-1 rounded-xl shadow-sm"
                    onClick={() => feature.route && router.push(feature.route)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${brandGradients[feature.variant]} flex items-center justify-center shadow-lg`}>
                          <IconComponent className={`w-6 h-6 ${brandIconColor[feature.variant]}`} />
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          {feature.badge && (
                            <Badge variant="outline" className="border-[#3D0B5B]/50 dark:border-[#FBCB0A]/50 text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani text-xs">
                              {feature.badge}
                            </Badge>
                          )}
                          {feature.motto && (
                            <span className="text-xs text-[#333333]/60 dark:text-[#E0E0E0]/60 font-rajdhani italic">
                              {feature.motto}
                            </span>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] text-[1.5rem] font-rajdhani font-bold mt-4">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[#333333]/70 dark:text-[#E0E0E0]/70 mb-6">{feature.description}</p>
                      <Button 
                        className={`w-full bg-gradient-to-r ${brandGradients[feature.variant]} ${brandButtonText[feature.variant]} hover:opacity-90 font-rajdhani font-bold transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1`}
                      >
                        {isComingSoon ? tDashboard('featureActions.comingSoon') : tDashboard('featureActions.start')}
                        {!isComingSoon && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Fortune Hunter 号召行动 */}
          <div id="quick-actions" className="text-center py-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A] mb-2 font-rajdhani">
                {tDashboard('quickActions.title')}
              </h3>
              <p className="text-[#333333]/70 dark:text-[#E0E0E0]/70 font-rajdhani">
                {tDashboard('quickActions.subtitle')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg"
                onClick={() => router.push(toLocaleHref('/tasks', undefined, { localize: false }))}
                className="bg-gradient-to-r from-[#3D0B5B] via-[#2B1250] to-[#1A0B38] text-[#FBCB0A] hover:from-[#48206F] hover:to-[#1A0B38] font-rajdhani font-bold text-lg px-8 py-6 rounded-lg transition-all hover:-translate-y-1 shadow-lg hover:shadow-xl"
              >
                <Trophy className="mr-2 w-5 h-5" />
                {tDashboard('quickActions.viewTasks')}
              </Button>
              <Button 
                size="lg"
                onClick={() => router.push(toLocaleHref('/leaderboard', undefined, { localize: false }))}
                className="bg-gradient-to-r from-[#FBCB0A] to-[#D6A108] text-[#3D0B5B] hover:from-[#E6B70F] hover:to-[#C79D06] font-rajdhani font-bold text-lg px-8 py-6 rounded-lg transition-all hover:-translate-y-1 shadow-lg hover:shadow-xl"
              >
                <Crown className="mr-2 w-5 h-5" />
                {tDashboard('quickActions.viewRewards')}
              </Button>
            </div>
            <p className="text-xs text-[#333333]/50 dark:text-[#E0E0E0]/50 mt-4 font-rajdhani">
              {tDashboard('quickActions.disclaimer')}
            </p>
          </div>
      </Web3Layout>
    </AuthGuard>
  )
}
