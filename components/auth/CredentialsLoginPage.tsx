"use client"

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, CheckCircle2, ShieldCheck, Loader2, ArrowRight, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/PrivyContext'

export type CredentialLoginLocale = 'zh' | 'en' | 'ja'

interface CredentialsLoginPageProps {
  locale?: CredentialLoginLocale
  className?: string
}

type MessageState = {
  type: 'error' | 'success'
  title: string
  description?: string
}

const copy = {
  zh: {
    metaTitle: '邮箱登录',
    headline: '登录 AstroZi 会员中心',
    subheadline: '使用您的邮箱账号访问专属塔罗、命盘与会员功能。',
    bulletTitle: '登录后即可：',
    bullets: [
      '同步跨设备的个性化命盘历史',
      '解锁会员限定的 AI 占卜资源',
      '管理订阅与积分奖励计划'
    ],
    emailLabel: '邮箱地址',
    emailPlaceholder: 'name@example.com',
    passwordLabel: '密码',
    passwordPlaceholder: '••••••••',
    rememberMe: '记住我',
    forgotPassword: '忘记密码？',
    forgotPasswordHref: '/login/forgot-password',
    submitLabel: '登入',
    loadingLabel: '正在登录…',
    successTitle: '登录成功',
    successDescription: '正在为你跳转页面。',
    errorTitle: '登录失败',
    errorDescription: '请检查邮箱和密码。',
    web3Title: '偏好 Web3 登录？',
    web3Description: '通过 WalletConnect 与 Privy 即可一键接入，全新身份系统支持多语言跨设备。',
    web3Button: '切换到 Web3 登录',
    helpLabel: '访问帮助中心',
    helpHref: '/help-center'
  },
  en: {
    metaTitle: 'Email Sign In',
    headline: 'Sign in to AstroZi',
    subheadline: 'Access personalized charts, member perks, and AI guidance with your email account.',
    bulletTitle: 'After signing in you can:',
    bullets: [
      'Sync readings and preferences across devices',
      'Unlock member-only AI astrology experiences',
      'Manage subscriptions and loyalty rewards'
    ],
    emailLabel: 'Email address',
    emailPlaceholder: 'you@example.com',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    forgotPasswordHref: '/en/login/forgot-password',
    submitLabel: 'Sign in',
    loadingLabel: 'Signing in…',
    successTitle: 'Signed in',
    successDescription: 'Redirecting you now.',
    errorTitle: 'Unable to sign in',
    errorDescription: 'Check your email and password then try again.',
    web3Title: 'Prefer Web3 login?',
    web3Description: 'Connect instantly via WalletConnect + Privy with a unified multi-language identity.',
    web3Button: 'Continue with Web3',
    helpLabel: 'Visit Help Center',
    helpHref: '/en/help-center'
  },
  ja: {
    metaTitle: 'メールログイン',
    headline: 'AstroZi にログイン',
    subheadline: 'メールアカウントで占星データや会員特典にアクセスできます。',
    bulletTitle: 'ログインすると：',
    bullets: [
      '複数デバイスで鑑定履歴を同期',
      '会員限定の AI 占い体験が解放',
      'サブスクリプションと特典を管理'
    ],
    emailLabel: 'メールアドレス',
    emailPlaceholder: 'you@example.com',
    passwordLabel: 'パスワード',
    passwordPlaceholder: '••••••••',
    rememberMe: 'ログイン状態を維持',
    forgotPassword: 'パスワードをお忘れですか？',
    forgotPasswordHref: '/ja/login/forgot-password',
    submitLabel: 'ログイン',
    loadingLabel: 'ログイン中…',
    successTitle: 'ログイン成功',
    successDescription: 'まもなくページを移動します。',
    errorTitle: 'ログインに失敗しました',
    errorDescription: 'メールアドレスとパスワードをご確認ください。',
    web3Title: 'Web3 ログインをご希望ですか？',
    web3Description: 'WalletConnect + Privy を利用して多言語・複数デバイスに対応した ID を即時作成できます。',
    web3Button: 'Web3 ログインへ',
    helpLabel: 'ヘルプセンターを見る',
    helpHref: '/ja/help-center'
  }
} as const satisfies Record<CredentialLoginLocale, {
  metaTitle: string
  headline: string
  subheadline: string
  bulletTitle: string
  bullets: string[]
  emailLabel: string
  emailPlaceholder: string
  passwordLabel: string
  passwordPlaceholder: string
  rememberMe: string
  forgotPassword: string
  forgotPasswordHref: string
  submitLabel: string
  loadingLabel: string
  successTitle: string
  successDescription: string
  errorTitle: string
  errorDescription: string
  web3Title: string
  web3Description: string
  web3Button: string
  helpLabel: string
  helpHref: string
}>

