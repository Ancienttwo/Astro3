"use client"

import { useEffect, useState } from 'react'
import MainLayout from '@/components/MainLayout'
import AuthMethodSelector from '@/components/AuthMethodSelector'
import Background from '@/components/Background'

export default function AuthSelectPage() {
  const [language, setLanguage] = useState<"zh" | "en">("zh")

  useEffect(() => {
    document.title = "选择登录方式 - AstroZi"
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', "选择最适合您的登录方式 - Web3钱包或邮箱密码登录")
    }
  }, [])

  const t = {
    nav: { 
      home: "主页", 
      features: "功能", 
      products: "产品", 
      pricing: "价格", 
      about: "关于", 
      docs: "白皮书", 
      login: "登录" 
    }
  }

  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="relative z-10 min-h-screen bg-transparent dark">
        <MainLayout language={language} setLanguage={setLanguage} t={t}>
          <div className="min-h-screen flex items-center justify-center py-12">
            <AuthMethodSelector language={language} />
          </div>
        </MainLayout>
      </div>
    </div>
  )
}