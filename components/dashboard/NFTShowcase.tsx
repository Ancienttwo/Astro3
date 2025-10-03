"use client"

import * as React from "react"
import { Award, Lock, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface NFT {
  id: string
  name: string
  image: string
  description: string
  rarity: "common" | "rare" | "epic" | "legendary"
  earned: boolean
  earnedDate?: string
}

interface NFTShowcaseProps {
  className?: string
  isConnected?: boolean
  isLoading?: boolean
}

const rarityColors = {
  common: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  rare: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  epic: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  legendary: "bg-[#FBCB0A]/20 text-[#FBCB0A] dark:bg-yellow-900/30 dark:text-yellow-300",
}

const rarityLabels = {
  common: "普通",
  rare: "稀有",
  epic: "史诗",
  legendary: "传说",
}

// Mock NFT data
const mockNFTs: NFT[] = [
  {
    id: "1",
    name: "命理学徒",
    image: "🎓",
    description: "完成首次八字排盘",
    rarity: "common",
    earned: true,
    earnedDate: "2024-09-15",
  },
  {
    id: "2",
    name: "紫微探索者",
    image: "⭐",
    description: "完成紫微斗数分析10次",
    rarity: "rare",
    earned: true,
    earnedDate: "2024-09-28",
  },
  {
    id: "3",
    name: "连续签到王",
    image: "🔥",
    description: "连续签到30天",
    rarity: "epic",
    earned: false,
  },
  {
    id: "4",
    name: "命理大师",
    image: "👑",
    description: "成为全站排名前10",
    rarity: "legendary",
    earned: false,
  },
]

export function NFTShowcase({ className, isConnected = false, isLoading = false }: NFTShowcaseProps) {
  if (isLoading) {
    return (
      <Card className={cn("border border-gray-200 dark:border-slate-700 shadow-sm", className)}>
        <CardHeader className="border-b border-gray-200 dark:border-slate-700">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-[#3D0B5B]" />
            NFT 徽章收藏
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isConnected) {
    return (
      <Card className={cn("border border-gray-200 dark:border-slate-700 shadow-sm", className)}>
        <CardHeader className="border-b border-gray-200 dark:border-slate-700">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-[#3D0B5B]" />
            NFT 徽章收藏
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center gap-3 py-8">
            <Lock className="h-12 w-12 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              连接钱包以查看您的 NFT 徽章收藏
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("border border-gray-200 dark:border-slate-700 shadow-sm", className)}>
      <CardHeader className="border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-[#3D0B5B]" />
            NFT 徽章收藏
          </CardTitle>
          <Badge variant="secondary" className="bg-[#FBCB0A]/10 text-[#FBCB0A]">
            {mockNFTs.filter((nft) => nft.earned).length}/{mockNFTs.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-3">
          {mockNFTs.map((nft) => (
            <div
              key={nft.id}
              className={cn(
                "relative rounded-lg border p-4 transition-all",
                nft.earned
                  ? "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md cursor-pointer"
                  : "border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 opacity-60"
              )}
            >
              {/* Lock Icon for Unearned NFTs */}
              {!nft.earned && (
                <div className="absolute top-2 right-2">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
              )}

              {/* NFT Image/Emoji */}
              <div className="text-center mb-3">
                <div
                  className={cn(
                    "text-4xl mb-2",
                    !nft.earned && "grayscale opacity-50"
                  )}
                >
                  {nft.image}
                </div>
                <Badge
                  variant="secondary"
                  className={cn("text-xs", rarityColors[nft.rarity])}
                >
                  {rarityLabels[nft.rarity]}
                </Badge>
              </div>

              {/* NFT Info */}
              <div className="text-center">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  {nft.name}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {nft.description}
                </p>
                {nft.earned && nft.earnedDate && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    获得于 {nft.earnedDate}
                  </p>
                )}
                {!nft.earned && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    未解锁
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <Button
          variant="ghost"
          className="w-full mt-4 text-[#3D0B5B] dark:text-purple-400 hover:bg-gray-50 dark:hover:bg-slate-800"
          asChild
        >
          <a href="/web3-profile" className="flex items-center justify-center gap-2">
            查看完整收藏
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
