"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Coins,
  Gift,
  TrendingUp,
  ExternalLink,
  RefreshCw,
  Star,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { formatEther } from "viem";

// 合约配置
const CONTRACT_ADDRESS = "0x3b016F5A7C462Fe51B691Ef18559DE720D9B452F";

// 合约ABI - 只包含我们需要的函数
const CONTRACT_ABI = [
  "function checkinCost() view returns (uint256)",
  "function canCheckin(address user) view returns (bool)",
  "function getUserStats(address user) view returns (uint256, uint256, uint256, uint256, uint256, uint256, bool)",
  "function previewCheckinRewards(address user) view returns (uint256, uint256, uint256)",
  "function performCheckin() payable",
  "function getCurrentDay() view returns (uint256)",
  "function totalUsers() view returns (uint256)",
  "function totalCheckins() view returns (uint256)",
  "function getContractInfo() view returns (uint256, uint256, uint256, uint256, uint256)",
  "event CheckinCompleted(address indexed user, uint256 pointsEarned, uint256 consecutiveDays, uint256 airdropWeightEarned, uint256 bnbPaid, uint256 timestamp)",
];

interface UserStats {
  totalPoints: bigint;
  consecutiveDays: bigint;
  lastCheckinDate: bigint;
  airdropWeight: bigint;
  totalBNBSpent: bigint;
  totalCheckins: bigint;
  isActive: boolean;
}

interface CheckinRewards {
  pointsEarned: bigint;
  airdropWeightEarned: bigint;
  consecutiveDays: bigint;
}

interface ContractInfo {
  checkinCost: bigint;
  totalUsers: bigint;
  totalCheckins: bigint;
  totalRevenue: bigint;
  contractBalance: bigint;
}

