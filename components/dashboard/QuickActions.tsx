"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { Calendar, Sparkles, BookOpen, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface QuickAction {
  labelKey: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  color: "purple" | "yellow" | "green" | "blue"
}

const quickActions: QuickAction[] = [
  {
    labelKey: "quickActions.createChart",
    href: "/bazi",
    icon: Calendar,
    color: "purple",
  },
  {
    labelKey: "quickActions.viewCharts",
    href: "/ziwei",
    icon: Sparkles,
    color: "yellow",
  },
  {
    labelKey: "quickActions.exploreWiki",
    href: "/wiki",
    icon: BookOpen,
    color: "green",
  },
  {
    labelKey: "quickActions.dailyFortune",
    href: "/fortune",
    icon: TrendingUp,
    color: "blue",
  },
]

const colorStyles = {
  purple: {
    bg: "bg-[#3D0B5B] hover:bg-[#3D0B5B]/90 dark:bg-[#3D0B5B] dark:hover:bg-[#3D0B5B]/80",
    text: "text-white",
  },
  yellow: {
    bg: "bg-[#FBCB0A] hover:bg-[#FBCB0A]/90 dark:bg-[#FBCB0A] dark:hover:bg-[#FBCB0A]/80",
    text: "text-[#3D0B5B]",
  },
  green: {
    bg: "bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700",
    text: "text-white",
  },
  blue: {
    bg: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700",
    text: "text-white",
  },
}

interface QuickActionsProps {
  className?: string
  isLoading?: boolean
}

export function QuickActions({ className, isLoading = false }: QuickActionsProps) {
  const t = useTranslations('dashboard')

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('quickActions.title')}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {t('quickActions.title')}
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon
          const styles = colorStyles[action.color]

          return (
            <Button
              key={action.href}
              asChild
              className={cn(
                "h-auto flex-col gap-2 py-4",
                styles.bg,
                styles.text,
                "shadow-sm hover:shadow-md transition-all"
              )}
            >
              <Link href={action.href}>
                <Icon className="h-6 w-6" />
                <span className="text-sm font-medium">{t(action.labelKey)}</span>
              </Link>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
