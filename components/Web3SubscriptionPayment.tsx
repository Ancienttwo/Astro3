"use client";

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wallet, 
  Crown, 
  Star, 
  Check, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  ExternalLink,
  Copy
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAccount, useBalance, useReadContract, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem'

// BSC收款地址
const PAYMENT_RECEIVER_ADDRESS = '0xa047FFa6923BfE296B633A7b88f37dFcaAB93Cf3';

// USDT Contract Address on BSC
const USDT_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';

// USDT ABI (只需要transfer函数)
const USDT_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

// Web3订阅计划配置
interface Web3SubscriptionPlan {
  id: string;
  name: string;
  price: string; // USDT价格
  priceUSD: number;
  period: string;
  dailyPrice: string;
  badge?: string;
  badgeColor?: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
  description: string;
}

const web3Plans: Web3SubscriptionPlan[] = [
  {
    id: 'web3-trial',
    name: '1-Day Web3 Trial',
    price: '1.49',
    priceUSD: 1.49,
    period: 'day',
    dailyPrice: 'One-time only',
    badge: 'Web3 Special',
    badgeColor: 'bg-gradient-to-r from-blue-400 to-purple-500',
    features: [
      '100 AI Chat Sessions',
      'Unlimited Basic Analysis', 
      '20 Basic Reports',
      'On-chain verification',
      'Web3 exclusive features'
    ],
    buttonText: 'Pay 1.49 USDT',
    description: 'Perfect for trying Web3 features'
  },
  {
    id: 'web3-monthly',
    name: 'Monthly Web3 Plan',
    price: '19.99',
    priceUSD: 19.99,
    period: 'month',
    dailyPrice: '$0.67/day',
    features: [
      '50 Daily AI Chats',
      '100 Premium Reports/month',
      'Advanced Analysis Features',
      'Priority Support',
      'Smart contract rewards',
      'Airdrop eligibility'
    ],
    buttonText: 'Pay 19.99 USDT',
    description: 'Enhanced Web3 experience'
  },
  {
    id: 'web3-halfyear',
    name: '6-Month Web3 Plan',
    price: '89.99',
    priceUSD: 89.99,
    period: '6 months',
    dailyPrice: '$0.50/day',
    badge: 'Most Popular',
    badgeColor: 'bg-gradient-to-r from-amber-400 to-orange-500',
    popular: true,
    features: [
      '50 Daily AI Chats',
      '100 Premium Reports/month',
      'Advanced Analysis Features',
      'Priority Support',
      'Custom Report Templates',
      'Maximum airdrop weight',
      'Exclusive Web3 perks'
    ],
    buttonText: 'Pay 89.99 USDT',
    description: 'Best value for active users'
  },
  {
    id: 'web3-yearly',
    name: 'Annual Web3 Plan',
    price: '149.99',
    priceUSD: 149.99,
    period: 'year',
    dailyPrice: '$0.41/day',
    badge: 'Best Value',
    badgeColor: 'bg-gradient-to-r from-yellow-400 to-amber-500',
    features: [
      '50 Daily AI Chats',
      '100 Premium Reports/month',
      'Advanced Analysis Features',
      'Priority Support',
      'Custom Report Templates',
      'VIP airdrop allocation',
      'Early access to new features'
    ],
    buttonText: 'Pay 149.99 USDT',
    description: 'Ultimate Web3 membership'
  }
];

interface Web3SubscriptionPaymentProps {
  walletAddress?: string;
  onPaymentSuccess?: (plan: Web3SubscriptionPlan, txHash: string) => void;
}

