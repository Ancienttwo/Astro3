"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Sparkles, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/PrivyContext"
import { Skeleton } from "@/components/ui/skeleton"

interface WelcomeSectionProps {
  className?: string
  isLoading?: boolean
}

export function WelcomeSection({ className, isLoading = false }: WelcomeSectionProps) {
  const { user, walletAddress } = useAuth()
  const t = useTranslations('dashboard')
  const [currentTime, setCurrentTime] = React.useState(new Date())

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 6) return t('welcome.greeting.night')
    if (hour < 12) return t('welcome.greeting.morning')
    if (hour < 14) return t('welcome.greeting.afternoon')
    if (hour < 18) return t('welcome.greeting.afternoon')
    if (hour < 22) return t('welcome.greeting.evening')
    return t('welcome.greeting.night')
  }

  const getChineseDate = () => {
    const days = ["日", "一", "二", "三", "四", "五", "六"]
    const year = currentTime.getFullYear()
    const month = currentTime.getMonth() + 1
    const date = currentTime.getDate()
    const day = days[currentTime.getDay()]
    return `${year}年${month}月${date}日 星期${day}`
  }

  const getUserDisplayName = () => {
    if (user?.email) {
      return user.email.split("@")[0]
    }
    if (walletAddress) {
      return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    }
    return "访客"
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border border-gray-200 dark:border-slate-700 bg-gradient-to-br from-[#3D0B5B] to-[#5845DB] p-8 text-white shadow-lg",
          className
        )}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#FBCB0A]" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white" />
        </div>

        {/* Skeleton Content */}
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-24 bg-white/20" />
              <Skeleton className="h-9 w-64 bg-white/20" />
              <Skeleton className="h-4 w-full max-w-2xl bg-white/20" />
            </div>
            <div className="hidden md:block">
              <Skeleton className="h-10 w-48 rounded-lg bg-white/20" />
            </div>
          </div>
          <div className="md:hidden mt-4">
            <Skeleton className="h-4 w-40 bg-white/20" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-gray-200 dark:border-slate-700 bg-gradient-to-br from-[#3D0B5B] to-[#5845DB] p-8 text-white shadow-lg",
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#FBCB0A]" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          {/* Left: Greeting */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-[#FBCB0A]" />
              <span className="text-sm font-medium text-white/80">
                {getGreeting()}
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-3">
              {t('welcome.message')}, {getUserDisplayName()}
            </h1>
            <p className="text-white/80 text-sm max-w-2xl">
              {t('welcome.message')}
            </p>
          </div>

          {/* Right: Date */}
          <div className="hidden md:flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
              <Calendar className="h-4 w-4 text-[#FBCB0A]" />
              <span className="text-sm font-medium">{getChineseDate()}</span>
            </div>
          </div>
        </div>

        {/* Mobile Date */}
        <div className="md:hidden mt-4 flex items-center gap-2 text-sm text-white/80">
          <Calendar className="h-4 w-4" />
          <span>{getChineseDate()}</span>
        </div>
      </div>
    </div>
  )
}
