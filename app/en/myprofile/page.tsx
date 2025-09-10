"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  Calendar, 
  Clock,
  MapPin,
  Edit,
  AlertTriangle,
  CheckCircle,
  Info,
  Wallet
} from 'lucide-react'
import { fetchUserProfile } from '@/lib/web3-api-client'
import EnglishLayout from '@/components/EnglishLayout'

interface UserProfile {
  birth_date?: string
  birth_time?: string
  birth_location?: string
  gender?: 'male' | 'female'
  profile_edit_count?: number
  gender_edit_count?: number
  profile_complete?: boolean
  nickname?: string
}

interface UserInfo {
  auth_type?: string
  wallet_address?: string
}

export default function EnglishMyProfilePage() {
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile>({})
  const [userInfo, setUserInfo] = useState<UserInfo>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Check if user is logged in
        const currentUser = localStorage.getItem('current_user')
        const web3Auth = localStorage.getItem('web3_auth')
        
        if (!currentUser && !web3Auth) {
          // Check Supabase authentication
          const supabaseAuth = localStorage.getItem('sb-localhost-auth-token') || 
                              localStorage.getItem('sb-astrozi-auth-token')
          if (!supabaseAuth) {
            setError('Please login first')
            setLoading(false)
            return
          }
        }

        const response = await fetchUserProfile()
        
        if (response.success) {
          setProfile(response.profile || {})
          setUserInfo(response.user_info || {})
        } else {
          setError(response.error || 'Failed to load profile')
        }
      } catch (err: any) {
        console.error('Failed to load profile:', err)
        setError(err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleEditProfile = () => {
    // Navigate to appropriate edit page based on user type
    if (userInfo.auth_type === 'web3') {
      // Web3 users go to standard edit page
      router.push('/en/profile')
    } else {
      // Web2 users go to standard edit page
      router.push('/en/profile')
    }
  }

  if (loading) {
    return (
      <EnglishLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
        </div>
      </EnglishLayout>
    )
  }

  if (error) {
    return (
      <EnglishLayout>
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
          
          <div className="mt-4 text-center">
            <Button onClick={() => window.location.href = '/en/auth'}>
              Go to Login
            </Button>
          </div>
        </div>
      </EnglishLayout>
    )
  }

  return (
    <EnglishLayout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Profile
          </h1>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span>Manage your personal information</span>
            {userInfo.auth_type === 'web3' && (
              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                <Wallet className="w-3 h-3 mr-1" />
                Web3 User
              </Badge>
            )}
          </div>
        </div>

        {/* Profile Status Card */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-purple-600" />
              Profile Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Completion Status */}
              <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                <div className="flex items-center gap-3">
                  {profile.profile_complete ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-amber-500" />
                  )}
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {profile.profile_complete ? 'Profile Complete' : 'Profile Incomplete'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {profile.profile_complete ? 'All information filled' : 'Please complete birth info and gender'}
                    </div>
                  </div>
                </div>
                <Badge 
                  variant={profile.profile_complete ? "default" : "secondary"}
                  className={profile.profile_complete ? "bg-green-100 text-green-800 border-green-200" : ""}
                >
                  {profile.profile_complete ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              {/* Web3 User Additional Info */}
              {userInfo.auth_type === 'web3' && userInfo.wallet_address && (
                <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Wallet Address
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {userInfo.wallet_address.slice(0, 6)}...{userInfo.wallet_address.slice(-4)}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                    Web3 Auth
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Basic Information Display */}
        <div className="space-y-4 mb-6">
          {/* Nickname */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Nickname</div>
                    <div className="font-medium">
                      {profile.nickname || 'Not set'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gender */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Gender</div>
                    <div className="font-medium">
                      {profile.gender === 'male' ? 'Male' : profile.gender === 'female' ? 'Female' : 'Not set'}
                    </div>
                  </div>
                </div>
                {profile.gender && (profile.gender_edit_count || 0) < 1 && (
                  <Badge variant="secondary" className="text-xs">
                    1 free edit available
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Birth Date */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Birth Date</div>
                    <div className="font-medium">
                      {profile.birth_date || 'Not set'}
                    </div>
                  </div>
                </div>
                {profile.birth_date && (profile.profile_edit_count || 0) < 1 && (
                  <Badge variant="secondary" className="text-xs">
                    1 free edit available
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Birth Time */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Birth Time</div>
                  <div className="font-medium">
                    {profile.birth_time || 'Not set'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Birth Location */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Birth Location</div>
                  <div className="font-medium">
                    {profile.birth_location || 'Not set'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Count Information */}
        <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            <strong>Edit Restrictions:</strong> 
            Birth date edits: {profile.profile_edit_count || 0}/1 | 
            Gender edits: {profile.gender_edit_count || 0}/1 | 
            Time and location can be edited unlimited times
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            onClick={handleEditProfile}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile Information
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="w-full"
          >
            Back
          </Button>
        </div>
      </div>
    </EnglishLayout>
  )
}