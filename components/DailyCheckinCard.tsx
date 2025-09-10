"use client";

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Calendar, 
  Gift, 
  Zap, 
  Trophy,
  Clock,
  CheckCircle,
  Star,
  Flame,
  AlertCircle,
  RefreshCw,
  LogIn,
  User
} from 'lucide-react'
import { useDailyCheckin } from '@/hooks/useDailyCheckin'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { Web3Auth, type DualUser } from '@/lib/dual-auth-system'
import { supabase } from '@/lib/supabase'
import Web3DailyCheckin from './Web3DailyCheckin'

// Translation helper
const useTranslations = () => {
  const pathname = usePathname()
  const isEnglish = pathname.startsWith('/en')
  
  const t = {
    // Login status messages
    loginExpired: isEnglish ? "Login Expired" : "登录已失效",
    loginRequired: isEnglish ? "Please log in again to use check-in features" : "请重新登录后使用签到功能",
    goLogin: isEnglish ? "Go Login" : "前往登录",
    refreshStatus: isEnglish ? "Refresh Status" : "刷新状态",
    
    // Loading and errors
    loading: isEnglish ? "Loading check-in information..." : "加载签到信息中...",
    loadFailed: isEnglish ? "Loading Failed" : "加载失败",
    loadError: isEnglish ? "Failed to get check-in information, please try again later" : "获取签到信息失败，请稍后重试",
    reload: isEnglish ? "Reload" : "重新加载",
    
    // Welcome and check-in
    welcomeBack: isEnglish ? "Welcome back," : "欢迎回来，",
    user: isEnglish ? "User" : "用户",
    checkinTitle: isEnglish ? "Daily Check-in to Get Free AI Reports and Bot Credits!" : "签到领取免费AI报告和BOT次数！",
    checkinSuccess: isEnglish ? "Check-in Successful!" : "签到成功！",
    rewardText: isEnglish ? "🎉 Got 1 AI Report + 10 ChatBot Conversations!" : "🎉 获得 1次AI报告 + 10次ChatBot对话！",
    
    // Check-in buttons
    checking: isEnglish ? "Checking in..." : "签到中...",
    alreadyChecked: isEnglish ? "Already Checked in Today" : "今日已签到",
    checkInNow: isEnglish ? "Check in Now (+1 Report +10 Chats)" : "立即签到 (+1报告+10对话)",
    checkedToday: isEnglish ? "Checked in Today" : "今日已签到",
    
    // Statistics
    consecutiveDays: isEnglish ? "Consecutive Days" : "连续天数",
    totalDays: isEnglish ? "Total Days" : "累计天数",
    consecutiveReward: isEnglish ? "Consecutive Check-in Reward" : "连续签到奖励",
    daysLeft: isEnglish ? "days" : "天",
    needMore: isEnglish ? "Need" : "还需",
    moreDays: isEnglish ? "more days" : "天",
    
    // Reward rules
    rewardRules: isEnglish ? "Reward Rules:" : "奖励规则：",
    dailyReward: isEnglish ? "• Daily check-in: +1 AI Report + 10 ChatBot conversations" : "• 每日签到：+1次AI报告 + 10次ChatBot对话",
    day7Reward: isEnglish ? "• 7 consecutive days: Extra +2 Reports + 20 ChatBot" : "• 连续7天：额外+2次报告 + 20次ChatBot",
    day15Reward: isEnglish ? "• 15 consecutive days: Extra +3 Reports + 30 ChatBot" : "• 连续15天：额外+3次报告 + 30次ChatBot",
    day30Reward: isEnglish ? "• 30 consecutive days: Extra +5 Reports + 50 ChatBot" : "• 连续30天：额外+5次报告 + 50次ChatBot",
    maxLimits: isEnglish ? "• Reports max 10, ChatBot max 30" : "• 报告最多累积10次，ChatBot最多累积30次"
  }
  
  return { t, isEnglish }
}

interface DailyCheckinCardProps {
  className?: string
  onCheckinSuccess?: () => void
}

