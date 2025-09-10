'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Gift, 
  Wallet, 
  Coins, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Loader2, 
  AlertTriangle,
  RefreshCw,
  ExternalLink 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useDailyCheckin } from '@/hooks/useDailyCheckin';
import { ethers } from 'ethers';

interface UnifiedCheckinWelcomeProps {
  user: any;
  isWeb3User: boolean;
  userProfile: any;
}

// Web3 contract configuration
const CONTRACT_ADDRESS = '0x3b016F5A7C462Fe51B691Ef18559DE720D9B452F';
const CONTRACT_ABI = [
  "function checkinCost() view returns (uint256)",
  "function canCheckin(address user) view returns (bool)",
  "function getUserStats(address user) view returns (uint256, uint256, uint256, uint256, uint256, uint256, bool)",
  "function previewCheckinRewards(address user) view returns (uint256, uint256, uint256)",
  "function performCheckin() payable",
  "event CheckinCompleted(address indexed user, uint256 pointsEarned, uint256 consecutiveDays, uint256 airdropWeightEarned, uint256 bnbPaid, uint256 timestamp)"
];

interface Web3CheckinData {
  canCheckin: boolean;
  checkinCost: bigint;
  previewPoints: bigint;
  previewConsecutiveDays: bigint;
  userBalance: bigint;
  userStats?: {
    totalPoints: bigint;
    consecutiveDays: bigint;
    totalCheckins: bigint;
  };
}

