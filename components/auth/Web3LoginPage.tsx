"use client"

import { CheckCircle2, Globe2, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import WalletConnectAuth from '@/components/WalletConnectAuth'

const loginContent = {
  zh: {
    title: '统一 Web3 登录入口',
    subtitle: 'AstroZi 现已全面启用 WalletConnect + Privy，无需传统邮箱或社交账号。',
    highlightsLabel: '主要变化',
    highlights: [
      '一次连接，跨语言共享身份（中文 / 日文 / 英文）',
      '登录后自动生成 Supabase Session 与 RLS 权限',
      '支持 Privy 嵌入钱包 + 常见浏览器钱包'
    ],
    checklistTitle: '开始之前建议先确认：',
    checklist: [
      '浏览器已安装或准备安装 Web3 钱包（MetaMask、Rabby 等）',
      '了解 Privy 会在首次登录时生成便捷钱包',
      '如需帮助，可前往帮助中心查看 Web3 登录指引'
    ],
    helpLabel: '查看帮助中心',
    helpHref: '/help-center',
    redirectPath: '/home',
    disconnectRedirectPath: '/login'
  },
  en: {
    title: 'Unified Web3 Login',
    subtitle: 'AstroZi now authenticates exclusively through WalletConnect + Privy — no more passwords.',
    highlightsLabel: 'Highlights',
    highlights: [
      'Single identity across English, Chinese, and Japanese experiences',
      'Supabase session and RLS access are issued automatically after login',
      'Compatible with embedded Privy wallets and popular browser wallets'
    ],
    checklistTitle: 'Before you start, double-check:',
    checklist: [
      'Your browser has a wallet extension ready (MetaMask, Rabby, etc.) or you plan to create one with Privy',
      'You understand that Privy can provision a wallet on the fly',
      'Need a refresher? Visit the Help Center guide for Web3 login'
    ],
    helpLabel: 'Open Help Center',
    helpHref: '/en/help-center',
    redirectPath: '/en/home',
    disconnectRedirectPath: '/en/login'
  },
  ja: {
    title: 'Web3 ログイン統合',
    subtitle: 'AstroZi は WalletConnect + Privy に一本化し、メール／SNS ログインを廃止しました。',
    highlightsLabel: '主なポイント',
    highlights: [
      '1 つのウォレットで日本語／中国語／英語体験をシームレスに利用',
      'ログイン完了後に Supabase セッションと RLS 権限を自動発行',
      'Privy 埋め込みウォレットと主要ブラウザウォレットの双方に対応'
    ],
    checklistTitle: '開始前に次のポイントを確認してください：',
    checklist: [
      'ブラウザに対応ウォレット（MetaMask、Rabby など）がインストール済み、または Privy で新規作成予定',
      'Privy は初回ログイン時にウォレットを自動的に発行できることを把握している',
      'サポートが必要な場合はヘルプセンターで Web3 ログインガイドを確認'
    ],
    helpLabel: 'ヘルプセンターを見る',
    helpHref: '/ja/help-center',
    redirectPath: '/ja/home',
    disconnectRedirectPath: '/ja/login'
  }
} as const

export type Web3LoginLocale = keyof typeof loginContent

interface Web3LoginPageProps {
  locale: Web3LoginLocale
  className?: string
}

const infoPanelStyles = 'space-y-6 rounded-3xl bg-white/70 p-8 shadow-xl backdrop-blur dark:bg-gray-900/60'

export default function Web3LoginPage({ locale, className }: Web3LoginPageProps) {
  const copy = loginContent[locale] ?? loginContent.en

  return (
    <div className={cn('min-h-screen bg-gradient-to-br from-amber-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 py-10', className)}>
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-start">
        <section className={cn(infoPanelStyles, 'border border-purple-100/60 dark:border-purple-400/30')}>
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-purple-500 dark:text-purple-300">
              <Globe2 className="h-4 w-4" /> Web3 Identity
            </span>
            <h1 className="text-3xl font-semibold leading-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
              {copy.title}
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-300">
              {copy.subtitle}
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {copy.highlightsLabel}
            </h2>
            <ul className="space-y-3">
              {copy.highlights.map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-200">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 rounded-2xl border border-dashed border-purple-200/80 bg-purple-50/60 p-5 dark:border-purple-500/20 dark:bg-purple-500/10">
            <div className="flex items-center gap-2 text-sm font-semibold text-purple-700 dark:text-purple-200">
              <ShieldCheck className="h-4 w-4" /> {copy.checklistTitle}
            </div>
            <ul className="space-y-2 text-sm text-purple-900/80 dark:text-purple-100">
              {copy.checklist.map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-purple-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <a
              href={copy.helpHref}
              className="inline-flex items-center gap-2 text-xs font-medium text-purple-700 underline decoration-dotted underline-offset-4 hover:text-purple-900 dark:text-purple-200 dark:hover:text-purple-50"
            >
              {copy.helpLabel}
            </a>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-purple-100/60 bg-white/75 p-6 shadow-2xl backdrop-blur lg:sticky lg:top-10 dark:border-purple-400/20 dark:bg-gray-900/70">
            <WalletConnectAuth
              locale={locale}
              redirectPath={copy.redirectPath}
              disconnectRedirectPath={copy.disconnectRedirectPath}
              variant="embedded"
            />
          </div>
        </section>
      </div>
    </div>
  )
}