export default function Web3SmartContractInteraction({ walletAddress }: { walletAddress: string }) {
  const { isConnected } = useAccount();
  const [lastTransactionHash, setLastTransactionHash] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: userStatsData, refetch: refetchUserStats, isFetching: f1 } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI as any,
    functionName: "getUserStats",
    args: [walletAddress as `0x${string}`],
    query: { enabled: !!walletAddress },
  });
  const { data: contractInfoData, refetch: refetchContractInfo, isFetching: f2 } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI as any,
    functionName: "getContractInfo",
  });
  const { data: canCheckinData, refetch: refetchCan, isFetching: f3 } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI as any,
    functionName: "canCheckin",
    args: [walletAddress as `0x${string}`],
    query: { enabled: !!walletAddress },
  });
  const { data: previewRewardsData, refetch: refetchPreview, isFetching: f4 } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI as any,
    functionName: "previewCheckinRewards",
    args: [walletAddress as `0x${string}`],
    query: { enabled: !!walletAddress },
  });

  const userStats: UserStats | null = useMemo(() => {
    if (!userStatsData) return null;
    const d = userStatsData as any[];
    return {
      totalPoints: d[0],
      consecutiveDays: d[1],
      lastCheckinDate: d[2],
      airdropWeight: d[3],
      totalBNBSpent: d[4],
      totalCheckins: d[5],
      isActive: d[6],
    } as UserStats;
  }, [userStatsData]);

  const contractInfo: ContractInfo | null = useMemo(() => {
    if (!contractInfoData) return null;
    const d = contractInfoData as any[];
    return {
      checkinCost: d[0],
      totalUsers: d[1],
      totalCheckins: d[2],
      totalRevenue: d[3],
      contractBalance: d[4],
    } as ContractInfo;
  }, [contractInfoData]);

  const canCheckin = Boolean(canCheckinData);
  const checkinRewards: CheckinRewards | null = useMemo(() => {
    if (!previewRewardsData) return null;
    const d = previewRewardsData as any[];
    return { pointsEarned: d[0], airdropWeightEarned: d[1], consecutiveDays: d[2] } as CheckinRewards;
  }, [previewRewardsData]);

  const { writeContract, isPending } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const { isLoading: isWaiting } = useWaitForTransactionReceipt({ hash: txHash, query: { enabled: !!txHash } });

  const isLoading = f1 || f2 || f3 || f4;

  const performCheckin = async () => {
    if (!isConnected || !canCheckin || !contractInfo) {
      toast({ title: "无法签到", description: "请连接钱包或今天已签到", variant: "destructive" });
      return;
    }
    try {
      const hash = await writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI as any,
        functionName: "performCheckin",
        value: contractInfo.checkinCost,
      });
      setTxHash(hash as `0x${string}`);
      setLastTransactionHash(hash as string);
      toast({ title: "签到中...", description: `交易已提交: ${(hash as string).slice(0, 10)}...` });
      setTimeout(() => {
        refetchUserStats();
        refetchCan();
        refetchPreview();
        refetchContractInfo();
      }, 1500);
    } catch (error: any) {
      console.error("Error performing checkin:", error);
      let errorMessage = "签到失败，请重试";
      if (error?.code === "INSUFFICIENT_FUNDS") errorMessage = "BNB余额不足，请充值后重试";
      else if (error?.message?.includes("User denied")) errorMessage = "用户取消了交易";
      else if (error?.message?.includes("gas")) errorMessage = "Gas费用不足，请检查网络设置";
      toast({ title: "签到失败", description: errorMessage, variant: "destructive" });
    }
  };

  const formatBNB = (wei: bigint) => {
    return parseFloat(formatEther(wei)).toFixed(4);
  };

  const formatNumber = (num: bigint) => {
    const n = Number(num);
    if (n >= 1000000) {
      return (n / 1000000).toFixed(1) + 'M';
    } else if (n >= 1000) {
      return (n / 1000).toFixed(1) + 'K';
    }
    return n.toString();
  };

  const getConsecutiveDaysColor = (days: number) => {
    if (days >= 100) return 'from-purple-500 to-purple-600';
    if (days >= 60) return 'from-blue-500 to-blue-600';
    if (days >= 30) return 'from-green-500 to-green-600';
    if (days >= 15) return 'from-yellow-500 to-yellow-600';
    if (days >= 7) return 'from-orange-500 to-orange-600';
    return 'from-gray-500 to-gray-600';
  };

  const getConsecutiveDaysLabel = (days: number) => {
    if (days >= 100) return 'LEGENDARY';
    if (days >= 60) return 'ELITE';
    if (days >= 30) return 'EXPERT';
    if (days >= 15) return 'ADVANCED';
    if (days >= 7) return 'BEGINNER';
    return 'STARTER';
  };

  const getNextMilestone = (days: number) => {
    if (days < 7) return { target: 7, reward: '1.5x' };
    if (days < 15) return { target: 15, reward: '2x' };
    if (days < 30) return { target: 30, reward: '3x' };
    if (days < 60) return { target: 60, reward: '4x' };
    if (days < 100) return { target: 100, reward: '5x' };
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
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

  if (!userStats || !contractInfo) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">无法加载智能合约数据</p>
          <Button onClick={() => { refetchUserStats(); refetchContractInfo(); refetchCan(); refetchPreview(); }} className="mt-2">
            <RefreshCw className="w-4 h-4 mr-2" />
            重试
          </Button>
        </CardContent>
      </Card>
    );
  }

  const consecutiveDays = Number(userStats.consecutiveDays);
  const nextMilestone = getNextMilestone(consecutiveDays);

  return (
    <div className="space-y-6">
      {/* 签到操作卡片 */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Web3 Daily Check-in
            </span>
            {canCheckin ? (
              <Badge className="bg-green-500 text-white">
                <Clock className="w-3 h-3 mr-1" />
                可签到
              </Badge>
            ) : (
              <Badge variant="secondary">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                已签到
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {canCheckin && checkinRewards && (
            <div className="p-4 bg白 rounded-lg border">
              <h4 className="font-semibold mb-2">今日签到奖励预览:</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-gray-600">积分</p>
                  <p className="text-lg font-bold text-blue-600">+{formatNumber(checkinRewards.pointsEarned)}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">空投权重</p>
                  <p className="text-lg font-bold text-purple-600">+{(Number(checkinRewards.airdropWeightEarned) / 1000).toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">连续天数</p>
                  <p className="text-lg font-bold text-green-600">{formatNumber(checkinRewards.consecutiveDays)}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">签到费用</p>
              <p className="text-lg font-semibold">{formatBNB(contractInfo.checkinCost)} BNB</p>
            </div>

            <Button onClick={performCheckin} disabled={!canCheckin || isPending || isWaiting} className="min-w-[120px]" size="lg">
              {isPending || isWaiting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Gift className="w-4 h-4 mr-2" />}
              {isPending || isWaiting ? '签到中...' : canCheckin ? '立即签到' : '今日已签到'}
            </Button>
          </div>

          {lastTransactionHash && (
            <div className="p-2 bg-green-50 rounded border border-green-200">
              <p className="text-sm text-green-700">
                最近交易:
                <Button
                  variant="link"
                  className="h-auto p-0 ml-1 text-green-700"
                  onClick={() => window.open(`https://bscscan.com/tx/${lastTransactionHash}`, '_blank')}
                >
                  {lastTransactionHash.slice(0, 10)}...
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 用户统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">总积分</p>
                <p className="text-2xl font-bold text-blue-900">{formatNumber(userStats.totalPoints)}</p>
              </div>
              <Coins className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">空投权重</p>
                <p className="text-2xl font-bold text-purple-900">{(Number(userStats.airdropWeight) / 1000).toFixed(1)}</p>
              </div>
              <Gift className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">连续签到</p>
                <p className="text-2xl font-bold text-green-900">{consecutiveDays}天</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
            <Badge className={`bg-gradient-to-r ${getConsecutiveDaysColor(consecutiveDays)} text-white text-xs mt-1`}>{getConsecutiveDaysLabel(consecutiveDays)}</Badge>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">总投入</p>
                <p className="text-2xl font-bold text-orange-900">{formatBNB(userStats.totalBNBSpent)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-xs text-orange-500 mt-1">BNB</p>
          </CardContent>
        </Card>
      </div>

      {/* 进度条 */}
      {nextMilestone && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5" />
              下一个里程碑
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>连续签到进度</span>
              <span>
                {consecutiveDays}/{nextMilestone.target}天
              </span>
            </div>
            <Progress value={(consecutiveDays / nextMilestone.target) * 100} className="h-2" />
            <p className="text-sm text-gray-600">
              还需签到 {nextMilestone.target - consecutiveDays} 天解锁
              <span className="font-semibold text-blue-600"> {nextMilestone.reward} 奖励倍数</span>
            </p>
          </CardContent>
        </Card>
      )}

      {/* 合约统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">合约统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <p className="text-gray-600">总用户数</p>
              <p className="text-lg font-bold text-blue-600">{formatNumber(contractInfo.totalUsers)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">总签到次数</p>
              <p className="text-lg font-bold text-green-600">{formatNumber(contractInfo.totalCheckins)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">总收入</p>
              <p className="text-lg font-bold text-purple-600">{formatBNB(contractInfo.totalRevenue)} BNB</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">合约余额</p>
              <p className="text-lg font-bold text-orange-600">{formatBNB(contractInfo.contractBalance)} BNB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => {
            refetchUserStats();
            refetchContractInfo();
            refetchCan();
            refetchPreview();
          }}
          className="flex-1"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新数据
        </Button>
        <Button
          variant="outline"
          onClick={() => window.open(`https://bscscan.com/address/${CONTRACT_ADDRESS}`, '_blank')}
          className="flex-1"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          查看合约
        </Button>
      </div>
    </div>
  );
}

