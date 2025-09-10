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
import EnglishLayout from '@/components/EnglishLayout'
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

export default function EnglishSettingsProfilePage() {
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
        const data = response.data
        const profile = data?.profile || {};
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
      console.error('Failed to fetch profile:', error)
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
      console.error('Failed to save profile:', error)
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
        <EnglishLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </EnglishLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <EnglishLayout>
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          {/* Back Button */}
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => router.push('/en/settings')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Settings
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                  <User className="h-8 w-8 text-purple-600" />
                  My Profile
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your personal information and birth data
                </p>
              </div>
              
              {!editing && (
                <Button onClick={() => setEditing(true)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {/* Profile Status */}
          {profile && (
            <Alert className={`mb-6 ${profile.profile_complete ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
              <AlertDescription className={profile.profile_complete ? 'text-green-700' : 'text-amber-700'}>
                <strong>Profile Status:</strong>
                {profile.profile_complete ? ' Complete - You can enjoy full analysis services' : ' Incomplete - Please fill in birth information for more accurate analysis'}
              </AlertDescription>
            </Alert>
          )}

          {/* Profile Information */}
          {profile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-500" />
                    Basic Information
                  </span>
                  {editing && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSave} disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="nickname">Nickname</Label>
                    <Input
                      id="nickname"
                      value={editing ? editForm.nickname || '' : profile.nickname || 'Not set'}
                      onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                      disabled={!editing}
                      placeholder="Enter nickname"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="birth_date">Birth Date</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={editing ? editForm.birth_date || '' : profile.birth_date || ''}
                      onChange={(e) => setEditForm({ ...editForm, birth_date: e.target.value })}
                      disabled={!editing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="birth_time">Birth Time</Label>
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
                  <Label htmlFor="birth_location">Birth Location</Label>
                  <Input
                    id="birth_location"
                    value={editing ? editForm.birth_location || '' : profile.birth_location || ''}
                    onChange={(e) => setEditForm({ ...editForm, birth_location: e.target.value })}
                    disabled={!editing}
                    placeholder="Enter birth location"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={editing ? editForm.phone || '' : profile.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    disabled={!editing}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={editing ? editForm.bio || '' : profile.bio || ''}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    disabled={!editing}
                    placeholder="Enter your bio"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Privacy Notice */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Privacy Protection:</strong> Your personal information is used only to provide accurate astrology analysis services. We strictly follow privacy protection policies and will not disclose any of your information to third parties.
            </p>
          </div>
        </div>
      </EnglishLayout>
    </AuthGuard>
  )
}