"use client"

import * as React from "react"
import { Wallet, Coins, Trophy, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface Web3Metrics {
  tokenBalance: number
  tokenSymbol: string
  usdValue: number
  rewards: number
  nftCount: number
}

interface Web3MetricsCardProps {
  className?: string
  isLoading?: boolean
  isConnected?: boolean
  onConnect?: () => void
}

// Mock data - will be replaced with real blockchain data
const mockWeb3Metrics: Web3Metrics = {
  tokenBalance: 1500.5,
  tokenSymbol: "ASTR",
  usdValue: 450.15,
  rewards: 250,
  nftCount: 3,
}

export function Web3MetricsCard({
  className,
  isLoading = false,
  isConnected = false,
  onConnect,
}: Web3MetricsCardProps) {
  const [metrics] = React.useState<Web3Metrics>(mockWeb3Metrics)

  if (!isConnected) {
    return (
      <Card
        className={cn(
          "border border-gray-200 dark:border-slate-700 shadow-sm bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-800 dark:to-slate-700",
          className
        )}
      >
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#3D0B5B] to-[#5845DB]">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                连接钱包解锁 Web3 功能
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                连接您的钱包以查看代币余额、NFT 收藏和 Web3 奖励
              </p>
            </div>
            <Button
              onClick={onConnect}
              className="bg-gradient-to-r from-[#3D0B5B] to-[#5845DB] hover:opacity-90 text-white"
            >
              <Wallet className="h-4 w-4 mr-2" />
              连接钱包
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className={cn("border border-gray-200 dark:border-slate-700", className)}>
        <CardHeader className="border-b border-gray-200 dark:border-slate-700">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
          </div>
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
      <CardHeader className="border-b border-gray-200 dark:border-slate-700 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Wallet className="h-5 w-5 text-[#5845DB]" />
            Web3 资产
          </CardTitle>
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          >
            已连接
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-5">
          {/* Token Balance */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FBCB0A]/10">
                <Coins className="h-5 w-5 text-[#FBCB0A]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  代币余额
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {metrics.tokenSymbol}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {metrics.tokenBalance.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                ≈ ${metrics.usdValue.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Rewards */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
                <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  待领取奖励
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  本周获得
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                +{metrics.rewards}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {metrics.tokenSymbol}
              </p>
            </div>
          </div>

          {/* NFT Count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3D0B5B]/10">
                <TrendingUp className="h-5 w-5 text-[#3D0B5B]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  NFT 收藏
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  徽章与成就
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-[#3D0B5B] dark:text-purple-400">
                {metrics.nftCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                个 NFT
              </p>
            </div>
          </div>
        </div>

        {/* View Details Button */}
        <Button
          variant="outline"
          className="w-full mt-4 border-gray-300 hover:bg-gray-50 dark:border-slate-600 dark:hover:bg-slate-800"
          asChild
        >
          <a href="/web3-rewards">查看详情</a>
        </Button>
      </CardContent>
    </Card>
  )
}
