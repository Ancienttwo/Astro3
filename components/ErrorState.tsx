"use client"

import * as React from "react"
import { AlertCircle, RefreshCw, WifiOff, ServerCrash } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export interface ErrorStateProps {
  className?: string
  title?: string
  message?: string
  error?: Error | null
  onRetry?: () => void
  variant?: "default" | "network" | "server" | "minimal"
  showRetry?: boolean
}

const variantConfig = {
  default: {
    icon: AlertCircle,
    iconColor: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    borderColor: "border-red-200 dark:border-red-800",
    cardBg: "bg-red-50 dark:bg-red-900/10",
  },
  network: {
    icon: WifiOff,
    iconColor: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    borderColor: "border-orange-200 dark:border-orange-800",
    cardBg: "bg-orange-50 dark:bg-orange-900/10",
  },
  server: {
    icon: ServerCrash,
    iconColor: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    cardBg: "bg-purple-50 dark:bg-purple-900/10",
  },
  minimal: {
    icon: AlertCircle,
    iconColor: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    borderColor: "border-gray-200 dark:border-gray-700",
    cardBg: "bg-white dark:bg-slate-800",
  },
}

export function ErrorState({
  className,
  title = "加载失败",
  message = "无法加载内容，请稍后重试",
  error,
  onRetry,
  variant = "default",
  showRetry = true,
}: ErrorStateProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <Card
      className={cn(
        "border",
        config.borderColor,
        config.cardBg,
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              config.bgColor
            )}
          >
            <Icon className={cn("h-6 w-6", config.iconColor)} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {message}
            </p>
            {error && process.env.NODE_ENV === "development" && (
              <details className="mt-2 text-left">
                <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  开发者信息
                </summary>
                <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-32 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  {error.message}
                  {"\n\n"}
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
          {showRetry && onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Inline error state (for use inside existing cards)
export function InlineErrorState({
  className,
  message = "加载失败",
  onRetry,
  showRetry = true,
}: Omit<ErrorStateProps, "title" | "variant">) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-8 px-4", className)}>
      <AlertCircle className="h-8 w-8 text-red-500 dark:text-red-400 mb-3" />
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
        {message}
      </p>
      {showRetry && onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          重试
        </Button>
      )}
    </div>
  )
}
