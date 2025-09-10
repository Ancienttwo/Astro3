'use client'

/**
 * WalletConnect + Supabase 完整集成认证组件
 * 基于 EIP-4361 (Sign-In with Ethereum) 标准
 * 使用新的统一Web3认证系统，包含：
 * - 钱包签名验证
 * - 双JWT生成 (自定义 + Supabase兼容)
 * - Supabase Session管理
 * - RLS数据隔离
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  initWalletConnect, 
  connectWallet, 
  disconnectWallet,
  signMessage,
  generateSIWEMessage,
  getWalletAddress,
  getChainId,
  clearWalletConnectStorage,
  resetWalletConnect
} from '@/lib/walletconnect-config'
import { SessionTypes } from '@walletconnect/types'
import { Wallet, Mail, User, LogOut, Loader2, CheckCircle, AlertCircle, Shield, Zap } from 'lucide-react'
import { MobileMetaMaskHelper } from '@/lib/mobile-metamask'
import Logo from '@/components/Logo'
import Link from 'next/link'

// 导入Web3认证服务
import { supabaseSessionManager } from '@/lib/services/supabase-session-manager'
import { rlsPolicyHelper } from '@/lib/services/rls-policy-helper'
import { apiClient } from '@/lib/api-client'
import { UnifiedWeb3User, WalletIntegrationError } from '@/lib/types/wallet-integration'

interface WalletConnectAuthProps {
  onAuthSuccess?: (user: UnifiedWeb3User) => void
  onAuthError?: (error: WalletIntegrationError) => void
}

export default function WalletConnectAuth({ onAuthSuccess, onAuthError }: WalletConnectAuthProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [session, setSession] = useState<SessionTypes.Struct | null>(null)
  const [userInfo, setUserInfo] = useState<UnifiedWeb3User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [, setChainId] = useState<number>(1)
  const [installedWallets, setInstalledWallets] = useState<string[]>([])
  const [authStatus, setAuthStatus] = useState<'idle' | 'connecting' | 'signing' | 'verifying' | 'creating_session' | 'completed'>('idle')
  const router = useRouter()

  // 初始化WalletConnect和Web3认证系统
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsInitializing(true)
        setError(null)
        
        console.log('🔧 初始化 WalletConnect 和 Web3认证系统...')
        
        // 1. 初始化WalletConnect（增加超时处理）
        const initTimeout = setTimeout(() => {
          setError('WalletConnect 初始化超时，请刷新页面重试')
        }, 20000) // 20秒超时
        
        try {
          await initWalletConnect()
          clearTimeout(initTimeout)
          console.log('✅ WalletConnect 初始化成功')
        } catch (initError) {
          clearTimeout(initTimeout)
          throw initError
        }
        
        // 2. 尝试恢复现有的Web3会话
        console.log('🔄 尝试恢复Web3用户会话...')
        const restoredUser = await supabaseSessionManager.restoreWeb3Session()
        
        if (restoredUser) {
          console.log('✅ Web3会话恢复成功:', restoredUser.wallet_address)
          setUserInfo(restoredUser)
          setIsConnected(true)
          setWalletAddress(restoredUser.wallet_address)
          
          // 测试RLS访问权限
          const accessTest = await rlsPolicyHelper.testWeb3UserAccess(restoredUser.id)
          console.log('🔒 RLS访问测试:', accessTest ? '✅ 通过' : '⚠️ 需要检查')
        } else {
          console.log('📭 未找到有效的Web3会话')
        }
        
        // 3. 检测已安装的钱包
        const wallets = detectInstalledWallets()
        setInstalledWallets(wallets)
        console.log('🔍 检测到已安装的钱包:', wallets)
        
        console.log('✅ Web3认证系统初始化完成')
      } catch (error) {
        console.error('❌ 初始化失败:', error)
        
        let errorMessage = '初始化失败，请刷新页面重试'
        
        if (error instanceof WalletIntegrationError) {
          errorMessage = error.message
        } else if (error instanceof Error) {
          if (error.message.includes('Project ID')) {
            errorMessage = 'WalletConnect配置错误，请联系技术支持'
          } else if (error.message.includes('timeout')) {
            errorMessage = 'WalletConnect 连接超时，网络可能较慢。您仍可以使用已安装的钱包直接连接。'
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = 'WalletConnect 网络连接失败，但您可以使用已安装的钱包直接连接。'
          } else if (error.message.includes('browser')) {
            errorMessage = '浏览器不支持，请使用最新版Chrome、Firefox或Safari'
          } else {
            errorMessage = `初始化失败: ${error.message}`
          }
        }
        
        setError(errorMessage)
        
        // 即使 WalletConnect 初始化失败，也检测已安装的钱包作为备用方案
        try {
          const wallets = detectInstalledWallets()
          setInstalledWallets(wallets)
          console.log('🔍 检测到已安装的钱包 (备用方案):', wallets)
        } catch (walletDetectionError) {
          console.warn('钱包检测失败:', walletDetectionError)
        }
      } finally {
        setIsInitializing(false)
      }
    }

    // 添加延迟以确保DOM已加载
    if (typeof window !== 'undefined') {
      const timeoutId = setTimeout(initialize, 100)
      
      // 清理函数
      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  /**
   * 获取随机nonce
   */
  const getNonce = async (address: string): Promise<string> => {
    try {
      const response = await fetch('/api/auth/web3/get-nonce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get nonce')
      }

      const { nonce } = await response.json()
      return nonce
    } catch (error) {
      console.error('获取nonce失败:', error)
      // 后备方案：生成客户端nonce
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    }
  }

  /**
   * 获取链名称
   */
  const getChainName = (chainId: number): string => {
    const chainNames: { [key: number]: string } = {
      1: 'Ethereum',
      137: 'Polygon',
      5: 'Goerli',
      80001: 'Mumbai'
    }
    return chainNames[chainId] || `Chain ${chainId}`
  }

  /**
   * 检测原生钱包
   */
  const detectInstalledWallets = () => {
    if (typeof window === 'undefined') return []
    
    const installedWallets = []
    
    // 检测 MetaMask
    if (window.ethereum?.isMetaMask) {
      installedWallets.push('MetaMask')
    }
    
    // 检测 OKX Wallet
    if (window.okxwallet || window.ethereum?.isOkxWallet) {
      installedWallets.push('OKX Wallet')
    }
    
    // 检测 Binance Chain Wallet
    if (window.BinanceChain) {
      installedWallets.push('Binance Chain Wallet')
    }
    
    // 检测 Coinbase Wallet
    if (window.ethereum?.isCoinbaseWallet) {
      installedWallets.push('Coinbase Wallet')
    }
    
    // 检测 Trust Wallet
    if (window.ethereum?.isTrust) {
      installedWallets.push('Trust Wallet')
    }
    
    return installedWallets
  }

  /**
   * 尝试直接连接原生钱包
   */
  const tryDirectWalletConnection = async () => {
    if (typeof window === 'undefined') return null
    
    // 优先尝试 MetaMask
    if (window.ethereum?.isMetaMask) {
      try {
        console.log('🦊 MetaMask detected, attempting direct connection...')
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        if (accounts.length > 0) {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' })
          return {
            address: accounts[0],
            chainId: parseInt(chainId, 16),
            provider: 'MetaMask (Direct)'
          }
        }
      } catch (error) {
        console.log('MetaMask direct connection failed, falling back to WalletConnect')
      }
    }
    
    // Try OKX Wallet
    if (window.okxwallet) {
      try {
        console.log('🟣 OKX Wallet detected, attempting direct connection...')
        const accounts = await window.okxwallet.request({ method: 'eth_requestAccounts' })
        if (accounts.length > 0) {
          const chainId = await window.okxwallet.request({ method: 'eth_chainId' })
          return {
            address: accounts[0],
            chainId: parseInt(chainId, 16),
            provider: 'OKX Wallet (Direct)'
          }
        }
      } catch (error) {
        console.log('OKX Wallet direct connection failed, falling back to WalletConnect')
      }
    }
    
    return null
  }

  /**
   * 处理钱包连接和签名认证 - 新的统一Web3认证流程
   */  
  const handleConnect = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setAuthStatus('connecting')

      console.log('🚀 开始新的统一Web3认证流程...')
      
      // Step 1: 钱包连接
      const directConnection = await tryDirectWalletConnection()
      
      let address: string
      let currentChainId: number
      let walletSession: SessionTypes.Struct | null = null
      let provider: string
      
      if (directConnection) {
        address = directConnection.address
        currentChainId = directConnection.chainId
        provider = directConnection.provider
        console.log('✅ 直接钱包连接成功:', { address, chainId: currentChainId, provider })
      } else {
        console.log('📱 使用WalletConnect连接钱包...')
        walletSession = await connectWallet()
        setSession(walletSession)
        
        address = getWalletAddress(walletSession)
        currentChainId = getChainId(walletSession)
        provider = getChainName(currentChainId)
        
        console.log('📱 WalletConnect连接成功:', { address, chainId: currentChainId })
      }
      
      setWalletAddress(address)
      setChainId(currentChainId)

      // Step 2: 生成签名消息
      setAuthStatus('signing')
      const nonce = await getNonce(address)
      const domain = window.location.host
      const siweMessage = generateSIWEMessage({
        domain,
        address,
        chainId: currentChainId,
        nonce
      })

      console.log('📝 生成SIWE消息:', siweMessage.substring(0, 100) + '...')

      // Step 3: 请求用户签名
      let signature: string
      
      try {
        if (directConnection) {
          if (directConnection.provider.includes('MetaMask') && window.ethereum?.isMetaMask) {
            signature = await window.ethereum.request({
              method: 'personal_sign',
              params: [siweMessage, address]
            })
          } else if (directConnection.provider.includes('OKX') && window.okxwallet) {
            signature = await window.okxwallet.request({
              method: 'personal_sign',
              params: [siweMessage, address]
            })
          } else {
            throw new Error('Unsupported direct wallet connection')
          }
        } else {
          const mobileDetection = MobileMetaMaskHelper.detectMobileEnvironment()
          if (mobileDetection.isMobile && !mobileDetection.hasMetaMaskApp) {
            signature = await MobileMetaMaskHelper.requestSignatureOnMobile(siweMessage, address)
          } else if (walletSession) {
            signature = await signMessage(walletSession, siweMessage)
          } else {
            throw new Error('No wallet session available')
          }
        }
      } catch (signError: any) {
        console.error('❌ 签名请求失败:', signError)
        
        if (signError.message?.includes('User rejected') || 
            signError.message?.includes('rejected') ||
            signError.code === 4001) {
          throw new WalletIntegrationError('用户取消了签名请求', 'SIGNATURE_INVALID')
        }
        
        throw new WalletIntegrationError(`签名失败: ${signError.message || '未知错误'}`, 'SIGNATURE_INVALID')
      }

      console.log('✍️ 签名成功:', {
        signatureLength: signature.length,
        signaturePreview: signature.substring(0, 20) + '...',
        signatureComplete: signature
      })

      // Step 4: 调用Supabase Edge Function验证签名并生成JWT
      setAuthStatus('verifying')
      console.log('🔐 服务端验证签名并创建认证...')
      
      // 调用Supabase Edge Function而不是Next.js API路由
      const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/web3-auth`
      console.log('🌐 调用Edge Function:', edgeFunctionUrl)
      
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          walletAddress: address,
          signature,
          message: siweMessage
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new WalletIntegrationError(`认证失败: ${errorData.error}`, 'AUTHENTICATION_FAILED')
      }

      const authResponse = await response.json()
      if (!authResponse.success) {
        throw new WalletIntegrationError(`认证失败: ${authResponse.error}`, 'AUTHENTICATION_FAILED')
      }
      
      const { user: web3User, session } = authResponse.data
      console.log('✅ Web3用户认证完成:', web3User.email)
      console.log('✅ 标准Supabase session生成完成')

      // Step 5: 处理Web3认证结果
      setAuthStatus('creating_session')
      console.log('🔑 设置标准Supabase session...')
      
      // 检查是否是新的Web3认证格式
      if (session.web3_auth && session.email && session.password) {
        console.log('🔐 使用Web3凭据创建真实Supabase session')
        
        try {
          // 使用返回的凭据登录获取真实JWT
          const { data: authData, error: authError } = await supabaseSessionManager.getSupabaseClient().auth.signInWithPassword({
            email: session.email,
            password: session.password
          })

          if (authError) {
            console.error('❌ SignIn失败:', authError)
            throw new WalletIntegrationError(`SignIn失败: ${authError.message}`, 'SESSION_SET_FAILED')
          }

          if (!authData.session) {
            console.error('❌ Session未生成，请检查用户凭据')
            throw new WalletIntegrationError('AuthSessionMissingError: Session未生成，请检查用户凭据', 'SESSION_SET_FAILED')
          }

          console.log('✅ 真实JWT session创建成功:', {
            access_token_length: authData.session.access_token.length,
            user_id: authData.session.user.id,
            expires_at: authData.session.expires_at
          })

          // Supabase的signInWithPassword会自动设置session，但我们显式验证一下
          const currentSession = await supabaseSessionManager.getSupabaseClient().auth.getSession()
          if (!currentSession.data.session) {
            console.warn('⚠️ Session未自动设置，手动设置中...')
            await supabaseSessionManager.getSupabaseClient().auth.setSession({
              access_token: authData.session.access_token,
              refresh_token: authData.session.refresh_token
            })
          }

          console.log('✅ 真实JWT session验证和设置完成')
          
        } catch (sessionError) {
          console.error('❌ Web3认证过程中发生错误:', sessionError)
          throw sessionError
        }
      } else {
        // 兼容旧格式 - 直接使用JWT token
        console.log('🔄 使用传统session格式')
        await supabaseSessionManager.setStandardSession(session)
      }
      
      console.log('✅ 标准Supabase session设置成功，Web3用户现在可以使用RLS')

      // Step 6: 存储Web3认证数据（先存储再清理，避免时序问题）
      console.log('💾 存储Web3认证数据...')
      
      // 存储Web3认证数据
      if (typeof window !== 'undefined') {
        localStorage.setItem('current_user', JSON.stringify({
          ...web3User,
          auth_method: 'walletconnect',
          provider
        }))

        // 获取当前的Supabase session来存储正确的token
        const { data: currentSessionData } = await supabaseSessionManager.getSupabaseClient().auth.getSession()
        const currentSession = currentSessionData.session
        
        if (currentSession) {
          localStorage.setItem('walletconnect_auth', JSON.stringify({
            auth_token: currentSession.access_token,
            refresh_token: currentSession.refresh_token,
            wallet_address: web3User.wallet_address,
            auth_method: 'walletconnect',
            expires_at: currentSession.expires_at 
              ? (typeof currentSession.expires_at === 'number' ? currentSession.expires_at : Math.floor(new Date(currentSession.expires_at).getTime() / 1000))
              : session.expires_at
          }))
        } else {
          // 后备方案：使用session中的数据
          localStorage.setItem('walletconnect_auth', JSON.stringify({
            auth_token: session.access_token || session.auth_token,
            refresh_token: session.refresh_token || session.access_token || session.auth_token,
            wallet_address: web3User.wallet_address,
            auth_method: 'walletconnect',
            expires_at: session.expires_at
          }))
        }

        localStorage.setItem('wallet_session', JSON.stringify({
          address: web3User.wallet_address,
          timestamp: Date.now(),
          auth_method: 'walletconnect'
        }))

        console.log('✅ Web3认证数据已存储')
      }

      // Step 7: 验证当前session是否正确设置（不再清理Web2数据，避免误删刚设置的Web3 session）
      console.log('🔍 验证Web3用户Supabase session设置状态...')
      try {
        const { data: { session } } = await supabaseSessionManager.getSupabaseClient().auth.getSession()
        if (session && session.user?.email) {
          console.log('✅ Web3用户Supabase session验证成功:', {
            userId: session.user.id,
            email: session.user.email,
            hasUserMetadata: !!session.user.user_metadata,
            userMetadata: session.user.user_metadata
          })
        } else {
          console.warn('⚠️ Web3用户Supabase session可能未正确设置')
        }
      } catch (sessionError) {
        console.warn('⚠️ Web3用户session验证过程中的非关键错误:', sessionError)
      }

      // Step 8: 测试RLS访问权限
      const accessTest = await rlsPolicyHelper.testWeb3UserAccess(web3User.id)
      console.log('🔒 RLS访问测试:', accessTest ? '✅ 通过' : '⚠️ 需要检查')

      // Step 9: 记录审计日志
      await rlsPolicyHelper.logWeb3UserAction(
        web3User.id,
        web3User.wallet_address,
        'LOGIN',
        'AUTHENTICATION',
        undefined,
        { provider, chainId: currentChainId }
      )

      // Step 10: 更新状态
      setAuthStatus('completed')
      setIsConnected(true)
      setUserInfo(web3User)

      // Step 11: 调用成功回调
      if (onAuthSuccess) {
        onAuthSuccess(web3User)
      }

      console.log('🎉 新的统一Web3认证流程完成！')
      
      // Step 12: 跳转到Web3专属首页
      router.push('/web3')

    } catch (error: any) {
      console.error('❌ Web3认证失败:', error)
      
      let errorMessage = '认证失败，请重试'
      
      if (error instanceof WalletIntegrationError) {
        errorMessage = error.message
      } else if (error.message?.includes('User rejected')) {
        errorMessage = '用户取消了连接请求'
      } else if (error.message?.includes('timeout')) {
        errorMessage = '连接超时，请重试'
      } else if (error.message?.includes('network')) {
        errorMessage = '网络连接错误，请检查网络后重试'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
      setAuthStatus('idle')
      
      if (onAuthError) {
        onAuthError(error instanceof WalletIntegrationError ? error : new WalletIntegrationError(errorMessage, 'USER_CREATE_FAILED'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 处理断开连接 - 使用新的统一清理系统
   */
  const handleDisconnect = async () => {
    try {
      setIsLoading(true)
      console.log('🔓 开始断开Web3用户连接...')
      
      // Step 1: 记录审计日志（如果用户存在）
      if (userInfo) {
        await rlsPolicyHelper.logWeb3UserAction(
          userInfo.id,
          userInfo.wallet_address,
          'LOGOUT',
          'AUTHENTICATION'
        )
      }
      
      // Step 2: 断开WalletConnect会话
      if (session) {
        await disconnectWallet(session)
        console.log('✅ WalletConnect会话已断开')
      }
      
      // Step 3: 清理Supabase session和所有Web3认证数据
      await supabaseSessionManager.clearWeb3Session()
      console.log('✅ Supabase session和认证数据已清理')
      
      // Step 4: 重置组件状态
      setIsConnected(false)
      setUserInfo(null)
      setSession(null)
      setWalletAddress('')
      setChainId(1)
      setAuthStatus('idle')
      setError(null)
      
      console.log('✅ Web3用户断开连接完成')
      
      // Step 5: 跳转到认证页
      router.push('/en/auth')
    } catch (error) {
      console.error('❌ 断开连接失败:', error)
      setError('断开连接失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo和品牌区域 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size={64} />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent mb-2">
            AstroZi
          </h1>
          <p className="text-muted-foreground dark:text-gray-300">Connect your wallet to access all features</p>
        </div>

        {/* 认证卡片 */}
        <Card className="shadow-lg border-0 dark:bg-gray-800/50 dark:border-gray-700">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl dark:text-gray-100">Web3 Authentication</CardTitle>
            <CardDescription className="text-muted-foreground dark:text-gray-300">
              Connect your wallet to access all features
            </CardDescription>
            {authStatus !== 'idle' && authStatus !== 'completed' && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  {authStatus === 'connecting' && '🔗 Connecting Wallet...'}
                  {authStatus === 'signing' && '✍️ Requesting Signature...'}
                  {authStatus === 'verifying' && '🔐 Verifying Signature...'}
                  {authStatus === 'creating_session' && '🔑 Creating Secure Session...'}
                </Badge>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {/* 初始化状态 */}
            {isInitializing && (
              <div className="flex items-center justify-center p-8">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Initializing WalletConnect...</span>
                </div>
              </div>
            )}

            {/* 错误提示 */}
            {error && (
              <Alert className="border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700 dark:text-red-400">
                  <div className="space-y-3">
                    <div>{error}</div>
                    {error.includes('初始化失败') && (
                      <div className="pt-2">
                        <Button
                          onClick={() => {
                            clearWalletConnectStorage()
                            resetWalletConnect()
                            window.location.reload()
                          }}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          清理缓存并刷新
                        </Button>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* 已连接状态 */}
            {isConnected && userInfo && !isInitializing && (
              <div className="space-y-4">
                <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-600 dark:border-green-400">
                          Connected
                        </Badge>
                        <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400">
                          {userInfo.auth_provider === 'walletconnect' ? 'WalletConnect' : 'Web3 Wallet'}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{userInfo.username}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span className="break-all">{userInfo.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Wallet className="w-4 h-4" />
                          <span className="break-all font-mono text-xs">{userInfo.wallet_address}</span>
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
                
                <Button 
                  onClick={handleDisconnect}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <LogOut className="h-4 w-4 mr-2" />
                  )}
                  Disconnect Wallet
                </Button>
              </div>
            )}

            {/* 未连接状态 - 显示连接按钮 */}
            {!isConnected && !isInitializing && (
              <div className="space-y-4">
                {/* 功能特性说明 */}
                <div className="space-y-3">
                  <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                      <div className="space-y-2">
                        <div className="font-semibold">Web3 Authentication System</div>
                        <ul className="text-sm space-y-1">
                          <li>• EIP-4361 (Sign-In with Ethereum) standard</li>
                          <li>• Secure wallet signature verification</li>
                          <li>• Support for 100+ wallets via WalletConnect</li>
                          <li>• No seed phrases stored - fully non-custodial</li>
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground dark:text-gray-400">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span>Fast & Secure</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground dark:text-gray-400">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>Self-Custody</span>
                    </div>
                  </div>
                </div>

                <Separator className="dark:bg-gray-600" />

                {/* 主连接按钮 */}
                <Button 
                  onClick={handleConnect}
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 hover:from-purple-700 hover:via-purple-800 hover:to-blue-700 text-white shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Wallet className="w-5 h-5" />
                      <span>Connect Wallet</span>
                    </div>
                  )}
                </Button>

                {/* 已检测到的钱包 */}
                {installedWallets.length > 0 && (
                  <div className="text-xs text-center space-y-2">
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      ✅ Detected installed wallets:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {installedWallets.map((wallet, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-full text-xs"
                        >
                          {wallet === 'MetaMask' && '🦊'} 
                          {wallet === 'OKX Wallet' && '🟣'} 
                          {wallet === 'Binance Chain Wallet' && '🟡'} 
                          {wallet === 'Coinbase Wallet' && '🔵'} 
                          {wallet === 'Trust Wallet' && '💙'} 
                          {wallet}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* 帮助信息 */}
            <div className="text-center pt-4 border-t border-border dark:border-gray-700">
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                New to Web3?{' '}
                <a
                  href="https://ethereum.org/en/wallets/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary dark:text-yellow-400 hover:underline"
                >
                  Learn about Web3 wallets
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 服务协议和隐私政策 */}
        <div className="mt-6 text-center text-xs text-muted-foreground dark:text-gray-400">
          <p>
            By continuing, you agree to our
            <Link href="/landing-service-agreement?lang=en" className="text-primary dark:text-yellow-400 hover:underline mx-1">
              Terms of Service
            </Link>
            and
            <Link href="/landing-privacy-policy?lang=en" className="text-primary dark:text-yellow-400 hover:underline mx-1">
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* 社交媒体链接 */}
        <div className="mt-4 flex items-center justify-center space-x-6">
          <a 
            href="https://twitter.com/astrozi_official" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground dark:text-gray-400 hover:text-primary dark:hover:text-yellow-400 transition-colors duration-200"
            title="Follow us on Twitter"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a 
            href="https://discord.gg/astrozi" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground dark:text-gray-400 hover:text-primary dark:hover:text-yellow-400 transition-colors duration-200"
            title="Join our Discord community"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.188.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
          </a>
        </div>

        {/* 返回首页 */}
        <div className="mt-4 text-center">
          <Link href="/en" className="text-sm text-muted-foreground dark:text-gray-400 hover:text-primary dark:hover:text-yellow-400">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}