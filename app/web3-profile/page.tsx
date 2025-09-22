'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Zap, 
  Trophy, 
  Star, 
  Wallet, 
  Calendar,
  Gift,
  TrendingUp,
  Award,
  Crown,
  Copy,
  ExternalLink,
  Settings,
  Shield,
  Activity,
  Target,
  Sparkles,
  Scroll
} from 'lucide-react'
import Image from 'next/image'
import { supabaseSessionManager } from '@/lib/services/supabase-session-manager'
import AuthGuard from '@/components/AuthGuard'
import Web3Layout from '@/components/Web3Layout'
import FortuneGallery from '@/components/web3/FortuneGallery'

interface Web3User {
  id: string
  wallet_address: string
  email: string
  username: string
  credits?: number
  level?: string
  xp?: number
  next_level_xp?: number
}

interface UserStats {
  total_analyses: number
  streak_days: number
  nfts_collected: number
  rewards_earned: number
  referrals_made: number
  membership_level: string
}

export default function Web3ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<Web3User | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeProfile = async () => {
      try {
        setLoading(true)
        
        // 恢复Web3用户会话
        const web3User = await supabaseSessionManager.restoreWeb3Session()
        
        if (!web3User) {
          router.push('/en/login')
          return
        }

        setUser({
          ...web3User,
          credits: web3User.credits || 150,
          level: web3User.level || 'Apprentice',
          xp: 1250,
          next_level_xp: 2000
        })
        
        // 模拟用户统计数据
        setStats({
          total_analyses: 23,
          streak_days: 7,
          nfts_collected: 5,
          rewards_earned: 450,
          referrals_made: 3,
          membership_level: 'Silver'
        })

      } catch (error) {
        console.error('❌ Profile initialization failed:', error)
        router.push('/en/login')
      } finally {
        setLoading(false)
      }
    }

    initializeProfile()
  }, [router])

  const copyWalletAddress = () => {
    if (user?.wallet_address) {
      navigator.clipboard.writeText(user.wallet_address)
    }
  }

  const levelProgress = user ? ((user.xp || 0) / (user.next_level_xp || 1)) * 100 : 0

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-b from-[#FFFFFF] to-[#F8F9FA] dark:from-[#1A2242] dark:via-[#252D47] dark:to-[#1A2242] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#3D0B5B] dark:border-[#FBCB0A] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-[#333333] dark:text-[#E0E0E0] font-rajdhani">Loading Profile...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <Web3Layout user={user}>
        {/* 个人信息头部 */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-[3rem] font-bold text-[#3D0B5B] dark:text-[#FBCB0A] mb-2 font-rajdhani leading-tight">
              Web3 Profile
            </h1>
            <p className="text-[1.25rem] text-[#333333] dark:text-[#E0E0E0] font-normal font-rajdhani">
              Your decentralized identity and achievements
            </p>
          </div>

          {/* 钱包信息卡 */}
          <Card className="bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 rounded-xl shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[2rem] flex items-center">
                <Image src="/bnbchain_logo.png" alt="BNB Chain" width={32} height={32} className="w-8 h-8 mr-3" />
                Connected Wallet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-[#FBCB0A]/5 dark:bg-black/20 border border-[#3D0B5B]/10 dark:border-[#FBCB0A]/10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#FBCB0A] flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-[#3D0B5B]" />
                  </div>
                  <div>
                    <p className="text-[#333333] dark:text-[#E0E0E0] font-medium font-rajdhani">Wallet Address</p>
                    <code className="text-sm text-[#333333]/60 dark:text-[#E0E0E0]/60 font-mono">
                      {user?.wallet_address ? `${user.wallet_address.slice(0, 12)}...${user.wallet_address.slice(-8)}` : 'Not connected'}
                    </code>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyWalletAddress}
                  className="text-[#3D0B5B] dark:text-[#FBCB0A] hover:bg-[#FBCB0A]/10"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 核心统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 积分卡片 */}
          <Card className="bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 hover:border-[#3D0B5B]/40 dark:hover:border-[#FBCB0A]/40 transition-all hover:-translate-y-1 rounded-xl shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[1.5rem]">Credits</CardTitle>
                <div className="w-10 h-10 rounded-lg bg-[#FBCB0A] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#3D0B5B]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-[#333333] dark:text-[#E0E0E0]">{user?.credits || 0}</span>
                <span className="text-[#333333]/60 dark:text-[#E0E0E0]/60">tokens</span>
              </div>
              <p className="text-sm text-[#333333]/60 dark:text-[#E0E0E0]/60 mt-2">Available for analysis</p>
            </CardContent>
          </Card>

          {/* 等级卡片 */}
          <Card className="bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 hover:border-[#3D0B5B]/40 dark:hover:border-[#FBCB0A]/40 transition-all hover:-translate-y-1 rounded-xl shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[1.5rem]">Level</CardTitle>
                <div className="w-10 h-10 rounded-lg bg-[#FBCB0A] flex items-center justify-center">
                  <Crown className="w-5 h-5 text-[#3D0B5B]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-[#333333] dark:text-[#E0E0E0]">{user?.level}</span>
              </div>
              <Progress value={levelProgress} className="mt-2 h-2" />
              <p className="text-sm text-[#333333]/60 dark:text-[#E0E0E0]/60 mt-2">
                {user?.xp || 0} / {user?.next_level_xp || 0} XP
              </p>
            </CardContent>
          </Card>

          {/* NFT收藏卡片 */}
          <Card className="bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 hover:border-[#3D0B5B]/40 dark:hover:border-[#FBCB0A]/40 transition-all hover:-translate-y-1 rounded-xl shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[1.5rem]">NFTs</CardTitle>
                <div className="w-10 h-10 rounded-lg bg-[#FBCB0A] flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-[#3D0B5B]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-[#333333] dark:text-[#E0E0E0]">{stats?.nfts_collected || 0}</span>
                <span className="text-[#333333]/60 dark:text-[#E0E0E0]/60">badges</span>
              </div>
              <p className="text-sm text-[#333333]/60 dark:text-[#E0E0E0]/60 mt-2">Achievement NFTs</p>
            </CardContent>
          </Card>

          {/* 连续签到卡片 */}
          <Card className="bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 hover:border-[#3D0B5B]/40 dark:hover:border-[#FBCB0A]/40 transition-all hover:-translate-y-1 rounded-xl shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[1.5rem]">Streak</CardTitle>
                <div className="w-10 h-10 rounded-lg bg-[#FBCB0A] flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#3D0B5B]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-[#333333] dark:text-[#E0E0E0]">{stats?.streak_days}</span>
                <span className="text-[#333333]/60 dark:text-[#E0E0E0]/60">days</span>
              </div>
              <p className="text-sm text-[#333333]/60 dark:text-[#E0E0E0]/60 mt-2">Daily activity</p>
            </CardContent>
          </Card>
        </div>

        {/* 详细统计和成就 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 活动统计 */}
          <Card className="bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[2rem] flex items-center">
                <Activity className="w-6 h-6 mr-2" />
                Activity Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#FBCB0A]/5 dark:bg-black/20">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FBCB0A] flex items-center justify-center">
                    <Target className="w-4 h-4 text-[#3D0B5B]" />
                  </div>
                  <span className="text-[#333333] dark:text-[#E0E0E0] font-medium font-rajdhani">Total Analyses</span>
                </div>
                <span className="text-[#333333] dark:text-[#E0E0E0] font-bold">{stats?.total_analyses}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#FBCB0A]/5 dark:bg-black/20">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FBCB0A] flex items-center justify-center">
                    <Gift className="w-4 h-4 text-[#3D0B5B]" />
                  </div>
                  <span className="text-[#333333] dark:text-[#E0E0E0] font-medium font-rajdhani">Rewards Earned</span>
                </div>
                <span className="text-[#333333] dark:text-[#E0E0E0] font-bold">{stats?.rewards_earned}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#FBCB0A]/5 dark:bg-black/20">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FBCB0A] flex items-center justify-center">
                    <User className="w-4 h-4 text-[#3D0B5B]" />
                  </div>
                  <span className="text-[#333333] dark:text-[#E0E0E0] font-medium font-rajdhani">Referrals Made</span>
                </div>
                <span className="text-[#333333] dark:text-[#E0E0E0] font-bold">{stats?.referrals_made}</span>
              </div>
            </CardContent>
          </Card>

          {/* 成就徽章 */}
          <Card className="bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[2rem] flex items-center">
                <Award className="w-6 h-6 mr-2" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-[#FBCB0A]/10 dark:bg-black/20">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#FBCB0A] flex items-center justify-center mb-2">
                    <Star className="w-6 h-6 text-[#3D0B5B]" />
                  </div>
                  <p className="text-xs text-[#333333] dark:text-[#E0E0E0] font-rajdhani">First Reading</p>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-[#FBCB0A]/10 dark:bg-black/20">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#FBCB0A] flex items-center justify-center mb-2">
                    <Calendar className="w-6 h-6 text-[#3D0B5B]" />
                  </div>
                  <p className="text-xs text-[#333333] dark:text-[#E0E0E0] font-rajdhani">7-Day Streak</p>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-[#FBCB0A]/10 dark:bg-black/20">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#FBCB0A] flex items-center justify-center mb-2">
                    <Trophy className="w-6 h-6 text-[#3D0B5B]" />
                  </div>
                  <p className="text-xs text-[#333333] dark:text-[#E0E0E0] font-rajdhani">Level Up</p>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-[#333333]/10 dark:bg-[#E0E0E0]/10 opacity-50">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#333333]/20 dark:bg-[#E0E0E0]/20 flex items-center justify-center mb-2">
                    <Sparkles className="w-6 h-6 text-[#333333]/50 dark:text-[#E0E0E0]/50" />
                  </div>
                  <p className="text-xs text-[#333333]/50 dark:text-[#E0E0E0]/50 font-rajdhani">Master Reader</p>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-[#333333]/10 dark:bg-[#E0E0E0]/10 opacity-50">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#333333]/20 dark:bg-[#E0E0E0]/20 flex items-center justify-center mb-2">
                    <Crown className="w-6 h-6 text-[#333333]/50 dark:text-[#E0E0E0]/50" />
                  </div>
                  <p className="text-xs text-[#333333]/50 dark:text-[#E0E0E0]/50 font-rajdhani">Wisdom Seeker</p>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-[#333333]/10 dark:bg-[#E0E0E0]/10 opacity-50">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#333333]/20 dark:bg-[#E0E0E0]/20 flex items-center justify-center mb-2">
                    <Shield className="w-6 h-6 text-[#333333]/50 dark:text-[#E0E0E0]/50" />
                  </div>
                  <p className="text-xs text-[#333333]/50 dark:text-[#E0E0E0]/50 font-rajdhani">Guardian</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Fortune Gallery Section */}
        <div className="mb-8">
          <Card className="bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[2rem] flex items-center">
                <Scroll className="w-6 h-6 mr-2" />
                My Fortune Gallery
              </CardTitle>
              <p className="text-[#333333]/60 dark:text-[#E0E0E0]/60 font-rajdhani">
                Your collection of Guandi fortune slips and NFT achievements
              </p>
            </CardHeader>
            <CardContent>
              <FortuneGallery walletAddress={user?.wallet_address} />
            </CardContent>
          </Card>
        </div>

        {/* 快速操作 */}
        <div className="text-center py-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => router.push('/web3')}
              className="bg-[#FBCB0A]/10 dark:bg-black/25 text-[#3D0B5B] dark:text-[#FBCB0A] border-2 border-[#FBCB0A] hover:bg-[#FBCB0A] hover:text-[#420868] dark:hover:text-[#1A2242] font-rajdhani font-bold text-lg px-8 py-3 rounded-lg transition-all hover:-translate-y-1"
            >
              Back to Dashboard
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => router.push('/web3-rewards')}
              className="border-[#3D0B5B]/50 dark:border-[#FBCB0A]/50 text-[#3D0B5B] dark:text-[#FBCB0A] hover:bg-[#FBCB0A]/10 font-rajdhani font-bold text-lg px-8 py-3 rounded-lg transition-all hover:-translate-y-1"
            >
              View Rewards
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => router.push('/guandi')}
              className="border-[#3D0B5B]/50 dark:border-[#FBCB0A]/50 text-[#3D0B5B] dark:text-[#FBCB0A] hover:bg-[#FBCB0A]/10 font-rajdhani font-bold text-lg px-8 py-3 rounded-lg transition-all hover:-translate-y-1"
            >
              <Scroll className="w-4 h-4 mr-1" />
              Guandi Oracle
            </Button>
          </div>
        </div>
      </Web3Layout>
    </AuthGuard>
  )
}
