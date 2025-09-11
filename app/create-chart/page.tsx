'use client'
// @ts-expect-error next-dynamic-flag
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ArrowLeft, User, Calendar, Clock, Menu, Compass, SunMoon, Target, Book, Heart, Users, Briefcase, FolderOpen, Home } from 'lucide-react'
import { useDailyCheckin } from '@/hooks/useDailyCheckin'
import SmartLayout from '@/components/SmartLayout'
import { apiClient } from '@/lib/api-client'

// 时间选择器组件
const ScrollTimePicker = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  initialDateTime = new Date(1990, 0, 1, 12, 0) // 🔥 默认1990年1月1日12点
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: (date: Date) => void
  initialDateTime?: Date
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDateTime)

  // 生成年份选项 (1900-2030)
  const years = Array.from({ length: 131 }, (_, i) => 1900 + i)
  
  // 生成月份选项 (1-12)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  
  // 生成日期选项 (1-31)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  
  // 生成时间选项 (整点格式: 00:00-01:00, 01:00-02:00, ...)
  const hours = Array.from({ length: 24 }, (_, i) => {
    const current = String(i).padStart(2, '0')
    const next = String((i + 1) % 24).padStart(2, '0')
    return {
      value: i,
      label: `${current}:00-${next}:00`
    }
  })

  // 处理年份变化
  const handleYearChange = (year: string) => {
    const newDate = new Date(selectedDate)
    newDate.setFullYear(parseInt(year))
    
    // 检查新年份下当前月份的天数，如果当前日期无效则调整
    const daysInMonth = getDaysInMonth(newDate.getFullYear(), newDate.getMonth() + 1)
    if (newDate.getDate() > daysInMonth) {
      newDate.setDate(daysInMonth)
    }
    
    setSelectedDate(newDate)
  }

  // 处理月份变化
  const handleMonthChange = (month: string) => {
    const newDate = new Date(selectedDate)
    const newMonth = parseInt(month) - 1
    newDate.setMonth(newMonth)
    
    // 检查新月份的天数，如果当前日期超过了新月份的天数，则调整到月末
    const daysInNewMonth = getDaysInMonth(newDate.getFullYear(), newMonth + 1)
    if (newDate.getDate() > daysInNewMonth) {
      newDate.setDate(daysInNewMonth)
    }
    
    setSelectedDate(newDate)
  }

  // 处理日期变化
  const handleDayChange = (day: string) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(parseInt(day))
    setSelectedDate(newDate)
  }

  // 处理时间变化
  const handleHourChange = (hour: string) => {
    const newDate = new Date(selectedDate)
    newDate.setHours(parseInt(hour))
    newDate.setMinutes(0) // 固定为整点
    setSelectedDate(newDate)
  }

  // 获取当前月份的天数
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate()
  }

  const daysInCurrentMonth = getDaysInMonth(selectedDate.getFullYear(), selectedDate.getMonth() + 1)
  const validDays = days.slice(0, daysInCurrentMonth)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-purple-600">选择出生时间</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          {/* 年份选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">年份</label>
            <Select 
              value={selectedDate.getFullYear().toString()} 
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}年
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 月份选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">月份</label>
            <Select 
              value={(selectedDate.getMonth() + 1).toString()} 
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map(month => (
                  <SelectItem key={month} value={month.toString()}>
                    {month}月
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 日期选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">日期</label>
            <Select 
              value={selectedDate.getDate().toString()} 
              onValueChange={handleDayChange}
            >
              <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {validDays.map(day => (
                  <SelectItem key={day} value={day.toString()}>
                    {day}日
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 时间选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">出生时辰</label>
            <Select 
              value={selectedDate.getHours().toString()} 
              onValueChange={handleHourChange}
            >
              <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {hours.map(hour => (
                  <SelectItem key={hour.value} value={hour.value.toString()}>
                    {hour.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* 当前选择显示 */}
        <div className="bg-purple-50 rounded-lg p-3 mb-4 border border-purple-200">
          <div className="text-center">
            <div className="text-sm text-purple-600 font-medium mb-1">当前选择</div>
            <div className="text-lg font-bold text-purple-800">
              {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日 {String(selectedDate.getHours()).padStart(2, '0')}:00-{String((selectedDate.getHours() + 1) % 24).padStart(2, '0')}:00
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            取消
          </Button>
          <Button 
            onClick={() => onConfirm(selectedDate)} 
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            确定
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function CreateChartPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const langParam = searchParams.get('lang')
  const isEnglish = langParam === 'en'
  
  const [showMenu, setShowMenu] = useState(false)
  const [selectedChartType, setSelectedChartType] = useState<'bazi' | 'ziwei' | null>(null)
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | ''>('')
  const [category, setCategory] = useState('')
  const [birthDateTime, setBirthDateTime] = useState(new Date(1990, 0, 1, 12, 0)) // 🔥 默认1990年1月1日12点
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { canCheckinToday, performCheckin } = useDailyCheckin()
  const menuRef = useRef<HTMLDivElement>(null)

  // 分类选项
  const categories = [
    { value: 'family', label: '家人', icon: Home, color: 'text-green-600' },
    { value: 'friends', label: '朋友', icon: Users, color: 'text-blue-600' },
    { value: 'clients', label: '客户', icon: Briefcase, color: 'text-orange-600' },
    { value: 'favorites', label: '最爱', icon: Heart, color: 'text-red-600' },
    { value: 'others', label: '其他', icon: FolderOpen, color: 'text-gray-600' }
  ]

  // 处理点击外部关闭菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [menuRef])

  const handleTimeConfirm = (date: Date) => {
    setBirthDateTime(date)
    setIsTimePickerOpen(false)
  }

  const handleSave = async () => {
    if (!selectedChartType || !name || !gender || !category) {
      alert('请填写完整信息')
      return
    }

    setIsLoading(true)
    try {
      const chartData = {
        name,
        birth_year: birthDateTime.getFullYear(),
        birth_month: birthDateTime.getMonth() + 1,
        birth_day: birthDateTime.getDate(),
        birth_hour: birthDateTime.getHours(),
        birth_minute: birthDateTime.getMinutes(),
        gender,
        chart_type: selectedChartType,
        category
      }

      // WalletConnect认证由apiClient自动处理
      const response = await apiClient.post('/api/charts', chartData)
      
      if (!response.success) {
        const errorData = response.data;
        throw new Error(errorData?.error || 'Failed to create chart');
      }

      const result = response.data
      
      // 获取命盘ID
      const chartId = result?.chart?.id || result?.data?.id || result?.id
      if (chartId) {
        // 立即跳转，不等待
        const targetPath = selectedChartType === 'bazi' ? '/bazi' : '/ziwei'
        router.push(`${targetPath}?chartId=${chartId}`)
      } else {
        console.error('保存成功但无法获取命盘ID:', result)
        router.push('/charts')
      }
    } catch (error) {
      console.error('保存失败:', error)
      // 检查是否是认证错误 - 提供更友好的Web3认证指导
      if (error.message?.includes('未认证') || error.message?.includes('AuthError') || error.message?.includes('Missing authorization')) {
        alert('需要认证。请确保您已使用钱包或邮箱账号登录。');
        return;
      }
      // 特殊处理Web3认证过期或无效的错误
      if (error.message?.includes('Web3认证已过期') || error.message?.includes('请重新连接钱包')) {
        alert('您的钱包连接已过期，请重新连接钱包后再试。');
        return;
      }
      if (error.message?.includes('Web3认证无效')) {
        alert('钱包认证无效，请重新连接钱包后再试。');
        return;
      }
      alert('保存失败: ' + (error.message || '请重试'))
    } finally {
      setIsLoading(false)
    }
  }

  const formatDateTime = (date: Date) => {
    const hour = String(date.getHours()).padStart(2, '0')
    const nextHour = String((date.getHours() + 1) % 24).padStart(2, '0')
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${hour}:00-${nextHour}:00`
  }

  return (
    <SmartLayout forceLayout={isEnglish ? 'english' : undefined}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        {/* 页面标题 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isEnglish ? 'Chart Creation' : '星玺排盘'}
          </h1>
          <p className="text-gray-600 dark:text-slate-300">
            {isEnglish ? 'Create your personal astrology chart' : '创建您的专属命盘'}
          </p>
        </div>

        {/* 主要内容 */}
        <div className="max-w-3xl mx-auto px-4 py-4 space-y-6">
        {/* 选择排盘类型 */}
        <div>
          <h2 className="text-xl font-semibold text-purple-600 dark:text-purple-400 mb-4">
            {isEnglish ? 'Select Chart Type' : '选择排盘类型'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className={`cursor-pointer transition-all border-2 ${
                selectedChartType === 'bazi' 
                  ? 'border-purple-500 bg-purple-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedChartType('bazi')}
            >
              <CardContent className="p-3 text-center">
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="font-semibold text-purple-600 mb-1">八字排盘</h3>
                <p className="text-xs text-gray-600">四柱推命</p>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-all border-2 ${
                selectedChartType === 'ziwei' 
                  ? 'border-purple-500 bg-purple-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedChartType('ziwei')}
            >
              <CardContent className="p-3 text-center">
                <div className="text-2xl mb-2">🔮</div>
                <h3 className="font-semibold text-purple-600 mb-1">紫微排盘</h3>
                <p className="text-xs text-gray-600">斗数命盘</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 基本信息 */}
        <div>
          <h2 className="text-xl font-semibold text-purple-600 dark:text-purple-400 mb-4">
            {isEnglish ? 'Basic Information' : '基本信息'}
          </h2>
          <div className="space-y-4">
            {/* 姓名 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                <User className="w-4 h-4 mr-2" />
                {isEnglish ? 'Name' : '姓名'}
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isEnglish ? 'Enter name' : '请输入姓名'}
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 dark:bg-slate-800 dark:border-slate-600"
              />
            </div>

            {/* 性别和分类 - 同一行 */}
            <div className="grid grid-cols-2 gap-3">
              {/* 性别 */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  {isEnglish ? 'Gender' : '性别'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setGender('male')}
                    className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      gender === 'male'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isEnglish ? 'Male' : '男'}
                  </button>
                  <button
                    onClick={() => setGender('female')}
                    className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      gender === 'female'
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isEnglish ? 'Female' : '女'}
                  </button>
                </div>
              </div>

              {/* 保存分类 */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">保存分类</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center">
                          <cat.icon className={`w-4 h-4 mr-2 ${cat.color}`} />
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 出生时间 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 mr-2" />
                出生时间
              </label>
              <div 
                onClick={() => setIsTimePickerOpen(true)}
                className="w-full p-2 border border-gray-300 rounded-md cursor-pointer hover:border-purple-500 transition-colors bg-white"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">
                    {formatDateTime(birthDateTime)}
                  </span>
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 保存按钮 */}
        <div className="pt-2">
          <Button 
            onClick={handleSave}
            disabled={!selectedChartType || !name || !gender || !category || isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2.5 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                保存中...
              </div>
            ) : (
              '保存并开始分析'
            )}
          </Button>
        </div>

        {/* 出生时间准确性提示 */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                重要提示：出生时间准确性
              </h3>
              <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed mb-3">
                注意：Bazi只要知道年月日，大概有75%左右的准确率，但Ziwei不同到Bazi，必须要知道在哪两个小时的区间内，才可以正确排盘。
              </p>
              <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed">
                由于人们对自己出生的具体时刻往往记得不太清楚，所以请尝试往前或往后两个小时的星盘，看其命宫和疾厄宫的星曜与自己的性格是否匹配来确定自己的星盘。
              </p>
            </div>
          </div>
        </div>
        </div>

        {/* 时间选择器 */}
        <ScrollTimePicker 
          isOpen={isTimePickerOpen}
          onClose={() => setIsTimePickerOpen(false)}
          onConfirm={handleTimeConfirm}
          initialDateTime={birthDateTime}
        />
      </div>
    </SmartLayout>
  )
} 
