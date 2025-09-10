"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PrivacyPolicyPage() {
  const router = useRouter()

  useEffect(() => {
    // 重定向到Landing Page版本的隐私政策
    router.replace("/landing-privacy-policy")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
        <p className="text-gray-600">正在跳转到隐私政策...</p>
      </div>
    </div>
  )
} 