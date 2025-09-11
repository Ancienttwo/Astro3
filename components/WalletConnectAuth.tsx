"use client";

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Wallet, LogOut, Loader2, CheckCircle, AlertCircle, Shield, Zap } from 'lucide-react'
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi'
import Logo from '@/components/Logo'
import Link from 'next/link'

import { supabaseSessionManager } from '@/lib/services/supabase-session-manager'
import { rlsPolicyHelper } from '@/lib/services/rls-policy-helper'
import { UnifiedWeb3User, WalletIntegrationError } from '@/lib/types/wallet-integration'

interface WalletConnectAuthProps {
  onAuthSuccess?: (user: UnifiedWeb3User) => void
  onAuthError?: (error: WalletIntegrationError) => void
}

export default function WalletConnectAuth({ onAuthSuccess, onAuthError }: WalletConnectAuthProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isConnectedView, setIsConnectedView] = useState(false)
  const [userInfo, setUserInfo] = useState<UnifiedWeb3User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [, setChainId] = useState<number>(56)
  const [installedWallets, setInstalledWallets] = useState<string[]>([])
  const [authStatus, setAuthStatus] = useState<'idle' | 'connecting' | 'signing' | 'verifying' | 'creating_session' | 'completed'>('idle')
  const router = useRouter()

  const { address: wagmiAddress } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsInitializing(true)
        setError(null)

        const restoredUser = await supabaseSessionManager.restoreWeb3Session()
        if (restoredUser) {
          setUserInfo(restoredUser)
          setIsConnectedView(true)
          setWalletAddress(restoredUser.wallet_address)
          try { await rlsPolicyHelper.testWeb3UserAccess(restoredUser.id) } catch {}
        }

        const wallets: string[] = []
        if (typeof window !== 'undefined') {
          if ((window as any)?.ethereum?.isMetaMask) wallets.push('MetaMask')
          if ((window as any)?.ethereum?.isCoinbaseWallet) wallets.push('Coinbase Wallet')
          if ((window as any).BinanceChain) wallets.push('Binance Chain Wallet')
        }
        setInstalledWallets(wallets)
      } finally {
        setIsInitializing(false)
      }
    }
    initialize()
  }, [])

  const getNonce = async (address: string): Promise<string> => {
    try {
      const response = await fetch('/api/auth/web3/get-nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      })
      if (!response.ok) throw new Error('Failed to get nonce')
      const { nonce } = await response.json()
      return nonce
    } catch {
      return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
    }
  }

  const handleConnect = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setAuthStatus('connecting')

      const preferred = ['injected', 'walletConnect', 'coinbaseWallet']
      const list = connectors.sort((a, b) => preferred.indexOf(a.id) - preferred.indexOf(b.id))
      const connector = list[0] || connectors[0]
      if (!connector) throw new Error('No wallet connector available')
      const res = await connect({ connector })
      const addr = (res?.accounts?.[0] || wagmiAddress) as string
      const resolvedAddress = addr || wagmiAddress
      if (!resolvedAddress) throw new Error('Failed to get wallet address')
      setWalletAddress(resolvedAddress)
      setChainId(56)

      setAuthStatus('signing')
      const nonce = await getNonce(resolvedAddress)
      const domain = window.location.host
      const message = `${domain} wants you to sign in with your Ethereum account:\n${resolvedAddress}\n\nSign in to AstroZi.\n\nURI: https://${domain}\nVersion: 1\nChain ID: 56\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`
      const signature = await signMessageAsync({ message })

      setAuthStatus('verifying')
      const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/web3-auth`
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ walletAddress: resolvedAddress, signature, message })
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new WalletIntegrationError(`认证失败: ${data?.error || 'unknown'}`, 'AUTHENTICATION_FAILED')
      }
      const authResponse = await response.json()
      if (!authResponse.success) throw new WalletIntegrationError(`认证失败: ${authResponse.error}`, 'AUTHENTICATION_FAILED')

      const { user: web3User, session } = authResponse.data

      setAuthStatus('creating_session')
      if (session?.web3_auth && session?.email && session?.password) {
        const supa = await supabaseSessionManager.createSupabaseSessionFromCredentials(session.email, session.password)
        if (!supa) throw new WalletIntegrationError('Failed to set Supabase session', 'SESSION_CREATION_FAILED')
      }

      try { await rlsPolicyHelper.logWeb3UserAction(web3User.id, web3User.wallet_address, 'LOGIN', 'AUTHENTICATION') } catch {}

      setIsConnectedView(true)
      setUserInfo(web3User)
      setAuthStatus('completed')
      onAuthSuccess?.(web3User)
      router.push('/web3')
    } catch (e: any) {
      const msg = e instanceof WalletIntegrationError ? e.message : (e?.message || '认证失败，请重试')
      setError(msg)
      setAuthStatus('idle')
      onAuthError?.(e instanceof WalletIntegrationError ? e : new WalletIntegrationError(msg, 'USER_CREATE_FAILED'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      setIsLoading(true)
      if (userInfo) {
        try { await rlsPolicyHelper.logWeb3UserAction(userInfo.id, userInfo.wallet_address, 'LOGOUT', 'AUTHENTICATION') } catch {}
      }
      try { disconnect() } catch {}
      await supabaseSessionManager.clearWeb3Session()
      setIsConnectedView(false)
      setUserInfo(null)
      setWalletAddress('')
      setChainId(56)
      setAuthStatus('idle')
      setError(null)
      router.push('/en/auth')
    } catch {
      setError('断开连接失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size={64} />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent mb-2">
            AstroZi
          </h1>
          <p className="text-muted-foreground dark:text-gray-300">Connect your wallet to access all features</p>
        </div>

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
            {isInitializing && (
              <div className="flex items-center justify-center p-8">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Initializing Wallet...</span>
                </div>
              </div>
            )}

            {error && (
              <Alert className="border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
              </Alert>
            )}

            {!isConnectedView ? (
              <Button onClick={handleConnect} disabled={isLoading || isInitializing} className="w-full h-12">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Address</span>
                  <span className="font-mono">{walletAddress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Network</span>
                  <span>BSC</span>
                </div>
                <Button onClick={handleDisconnect} disabled={isLoading} variant="outline" className="w-full">
                  <LogOut className="mr-2 h-4 w-4" /> Disconnect
                </Button>
              </div>
            )}

            <Separator />
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1"><Shield className="h-3 w-3" /> Secure SIWE verification</div>
              <div className="flex items-center gap-1"><Zap className="h-3 w-3" /> Quick, passwordless login</div>
            </div>
            {installedWallets.length > 0 && (
              <div className="text-xs text-muted-foreground">Detected: {installedWallets.join(', ')}</div>
            )}
            <div className="text-xs">
              New to Web3? <Link href="https://metamask.io/download/" target="_blank" className="text-blue-600">Install MetaMask</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

