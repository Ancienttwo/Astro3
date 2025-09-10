'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Coins, 
  Zap, 
  TrendingUp, 
  Calendar, 
  Gift, 
  Wallet,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { 
  web3CheckinService, 
  type UserCheckinData, 
  type CheckinRewards,
  type CheckinResult
} from '@/lib/web3-checkin';

interface Web3DailyCheckinProps {
  userAddress?: string;
  onCheckinSuccess?: (result: CheckinResult) => void;
}

interface ConnectedWalletInfo {
  address: string;
  balance: string;
  isConnected: boolean;
}

export default function Web3DailyCheckin({ 
  userAddress, 
  onCheckinSuccess 
}: Web3DailyCheckinProps) {
  // State management
  const [walletInfo, setWalletInfo] = useState<ConnectedWalletInfo | null>(null);
  const [checkinData, setCheckinData] = useState<UserCheckinData | null>(null);
  const [previewRewards, setPreviewRewards] = useState<CheckinRewards | null>(null);
  const [loading, setLoading] = useState(false);
  const [canCheckin, setCanCheckin] = useState(false);
  const [checkinPrice, setCheckinPrice] = useState('0.0002');
  const [isNetworkCorrect, setIsNetworkCorrect] = useState(false);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        toast({
          title: "Wallet not found",
          description: "Please install MetaMask or other Web3 wallet",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      
      // Request connection
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Check network
      const isCorrectNetwork = await web3CheckinService.checkNetwork();
      if (!isCorrectNetwork) {
        const switched = await web3CheckinService.switchToBSC();
        if (!switched) {
          toast({
            title: "Network error",
            description: "Please switch to BSC mainnet",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Get user address and balance
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        const address = accounts[0];
        const balance = await web3CheckinService.getBNBBalance(address);
        
        setWalletInfo({
          address,
          balance,
          isConnected: true,
        });
        
        // Get check-in data
        await fetchCheckinData(address);
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection failed",
        description: error.message || "Unable to connect wallet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Get check-in data
  const fetchCheckinData = useCallback(async (address: string) => {
    try {
      setLoading(true);
      
      // Get data in parallel
      const [userData, rewards, canCheckinToday, currentPrice] = await Promise.all([
        web3CheckinService.getUserCheckinData(address),
        web3CheckinService.previewCheckinRewards(address),
        web3CheckinService.canCheckinToday(address),
        web3CheckinService.getCurrentCheckinPrice(),
      ]);
      
      setCheckinData(userData);
      setPreviewRewards(rewards);
      setCanCheckin(canCheckinToday);
      setCheckinPrice(currentPrice);
      
    } catch (error) {
      console.error('Error fetching checkin data:', error);
      toast({
        title: "Failed to fetch data",
        description: "Unable to get check-in information, please retry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Execute check-in
  const performCheckin = useCallback(async () => {
    if (!walletInfo) {
      // Direct MetaMask trigger, no extra prompt
      return;
    }

    try {
      setLoading(true);
      
      const result = await web3CheckinService.performCheckin();
      
      if (result.success) {
        toast({
          title: "Check-in successful!",
          description: `Earned ${result.creditsEarned} credits and ${result.aiReportsEarned} AI analyses`,
          variant: "default",
        });
        
        // Refresh data
        await fetchCheckinData(walletInfo.address);
        
        // Callback
        if (onCheckinSuccess) {
          onCheckinSuccess(result);
        }
      } else {
        toast({
          title: "Check-in failed",
          description: result.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error performing checkin:', error);
      toast({
        title: "Check-in failed",
        description: error.message || "Transaction failed, please retry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [walletInfo, fetchCheckinData, onCheckinSuccess]);

  // Refresh data
  const refreshData = useCallback(async () => {
    if (walletInfo) {
      await fetchCheckinData(walletInfo.address);
      // Refresh balance
      const newBalance = await web3CheckinService.getBNBBalance(walletInfo.address);
      setWalletInfo(prev => prev ? { ...prev, balance: newBalance } : null);
    }
  }, [walletInfo, fetchCheckinData]);

  // Check network status
  useEffect(() => {
    const checkNetwork = async () => {
      const correct = await web3CheckinService.checkNetwork();
      setIsNetworkCorrect(correct);
    };
    
    if (walletInfo) {
      checkNetwork();
    }
  }, [walletInfo]);

  // Auto-connect authorized wallet
  useEffect(() => {
    const autoConnect = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await connectWallet();
          }
        } catch (error) {
          console.error('Auto connect failed:', error);
        }
      }
    };
    
    autoConnect();
  }, [connectWallet]);

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setWalletInfo(null);
          setCheckinData(null);
          setPreviewRewards(null);
        } else {
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [connectWallet]);

  // Get consecutive check-in progress
  const getConsecutiveProgress = () => {
    if (!checkinData) return { current: 0, next: 7, progress: 0 };
    
    const consecutiveDays = checkinData.consecutiveDays;
    const milestones = [7, 15, 30, 60, 100];
    
    for (const milestone of milestones) {
      if (consecutiveDays < milestone) {
        return {
          current: consecutiveDays,
          next: milestone,
          progress: (consecutiveDays / milestone) * 100,
        };
      }
    }
    
    // Over 100 days, show 100-day cycle
    const cycleProgress = consecutiveDays % 100;
    return {
      current: consecutiveDays,
      next: 100,
      progress: (cycleProgress / 100) * 100,
    };
  };

  const consecutiveProgress = getConsecutiveProgress();

  if (!walletInfo) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Web3 Daily Check-in</CardTitle>
          <CardDescription>
            Connect wallet to start your Web3 check-in journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Check-in cost: ~{checkinPrice} BNB (~$0.1)
            </p>
            <p className="text-xs text-muted-foreground">
              Earn credits and AI analysis sessions
            </p>
          </div>
          
          <Button 
            onClick={connectWallet} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Wallet info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Wallet Info</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Address</span>
            <span className="text-sm font-mono">
              {walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-4)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">BNB Balance</span>
            <span className="text-sm font-medium">
              {parseFloat(walletInfo.balance).toFixed(4)} BNB
            </span>
          </div>
          
          {!isNetworkCorrect && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please switch to BSC mainnet for check-in
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Check-in status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Today's Check-in</span>
          </CardTitle>
          <CardDescription>
            Daily check-in to earn credits and AI analysis sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {checkinData && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {checkinData.consecutiveDays}
                </div>
                <div className="text-xs text-muted-foreground">Consecutive Days</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {checkinData.totalCredits}
                </div>
                <div className="text-xs text-muted-foreground">Total Credits</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {checkinData.totalAiReports}
                </div>
                <div className="text-xs text-muted-foreground">AI Analyses</div>
              </div>
            </div>
          )}

          <Separator />

          {previewRewards && (
            <div className="space-y-3">
              <h4 className="font-medium">Next Check-in Rewards Preview</h4>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-2">
                  <Coins className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Credits</span>
                </div>
                <Badge variant="secondary">+{previewRewards.nextCredits}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">AI Analyses</span>
                </div>
                <Badge variant="secondary">+{previewRewards.nextAiReports}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Consecutive Days</span>
                </div>
                <Badge variant="secondary">{previewRewards.nextConsecutiveDays} days</Badge>
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Consecutive Check-in Progress</span>
              <span className="text-sm text-muted-foreground">
                {consecutiveProgress.current}/{consecutiveProgress.next} days
              </span>
            </div>
            <Progress value={consecutiveProgress.progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {consecutiveProgress.next - consecutiveProgress.current} days until next reward level
            </p>
          </div>

          <div className="pt-4">
            {canCheckin ? (
              <Button 
                onClick={performCheckin} 
                disabled={loading || !isNetworkCorrect || parseFloat(walletInfo.balance) < parseFloat(checkinPrice)}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking in...
                  </>
                ) : (
                  <>
                    <Gift className="mr-2 h-4 w-4" />
                    Check-in Now ({checkinPrice} BNB)
                  </>
                )}
              </Button>
            ) : (
              <div className="text-center">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Checked in today
                </Badge>
              </div>
            )}
            
            {parseFloat(walletInfo.balance) < parseFloat(checkinPrice) && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Insufficient BNB balance, need at least {checkinPrice} BNB for check-in
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {checkinData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Check-in Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Total Check-in Days</div>
                <div className="text-xl font-bold">{checkinData.totalDays} days</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Total Spent</div>
                <div className="text-xl font-bold">{parseFloat(checkinData.totalSpent).toFixed(4)} BNB</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}