export default function Web3SubscriptionPayment({ walletAddress, onPaymentSuccess }: Web3SubscriptionPaymentProps) {
  const { address, isConnected } = useAccount();
  const activeAddress = (walletAddress || address) as `0x${string}` | undefined;
  const [selectedPlan, setSelectedPlan] = useState<Web3SubscriptionPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTransactionHash, setLastTransactionHash] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  // USDT balance (ERC20)
  const { data: decimals } = useReadContract({
    address: USDT_CONTRACT_ADDRESS as `0x${string}`,
    abi: USDT_ABI as any,
    functionName: 'decimals',
  });
  const { data: usdtBalData, refetch: refetchUsdt } = useReadContract({
    address: USDT_CONTRACT_ADDRESS as `0x${string}`,
    abi: USDT_ABI as any,
    functionName: 'balanceOf',
    args: activeAddress ? [activeAddress] : undefined,
    query: { enabled: !!activeAddress },
  });
  const usdtBalance = useMemo(() => {
    const dec = Number(decimals ?? 18);
    const raw = (usdtBalData as bigint) ?? 0n;
    if (!dec) return '0';
    // format manually to avoid extra imports
    const s = raw.toString().padStart(dec + 1, '0');
    const intPart = s.slice(0, -dec) || '0';
    const frac = s.slice(-dec);
    const trimmed = `${intPart}.${frac}`.replace(/\.0+$/, '');
    return trimmed;
  }, [decimals, usdtBalData]);

  const { writeContract, isPending } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const { isLoading: isWaiting } = useWaitForTransactionReceipt({ hash: txHash, query: { enabled: !!txHash } });

  const handlePlanSelect = (plan: Web3SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!isConnected || !selectedPlan || !activeAddress) {
      toast({
        title: 'Error',
        description: 'Please ensure wallet is connected',
        variant: 'destructive',
      });
      return;
    }

    // Check if user has sufficient USDT balance
    const requiredAmount = parseFloat(selectedPlan.price);
    const userUsdtBal = parseFloat(usdtBalance);
    
    if (userUsdtBal < requiredAmount) {
      toast({
        title: 'Insufficient USDT Balance',
        description: `You need at least ${selectedPlan.price} USDT for this subscription`,
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // 如果不在 BSC 主网，引导切换
      try {
        await switchChain({ chainId: 56 });
      } catch (e) {
        // 忽略用户取消
      }

      // 执行 USDT transfer
      const dec = Number(decimals ?? 18);
      const amount = parseUnits(selectedPlan.price as `${number}`, dec);
      const hash = await writeContract({
        address: USDT_CONTRACT_ADDRESS as `0x${string}`,
        abi: USDT_ABI as any,
        functionName: 'transfer',
        args: [PAYMENT_RECEIVER_ADDRESS as `0x${string}`, amount],
      });

      setTxHash(hash as `0x${string}`);
      setLastTransactionHash(hash as string);
      
      toast({
        title: 'Payment Submitted',
        description: 'Transaction sent, waiting for confirmation...',
        variant: 'default',
      });

      // 等待确认（useWaitForTransactionReceipt 会跟踪）
      // 成功回调在下方 useEffect 里处理
    } catch (error: any) {
      toast({
        title: 'Payment Error',
        description: error?.message || 'Payment failed, please try again',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 等待交易确认并处理成功逻辑
  const { data: receipt } = useWaitForTransactionReceipt({ hash: txHash, query: { enabled: !!txHash } });
  React.useEffect(() => {
    if (!receipt || !selectedPlan) return;
    if (receipt.status === 'success') {
      toast({ title: 'Payment Successful!', description: `Successfully subscribed to ${selectedPlan.name}` });
      refetchUsdt();
      if (onPaymentSuccess && txHash) onPaymentSuccess(selectedPlan, txHash);
      setShowPaymentModal(false);
      setSelectedPlan(null);
    } else {
      toast({ title: 'Payment Failed', description: 'Transaction failed, please try again', variant: 'destructive' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt]);

  const copyAddress = () => {
    navigator.clipboard.writeText(PAYMENT_RECEIVER_ADDRESS);
    toast({
      title: 'Address Copied',
      description: 'Payment address copied to clipboard',
    });
  };

  const openTxExplorer = () => {
    if (lastTransactionHash) {
      window.open(`https://bscscan.com/tx/${lastTransactionHash}`, '_blank');
    }
  };

  if (!activeAddress) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-700">
          Please connect your Web3 wallet to view subscription options
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            Connected Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            <div>
              <span className="text-gray-600">Address:</span>
              <span className="ml-2 font-mono text-blue-600">
                {`${(activeAddress as string).slice(0, 6)}...${(activeAddress as string).slice(-4)}`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {web3Plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative transition-all duration-300 hover:shadow-lg ${
              plan.popular 
                ? 'border-purple-500 shadow-lg shadow-purple-100 scale-105' 
                : 'hover:border-purple-300'
            }`}
          >
            {/* Popular Badge */}
            {plan.badge && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <Badge className={`${plan.badgeColor} text-white px-3 py-1 text-sm font-medium shadow-lg`}>
                  {plan.badge}
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4 pt-8">
              <CardTitle className="text-xl font-bold text-gray-800">
                {plan.name}
              </CardTitle>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-blue-600">
                  {plan.price} USDT
                </div>
                <div className="text-sm text-gray-500">
                  /{plan.period}
                </div>
                <div className="text-xs text-gray-400">
                  {plan.dailyPrice}
                </div>
                <div className="text-xs text-gray-500">
                  (~${plan.priceUSD})
                </div>
              </div>
              <p className="text-sm text-gray-600 italic">
                {plan.description}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                className={`w-full py-3 text-sm font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                }`}
                onClick={() => handlePlanSelect(plan)}
                disabled={parseFloat(usdtBalance) < parseFloat(plan.price)}
              >
                {parseFloat(usdtBalance) < parseFloat(plan.price) 
                  ? 'Insufficient USDT' 
                  : plan.buttonText
                }
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-600" />
                Confirm Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">{selectedPlan.name}</h3>
                <div className="text-2xl font-bold text-blue-600 mt-2">
                  {selectedPlan.price} USDT
                </div>
                <div className="text-sm text-gray-500">
                  (~${selectedPlan.priceUSD})
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>To Address:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">
                      {`${PAYMENT_RECEIVER_ADDRESS.slice(0, 6)}...${PAYMENT_RECEIVER_ADDRESS.slice(-4)}`}
                    </span>
                    <Button variant="ghost" size="sm" onClick={copyAddress} className="h-6 w-6 p-0">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Network:</span>
                  <span>BSC Mainnet</span>
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700 text-sm">
                  This USDT payment will be sent directly to our BSC address. Your subscription will be activated automatically after confirmation.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Payment'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transaction Result */}
      {lastTransactionHash && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            <div className="flex items-center justify-between">
              <span>Payment successful!</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={openTxExplorer}
                className="text-green-700 hover:text-green-800"
              >
                View Transaction <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Benefits Info */}
      <Alert className="border-blue-200 bg-blue-50">
        <Star className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          <strong>Web3 Benefits:</strong> USDT payments on BSC provide stable pricing, transparent transactions, instant activation, and contribute to your airdrop eligibility for future token distributions.
        </AlertDescription>
      </Alert>
    </div>
  );
}
