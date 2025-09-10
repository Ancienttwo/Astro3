'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'

export default function DefaultPage() {
  const router = useRouter()

  useEffect(() => {
    // 重定向到中文版首页
    router.replace('/home')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Logo size={88} className="mx-auto opacity-60" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-primary font-rajdhani">AstroZi</h2>
          <p className="text-muted-foreground">正在跳转到首页...</p>
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    </div>
  )
} 