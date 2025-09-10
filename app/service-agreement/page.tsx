"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ServiceAgreementPage() {
  const router = useRouter()

  useEffect(() => {
    // 重定向到Landing Page版本的服务协议
    router.replace("/landing-service-agreement")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
        <p className="text-gray-600">正在跳转到服务协议...</p>
      </div>
    </div>
  )
} 