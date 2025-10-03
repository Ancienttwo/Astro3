"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Coins, Flame, Trophy, CheckSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { MetricCard } from "./MetricCard"

interface MetricsData {
  points: number
  streak: number
  rank: number
  tasksCompleted: number
}

interface MetricsOverviewProps {
  className?: string
  isLoading?: boolean
}

// Mock data - will be replaced with real API data
const mockMetricsData: MetricsData = {
  points: 1250,
  streak: 7,
  rank: 42,
  tasksCompleted: 15,
}

export function MetricsOverview({ className, isLoading = false }: MetricsOverviewProps) {
  const [metrics] = React.useState<MetricsData>(mockMetricsData)
  const t = useTranslations('dashboard')

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4", className)}>
      {/* Points Card */}
      <MetricCard
        title={t('metrics.points.title')}
        value={metrics.points.toLocaleString()}
        subtitle={t('metrics.points.subtitle')}
        icon={Coins}
        color="yellow"
        trend={{
          value: 12,
          isPositive: true,
        }}
        isLoading={isLoading}
      />

      {/* Streak Card */}
      <MetricCard
        title={t('metrics.streak.title')}
        value={metrics.streak}
        subtitle={t('metrics.streak.subtitle', { days: metrics.streak })}
        icon={Flame}
        color="red"
        trend={{
          value: 100,
          isPositive: true,
        }}
        isLoading={isLoading}
      />

      {/* Rank Card */}
      <MetricCard
        title={t('metrics.rank.title')}
        value={`#${metrics.rank}`}
        subtitle={t('metrics.rank.subtitle')}
        icon={Trophy}
        color="purple"
        trend={{
          value: 5,
          isPositive: true,
        }}
        isLoading={isLoading}
      />

      {/* Tasks Completed Card */}
      <MetricCard
        title={t('metrics.tasks.title')}
        value={metrics.tasksCompleted}
        subtitle={t('metrics.tasks.subtitle')}
        icon={CheckSquare}
        color="green"
        trend={{
          value: 25,
          isPositive: true,
        }}
        isLoading={isLoading}
      />
    </div>
  )
}
