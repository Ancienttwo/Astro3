'use client'

import { useState, useEffect } from 'react'
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
  const [user, setUser] = useState<Web3User | null>(null)
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [dailyProgress, setDailyProgress] = useState(0)
  const [streak, setStreak] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const initializeWeb3Dashboard = async () => {
      try {
        setLoading(true)
        
        // 恢复Web3用户会话
        const web3User = await supabaseSessionManager.restoreWeb3Session()
        
        if (!web3User) {
          // 未认证，重定向到Web3认证页
          router.push('/en/wallet-auth')
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
        router.push('/en/wallet-auth')
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

  const web3Features = [
    {
      id: 'fortune-badges',
      title: 'Fortune Badges',
      description: 'Collect rare achievement badges on your hunter journey',
      icon: Award,
      variant: 'primary' as const,
      route: '/badges',
      credits: 0,
      badge: 'Collection Game',
      motto: 'Gotta catch \'em all'
    },
    {
      id: 'cosmic-shop',
      title: 'Cosmic Shop',
      description: 'Spend Cosmic Points on exclusive Fortune Hunter items',
      icon: Gift,
      variant: 'accent' as const,
      route: '/shop',
      credits: 0,
      badge: 'Coming Soon',
      motto: 'Points for Power'
    },
    {
      id: 'daid',
      title: 'D\'aid Network',
      description: 'Elite Fortune Hunters help others - Karma cycles back with compound interest',
      icon: Users,
      variant: 'primary' as const,
      route: '/daid',
      credits: 0,
      badge: 'Elite Hunters Only',
      motto: 'Fortune shared multiplies'
    },
    {
      id: 'bazi-analysis',
      title: 'Destiny Charts',
      description: 'Create your cosmic profile - First quest for all Fortune Hunters',
      icon: Target,
      variant: 'accent' as const,
      route: '/en/create-chart',
      credits: 0,
      badge: 'Newbie Quest',
      motto: '+50 Cosmic Points'
    },
    {
      id: 'guandi-oracle',
      title: 'Oracle Quests',
      description: 'Daily fortune draws - Core activity for point farming',
      icon: Compass,
      variant: 'accent' as const,
      route: '/en/fortune',
      credits: 0,
      badge: 'Daily Quest',
      motto: '+15 Points/Day'
    },
    {
      id: 'ai-chatbot',
      title: 'Fortune AI Sage',
      description: 'Chat with AI for personalized Fortune Hunter guidance',
      icon: Bot,
      variant: 'primary' as const,
      route: '/en/chatbot',
      credits: 0,
      badge: 'AI Powered',
      motto: 'Wisdom + Tech'
    },
    {
      id: 'web3-rewards',
      title: 'Airdrop Portal',
      description: 'Your Cosmic Points = Future token allocation weight',
      icon: Zap,
      variant: 'accent' as const,
      route: '/web3-rewards',
      credits: 0,
      badge: 'Token Economy',
      motto: 'HODL Points = HODL Wealth'
    }
  ]

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-b from-[#FFF4C4] via-[#FBE79B] to-[#F6D969] dark:from-[#120B2E] dark:via-[#1A103F] dark:to-[#080318] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#3D0B5B] dark:border-[#FBCB0A] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-[#333333] dark:text-[#E0E0E0] font-rajdhani">Loading Web3 Dashboard...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  const navItems = [
    { icon: Home, label: 'Dashboard', href: '/web3', active: true },
    { icon: Gift, label: 'Rewards', href: '/web3-rewards' },
    { icon: CreditCard, label: 'Credits', href: '/web3-credits' },
    { icon: User, label: 'Profile', href: '/web3-profile' },
    { icon: Settings, label: 'Settings', href: '/settings' }
  ]

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
                Fortune Hunter Dashboard
              </h1>
              <p className="text-[1.5rem] text-[#3D0B5B]/70 dark:text-[#FBCB0A]/80 font-normal font-rajdhani">
                Your cosmic journey to Web3 mastery
              </p>
            </div>
          </div>
          
          {/* Fortune Hunter 状态徽章 */}
          <div className="flex justify-center items-center space-x-4">
            <Badge className="bg-gradient-to-r from-[#3D0B5B] via-[#2B1250] to-[#1A0B38] text-[#FBCB0A] px-4 py-2 text-lg">
              Elite Fortune Hunter
            </Badge>
            <Badge variant="outline" className="border-[#3D0B5B] text-[#3D0B5B] dark:border-[#FBCB0A] dark:text-[#FBCB0A] px-4 py-2">
              Rank #{user?.rank || '???'}
            </Badge>
            <Badge className="bg-gradient-to-r from-[#FBCB0A] to-[#D6A108] text-[#3D0B5B] px-4 py-2">
              🔥 {streak} Day Streak
            </Badge>
          </div>
        </div>

          {/* Fortune Hunter 统计面板 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Cosmic Points 卡片 */}
            <Card className="bg-gradient-to-br from-[#F5EDFF] to-[#E5D5FF] dark:from-[#1B0E3A]/70 dark:to-[#12082B]/70 border-2 border-[#3D0B5B]/15 dark:border-[#3D0B5B]/40 hover:border-[#3D0B5B]/40 dark:hover:border-[#FBCB0A]/40 transition-all hover:-translate-y-1 rounded-xl shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[1.5rem]">Cosmic Points</CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3D0B5B] via-[#2B1250] to-[#1A0B38] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#FBCB0A]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A]">2,847</span>
                  <span className="text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70 text-sm">+125 today</span>
                </div>
                <p className="text-sm text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70 mt-2">Fortune Hunter Score</p>
              </CardContent>
            </Card>

            {/* Daily Streak 卡片 */}
            <Card className="bg-gradient-to-br from-[#FFF4C4] to-[#F9E28F] dark:from-[#3A2904]/60 dark:to-[#241700]/60 border-2 border-[#FBCB0A]/30 dark:border-[#FBCB0A]/40 hover:border-[#FBCB0A]/50 dark:hover:border-[#FBCB0A]/60 transition-all hover:-translate-y-1 rounded-xl shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[1.5rem]">Daily Streak</CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FBCB0A] to-[#D6A108] flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#3D0B5B]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A]">{streak}</span>
                  <span className="text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70">days</span>
                </div>
                <p className="text-sm text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70 mt-2">🔥 On fire! Next milestone: 30</p>
              </CardContent>
            </Card>

            {/* Leaderboard Rank 卡片 */}
            <Card className="bg-gradient-to-br from-[#FFF4C4] to-[#F9E28F] dark:from-[#3A2904]/60 dark:to-[#241700]/60 border-2 border-[#FBCB0A]/30 dark:border-[#FBCB0A]/40 hover:border-[#FBCB0A]/50 dark:hover:border-[#FBCB0A]/60 transition-all hover:-translate-y-1 rounded-xl shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[1.5rem]">Rank</CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FBCB0A] to-[#D6A108] flex items-center justify-center">
                    <Crown className="w-5 h-5 text-[#3D0B5B]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A]">#47</span>
                  <span className="text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70 text-sm">↗ +5</span>
                </div>
                <p className="text-sm text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70 mt-2">Top 5% Fortune Hunters</p>
              </CardContent>
            </Card>

            {/* Badges Collected 卡片 */}
            <Card className="bg-gradient-to-br from-[#F5EDFF] to-[#E5D5FF] dark:from-[#1B0E3A]/70 dark:to-[#12082B]/70 border-2 border-[#3D0B5B]/15 dark:border-[#3D0B5B]/40 hover:border-[#3D0B5B]/40 dark:hover:border-[#FBCB0A]/40 transition-all hover:-translate-y-1 rounded-xl shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[1.5rem]">Badges</CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3D0B5B] via-[#2B1250] to-[#1A0B38] flex items-center justify-center">
                    <Award className="w-5 h-5 text-[#FBCB0A]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A]">12</span>
                  <span className="text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70 text-sm">/24 collected</span>
                </div>
                <p className="text-sm text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70 mt-2">Achievement Hunter</p>
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
                  Fortune Hunter Missions
                </CardTitle>
                <CardDescription className="text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70">
                  Complete daily quests and epic challenges to earn Cosmic Points
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 每日任务快捷链接 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-[#FFF4C4] to-[#F9E28F] dark:from-[#3A2904]/60 dark:to-[#241700]/60 border-2 border-[#FBCB0A]/30 dark:border-[#FBCB0A]/40 hover:border-[#FBCB0A]/50 dark:hover:border-[#FBCB0A]/60 transition-all cursor-pointer group" onClick={() => router.push('/tasks')}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FBCB0A] to-[#D6A108] flex items-center justify-center shadow-lg">
                        <Calendar className="w-5 h-5 text-[#3D0B5B]" />
                      </div>
                      <div>
                        <p className="text-[#3D0B5B] dark:text-[#FBCB0A] font-bold font-rajdhani text-lg">Daily Quests</p>
                        <p className="text-xs text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70">🔥 Streak: {streak} days • +25 points today</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-[#F6E7A3] dark:bg-[#3A2904] text-[#3D0B5B] dark:text-[#FBCB0A] font-bold">2/3</Badge>
                      <ChevronRight className="w-5 h-5 text-[#3D0B5B] dark:text-[#FBCB0A] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-[#F5EDFF] to-[#E5D5FF] dark:from-[#1B0E3A]/70 dark:to-[#12082B]/70 border-2 border-[#3D0B5B]/15 dark:border-[#3D0B5B]/40 hover:border-[#3D0B5B]/40 dark:hover:border-[#FBCB0A]/40 transition-all cursor-pointer group" onClick={() => router.push('/leaderboard')}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3D0B5B] via-[#2B1250] to-[#1A0B38] flex items-center justify-center shadow-lg">
                        <Crown className="w-5 h-5 text-[#FBCB0A]" />
                      </div>
                      <div>
                        <p className="text-[#3D0B5B] dark:text-[#FBCB0A] font-bold font-rajdhani text-lg">Leaderboard</p>
                        <p className="text-xs text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70">Your rank: #47 • ↗ Rising +5</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-[#E8DDFE] dark:bg-[#1B0E3A] text-[#3D0B5B] dark:text-[#FBCB0A] font-bold">Top 5%</Badge>
                      <ChevronRight className="w-5 h-5 text-[#3D0B5B] dark:text-[#FBCB0A] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
                
                {/* 进度条 */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-purple-800 dark:text-purple-300 font-rajdhani">Today's Progress</span>
                    <span className="text-sm text-purple-600 dark:text-purple-400 font-rajdhani">{dailyProgress}%</span>
                  </div>
                  <Progress value={dailyProgress} className="h-2" />
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-rajdhani">Complete 1 more task to reach Elite status today!</p>
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
                  Elite Hunter Privileges
                </CardTitle>
                <CardDescription className="text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70">
                  Exclusive benefits and achievements unlocked
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
                        <p className="font-bold text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani">Latest Achievement</p>
                        <p className="text-sm text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70">Streak Master • 7-day streak completed!</p>
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
                        <p className="text-[#3D0B5B] dark:text-[#FBCB0A] font-medium font-rajdhani">2x Cosmic Points Multiplier</p>
                        <p className="text-sm text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70 mt-1">
                          Elite status grants double rewards on all activities
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F5EDFF] dark:bg-[#1B0E3A] flex items-center justify-center mt-0.5">
                        <Lock className="w-5 h-5 text-[#3D0B5B] dark:text-[#FBCB0A]" />
                      </div>
                      <div>
                        <p className="text-[#3D0B5B] dark:text-[#FBCB0A] font-medium font-rajdhani">Early Access Features</p>
                        <p className="text-sm text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70 mt-1">
                          Beta access to new Fortune Hunter features
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F5EDFF] dark:bg-[#1B0E3A] flex items-center justify-center mt-0.5">
                        <Star className="w-5 h-5 text-[#3D0B5B] dark:text-[#FBCB0A]" />
                      </div>
                      <div>
                        <p className="text-[#3D0B5B] dark:text-[#FBCB0A] font-medium font-rajdhani">Exclusive Community Channel</p>
                        <p className="text-sm text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70 mt-1">
                          Access to Elite Fortune Hunter Discord channel
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fortune Hunter 特色功能: Guan Di Oracle */}
          <Card className="mb-8 bg-gradient-to-br from-[#FFF4C4] to-[#F9E28F] dark:from-[#3A2904]/60 dark:to-[#241700]/60 border-2 border-[#FBCB0A]/30 dark:border-[#FBCB0A]/40 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1" onClick={() => router.push('/en/fortune')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FBCB0A] to-[#D6A108] flex items-center justify-center shadow-lg">
                    <Compass className="w-8 h-8 text-[#3D0B5B]" />
                  </div>
                  <div>
                    <CardTitle className="text-[2.5rem] font-rajdhani font-bold text-[#3D0B5B] dark:text-[#FBCB0A]">
                      Guan Di Oracle
                    </CardTitle>
                    <CardDescription className="text-[#3D0B5B]/70 dark:text-[#FBCB0A]/70 text-lg font-medium">
                      🏛️ Sacred Fortune Hunter divination • Daily +15 Cosmic Points
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <Badge className="bg-[#F6E7A3] dark:bg-[#3A2904] border-[#FBCB0A]/40 dark:border-[#FBCB0A]/50 text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold px-4 py-2 text-lg">
                    Daily Quest
                  </Badge>
                  <Badge variant="outline" className="border-[#3D0B5B]/40 text-[#3D0B5B] dark:border-[#FBCB0A]/50 dark:text-[#FBCB0A] font-rajdhani font-bold">
                    +15 Points
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[#3D0B5B] dark:text-[#FBCB0A] text-lg leading-relaxed mb-4">
                    Connect with the divine wisdom of Guan Yu, the legendary warrior deity. 
                    Complete your daily Fortune Draw to earn Cosmic Points and unlock ancient wisdom.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="border-[#3D0B5B]/40 text-[#3D0B5B] dark:border-[#FBCB0A]/40 dark:text-[#FBCB0A]">100 Sacred Signs</Badge>
                    <Badge variant="outline" className="border-[#3D0B5B]/40 text-[#3D0B5B] dark:border-[#FBCB0A]/40 dark:text-[#FBCB0A]">Fortune Hunter Quest</Badge>
                    <Badge variant="outline" className="border-[#3D0B5B]/40 text-[#3D0B5B] dark:border-[#FBCB0A]/40 dark:text-[#FBCB0A]">Daily Rewards</Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F5EDFF] dark:bg-[#1B0E3A] flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#3D0B5B] dark:text-[#FBCB0A]" />
                    </div>
                    <span className="text-[#3D0B5B] dark:text-[#FBCB0A] font-medium">Daily Quest Available</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F5EDFF] dark:bg-[#1B0E3A] flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-[#3D0B5B] dark:text-[#FBCB0A]" />
                    </div>
                    <span className="text-[#3D0B5B] dark:text-[#FBCB0A] font-medium">Cosmic Points Rewards</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F5EDFF] dark:bg-[#1B0E3A] flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#3D0B5B] dark:text-[#FBCB0A]" />
                    </div>
                    <span className="text-[#3D0B5B] dark:text-[#FBCB0A] font-medium">Community Sharing</span>
                  </div>
                </div>
              </div>
              <Button 
                className="w-full mt-6 bg-gradient-to-r from-[#FBCB0A] to-[#D6A108] hover:from-[#E6B70F] hover:to-[#C79D06] text-[#3D0B5B] font-rajdhani font-bold text-lg py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Complete Daily Fortune Quest
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Fortune Hunter 功能生态 */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A] mb-2 font-rajdhani">
                Fortune Hunter Ecosystem
              </h2>
              <p className="text-[#333333]/70 dark:text-[#E0E0E0]/70 font-rajdhani">
                Explore all the ways to earn Cosmic Points and build your legacy
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {web3Features.slice(2).map((feature) => {
                const IconComponent = feature.icon
                return (
                  <Card 
                    key={feature.id}
                    className="group bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 hover:border-[#3D0B5B]/40 dark:hover:border-[#FBCB0A]/40 transition-all duration-300 cursor-pointer hover:-translate-y-1 rounded-xl shadow-sm"
                    onClick={() => router.push(feature.route)}
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
                        {feature.badge === 'Coming Soon' ? 'Coming Soon' : 'Start Quest'}
                        {feature.badge !== 'Coming Soon' && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
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
                Ready to Level Up Your Fortune?
              </h3>
              <p className="text-[#333333]/70 dark:text-[#E0E0E0]/70 font-rajdhani">
                Join thousands of Fortune Hunters earning Cosmic Points daily
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg"
                onClick={() => router.push('/tasks')}
                className="bg-gradient-to-r from-[#3D0B5B] via-[#2B1250] to-[#1A0B38] text-[#FBCB0A] hover:from-[#48206F] hover:to-[#1A0B38] font-rajdhani font-bold text-lg px-8 py-6 rounded-lg transition-all hover:-translate-y-1 shadow-lg hover:shadow-xl"
              >
                <Trophy className="mr-2 w-5 h-5" />
                Start Daily Quests
              </Button>
              <Button 
                size="lg"
                onClick={() => router.push('/leaderboard')}
                className="bg-gradient-to-r from-[#FBCB0A] to-[#D6A108] text-[#3D0B5B] hover:from-[#E6B70F] hover:to-[#C79D06] font-rajdhani font-bold text-lg px-8 py-6 rounded-lg transition-all hover:-translate-y-1 shadow-lg hover:shadow-xl"
              >
                <Crown className="mr-2 w-5 h-5" />
                Check Rankings
              </Button>
            </div>
            <p className="text-xs text-[#333333]/50 dark:text-[#E0E0E0]/50 mt-4 font-rajdhani">
              ✨ Every Cosmic Point counts towards your future airdrop allocation
            </p>
          </div>
      </Web3Layout>
    </AuthGuard>
  )
}
