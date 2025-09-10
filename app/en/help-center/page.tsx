"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EnglishHelpCenterPage() {
  const router = useRouter()
  
  useEffect(() => {
    // 重定向到主help-center页面，它会自动检测/en/路径并显示英文内容
    router.replace('/help-center?lang=en')
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecting to Help Center...</p>
      </div>
    </div>
  )
} 