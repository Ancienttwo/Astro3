"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { CheckCircle2, Clock, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { InlineErrorState } from "@/components/ErrorState"

interface Activity {
  id: string
  type: "check_in" | "task_complete" | "reading" | "analysis"
  title: string
  description: string
  time: string
  points?: number
}

interface ActivitySummaryProps {
  className?: string
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
}

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "check_in",
    title: "每日签到",
    description: "完成今日签到",
    time: "2小时前",
    points: 10,
  },
  {
    id: "2",
    type: "task_complete",
    title: "完成任务",
    description: "完成「学习五行基础」任务",
    time: "5小时前",
    points: 50,
  },
  {
    id: "3",
    type: "reading",
    title: "阅读文章",
    description: "阅读「紫微斗数入门」",
    time: "昨天",
    points: 20,
  },
  {
    id: "4",
    type: "analysis",
    title: "命盘分析",
    description: "查看八字命盘详解",
    time: "2天前",
    points: 30,
  },
]

const activityIcons = {
  check_in: CheckCircle2,
  task_complete: CheckCircle2,
  reading: Clock,
  analysis: TrendingUp,
}

const activityColors = {
  check_in: "text-green-600 dark:text-green-400",
  task_complete: "text-blue-600 dark:text-blue-400",
  reading: "text-purple-600 dark:text-purple-400",
  analysis: "text-[#FBCB0A] dark:text-yellow-400",
}

export function ActivitySummary({ className, isLoading = false, error = null, onRetry }: ActivitySummaryProps) {
  const t = useTranslations('dashboard')

  if (isLoading) {
    return (
      <Card className={cn("border border-gray-200 dark:border-slate-700", className)}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('activity.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("border border-gray-200 dark:border-slate-700 shadow-sm", className)}>
        <CardHeader className="border-b border-gray-200 dark:border-slate-700">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('activity.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <InlineErrorState
            message={t('activity.error')}
            onRetry={onRetry}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("border border-gray-200 dark:border-slate-700 shadow-sm", className)}>
      <CardHeader className="border-b border-gray-200 dark:border-slate-700">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('activity.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 dark:divide-slate-700">
          {mockActivities.map((activity) => {
            const Icon = activityIcons[activity.type]
            const iconColor = activityColors[activity.type]

            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {/* Icon */}
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-800",
                    iconColor
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.title}
                    </p>
                    {activity.points && (
                      <Badge
                        variant="secondary"
                        className="bg-[#FBCB0A]/10 text-[#FBCB0A] dark:bg-yellow-900/20 dark:text-yellow-400 flex-shrink-0"
                      >
                        +{activity.points}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {activity.time}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* View All Link */}
        <div className="border-t border-gray-200 dark:border-slate-700 p-4">
          <button className="w-full text-center text-sm font-medium text-[#3D0B5B] dark:text-purple-400 hover:underline">
            {t('activity.viewAll')}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
