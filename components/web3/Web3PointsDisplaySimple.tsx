'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, Calendar, TrendingUp, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ethers } from 'ethers';

// Contract configuration
const CONTRACT_ADDRESS = '0x3b016F5A7C462Fe51B691Ef18559DE720D9B452F';
const CONTRACT_ABI = [
  "function getUserStats(address user) view returns (uint256, uint256, uint256, uint256, uint256, uint256, bool)",
  "function canCheckin(address user) view returns (bool)",
  "function totalUsers() view returns (uint256)",
  "function totalCheckins() view returns (uint256)"
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

interface Web3PointsDisplaySimpleProps {
  walletAddress: string;
  onPointsUpdate?: () => void;
}

export default function Web3PointsDisplaySimple({ 
  walletAddress, 
  onPointsUpdate 
}: Web3PointsDisplaySimpleProps) {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [canCheckin, setCanCheckin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (walletAddress) {
      checkNetwork();
      loadContractData();
    }
  }, [walletAddress]);

  const checkNetwork = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        setIsCorrectNetwork(Number(network.chainId) === 56); // BSC Mainnet
      } catch (error) {
        console.error('Error checking network:', error);
        setIsCorrectNetwork(false);
      }
    }
  };

  const loadContractData = async () => {
    setLoading(true);
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        
        if (Number(network.chainId) !== 56) {
          setIsCorrectNetwork(false);
          setLoading(false);
          return;
        }
        
        setIsCorrectNetwork(true);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        const [userStatsData, canCheckinData] = await Promise.all([
          contract.getUserStats(walletAddress),
          contract.canCheckin(walletAddress)
        ]);

        setUserStats({
          totalPoints: userStatsData[0],
          consecutiveDays: userStatsData[1],
          lastCheckinDate: userStatsData[2],
          airdropWeight: userStatsData[3],
          totalBNBSpent: userStatsData[4],
          totalCheckins: userStatsData[5],
          isActive: userStatsData[6]
        });

        setCanCheckin(canCheckinData);
      }
    } catch (error) {
      console.error('Error loading contract data:', error);
      toast({
        title: "Error",
        description: "Failed to load contract data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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

  const getConsecutiveDaysLabel = (days: number) => {
    if (days >= 100) return 'LEGENDARY';
    if (days >= 60) return 'ELITE';
    if (days >= 30) return 'EXPERT';
    if (days >= 15) return 'ADVANCED';
    if (days >= 7) return 'BEGINNER';
    return 'STARTER';
  };

  const getConsecutiveDaysColor = (days: number) => {
    if (days >= 100) return 'bg-purple-500';
    if (days >= 60) return 'bg-blue-500';
    if (days >= 30) return 'bg-green-500';
    if (days >= 15) return 'bg-yellow-500';
    if (days >= 7) return 'bg-orange-500';
    return 'bg-gray-500';
  };

  if (!isCorrectNetwork) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Please switch to BSC Mainnet to view your Web3 stats</p>
        </CardContent>
      </Card>
    );
  }

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

  if (!userStats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No Web3 data available</p>
          <Button 
            variant="outline" 
            onClick={loadContractData}
            className="mt-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const consecutiveDays = Number(userStats.consecutiveDays);
  const totalCheckins = Number(userStats.totalCheckins);

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Points */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Points</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatNumber(userStats.totalPoints)}
                </p>
              </div>
              <Coins className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Consecutive Days */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Consecutive Days</p>
                <p className="text-2xl font-bold text-green-900">
                  {consecutiveDays}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
            <Badge 
              className={`${getConsecutiveDaysColor(consecutiveDays)} text-white text-xs mt-1`}
            >
              {getConsecutiveDaysLabel(consecutiveDays)}
            </Badge>
          </CardContent>
        </Card>

        {/* Total Check-ins */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Check-ins</p>
                <p className="text-2xl font-bold text-purple-900">
                  {totalCheckins}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={loadContractData}
          className="flex-1"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
        {canCheckin && (
          <Button 
            onClick={() => {
              if (onPointsUpdate) onPointsUpdate();
            }}
            className="flex-1"
          >
            Check In Available
          </Button>
        )}
      </div>

      {/* Status Info */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Status:</span>
              <span className="ml-2 font-medium">
                {userStats.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Can Check-in:</span>
              <span className="ml-2 font-medium">
                {canCheckin ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}