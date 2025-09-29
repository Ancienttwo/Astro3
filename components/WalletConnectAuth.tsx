"use client";

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
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
import { buildLocaleHref } from '@/lib/i18n/routing'
import { useNamespaceTranslations } from '@/lib/i18n/useI18n'
import { assertLocale, type Locale } from '@/i18n/messages'

interface WalletConnectAuthProps {
  locale?: Locale
  redirectPath?: string
  disconnectRedirectPath?: string
  variant?: 'standalone' | 'embedded'
  onAuthSuccess?: (user: UnifiedWeb3User) => void
  onAuthError?: (error: WalletIntegrationError) => void
}

type AuthStatus = 'idle' | 'connecting' | 'signing' | 'verifying' | 'creating_session' | 'completed'

export default function WalletConnectAuth({
  locale,
  redirectPath,
  disconnectRedirectPath,
  variant = 'standalone',
  onAuthSuccess,
  onAuthError
}: WalletConnectAuthProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isConnectedView, setIsConnectedView] = useState(false)
  const [userInfo, setUserInfo] = useState<UnifiedWeb3User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [, setChainId] = useState<number>(56)
  const [installedWallets, setInstalledWallets] = useState<string[]>([])
  const [authStatus, setAuthStatus] = useState<AuthStatus>('idle')
  const router = useRouter()
  const intlLocale = useLocale()
  const resolvedLocale = useMemo(() => assertLocale(locale ?? intlLocale), [intlLocale, locale])
  const tAuth = useNamespaceTranslations('web3/auth')

  const resolvePath = (path: string | undefined, fallback: string, options?: { localize?: boolean }) => {
    if (path && (path.startsWith('http://') || path.startsWith('https://'))) {
      return path
    }

    if (path && path.length > 0) {
      return buildLocaleHref(resolvedLocale, path, undefined, options)
    }

    return buildLocaleHref(resolvedLocale, fallback, undefined, options)
  }

  const successRedirect = useMemo(
    () => resolvePath(redirectPath, '/web3', { localize: false }),
    [redirectPath, resolvedLocale]
  )

  const disconnectRedirect = useMemo(
    () => resolvePath(disconnectRedirectPath, '/login'),
    [disconnectRedirectPath, resolvedLocale]
  )

  const statusLabels: Record<AuthStatus, string | null> = {
    idle: null,
    completed: null,
    connecting: tAuth('status.connecting'),
    signing: tAuth('status.signing'),
    verifying: tAuth('status.verifying'),
    creating_session: tAuth('status.creating_session')
  }

  const activeStatusLabel = statusLabels[authStatus]
  const headerClassName = variant === 'embedded' ? 'space-y-1' : 'space-y-1 text-center'
  const badgeWrapperClass = variant === 'embedded' ? 'mt-3' : 'mt-2'

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

      const preferred = ['injected', 'walletConnect']
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
      router.push(successRedirect)
    } catch (e: any) {
      const msg = e instanceof WalletIntegrationError ? e.message : (e?.message || tAuth('errors.generic'))
      setError(msg && msg.length > 0 ? msg : tAuth('errors.generic'))
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
      router.push(disconnectRedirect)
    } catch {
      setError(tAuth('errors.disconnectFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const card = (
    <Card className="shadow-lg border-0 dark:bg-gray-800/50 dark:border-gray-700">
      <CardHeader className={headerClassName}>
        <CardTitle className="text-xl dark:text-gray-100">{tAuth('title')}</CardTitle>
        <CardDescription className="text-muted-foreground dark:text-gray-300">
          {tAuth('tagline')}
        </CardDescription>
        {activeStatusLabel && (
          <div className={badgeWrapperClass}>
            <Badge variant="outline" className="text-xs">
              {activeStatusLabel}
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {isInitializing && (
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
              <span className="text-sm text-gray-600 dark:text-gray-300">{tAuth('loading.initializing')}</span>
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {tAuth('actions.connecting')}
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                {tAuth('actions.connect')}
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{tAuth('labels.address')}</span>
              <span className="font-mono break-all text-right">{walletAddress}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{tAuth('labels.network')}</span>
              <span>{tAuth('labels.networkValue')}</span>
            </div>
            <Button onClick={handleDisconnect} disabled={isLoading} variant="outline" className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {tAuth('actions.disconnecting')}
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  {tAuth('actions.disconnect')}
                </>
              )}
            </Button>
          </div>
        )}

        <Separator />

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" /> {tAuth('helpers.secure')}
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3" /> {tAuth('helpers.fast')}
          </div>
        </div>

        {installedWallets.length > 0 && (
          <div className="text-xs text-muted-foreground">
            {tAuth('labels.detectedWallets', { wallets: installedWallets.join(', ') })}
          </div>
        )}

        <div className="text-xs">
          <span>{tAuth('helpers.metaMask.prefix')} </span>
          <Link href="https://metamask.io/download/" target="_blank" className="text-blue-600 hover:underline">
            {tAuth('helpers.metaMask.linkLabel')}
          </Link>
        </div>
      </CardContent>
    </Card>
  )

  if (variant === 'standalone') {
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
            <p className="text-muted-foreground dark:text-gray-300">{tAuth('tagline')}</p>
          </div>

          {card}
        </div>
      </div>
    )
  }

  return card
}
