"use client";

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Zap, 
  Star, 
  Clock, 
  TrendingUp, 
  ShoppingCart,
  Gift,
  RefreshCw
} from 'lucide-react'
import { SafeCrown } from '@/components/ui/safe-icon'
import { useUserUsage } from '@/hooks/useUserUsage'
import { cn } from '@/lib/utils'

interface UsageIndicatorProps {
  className?: string
  showDetails?: boolean
  onPurchaseClick?: () => void
  onUpgradeClick?: () => void
}

export function UsageIndicator({ 
  className = '', 
  showDetails = true,
  onPurchaseClick,
  onUpgradeClick 
}: UsageIndicatorProps) {
  const { usage, loading, error, fetchUsage, getUsageSummary } = useUserUsage()
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const summary = getUsageSummary()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchUsage()
    setIsRefreshing(false)
  }

  if (loading && !usage) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">加载使用统计...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("w-full border-destructive/50", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-destructive">
              <Zap className="h-4 w-4" />
              <span className="text-sm">加载失败: {error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!usage || !summary) {
    return null
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            {usage.isPremiumUser ? (
              <>
                <SafeCrown className="h-5 w-5 text-yellow-500" />
                <span>高级用户</span>
              </>
            ) : (
              <>
                <Zap className="h-5 w-5" />
                <span>使用统计</span>
              </>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 免费次数 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Gift className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">免费次数</span>
            </div>
            <Badge variant={usage.remainingFreeReports > 0 ? "default" : "secondary"}>
                                      剩余{usage.remainingFreeReports}/当前上限10
            </Badge>
          </div>
          <Progress 
            value={summary.freeUsagePercent} 
            className="h-2"
          />
        </div>

        {/* 付费次数 */}
        {usage.paidReportsPurchased > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">付费次数</span>
              </div>
              <Badge variant={usage.remainingPaidReports > 0 ? "default" : "secondary"}>
                {usage.remainingPaidReports}/{usage.paidReportsPurchased}
              </Badge>
            </div>
            <Progress 
              value={summary.paidUsagePercent} 
              className="h-2"
            />
          </div>
        )}

        {/* ChatBot对话次数 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">ChatBot对话</span>
            </div>
            <Badge variant={usage.chatbotRemaining > 0 ? "default" : "secondary"}>
              {usage.chatbotRemaining}/{usage.chatbotLimit}
            </Badge>
          </div>
          <Progress 
            value={usage.chatbotLimit > 0 ? ((usage.chatbotUsed / usage.chatbotLimit) * 100) : 0} 
            className="h-2"
          />
        </div>

        {/* 每日限制 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">今日已用</span>
            </div>
            <Badge variant={usage.remainingDailyReports > 0 ? "outline" : "secondary"}>
                                      已用{usage.dailyUsed}/当前上限10
            </Badge>
          </div>
          <Progress 
            value={summary.dailyUsagePercent} 
            className="h-2"
          />
        </div>

        {showDetails && (
          <>
            {/* 报告统计 */}
            <div className="pt-2 border-t">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">报告统计</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="space-y-1">
                  <div className="text-lg font-bold text-purple-600">
                    {usage.ziweiReportsCount}
                  </div>
                  <div className="text-xs text-muted-foreground">紫微斗数</div>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-bold text-blue-600">
                    {usage.baziReportsCount}
                  </div>
                  <div className="text-xs text-muted-foreground">八字命理</div>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-bold text-green-600">
                    {usage.comprehensiveReportsCount}
                  </div>
                  <div className="text-xs text-muted-foreground">综合分析</div>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="pt-2 border-t space-y-2">
              {summary.needsPurchase && (
                <Button 
                  className="w-full" 
                  onClick={onPurchaseClick}
                  size="sm"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  购买更多次数
                </Button>
              )}
              
              {!usage.isPremiumUser && (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={onUpgradeClick}
                  size="sm"
                >
                  <SafeCrown className="h-4 w-4 mr-2" />
                  升级高级用户
                </Button>
              )}
            </div>
          </>
        )}

        {/* 状态提示 */}
        {!summary.canGenerate && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">
                {usage.remainingDailyReports <= 0 
                  ? "今日生成次数已用完" 
                  : "生成次数不足"}
              </span>
            </div>
          </div>
        )}

        {usage.isPremiumUser && usage.premiumExpiresAt && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
              <SafeCrown className="h-4 w-4" />
              <span className="text-sm">
                高级会员到期时间: {new Date(usage.premiumExpiresAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 