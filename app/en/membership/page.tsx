'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Crown, Star, Wallet, User, Calendar, AlertTriangle, CheckCircle } from 'lucide-react'
import { detectUserType, UserType } from '@/lib/user-detection'
import Web3PointsDisplaySimple from '@/components/web3/Web3PointsDisplaySimple'
import { DailyCheckinCard } from '@/components/DailyCheckinCard'
import EnglishLayout from '@/components/EnglishLayout'
import { apiClient } from '@/lib/api-client'
import { getCurrentUnifiedUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default function EnglishMembershipPageSimple() {
  const [userType, setUserType] = useState<UserType>({ isWeb3: false, isWeb2: false })
  const [loading, setLoading] = useState(true)
  const [membershipStatus, setMembershipStatus] = useState<any>(null)
  const [userUsage, setUserUsage] = useState<any>(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [usageLoading, setUsageLoading] = useState(true)

  useEffect(() => {
    const initializeUserData = async () => {
      const detected = detectUserType()
      setUserType(detected)
      setLoading(false)
      
      // 获取当前用户信息
      const unifiedUser = await getCurrentUnifiedUser()
      if (!unifiedUser) {
        console.log('❌ 未找到用户认证信息')
        setStatusLoading(false)
        return
      }
      
      // 获取membership状态和用户使用统计
      const fetchUserData = async () => {
        try {
          console.log('🔄 正在获取用户数据...')
          
          // 检查是否有Supabase访问令牌（Web2用户）
          let accessToken = null
          if (typeof window !== 'undefined') {
            const { data: { session } } = await supabase.auth.getSession()
            accessToken = session?.access_token
          }
          
          // 只有在有认证令牌或者是Web3用户时才调用API
          if (accessToken || unifiedUser.auth_type === 'web3') {
            // 并行获取会员状态和使用统计
            const [membershipResponse, usageResponse] = await Promise.allSettled([
              apiClient.get('/api/membership/status-unified'),
              apiClient.get('/api/user-usage')
            ])
            
            // 处理会员状态响应
            if (membershipResponse.status === 'fulfilled' && membershipResponse.value.success) {
              setMembershipStatus(membershipResponse.value.data)
            } else {
              console.warn('获取会员状态失败:', membershipResponse.status === 'rejected' ? membershipResponse.reason : 'API返回失败')
              setMembershipStatus({
                tier: 'free',
                is_active: true,
                benefits: {
                  daily_ai_chat: 3,
                  monthly_ai_chat: 30,
                  daily_reports: 1,
                  monthly_reports: 5
                }
              })
            }
            
            // 处理使用统计响应
            if (usageResponse.status === 'fulfilled' && usageResponse.value.success) {
              setUserUsage(usageResponse.value.data)
            } else {
              console.warn('获取使用统计失败:', usageResponse.status === 'rejected' ? usageResponse.reason : 'API返回失败')
              setUserUsage({
                freeReportsLimit: 0,
                freeReportsUsed: 0,
                freeReportsRemaining: 0,
                paidReportsPurchased: 0,
                paidReportsUsed: 0,
                paidReportsRemaining: 0,
                chatbotLimit: 0,
                chatbotUsed: 0,
                chatbotRemaining: 0,
                canUseService: false,
                canUseChatbot: false
              })
            }
          } else {
            // 没有有效认证，使用默认值
            console.log('⚠️ 没有有效认证令牌，使用默认数据')
            setMembershipStatus({
              tier: 'free',
              is_active: false,
              benefits: {
                daily_ai_chat: 0,
                monthly_ai_chat: 0,
                daily_reports: 0,
                monthly_reports: 0
              }
            })
            setUserUsage({
              freeReportsLimit: 0,
              freeReportsUsed: 0,
              freeReportsRemaining: 0,
              paidReportsPurchased: 0,
              paidReportsUsed: 0,
              paidReportsRemaining: 0,
              chatbotLimit: 0,
              chatbotUsed: 0,
              chatbotRemaining: 0,
              canUseService: false,
              canUseChatbot: false
            })
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error)
          
          // 使用默认值，让页面正常显示
          setMembershipStatus({
            tier: 'free',
            is_active: false,
            benefits: {
              daily_ai_chat: 0,
              monthly_ai_chat: 0,
              daily_reports: 0,
              monthly_reports: 0
            }
          })
          setUserUsage({
            freeReportsLimit: 0,
            freeReportsUsed: 0,
            freeReportsRemaining: 0,
            paidReportsPurchased: 0,
            paidReportsUsed: 0,
            paidReportsRemaining: 0,
            chatbotLimit: 0,
            chatbotUsed: 0,
            chatbotRemaining: 0,
            canUseService: false,
            canUseChatbot: false
          })
        } finally {
          setStatusLoading(false)
          setUsageLoading(false)
        }
      }
      
      await fetchUserData()
    }
    
    initializeUserData()
  }, [])

  if (loading) {
    return (
      <EnglishLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
        </div>
      </EnglishLayout>
    )
  }

  if (!userType.isWeb3 && !userType.isWeb2) {
    return (
      <EnglishLayout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              Please login first to view your membership
            </AlertDescription>
          </Alert>
          
          <div className="mt-4 text-center">
            <Button onClick={() => window.location.href = '/auth'}>
              Go to Login
            </Button>
          </div>
        </div>
      </EnglishLayout>
    )
  }

  return (
    <EnglishLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-8 h-8 text-yellow-600" />
            <h1 className="text-3xl font-bold text-yellow-600">
              My Membership
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            View your membership benefits and account status
          </p>
        </div>

        {/* User Type Badge */}
        <div className="mb-6 text-center">
          {userType.isWeb3 ? (
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              <Wallet className="w-4 h-4 mr-2" />
              Web3 User
            </Badge>
          ) : (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <User className="w-4 h-4 mr-2" />
              Web2 User
            </Badge>
          )}
        </div>

        {/* Membership Status */}
        <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-600" />
                Membership Status
              </div>
              {!statusLoading && membershipStatus && (
                <Badge className={`${
                  membershipStatus.is_active 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : 'bg-gray-100 text-gray-800 border-gray-200'
                }`}>
                  {membershipStatus.tier?.toUpperCase() || 'FREE'}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(statusLoading || usageLoading) ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* AI Chat Usage */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-blue-800">AI Chat Bot</h4>
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                        {userUsage?.canUseChatbot ? 'Available' : 'Exhausted'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Used Today:</span>
                        <span className="font-medium text-blue-600">
                          {userUsage?.chatbotUsed || 0} / {userUsage?.chatbotLimit || membershipStatus?.benefits?.daily_ai_chat || 0}
                        </span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${Math.min(100, ((userUsage?.chatbotUsed || 0) / Math.max(1, userUsage?.chatbotLimit || membershipStatus?.benefits?.daily_ai_chat || 1)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {userUsage?.chatbotRemaining || 0} chats remaining
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-green-800">Free Reports</h4>
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                        {userUsage?.canUseService ? 'Available' : 'Exhausted'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Used Today:</span>
                        <span className="font-medium text-green-600">
                          {userUsage?.freeReportsUsed || 0} / {userUsage?.freeReportsLimit || membershipStatus?.benefits?.daily_reports || 0}
                        </span>
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${Math.min(100, ((userUsage?.freeReportsUsed || 0) / Math.max(1, userUsage?.freeReportsLimit || membershipStatus?.benefits?.daily_reports || 1)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {userUsage?.freeReportsRemaining || 0} reports remaining
                      </div>
                    </div>
                  </div>
                </div>

                {/* Paid Reports (if user has any) */}
                {(userUsage?.paidReportsPurchased || 0) > 0 && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-purple-800">Premium Reports</h4>
                      <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                        Purchased
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Used:</span>
                        <span className="font-medium text-purple-600">
                          {userUsage?.paidReportsUsed || 0} / {userUsage?.paidReportsPurchased || 0}
                        </span>
                      </div>
                      <div className="w-full bg-purple-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${Math.min(100, ((userUsage?.paidReportsUsed || 0) / Math.max(1, userUsage?.paidReportsPurchased || 1)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {userUsage?.paidReportsRemaining || 0} premium reports remaining
                      </div>
                    </div>
                  </div>
                )}

                {/* Membership Tier Benefits */}
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h4 className="text-sm font-medium text-amber-800 mb-3">
                    {membershipStatus?.tier?.toUpperCase() || 'FREE'} Membership Benefits
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Daily AI Chat:</span>
                      <span className="ml-2 font-medium text-amber-700">
                        {membershipStatus?.benefits?.daily_ai_chat || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Daily Reports:</span>
                      <span className="ml-2 font-medium text-amber-700">
                        {membershipStatus?.benefits?.daily_reports || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Monthly AI Chat:</span>
                      <span className="ml-2 font-medium text-amber-700">
                        {membershipStatus?.benefits?.monthly_ai_chat || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Monthly Reports:</span>
                      <span className="ml-2 font-medium text-amber-700">
                        {membershipStatus?.benefits?.monthly_reports || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Different components based on user type */}
        {userType.isWeb3 ? (
          /* Web3 User: Smart Contract Interface */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-blue-600" />
                  Web3 Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Access exclusive Web3 features and smart contract rewards
                </p>
                <Web3PointsDisplaySimple 
                  walletAddress={userType.walletAddress!}
                  onPointsUpdate={() => {
                    console.log('Points updated')
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Web3 Exclusive Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Smart contract check-ins</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Earn points and airdrop weight</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Participate in token airdrops</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Decentralized identity verification</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert className="border-blue-200 bg-blue-50">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                <strong>Web3 Membership:</strong> As a Web3 user, you enjoy blockchain-based rewards and can participate in the future token economy.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          /* Web2 User: Traditional Interface */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Daily Check-in Rewards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Complete daily check-ins to earn credits and maintain your membership benefits
                </p>
                <DailyCheckinCard />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Free Membership Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">3 daily AI conversations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">30 monthly AI conversations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">1 daily basic report</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">5 monthly basic reports</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                <strong>Free Membership:</strong> Enjoy basic features with daily check-in rewards. Upgrade to premium for unlimited access.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Upgrade Section */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="text-center">
              <Crown className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-amber-800 mb-2">
                Upgrade to Premium
              </h3>
              <p className="text-amber-700 mb-4">
                Unlock unlimited AI conversations, advanced reports, and priority support
              </p>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Common Actions */}
        <div className="mt-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/en/profile'}
              className="w-full"
            >
              View Profile
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/en/membership'}
              className="w-full"
            >
              Full Membership Details
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="w-full"
          >
            Back
          </Button>
        </div>
      </div>
    </EnglishLayout>
  )
}