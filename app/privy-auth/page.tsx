"use client"

import { useAuth } from '@/contexts/PrivyContext'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function PrivyAuthPage() {
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/home')
    }
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-2xl font-semibold">使用 Privy 登录</h1>
        <p className="text-muted-foreground">通过 Privy 的社交登录创建账号（Web2 入口）</p>
        <Button onClick={login} className="w-full">Continue with Privy</Button>
        <div>
          <Link href="/" className="text-sm text-muted-foreground hover:underline">返回首页</Link>
        </div>
      </div>
    </div>
  )
}

