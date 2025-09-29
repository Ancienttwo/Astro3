"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, Calendar, TrendingUp, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useChainId, useReadContract } from 'wagmi';
import { useNamespaceTranslations } from '@/lib/i18n/useI18n';

const CONTRACT_ADDRESS = '0x3b016F5A7C462Fe51B691Ef18559DE720D9B452F';
const CONTRACT_ABI = [
  "function getUserStats(address user) view returns (uint256, uint256, uint256, uint256, uint256, uint256, bool)",
  "function canCheckin(address user) view returns (bool)",
  "function totalUsers() view returns (uint256)",
  "function totalCheckins() view returns (uint256)"
];

interface Web3PointsDisplaySimpleProps {
  walletAddress: string;
  onPointsUpdate?: () => void;
}

export default function Web3PointsDisplaySimple({ walletAddress, onPointsUpdate }: Web3PointsDisplaySimpleProps) {
  const chainId = useChainId();
  const { toast } = useToast();
  const t = useNamespaceTranslations('web3/auth');
  const tp = (path: string, values?: Record<string, unknown>) => t(`points.${path}`, values);

  const { data: userStatsData, refetch: refetchStats, isFetching: f1 } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI as any,
    functionName: 'getUserStats',
    args: [walletAddress as `0x${string}`],
    query: { enabled: !!walletAddress && chainId === 56 },
  });
  const { data: canCheckinData, refetch: refetchCan, isFetching: f2 } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI as any,
    functionName: 'canCheckin',
    args: [walletAddress as `0x${string}`],
    query: { enabled: !!walletAddress && chainId === 56 },
  });

  const formatNumber = (num: bigint) => {
    const n = Number(num);
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
  };

  const getConsecutiveDaysLabelKey = (days: number) => {
    if (days >= 100) return 'legendary';
    if (days >= 60) return 'elite';
    if (days >= 30) return 'expert';
    if (days >= 15) return 'advanced';
    if (days >= 7) return 'beginner';
    return 'starter';
  };

  const getConsecutiveDaysColor = (days: number) => {
    if (days >= 100) return 'bg-purple-500';
    if (days >= 60) return 'bg-blue-500';
    if (days >= 30) return 'bg-green-500';
    if (days >= 15) return 'bg-yellow-500';
    if (days >= 7) return 'bg-orange-500';
    return 'bg-gray-500';
  };

  const isCorrectNetwork = chainId === 56;
  if (!isCorrectNetwork) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">{tp('networkMismatch')}</p>
        </CardContent>
      </Card>
    );
  }

  const loading = f1 || f2;
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const userStats = useMemo(() => {
    if (!userStatsData) return null;
    const d = userStatsData as any[];
    return {
      totalPoints: d[0] as bigint,
      consecutiveDays: d[1] as bigint,
      airdropWeight: d[3] as bigint,
      totalCheckins: d[5] as bigint,
      isActive: d[6] as boolean,
    };
  }, [userStatsData]);

  const canCheckin = Boolean(canCheckinData);

  if (!userStats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">{tp('noData')}</p>
          <Button
            variant="outline"
            onClick={() => {
              refetchStats();
              refetchCan();
            }}
            className="mt-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {tp('retry')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const consecutiveDays = Number(userStats.consecutiveDays);
  const totalCheckins = Number(userStats.totalCheckins);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">{tp('pointsBalance')}</p>
                <p className="text-2xl font-bold text-blue-900">{formatNumber(userStats.totalPoints)}</p>
              </div>
              <Coins className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">{tp('consecutiveLabel')}</p>
                <p className="text-2xl font-bold text-green-900">{consecutiveDays}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
            <Badge className={`${getConsecutiveDaysColor(consecutiveDays)} text-white text-xs mt-1`}>
              {tp(`streakLabels.${getConsecutiveDaysLabelKey(consecutiveDays)}`)}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Check-ins</p>
                <p className="text-2xl font-bold text-purple-900">{totalCheckins.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => {
            refetchStats();
            refetchCan();
          }}
          className="flex-1"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {tp('refreshButton')}
        </Button>
        {canCheckin && (
          <Button
            onClick={() => {
              toast({ title: tp('checkinCta') });
              onPointsUpdate?.();
            }}
            className="flex-1"
          >
            {tp('checkinCta')}
          </Button>
        )}
      </div>

      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">{tp('statusTitle')}:</span>
              <span className="ml-2 font-medium">{userStats.isActive ? tp('statusActive') : tp('statusInactive')}</span>
            </div>
            <div>
              <span className="text-gray-600">{tp('statusCanCheckin')}:</span>
              <span className="ml-2 font-medium">{canCheckin ? tp('statusYes') : tp('statusNo')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
