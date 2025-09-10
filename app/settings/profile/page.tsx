'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, User, Mail, Edit3, Save, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import AuthGuard from '@/components/AuthGuard'
import { AdaptiveLayout } from '@/components/layout/adaptive-layout'
import { apiClient } from '@/lib/api-client'

interface UserProfile {
  id: string
  email: string
  nickname?: string
  birth_date?: string
  birth_time?: string
  birth_location?: string
  phone?: string
  bio?: string
  profile_complete?: boolean
}

export default function SettingsProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({})

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      // WalletConnect认证由apiClient自动处理
      const response = await apiClient.get('/api/user/profile')

      if (response.success) {
        const profile = response.data?.profile || {};
        const profileData = {
          id: profile.id || 'unknown',
          email: profile.email || '',
          nickname: profile.nickname,
          birth_date: profile.birth_date,
          birth_time: profile.birth_time,
          birth_location: profile.birth_location,
          phone: profile.phone,
          bio: profile.bio,
          profile_complete: profile.profile_complete
        }
        setProfile(profileData)
        setEditForm(profileData)
      }
    } catch (error) {
      console.error('获取档案失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!profile) return
    
    setSaving(true)
    try {
      // WalletConnect认证由apiClient自动处理
      const response = await apiClient.post('/api/update-profile', editForm)

      if (response.success) {
        setProfile({ ...profile, ...editForm })
        setEditing(false)
      }
    } catch (error) {
      console.error('保存档案失败:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditForm(profile || {})
    setEditing(false)
  }

  if (loading) {
    return (
      <AuthGuard>
        <AdaptiveLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </AdaptiveLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <AdaptiveLayout>
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          {/* 返回按钮 */}
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => router.push('/settings')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回设置
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                  <User className="h-8 w-8 text-purple-600" />
                  我的档案
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  管理你的个人信息和出生数据
                </p>
              </div>
              
              {!editing && (
                <Button onClick={() => setEditing(true)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  编辑档案
                </Button>
              )}
            </div>
          </div>

          {/* 档案状态 */}
          {profile && (
            <Alert className={`mb-6 ${profile.profile_complete ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
              <AlertDescription className={profile.profile_complete ? 'text-green-700' : 'text-amber-700'}>
                <strong>档案状态：</strong>
                {profile.profile_complete ? '已完善 - 可享受完整的分析服务' : '待完善 - 请填写出生信息以获得更准确的分析'}
              </AlertDescription>
            </Alert>
          )}

          {/* 档案信息 */}
          {profile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-500" />
                    基本信息
                  </span>
                  {editing && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSave} disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? '保存中...' : '保存'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X className="w-4 h-4 mr-2" />
                        取消
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">邮箱地址</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="nickname">昵称</Label>
                    <Input
                      id="nickname"
                      value={editing ? editForm.nickname || '' : profile.nickname || '未设置'}
                      onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                      disabled={!editing}
                      placeholder="请输入昵称"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="birth_date">出生日期</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={editing ? editForm.birth_date || '' : profile.birth_date || ''}
                      onChange={(e) => setEditForm({ ...editForm, birth_date: e.target.value })}
                      disabled={!editing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="birth_time">出生时间</Label>
                    <Input
                      id="birth_time"
                      type="time"
                      value={editing ? editForm.birth_time || '' : profile.birth_time || ''}
                      onChange={(e) => setEditForm({ ...editForm, birth_time: e.target.value })}
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="birth_location">出生地点</Label>
                  <Input
                    id="birth_location"
                    value={editing ? editForm.birth_location || '' : profile.birth_location || ''}
                    onChange={(e) => setEditForm({ ...editForm, birth_location: e.target.value })}
                    disabled={!editing}
                    placeholder="请输入出生地点"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">联系电话</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={editing ? editForm.phone || '' : profile.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    disabled={!editing}
                    placeholder="请输入联系电话"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">个人简介</Label>
                  <Textarea
                    id="bio"
                    value={editing ? editForm.bio || '' : profile.bio || ''}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    disabled={!editing}
                    placeholder="请输入个人简介"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* 隐私说明 */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>隐私保护：</strong> 您的个人信息仅用于提供精确的命理分析服务，我们严格遵守隐私保护政策，不会向第三方泄露您的任何信息。
            </p>
          </div>
        </div>
      </AdaptiveLayout>
    </AuthGuard>
  )
} 