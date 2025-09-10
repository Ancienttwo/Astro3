"use client"

import { useState } from "react"
import MainLayout from "@/components/MainLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function LandingPrivacyPolicyPage() {
  const [language, setLanguage] = useState<"zh" | "en">("zh")

  const content = {
    zh: {
      nav: { home: "主页", features: "功能", products: "产品", pricing: "价格", about: "关于", docs: "白皮书", login: "登录" },
      title: "隐私政策",
      subtitle: "了解我们如何收集、使用和保护您的个人信息",
      backToHome: "返回首页"
    },
    en: {
      nav: { home: "Home", features: "Features", products: "Products", pricing: "Pricing", about: "About", docs: "Docs", login: "Login" },
      title: "Privacy Policy",
      subtitle: "Learn how we collect, use, and protect your personal information",
      backToHome: "Back to Home"
    }
  }

  const t = content[language]

  const privacyContent = {
    zh: (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-yellow-400 mb-6">AstroZi 隐私政策</h1>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">1. 引言</h2>
          <p className="text-gray-700 dark:text-gray-300">本隐私政策阐述了 Cloudmatrix Company Ltd.（以下简称"我们"）如何收集、使用、存储和保护您的个人信息。我们深知个人信息对您的重要性，并会尽全力保护您的个人信息安全。</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">2. 信息收集</h2>
          <p className="text-gray-700 dark:text-gray-300">我们收集的信息包括：</p>
          
          <div className="ml-4">
            <h3 className="text-lg font-medium text-yellow-300 mt-4 mb-2">2.1 您主动提供的信息</h3>
            <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 dark:text-gray-300">
              <li>账户信息：用户名、密码、电子邮件地址</li>
              <li>个人信息：姓名、出生日期、出生时间、出生地点</li>
              <li>联系方式：电子邮件地址、手机号码（如果提供）</li>
              <li>支付信息：支付时间、支付金额、支付方式</li>
            </ul>
            
            <h3 className="text-lg font-medium text-yellow-300 mt-4 mb-2">2.2 自动收集的信息</h3>
            <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 dark:text-gray-300">
              <li>设备信息：设备型号、操作系统、唯一设备标识符</li>
              <li>日志信息：IP地址、浏览器类型、访问时间、访问的页面</li>
              <li>位置信息：基于IP地址的大致位置信息</li>
              <li>使用数据：功能使用频率、使用时长、操作记录</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">3. 信息使用</h2>
          <p className="text-gray-700 dark:text-gray-300">我们使用收集的信息用于：</p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 dark:text-gray-300">
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
          <p className="text-gray-700 dark:text-gray-300">我们不会出售、出租或以其他方式与第三方共享您的个人信息，除非：</p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 dark:text-gray-300">
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
    ),
    en: (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-yellow-400 mb-6">AstroZi Privacy Policy</h1>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">1. Introduction</h2>
          <p>This Privacy Policy explains how Cloudmatrix Company Ltd. (hereinafter referred to as "we" or "us") collects, uses, stores, and protects your personal information. We understand the importance of personal information to you and will make every effort to protect the security of your personal information.</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">2. Information Collection</h2>
          <p>The information we collect includes:</p>
          
          <div className="ml-4">
            <h3 className="text-lg font-medium text-yellow-300 mt-4 mb-2">2.1 Information You Actively Provide</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Account Information: username, password, email address</li>
              <li>Personal Information: name, date of birth, time of birth, place of birth</li>
              <li>Contact Information: email address, phone number (if provided)</li>
              <li>Payment Information: payment time, payment amount, payment method</li>
            </ul>
            
            <h3 className="text-lg font-medium text-yellow-300 mt-4 mb-2">2.2 Automatically Collected Information</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Device Information: device model, operating system, unique device identifiers</li>
              <li>Log Information: IP address, browser type, access time, pages visited</li>
              <li>Location Information: approximate location based on IP address</li>
              <li>Usage Data: feature usage frequency, duration of use, operation records</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">3. Information Use</h2>
          <p>We use the collected information to:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Provide, maintain, and improve our services</li>
            <li>Generate BaZi and Purple Star Astrology charts</li>
            <li>Provide personalized service content</li>
            <li>Process your payments</li>
            <li>Send service notifications</li>
            <li>Provide customer support</li>
            <li>Prevent fraud and enhance security</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">4. Information Sharing</h2>
          <p>We do not sell, rent, or otherwise share your personal information with third parties, except:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>With your explicit consent</li>
            <li>When required by law or mandatory regulations</li>
            <li>To protect our legitimate interests</li>
            <li>With our service providers (who must sign confidentiality agreements)</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">5. Information Security</h2>
          <p>We implement multiple security measures to protect your personal information:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Use encryption technology for data transmission and storage</li>
            <li>Restrict employee access to personal information</li>
            <li>Conduct regular security assessments and audits</li>
            <li>Establish data breach response plans</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">6. Protection of Minors</h2>
          <p>We do not knowingly collect personal information from individuals under 18 years of age. If we discover we have inadvertently collected information from minors, we will delete it immediately. Minors must obtain guardian consent to use our services.</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">7. Use of Cookies</h2>
          <p>We use cookies and similar technologies to:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Remember your preferences</li>
            <li>Analyze website traffic</li>
            <li>Optimize user experience</li>
            <li>Provide personalized services</li>
          </ul>
          <p>You can control or delete cookies through your browser settings.</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">8. Your Rights</h2>
          <p>Regarding your personal information, you have the right to:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Delete your personal information</li>
            <li>Withdraw consent</li>
            <li>Export data</li>
            <li>Submit complaints or objections</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">9. Policy Updates</h2>
          <p>We may update this Privacy Policy. Updates will be announced on the website with an updated date. Significant changes will be notified via email.</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">10. Contact Us</h2>
          <p>If you have any questions or suggestions about this Privacy Policy, please contact:</p>
          <p className="ml-4">
            Cloudmatrix Company Ltd.<br/>
            Customer Service Email: cs@astrozi.ai<br/>
            Address: [Company Address]
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">11. Governing Law</h2>
          <p>This Privacy Policy is governed by the laws of the Hong Kong Special Administrative Region of the People's Republic of China. Any related disputes shall be submitted to the jurisdiction of the competent courts in Hong Kong SAR.</p>
          <p className="font-semibold">Last Updated: July 2, 2025</p>
        </div>
      </div>
    )
  }

  return (
    <MainLayout language={language} setLanguage={setLanguage} t={t}>
      <div className="min-h-screen bg-transparent">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* 返回按钮和标题 */}
          <div className="mb-8">
            <Link href="/">
              <Button variant="outline" size="sm" className="mb-4 bg-white/10 border-white/20 text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.backToHome}
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-7 h-7 text-yellow-400" />
              <h1 className="text-3xl font-bold text-yellow-400">{t.title}</h1>
            </div>
            <p className="text-gray-200">
              {t.subtitle}
            </p>
          </div>

          {/* 隐私政策内容 */}
          <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
            <CardContent className="p-8">
              <div className="text-gray-200 leading-relaxed">
                {privacyContent[language]}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
} 