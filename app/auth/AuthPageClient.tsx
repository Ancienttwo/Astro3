"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle, 
  Gift,
  Smartphone,
  Globe
} from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import Logo from '@/components/Logo'
import Link from 'next/link'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import { apiClient } from '@/lib/api-client'
import { 
  signInWithEmail, 
  signUpWithEmail, 
  resetPassword,
  signInWithGoogle
} from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useAuthTranslation } from '@/hooks/useAuthTranslation'


export default function AuthPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useAuthTranslation()
  const [language, setLanguage] = useState<'zh' | 'ja' | 'en'>('zh')
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // 新增状态 - 简化逻辑
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  
  // 推荐码相关状态
  const [referralCode, setReferralCode] = useState<string | null>(null)

  // 注册码相关状态
  const [registrationCode, setRegistrationCode] = useState('')
  const [registrationCodeValid, setRegistrationCodeValid] = useState<boolean | null>(null)
  const [registrationCodeError, setRegistrationCodeError] = useState('')
  const [showRegistrationCodeFirst, setShowRegistrationCodeFirst] = useState(false)
  const [isVerifyingCode, setIsVerifyingCode] = useState(false)

  // 新增状态 - 重发验证邮件
  const [showResendVerification, setShowResendVerification] = useState(false)

  // 获取当前语言的文本内容

  // 语言切换处理
  const handleLanguageSwitch = () => {
    let newLang: 'zh' | 'ja' | 'en'
    if (language === 'zh') {
      newLang = 'ja'
    } else if (language === 'ja') {
      newLang = 'en'
    } else {
      newLang = 'zh'
    }
    setLanguage(newLang)
    localStorage.setItem('auth_language', newLang)
  }

  // 初始化语言设置
  useEffect(() => {
    const savedLanguage = localStorage.getItem('auth_language') as 'zh' | 'en'
    if (savedLanguage && ['zh', 'ja', 'en'].includes(savedLanguage)) {
      setLanguage(savedLanguage)
    }
  }, [])

  // 读取推荐码参数和回调URL
  useEffect(() => {
    const refParam = searchParams.get('ref')
    if (refParam) {
      setReferralCode(refParam)
      console.log('检测到推荐码:', refParam)
    }
    
    // 检查回调URL参数
    const callbackParam = searchParams.get('callback')
    if (callbackParam) {
      console.log('检测到回调URL:', callbackParam)
    }
  }, [searchParams])

  // 获取认证成功后的跳转URL
  const getRedirectUrl = () => {
    const callbackParam = searchParams.get('callback')
    return callbackParam ? decodeURIComponent(callbackParam) : '/home'
  }

  // 处理推荐奖励
  const handleReferralReward = async (refCode: string, userEmail: string) => {
    try {
      const response = await apiClient.post('/api/referral/process-reward', {
        referralCode: refCode,
        newUserEmail: userEmail
      })
      
      if (response.success) {
        console.log('推荐奖励处理成功:', response.data)
      } else {
        console.error('推荐奖励处理失败:', response.data?.error)
      }
    } catch (error) {
      console.error('推荐奖励API调用失败:', error)
      throw error
    }
  }

  // 验证注册码
  const verifyRegistrationCode = async (code: string) => {
    if (!code.trim()) {
      setRegistrationCodeError(language === 'zh' ? '请输入注册码' : 'Please enter registration code')
      setRegistrationCodeValid(false)
      return false
    }

    setIsVerifyingCode(true)
    setRegistrationCodeError('')

    try {
      const response = await apiClient.post('/api/verify-registration-code', { registrationCode: code })
      
      if (response.success) {
        setRegistrationCodeValid(true)
        setRegistrationCodeError('')
        return true
      } else {
        setRegistrationCodeValid(false)
        setRegistrationCodeError(response.data?.error || (language === 'zh' ? '注册码无效' : 'Invalid registration code'))
        return false
      }
    } catch (error) {
      setRegistrationCodeValid(false)
      setRegistrationCodeError(language === 'zh' ? '验证失败，请重试' : 'Verification failed, please try again')
      return false
    } finally {
      setIsVerifyingCode(false)
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
      let user: any // UnifiedUser type was removed, so use 'any' for now
      
      if (isLogin) {
        // 登录
        user = await signInWithEmail(email, password)
        console.log(language === 'zh' ? '登录成功:' : 'Login successful:', user)
        
        // 登录成功后跳转到回调URL或默认主页
        const redirectUrl = getRedirectUrl()
        console.log('登录成功，跳转到:', redirectUrl)
        router.push(redirectUrl)
      } else {
        // 注册
        user = await signUpWithEmail(email, password, registrationCode)
        console.log(language === 'zh' ? '注册成功:' : 'Registration successful:', user)
        
        // 处理推荐奖励（如果有推荐码）
        if (referralCode) {
          try {
            console.log(language === 'zh' ? '处理推荐奖励:' : 'Processing referral reward:', referralCode)
            await handleReferralReward(referralCode, email)
          } catch (referralError) {
            console.error(language === 'zh' ? '推荐奖励处理失败:' : 'Referral reward processing failed:', referralError)
            // 推荐奖励失败不影响注册成功
          }
        }
        
        setSuccess(t.registerSuccess)
        
        // 注册成功后直接跳转到回调URL或主页面（无需邮件验证）
        setTimeout(() => {
          const redirectUrl = getRedirectUrl()
          console.log('注册成功，跳转到:', redirectUrl)
          router.push(redirectUrl)
        }, 2000)
      }
    } catch (error: unknown) {
      console.error('认证错误:', error)
      
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
      
      console.log(language === 'zh' ? '开始Google登录...' : 'Starting Google sign in...')
      
      // 获取回调URL并传递给Google登录
      const redirectUrl = getRedirectUrl()
      console.log('Google登录使用回调URL:', redirectUrl)
      await signInWithGoogle(redirectUrl)
      
      // OAuth会自动重定向到callback页面，这里不需要额外处理
      console.log(language === 'zh' ? 'Google登录重定向成功' : 'Google sign in redirect successful')
    } catch (error: any) {
      console.error(language === 'zh' ? 'Google登录失败:' : 'Google sign in failed:', error)
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
      console.error(language === 'zh' ? '重置密码失败:' : 'Password reset failed:', error)
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
    setPassword('')
    setConfirmPassword('')
    setShowResendVerification(false) // 重置重发验证状态
    // 根据新模式设置忘记密码显示
    setShowForgotPassword(!isLogin && email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  }

  // 重发验证邮件
  const handleResendVerification = async () => {
    if (!email) {
      setError(t.enterEmailFirst)
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        throw error
      }
      
      setSuccess(t.resendVerificationSent)
      setShowResendVerification(false)
    } catch (error: unknown) {
      console.error(language === 'zh' ? '重发验证邮件失败:' : 'Resend verification failed:', error)
      setError(error instanceof Error ? error.message : t.resendVerificationFailed)
    } finally {
      setIsLoading(false)
    }
  }

  // 检查是否显示表单字段
  const showFormFields = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 dark:from-gray-900 dark:via-gray-800/20 dark:to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 语言切换按钮 */}
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLanguageSwitch}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border-white/20 text-slate-200 hover:bg-white/20"
          >
            <Globe className="w-4 h-4" />
            {language === 'zh' ? '日本語' : language === 'ja' ? 'EN' : '中文'}
          </Button>
        </div>

        {/* Logo和品牌区域 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size={64} />
          </div>
          <h1 className="text-2xl font-bold text-primary dark:text-yellow-400 mb-2 font-rajdhani">{t.title}</h1>
          <p className="text-muted-foreground dark:text-gray-300">{t.subtitle}</p>
        </div>

        {/* 登录/注册卡片 */}
        <Card className="shadow-lg border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur border border-border/50 dark:border-gray-700/50">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl text-foreground dark:text-gray-100">
              {isLogin ? t.loginTitle : t.registerTitle}
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              {isLogin ? t.loginSubtitle : t.registerSubtitle}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* 推荐码提示 */}
            {referralCode && !isLogin && (
              <Alert className="border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
                <Gift className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <div className="space-y-1">
                    <div className="font-medium">{t.referralCodeTitle}</div>
                    <div className="text-sm">
                      {language === 'zh' ? '推荐码' : 'Referral Code'}: <span className="font-mono font-bold">{referralCode}</span>
                    </div>
                    <div className="text-sm">{t.referralCodeReward}</div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* 错误和成功提示 */}
            {error && (
              <Alert variant="destructive" className="dark:bg-red-900/20 dark:border-red-700">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="dark:text-red-200">
                  <div className="space-y-2">
                    <div>{error}</div>
                    {/* 速率限制时显示Google登录建议 */}
                    {(error.includes('邮件发送频率过高') || error.includes('rate limit')) && (
                      <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
                        <div className="text-sm text-yellow-800 dark:text-yellow-200">
                          <div className="font-medium mb-1">{t.googleSuggestion}</div>
                          {t.googleSuggestionText.split('\n').map((line, index) => (
                            <div key={index}>{line}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* 重发验证邮件按钮 */}
                    {showResendVerification && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResendVerification}
                        disabled={isLoading}
                        className="h-8 text-xs border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                      >
                        {isLoading ? t.sending : t.resendVerification}
                      </Button>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
              </Alert>
            )}

            {/* 注册模式下显示注册码输入（与邮箱表单在同一页面） */}
            {!isLogin && (
              <div className="space-y-4">
                <Alert className="border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                    <div className="space-y-2">
                      <div className="font-medium">{t.registerCodeRequired}</div>
                      <div className="text-sm">{t.registerCodeDescription}</div>
                    </div>
                  </AlertDescription>
                </Alert>

                {/* 注册码输入 */}
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder={t.registerCodePlaceholder}
                    value={registrationCode}
                    onChange={handleRegistrationCodeChange}
                    className="h-11 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                    disabled={isLoading || isResettingPassword}
                  />
                  {registrationCodeError && (
                    <p className="text-xs text-red-600 dark:text-red-400">{registrationCodeError}</p>
                  )}
                  {registrationCodeValid === true && (
                    <p className="text-xs text-green-600 dark:text-green-400">{t.registerCodeValid}</p>
                  )}
                </div>
              </div>
            )}

            {/* 邮箱表单 - 登录模式或注册模式都显示 */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
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
                      {t.switchMode}{isLogin ? (language === 'zh' ? '注册' : 'Registration') : (language === 'zh' ? '登录' : 'Login')}
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
            继续使用即表示您同意我们的
            <Dialog>
              <DialogTrigger asChild>
                <button className="text-primary dark:text-yellow-400 hover:underline mx-1">
                  服务协议
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] dark:bg-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold dark:text-gray-100">AstroZi 服务协议</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh] pr-4">
                  <div className="space-y-4 text-sm dark:text-gray-300">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-yellow-400">1. 引言</h2>
                      <p>本服务协议（以下简称"协议"）由 Cloudmatrix Company Ltd.（以下简称"我们"、"我司"或"公司"）制定。AstroZi 是一个基于人工智能的命理学习平台，提供基于传统文化元素的内容生成服务，其内容仅作娱乐或传统文化学习用途。访问或使用我们的网站和服务，即表示您同意受以下条款的约束。如果您不同意这些条款的任何部分，请勿访问网站或使用我们的服务。</p>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-yellow-400">2. 服务说明及娱乐性质声明</h2>
                      <p>AstroZi 作为一个命理学习平台，提供八字紫微排盘、AI分析报告及智能对话等功能。我们的服务专注于中国传统命理文化的传播与学习，通过现代科技手段对传统文化进行诠释和呈现。</p>
                      <p>本服务的所有分析结果和内容均不具有任何科学依据，仅供娱乐和文化学习之用。我们郑重声明：</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>本服务所有内容仅供娱乐目的使用</li>
                        <li>严禁将分析结果用作任何医疗、健康、投资、婚姻、职业或其他重要决定的依据</li>
                        <li>我们不提供任何形式的预测、预言或命运指导</li>
                        <li>本服务内容仅为传统文化知识的现代诠释，旨在文化教育和娱乐</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-yellow-400">3. 用户责任</h2>
                      <p>使用本服务的用户必须年满18周岁。未满18周岁的用户必须在父母或法定监护人的同意和监督下使用本服务。用户应当对其账户和密码的安全性负责，并确保提供真实、准确的个人信息。</p>
                      <p>用户同意在使用本服务时：</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>提供准确的个人信息和出生信息</li>
                        <li>不滥用或损害我们的服务系统</li>
                        <li>不侵犯他人知识产权或隐私</li>
                        <li>不使用本服务传播迷信内容或从事封建迷信活动</li>
                        <li>不使用服务结果误导他人或进行虚假宣传</li>
                        <li>遵守所有适用的法律法规</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-yellow-400">4. 知识产权</h2>
                      <p>通过我们服务生成的内容仅供您个人使用。您保留您提供的原始信息的权利。网站及其原创内容、功能和设计受国际知识产权法保护。AstroZi 品牌和相关标识属于 Cloudmatrix Company Ltd.。</p>
                      <p>未经我们明确许可，您不得：</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>复制或分发我们的服务内容</li>
                        <li>修改或创建衍生作品</li>
                        <li>将我们的服务用于商业目的</li>
                        <li>使用我们的商标或品牌标识</li>
                        <li>使用生成的内容进行虚假广告或误导他人</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-yellow-400">5. 免责声明</h2>
                      <p>本服务按"现状"和"可用"的基础提供，我们不对服务的准确性、完整性或实用性作出任何保证。分析结果仅供娱乐参考，不构成任何形式的专业建议。</p>
                      <p>我们明确声明本服务：</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>不提供医疗诊断、健康建议或治疗方案</li>
                        <li>不提供投资建议、财务规划或经济预测</li>
                        <li>不提供心理咨询或治疗</li>
                        <li>无法预测未来事件或改变个人命运</li>
                        <li>用户对自己的决定和行为完全负责</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-yellow-400">6. 付费服务</h2>
                      <p>服务价格以网站显示为准，某些高级功能可能需要付费。所有支付通过安全的第三方支付处理商处理。数字服务一经使用不予退款，特殊情况下的退款请求将逐案处理。退款申请必须在购买后7天内提交。</p>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-yellow-400">7. 账户管理</h2>
                      <p>用户需负责保护账户信息、及时更新个人资料、报告任何未经授权的使用，并确保不与他人共享账户。我们保留因违反条款而暂停或终止账户的权利，并可能删除长期不活动的账户。</p>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-yellow-400">8. 服务变更</h2>
                      <p>我们保留修改或终止服务任何部分的权利。重大变更将通过电子邮件或网站通知。继续使用服务表示接受更新后的条款。</p>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-yellow-400">9. 争议解决</h2>
                      <p>本协议的解释、效力及争议解决均适用中华人民共和国香港特别行政区法律。因使用本服务所引起的或与之相关的任何争议，双方应友好协商解决。协商不成的，任何一方均可向公司所在地有管辖权的法院提起诉讼。</p>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-yellow-400">10. 联系方式</h2>
                      <p>如果您对本服务协议有任何疑问，请通过以下方式联系我们：</p>
                      <p className="ml-4">
                        Cloudmatrix Company Ltd.<br/>
                        客服邮箱：cs@astrozi.ai
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-yellow-400">11. 条款接受与法律适用</h2>
                      <p>使用 AstroZi 服务即表示您确认已阅读、理解并完全同意接受本协议的所有内容。您进一步确认并同意：</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>您理解本服务仅供娱乐和文化学习之用；</li>
                        <li>您不会将本服务作为任何重要决定的依据；</li>
                        <li>您同意遵守本协议中规定的所有义务和责任；</li>
                        <li>您确认您有法律能力接受这些条款。</li>
                      </ul>
                      <p>访问或使用本服务的任何部分，包括但不限于浏览网站、注册账户、使用任何功能，均构成您对本协议的明确接受。如果您不同意本协议的任何部分，请立即停止使用本服务。</p>
                      <p>本协议受中华人民共和国香港特别行政区法律管辖并按其解释。与本协议相关的任何争议，均应提交香港特别行政区有管辖权的法院审理。</p>
                      <p className="font-semibold">最后更新日期：2025年7月2日</p>
                    </div>
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
            和
            <Dialog>
              <DialogTrigger asChild>
                <button className="text-primary dark:text-yellow-400 hover:underline mx-1">
                  隐私政策
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] dark:bg-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold dark:text-gray-100">AstroZi 隐私政策</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh] pr-4">
                  <div className="space-y-4 text-sm dark:text-gray-300">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-yellow-400">1. 引言</h2>
                      <p>本隐私政策阐述了 Cloudmatrix Company Ltd.（以下简称"我们"）如何收集、使用、存储和保护您的个人信息。我们深知个人信息对您的重要性，并会尽全力保护您的个人信息安全。</p>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-yellow-400">2. 信息收集</h2>
                      <p>我们收集的信息包括：</p>
                      
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-yellow-300 mt-4 mb-2">2.1 您主动提供的信息</h3>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>账户信息：用户名、密码、电子邮件地址</li>
                          <li>个人信息：姓名、出生日期、出生时间、出生地点</li>
                          <li>联系方式：电子邮件地址、手机号码（如果提供）</li>
                          <li>支付信息：支付时间、支付金额、支付方式</li>
                        </ul>
                        
                        <h3 className="text-lg font-medium text-yellow-300 mt-4 mb-2">2.2 自动收集的信息</h3>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>设备信息：设备型号、操作系统、唯一设备标识符</li>
                          <li>日志信息：IP地址、浏览器类型、访问时间、访问的页面</li>
                          <li>位置信息：基于IP地址的大致位置信息</li>
                          <li>使用数据：功能使用频率、使用时长、操作记录</li>
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-yellow-400">3. 信息使用</h2>
                      <p>我们使用收集的信息用于：</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>提供、维护和改进我们的服务</li>
                        <li>生成八字和紫微斗数排盘</li>
                        <li>提供个性化的服务内容</li>
                        <li>处理您的支付</li>
                        <li>发送服务通知</li>
                        <li>提供客户支持</li>
                        <li>防止欺诈和提升安全性</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-yellow-400">4. 信息共享</h2>
                      <p>我们不会出售、出租或以其他方式与第三方共享您的个人信息，除非：</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>获得您的明确同意</li>
                        <li>法律要求或强制性规定</li>
                        <li>保护我们的合法权益</li>
                        <li>与我们的服务提供商合作（需签署保密协议）</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-yellow-400">5. 信息安全</h2>
                      <p>我们采取多种安全措施保护您的个人信息：</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>使用加密技术传输和存储数据</li>
                        <li>限制员工访问个人信息</li>
                        <li>定期安全评估和审计</li>
                        <li>制定数据泄露响应计划</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-yellow-400">6. 未成年人保护</h2>
                      <p>我们不会故意收集未满18岁未成年人的个人信息。如果发现误收集了未成年人信息，我们会立即删除。未成年人使用我们的服务需要获得监护人的同意。</p>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-yellow-400">7. Cookie 使用</h2>
                      <p>我们使用 Cookie 和类似技术来：</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>记住您的偏好设置</li>
                        <li>分析网站流量</li>
                        <li>优化用户体验</li>
                        <li>提供个性化服务</li>
                      </ul>
                      <p>您可以通过浏览器设置控制或删除 Cookie。</p>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-yellow-400">8. 您的权利</h2>
                      <p>关于您的个人信息，您有权：</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>访问您的个人信息</li>
                        <li>更正不准确的信息</li>
                        <li>删除您的个人信息</li>
                        <li>撤回同意</li>
                        <li>导出数据</li>
                        <li>提出投诉或异议</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-yellow-400">9. 政策更新</h2>
                      <p>我们可能会更新本隐私政策。更新时会在网站公告并更新日期。重大变更将通过电子邮件通知您。</p>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-yellow-400">10. 联系我们</h2>
                      <p>如果您对本隐私政策有任何疑问或建议，请联系：</p>
                      <p className="ml-4">
                        Cloudmatrix Company Ltd.<br/>
                        客服邮箱：cs@astrozi.ai<br/>
                        地址：[公司地址]
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-yellow-400">11. 法律适用</h2>
                      <p>本隐私政策受中华人民共和国香港特别行政区法律管辖。任何相关争议均应提交香港特别行政区有管辖权的法院审理。</p>
                      <p className="font-semibold">最后更新日期：2025年7月2日</p>
                    </div>
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </p>
        </div>



        {/* 返回首页 */}
        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-muted-foreground dark:text-gray-400 hover:text-primary dark:hover:text-yellow-400">
            ← {t.backToHome}
          </Link>
        </div>
      </div>

      {/* PWA安装提示 */}
      <PWAInstallPrompt />
    </div>
  )
} 