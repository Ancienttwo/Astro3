'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { handleOAuthCallback } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Logo from '@/components/Logo'

export default function AuthCallbackPage() {
  // This page reads search params at runtime; avoid SSG
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const __dynamic = (exports as any).dynamic = 'force-dynamic'
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const processCallback = async () => {
      try {
        setStatus('processing')
        
        // 处理OAuth回调
        const user = await handleOAuthCallback()
        
        if (user) {
          console.log('OAuth登录成功:', user.email)
          setStatus('success')
          
          // 延迟跳转，让用户看到成功消息
          setTimeout(() => {
            router.push('/home')
          }, 2000)
        } else {
          throw new Error('认证成功但未找到用户信息')
        }
      } catch (error: any) {
        console.error('OAuth回调处理失败:', error)
        setError(error.message || '认证失败')
        setStatus('error')
        
        // 5秒后跳转回登录页
        setTimeout(() => {
          router.push('/auth')
        }, 5000)
      }
    }

    processCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 dark:from-gray-900 dark:via-gray-800/20 dark:to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo和品牌区域 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size={64} />
          </div>
          <h1 className="text-2xl font-bold text-primary dark:text-yellow-400 mb-2 font-rajdhani">AstroZi 星玺</h1>
          <p className="text-muted-foreground dark:text-gray-300">正在处理您的登录...</p>
        </div>

        {/* 状态卡片 */}
        <Card className="shadow-lg border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur border border-border/50 dark:border-gray-700/50">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-foreground dark:text-gray-100">
              {status === 'processing' && '正在处理登录'}
              {status === 'success' && '登录成功'}
              {status === 'error' && '登录失败'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {status === 'processing' && (
              <Alert className="border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  正在验证您的身份，请稍候...
                </AlertDescription>
              </Alert>
            )}

            {status === 'success' && (
              <Alert className="border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  <div className="space-y-2">
                    <div className="font-medium">Google登录成功！</div>
                    <div className="text-sm">正在跳转到主页...</div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {status === 'error' && (
              <Alert variant="destructive" className="dark:bg-red-900/20 dark:border-red-700">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="dark:text-red-200">
                  <div className="space-y-2">
                    <div className="font-medium">登录失败</div>
                    <div className="text-sm">{error}</div>
                    <div className="text-sm">5秒后将跳转回登录页面...</div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* 返回登录页链接 */}
        {status === 'error' && (
          <div className="mt-6 text-center">
            <a 
              href="/auth" 
              className="text-sm text-muted-foreground dark:text-gray-400 hover:text-primary dark:hover:text-yellow-400"
            >
              ← 返回登录页
            </a>
          </div>
        )}
      </div>
    </div>
  )
} 
