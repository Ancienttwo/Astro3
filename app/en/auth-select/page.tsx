"use client"

import { useEffect, useState } from 'react'
import MainLayout from '@/components/MainLayout'
import AuthMethodSelector from '@/components/AuthMethodSelector'
import Background from '@/components/Background'

export default function AuthSelectPageEN() {
  const [language, setLanguage] = useState<"zh" | "en">("en")

  useEffect(() => {
    document.title = "Choose Login Method - AstroZi"
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', "Choose the authentication method that suits your needs - Web3 wallet or email login")
    }
  }, [])

  const t = {
    nav: { 
      home: "Home", 
      features: "Features", 
      products: "Products", 
      pricing: "Pricing", 
      about: "About", 
      docs: "Docs", 
      login: "Login" 
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