"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, Wallet, Shield, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { useAccount, useConnect, useSignMessage } from 'wagmi'
import { bsc } from 'wagmi/chains'
import { useNamespaceTranslations } from '@/lib/i18n/useI18n'

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
  const { address } = useAccount()
  const { connect, connectors } = useConnect()
  const { signMessageAsync } = useSignMessage()
  const tAuth = useNamespaceTranslations('web3/auth')

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
      const preferred = ['injected', 'walletConnect']
      const list = connectors.sort((a, b) => preferred.indexOf(a.id) - preferred.indexOf(b.id))
      const connector = list[0] || connectors[0]
      if (!connector) throw new Error('No wallet connector available')
      const res = await connect({ connector })
      const addr = (res?.accounts?.[0] || address) as string
      const resolvedAddress = addr || address
      if (!resolvedAddress) throw new Error('Failed to get wallet address')
      setWalletAddress(resolvedAddress)
      toast.success(tAuth('connector.toast.connected'))

      setStep('sign')

      // 生成签名消息（内联生成 nonce/SIWE 简版消息）
      const nonce = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
      const message = `${window.location.host} wants you to sign in with your Ethereum account:\n${resolvedAddress}\n\nSign in to AstroZi.\n\nURI: https://${window.location.host}\nVersion: 1\nChain ID: 56\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`
      
      // 请求用户签名（wagmi）
      const signature = await signMessageAsync({ message })
      toast.success(tAuth('connector.toast.signed'))
      
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
      const fallbackMessage = tAuth('connector.errors.generic')
      setError(error?.message || fallbackMessage)
      toast.error(tAuth('connector.errors.toast'))
      setStep('detect')
    } finally {
      setIsConnecting(false)
    }
  }

  const isLoginMode = mode === 'login'
  const cardTitle = isLoginMode ? tAuth('connector.card.title.login') : tAuth('connector.card.title.bind')
  const cardSubtitle = isLoginMode ? tAuth('connector.card.subtitle.login') : tAuth('connector.card.subtitle.bind')
  const chainName = bsc.name
  const chainId = bsc.id

  const renderDetectStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">{cardTitle}</h3>
        <p className="text-sm text-muted-foreground">{cardSubtitle}</p>
      </div>

      {/* 钱包环境检测 */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">{tAuth('connector.detect.envHeading')}</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            {walletEnv.hasMetaMask ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
            <span className="text-sm">{tAuth('connector.detect.metamask')}</span>
          </div>
          <div className="flex items-center space-x-2">
            {walletEnv.hasBinanceWallet ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-gray-400" />
            )}
            <span className="text-sm">{tAuth('connector.detect.binance')}</span>
          </div>
        </div>
        
        {walletEnv.isMobile && (
          <Badge variant="outline" className="text-xs">
            {tAuth('connector.detect.mobileBadge')}
          </Badge>
        )}
      </div>

      {/* 网络信息 */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">{tAuth('connector.detect.networkHeading')}</span>
        </div>
        <div className="text-xs text-blue-800 space-y-1">
          <div>• {tAuth('connector.detect.network', { chainName })}</div>
          <div>• {tAuth('connector.detect.chainId', { chainId })}</div>
          <div>• {tAuth('connector.detect.free')}</div>
        </div>
      </div>

      {!walletEnv.hasMetaMask && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {tAuth('connector.detect.metamaskMissing')}
            <a 
              href="https://metamask.io/download/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline ml-1"
            >
              {tAuth('connector.detect.installMetamask')} <ExternalLink className="h-3 w-3 inline" />
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
            {tAuth('connector.buttons.connecting')}
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4 mr-2" />
            {tAuth('connector.buttons.connect')}
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
          {step === 'connect' && tAuth('connector.progress.connecting.title')}
          {step === 'sign' && tAuth('connector.progress.signing.title')}
          {step === 'confirm' && tAuth('connector.progress.confirm.title')}
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          {step === 'connect' && tAuth('connector.progress.connecting.message')}
          {step === 'sign' && tAuth('connector.progress.signing.message')}
          {step === 'confirm' && tAuth('connector.progress.confirm.message')}
        </p>
      </div>
      
      {walletAddress && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">{tAuth('connector.labels.walletAddress')}</div>
          <div className="font-mono text-sm break-all">{walletAddress}</div>
        </div>
      )}
    </div>
  )

  const renderError = () => (
    <Alert className="border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        <div className="font-medium mb-1">{tAuth('connector.errors.heading')}</div>
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
          {tAuth('connector.errors.retry')}
        </Button>
      </AlertDescription>
    </Alert>
  )

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-blue-500" />
          {cardTitle}
        </CardTitle>
        <CardDescription>{cardSubtitle}</CardDescription>
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
            <span>{tAuth('connector.safety.bsc')}</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>{tAuth('connector.safety.siwe')}</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>{tAuth('connector.safety.noGas')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
