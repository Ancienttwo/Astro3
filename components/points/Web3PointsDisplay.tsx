"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, Gift, TrendingUp, Calendar, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNamespaceTranslations } from '@/lib/i18n/useI18n';

interface Web3PointsData {
  chain_points_balance: number;
  total_chain_earned: number;
  airdrop_weight: number;
  consecutive_days: number;
  last_checkin_date: string;
  total_bnb_spent: number;
  is_active: boolean;
  recentCheckins: Array<{
    checkin_date: string;
    consecutive_days: number;
    points_earned: number;
    airdrop_weight_earned: number;
    tx_hash?: string;
  }>;
  airdropEligibility: {
    total_weight: number;
    estimated_tokens: number;
    checkin_weight: number;
    activity_weight: number;
  } | null;
}

interface Web3PointsDisplayProps {
  walletAddress: string;
  onPointsUpdate?: () => void;
}

export default function Web3PointsDisplay({ walletAddress, onPointsUpdate }: Web3PointsDisplayProps) {
  const [pointsData, setPointsData] = useState<Web3PointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [canCheckin, setCanCheckin] = useState(false);
  const { toast } = useToast();
  const t = useNamespaceTranslations('web3/auth');
  const tp = (path: string, values?: Record<string, unknown>) => t(`points.${path}`, values);
  const tc = (path: string, values?: Record<string, unknown>) => t(`integration.checkinCard.${path}`, values);
  const tm = (path: string, values?: Record<string, unknown>) => t(`integration.milestone.${path}`, values);
  const ts = (path: string, values?: Record<string, unknown>) => t(`integration.stats.${path}`, values);
  const ta = (path: string, values?: Record<string, unknown>) => t(`integration.actions.${path}`, values);
  const terr = (path: string, values?: Record<string, unknown>) => t(`integration.errors.${path}`, values);

  useEffect(() => {
    if (walletAddress) {
      fetchPointsData();
    }
  }, [walletAddress]);

  useEffect(() => {
    if (pointsData) {
      const today = new Date().toISOString().split('T')[0];
      const lastCheckin = pointsData.last_checkin_date;
      setCanCheckin(!lastCheckin || lastCheckin !== today);
    }
  }, [pointsData]);

  const fetchPointsData = async () => {
    setLoading(true);
    try {
      const web3UserData = {
        walletAddress,
        chainId: 56,
        authType: 'web3'
      };

      const response = await fetch('/api/points/web3', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Web3-User': btoa(encodeURIComponent(JSON.stringify(web3UserData)))
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setPointsData(result.data);
      } else {
        toast({
          title: terr('loadFailed'),
          description: result.error || terr('retry'),
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching points data:', error);
      toast({
        title: terr('loadFailed'),
        description: terr('retry'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number, decimals: number = 2): string => {
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(decimals) + 'M';
    } else if (num >= 1_000) {
      return (num / 1_000).toFixed(decimals) + 'K';
    }
    return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: decimals });
  };

  const getConsecutiveDaysColor = (days: number): string => {
    if (days >= 100) return 'bg-purple-500';
    if (days >= 60) return 'bg-blue-500';
    if (days >= 30) return 'bg-green-500';
    if (days >= 15) return 'bg-yellow-500';
    if (days >= 7) return 'bg-orange-500';
    return 'bg-gray-500';
  };

  const getConsecutiveDaysLabelKey = (days: number) => {
    if (days >= 100) return 'legendary';
    if (days >= 60) return 'elite';
    if (days >= 30) return 'expert';
    if (days >= 15) return 'advanced';
    if (days >= 7) return 'beginner';
    return 'starter';
  };

  const getNextMilestone = (days: number) => {
    if (days < 7) return { target: 7, reward: '1.5x' };
    if (days < 15) return { target: 15, reward: '2x' };
    if (days < 30) return { target: 30, reward: '3x' };
    if (days < 60) return { target: 60, reward: '4x' };
    if (days < 100) return { target: 100, reward: '5x' };
    return { target: 0, reward: 'MAX' };
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

  if (!pointsData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">{tp('noData')}</p>
        </CardContent>
      </Card>
    );
  }

  const nextMilestone = getNextMilestone(pointsData.consecutive_days);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">{tp('pointsBalance')}</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatNumber(pointsData.chain_points_balance, 0)}
                </p>
              </div>
              <Coins className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-blue-500 mt-1">
              {tp('pointsTotalEarned', { amount: formatNumber(pointsData.total_chain_earned, 0) })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">{ts('airdrop')}</p>
                <p className="text-2xl font-bold text-purple-900">
                  {(pointsData.airdrop_weight / 1000).toFixed(1)}
                </p>
              </div>
              <Gift className="h-8 w-8 text-purple-500" />
            </div>
            {pointsData.airdropEligibility && (
              <p className="text-xs text-purple-500 mt-1">
                {tp('airdropEstimateLine', { amount: formatNumber(pointsData.airdropEligibility.estimated_tokens, 0) })}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">{ts('streak')}</p>
                <p className="text-2xl font-bold text-green-900">
                  {pointsData.consecutive_days}{ts('days')}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
            <Badge className={`${getConsecutiveDaysColor(pointsData.consecutive_days)} text-white text-xs mt-1`}>
              {tp(`streakLabels.${getConsecutiveDaysLabelKey(pointsData.consecutive_days)}`)}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">{ts('spend')}</p>
                <p className="text-2xl font-bold text-orange-900">
                  {pointsData.total_bnb_spent.toFixed(4)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-xs text-orange-500 mt-1">
              {tp('totalSpendSuffix', { usd: (pointsData.total_bnb_spent * 500).toFixed(2) })}
            </p>
          </CardContent>
        </Card>
      </div>

      {nextMilestone.target > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{tm('title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{tm('progressLabel')}</span>
                <span>{pointsData.consecutive_days}/{nextMilestone.target}{ts('days')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((pointsData.consecutive_days / nextMilestone.target) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                {tm('remaining', { days: Math.max(nextMilestone.target - pointsData.consecutive_days, 0) })}
                <span className="font-semibold text-blue-600"> {tm('reward', { reward: nextMilestone.reward })}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {pointsData.airdropEligibility && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {tp('airdropTitle')}
              <Badge variant="outline" className="text-green-600 border-green-600">
                {tp('airdropQualified')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">{tp('airdropCheckin')}</p>
                <p className="text-xl font-bold text-blue-600">
                  {pointsData.airdropEligibility.checkin_weight.toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">{tp('airdropActivity')}</p>
                <p className="text-xl font-bold text-purple-600">
                  {pointsData.airdropEligibility.activity_weight.toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">{tp('airdropTotal')}</p>
                <p className="text-xl font-bold text-green-600">
                  {pointsData.airdropEligibility.total_weight.toFixed(1)}
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                {tp('airdropEstimateLine', { amount: formatNumber(pointsData.airdropEligibility.estimated_tokens, 0) })}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {tp('airdropDisclaimer')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {pointsData.recentCheckins && pointsData.recentCheckins.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{tp('recentTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pointsData.recentCheckins.slice(0, 5).map((checkin, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium">{checkin.checkin_date}</p>
                    <p className="text-sm text-gray-600">
                      {tp('recentStreak', { days: checkin.consecutive_days })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">+{checkin.points_earned} {tp('pointsUnit')}</p>
                    <p className="text-sm text-gray-600">
                      +{(checkin.airdrop_weight_earned / 1000).toFixed(1)} {tp('airdropUnit')}
                    </p>
                  </div>
                  {checkin.tx_hash && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://bscscan.com/tx/${checkin.tx_hash}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        {canCheckin && (
          <Button
            onClick={() => {
              onPointsUpdate?.();
            }}
            className="flex-1"
          >
            {tp('checkinCta')}
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => window.location.href = '/points/shop'}
          className="flex-1"
        >
          {tp('pointsShop')}
        </Button>
      </div>

      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">{tp('statusTitle')}:</span>
              <span className="ml-2 font-medium">{pointsData.is_active ? tp('statusActive') : tp('statusInactive')}</span>
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
