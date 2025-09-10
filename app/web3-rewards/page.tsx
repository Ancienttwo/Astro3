'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Gift, 
  Star, 
  Zap, 
  Calendar, 
  Users, 
  Target,
  Trophy,
  Coins,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react'

interface Reward {
  id: string
  title: string
  description: string
  type: 'daily' | 'achievement' | 'referral' | 'milestone'
  credits: number
  status: 'available' | 'claimed' | 'locked'
  requirement?: string
  progress?: number
  maxProgress?: number
}

export default function Web3RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: 'daily-checkin',
      title: 'Daily Check-in',
      description: 'Login every day to earn credits',
      type: 'daily',
      credits: 10,
      status: 'available'
    },
    {
      id: 'first-reading',
      title: 'First BaZi Reading',
      description: 'Complete your first birth chart analysis',
      type: 'achievement',
      credits: 50,
      status: 'available',
      requirement: 'Complete 1 BaZi analysis'
    },
    {
      id: 'streak-7',
      title: '7-Day Streak',
      description: 'Maintain a 7-day login streak',
      type: 'milestone',
      credits: 100,
      status: 'locked',
      requirement: '7 consecutive days',
      progress: 3,
      maxProgress: 7
    },
    {
      id: 'refer-friend',
      title: 'Refer a Friend',
      description: 'Invite someone to join AstroZi',
      type: 'referral',
      credits: 200,
      status: 'available',
      requirement: '1 successful referral'
    },
    {
      id: 'cosmic-master',
      title: 'Cosmic Master',
      description: 'Complete 10 different analyses',
      type: 'achievement',
      credits: 500,
      status: 'locked',
      requirement: '10 analyses completed',
      progress: 2,
      maxProgress: 10
    }
  ])

  const [totalCredits, setTotalCredits] = useState(250)
  const [dailyStreak, setDailyStreak] = useState(3)

  const claimReward = (rewardId: string) => {
    setRewards(prev => prev.map(reward => 
      reward.id === rewardId 
        ? { ...reward, status: 'claimed' as const }
        : reward
    ))
    
    const reward = rewards.find(r => r.id === rewardId)
    if (reward) {
      setTotalCredits(prev => prev + reward.credits)
    }
  }

  const getStatusIcon = (status: Reward['status']) => {
    switch (status) {
      case 'available':
        return <Gift className="w-5 h-5 text-green-500" />
      case 'claimed':
        return <CheckCircle className="w-5 h-5 text-gray-400" />
      case 'locked':
        return <Clock className="w-5 h-5 text-yellow-500" />
    }
  }

  const getTypeColor = (type: Reward['type']) => {
    switch (type) {
      case 'daily':
        return 'from-blue-500 to-cyan-500'
      case 'achievement':
        return 'from-purple-500 to-pink-500'
      case 'referral':
        return 'from-green-500 to-emerald-500'
      case 'milestone':
        return 'from-amber-500 to-orange-500'
    }
  }

  const getTypeLabel = (type: Reward['type']) => {
    switch (type) {
      case 'daily':
        return 'Daily'
      case 'achievement':
        return 'Achievement'
      case 'referral':
        return 'Referral'
      case 'milestone':
        return 'Milestone'
    }
  }

  const groupedRewards = rewards.reduce((acc, reward) => {
    if (!acc[reward.type]) {
      acc[reward.type] = []
    }
    acc[reward.type].push(reward)
    return acc
  }, {} as Record<string, Reward[]>)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center">
            <Sparkles className="w-8 h-8 mr-3 text-purple-400" />
            Cosmic Rewards
          </h1>
          <p className="text-purple-200 text-lg">Earn credits through engagement and achievements</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/30 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-200 text-sm font-medium flex items-center">
                <Coins className="w-4 h-4 mr-2" />
                Total Credits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{totalCredits}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/30 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-200 text-sm font-medium flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Daily Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{dailyStreak} days</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/30 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-green-200 text-sm font-medium flex items-center">
                <Trophy className="w-4 h-4 mr-2" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {rewards.filter(r => r.status === 'claimed').length}/{rewards.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rewards Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white/10 backdrop-blur-sm border-white/20">
            <TabsTrigger value="all" className="text-white data-[state=active]:bg-purple-600">All</TabsTrigger>
            <TabsTrigger value="daily" className="text-white data-[state=active]:bg-blue-600">Daily</TabsTrigger>
            <TabsTrigger value="achievement" className="text-white data-[state=active]:bg-purple-600">Achievements</TabsTrigger>
            <TabsTrigger value="referral" className="text-white data-[state=active]:bg-green-600">Referrals</TabsTrigger>
            <TabsTrigger value="milestone" className="text-white data-[state=active]:bg-amber-600">Milestones</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => (
                <RewardCard key={reward.id} reward={reward} onClaim={claimReward} />
              ))}
            </div>
          </TabsContent>

          {Object.entries(groupedRewards).map(([type, typeRewards]) => (
            <TabsContent key={type} value={type} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {typeRewards.map((reward) => (
                  <RewardCard key={reward.id} reward={reward} onClaim={claimReward} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

function RewardCard({ reward, onClaim }: { reward: Reward; onClaim: (id: string) => void }) {
  const getStatusIcon = (status: Reward['status']) => {
    switch (status) {
      case 'available':
        return <Gift className="w-5 h-5 text-green-500" />
      case 'claimed':
        return <CheckCircle className="w-5 h-5 text-gray-400" />
      case 'locked':
        return <Clock className="w-5 h-5 text-yellow-500" />
    }
  }

  const getTypeColor = (type: Reward['type']) => {
    switch (type) {
      case 'daily':
        return 'from-blue-500 to-cyan-500'
      case 'achievement':
        return 'from-purple-500 to-pink-500'
      case 'referral':
        return 'from-green-500 to-emerald-500'
      case 'milestone':
        return 'from-amber-500 to-orange-500'
    }
  }

  const getTypeLabel = (type: Reward['type']) => {
    switch (type) {
      case 'daily':
        return 'Daily'
      case 'achievement':
        return 'Achievement'
      case 'referral':
        return 'Referral'
      case 'milestone':
        return 'Milestone'
    }
  }

  return (
    <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-sm hover:from-white/15 hover:to-white/10 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge 
            className={`bg-gradient-to-r ${getTypeColor(reward.type)} text-white border-0`}
          >
            {getTypeLabel(reward.type)}
          </Badge>
          {getStatusIcon(reward.status)}
        </div>
        <CardTitle className="text-white text-lg">{reward.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-white/70 text-sm mb-4">{reward.description}</p>
        
        {reward.requirement && (
          <p className="text-purple-300 text-xs mb-3">📋 {reward.requirement}</p>
        )}

        {reward.progress !== undefined && reward.maxProgress && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-white/70 mb-2">
              <span>Progress</span>
              <span>{reward.progress}/{reward.maxProgress}</span>
            </div>
            <Progress 
              value={(reward.progress / reward.maxProgress) * 100} 
              className="h-2"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center text-amber-400">
            <Coins className="w-4 h-4 mr-1" />
            <span className="font-bold">{reward.credits}</span>
          </div>
          
          <Button
            size="sm"
            disabled={reward.status !== 'available'}
            onClick={() => onClaim(reward.id)}
            className={`
              ${reward.status === 'available' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
                : 'bg-gray-600 cursor-not-allowed'
              }
            `}
          >
            {reward.status === 'available' && (
              <>
                Claim <ArrowRight className="w-3 h-3 ml-1" />
              </>
            )}
            {reward.status === 'claimed' && 'Claimed'}
            {reward.status === 'locked' && 'Locked'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}