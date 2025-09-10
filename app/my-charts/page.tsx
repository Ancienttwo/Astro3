'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, MapPin, User, Star, Target, Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useIsMobile } from '@/hooks/useDeviceType'
import MobileAppLayout from '@/components/MobileAppLayout'
import AnalysisLayout from '@/components/AnalysisLayout'
import Logo from '@/components/Logo'
import { apiClient } from '@/lib/api-client'

interface UserProfile {
  birth_date?: string
  birth_time?: string
  birth_location?: string
  profile_complete?: boolean
  nickname?: string
}

interface EventRecord {
  id: string
  title: string
  description: string
  event_date: string
  event_type: string
  created_at: string
}

export default function MyChartsPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [events, setEvents] = useState<EventRecord[]>([])
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null)
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_date: '',
    event_type: 'important'
  })

  // 获取用户信息和档案
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // WalletConnect认证由apiClient自动处理
        // 尝试获取用户档案信息来验证登录状态
        
        // 获取用户档案
        const response = await apiClient.get('/api/user/profile')
        
        if (response.success && (response as any).profile) {
          setUserProfile((response as any).profile)
            
          // 检查档案是否完整
          if (!(response as any).profile.profile_complete || !(response as any).profile.birth_date) {
            console.log('用户档案未完善，跳转到档案设置页面')
            router.push('/profile?returnTo=/my-charts')
            return
          }
        } else {
          console.error('获取用户档案失败:', response.status)
          router.push('/profile')
          return
        }
        
        // 获取重要事件记录
        const eventsResponse = await apiClient.get('/api/important-events')
        
        if (eventsResponse.success && eventsResponse.data.success) {
          setEvents(eventsResponse.data.events)
        }
        
      } catch (error) {
        console.error('获取用户数据失败:', error)
        router.push('/auth')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  // 格式化时辰显示
  const formatBirthTime = (timeString: string) => {
    const timeMap: { [key: string]: string } = {
      '00:00-01:00': '子时 (23:00-01:00)',
      '01:00-03:00': '丑时 (01:00-03:00)',
      '03:00-05:00': '寅时 (03:00-05:00)',
      '05:00-07:00': '卯时 (05:00-07:00)',
      '07:00-09:00': '辰时 (07:00-09:00)',
      '09:00-11:00': '巳时 (09:00-11:00)',
      '11:00-13:00': '午时 (11:00-13:00)',
      '13:00-15:00': '未时 (13:00-15:00)',
      '15:00-17:00': '申时 (15:00-17:00)',
      '17:00-19:00': '酉时 (17:00-19:00)',
      '19:00-21:00': '戌时 (19:00-21:00)',
      '21:00-23:00': '亥时 (21:00-23:00)'
    }
    return timeMap[timeString] || timeString
  }

  // 跳转到紫微页面（带用户绑定日期）
  const goToZiwei = () => {
    if (!userProfile || !userProfile.birth_date || !userProfile.birth_time) {
      // 如果用户信息不完整，跳转到档案设置页面
      router.push('/profile?returnTo=/my-charts')
      return
    }

    // 解析用户的出生信息
    const [year, month, day] = userProfile.birth_date.split('-')
    const birthHour = userProfile.birth_time.split(':')[0]
    
    // 直接跳转到紫微页面并传递用户的出生信息
    const params = new URLSearchParams({
      autoLoad: 'true',
      name: userProfile.nickname || '我的紫微盘',
      year,
      month,
      day,
      hour: birthHour,
      gender: 'male', // 默认性别，后续可以从用户档案获取
      source: 'profile'
    })
    
    router.push(`/ziwei?${params.toString()}`)
  }

  // 跳转到八字页面（带用户绑定日期）
  const goToBazi = () => {
    if (!userProfile || !userProfile.birth_date || !userProfile.birth_time) {
      // 如果用户信息不完整，跳转到档案设置页面
      router.push('/profile?returnTo=/my-charts')
      return
    }

    // 解析用户的出生信息
    const [year, month, day] = userProfile.birth_date.split('-')
    const birthHour = userProfile.birth_time.split(':')[0]
    
    // 直接跳转到八字页面并传递用户的出生信息
    const params = new URLSearchParams({
      autoLoad: 'true',
      name: userProfile.nickname || '我的八字盘',
      year,
      month,
      day,
      hour: birthHour,
      gender: 'male', // 默认性别，后续可以从用户档案获取
      source: 'profile'
    })
    
    router.push(`/bazi?${params.toString()}`)
  }

  // 添加事件记录
  const handleAddEvent = async () => {
    if (newEvent.title && newEvent.event_date) {
      try {
        // WalletConnect认证由apiClient自动处理
        const response = await apiClient.post('/api/important-events', {
          title: newEvent.title,
          description: newEvent.description,
          event_date: newEvent.event_date,
          event_type: newEvent.event_type
        })

        if (response.success && response.data.success) {
          // 添加到本地状态
          setEvents([...events, response.data.event])
          setNewEvent({ title: '', description: '', event_date: '', event_type: 'important' })
          setShowAddEvent(false)
        } else {
          console.error('保存事件失败:', response.status)
        }
      } catch (error) {
        console.error('添加事件失败:', error)
      }
    }
  }

  // 删除事件
  const handleDeleteEvent = async (eventId: string) => {
    try {
      // WalletConnect认证由apiClient自动处理
      const response = await apiClient.delete(`/api/important-events?eventId=${eventId}`)

      if (response.success && response.data.success) {
        // 从本地状态中移除
        setEvents(events.filter(e => e.id !== eventId))
      } else {
        console.error('删除事件失败:', response.status)
      }
    } catch (error) {
      console.error('删除事件失败:', error)
    }
  }

  // 加载状态组件
  const LoadingContent = () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  )

  // 主要内容组件
  const MainContent = () => (
    <div className={`${isMobile ? 'min-h-screen bg-gray-50' : 'px-4 py-6 space-y-6 max-w-4xl mx-auto'}`}>
      <div className={`${isMobile ? 'p-4' : ''} space-y-6`}>
        {/* 用户信息卡片 - 简化为一行 */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium dark:text-white">我的生辰</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {userProfile.birth_date} {formatBirthTime(userProfile.birth_time || '')}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/profile?returnTo=/my-charts')}
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
              >
                <Edit className="w-4 h-4 mr-1" />
                修改时辰
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 星盘导航 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">我的星盘</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 紫微斗数 */}
            <Card 
              className="cursor-pointer hover:shadow-md transition-all duration-200 bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:shadow-lg"
              onClick={goToZiwei}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-1">紫微斗数</h3>
                <p className="text-sm opacity-90">查看我的紫微命盘</p>
              </CardContent>
            </Card>

            {/* 八字分析 */}
            <Card 
              className="cursor-pointer hover:shadow-md transition-all duration-200 bg-gradient-to-br from-orange-500 to-red-500 text-white hover:shadow-lg"
              onClick={goToBazi}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-1">八字分析</h3>
                <p className="text-sm opacity-90">查看我的八字命盘</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 重要事件记录 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">重要事件记录</h2>
            <Button 
              size="sm"
              onClick={() => setShowAddEvent(true)}
              className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
            >
              <Plus className="w-4 h-4 mr-1" />
              添加
            </Button>
          </div>

          {events.length === 0 ? (
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-6 text-center text-gray-500 dark:text-gray-400">
                <p>暂无事件记录</p>
                <p className="text-sm mt-1">记录重要事件，帮助AI更好地分析您的运势</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <Card key={event.id} className="dark:bg-slate-800 dark:border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{event.title}</h3>
                        {event.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{event.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{event.event_date}</span>
                          <Badge variant="outline" className="text-xs dark:border-slate-600">
                            {event.event_type === 'important' ? '重要' : '一般'}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 功能说明 */}
        <Alert className="dark:bg-slate-800 dark:border-slate-700">
          <AlertDescription className="text-sm dark:text-gray-300">
            <strong>提示：</strong>记录的重要事件将帮助AI更准确地分析您的运势走向，
            建议记录升学、工作变动、感情变化、健康状况等关键人生节点。
          </AlertDescription>
        </Alert>

        {/* 隐私安全提示 */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700">
          <AlertDescription className="text-sm dark:text-blue-200">
            <strong>隐私保护：</strong>重要事件记录已安全保存在您的个人档案中。
            如需彻底删除个人数据，请前往
            <button 
              onClick={() => router.push('/membership')}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline mx-1"
            >
              会员中心
            </button>
            申请删除账号，确保您的隐私安全。
          </AlertDescription>
        </Alert>
      </div>

      {/* 添加事件弹窗 */}
      <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
        <DialogContent className="max-w-sm dark:bg-slate-800 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">添加重要事件</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">事件标题</label>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="例如：入职新公司"
                className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">事件描述</label>
              <Textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="详细描述事件内容..."
                className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">事件日期</label>
              <Input
                type="date"
                value={newEvent.event_date}
                onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddEvent}
                disabled={!newEvent.title || !newEvent.event_date}
                className="flex-1 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
              >
                <Save className="w-4 h-4 mr-2" />
                保存
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddEvent(false)}
                className="flex-1 dark:border-slate-600 dark:text-gray-300"
              >
                <X className="w-4 h-4 mr-2" />
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )

  if (isLoading) {
    return isMobile ? (
      <MobileAppLayout title="我的星盘">
        <LoadingContent />
      </MobileAppLayout>
    ) : (
      <AnalysisLayout>
        <LoadingContent />
      </AnalysisLayout>
    )
  }

  if (!userProfile) {
    return null // 会自动跳转
  }

  return isMobile ? (
    <MobileAppLayout title="我的星盘" showNavigation={false}>
      <MainContent />
    </MobileAppLayout>
  ) : (
    <AnalysisLayout>
      <MainContent />
    </AnalysisLayout>
  )
} 