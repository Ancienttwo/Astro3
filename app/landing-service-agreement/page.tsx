"use client"

import { useState } from "react"
import MainLayout from "@/components/MainLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function LandingServiceAgreementPage() {
  const [language, setLanguage] = useState<"zh" | "en">("zh")

  const content = {
    zh: {
      nav: { home: "主页", features: "功能", products: "产品", pricing: "价格", about: "关于", docs: "白皮书", login: "登录" },
      title: "服务协议",
      subtitle: "使用AstroZi服务前，请仔细阅读以下条款",
      backToHome: "返回首页"
    },
    en: {
      nav: { home: "Home", features: "Features", products: "Products", pricing: "Pricing", about: "About", docs: "Docs", login: "Login" },
      title: "Terms of Service",
      subtitle: "Please read the following terms carefully before using AstroZi services",
      backToHome: "Back to Home"
    }
  }

  const t = content[language]

  const serviceContent = {
    zh: (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-yellow-400 mb-6">AstroZi 服务协议</h1>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">1. 引言</h2>
          <p className="text-gray-700 dark:text-gray-300">本服务协议（以下简称"协议"）由 Cloudmatrix Company Ltd.（以下简称"我们"、"我司"或"公司"）制定。AstroZi 是一个基于人工智能的命理学习平台，提供基于传统文化元素的内容生成服务，其内容仅作娱乐或传统文化学习用途。访问或使用我们的网站和服务，即表示您同意受以下条款的约束。如果您不同意这些条款的任何部分，请勿访问网站或使用我们的服务。</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">2. 服务说明及娱乐性质声明</h2>
          <p className="text-gray-700 dark:text-gray-300">AstroZi 作为一个命理学习平台，提供八字紫微排盘、AI分析报告及智能对话等功能。我们的服务专注于中国传统命理文化的传播与学习，通过现代科技手段对传统文化进行诠释和呈现。</p>
          <p className="text-gray-700 dark:text-gray-300">本服务的所有分析结果和内容均不具有任何科学依据，仅供娱乐和文化学习之用。我们郑重声明：</p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 dark:text-gray-300">
            <li>本服务所有内容仅供娱乐目的使用</li>
            <li>严禁将分析结果用作任何医疗、健康、投资、婚姻、职业或其他重要决定的依据</li>
            <li>我们不提供任何形式的预测、预言或命运指导</li>
            <li>本服务内容仅为传统文化知识的现代诠释，旨在文化教育和娱乐</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">3. 用户责任</h2>
          <p className="text-gray-700 dark:text-gray-300">使用本服务的用户必须年满18周岁。未满18周岁的用户必须在父母或法定监护人的同意和监督下使用本服务。用户应当对其账户和密码的安全性负责，并确保提供真实、准确的个人信息。</p>
          <p className="text-gray-700 dark:text-gray-300">用户同意在使用本服务时：</p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 dark:text-gray-300">
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
          <p className="text-gray-700 dark:text-gray-300">通过我们服务生成的内容仅供您个人使用。您保留您提供的原始信息的权利。网站及其原创内容、功能和设计受国际知识产权法保护。AstroZi 品牌和相关标识属于 Cloudmatrix Company Ltd.。</p>
          <p className="text-gray-700 dark:text-gray-300">未经我们明确许可，您不得：</p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 dark:text-gray-300">
            <li>复制或分发我们的服务内容</li>
            <li>修改或创建衍生作品</li>
            <li>将我们的服务用于商业目的</li>
            <li>使用我们的商标或品牌标识</li>
            <li>使用生成的内容进行虚假广告或误导他人</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">5. 免责声明</h2>
          <p className="text-gray-700 dark:text-gray-300">本服务按"现状"和"可用"的基础提供，我们不对服务的准确性、完整性或实用性作出任何保证。分析结果仅供娱乐参考，不构成任何形式的专业建议。</p>
          <p className="text-gray-700 dark:text-gray-300">我们明确声明本服务：</p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 dark:text-gray-300">
            <li>不提供医疗诊断、健康建议或治疗方案</li>
            <li>不提供投资建议、财务规划或经济预测</li>
            <li>不提供心理咨询或治疗</li>
            <li>无法预测未来事件或改变个人命运</li>
            <li>用户对自己的决定和行为完全负责</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">6. 付费服务</h2>
          <p className="text-gray-700 dark:text-gray-300">服务价格以网站显示为准，某些高级功能可能需要付费。所有支付通过安全的第三方支付处理商处理。数字服务一经使用不予退款，特殊情况下的退款请求将逐案处理。退款申请必须在购买后7天内提交。</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">7. 账户管理</h2>
          <p className="text-gray-700 dark:text-gray-300">用户需负责保护账户信息、及时更新个人资料、报告任何未经授权的使用，并确保不与他人共享账户。我们保留因违反条款而暂停或终止账户的权利，并可能删除长期不活动的账户。</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">8. 服务变更</h2>
          <p className="text-gray-700 dark:text-gray-300">我们保留修改或终止服务任何部分的权利。重大变更将通过电子邮件或网站通知。继续使用服务表示接受更新后的条款。</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">9. 争议解决</h2>
          <p className="text-gray-700 dark:text-gray-300">本协议的解释、效力及争议解决均适用中华人民共和国香港特别行政区法律。因使用本服务所引起的或与之相关的任何争议，双方应友好协商解决。协商不成的，任何一方均可向公司所在地有管辖权的法院提起诉讼。</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">10. 联系方式</h2>
          <p className="text-gray-700 dark:text-gray-300">如果您对本服务协议有任何疑问，请通过以下方式联系我们：</p>
          <p className="ml-4 text-gray-700 dark:text-gray-300">
            Cloudmatrix Company Ltd.<br/>
            客服邮箱：cs@astrozi.ai
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">11. 条款接受与法律适用</h2>
          <p className="text-gray-700 dark:text-gray-300">使用 AstroZi 服务即表示您确认已阅读、理解并完全同意接受本协议的所有内容。您进一步确认并同意：</p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 dark:text-gray-300">
            <li>您理解本服务仅供娱乐和文化学习之用；</li>
            <li>您不会将本服务作为任何重要决定的依据；</li>
            <li>您同意遵守本协议中规定的所有义务和责任；</li>
            <li>您确认您有法律能力接受这些条款。</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300">访问或使用本服务的任何部分，包括但不限于浏览网站、注册账户、使用任何功能，均构成您对本协议的明确接受。如果您不同意本协议的任何部分，请立即停止使用本服务。</p>
          <p className="text-gray-700 dark:text-gray-300">本协议受中华人民共和国香港特别行政区法律管辖并按其解释。与本协议相关的任何争议，均应提交香港特别行政区有管辖权的法院审理。</p>
          <p className="font-semibold text-gray-700 dark:text-gray-300">最后更新日期：2025年7月2日</p>
        </div>
      </div>
    ),
    en: (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-yellow-400 mb-6">AstroZi Terms of Service</h1>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">1. Introduction</h2>
          <p>These Terms of Service (hereinafter referred to as "Terms") are established by Cloudmatrix Company Ltd. (hereinafter referred to as "we," "our," or "the Company"). AstroZi is an AI-based Chinese astrology learning platform that provides content generation services based on traditional cultural elements, intended solely for entertainment and traditional cultural learning purposes. By accessing or using our website and services, you agree to be bound by these Terms. If you do not agree to any part of these Terms, you may not access the website or use our services.</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">2. Service Description & Entertainment Nature Statement</h2>
          <p>AstroZi, as a Chinese astrology learning platform, provides BaZi and Purple Star Astrology chart generation, AI analysis reports, and intelligent dialogue features. Our services focus on the dissemination and learning of traditional Chinese astrology culture, interpreting traditional culture through modern technology.</p>
          <p>All analysis results and content provided by this service have no scientific basis and are for entertainment and cultural learning purposes only. We solemnly declare that:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>All content of this service is for entertainment purposes only</li>
            <li>It is strictly prohibited to use analysis results as a basis for any medical, health, investment, marriage, career, or other important decisions</li>
            <li>We do not provide any form of prediction, prophecy, or destiny guidance</li>
            <li>The service content is merely a modern interpretation of traditional cultural knowledge, aimed at cultural education and entertainment</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">3. User Responsibilities</h2>
          <p>Users must be at least 18 years old to use our services. Users under 18 must use this service with the consent and supervision of a parent or legal guardian. Users are responsible for the security of their account and password, and must ensure they provide true and accurate personal information.</p>
          <p>Users agree to:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Provide accurate personal information and birth information</li>
            <li>Not abuse or damage our service systems</li>
            <li>Not infringe on others' intellectual property rights or privacy</li>
            <li>Not use this service to spread superstitious content or engage in feudal superstitious activities</li>
            <li>Not use service results to mislead others or for false advertising</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">4. Intellectual Property</h2>
          <p>Content generated through our services is for your personal use only. You retain rights to the original information you provide. The website and its original content, features, and design are protected by international intellectual property laws. The AstroZi brand and related logos belong to Cloudmatrix Company Ltd.</p>
          <p>Without our express permission, you may not:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Copy or distribute our service content</li>
            <li>Modify or create derivative works</li>
            <li>Use our services for commercial purposes</li>
            <li>Use our trademarks or brand logos</li>
            <li>Use generated content for false advertising or to mislead others</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">5. Disclaimer</h2>
          <p>Our services are provided "as is" and "as available," and we make no warranties regarding the accuracy, completeness, or usefulness of the service. Analysis results are for entertainment reference only and do not constitute any form of professional advice.</p>
          <p>We explicitly state that this service:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Does not provide medical diagnosis, health advice, or treatment plans</li>
            <li>Does not provide investment advice, financial planning, or economic forecasts</li>
            <li>Does not provide psychological counseling or therapy</li>
            <li>Cannot predict future events or change personal destiny</li>
            <li>Users are fully responsible for their own decisions and actions</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">6. Paid Services</h2>
          <p>Service prices are as displayed on the website, and some premium features may require payment. All payments are processed through secure third-party payment processors. Digital services are non-refundable once used, and refund requests in special circumstances will be handled on a case-by-case basis. Refund applications must be submitted within 7 days of purchase.</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">7. Account Management</h2>
          <p>Users are responsible for protecting account information, updating personal profiles, reporting any unauthorized use, and ensuring accounts are not shared with others. We reserve the right to suspend or terminate accounts for violation of terms and may delete long-inactive accounts.</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">8. Service Changes</h2>
          <p>We reserve the right to modify or terminate any part of the service. Significant changes will be communicated via email or website notifications. Continued use of the service indicates acceptance of the updated terms.</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">9. Dispute Resolution</h2>
          <p>These Terms shall be governed by and construed in accordance with the laws of the Hong Kong Special Administrative Region of the People's Republic of China. Any disputes arising from or relating to the use of this service shall be submitted to the jurisdiction of the competent courts in Hong Kong SAR.</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">10. Contact Information</h2>
          <p>If you have any questions about these Terms, please contact us:</p>
          <p className="ml-4">
            Cloudmatrix Company Ltd.<br/>
            Customer Service Email: cs@astrozi.ai
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">11. Acceptance of Terms and Governing Law</h2>
          <p>Using AstroZi indicates that you acknowledge you have read, understood, and fully agree to these Terms of Service. You further confirm and agree that:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>You understand this service is for entertainment and cultural learning purposes only</li>
            <li>You will not use this service as a basis for any important decisions</li>
            <li>You agree to comply with all obligations and responsibilities stated in these Terms</li>
            <li>You confirm you have the legal capacity to accept these Terms</li>
          </ul>
          <p>Accessing or using any part of this service, including but not limited to browsing the website, registering an account, or using any features, constitutes your explicit acceptance of these Terms. If you do not agree to any part of these Terms, please cease using this service immediately.</p>
          <p>These Terms shall be governed by and construed in accordance with the laws of the Hong Kong Special Administrative Region of the People's Republic of China. Any disputes relating to these Terms shall be subject to the jurisdiction of the competent courts in Hong Kong SAR.</p>
          <p className="font-semibold">Last updated: July 2, 2025</p>
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

          {/* 服务协议内容 */}
          <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
            <CardContent className="p-8">
              <div className="text-gray-200 leading-relaxed">
                {serviceContent[language]}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
} 