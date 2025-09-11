"use client"

import { useAuth } from '@/contexts/PrivyContext'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function PrivyAuthPageEN() {
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/en/home')
    }
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-2xl font-semibold">Sign in with Privy</h1>
        <p className="text-muted-foreground">Use Privy social login as the Web2 entry</p>
        <Button onClick={login} className="w-full">Continue with Privy</Button>
        <div>
          <Link href="/en" className="text-sm text-muted-foreground hover:underline">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}

