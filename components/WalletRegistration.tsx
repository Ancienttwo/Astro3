"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Loader2, Wallet, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useAccount, useConnect, useSignMessage } from 'wagmi'
import { useNamespaceTranslations } from '@/lib/i18n/useI18n'
import { Web3Auth } from '@/lib/dual-auth-system'

interface WalletRegistrationProps {
  onSuccess: (user: any) => void
  onBack: () => void
}

export default function WalletRegistration({ onSuccess, onBack }: WalletRegistrationProps) {
  const [step, setStep] = useState<'intro' | 'connect' | 'sign' | 'register'>('intro')
  const [walletAddress, setWalletAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { address } = useAccount()
  const { connect, connectors } = useConnect()
  const { signMessageAsync } = useSignMessage()
  const tAuth = useNamespaceTranslations('web3/auth')

  const handleStartRegistration = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      setStep('connect')
      
      // 1. 连接钱包（wagmi）
      const preferred = ['injected', 'walletConnect']
      const list = connectors.sort((a, b) => preferred.indexOf(a.id) - preferred.indexOf(b.id))
      const connector = list[0] || connectors[0]
      if (!connector) throw new Error('No wallet connector available')
      const res = await connect({ connector })
      const addr = (res?.accounts?.[0] || address) as string
      const resolvedAddress = addr || address
      if (!resolvedAddress) throw new Error('Failed to get wallet address')
      setWalletAddress(resolvedAddress)
      toast.success(tAuth('registration.toast.connected'))
      
      setStep('sign')
      
      // 2. 生成签名消息
      const nonce = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
      const message = `${window.location.host} wants you to sign in with your Ethereum account:\n${resolvedAddress}\n\nRegister Web3 account at AstroZi.\n\nURI: https://${window.location.host}\nVersion: 1\nChain ID: 56\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`
      
      // 3. 请求用户签名
      const signature = await signMessageAsync({ message })
      toast.success(tAuth('registration.toast.signed'))
      
      setStep('register')
      
      // 4. 创建Web3用户账户
      const user = await Web3Auth.register(resolvedAddress, signature, message)
      toast.success(tAuth('registration.toast.registered'))
      
      // 5. 调用成功回调
      onSuccess(user)
      
    } catch (error: any) {
      console.error('钱包注册失败:', error)
      
      const message = error?.message?.toString() ?? ''
      if (message.includes('该钱包已注册') || message.toLowerCase().includes('already')) {
        setError(tAuth('registration.errors.alreadyRegistered'))
      } else if (message.includes('用户拒绝') || message.toLowerCase().includes('reject')) {
        setError(tAuth('registration.errors.userRejected'))
        setStep('intro')
      } else {
        setError(message || tAuth('registration.errors.generic'))
        setStep('intro')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const renderIntroStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{tAuth('registration.intro.title')}</h3>
        <p className="text-muted-foreground">{tAuth('registration.intro.subtitle')}</p>
      </div>

      {/* Web3特性介绍 */}
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
          <div>
            <div className="font-medium text-green-800 dark:text-green-300">{tAuth('registration.intro.features.decentralized.title')}</div>
            <div className="text-sm text-green-700 dark:text-green-400">
              {tAuth('registration.intro.features.decentralized.description')}
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <div className="font-medium text-blue-800 dark:text-blue-300">{tAuth('registration.intro.features.passwordless.title')}</div>
            <div className="text-sm text-blue-700 dark:text-blue-400">
              {tAuth('registration.intro.features.passwordless.description')}
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
          <div>
            <div className="font-medium text-purple-800 dark:text-purple-300">{tAuth('registration.intro.features.privacy.title')}</div>
            <div className="text-sm text-purple-700 dark:text-purple-400">
              {tAuth('registration.intro.features.privacy.description')}
            </div>
          </div>
        </div>
      </div>

      {/* 注册须知 */}
      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
        <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">{tAuth('registration.intro.notes.title')}</h4>
        <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
          <li>• {tAuth('registration.intro.notes.item1')}</li>
          <li>• {tAuth('registration.intro.notes.item2')}</li>
          <li>• {tAuth('registration.intro.notes.item3')}</li>
          <li>• {tAuth('registration.intro.notes.item4')}</li>
        </ul>
      </div>

      <Button
        onClick={handleStartRegistration}
        disabled={isLoading}
        className="w-full h-12 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            {tAuth('registration.intro.buttons.loading')}
          </>
        ) : (
          <>
            <Wallet className="h-5 w-5 mr-2" />
            {tAuth('registration.intro.buttons.start')}
          </>
        )}
      </Button>

      <div className="text-center">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-sm text-muted-foreground"
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {tAuth('registration.intro.buttons.back')}
        </Button>
      </div>
    </div>
  )

  const renderProgressStep = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-2">
          {step === 'connect' && tAuth('registration.progress.connect.title')}
          {step === 'sign' && tAuth('registration.progress.sign.title')}
          {step === 'register' && tAuth('registration.progress.register.title')}
        </h3>
        <p className="text-muted-foreground">
          {step === 'connect' && tAuth('registration.progress.connect.message')}
          {step === 'sign' && tAuth('registration.progress.sign.message')}
          {step === 'register' && tAuth('registration.progress.register.message')}
        </p>
      </div>
      
      {walletAddress && (
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">{tAuth('registration.labels.walletAddress')}</div>
          <div className="font-mono text-sm break-all">{walletAddress}</div>
        </div>
      )}

      {/* 进度指示 */}
      <div className="flex justify-center space-x-2">
        <div className={`h-2 w-8 rounded-full ${step === 'connect' ? 'bg-purple-500' : 'bg-muted'}`} />
        <div className={`h-2 w-8 rounded-full ${step === 'sign' ? 'bg-purple-500' : 'bg-muted'}`} />
        <div className={`h-2 w-8 rounded-full ${step === 'register' ? 'bg-purple-500' : 'bg-muted'}`} />
      </div>
    </div>
  )

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-purple-500" />
          {tAuth('registration.card.title')}
        </CardTitle>
        <CardDescription>{tAuth('registration.card.subtitle')}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-300">
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {step === 'intro' && renderIntroStep()}
        {(step === 'connect' || step === 'sign' || step === 'register') && renderProgressStep()}
        
        {/* 底部安全提示 */}
        <Separator />
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>{tAuth('registration.safety.bsc')}</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>{tAuth('registration.safety.siwe')}</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>{tAuth('registration.safety.noPersonalInfo')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
