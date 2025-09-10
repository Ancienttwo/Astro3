'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, Gift, TrendingUp, Calendar, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Web3PointsData {
  chain_points_balance: number;
  total_chain_earned: number;
  airdrop_weight: number;
  consecutive_days: number;
  last_checkin_date: string;
  total_bnb_spent: number;
  is_active: boolean;
  recentCheckins: any[];
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

export default function Web3PointsDisplay({ 
  walletAddress, 
  onPointsUpdate 
}: Web3PointsDisplayProps) {
  const [pointsData, setPointsData] = useState<Web3PointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [canCheckin, setCanCheckin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (walletAddress) {
      fetchPointsData();
      checkCanCheckin();
    }
  }, [walletAddress]);

  const fetchPointsData = async () => {
    try {
      const web3UserData = {
        walletAddress: walletAddress,
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
          title: "获取积分信息失败",
          description: result.error || "请稍后重试",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching points data:', error);
      toast({
        title: "网络错误",
        description: "获取积分信息时发生错误",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkCanCheckin = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastCheckin = pointsData?.last_checkin_date;
    setCanCheckin(!lastCheckin || lastCheckin !== today);
  };

  const formatNumber = (num: number, decimals: number = 2): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(decimals) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(decimals) + 'K';
    }
    return num.toFixed(decimals);
  };

  const getConsecutiveDaysColor = (days: number): string => {
    if (days >= 100) return 'bg-purple-500';
    if (days >= 60) return 'bg-blue-500';
    if (days >= 30) return 'bg-green-500';
    if (days >= 15) return 'bg-yellow-500';
    if (days >= 7) return 'bg-orange-500';
    return 'bg-gray-500';
  };

  const getNextMilestone = (days: number): { target: number; reward: string } => {
    if (days < 7) return { target: 7, reward: '1.5x奖励' };
    if (days < 15) return { target: 15, reward: '2x奖励' };
    if (days < 30) return { target: 30, reward: '3x奖励' };
    if (days < 60) return { target: 60, reward: '4x奖励' };
    if (days < 100) return { target: 100, reward: '5x奖励' };
    return { target: 0, reward: '已达到最高等级！' };
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
          <p className="text-gray-500">暂无积分数据</p>
        </CardContent>
      </Card>
    );
  }

  const nextMilestone = getNextMilestone(pointsData.consecutive_days);

  return (
    <div className="space-y-6">
      {/* 主要积分信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 积分余额 */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">积分余额</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatNumber(pointsData.chain_points_balance, 0)}
                </p>
              </div>
              <Coins className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-blue-500 mt-1">
              总获得: {formatNumber(pointsData.total_chain_earned, 0)}
            </p>
          </CardContent>
        </Card>

        {/* 空投权重 */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">空投权重</p>
                <p className="text-2xl font-bold text-purple-900">
                  {(pointsData.airdrop_weight / 1000).toFixed(1)}
                </p>
              </div>
              <Gift className="h-8 w-8 text-purple-500" />
            </div>
            {pointsData.airdropEligibility && (
              <p className="text-xs text-purple-500 mt-1">
                预估: {formatNumber(pointsData.airdropEligibility.estimated_tokens, 0)} AZI
              </p>
            )}
          </CardContent>
        </Card>

        {/* 连续签到 */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">连续签到</p>
                <p className="text-2xl font-bold text-green-900">
                  {pointsData.consecutive_days}天
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
            <Badge 
              className={`${getConsecutiveDaysColor(pointsData.consecutive_days)} text-white text-xs mt-1`}
            >
              {pointsData.consecutive_days >= 100 ? 'MAX' : 
               pointsData.consecutive_days >= 60 ? 'ELITE' :
               pointsData.consecutive_days >= 30 ? 'EXPERT' :
               pointsData.consecutive_days >= 15 ? 'ADVANCED' :
               pointsData.consecutive_days >= 7 ? 'BEGINNER' : 'STARTER'}
            </Badge>
          </CardContent>
        </Card>

        {/* 总投入 */}
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">总投入</p>
                <p className="text-2xl font-bold text-orange-900">
                  {pointsData.total_bnb_spent.toFixed(4)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-xs text-orange-500 mt-1">
              BNB (≈${(pointsData.total_bnb_spent * 500).toFixed(2)})
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 进度信息 */}
      {nextMilestone.target > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">下一个里程碑</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>连续签到进度</span>
                <span>{pointsData.consecutive_days}/{nextMilestone.target}天</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((pointsData.consecutive_days / nextMilestone.target) * 100, 100)}%` 
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                再签到 {nextMilestone.target - pointsData.consecutive_days} 天解锁 
                <span className="font-semibold text-blue-600"> {nextMilestone.reward}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 空投资格详情 */}
      {pointsData.airdropEligibility && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              空投资格详情
              <Badge variant="outline" className="text-green-600 border-green-600">
                已合格
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">签到权重</p>
                <p className="text-xl font-bold text-blue-600">
                  {pointsData.airdropEligibility.checkin_weight.toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">活动权重</p>
                <p className="text-xl font-bold text-purple-600">
                  {pointsData.airdropEligibility.activity_weight.toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">总权重</p>
                <p className="text-xl font-bold text-green-600">
                  {pointsData.airdropEligibility.total_weight.toFixed(1)}
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                预估空投数量: <span className="font-bold">
                  {formatNumber(pointsData.airdropEligibility.estimated_tokens, 0)} AZI
                </span>
              </p>
              <p className="text-xs text-green-600 mt-1">
                *最终空投数量将在正式快照时确定
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 最近签到记录 */}
      {pointsData.recentCheckins && pointsData.recentCheckins.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">最近签到记录</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pointsData.recentCheckins.slice(0, 5).map((checkin, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium">{checkin.checkin_date}</p>
                    <p className="text-sm text-gray-600">
                      连续 {checkin.consecutive_days} 天
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">+{checkin.points_earned} 积分</p>
                    <p className="text-sm text-gray-600">
                      +{(checkin.airdrop_weight_earned / 1000).toFixed(1)} 权重
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

      {/* 操作按钮 */}
      <div className="flex gap-4">
        {canCheckin && (
          <Button 
            onClick={() => {
              // 触发签到流程
              if (onPointsUpdate) onPointsUpdate();
            }}
            className="flex-1"
          >
            立即签到 (0.0002 BNB)
          </Button>
        )}
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/points/shop'}
          className="flex-1"
        >
          积分商城
        </Button>
      </div>
    </div>
  );
}