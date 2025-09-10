"use client"

import EnglishLayout from "@/components/EnglishLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function EnglishLandingPrivacyPolicyPage() {
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
              <h1 className="text-3xl font-bold text-yellow-400">Privacy Policy</h1>
            </div>
            <p className="text-gray-200">
              Learn how we collect, use, and protect your personal information
            </p>
          </div>

          {/* Privacy policy content */}
          <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
            <CardContent className="p-8">
              <div className="text-gray-200 leading-relaxed">
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-yellow-400 mb-6">AstroZi Privacy Policy</h1>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-yellow-400">1. Introduction</h2>
                    <p className="text-gray-700 dark:text-gray-300">This Privacy Policy explains how Cloudmatrix Company Ltd. (hereinafter referred to as "we" or "us") collects, uses, stores, and protects your personal information. We understand the importance of personal information to you and will make every effort to protect the security of your personal information.</p>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-yellow-400">2. Information Collection</h2>
                    <p className="text-gray-700 dark:text-gray-300">The information we collect includes:</p>
                    
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-yellow-300 mt-4 mb-2">2.1 Information You Actively Provide</h3>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 dark:text-gray-300">
                        <li>Account Information: username, password, email address</li>
                        <li>Personal Information: name, date of birth, time of birth, place of birth</li>
                        <li>Contact Information: email address, phone number (if provided)</li>
                        <li>Payment Information: payment time, payment amount, payment method</li>
                      </ul>
                      
                      <h3 className="text-lg font-medium text-yellow-300 mt-4 mb-2">2.2 Automatically Collected Information</h3>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 dark:text-gray-300">
                        <li>Device Information: device model, operating system, unique device identifiers</li>
                        <li>Log Information: IP address, browser type, access time, pages visited</li>
                        <li>Location Information: approximate location based on IP address</li>
                        <li>Usage Data: feature usage frequency, duration of use, operation records</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-yellow-400">3. Information Use</h2>
                    <p className="text-gray-700 dark:text-gray-300">We use the collected information to:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 dark:text-gray-300">
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
                    <p className="text-gray-700 dark:text-gray-300">We do not sell, rent, or otherwise share your personal information with third parties, except:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 dark:text-gray-300">
                      <li>With your explicit consent</li>
                      <li>When required by law or mandatory regulations</li>
                      <li>To protect our legitimate interests</li>
                      <li>With our service providers (who must sign confidentiality agreements)</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-yellow-400">5. Information Security</h2>
                    <p className="text-gray-700 dark:text-gray-300">We implement multiple security measures to protect your personal information:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 dark:text-gray-300">
                      <li>Use encryption technology for data transmission and storage</li>
                      <li>Restrict employee access to personal information</li>
                      <li>Conduct regular security assessments and audits</li>
                      <li>Establish data breach response plans</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-yellow-400">6. Protection of Minors</h2>
                    <p className="text-gray-700 dark:text-gray-300">We do not knowingly collect personal information from individuals under 18 years of age. If we discover we have inadvertently collected information from minors, we will delete it immediately. Minors must obtain guardian consent to use our services.</p>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-yellow-400">7. Use of Cookies</h2>
                    <p className="text-gray-700 dark:text-gray-300">We use cookies and similar technologies to:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 dark:text-gray-300">
                      <li>Remember your preferences</li>
                      <li>Analyze website traffic</li>
                      <li>Optimize user experience</li>
                      <li>Provide personalized services</li>
                    </ul>
                    <p className="text-gray-700 dark:text-gray-300">You can control or delete cookies through your browser settings.</p>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-yellow-400">8. Your Rights</h2>
                    <p className="text-gray-700 dark:text-gray-300">Regarding your personal information, you have the right to:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 dark:text-gray-300">
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
                    <p className="text-gray-700 dark:text-gray-300">We may update this Privacy Policy. Updates will be announced on the website with an updated date. Significant changes will be notified via email.</p>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-yellow-400">10. Contact Us</h2>
                    <p className="text-gray-700 dark:text-gray-300">If you have any questions or suggestions about this Privacy Policy, please contact:</p>
                    <p className="ml-4 text-gray-700 dark:text-gray-300">
                      Cloudmatrix Company Ltd.<br/>
                      Customer Service Email: cs@astrozi.ai<br/>
                      Address: [Company Address]
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-yellow-400">11. Governing Law</h2>
                    <p className="text-gray-700 dark:text-gray-300">This Privacy Policy is governed by the laws of the Hong Kong Special Administrative Region of the People's Republic of China. Any related disputes shall be submitted to the jurisdiction of the competent courts in Hong Kong SAR.</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">Last Updated: July 2, 2025</p>
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