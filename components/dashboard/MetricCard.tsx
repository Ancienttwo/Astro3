"use client"

import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { InlineErrorState } from "@/components/ErrorState"

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: "purple" | "yellow" | "green" | "blue" | "red"
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
  className?: string
}

const colorStyles = {
  purple: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    icon: "text-[#3D0B5B] dark:text-purple-400",
    trend: "text-purple-600 dark:text-purple-400",
    border: "border-purple-100 dark:border-purple-800",
  },
  yellow: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    icon: "text-[#FBCB0A] dark:text-yellow-400",
    trend: "text-yellow-600 dark:text-yellow-400",
    border: "border-yellow-100 dark:border-yellow-800",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-900/20",
    icon: "text-green-600 dark:text-green-400",
    trend: "text-green-600 dark:text-green-400",
    border: "border-green-100 dark:border-green-800",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    icon: "text-blue-600 dark:text-blue-400",
    trend: "text-blue-600 dark:text-blue-400",
    border: "border-blue-100 dark:border-blue-800",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-900/20",
    icon: "text-red-600 dark:text-red-400",
    trend: "text-red-600 dark:text-red-400",
    border: "border-red-100 dark:border-red-800",
  },
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "purple",
  isLoading = false,
  error = null,
  onRetry,
  className,
}: MetricCardProps) {
  const styles = colorStyles[color]

  if (isLoading) {
    return (
      <Card className={cn("border border-gray-200 dark:border-slate-700", className)}>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-12 w-12 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("border border-gray-200 dark:border-slate-700", className)}>
        <CardContent className="p-4 md:p-6">
          <InlineErrorState
            message={`无法加载${title}`}
            onRetry={onRetry}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow",
        className
      )}
    >
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="flex items-start justify-between">
          {/* Left: Metrics */}
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-2 truncate">
              {title}
            </p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.isPositive
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  vs last week
                </span>
              </div>
            )}
          </div>

          {/* Right: Icon */}
          <div
            className={cn(
              "flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg flex-shrink-0",
              styles.bg,
              styles.border,
              "border"
            )}
          >
            <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", styles.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function MetricCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("border border-gray-200 dark:border-slate-700", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-12 w-12 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}