export function DailyCheckinCard({ 
  className = '',
  onCheckinSuccess
}: DailyCheckinCardProps) {
  const { t, isEnglish } = useTranslations()
  const { 
    checkinStatus, 
    loading, 
    error, 
    fetchCheckinStatus,
    performCheckin, 
    canCheckinToday,
    getCheckinSummary,
    getNextConsecutiveReward
  } = useDailyCheckin()
  
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isLoginError, setIsLoginError] = useState(false)
  const [currentUser, setCurrentUser] = useState<DualUser | null>(null)
  const [isWeb3User, setIsWeb3User] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchCheckinStatus()
    // Get current user info (Architecture fix: not relying on potentially invalid getCurrentUser)
    const checkUser = async () => {
      try {
        // First check Supabase session
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          // Construct user object from session
          const user = {
            id: session.user.id,
            email: session.user.email?.toLowerCase() || '',
            username: session.user.user_metadata?.name || `${t.user}${session.user.id.slice(0, 8)}`,
            auth_type: 'web2' as const
          }
          setCurrentUser({
            ...user,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        } else {
          // Check Web3 user
          const web3User = Web3Auth.getCurrentUser()
          setCurrentUser(web3User)
          setIsWeb3User(!!web3User)
        }
      } catch (err) {
        console.error('Failed to get user info:', err)
      }
    }
    checkUser()
  }, [])

  // Detect if it's a login error - relaxed checking conditions
  useEffect(() => {
    if (error && error.includes('401') && (error.includes('认证失败') || error.includes('authentication'))) {
      setIsLoginError(true)
    } else {
      setIsLoginError(false)
    }
  }, [error])

  const handleCheckin = async () => {
    if (!canCheckinToday()) return
    
    setIsCheckingIn(true)
    setIsLoginError(false)
    
    try {
      const result = await performCheckin()
      
      if (result) {
        setShowSuccess(true)
        onCheckinSuccess?.()
        
        // Hide reward notification after 3 seconds
        setTimeout(() => {
          setShowSuccess(false)
        }, 3000)
      }
    } catch (err: any) {
      console.error('Check-in failed:', err)
      if (err.message && (err.message.includes('401') || err.message.includes('login') || err.message.includes('登录') || err.message.includes('未登录'))) {
        setIsLoginError(true)
      }
    } finally {
      setIsCheckingIn(false)
    }
  }

  const handleRefresh = () => {
    setIsLoginError(false)
    fetchCheckinStatus()
  }

  const handleLogin = () => {
    router.push('/auth')
  }

  // Web3 users use dedicated Web3 check-in component
  if (isWeb3User && currentUser) {
    return (
      <div className={className}>
        <Web3DailyCheckin 
          userAddress={currentUser.id}
          onCheckinSuccess={() => {
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 3000)
            if (onCheckinSuccess) {
              onCheckinSuccess()
            }
          }}
        />
      </div>
    )
  }

  // Login expired state
  if (isLoginError) {
    return (
      <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <CardHeader className="text-center pb-3">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mb-2">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-lg text-red-800 dark:text-red-200">
            {t.loginExpired}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-center text-red-700 dark:text-red-300 text-sm">
            {t.loginRequired}
          </p>
          
          <div className="space-y-2">
            <Button 
              onClick={handleLogin}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              size="sm"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {t.goLogin}
            </Button>
            
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="w-full border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t.refreshStatus}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Loading state
  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 border-purple-200 dark:border-slate-600">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center mb-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          </div>
          <CardTitle className="text-lg text-purple-800 dark:text-yellow-400">
            {t.loading}
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  // Error state (non-login error)
  if (error && !isLoginError) {
    return (
      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <CardHeader className="text-center pb-3">
          <div className="mx-auto w-12 h-12 bg-yellow-100 dark:bg-yellow-900/40 rounded-full flex items-center justify-center mb-2">
            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-lg text-yellow-800 dark:text-yellow-200">
            {t.loadFailed}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-center text-yellow-700 dark:text-yellow-300 text-sm">
            {error || t.loadError}
          </p>
          
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-700 dark:text-yellow-300"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t.reload}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!checkinStatus) return null

  const summary = getCheckinSummary()
  const nextReward = getNextConsecutiveReward()
  const canCheckin = canCheckinToday()
  const progressToNext = nextReward ? (checkinStatus.consecutive_checkin_days / nextReward.requiredDays) * 100 : 100

  return (
    <Card className={`transition-all duration-300 ${
      showSuccess 
        ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700 shadow-lg scale-105' 
        : 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 border-purple-200 dark:border-slate-600'
    }`}>
      <CardHeader className="text-center pb-3">
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
          showSuccess 
            ? 'bg-green-100 dark:bg-green-900/40' 
            : canCheckin 
              ? 'bg-purple-100 dark:bg-purple-900/40' 
              : 'bg-gray-100 dark:bg-gray-800'
        }`}>
          {showSuccess ? (
            <Trophy className="w-6 h-6 text-green-600 dark:text-green-400 animate-bounce" />
          ) : (
            <Calendar className={`w-6 h-6 ${
              canCheckin 
                ? 'text-purple-600 dark:text-purple-400' 
                : 'text-gray-400 dark:text-gray-500'
            }`} />
          )}
        </div>
        
        {/* Welcome message */}
        {currentUser && (
          <div className="mb-2">
            <p className="font-semibold tracking-tight text-lg transition-colors duration-300 text-purple-800 dark:text-yellow-400">
              {t.welcomeBack} {currentUser.username || currentUser.email || t.user}!
            </p>
          </div>
        )}
        
        <CardTitle className={`text-lg transition-colors duration-300 ${
          showSuccess 
            ? 'text-green-800 dark:text-green-200' 
            : 'text-purple-800 dark:text-yellow-400'
        }`}>
          {showSuccess ? t.checkinSuccess : t.checkinTitle}
        </CardTitle>
        
        {showSuccess && (
          <p className="text-green-600 dark:text-green-400 text-sm animate-pulse">
            {t.rewardText}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Check-in button */}
        <Button
          onClick={handleCheckin}
          disabled={!canCheckin || isCheckingIn || showSuccess}
          className={`w-full font-medium transition-all duration-300 ${
            canCheckin && !showSuccess
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg'
              : showSuccess
                ? 'bg-green-600 text-white'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
          }`}
        >
          {isCheckingIn ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {t.checking}
            </>
          ) : showSuccess ? (
            <>
              <Trophy className="w-4 h-4 mr-2" />
              {t.alreadyChecked}
            </>
          ) : canCheckin ? (
            <>
              <Gift className="w-4 h-4 mr-2" />
              {t.checkInNow}
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4 mr-2" />
              {t.alreadyChecked}
            </>
          )}
        </Button>

        {/* Check-in statistics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-purple-100 dark:border-slate-600">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {checkinStatus.consecutive_checkin_days}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{t.consecutiveDays}</div>
          </div>
          
          <div className="text-center p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-purple-100 dark:border-slate-600">
            <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
              {checkinStatus.total_checkin_days}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{t.totalDays}</div>
          </div>
        </div>

        {/* Consecutive reward progress */}
        {nextReward && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.consecutiveReward}
              </span>
              <Badge variant="secondary" className="text-xs">
                {checkinStatus.consecutive_checkin_days}/{nextReward.requiredDays} {t.daysLeft}
              </Badge>
            </div>
            
            <Progress 
              value={Math.min(progressToNext, 100)} 
              className="h-2"
            />
            
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>{t.needMore} {nextReward.requiredDays - checkinStatus.consecutive_checkin_days} {t.moreDays}</span>
              <span className="flex items-center">
                <Zap className="w-3 h-3 mr-1 text-amber-500" />
                +{nextReward.reward} times
              </span>
            </div>
          </div>
        )}

        {/* Reward rules */}
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 bg-white dark:bg-slate-800/30 p-3 rounded-lg">
          <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">{t.rewardRules}</div>
          <div>{t.dailyReward}</div>
          <div>{t.day7Reward}</div>
          <div>{t.day15Reward}</div>
          <div>{t.day30Reward}</div>
          <div className="text-amber-600 dark:text-amber-400 font-medium">
            {t.maxLimits}
          </div>
        </div>

        {/* Refresh button */}
        <Button 
          onClick={handleRefresh}
          variant="ghost"
          size="sm"
          className="w-full text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {t.refreshStatus}
        </Button>
      </CardContent>
    </Card>
  )
}