export default function UnifiedCheckinWelcome({ user, isWeb3User, userProfile }: UnifiedCheckinWelcomeProps) {
  // Web2 check-in hooks
  const { 
    performCheckin, 
    fetchCheckinStatus,
    getCheckinSummary,
    getNextConsecutiveReward 
  } = useDailyCheckin();

  // Web3 states
  const [web3Loading, setWeb3Loading] = useState(false);
  const [web3CheckinData, setWeb3CheckinData] = useState<Web3CheckinData | null>(null);
  const [web3Result, setWeb3Result] = useState<string | null>(null);
  const [lastTransactionHash, setLastTransactionHash] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  // Initialize Web3 for Web3 users
  useEffect(() => {
    if (isWeb3User && typeof window !== 'undefined' && window.ethereum) {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);
    }
  }, [isWeb3User]);

  // Load Web3 check-in data
  useEffect(() => {
    if (isWeb3User && provider && user?.wallet_address) {
      loadWeb3CheckinData();
    }
  }, [isWeb3User, provider, user?.wallet_address]);

  const loadWeb3CheckinData = async () => {
    if (!provider || !user?.wallet_address) return;
    
    setWeb3Loading(true);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      // Get user BNB balance
      const balance = await provider.getBalance(user.wallet_address);
      
      // Load contract data in parallel
      const [canCheckin, checkinCost, previewRewards, userStats] = await Promise.all([
        contract.canCheckin(user.wallet_address),
        contract.checkinCost(),
        contract.previewCheckinRewards(user.wallet_address),
        contract.getUserStats(user.wallet_address)
      ]);

      setWeb3CheckinData({
        canCheckin,
        checkinCost,
        previewPoints: previewRewards[0],
        previewConsecutiveDays: previewRewards[2],
        userBalance: balance,
        userStats: {
          totalPoints: userStats[0],
          consecutiveDays: userStats[1],
          totalCheckins: userStats[2]
        }
      });
    } catch (error) {
      console.error('Failed to load Web3 check-in data:', error);
      setWeb3Result('Unable to load check-in data, please refresh and try again');
    } finally {
      setWeb3Loading(false);
    }
  };

  const handleWeb3Checkin = async () => {
    if (!provider || !web3CheckinData) return;
    
    setWeb3Loading(true);
    setWeb3Result(null);

    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      // Execute paid check-in
      const tx = await contract.performCheckin({
        value: web3CheckinData.checkinCost,
        gasLimit: 500000
      });

      setLastTransactionHash(tx.hash);
      setWeb3Result(`Check-in transaction submitted, waiting for confirmation...`);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setWeb3Result(`🎉 Check-in successful! Earned ${ethers.formatUnits(web3CheckinData.previewPoints, 0)} credits`);
        
        // Refresh data
        await loadWeb3CheckinData();
      } else {
        setWeb3Result('Transaction failed, please try again');
      }
    } catch (error: any) {
      console.error('Web3 check-in failed:', error);
      
      let errorMessage = 'Check-in failed, please try again';
      if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient BNB balance, please top up';
      } else if (error.message?.includes('User denied')) {
        errorMessage = 'Transaction cancelled by user';
      } else if (error.message?.includes('gas')) {
        errorMessage = 'Insufficient gas, please check network settings';
      }
      
      setWeb3Result(errorMessage);
    } finally {
      setWeb3Loading(false);
    }
  };

  const handleWeb2Checkin = async () => {
    const checkinSummary = getCheckinSummary();
    if (checkinSummary.canCheckin) {
      await performCheckin();
    }
  };

  // Get Web2 check-in data
  const checkinSummary = getCheckinSummary();
  const nextReward = getNextConsecutiveReward();
  const consecutiveDays = checkinSummary.consecutiveDays;

  if (!user) {
    return null; // Don't show anything if user is not logged in
  }

  return (
    <Card className="mb-8 dark:bg-slate-800 dark:border-slate-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 bg-gradient-to-r ${isWeb3User ? 'from-blue-400 to-purple-500' : 'from-green-400 to-emerald-500'} rounded-full flex items-center justify-center`}>
              {isWeb3User ? <Wallet className="w-6 h-6 text-white" /> : <Calendar className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {isWeb3User ? 'Web3 Check-in' : 'Daily Check-in'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {isWeb3User ? 'Earn credits through smart contract interaction' : 'Earn free analysis credits'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isWeb3User ? (
              <>
                {web3CheckinData?.canCheckin ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <Clock className="w-3 h-3 mr-1" />
                    Available
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                )}
                
                <Button 
                  onClick={handleWeb3Checkin}
                  disabled={web3Loading || !web3CheckinData?.canCheckin}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg"
                >
                  {web3Loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking in...
                    </>
                  ) : (
                    <>
                      <Gift className="w-4 h-4 mr-2" />
                      {web3CheckinData?.canCheckin ? 'On-chain Check-in' : 'Already checked in'}
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                {checkinSummary.canCheckin ? (
                  <Button 
                    onClick={handleWeb2Checkin}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Check In
                  </Button>
                ) : (
                  <Badge variant="secondary" className="px-4 py-2">
                    ✅ Checked In Today
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>

        {/* Web3 Preview Rewards */}
        {isWeb3User && web3CheckinData?.canCheckin && (
          <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Credits</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                +{ethers.formatUnits(web3CheckinData.previewPoints, 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Consecutive Days</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {ethers.formatUnits(web3CheckinData.previewConsecutiveDays, 0)}
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          {isWeb3User ? (
            <>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Wallet:</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold ml-2 font-mono">
                  {`${user.wallet_address?.slice(0, 6)}...${user.wallet_address?.slice(-4)}`}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Network:</span>
                <span className="text-purple-600 dark:text-purple-400 font-semibold ml-2">
                  BSC Mainnet
                </span>
              </div>
              {web3CheckinData?.userStats && (
                <>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total Points:</span>
                    <span className="text-green-600 dark:text-green-400 font-semibold ml-2">
                      {ethers.formatUnits(web3CheckinData.userStats.totalPoints, 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Consecutive Days:</span>
                    <span className="text-purple-600 dark:text-purple-400 font-semibold ml-2">
                      {ethers.formatUnits(web3CheckinData.userStats.consecutiveDays, 0)}
                    </span>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Consecutive Days:</span>
                <span className="text-purple-600 dark:text-purple-400 font-semibold ml-2">
                  {consecutiveDays}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Next Reward:</span>
                <span className="text-purple-600 dark:text-purple-400 font-semibold ml-2">
                  {nextReward ? `Day ${nextReward.requiredDays}` : 'Max reached'}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Web3 Result Messages */}
        {isWeb3User && web3Result && (
          <Alert className={web3Result.includes('successful') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            {web3Result.includes('successful') ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={web3Result.includes('successful') ? 'text-green-700' : 'text-red-700'}>
              {web3Result}
            </AlertDescription>
          </Alert>
        )}

        {/* Transaction Hash Display */}
        {isWeb3User && lastTransactionHash && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Transaction Hash: 
              <Button
                variant="link"
                className="h-auto p-0 ml-1 text-blue-600 dark:text-blue-400"
                onClick={() => window.open(`https://bscscan.com/tx/${lastTransactionHash}`, '_blank')}
              >
                {lastTransactionHash.slice(0, 16)}...
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </p>
          </div>
        )}

        {/* Benefits Info */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>{isWeb3User ? 'Web3' : 'Daily'} Benefits:</strong> {isWeb3User 
              ? 'Smart contract check-ins are recorded on-chain and earn you credits for platform activities.'
              : 'Regular check-ins help you earn free analysis credits and unlock special rewards.'
            }
          </p>
        </div>

        {/* Welcome Message */}
        {userProfile && (
          <div className="mt-4 flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {userProfile.nickname?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Welcome back, {userProfile.nickname || 'User'}!
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Ready to explore your destiny today?
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}