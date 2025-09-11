"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, Wallet, Shield, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { useAccount, useConnect, useSignMessage, useDisconnect } from 'wagmi'

export interface WalletConnectRequest {
  walletAddress: string
  signature: string
  message: string
  nonce: string
}

interface WalletConnectorProps {
  onConnect: (connectRequest: WalletConnectRequest) => Promise<void>
  isLoading?: boolean
  mode?: 'login' | 'bind' // 登录模式或绑定模式
}

export default function WalletConnector({ onConnect, isLoading = false, mode = 'login' }: WalletConnectorProps) {
  const [step, setStep] = useState<'detect' | 'connect' | 'sign' | 'confirm'>('detect')
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [walletEnv, setWalletEnv] = useState<{
    hasMetaMask: boolean
    hasBinanceWallet: boolean
    isMobile: boolean
  }>({ hasMetaMask: false, hasBinanceWallet: false, isMobile: false })
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string>('')
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()

  useEffect(() => {
    const env = {
      hasMetaMask: typeof window !== 'undefined' && !!(window as any)?.ethereum?.isMetaMask,
      hasBinanceWallet: typeof window !== 'undefined' && !!(window as any).BinanceChain,
      isMobile: typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent)
    }
    setWalletEnv(env)
    console.log('钱包环境检测:', env)
  }, [])

  const handleConnectWallet = async () => {
    setIsConnecting(true)
    setError('')
    
    try {
      setStep('connect')
      
      // 连接钱包并获取地址（wagmi）
      const preferred = ['injected', 'walletConnect', 'coinbaseWallet']
      const list = connectors.sort((a, b) => preferred.indexOf(a.id) - preferred.indexOf(b.id))
      const connector = list[0] || connectors[0]
      if (!connector) throw new Error('No wallet connector available')
      const res = await connect({ connector })
      const addr = (res?.accounts?.[0] || address) as string
      const resolvedAddress = addr || address
      if (!resolvedAddress) throw new Error('Failed to get wallet address')
      setWalletAddress(resolvedAddress)
      toast.success('Wallet connected successfully!')
      
      setStep('sign')
      
      // 生成签名消息（内联生成 nonce/SIWE 简版消息）
      const nonce = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
      const message = `${window.location.host} wants you to sign in with your Ethereum account:\n${resolvedAddress}\n\nSign in to AstroZi.\n\nURI: https://${window.location.host}\nVersion: 1\nChain ID: 56\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`
      
      // 请求用户签名（wagmi）
      const signature = await signMessageAsync({ message })
      toast.success('Signature successful!')
      
      setStep('confirm')
      
      // 构建连接请求
      const connectRequest: WalletConnectRequest = {
        walletAddress: resolvedAddress,
        signature,
        message,
        nonce
      }

      console.log('🔍 准备提交钱包登录请求:', {
        walletAddress: address,
        signatureLength: signature.length,
        messageLength: message.length,
        nonce
      })
      
      // 调用父组件的连接处理函数
      await onConnect(connectRequest)
      
    } catch (error: any) {
      console.error('钱包连接失败:', error)
      setError(error.message || 'Connection failed')
      toast.error(error.message || 'Connection failed')
      setStep('detect')
    } finally {
      setIsConnecting(false)
    }
  }

  const renderDetectStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">
          {mode === 'login' ? '钱包登录' : '绑定钱包'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {mode === 'login' 
            ? '使用您的Web3钱包快速登录' 
            : '将钱包绑定到您的账户以启用Web3功能'
          }
        </p>
      </div>

      {/* 钱包环境检测 */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">钱包环境检测</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            {walletEnv.hasMetaMask ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
            <span className="text-sm">MetaMask</span>
          </div>
          <div className="flex items-center space-x-2">
            {walletEnv.hasBinanceWallet ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-gray-400" />
            )}
            <span className="text-sm">Binance Wallet</span>
          </div>
        </div>
        
        {walletEnv.isMobile && (
          <Badge variant="outline" className="text-xs">
            移动设备
          </Badge>
        )}
      </div>

      {/* 网络信息 */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">网络要求</span>
        </div>
        <div className="text-xs text-blue-800 space-y-1">
          <div>• 网络：{BSC_CONFIG.chainName}</div>
          <div>• 链ID：{BSC_CONFIG.chainId}</div>
          <div>• 签名免费，无Gas费用</div>
        </div>
      </div>

      {!walletEnv.hasMetaMask && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            未检测到MetaMask钱包。
            <a 
              href="https://metamask.io/download/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline ml-1"
            >
              点击安装 <ExternalLink className="h-3 w-3 inline" />
            </a>
          </AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleConnectWallet}
        disabled={isConnecting || !walletEnv.hasMetaMask}
        className="w-full"
      >
        {isConnecting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            连接中...
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4 mr-2" />
            连接钱包
          </>
        )}
      </Button>
    </div>
  )

  const renderProgressStep = () => (
    <div className="text-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
      <div>
        <h3 className="text-lg font-semibold">
          {step === 'connect' && '连接钱包中...'}
          {step === 'sign' && '请在钱包中签名...'}
          {step === 'confirm' && '验证签名中...'}
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          {step === 'connect' && '正在连接您的钱包，请在钱包中确认'}
          {step === 'sign' && '请在钱包中确认签名以验证身份'}
          {step === 'confirm' && '正在验证您的签名...'}
        </p>
      </div>
      
      {walletAddress && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">钱包地址</div>
          <div className="font-mono text-sm break-all">{walletAddress}</div>
        </div>
      )}
    </div>
  )

  const renderError = () => (
    <Alert className="border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        <div className="font-medium mb-1">连接失败</div>
        <div className="text-sm">{error}</div>
        <Button 
          size="sm" 
          variant="outline" 
          className="mt-2"
          onClick={() => {
            setError('')
            setStep('detect')
          }}
        >
          重试
        </Button>
      </AlertDescription>
    </Alert>
  )

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-blue-500" />
          {mode === 'login' ? '钱包登录' : '绑定钱包'}
        </CardTitle>
        <CardDescription>
          {mode === 'login' 
            ? '使用您的Web3钱包快速登录' 
            : '将钱包绑定到您的账户以启用Web3功能'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && renderError()}
        
        {!error && step === 'detect' && renderDetectStep()}
        {!error && (step === 'connect' || step === 'sign' || step === 'confirm') && renderProgressStep()}
        
        {/* 安全提示 */}
        <Separator />
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>基于BSC网络</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>签名验证身份</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>无需支付Gas费用</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
