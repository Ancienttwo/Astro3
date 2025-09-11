"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, KeyRound, Gift } from 'lucide-react'
import Link from 'next/link'

interface AuthMethodSelectorProps {
  language: 'zh' | 'en'
}

export default function AuthMethodSelector({ language }: AuthMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<'web3' | 'privy' | null>(null)

  const content = {
    zh: {
      title: "选择您的登录方式",
      subtitle: "根据您的需求选择最适合的认证方式",
      web3: {
        title: "Web3 钱包登录",
        description: "使用加密钱包，无需密码，去中心化认证",
        features: [
          "🪂 Airdrops from foundation",
          "🔐 去中心化安全",
          "🚀 一键连接"
        ],
        recommended: "推荐",
        cta: "连接钱包"
      },
      email: {
        title: "Privy 登录",
        description: "通过 Privy 的社交登录创建账号（Web2 入口）",
        features: [
          "🔑 Google/Twitter/Discord/GitHub/Apple",
          "🪪 自动创建嵌入式钱包（可选）",
          "🔒 安全合规，一键登录"
        ],
        cta: "使用 Privy 登录"
      },
      comparison: {
        feature: "功能对比",
        cost: "费用",
        setup: "设置难度",
        security: "安全性",
        speed: "登录速度"
      }
    },
    en: {
      title: "Choose Your Login Method",
      subtitle: "Select the authentication method that suits your needs",
      web3: {
        title: "Web3 Wallet Login",
        description: "Use crypto wallet, no password required, decentralized authentication",
        features: [
          "🪂 Airdrops from foundation",
          "🔐 Decentralized Security", 
          "🚀 One-Click Connect"
        ],
        recommended: "Recommended",
        cta: "Connect Wallet"
      },
      email: {
        title: "Privy Login",
        description: "Sign in with Privy social login (Web2 entry)",
        features: [
          "🔑 Google/Twitter/Discord/GitHub/Apple",
          "🪪 Auto-create embedded wallet (optional)",
          "🔒 Secure, one-click login"
        ],
        cta: "Continue with Privy"
      },
      comparison: {
        feature: "Feature Comparison",
        cost: "Cost",
        setup: "Setup Difficulty",
        security: "Security",
        speed: "Login Speed"
      }
    }
  }

  const t = content[language]

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[#FBCB0A] font-rajdhani mb-6">
          {t.title}
        </h1>
        <p className="text-xl text-[#E0E0E0] max-w-2xl mx-auto">
          {t.subtitle}
        </p>
      </div>

      {/* Method Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Web3 Method */}
        <Card 
          className={`backdrop-blur-md border-2 transition-all duration-300 rounded-2xl shadow-2xl hover:shadow-[0_0_30px_rgba(251,203,10,0.2)] hover:-translate-y-2 bg-black/20 border-[#FBCB0A]/30 hover:border-[#FBCB0A]/50 cursor-pointer ${
            selectedMethod === 'web3' ? 'border-[#FBCB0A] shadow-[0_0_30px_rgba(251,203,10,0.3)]' : ''
          }`}
          onClick={() => setSelectedMethod('web3')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FBCB0A] to-yellow-600 flex items-center justify-center shadow-xl relative">
                  <Wallet className="w-8 h-8 text-[#3D0B5B]" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <Gift className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-[#FBCB0A] font-rajdhani text-xl">{t.web3.title}</CardTitle>
                  <Badge variant="secondary" className="bg-green-500 text-white text-xs mt-1">
                    {t.web3.recommended}
                  </Badge>
                </div>
              </div>
            </div>
            <CardDescription className="text-[#E0E0E0] text-base mt-3">
              {t.web3.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-8">
              {t.web3.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-[#FBCB0A] shadow-lg"></div>
                  <span className="text-[#E0E0E0]">{feature}</span>
                </div>
              ))}
            </div>
            
            <Link href={language === 'zh' ? '/wallet-auth' : '/en/wallet-auth'}>
              <Button className="w-full py-4 text-lg font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 bg-[#FBCB0A] text-[#3D0B5B] border-2 border-[#FBCB0A] hover:bg-[#e6b709] hover:shadow-[0_0_30px_rgba(251,203,10,0.5)] font-rajdhani">
                <Wallet className="w-5 h-5 mr-2" />
                {t.web3.cta}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Privy Method */}
        <Card 
          className={`backdrop-blur-md border-2 transition-all duration-300 rounded-2xl shadow-2xl hover:shadow-[0_0_30px_rgba(147,51,234,0.2)] hover:-translate-y-2 bg-black/20 border-purple-400/30 hover:border-purple-400/50 cursor-pointer ${
            selectedMethod === 'privy' ? 'border-purple-400 shadow-[0_0_30px_rgba(147,51,234,0.3)]' : ''
          }`}
          onClick={() => setSelectedMethod('privy')}
        >
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center shadow-xl">
                <KeyRound className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-purple-300 font-rajdhani text-xl">{t.email.title}</CardTitle>
              </div>
            </div>
            <CardDescription className="text-[#E0E0E0] text-base mt-3">
              {t.email.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-8">
              {t.email.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-purple-400 shadow-lg"></div>
                  <span className="text-[#E0E0E0]">{feature}</span>
                </div>
              ))}
            </div>
            
            <Link href={language === 'zh' ? '/privy-auth' : '/en/privy-auth'}>
              <Button className="w-full py-4 text-lg font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-2 border-purple-500 hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] font-rajdhani">
                <KeyRound className="w-5 h-5 mr-2" />
                {t.email.cta}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>


      {/* Help Section */}
      <div className="mt-12 text-center">
        <p className="text-[#E0E0E0] text-lg mb-6">
          {language === 'zh' ? 
            '不确定选择哪种方式？我们推荐首次用户尝试 Web3 钱包登录' :
            'Not sure which method to choose? We recommend first-time users try Web3 wallet login'
          }
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={language === 'zh' ? '/wallet-guide' : '/en/wallet-guide'}>
            <Button variant="outline" className="border-[#FBCB0A]/50 text-[#FBCB0A] hover:bg-[#FBCB0A]/10 py-3 px-6 rounded-xl backdrop-blur-sm border-2 font-rajdhani">
              {language === 'zh' ? '钱包设置指南' : 'Wallet Setup Guide'}
            </Button>
          </Link>
          <Link href={language === 'zh' ? '/faq' : '/en/faq'}>
            <Button variant="outline" className="border-white/50 text-white hover:bg-white/10 py-3 px-6 rounded-xl backdrop-blur-sm border-2 font-rajdhani">
              {language === 'zh' ? '常见问题' : 'FAQ'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
