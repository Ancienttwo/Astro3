"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, CheckCircle, XCircle, Globe, ArrowRight } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } from '@/lib/auth'
import WalletConnectAuth from '@/components/WalletConnectAuth'
import Link from 'next/link'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import { apiClient } from '@/lib/api-client'

interface AuthPageClientProps {
  language: 'zh' | 'en'
}

export default function AuthPageClient({ language = 'en' }: AuthPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // 状态管理
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [registrationCode, setRegistrationCode] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [useWeb3Auth, setUseWeb3Auth] = useState(true) // 默认使用钱包登录

  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [registrationCodeValid, setRegistrationCodeValid] = useState<boolean | null>(null)
  const [registrationCodeError, setRegistrationCodeError] = useState('')
  const [referralCode, setReferralCode] = useState('')

  // 国际化文本
  const t = {
    // 页面标题和描述
    title: "Welcome to AstroZi",
    subtitle: "Your AI-Powered Chinese Astrology Assistant",
    description: "Experience the wisdom of traditional Chinese astrology with modern AI technology",
    loginTitle: "Sign In",
    registerTitle: "Create Account",
    loginSubtitle: "Sign in to your account",
    registerSubtitle: "Create a new account",
    
    // 表单字段
    emailPlaceholder: "Email Address",
    passwordPlaceholder: "Password",
    newPasswordPlaceholder: "New Password",
    confirmPasswordPlaceholder: "Confirm Password",
    registrationCodePlaceholder: "Registration Code",
    
    // 按钮文本
    loginBtn: "Sign In",
    registerBtn: "Create Account",
    loggingIn: "Signing in...",
    registering: "Creating account...",
    googleBtn: "Continue with Google",
    googleBtnLoading: "Connecting...",
    forgotPassword: "Forgot Password?",
    resetPassword: "Reset Password",
    sending: "Sending...",
    
    // 模式切换
    loginMode: "Sign In Mode",
    registerMode: "Registration Mode",
    switchMode: "Switch to ",
    switchToLogin: "Already have an account? Sign in",
    switchToRegister: "Don't have an account? Create one",
    
    // 错误和成功消息
    fillAllFields: "Please fill in all fields",
    invalidEmail: "Please enter a valid email address",
    invalidEmailFormat: "Please use a valid email address",
    passwordTooShort: "Password must be at least 6 characters",
    passwordMismatch: "Passwords do not match",
    needValidCode: "Please enter a valid registration code",
    emailOrPasswordError: "Incorrect email or password",
    emailAlreadyRegistered: "Email already registered, please sign in",
    accountNotActivated: "Account not activated, please check your email",
    operationFailed: "Operation failed, please try again",
    rateLimit: "Too many requests, please try again later",
    registerSuccess: "Registration successful! Redirecting...",
    resetPasswordSent: "Password reset email sent",
    resetPasswordFailed: "Failed to send reset email",
    enterEmailFirst: "Please enter your email address first",
    googleAuthFailed: "Google authentication failed",
    
    // 其他
    or: "OR",
    googleDescription: "Google registration requires no registration code",
    backToHome: "Back to Home",
    languageSwitch: "中文",
    
    // 注册码相关
    registrationCodeLabel: "Registration Code",
    registrationCodeHint: "Enter your registration code to proceed",
    codeValid: "Code is valid",
    codeInvalid: "Invalid code",
    checkingCode: "Checking code...",
    
    // 推荐相关
    referralCodeLabel: "Referral Code (Optional)",
    referralCodePlaceholder: "Referral Code",
    referralCodeHint: "Enter referral code to get bonus credits"
  }

  // 从URL参数获取推荐码
  useEffect(() => {
    const refCode = searchParams.get('ref')
    if (refCode) {
      setReferralCode(refCode)
    }
  }, [searchParams])

  // 处理语言切换
  const handleLanguageSwitch = () => {
    const currentPath = window.location.pathname
    const currentSearch = window.location.search
    
    if (language === 'zh') {
      // 从中文切换到英文
      router.push(`/en/auth${currentSearch}`)
    } else {
      // 从英文切换到中文
      router.push(`/auth${currentSearch}`)
    }
  }

  // 处理推荐奖励
  const handleReferralReward = async (refCode: string, userEmail: string) => {
    try {
      const response = await apiClient.post('/api/referral/process-reward', {
        referralCode: refCode,
        newUserEmail: userEmail
      })

      if (!response.success) {
        throw new Error('Failed to process referral reward')
      }

      console.log('Referral reward processed successfully:', response.data)
    } catch (error) {
      console.error('Error processing referral reward:', error)
      throw error
    }
  }

  // 验证注册码
  const verifyRegistrationCode = async (code: string) => {
    if (!code || code.length < 8) {
      setRegistrationCodeValid(null)
      setRegistrationCodeError('')
      return
    }

    try {
      const response = await apiClient.post('/api/verify-registration-code', { code })
      
      if (response.success && response.data.valid) {
        setRegistrationCodeValid(true)
        setRegistrationCodeError('')
      } else {
        setRegistrationCodeValid(false)
        setRegistrationCodeError(response.data?.message || 'Invalid registration code')
      }
    } catch (error) {
      console.error('Error verifying registration code:', error)
      setRegistrationCodeValid(false)
      setRegistrationCodeError('Failed to verify registration code')
    }
  }

  // 处理注册码输入变化
  const handleRegistrationCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase()
    setRegistrationCode(code)
    
    if (code.length >= 8) {
      await verifyRegistrationCode(code)
    } else {
      setRegistrationCodeValid(null)
      setRegistrationCodeError('')
    }
  }

  const validateForm = (): boolean => {
    setError('')
    
    if (!email || !password) {
      setError(t.fillAllFields)
      return false
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t.invalidEmail)
      return false
    }

    if (password.length < 6) {
      setError(t.passwordTooShort)
      return false
    }

    // 注册时需要确认密码
    if (!isLogin && password !== confirmPassword) {
      setError(t.passwordMismatch)
      return false
    }

    // 邮箱注册时需要验证注册码
    if (!isLogin && (!registrationCode || registrationCodeValid !== true)) {
      setError(t.needValidCode)
      return false
    }

    return true
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setError('')
    setSuccess('')
    
    try {
      let user: any
      
      if (isLogin) {
        // 登录
        user = await signInWithEmail(email, password)
        console.log('Login successful:', user)
        
        // 登录成功后跳转到英文版主页
        router.push('/en/home')
      } else {
        // 注册
        user = await signUpWithEmail(email, password, registrationCode)
        console.log('Registration successful:', user)
        
        // 处理推荐奖励（如果有推荐码）
        if (referralCode) {
          try {
            console.log('Processing referral reward:', referralCode)
            await handleReferralReward(referralCode, email)
          } catch (referralError) {
            console.error('Referral reward processing failed:', referralError)
            // 推荐奖励失败不影响注册成功
          }
        }
        
        setSuccess(t.registerSuccess)
        
        // 注册成功后直接跳转到英文版主页面（无需邮件验证）
        setTimeout(() => {
          router.push('/en/home')
        }, 2000)
      }
    } catch (error: unknown) {
      console.error('Authentication error:', error)
      
      // 处理常见错误
      const errorMessage = error instanceof Error ? error.message : ''
      const errorString = error?.toString() || ''
      
      // 速率限制错误
      if (errorMessage.includes('请求过于频繁') || 
          errorMessage.includes('Too many requests') ||
          errorMessage.includes('rate limit') ||
          errorMessage.includes('邮件发送频率过高')) {
        setError(errorMessage.includes('邮件发送频率过高') ? 
          errorMessage : t.rateLimit)
      }
      // 邮箱密码错误
      else if (errorMessage.includes('Invalid login credentials')) {
        setError(t.emailOrPasswordError)
      } 
      // 邮箱已注册
      else if (errorMessage.includes('User already registered') || 
               errorMessage.includes('该邮箱已注册') ||
               errorString.includes('duplicate key value violates unique constraint') ||
               errorString.includes('users_pkey')) {
        setError(t.emailAlreadyRegistered)
        // 自动切换到登录模式
        setIsLogin(true)
        setShowForgotPassword(true)
      } 
      // 邮箱未确认（生产环境已禁用邮件验证，此错误不应出现）
      else if (errorMessage.includes('Email not confirmed')) {
        setError(t.accountNotActivated)
      }
      // 邮箱格式错误
      else if (errorMessage.includes('邮箱格式不正确') ||
               errorMessage.includes('请使用真实有效的邮箱地址')) {
        setError(t.invalidEmailFormat)
      }
      // 密码问题
      else if (errorMessage.includes('密码至少需要')) {
        setError(t.passwordTooShort)
      }
      // 注册码问题
      else if (errorMessage.includes('注册码')) {
        setError(errorMessage)
      }
      // 其他错误
      else {
        setError(errorMessage || t.operationFailed)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 处理Google登录
  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      console.log('Starting Google sign in...')
      await signInWithGoogle()
      
      // OAuth会自动重定向到callback页面，这里不需要额外处理
      console.log('Google sign in redirect successful')
    } catch (error: any) {
      console.error('Google sign in failed:', error)
      setError(error.message || t.googleAuthFailed)
      setIsLoading(false)
    }
  }

  // 处理邮箱输入变化
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value
    setEmail(emailValue)
    
    // 重置状态
    setError('')
    setSuccess('')
    
    // 根据当前模式设置忘记密码显示
    setShowForgotPassword(isLogin && emailValue && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue))
  }

  // 处理忘记密码
  const handleForgotPassword = async () => {
    if (!email) {
      setError(t.enterEmailFirst)
      return
    }

    setIsResettingPassword(true)
    setError('')
    
    try {
      await resetPassword(email)
      setSuccess(t.resetPasswordSent)
      setShowForgotPassword(false)
    } catch (error: unknown) {
      console.error('Password reset failed:', error)
      setError(error instanceof Error ? error.message : t.resetPasswordFailed)
    } finally {
      setIsResettingPassword(false)
    }
  }

  // 处理模式切换
  const handleModeSwitch = () => {
    setIsLogin(!isLogin)
    setError('')
    setSuccess('')
    setShowForgotPassword(false)
    setPassword('')
    setConfirmPassword('')
    setRegistrationCode('')
    setRegistrationCodeValid(null)
    setRegistrationCodeError('')
  }

  // 检查是否显示表单字段
  const showFormFields = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  // 如果使用WalletConnect，直接返回WalletConnect组件
  if (useWeb3Auth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* WalletConnect组件 */}
          <WalletConnectAuth locale="en" redirectPath="/en/home" disconnectRedirectPath="/en/login" />
          
          {/* 切换到传统认证 */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUseWeb3Auth(false)}
              className="text-sm text-muted-foreground dark:text-gray-400 hover:text-primary dark:hover:text-yellow-400"
            >
              Use Legacy Email Login
            </Button>
          </div>
          
          {/* 语言切换 */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLanguageSwitch}
              className="text-sm text-muted-foreground dark:text-gray-400 hover:text-primary dark:hover:text-yellow-400"
            >
              <Globe className="w-4 h-4 mr-1" />
              {t.languageSwitch}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* 页面头部 */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <div className="text-2xl">🌟</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent">
              {t.title}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            {t.subtitle}
          </p>
          <p className="text-xs text-muted-foreground dark:text-gray-500">
            {t.description}
          </p>
        </div>

        {/* 语言切换和认证方式切换 */}
        <div className="flex justify-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLanguageSwitch}
            className="text-sm text-muted-foreground dark:text-gray-400 hover:text-primary dark:hover:text-yellow-400"
          >
            <Globe className="w-4 h-4 mr-1" />
            {t.languageSwitch}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUseWeb3Auth(true)}
            className="text-sm text-muted-foreground dark:text-gray-400 hover:text-primary dark:hover:text-yellow-400"
          >
            Try WalletConnect
          </Button>
        </div>

        {/* 错误和成功消息 */}
        {error && (
          <Alert className="border-red-200 dark:border-red-800">
            <XCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700 dark:text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="border-green-200 dark:border-green-800">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700 dark:text-green-400">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* 推荐码显示 */}
        {referralCode && (
          <Alert className="border-blue-200 dark:border-blue-800">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700 dark:text-blue-400">
              Referral code applied: {referralCode}
            </AlertDescription>
          </Alert>
        )}

        {/* 认证卡片 */}
        <Card className="shadow-lg border-0 dark:bg-gray-800/50 dark:border-gray-700">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl dark:text-gray-100">
              {isLogin ? t.loginTitle : t.registerTitle}
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              {isLogin ? t.loginSubtitle : t.registerSubtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 邮箱密码登录表单 */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {/* 邮箱输入 */}
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground dark:text-gray-400" />
                  <Input
                    type="email"
                    placeholder={t.emailPlaceholder}
                    value={email}
                    onChange={handleEmailChange}
                    className="pl-10 h-11 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                    required
                    disabled={isLoading || isResettingPassword}
                  />
                </div>
                
                {/* 模式提示 */}
                {showFormFields && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                      {isLogin ? t.loginMode : t.registerMode}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleModeSwitch}
                      className="text-xs h-6 px-2 dark:text-gray-300 dark:hover:text-yellow-400 dark:hover:bg-gray-700"
                      disabled={isLoading || isResettingPassword}
                    >
                      {t.switchMode}{isLogin ? 'Registration' : 'Login'}
                    </Button>
                  </div>
                )}
              </div>
              
              {showFormFields && (
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={isLogin ? t.passwordPlaceholder : t.newPasswordPlaceholder}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 h-11 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                      required
                      disabled={isLoading || isResettingPassword}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-gray-200 disabled:opacity-50"
                      disabled={isLoading || isResettingPassword}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {/* 忘记密码链接 - 只在登录模式显示 */}
                  {isLogin && showForgotPassword && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={isResettingPassword || isLoading}
                        className="text-xs text-primary dark:text-yellow-400 hover:underline disabled:opacity-50"
                      >
                        {isResettingPassword ? t.sending : t.forgotPassword}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 注册模式的确认密码 */}
              {showFormFields && !isLogin && (
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder={t.confirmPasswordPlaceholder}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                    required
                    disabled={isLoading || isResettingPassword}
                    minLength={6}
                  />
                </div>
              )}

              {/* 注册码输入 - 只在注册模式显示 */}
              {showFormFields && !isLogin && (
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder={t.registrationCodePlaceholder}
                      value={registrationCode}
                      onChange={handleRegistrationCodeChange}
                      className="pr-10 h-11 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                      required
                      disabled={isLoading || isResettingPassword}
                      maxLength={12}
                    />
                    {registrationCodeValid !== null && (
                      <div className="absolute right-3 top-3">
                        {registrationCodeValid ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {registrationCodeError && (
                    <p className="text-xs text-red-500 dark:text-red-400">
                      {registrationCodeError}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    {t.registrationCodeHint}
                  </p>
                </div>
              )}

              {/* 提交按钮 */}
              {showFormFields && (
                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/90 dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:text-gray-900"
                  disabled={isLoading || isResettingPassword}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                      <span>{isLogin ? t.loggingIn : t.registering}</span>
                    </div>
                  ) : (
                    isLogin ? t.loginBtn : t.registerBtn
                  )}
                </Button>
              )}
            </form>

            {/* 分割线 */}
            <div className="relative">
              <Separator className="dark:bg-gray-600" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white dark:bg-gray-800 px-2 text-xs text-muted-foreground dark:text-gray-400">{t.or}</span>
              </div>
            </div>

            {/* Google登录 */}
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleAuth}
                disabled={isLoading || isResettingPassword}
                className="w-full h-11 bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600/50 text-gray-900 dark:text-gray-100"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                    <span>{t.googleBtnLoading}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <FcGoogle className="w-5 h-5" />
                    <span>{t.googleBtn}</span>
                  </div>
                )}
              </Button>
              
              {/* Google登录说明 */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground dark:text-gray-400">
                  {t.googleDescription}
                </p>
              </div>
            </div>

            {/* 手动切换模式 */}
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={handleModeSwitch}
                className="text-sm text-muted-foreground dark:text-gray-400 hover:text-primary dark:hover:text-yellow-400"
                disabled={isLoading || isResettingPassword}
              >
                {isLogin ? t.switchToRegister : t.switchToLogin}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 服务协议和隐私政策 */}
        <div className="mt-6 text-center text-xs text-muted-foreground dark:text-gray-400">
          <p>
            By continuing to use, you agree to our{' '}
            <a 
              href="/landing-service-agreement?lang=en" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary dark:text-yellow-400 hover:underline"
            >
              Terms of Service
            </a>
            {' '}and{' '}
            <a 
              href="/landing-privacy-policy?lang=en" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary dark:text-yellow-400 hover:underline"
            >
              Privacy Policy
            </a>
          </p>
        </div>

        {/* 返回首页 */}
        <div className="mt-4 text-center">
          <Link href="/en" className="text-sm text-muted-foreground dark:text-gray-400 hover:text-primary dark:hover:text-yellow-400">
            ← {t.backToHome}
          </Link>
        </div>
      </div>

      {/* PWA安装提示 */}
      <PWAInstallPrompt />
    </div>
  )
} 
