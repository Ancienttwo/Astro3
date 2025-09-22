'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Smartphone, User, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface WechatAuthProps {
  onAuthSuccess?: (userInfo: any) => void
  onAuthError?: (error: string) => void
  redirectUrl?: string
}

interface WechatUser {
  openid: string
  nickname: string
  headimgurl: string
  sex: number
  city: string
  province: string
  country: string
}

export default function WechatAuth({ onAuthSuccess, onAuthError, redirectUrl }: WechatAuthProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isWechatBrowser, setIsWechatBrowser] = useState(false)
  const [user, setUser] = useState<WechatUser | null>(null)
  const [authStep, setAuthStep] = useState<'idle' | 'authorizing' | 'authenticated'>('idle')

  useEffect(() => {
    // 检测是否在微信浏览器中
    const userAgent = navigator.userAgent.toLowerCase()
    const isWechat = userAgent.includes('micromessenger')
    setIsWechatBrowser(isWechat)

    // 检查当前域名是否为IP地址
    const currentHost = window.location.hostname
    const isIPAddress = /^\d+\.\d+\.\d+\.\d+$/.test(currentHost)
    
    if (isIPAddress) {
      console.warn('当前使用IP地址访问，微信授权可能失败。建议使用域名或localhost')
    }

    // 检查URL中是否有授权码
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')

    if (code && state) {
      handleAuthCallback(code, state)
    }

    // 从localStorage恢复用户信息
    const savedUser = localStorage.getItem('wechat_user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setAuthStep('authenticated')
      } catch (error) {
        console.error('Failed to parse saved user data:', error)
        localStorage.removeItem('wechat_user')
      }
    }
  }, [])

  const handleAuthCallback = async (code: string, state: string) => {
    setIsLoading(true)
    setAuthStep('authorizing')

    try {
      const response = await fetch('/api/wechat/auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, state }),
      })

      if (!response.ok) {
        throw new Error('授权失败')
      }

      const result = await response.json()
      
      if (result.success) {
        // 设置Supabase session
        if (result.session) {
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token
          })
          
          if (error) {
            throw new Error('设置登录会话失败')
          }
        }
        
        setUser(result.wechat_info)
        setAuthStep('authenticated')
        
        // 保存用户信息到localStorage
        localStorage.setItem('wechat_user', JSON.stringify(result.wechat_info))
        
        // 清除URL参数
        const url = new URL(window.location.href)
        url.searchParams.delete('code')
        url.searchParams.delete('state')
        window.history.replaceState({}, '', url.toString())
        
        toast.success('微信授权成功！')
        onAuthSuccess?.(result)
      } else {
        throw new Error(result.error || '授权失败')
      }
    } catch (error) {
      console.error('Auth callback error:', error)
      const errorMessage = error instanceof Error ? error.message : '授权失败'
      toast.error(errorMessage)
      onAuthError?.(errorMessage)
      setAuthStep('idle')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWechatLogin = async () => {
    if (!isWechatBrowser) {
      toast.error('请在微信中打开此页面')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/wechat/auth/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          redirect_url: redirectUrl || window.location.href
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // 检查是否是配置缺失错误
        if (response.status === 500 && errorData.error?.includes('微信认证配置缺失')) {
          throw new Error('微信登录功能暂未配置，请使用 Web3 登录')
        }
        
        throw new Error('获取授权链接失败')
      }

      const result = await response.json()
      
      if (result.success) {
        // 跳转到微信授权页面
        window.location.href = result.authUrl
      } else {
        throw new Error(result.error || '获取授权链接失败')
      }
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = error instanceof Error ? error.message : '登录失败'
      toast.error(errorMessage)
      onAuthError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setAuthStep('idle')
    localStorage.removeItem('wechat_user')
    toast.success('已退出登录')
  }

  const renderAuthStep = () => {
    switch (authStep) {
      case 'authorizing':
        return (
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-500" />
            <p className="text-sm text-gray-600">正在获取您的微信信息...</p>
          </div>
        )
      
      case 'authenticated':
        return (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-500 mr-2" />
              <span className="text-green-600 font-medium">授权成功</span>
            </div>
            
            {user && (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                    {user.headimgurl ? (
                      <img 
                        src={user.headimgurl} 
                        alt={user.nickname}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-full h-full p-2 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{user.nickname}</p>
                    <p className="text-sm text-gray-500">
                      {user.city && user.province ? `${user.city}, ${user.province}` : '未知位置'}
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="w-full"
                >
                  切换账号
                </Button>
              </div>
            )}
          </div>
        )
      
      default:
        return (
          <div className="text-center space-y-4">
            <Smartphone className="w-12 h-12 mx-auto text-green-500" />
            <div>
              <h3 className="font-medium mb-2">微信快捷登录</h3>
              <p className="text-sm text-gray-600 mb-4">
                {isWechatBrowser 
                  ? '使用微信授权登录，享受更好的服务体验'
                  : '请在微信中打开此页面进行授权登录'
                }
              </p>
            </div>
            
            <Button 
              onClick={handleWechatLogin}
              disabled={isLoading || !isWechatBrowser}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  授权中...
                </>
              ) : (
                '微信授权登录'
              )}
            </Button>
            
            {!isWechatBrowser && (
              <p className="text-xs text-red-500 mt-2">
                请在微信中打开此页面
              </p>
            )}
          </div>
        )
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">账号授权</CardTitle>
        <CardDescription className="text-center">
          通过微信授权登录AstroZi
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderAuthStep()}
      </CardContent>
    </Card>
  )
}

// 微信浏览器检测工具函数
export function isWechatBrowser(): boolean {
  if (typeof window === 'undefined') return false
  const userAgent = navigator.userAgent.toLowerCase()
  return userAgent.includes('micromessenger')
}

// 获取微信用户信息
export function getWechatUser(): WechatUser | null {
  if (typeof window === 'undefined') return null
  
  try {
    const savedUser = localStorage.getItem('wechat_user')
    return savedUser ? JSON.parse(savedUser) : null
  } catch (error) {
    console.error('Failed to get wechat user:', error)
    return null
  }
} 
