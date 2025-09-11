"use client"

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, Loader2, CheckCircle, AlertCircle, Wallet, RefreshCw, ExternalLink, Clock, Gift } from 'lucide-react'
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { decodeEventLog } from 'viem'

interface Web3CheckinCardProps {
  walletAddress: string
  onCheckinSuccess?: () => void
}

// Contract configuration
const CONTRACT_ADDRESS = '0x3b016F5A7C462Fe51B691Ef18559DE720D9B452F'
const CONTRACT_ABI = [
  'function checkinCost() view returns (uint256)',
  'function canCheckin(address user) view returns (bool)',
  'function getUserStats(address user) view returns (uint256, uint256, uint256, uint256, uint256, uint256, bool)',
  'function previewCheckinRewards(address user) view returns (uint256, uint256, uint256)',
  'function performCheckin() payable',
  'event CheckinCompleted(address indexed user, uint256 pointsEarned, uint256 consecutiveDays, uint256 airdropWeightEarned, uint256 bnbPaid, uint256 timestamp)'
]

interface CheckinData {
  canCheckin: boolean
  checkinCost: bigint
  previewPoints: bigint
  previewAirdropWeight: bigint
  previewConsecutiveDays: bigint
  userBalance: bigint
}

export default function Web3CheckinCard({ walletAddress, onCheckinSuccess }: Web3CheckinCardProps) {
  const { isConnected } = useAccount()
  const { data: bal } = useBalance({ address: walletAddress as `0x${string}` })

  const { data: canCheckinData, isFetching: f1 } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI as any,
    functionName: 'canCheckin',
    args: [walletAddress as `0x${string}`],
    query: { enabled: !!walletAddress },
  })

  const { data: checkinCost, isFetching: f2 } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI as any,
    functionName: 'checkinCost',
  })

  const { data: previewRewards, isFetching: f3, refetch: refetchPreview } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI as any,
    functionName: 'previewCheckinRewards',
    args: [walletAddress as `0x${string}`],
    query: { enabled: !!walletAddress },
  })

  const [checkinResult, setCheckinResult] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined)
  const { writeContract, isPending } = useWriteContract()
  const { data: receipt, isLoading: isWaiting } = useWaitForTransactionReceipt({ hash: txHash, query: { enabled: !!txHash } })

  const isLoading = f1 || f2 || f3

  const checkinData: CheckinData | null = useMemo(() => {
    if (!walletAddress) return null
    const [p0, p1, p2] = (previewRewards as any[]) || []
    return {
      canCheckin: Boolean(canCheckinData),
      checkinCost: (checkinCost as bigint) ?? 0n,
      previewPoints: p0 ?? 0n,
      previewAirdropWeight: p1 ?? 0n,
      previewConsecutiveDays: p2 ?? 0n,
      userBalance: (bal?.value as bigint) ?? 0n,
    }
  }, [walletAddress, canCheckinData, checkinCost, previewRewards, bal?.value])

  const handleWeb3Checkin = async () => {
    if (!isConnected || !checkinData) return

    setCheckinResult(null)

    try {
      const hash = await writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI as any,
        functionName: 'performCheckin',
        value: checkinData.checkinCost,
      })

      setTxHash(hash as `0x${string}`)
      setCheckinResult(`Check-in transaction submitted, waiting for confirmation...`)
    } catch (error: any) {
      console.error('Web3 check-in failed:', error)
      
      let errorMessage = 'Check-in failed, please try again'
      if (error?.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient BNB balance, please top up'
      } else if (error?.message?.includes('User denied')) {
        errorMessage = 'Transaction cancelled by user'
      } else if (error?.message?.includes('gas')) {
        errorMessage = 'Insufficient gas, please check network settings'
      }
      
      setCheckinResult(errorMessage)
    }
  }

  // When receipt is available, parse event and finalize UI
  useEffect(() => {
    if (!receipt) return
    try {
      const log = receipt.logs?.[0]
      if (log) {
        const parsed = decodeEventLog({ abi: CONTRACT_ABI as any, data: log.data, topics: log.topics }) as any
        if (parsed?.eventName === 'CheckinCompleted') {
          const args: any = parsed.args
          const pts = Number(args?.pointsEarned ?? 0)
          setCheckinResult(`🎉 Check-in successful! Earned ${pts} credits`)
        } else {
          setCheckinResult('🎉 Check-in successful!')
        }
      } else {
        setCheckinResult('🎉 Check-in successful!')
      }
    } catch {
      setCheckinResult('🎉 Check-in successful!')
    }
    // refresh reads
    refetchPreview()
    if (onCheckinSuccess) onCheckinSuccess()
  }, [receipt, onCheckinSuccess, refetchPreview])


  if (isLoading) {
    return (
      <Card className="mb-8 dark:bg-slate-800 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Web3 Check-in</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Loading contract data...
                </p>
              </div>
            </div>
            <div className="animate-pulse">
              <div className="h-10 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-8 dark:bg-slate-800 dark:border-slate-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Web3 Check-in</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Earn points through smart contract interaction
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {checkinData?.canCheckin ? (
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
              disabled={isPending || isWaiting || !checkinData?.canCheckin}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg"
            >
              {(isPending || isWaiting) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking in...
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  {checkinData?.canCheckin ? 'On-chain Check-in' : 'Already checked in'}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Display preview rewards */}
        {checkinData?.canCheckin && (
          <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Credits</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                +{Number(checkinData.previewPoints)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Consecutive Days</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {Number(checkinData.previewConsecutiveDays)}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Wallet:</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold ml-2 font-mono">
              {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Network:</span>
            <span className="text-purple-600 dark:text-purple-400 font-semibold ml-2">
              BSC Mainnet
            </span>
          </div>
        </div>

        {checkinResult && (
          <Alert className={checkinResult.includes('successful') ? 'border-green-2 00 bg-green-50' : 'border-red-200 bg-red-50'}>
            {checkinResult.includes('successful') ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={checkinResult.includes('successful') ? 'text-green-700' : 'text-red-700'}>
              {checkinResult}
            </AlertDescription>
          </Alert>
        )}

        {/* Transaction hash display */}
        {txHash && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Transaction Hash: 
              <Button
                variant="link"
                className="h-auto p-0 ml-1 text-blue-600 dark:text-blue-400"
                onClick={() => window.open(`https://bscscan.com/tx/${txHash}`, '_blank')}
              >
                {txHash.slice(0, 16)}...
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </p>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Web3 Benefits:</strong> Smart contract check-ins are recorded on-chain and earn you credits for platform activities.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

