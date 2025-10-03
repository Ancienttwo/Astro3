"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Wallet, TrendingUp, Gift, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface Web3StatusBannerProps {
  className?: string
  isConnected?: boolean
  onConnect?: () => void
}

export function Web3StatusBanner({
  className,
  isConnected = false,
  onConnect,
}: Web3StatusBannerProps) {
  const [isDismissed, setIsDismissed] = React.useState(false)
  const t = useTranslations('dashboard')

  // Don't show if connected or dismissed
  if (isConnected || isDismissed) {
    return null
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-[#FBCB0A]/30 bg-gradient-to-r from-[#3D0B5B] via-[#5845DB] to-[#3D0B5B] p-6 text-white shadow-lg",
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#FBCB0A]" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-white" />
      </div>

      {/* Dismiss Button */}
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute right-4 top-4 rounded-lg p-1 hover:bg-white/10 transition-colors"
        aria-label={t('web3.banner.dismiss')}
      >
        <X className="h-4 w-4" />
      </button>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left: Message */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-5 w-5 text-[#FBCB0A]" />
              <h3 className="text-lg font-bold">{t('web3.banner.title')}</h3>
            </div>
            <p className="text-sm text-white/90 mb-3 max-w-2xl">
              {t('web3.banner.description')}
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                <Gift className="h-3.5 w-3.5 text-[#FBCB0A]" />
                <span>{t('web3.banner.benefits.dailyRewards')}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                <TrendingUp className="h-3.5 w-3.5 text-[#FBCB0A]" />
                <span>{t('web3.banner.benefits.pointsBoost')}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                <Wallet className="h-3.5 w-3.5 text-[#FBCB0A]" />
                <span>{t('web3.banner.benefits.nftBadges')}</span>
              </div>
            </div>
          </div>

          {/* Right: CTA Button */}
          <div className="flex-shrink-0">
            <Button
              onClick={onConnect}
              size="lg"
              className="bg-[#FBCB0A] text-[#3D0B5B] hover:bg-[#FBCB0A]/90 font-semibold shadow-lg"
            >
              <Wallet className="h-4 w-4 mr-2" />
              {t('web3.banner.connectButton')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
