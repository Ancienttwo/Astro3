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
import { AdaptiveLayout } from '@/components/layout/adaptive-layout'

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

export default function MyProfilePage() {
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile>({})
  const [userInfo, setUserInfo] = useState<UserInfo>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // 检查用户是否已登录
        const currentUser = localStorage.getItem('current_user')
        const web3Auth = localStorage.getItem('web3_auth')
        
        if (!currentUser && !web3Auth) {
          // 检查Supabase认证
          const supabaseAuth = localStorage.getItem('sb-localhost-auth-token') || 
                              localStorage.getItem('sb-astrozi-auth-token')
          if (!supabaseAuth) {
            setError('请先登录')
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
    // 根据用户类型跳转到合适的编辑页面
    if (userInfo.auth_type === 'web3') {
      // Web3用户暂时跳转到标准编辑页面
      router.push('/profile')
    } else {
      // Web2用户跳转到标准编辑页面
      router.push('/profile')
    }
  }

  if (loading) {
    return (
      <AdaptiveLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
        </div>
      </AdaptiveLayout>
    )
  }

  if (error) {
    return (
      <AdaptiveLayout>
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
          
          <div className="mt-4 text-center">
            <Button onClick={() => window.location.href = '/auth'}>
              前往登录
            </Button>
          </div>
        </div>
      </AdaptiveLayout>
    )
  }

  return (
    <AdaptiveLayout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            我的档案
          </h1>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span>管理您的个人信息</span>
            {userInfo.auth_type === 'web3' && (
              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                <Wallet className="w-3 h-3 mr-1" />
                Web3用户
              </Badge>
            )}
          </div>
        </div>

        {/* 档案状态卡片 */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-purple-600" />
              档案状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 完善状态 */}
              <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                <div className="flex items-center gap-3">
                  {profile.profile_complete ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-amber-500" />
                  )}
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {profile.profile_complete ? '档案已完善' : '档案待完善'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {profile.profile_complete ? '所有信息已填写完整' : '请完善出生信息和性别'}
                    </div>
                  </div>
                </div>
                <Badge 
                  variant={profile.profile_complete ? "default" : "secondary"}
                  className={profile.profile_complete ? "bg-green-100 text-green-800 border-green-200" : ""}
                >
                  {profile.profile_complete ? '已激活' : '未激活'}
                </Badge>
              </div>
              
              {/* Web3用户额外信息 */}
              {userInfo.auth_type === 'web3' && userInfo.wallet_address && (
                <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        钱包地址
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {userInfo.wallet_address.slice(0, 6)}...{userInfo.wallet_address.slice(-4)}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                    Web3认证
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 基本信息展示 */}
        <div className="space-y-4 mb-6">
          {/* 昵称 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">昵称</div>
                    <div className="font-medium">
                      {profile.nickname || '未设置'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 性别 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">性别</div>
                    <div className="font-medium">
                      {profile.gender === 'male' ? '男性' : profile.gender === 'female' ? '女性' : '未设置'}
                    </div>
                  </div>
                </div>
                {profile.gender && (profile.gender_edit_count || 0) < 1 && (
                  <Badge variant="secondary" className="text-xs">
                    可免费修改一次
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 出生日期 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">出生日期</div>
                    <div className="font-medium">
                      {profile.birth_date || '未设置'}
                    </div>
                  </div>
                </div>
                {profile.birth_date && (profile.profile_edit_count || 0) < 1 && (
                  <Badge variant="secondary" className="text-xs">
                    可免费修改一次
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 出生时辰 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">出生时辰</div>
                  <div className="font-medium">
                    {profile.birth_time || '未设置'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 出生地点 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">出生地点</div>
                  <div className="font-medium">
                    {profile.birth_location || '未设置'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 编辑次数信息 */}
        <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            <strong>编辑限制：</strong> 
            出生日期修改次数: {profile.profile_edit_count || 0}/1 | 
            性别修改次数: {profile.gender_edit_count || 0}/1 | 
            时辰和地点可无限次修改
          </AlertDescription>
        </Alert>

        {/* 操作按钮 */}
        <div className="space-y-4">
          <Button 
            onClick={handleEditProfile}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Edit className="w-4 h-4 mr-2" />
            编辑档案信息
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="w-full"
          >
            返回
          </Button>
        </div>
      </div>
    </AdaptiveLayout>
  )
}