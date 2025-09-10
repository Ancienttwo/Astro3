'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Loader2, Wallet, AlertTriangle, CheckCircle, ArrowLeft, User } from 'lucide-react'
import { toast } from 'sonner'
import {
  connectWallet,
  generateNonce,
  generateSignMessage,
  requestWalletSignature
} from '@/lib/web3-auth'
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

  const handleStartRegistration = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      setStep('connect')
      
      // 1. 连接钱包
      const address = await connectWallet()
      setWalletAddress(address)
      toast.success('钱包连接成功！')
      
      setStep('sign')
      
      // 2. 生成签名消息
      const nonce = generateNonce()
      const message = generateSignMessage(address, nonce)
      
      // 3. 请求用户签名
      const signature = await requestWalletSignature(address, message)
      toast.success('签名成功！')
      
      setStep('register')
      
      // 4. 创建Web3用户账户
      const user = await Web3Auth.register(address, signature, message)
      toast.success('Web3账户创建成功！')
      
      // 5. 调用成功回调
      onSuccess(user)
      
    } catch (error: any) {
      console.error('钱包注册失败:', error)
      
      if (error.message?.includes('该钱包已注册')) {
        setError('该钱包已被注册，请直接登录')
      } else if (error.message?.includes('用户拒绝')) {
        setError('用户取消了钱包操作')
        setStep('intro')
      } else {
        setError(error.message || '注册失败，请重试')
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
        <h3 className="text-xl font-semibold mb-2">创建Web3账户</h3>
        <p className="text-muted-foreground">
          使用您的钱包创建去中心化身份账户
        </p>
      </div>

      {/* Web3特性介绍 */}
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
          <div>
            <div className="font-medium text-green-800 dark:text-green-300">去中心化身份</div>
            <div className="text-sm text-green-700 dark:text-green-400">
              完全控制您的数字身份，无需依赖第三方
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <div className="font-medium text-blue-800 dark:text-blue-300">免密码登录</div>
            <div className="text-sm text-blue-700 dark:text-blue-400">
              使用钱包签名验证身份，告别密码烦恼
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
          <div>
            <div className="font-medium text-purple-800 dark:text-purple-300">隐私保护</div>
            <div className="text-sm text-purple-700 dark:text-purple-400">
              无需提供邮箱等个人信息，保护您的隐私
            </div>
          </div>
        </div>
      </div>

      {/* 注册须知 */}
      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
        <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">注册须知：</h4>
        <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
          <li>• 确保您拥有钱包的完整控制权</li>
          <li>• 请备份好钱包助记词</li>
          <li>• 钱包地址将作为您的唯一标识</li>
          <li>• 签名验证不会产生任何费用</li>
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
            连接中...
          </>
        ) : (
          <>
            <Wallet className="h-5 w-5 mr-2" />
            开始创建账户
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
          返回登录选项
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
          {step === 'connect' && '连接钱包中...'}
          {step === 'sign' && '请在钱包中签名'}
          {step === 'register' && '创建账户中...'}
        </h3>
        <p className="text-muted-foreground">
          {step === 'connect' && '正在连接您的钱包...'}
          {step === 'sign' && '请在钱包中确认签名以验证身份'}
          {step === 'register' && '正在创建您的Web3账户...'}
        </p>
      </div>
      
      {walletAddress && (
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">钱包地址</div>
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
          Web3账户注册
        </CardTitle>
        <CardDescription>
          创建去中心化身份账户，享受Web3体验
        </CardDescription>
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
            <span>基于BSC网络</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>签名验证身份</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>无需个人信息</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 