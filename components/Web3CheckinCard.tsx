'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, Loader2, CheckCircle, AlertCircle, Wallet, RefreshCw, ExternalLink, Clock, Gift } from 'lucide-react'
import { ethers } from 'ethers'

interface Web3CheckinCardProps {
  walletAddress: string
  onCheckinSuccess?: () => void
}

// Contract configuration
const CONTRACT_ADDRESS = '0x3b016F5A7C462Fe51B691Ef18559DE720D9B452F'
const CONTRACT_ABI = [
  "function checkinCost() view returns (uint256)",
  "function canCheckin(address user) view returns (bool)",
  "function getUserStats(address user) view returns (uint256, uint256, uint256, uint256, uint256, uint256, bool)",
  "function previewCheckinRewards(address user) view returns (uint256, uint256, uint256)",
  "function performCheckin() payable",
  "event CheckinCompleted(address indexed user, uint256 pointsEarned, uint256 consecutiveDays, uint256 airdropWeightEarned, uint256 bnbPaid, uint256 timestamp)"
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
  const [isChecking, setIsChecking] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [checkinResult, setCheckinResult] = useState<string | null>(null)
  const [checkinData, setCheckinData] = useState<CheckinData | null>(null)
  const [lastTransactionHash, setLastTransactionHash] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)

  // Initialize Web3
  useEffect(() => {
    const initWeb3 = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        const web3Provider = new ethers.BrowserProvider(window.ethereum)
        setProvider(web3Provider)
      }
    }
    initWeb3()
  }, [])

  // Load check-in data
  useEffect(() => {
    if (provider && walletAddress) {
      loadCheckinData()
    }
  }, [provider, walletAddress])

  const loadCheckinData = async () => {
    if (!provider) return
    
    setIsLoading(true)
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
      
      // Get user BNB balance
      const balance = await provider.getBalance(walletAddress)
      
      // Load contract data in parallel
      const [canCheckin, checkinCost, previewRewards] = await Promise.all([
        contract.canCheckin(walletAddress),
        contract.checkinCost(),
        contract.previewCheckinRewards(walletAddress)
      ])

      setCheckinData({
        canCheckin,
        checkinCost,
        previewPoints: previewRewards[0],
        previewAirdropWeight: previewRewards[1],
        previewConsecutiveDays: previewRewards[2],
        userBalance: balance
      })
    } catch (error) {
      console.error('Failed to load check-in data:', error)
      setCheckinResult('Unable to load check-in data, please refresh and try again')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWeb3Checkin = async () => {
    if (!provider || !checkinData) return
    
    // Direct MetaMask trigger without confirmation prompt
    
    setIsChecking(true)
    setCheckinResult(null)

    try {
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      
      // Execute paid check-in
      const tx = await contract.performCheckin({
        value: checkinData.checkinCost,
        gasLimit: 500000
      })

      setLastTransactionHash(tx.hash)
      setCheckinResult(`Check-in transaction submitted, waiting for confirmation...`)

      // Wait for transaction confirmation
      const receipt = await tx.wait()
      
      if (receipt.status === 1) {
        setCheckinResult(`🎉 Check-in successful! Earned ${ethers.formatUnits(checkinData.previewPoints, 0)} credits`)
        
        // Refresh data
        await loadCheckinData()
        
        if (onCheckinSuccess) {
          onCheckinSuccess()
        }
      } else {
        setCheckinResult('Transaction failed, please try again')
      }
    } catch (error: any) {
      console.error('Web3 check-in failed:', error)
      
      let errorMessage = 'Check-in failed, please try again'
      if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient BNB balance, please top up'
      } else if (error.message?.includes('User denied')) {
        errorMessage = 'Transaction cancelled by user'
      } else if (error.message?.includes('gas')) {
        errorMessage = 'Insufficient gas, please check network settings'
      }
      
      setCheckinResult(errorMessage)
    } finally {
      setIsChecking(false)
    }
  }


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
              disabled={isChecking || !checkinData?.canCheckin}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg"
            >
              {isChecking ? (
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
                +{ethers.formatUnits(checkinData.previewPoints, 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Consecutive Days</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {ethers.formatUnits(checkinData.previewConsecutiveDays, 0)}
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
          <Alert className={checkinResult.includes('successful') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
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
        {lastTransactionHash && (
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

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Web3 Benefits:</strong> Smart contract check-ins are recorded on-chain and earn you credits for platform activities.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}