export default function CredentialsLoginPage({ locale = 'en', className }: CredentialsLoginPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<MessageState | null>(null)

  const copyForLocale = useMemo(() => copy[locale] ?? copy.en, [locale])

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const storedPreference = localStorage.getItem('astrozi_login_remember')
      const storedEmail = localStorage.getItem('astrozi_login_email')

      if (storedPreference) {
        const shouldRemember = storedPreference === 'true'
        setRememberMe(shouldRemember)
        if (shouldRemember && storedEmail) {
          setEmail(storedEmail)
        }
      }
    } catch (storageError) {
      console.warn('Failed to restore remembered credentials:', storageError)
    }
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage(null)

    if (!email || !password) {
      setMessage({ type: 'error', title: copyForLocale.errorTitle, description: copyForLocale.errorDescription })
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe
        })
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        const errorMessage = payload?.error || payload?.message || copyForLocale.errorDescription
        setMessage({ type: 'error', title: copyForLocale.errorTitle, description: errorMessage })
        return
      }

      try {
        if (typeof window !== 'undefined') {
          if (payload?.session) {
            localStorage.setItem('custom_email_session', JSON.stringify(payload.session))
            if (payload.session?.access_token) {
              localStorage.setItem('supabase_jwt', payload.session.access_token)
            }
          }

          if (payload?.user) {
            const userRecord = {
              ...payload.user,
              auth_method: payload.user?.auth_method || 'custom_email',
              auth_type: payload.user?.auth_type || 'custom_email'
            }
            localStorage.setItem('current_user', JSON.stringify(userRecord))
          }

          localStorage.setItem('astrozi_login_remember', String(rememberMe))
          if (rememberMe) {
            localStorage.setItem('astrozi_login_email', email)
          } else {
            localStorage.removeItem('astrozi_login_email')
          }
        }
      } catch (storageError) {
        console.warn('Failed to persist login session:', storageError)
      }

      setMessage({ type: 'success', title: copyForLocale.successTitle, description: copyForLocale.successDescription })

      const redirectParam =
        searchParams.get('redirect') ||
        searchParams.get('callback') ||
        payload?.redirectPath ||
        payload?.redirect ||
        '/home'

      // Allow success message to render before navigating.
      setTimeout(() => {
        router.replace(redirectParam)
        router.refresh()
      }, 400)
    } catch (error) {
      console.error('Email login failed', error)
      const description = error instanceof Error ? error.message : copyForLocale.errorDescription
      setMessage({ type: 'error', title: copyForLocale.errorTitle, description })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn('min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-purple-950 px-4 py-10 text-white', className)}>
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-6 rounded-3xl bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-purple-300">
              <ShieldCheck className="h-4 w-4" /> AstroZi Secure Access
            </span>
            <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
              {copyForLocale.headline}
            </h1>
            <p className="text-base text-purple-100/90">
              {copyForLocale.subheadline}
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-purple-200/90">
              {copyForLocale.bulletTitle}
            </h2>
            <ul className="space-y-3 text-sm text-purple-100/90">
              {copyForLocale.bullets.map(point => (
                <li key={point} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href={copyForLocale.helpHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-purple-200 underline decoration-dotted underline-offset-4"
          >
            {copyForLocale.helpLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <section className="space-y-6">
          <Card className="border-0 bg-white/90 text-slate-900 shadow-2xl backdrop-blur dark:bg-slate-900/90 dark:text-slate-50">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                {copyForLocale.metaTitle}
              </CardTitle>
              <CardDescription className="text-sm text-slate-600 dark:text-slate-300">
                {copyForLocale.subheadline}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    {copyForLocale.emailLabel}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      value={email}
                      onChange={event => setEmail(event.target.value)}
                      placeholder={copyForLocale.emailPlaceholder}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    {copyForLocale.passwordLabel}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={event => setPassword(event.target.value)}
                      placeholder={copyForLocale.passwordPlaceholder}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={rememberMe}
                      onCheckedChange={value => setRememberMe(Boolean(value))}
                      className="border-slate-300"
                    />
                    <span className="text-slate-600 dark:text-slate-300">{copyForLocale.rememberMe}</span>
                  </label>
                  <Link href={copyForLocale.forgotPasswordHref} className="text-sm font-medium text-purple-600 hover:text-purple-700">
                    {copyForLocale.forgotPassword}
                  </Link>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {copyForLocale.loadingLabel}
                    </>
                  ) : (
                    copyForLocale.submitLabel
                  )}
                </Button>
              </form>

              {message && (
                <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mt-6">
                  <AlertTitle>{message.title}</AlertTitle>
                  {message.description && <AlertDescription>{message.description}</AlertDescription>}
                </Alert>
              )}
            </CardContent>
          </Card>

          <Web3LoginSection
            title={copyForLocale.web3Title}
            description={copyForLocale.web3Description}
            actionLabel={copyForLocale.web3Button}
          />
        </section>
      </div>
    </div>
  )
}

interface Web3LoginSectionProps {
  title: string
  description: string
  actionLabel: string
}

function Web3LoginSection({ title, description, actionLabel }: Web3LoginSectionProps) {
  const { login, isAuthenticated, isLoading } = useAuth()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    if (isAuthenticated || isConnecting) return
    try {
      setIsConnecting(true)
      await login()
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="text-sm text-purple-100/80">{description}</p>
      </div>

      <Button
        onClick={handleConnect}
        className="mt-4 w-full bg-purple-500/80 text-white hover:bg-purple-400"
        disabled={isLoading || isAuthenticated || isConnecting}
      >
        {isAuthenticated ? (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Connected
          </>
        ) : (
          <>
            {(isLoading || isConnecting) ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wallet className="mr-2 h-4 w-4" />
            )}
            {actionLabel}
          </>
        )}
      </Button>
    </div>
  )
}
