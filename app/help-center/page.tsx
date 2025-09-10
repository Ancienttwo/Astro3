"use client"

import { useState } from "react"
import { useSearchParams, usePathname } from 'next/navigation'
import { getCurrentLanguage } from '@/lib/i18n/useI18n'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Shield, Eye, EyeOff, CheckCircle, AlertCircle, HelpCircle, BookOpen, MessageCircle, FileText, Lock, Star, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import SmartLayout from "@/components/SmartLayout";
import { supabase } from '@/lib/supabase';


export default function HelpCenterPage() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const language = getCurrentLanguage(pathname, searchParams)
  const isEnglish = language === 'en'
  
  // 修改密码相关状态
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  
  // 法律条款弹窗状态
  const [showServiceAgreement, setShowServiceAgreement] = useState(false)
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)

  // 国际化文本
  const t = {
    zh: {
      title: '帮助中心',
      subtitle: '快速找到您需要的帮助和指导',
      quickStart: '快速开始',
      dailyFeatures: '每日功能',
      features: '功能介绍',
      account: '账户安全',
      faq: '常见问题',
      quickStartItems: [
        { title: '注册与登录', description: '使用邮箱注册账户，安全登录系统' },
        { title: '完善个人资料', description: '设置个人信息，选择喜欢的主题风格' },
        { title: '开始排盘', description: '创建您的第一个八字或紫微命盘' },
        { title: 'AI分析', description: '使用AI大师功能获得专业命理分析' }
      ],
      dailyFeaturesItems: [
        { title: '每日签到', description: '每天登录签到获得免费AI分析次数' },
        { title: '连续签到奖励', description: '连续签到7天、15天、30天获得额外奖励' },
        { title: '使用次数管理', description: '查看剩余分析次数和ChatBot对话次数' }
      ],
      featuresItems: [
        { title: '八字分析', description: '基于出生时间的四柱推命分析' },
        { title: '紫微斗数', description: '中华命理精髓，预测人生走向' },
        { title: 'AI智聊', description: '与司天监正、玄虚道人等AI大师对话' },
        { title: '命书管理', description: '保存和管理您的命盘记录' }
      ],
      accountItems: [
        { title: '密码安全', description: '定期更新密码，保护账户安全', action: '修改密码' },
        { title: '数据备份', description: '命盘数据自动同步到云端', action: undefined },
        { title: '隐私保护', description: '严格保护您的个人信息安全', action: undefined }
      ],
      faqs: [
        { question: '如何获得更多AI分析次数？', answer: '通过每日签到、购买会员或单次充值都可以获得更多分析次数。' },
        { question: '命盘数据会丢失吗？', answer: '不会，您的命盘数据会自动同步到云端，可在不同设备间使用。' },
        { question: '如何联系客服？', answer: '您可以通过设置页面的联系我们功能，或发送邮件联系我们。' },
        { question: '忘记密码怎么办？', answer: '在登录页面点击"忘记密码"，通过邮箱重置密码。' }
      ],
      passwordDialog: {
        title: '修改密码',
        currentPassword: '当前密码',
        newPassword: '新密码',
        confirmPassword: '确认新密码',
        cancel: '取消',
        confirm: '确认修改',
        changing: '修改中...',
        fillAllFields: '请填写所有字段',
        passwordTooShort: '新密码至少需要6个字符',
        passwordMismatch: '两次输入的新密码不一致',
        samePassword: '新密码不能与当前密码相同',
        userNotLoggedIn: '用户未登录',
        incorrectPassword: '当前密码不正确',
        updateFailed: '密码更新失败',
        updateSuccess: '密码修改成功！'
      }
    },
    en: {
      title: 'Help Center',
      subtitle: 'Quickly find the help and guidance you need',
      quickStart: 'Quick Start',
      dailyFeatures: 'Daily Features',
      features: 'Features',
      account: 'Account Security',
      faq: 'FAQ',
      quickStartItems: [
        { title: 'Register & Login', description: 'Register an account with email and login securely' },
        { title: 'Complete Profile', description: 'Set personal information and choose your preferred theme' },
        { title: 'Start Chart Reading', description: 'Create your first BaZi or ZiWei chart' },
        { title: 'AI Analysis', description: 'Use AI masters for professional astrological analysis' }
      ],
      dailyFeaturesItems: [
        { title: 'Daily Check-in', description: 'Login daily to earn free AI analysis credits' },
        { title: 'Consecutive Check-in Rewards', description: 'Get extra rewards for 7, 15, 30 consecutive days' },
        { title: 'Usage Management', description: 'View remaining analysis credits and ChatBot conversations' }
      ],
      featuresItems: [
        { title: 'BaZi Natal', description: 'Four Pillars fortune-telling based on birth time' },
        { title: 'ZiWei Astrology', description: 'Essence of Chinese astrology, predicting life trends' },
        { title: 'AI Chat', description: 'Converse with AI masters like Grand Astrologer and Sage Xuan Xu' },
        { title: 'Chart Management', description: 'Save and manage your natal chart records' }
      ],
      accountItems: [
        { title: 'Password Security', description: 'Regularly update password to protect account security', action: 'Change Password' },
        { title: 'Data Backup', description: 'Chart data automatically synced to cloud', action: undefined },
        { title: 'Privacy Protection', description: 'Strictly protect your personal information security', action: undefined }
      ],
      faqs: [
        { question: 'How to get more AI analysis credits?', answer: 'Through daily check-in, purchasing membership, or one-time top-up to get more analysis credits.' },
        { question: 'Will chart data be lost?', answer: 'No, your chart data is automatically synced to the cloud and can be used across different devices.' },
        { question: 'How to contact customer service?', answer: 'You can use the Contact Us feature in settings or send us an email.' },
        { question: 'What if I forget my password?', answer: 'Click "Forgot Password" on the login page to reset via email.' }
      ],
      passwordDialog: {
        title: 'Change Password',
        currentPassword: 'Current Password',
        newPassword: 'New Password',
        confirmPassword: 'Confirm Password',
        cancel: 'Cancel',
        confirm: 'Confirm Change',
        changing: 'Changing...',
        fillAllFields: 'Please fill all fields',
        passwordTooShort: 'New password must be at least 6 characters',
        passwordMismatch: 'New passwords do not match',
        samePassword: 'New password cannot be the same as current password',
        userNotLoggedIn: 'User not logged in',
        incorrectPassword: 'Current password is incorrect',
        updateFailed: 'Password update failed',
        updateSuccess: 'Password changed successfully!'
      }
    }
  }

  const content = t[isEnglish ? 'en' : 'zh']

  // 帮助内容数据
  const helpSections = [
    {
      id: 'quick-start',
      title: content.quickStart,
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      items: content.quickStartItems
    },
    {
      id: 'daily-features',
      title: content.dailyFeatures,
      icon: RefreshCw,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      items: content.dailyFeaturesItems
    },
    {
      id: 'features',
      title: content.features,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      items: content.featuresItems
    },
    {
      id: 'account',
      title: content.account,
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      items: content.accountItems.map((item: { title: string; description: string; action?: string }) => ({
        ...item,
        onClick: item.action ? () => {
          resetPasswordForm()
          setShowChangePasswordDialog(true)
        } : undefined
      }))
    }
  ]

  // 处理修改密码
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError(content.passwordDialog.fillAllFields)
      return
    }

    if (newPassword.length < 6) {
      setPasswordError(content.passwordDialog.passwordTooShort)
      return
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError(content.passwordDialog.passwordMismatch)
      return
    }

    if (currentPassword === newPassword) {
      setPasswordError(content.passwordDialog.samePassword)
      return
    }

    setIsChangingPassword(true)
    setPasswordError('')
    setPasswordSuccess('')

    try {
      // 首先验证当前密码
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        throw new Error(content.passwordDialog.userNotLoggedIn)
      }

      // 尝试用当前密码重新登录来验证
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      })

      if (verifyError) {
        throw new Error(content.passwordDialog.incorrectPassword)
      }

      // 更新密码
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        throw new Error(content.passwordDialog.updateFailed)
      }

      setPasswordSuccess(content.passwordDialog.updateSuccess)
      setTimeout(() => {
        setShowChangePasswordDialog(false)
        resetPasswordForm()
      }, 2000)

    } catch (error: any) {
      setPasswordError(error.message)
    } finally {
      setIsChangingPassword(false)
    }
  }

  // 重置密码表单
  const resetPasswordForm = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmNewPassword('')
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    setPasswordError('')
    setPasswordSuccess('')
  }

  return (
    <SmartLayout forceLayout={isEnglish ? 'english' : undefined}>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* 页面头部 */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <HelpCircle className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {content.title}
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {content.subtitle}
            </p>
          </div>

          {/* 帮助内容区块 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {helpSections.map((section) => (
              <Card 
                key={section.id} 
                className={`${section.bgColor} ${section.borderColor} border-2 hover:shadow-lg transition-all duration-300`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <section.icon className={`w-6 h-6 ${section.color}`} />
                    <CardTitle className="text-xl font-bold text-foreground">
                      {section.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.items.map((item, index) => (
                    <div key={index} className="p-4 bg-background/50 rounded-lg border border-border/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                        {item.action && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={item.onClick}
                            className="ml-3 flex-shrink-0"
                          >
                            {item.action}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 常见问题 */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-primary" />
                <CardTitle className="text-2xl font-bold text-foreground">
                  {content.faq}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {content.faqs.map((faq, index) => (
                  <div key={index} className="p-6 bg-background/60 rounded-lg border border-border/50 hover:bg-background/80 transition-colors">
                    <h3 className="font-semibold text-foreground mb-3 flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      {faq.question}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 需要更多帮助 */}
          <div className="mt-12 text-center">
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Info className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-bold text-foreground">
                    {isEnglish ? 'Need More Help?' : '需要更多帮助？'}
                  </h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  {isEnglish 
                    ? 'Contact our customer service team for personalized assistance'
                    : '联系我们的客服团队，获得个性化帮助'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="default" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    {isEnglish ? 'Contact Support' : '联系客服'}
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {isEnglish ? 'User Guide' : '用户指南'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 修改密码弹窗 */}
      <Dialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              {content.passwordDialog.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {passwordError && (
              <Alert className="border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700 dark:text-red-400">
                  {passwordError}
                </AlertDescription>
              </Alert>
            )}
            
            {passwordSuccess && (
              <Alert className="border-green-200 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700 dark:text-green-400">
                  {passwordSuccess}
                </AlertDescription>
              </Alert>
            )}

            {/* 当前密码 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{content.passwordDialog.currentPassword}</label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* 新密码 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{content.passwordDialog.newPassword}</label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* 确认新密码 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{content.passwordDialog.confirmPassword}</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* 按钮 */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowChangePasswordDialog(false)
                  resetPasswordForm()
                }}
                disabled={isChangingPassword}
              >
                {content.passwordDialog.cancel}
              </Button>
              <Button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? content.passwordDialog.changing : content.passwordDialog.confirm}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SmartLayout>
  )
} 