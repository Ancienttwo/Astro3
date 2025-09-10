'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User, Wallet, Calendar, AlertTriangle, CheckCircle } from 'lucide-react'
import { detectUserType, UserType } from '@/lib/user-detection'
import Web3PointsDisplaySimple from '@/components/web3/Web3PointsDisplaySimple'
import { DailyCheckinCard } from '@/components/DailyCheckinCard'
import EnglishLayout from '@/components/EnglishLayout'

export default function EnglishProfilePageSimple() {
  const [userType, setUserType] = useState<UserType>({ isWeb3: false, isWeb2: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const detected = detectUserType()
    setUserType(detected)
    setLoading(false)
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
              Please login first to view your profile
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
            <User className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-purple-600">
              My Profile
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Manage your account information and preferences
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

        {/* User Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userType.isWeb3 ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Wallet Address</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md font-mono text-sm">
                      {userType.walletAddress}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Username</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                      {userType.username || 'Web3 User'}
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-600">Email Address</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    {userType.email || 'Loading...'}
                  </div>
                </div>
              )}
            </div>
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
                  Web3 Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  View your smart contract data and Web3 activities
                </p>
                <Web3PointsDisplaySimple 
                  walletAddress={userType.walletAddress!}
                  onPointsUpdate={() => {
                    console.log('Points updated')
                  }}
                />
              </CardContent>
            </Card>

            <Alert className="border-blue-200 bg-blue-50">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                <strong>Web3 Features:</strong> As a Web3 user, you can earn points through smart contract check-ins and participate in airdrops.
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
                  Daily Check-in
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Complete daily check-ins to earn credits and rewards
                </p>
                <DailyCheckinCard />
              </CardContent>
            </Card>

            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                <strong>Traditional Features:</strong> Complete daily check-ins to earn free credits for AI analysis and reports.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Common Actions */}
        <div className="mt-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/en/profile'}
              className="w-full"
            >
              Edit Profile Details
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/en/membership'}
              className="w-full"
            >
              View Membership
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