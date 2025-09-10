"use client"

import EnglishLayout from "@/components/EnglishLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function EnglishLandingServiceAgreementPage() {
  return (
    <EnglishLayout>
      <div className="min-h-screen bg-transparent">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Back button and title */}
          <div className="mb-8">
            <Link href="/en">
              <Button variant="outline" size="sm" className="mb-4 bg-white/10 border-white/20 text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-7 h-7 text-yellow-400" />
              <h1 className="text-3xl font-bold text-yellow-400">Terms of Service</h1>
            </div>
            <p className="text-gray-200">
              Please read the following terms carefully before using AstroZi services
            </p>
          </div>

          {/* Terms of service content */}
          <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
            <CardContent className="p-8">
              <div className="text-gray-200 leading-relaxed">
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-yellow-400 mb-6">AstroZi Terms of Service</h1>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-yellow-400">1. Introduction</h2>
                    <p className="text-gray-700 dark:text-gray-300">These Terms of Service (hereinafter referred to as "Terms") are established by Cloudmatrix Company Ltd. (hereinafter referred to as "we," "our," or "the Company"). AstroZi is an AI-based Chinese astrology learning platform that provides content generation services based on traditional cultural elements, intended solely for entertainment and traditional cultural learning purposes. By accessing or using our website and services, you agree to be bound by these Terms. If you do not agree to any part of these Terms, you may not access the website or use our services.</p>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-yellow-400">2. Service Description & Entertainment Nature Statement</h2>
                    <p className="text-gray-700 dark:text-gray-300">AstroZi, as a Chinese astrology learning platform, provides BaZi and Purple Star Astrology chart generation, AI analysis reports, and intelligent dialogue features. Our services focus on the dissemination and learning of traditional Chinese astrology culture, interpreting traditional culture through modern technology.</p>
                    <p className="text-gray-700 dark:text-gray-300">All analysis results and content provided by this service have no scientific basis and are for entertainment and cultural learning purposes only. We solemnly declare that:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 dark:text-gray-300">
                      <li>All content of this service is for entertainment purposes only</li>
                      <li>It is strictly prohibited to use analysis results as a basis for any medical, health, investment, marriage, career, or other important decisions</li>
                      <li>We do not provide any form of prediction, prophecy, or destiny guidance</li>
                      <li>The service content is merely a modern interpretation of traditional cultural knowledge, aimed at cultural education and entertainment</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-yellow-400">3. User Responsibilities</h2>
                    <p className="text-gray-700 dark:text-gray-300">Users must be at least 18 years old to use our services. Users under 18 must use this service with the consent and supervision of a parent or legal guardian. Users are responsible for the security of their account and password, and must ensure they provide true and accurate personal information.</p>
                    <p className="text-gray-700 dark:text-gray-300">Users agree to:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 dark:text-gray-300">
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
                    <p className="text-gray-700 dark:text-gray-300">Content generated through our services is for your personal use only. You retain rights to the original information you provide. The website and its original content, features, and design are protected by international intellectual property laws. The AstroZi brand and related logos belong to Cloudmatrix Company Ltd.</p>
                    <p className="text-gray-700 dark:text-gray-300">Without our express permission, you may not:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 dark:text-gray-300">
                      <li>Copy or distribute our service content</li>
                      <li>Modify or create derivative works</li>
                      <li>Use our services for commercial purposes</li>
                      <li>Use our trademarks or brand logos</li>
                      <li>Use generated content for false advertising or to mislead others</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-yellow-400">5. Disclaimer</h2>
                    <p className="text-gray-700 dark:text-gray-300">Our services are provided "as is" and "as available," and we make no warranties regarding the accuracy, completeness, or usefulness of the service. Analysis results are for entertainment reference only and do not constitute any form of professional advice.</p>
                    <p className="text-gray-700 dark:text-gray-300">We explicitly state that this service:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 dark:text-gray-300">
                      <li>Does not provide medical diagnosis, health advice, or treatment plans</li>
                      <li>Does not provide investment advice, financial planning, or economic forecasts</li>
                      <li>Does not provide psychological counseling or therapy</li>
                      <li>Cannot predict future events or change personal destiny</li>
                      <li>Users are fully responsible for their own decisions and actions</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-yellow-400">6. Paid Services</h2>
                    <p className="text-gray-700 dark:text-gray-300">Service prices are as displayed on the website, and some premium features may require payment. All payments are processed through secure third-party payment processors. Digital services are non-refundable once used, and refund requests in special circumstances will be handled on a case-by-case basis. Refund applications must be submitted within 7 days of purchase.</p>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-yellow-400">7. Account Management</h2>
                    <p className="text-gray-700 dark:text-gray-300">Users are responsible for protecting account information, updating personal profiles, reporting any unauthorized use, and ensuring accounts are not shared with others. We reserve the right to suspend or terminate accounts for violation of terms and may delete long-inactive accounts.</p>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-yellow-400">8. Service Changes</h2>
                    <p className="text-gray-700 dark:text-gray-300">We reserve the right to modify or terminate any part of the service. Significant changes will be communicated via email or website notifications. Continued use of the service indicates acceptance of the updated terms.</p>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-yellow-400">9. Dispute Resolution</h2>
                    <p className="text-gray-700 dark:text-gray-300">These Terms shall be governed by and construed in accordance with the laws of the Hong Kong Special Administrative Region of the People's Republic of China. Any disputes arising from or relating to the use of this service shall be submitted to the jurisdiction of the competent courts in Hong Kong SAR.</p>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-yellow-400">10. Contact Information</h2>
                    <p className="text-gray-700 dark:text-gray-300">If you have any questions about these Terms, please contact us:</p>
                    <p className="ml-4 text-gray-700 dark:text-gray-300">
                      Cloudmatrix Company Ltd.<br/>
                      Customer Service Email: cs@astrozi.ai
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-yellow-400">11. Acceptance of Terms and Governing Law</h2>
                    <p className="text-gray-700 dark:text-gray-300">Using AstroZi indicates that you acknowledge you have read, understood, and fully agree to these Terms of Service. You further confirm and agree that:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 dark:text-gray-300">
                      <li>You understand this service is for entertainment and cultural learning purposes only</li>
                      <li>You will not use this service as a basis for any important decisions</li>
                      <li>You agree to comply with all obligations and responsibilities stated in these Terms</li>
                      <li>You confirm you have the legal capacity to accept these Terms</li>
                    </ul>
                    <p className="text-gray-700 dark:text-gray-300">Accessing or using any part of this service, including but not limited to browsing the website, registering an account, or using any features, constitutes your explicit acceptance of these Terms. If you do not agree to any part of these Terms, please cease using this service immediately.</p>
                    <p className="text-gray-700 dark:text-gray-300">These Terms shall be governed by and construed in accordance with the laws of the Hong Kong Special Administrative Region of the People's Republic of China. Any disputes relating to these Terms shall be subject to the jurisdiction of the competent courts in Hong Kong SAR.</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">Last updated: July 2, 2025</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </EnglishLayout>
  )
}