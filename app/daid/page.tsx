'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Users, 
  Heart, 
  Shield, 
  TrendingUp, 
  Star, 
  Zap, 
  Gift,
  ArrowRight,
  Crown,
  Sparkles,
  Target,
  Calendar,
  Trophy,
  Coins,
  ChevronRight,
  Scale,
  CircleDollarSign,
  BookOpen,
  Activity
} from 'lucide-react'
import { getCurrentUnifiedUser } from '@/lib/auth'
import AuthGuard from '@/components/AuthGuard'
import Web3Layout from '@/components/Web3Layout'

interface DaidUser {
  id: string
  wallet_address: string
  email: string
  username: string
  // D'aid specific fields
  contribution_points: number
  fortune_level: string
  predictions_count: number
  aid_given_count: number
  aid_received_count: number
  reputation_score: number
  fortune_boost: number
  karma_connections: number
}

interface FortuneBoost {
  active: boolean
  percentage: number
  days_left: number
  source: string
}

export default function DaidPage() {
  const router = useRouter()
  const [user, setUser] = useState<DaidUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [fortuneBoost, setFortuneBoost] = useState<FortuneBoost>({
    active: true,
    percentage: 15,
    days_left: 7,
    source: 'Last month\'s charitable giving'
  })

  useEffect(() => {
    const initializeDaid = async () => {
      try {
        setLoading(true)
        
        // Get current user
        const currentUser = await getCurrentUnifiedUser()
        
        if (!currentUser) {
          router.push('/en/wallet-auth')
          return
        }

        // Mock D'aid user data - future API integration
        setUser({
          id: currentUser.id,
          wallet_address: currentUser.wallet_address || '',
          email: currentUser.email || '',
          username: currentUser.username || 'Web3 User',
          contribution_points: 2450,
          fortune_level: 'Virtuous Elder',
          predictions_count: 52,
          aid_given_count: 12,
          aid_received_count: 3,
          reputation_score: 4.2,
          fortune_boost: 15,
          karma_connections: 25
        })

      } catch (error) {
        console.error('❌ D\'aid initialization failed:', error)
        router.push('/en/wallet-auth')
      } finally {
        setLoading(false)
      }
    }

    initializeDaid()
  }, [router])

  const daidActions = [
    {
      id: 'store-fortune',
      title: 'Store Fortune',
      subtitle: 'Give & Build Karma',
      description: 'Fund community members in need, accumulate merit',
      icon: Heart,
      gradient: 'from-green-500 to-emerald-600',
      route: '/daid/fund',
      action: 'Fund Others',
      karma: '+Merit'
    },
    {
      id: 'request-aid',
      title: 'Receive Fortune',
      subtitle: 'Seek Community Aid',
      description: 'Request community assistance based on verified predictions',
      icon: Heart,
      gradient: 'from-blue-500 to-indigo-600',
      route: '/daid/apply',
      action: 'Request Aid',
      karma: '±Karma Return'
    },
    {
      id: 'validate-requests',
      title: 'Guardian Circle',
      subtitle: 'Verify & Validate',
      description: 'Review aid requests, maintain community integrity',
      icon: Scale,
      gradient: 'from-purple-500 to-violet-600',
      route: '/daid/validate',
      action: 'Validate',
      karma: '+Reputation'
    }
  ]

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-b from-[#FFFFFF] to-[#F8F9FA] dark:from-[#1A2242] dark:via-[#252D47] dark:to-[#1A2242] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#3D0B5B] dark:border-[#FBCB0A] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-[#333333] dark:text-[#E0E0E0] font-rajdhani">Loading D'aid Dashboard...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <Web3Layout user={user}>
        {/* D'aid Header */}
        <div className="mb-8 text-center">
          <h1 className="text-[3.5rem] font-bold text-[#3D0B5B] dark:text-[#FBCB0A] mb-2 font-rajdhani leading-tight">
            D'aid Network
          </h1>
          <p className="text-[1.5rem] text-[#333333] dark:text-[#E0E0E0] font-normal font-rajdhani mb-2">
            Store Fortune in Others, Karma Cycles
          </p>
          <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-none px-4 py-1">
            What Goes Out Returns • Merit Brings Fortune
          </Badge>
        </div>

        {/* Merit Profile & Fortune Boost */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Merit Profile */}
          <Card className="bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 hover:border-[#3D0B5B]/40 dark:hover:border-[#FBCB0A]/40 transition-all rounded-xl shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[2rem] flex items-center">
                    <Crown className="w-8 h-8 mr-3" />
                    My Merit Profile
                  </CardTitle>
                  <CardDescription className="text-[#333333]/60 dark:text-[#E0E0E0]/60 font-rajdhani text-lg">
                    Contribution Foundation • Virtue Record
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-[#3D0B5B]/50 dark:border-[#FBCB0A]/50 text-[#3D0B5B] dark:text-[#FBCB0A]">
                  {user?.fortune_level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#333333] dark:text-[#E0E0E0]">{user?.contribution_points}</div>
                  <div className="text-sm text-[#333333]/60 dark:text-[#E0E0E0]/60">Contribution Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#333333] dark:text-[#E0E0E0]">{user?.predictions_count}</div>
                  <div className="text-sm text-[#333333]/60 dark:text-[#E0E0E0]/60">On-chain Predictions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{user?.aid_given_count}</div>
                  <div className="text-sm text-[#333333]/60 dark:text-[#E0E0E0]/60">People Helped</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{user?.karma_connections}</div>
                  <div className="text-sm text-[#333333]/60 dark:text-[#E0E0E0]/60">Karma Connections</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-medium text-[#333333] dark:text-[#E0E0E0]">Reputation Level:</span>
                <div className="flex">
                  {[1,2,3,4,5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-4 h-4 ${star <= Math.floor(user?.reputation_score || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-[#333333]/60 dark:text-[#E0E0E0]/60">({user?.reputation_score}/5.0)</span>
              </div>
            </CardContent>
          </Card>

          {/* Fortune Boost Panel */}
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-yellow-800 dark:text-yellow-300 font-rajdhani font-bold text-[2rem] flex items-center">
                <Sparkles className="w-8 h-8 mr-3" />
                Fortune Boost Status
              </CardTitle>
              <CardDescription className="text-yellow-700 dark:text-yellow-400">
                What goes out returns, merit brings fortune
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CircleDollarSign className="w-6 h-6 text-yellow-600" />
                  <span className="font-medium text-yellow-800 dark:text-yellow-200">This Month's Giving:</span>
                </div>
                <span className="text-xl font-bold text-yellow-800 dark:text-yellow-200">500 USDC</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                  <span className="font-medium text-yellow-800 dark:text-yellow-200">Fortune Boost:</span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-yellow-800 dark:text-yellow-200">+{fortuneBoost.percentage}%</div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">{fortuneBoost.days_left} days left</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-6 h-6 text-yellow-600" />
                  <span className="font-medium text-yellow-800 dark:text-yellow-200">Next Divination:</span>
                </div>
                <Badge className="bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-600">
                  Free Privilege
                </Badge>
              </div>

              <div className="text-center pt-4 border-t border-yellow-300 dark:border-yellow-700">
                <div className="text-lg font-bold text-yellow-800 dark:text-yellow-200 font-rajdhani">
                  💫 "{fortuneBoost.source}" earned boost
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                  Continue giving to maintain fortune boost
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Merit Action Center */}
        <Card className="mb-8 bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani font-bold text-[2.5rem] text-center flex items-center justify-center">
              <Activity className="w-8 h-8 mr-3" />
              Merit Action Center
            </CardTitle>
            <CardDescription className="text-center text-lg text-[#333333]/60 dark:text-[#E0E0E0]/60">
              Wealth shared gathers people, virtue brings fortune
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {daidActions.map((action) => {
                const IconComponent = action.icon
                return (
                  <Card 
                    key={action.id}
                    className="group bg-white/90 dark:bg-black/10 border border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 hover:border-[#3D0B5B]/40 dark:hover:border-[#FBCB0A]/40 transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-xl rounded-lg"
                    onClick={() => router.push(action.route)}
                  >
                    <CardHeader className="text-center pb-2">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${action.gradient} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] text-xl font-rajdhani font-bold">
                        {action.title}
                      </CardTitle>
                      <div className="text-sm text-[#333333]/60 dark:text-[#E0E0E0]/60 font-medium">
                        {action.subtitle}
                      </div>
                    </CardHeader>
                    <CardContent className="text-center pt-0">
                      <p className="text-[#333333]/70 dark:text-[#E0E0E0]/70 mb-4 text-sm">
                        {action.description}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className="border-[#3D0B5B]/50 dark:border-[#FBCB0A]/50 text-[#3D0B5B] dark:text-[#FBCB0A] text-xs">
                          {action.action}
                        </Badge>
                        <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-600 text-xs">
                          {action.karma}
                        </Badge>
                      </div>
                      <Button 
                        className={`w-full bg-gradient-to-r ${action.gradient} hover:opacity-90 text-white font-rajdhani font-bold transition-all duration-300 group-hover:shadow-lg`}
                      >
                        Start Action
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Karma Cycle Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani text-lg flex items-center">
                <Gift className="w-5 h-5 mr-2" />
                Total Given
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">2,350 USDC</div>
              <p className="text-xs text-[#333333]/60 dark:text-[#E0E0E0]/60 mt-1">Charity Funds</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani text-lg flex items-center">
                <Users className="w-5 h-5 mr-2" />
                People Helped
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{user?.aid_given_count}</div>
              <p className="text-xs text-[#333333]/60 dark:text-[#E0E0E0]/60 mt-1">Community Members</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani text-lg flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Validations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">28</div>
              <p className="text-xs text-[#333333]/60 dark:text-[#E0E0E0]/60 mt-1">Reviews Done</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 dark:bg-black/20 border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani text-lg flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Merit Index
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">88.5</div>
              <p className="text-xs text-[#333333]/60 dark:text-[#E0E0E0]/60 mt-1">Karma Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Philosophy Display */}
        <div className="text-center py-8">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani mb-4">
              D'aid Core Philosophy
            </h3>
            <blockquote className="text-lg text-[#333333]/80 dark:text-[#E0E0E0]/80 italic mb-6">
              "Life flows like tides, with rises and falls. The wise store wealth with others when tides are high, and receive help from others when tides are low. This is the way of heaven and humanity."
            </blockquote>
            <div className="flex flex-wrap justify-center gap-3">
              <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-600 px-4 py-2">
                Store Fortune in Others
              </Badge>
              <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-600 px-4 py-2">
                Karma Cycles
              </Badge>
              <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-600 px-4 py-2">
                What Goes Out Returns
              </Badge>
              <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-600 px-4 py-2">
                Virtue Brings Fortune
              </Badge>
            </div>
          </div>
        </div>
      </Web3Layout>
    </AuthGuard>
  )
}
