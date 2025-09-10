"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Cookie, Shield, Settings, BarChart3, Target, Eye, Globe, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CookiesPage() {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true)
  const [marketingEnabled, setMarketingEnabled] = useState(false)
  const [functionalEnabled, setFunctionalEnabled] = useState(true)

  const handleSavePreferences = () => {
    // 保存用户偏好到localStorage或发送到服务器
    localStorage.setItem('cookiePreferences', JSON.stringify({
      analytics: analyticsEnabled,
      marketing: marketingEnabled,
      functional: functionalEnabled,
      timestamp: new Date().toISOString()
    }))
    
    alert('Cookie偏好设置已保存')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="border-amber-400/50 text-amber-400 hover:bg-amber-400/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <Cookie className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-amber-400">Cookie政策</h1>
              <p className="text-gray-300">管理您的隐私偏好设置</p>
            </div>
          </div>
        </div>

        {/* Cookie Settings */}
        <div className="space-y-6">
          {/* Essential Cookies */}
          <Card className="bg-black/20 border-amber-400/30 backdrop-blur-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-green-400" />
                <div>
                  <CardTitle className="text-amber-400">必要Cookie</CardTitle>
                  <CardDescription className="text-gray-300">
                    确保网站正常运行所必需的Cookie，无法禁用
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-2">始终激活</h4>
                  <p className="text-sm text-gray-400">
                    这些Cookie对于网站的核心功能至关重要，包括用户身份验证、安全性和基本网站操作。
                  </p>
                </div>
                <Switch checked={true} disabled className="opacity-50" />
              </div>
            </CardContent>
          </Card>

          {/* Functional Cookies */}
          <Card className="bg-black/20 border-amber-400/30 backdrop-blur-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-blue-400" />
                <div>
                  <CardTitle className="text-amber-400">功能性Cookie</CardTitle>
                  <CardDescription className="text-gray-300">
                    用于增强网站功能和个性化体验
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-2">功能增强</h4>
                  <p className="text-sm text-gray-400 mb-3">
                    记住您的偏好设置，如语言选择、主题设置和其他个性化配置。
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• 语言和区域设置</li>
                    <li>• 深色/浅色主题偏好</li>
                    <li>• 用户界面个性化设置</li>
                  </ul>
                </div>
                <Switch 
                  checked={functionalEnabled} 
                  onCheckedChange={setFunctionalEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Analytics Cookies */}
          <Card className="bg-black/20 border-amber-400/30 backdrop-blur-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-purple-400" />
                <div>
                  <CardTitle className="text-amber-400">分析Cookie</CardTitle>
                  <CardDescription className="text-gray-300">
                    帮助我们了解网站使用情况并改进用户体验
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-2">使用分析</h4>
                  <p className="text-sm text-gray-400 mb-3">
                    收集匿名化的使用数据，帮助我们优化网站性能和用户体验。
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• 页面访问统计</li>
                    <li>• 用户行为分析（匿名）</li>
                    <li>• 网站性能监控</li>
                    <li>• 错误报告和调试</li>
                  </ul>
                </div>
                <Switch 
                  checked={analyticsEnabled} 
                  onCheckedChange={setAnalyticsEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Marketing Cookies */}
          <Card className="bg-black/20 border-amber-400/30 backdrop-blur-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-orange-400" />
                <div>
                  <CardTitle className="text-amber-400">营销Cookie</CardTitle>
                  <CardDescription className="text-gray-300">
                    用于投放个性化广告和营销内容
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-2">个性化营销</h4>
                  <p className="text-sm text-gray-400 mb-3">
                    根据您的兴趣和行为提供相关的广告和推荐内容。
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• 个性化广告投放</li>
                    <li>• 跨平台用户追踪</li>
                    <li>• 营销活动效果分析</li>
                    <li>• 第三方广告网络</li>
                  </ul>
                </div>
                <Switch 
                  checked={marketingEnabled} 
                  onCheckedChange={setMarketingEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cookie详细信息 */}
        <Card className="bg-black/20 border-amber-400/30 backdrop-blur-md mt-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Eye className="w-6 h-6 text-cyan-400" />
              <CardTitle className="text-amber-400">Cookie详细信息</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-white mb-2">什么是Cookie？</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Cookie是网站存储在您浏览器中的小型文本文件。它们帮助网站记住您的偏好设置、登录状态和其他信息，从而提供更好的用户体验。
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-2">我们如何使用Cookie？</h4>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• <strong className="text-white">身份验证：</strong>保持您的登录状态和安全性</li>
                <li>• <strong className="text-white">偏好设置：</strong>记住您的语言、主题等个人设置</li>
                <li>• <strong className="text-white">分析统计：</strong>了解网站使用情况以改进服务</li>
                <li>• <strong className="text-white">安全防护：</strong>防止恶意攻击和提高网站安全性</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2">第三方Cookie</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                我们可能使用Google Analytics、广告网络等第三方服务的Cookie来提供更好的服务。这些服务有各自的隐私政策，我们建议您查阅相关政策。
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2">管理Cookie</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                您可以通过浏览器设置管理或删除Cookie。但请注意，禁用某些Cookie可能会影响网站的正常功能。您也可以使用上方的设置来管理我们网站的Cookie偏好。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 保存按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button 
            onClick={handleSavePreferences}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold flex-1"
          >
            <Settings className="w-4 h-4 mr-2" />
            保存偏好设置
          </Button>
          <Button 
            variant="outline" 
            className="border-amber-400/50 text-amber-400 hover:bg-amber-400/10 flex-1"
            onClick={() => {
              setAnalyticsEnabled(false)
              setMarketingEnabled(false)
              setFunctionalEnabled(false)
            }}
          >
            拒绝所有可选Cookie
          </Button>
          <Button 
            variant="outline" 
            className="border-green-400/50 text-green-400 hover:bg-green-400/10 flex-1"
            onClick={() => {
              setAnalyticsEnabled(true)
              setMarketingEnabled(true)
              setFunctionalEnabled(true)
            }}
          >
            接受所有Cookie
          </Button>
        </div>

        {/* 联系信息 */}
        <Card className="bg-black/20 border-amber-400/30 backdrop-blur-md mt-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-amber-400" />
              <h4 className="font-semibold text-amber-400">联系我们</h4>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              如果您对我们的Cookie政策有任何疑问，请通过以下方式联系我们：
            </p>
            <div className="mt-3 text-sm text-gray-300">
              <p>邮箱：privacy@astrozi.com</p>
              <p>更新日期：2024年12月</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}