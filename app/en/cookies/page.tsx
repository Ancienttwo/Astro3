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
    // Save user preferences to localStorage or send to server
    localStorage.setItem('cookiePreferences', JSON.stringify({
      analytics: analyticsEnabled,
      marketing: marketingEnabled,
      functional: functionalEnabled,
      timestamp: new Date().toISOString()
    }))
    
    alert('Cookie preferences saved successfully')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/en">
            <Button variant="outline" size="sm" className="border-amber-400/50 text-amber-400 hover:bg-amber-400/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <Cookie className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-amber-400">Cookie Policy</h1>
              <p className="text-gray-300">Manage your privacy preferences</p>
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
                  <CardTitle className="text-amber-400">Essential Cookies</CardTitle>
                  <CardDescription className="text-gray-300">
                    Required cookies that ensure the website functions properly, cannot be disabled
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-2">Always Active</h4>
                  <p className="text-sm text-gray-400">
                    These cookies are essential for the core functionality of the website, including user authentication, security, and basic website operations.
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
                  <CardTitle className="text-amber-400">Functional Cookies</CardTitle>
                  <CardDescription className="text-gray-300">
                    Used to enhance website functionality and personalize your experience
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-2">Enhanced Functionality</h4>
                  <p className="text-sm text-gray-400 mb-3">
                    Remember your preferences such as language selection, theme settings, and other personalization configurations.
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Language and region settings</li>
                    <li>• Dark/light theme preferences</li>
                    <li>• User interface personalization</li>
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
                  <CardTitle className="text-amber-400">Analytics Cookies</CardTitle>
                  <CardDescription className="text-gray-300">
                    Help us understand website usage and improve user experience
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-2">Usage Analytics</h4>
                  <p className="text-sm text-gray-400 mb-3">
                    Collect anonymized usage data to help us optimize website performance and user experience.
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Page visit statistics</li>
                    <li>• User behavior analysis (anonymous)</li>
                    <li>• Website performance monitoring</li>
                    <li>• Error reporting and debugging</li>
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
                  <CardTitle className="text-amber-400">Marketing Cookies</CardTitle>
                  <CardDescription className="text-gray-300">
                    Used to deliver personalized advertising and marketing content
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-2">Personalized Marketing</h4>
                  <p className="text-sm text-gray-400 mb-3">
                    Provide relevant advertising and recommended content based on your interests and behavior.
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Personalized ad delivery</li>
                    <li>• Cross-platform user tracking</li>
                    <li>• Marketing campaign effectiveness analysis</li>
                    <li>• Third-party advertising networks</li>
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

        {/* Cookie Details */}
        <Card className="bg-black/20 border-amber-400/30 backdrop-blur-md mt-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Eye className="w-6 h-6 text-cyan-400" />
              <CardTitle className="text-amber-400">Cookie Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-white mb-2">What are Cookies?</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Cookies are small text files that websites store in your browser. They help websites remember your preferences, login status, and other information to provide a better user experience.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-2">How do we use Cookies?</h4>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• <strong className="text-white">Authentication:</strong> Maintain your login status and security</li>
                <li>• <strong className="text-white">Preferences:</strong> Remember your language, theme, and other personal settings</li>
                <li>• <strong className="text-white">Analytics:</strong> Understand website usage to improve our services</li>
                <li>• <strong className="text-white">Security:</strong> Prevent malicious attacks and enhance website security</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2">Third-party Cookies</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                We may use cookies from third-party services like Google Analytics and advertising networks to provide better services. These services have their own privacy policies, and we recommend reviewing their respective policies.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2">Managing Cookies</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                You can manage or delete cookies through your browser settings. However, please note that disabling certain cookies may affect the normal functionality of the website. You can also use the settings above to manage cookie preferences for our website.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button 
            onClick={handleSavePreferences}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold flex-1"
          >
            <Settings className="w-4 h-4 mr-2" />
            Save Preferences
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
            Reject All Optional
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
            Accept All Cookies
          </Button>
        </div>

        {/* Contact Information */}
        <Card className="bg-black/20 border-amber-400/30 backdrop-blur-md mt-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-amber-400" />
              <h4 className="font-semibold text-amber-400">Contact Us</h4>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              If you have any questions about our Cookie Policy, please contact us through the following:
            </p>
            <div className="mt-3 text-sm text-gray-300">
              <p>Email: privacy@astrozi.com</p>
              <p>Last Updated: December 2024</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}