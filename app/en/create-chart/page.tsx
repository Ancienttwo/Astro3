'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, User, Calendar, Clock, Menu, Compass, SunMoon, Target, Book, Heart, Users, Briefcase, FolderOpen, Home } from 'lucide-react'
import { useDailyCheckin } from '@/hooks/useDailyCheckin'
import SmartLayout from '@/components/SmartLayout'
import { APP_CONFIG } from '@/lib/config/app-config'
import { apiClient } from '@/lib/api-client'

// English Time Picker Component
const ScrollTimePicker = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  initialDateTime = new Date(1990, 0, 1, 12, 0)
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: (date: Date) => void
  initialDateTime?: Date
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDateTime)

  // Generate year options (1900-2030)
  const years = Array.from({ length: 131 }, (_, i) => 1900 + i)
  
  // Generate month options (1-12)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  
  // Generate day options (1-31)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  
  // Generate hour options (00:00-01:00, 01:00-02:00, ...)
  const hours = Array.from({ length: 24 }, (_, i) => {
    const current = String(i).padStart(2, '0')
    const next = String((i + 1) % 24).padStart(2, '0')
    return {
      value: i,
      label: `${current}:00-${next}:00`
    }
  })

  // Handle year change
  const handleYearChange = (year: string) => {
    const newDate = new Date(selectedDate)
    newDate.setFullYear(parseInt(year))
    
    // Check if current date is valid in new year
    const daysInMonth = getDaysInMonth(newDate.getFullYear(), newDate.getMonth() + 1)
    if (newDate.getDate() > daysInMonth) {
      newDate.setDate(daysInMonth)
    }
    
    setSelectedDate(newDate)
  }

  // Handle month change
  const handleMonthChange = (month: string) => {
    const newDate = new Date(selectedDate)
    const newMonth = parseInt(month) - 1
    newDate.setMonth(newMonth)
    
    // Check if current date is valid in new month
    const daysInNewMonth = getDaysInMonth(newDate.getFullYear(), newMonth + 1)
    if (newDate.getDate() > daysInNewMonth) {
      newDate.setDate(daysInNewMonth)
    }
    
    setSelectedDate(newDate)
  }

  // Handle day change
  const handleDayChange = (day: string) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(parseInt(day))
    setSelectedDate(newDate)
  }

  // Handle hour change
  const handleHourChange = (hour: string) => {
    const newDate = new Date(selectedDate)
    newDate.setHours(parseInt(hour))
    newDate.setMinutes(0) // Fixed to hour mark
    setSelectedDate(newDate)
  }

  // Get days in month
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
          <h3 className="text-lg font-semibold text-purple-600">Select Birth Time</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          {/* Year Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
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
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Month Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
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
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Day Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
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
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hour Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Birth Hour</label>
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
        
        {/* Current Selection Display */}
        <div className="bg-purple-50 rounded-lg p-3 mb-4 border border-purple-200">
          <div className="text-center">
            <div className="text-sm text-purple-600 font-medium mb-1">Current Selection</div>
            <div className="text-lg font-bold text-purple-800">
              {selectedDate.getFullYear()}-{String(selectedDate.getMonth() + 1).padStart(2, '0')}-{String(selectedDate.getDate()).padStart(2, '0')} {String(selectedDate.getHours()).padStart(2, '0')}:00-{String((selectedDate.getHours() + 1) % 24).padStart(2, '0')}:00
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={() => onConfirm(selectedDate)} 
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function EnglishCreateChartPage() {
  const router = useRouter()
  
  // Get available chart types based on configuration
  const availableChartTypes = [
    ...(APP_CONFIG.features.analysis.bazi ? [{ type: 'bazi' as const, name: 'BaZi Chart', description: 'Four Pillars of Destiny', icon: '🎯' }] : []),
    ...(APP_CONFIG.features.analysis.ziwei ? [{ type: 'ziwei' as const, name: 'Ziwei Chart', description: 'Purple Star Astrology', icon: '🔮' }] : [])
  ]
  
  const [showMenu, setShowMenu] = useState(false)
  const [selectedChartType, setSelectedChartType] = useState<'bazi' | 'ziwei' | null>(null)
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | ''>('')
  const [category, setCategory] = useState('')
  const [birthDateTime, setBirthDateTime] = useState(new Date(1990, 0, 1, 12, 0))
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { canCheckinToday, performCheckin } = useDailyCheckin()
  const menuRef = useRef<HTMLDivElement>(null)

  // English Category Options
  const categories = [
    { value: 'family', label: 'Family', icon: Home, color: 'text-green-600' },
    { value: 'friends', label: 'Friends', icon: Users, color: 'text-blue-600' },
    { value: 'clients', label: 'Clients', icon: Briefcase, color: 'text-orange-600' },
    { value: 'favorites', label: 'Favorites', icon: Heart, color: 'text-red-600' },
    { value: 'others', label: 'Others', icon: FolderOpen, color: 'text-gray-600' }
  ]

  // Handle click outside to close menu
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
      alert('Please fill in all required information')
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
      
      // Get chart ID
      const chartId = result?.chart?.id || result?.data?.id || result?.id
      if (chartId) {
        // Navigate to analysis page
        const targetPath = selectedChartType === 'bazi' ? '/en/bazi' : '/en/ziwei'
        router.push(`${targetPath}?chartId=${chartId}`)
      } else {
        console.error('Save successful but cannot get chart ID:', result)
        router.push('/en/charts')
      }
    } catch (error) {
      console.error('Save failed:', error)
      // 检查是否是认证错误 - 提供更友好的Web3认证指导
      if (error.message?.includes('未认证') || error.message?.includes('AuthError') || error.message?.includes('Missing authorization')) {
        alert('Authentication required. Please ensure you are logged in with your wallet or email account.');
        // 不要强制跳转，让用户自己选择认证方式
        return;
      }
      // 特殊处理Web3认证过期或无效的错误
      if (error.message?.includes('Web3认证已过期') || error.message?.includes('请重新连接钱包')) {
        alert('Your wallet connection has expired. Please reconnect your wallet and try again.');
        // 可以考虑跳转到钱包连接页面
        return;
      }
      if (error.message?.includes('Web3认证无效')) {
        alert('Invalid wallet authentication. Please reconnect your wallet and try again.');
        return;
      }
      alert('Save failed: ' + (error.message || 'Please try again'))
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
    <SmartLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        {/* Page Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Chart Creation
          </h1>
          <p className="text-gray-600 dark:text-slate-300">
            Create your personal astrology chart
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto px-4 py-4 space-y-6">
        {/* Select Chart Type */}
        <div>
          <h2 className="text-xl font-semibold text-purple-600 dark:text-purple-400 mb-4">
            Select Chart Type
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableChartTypes.map((chartType) => (
              <Card 
                key={chartType.type}
                className={`cursor-pointer transition-all border-2 ${
                  selectedChartType === chartType.type 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md' 
                    : 'border-border hover:border-purple-300'
                }`}
                onClick={() => setSelectedChartType(chartType.type)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-3">{chartType.icon}</div>
                  <h3 className="font-semibold text-purple-600 dark:text-purple-400 mb-1">{chartType.name}</h3>
                  <p className="text-sm text-muted-foreground">{chartType.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Basic Information */}
        <div>
          <h2 className="text-xl font-semibold text-purple-600 dark:text-purple-400 mb-4">
            Basic Information
          </h2>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                <User className="w-4 h-4 mr-2" />
                Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 dark:bg-slate-800 dark:border-slate-600"
              />
            </div>

            {/* Gender and Category - Same Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Gender */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Gender
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
                    Male
                  </button>
                  <button
                    onClick={() => setGender('female')}
                    className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      gender === 'female'
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              {/* Save Category */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                    <SelectValue placeholder="Select category" />
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

            {/* Birth Time */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 mr-2" />
                Birth Time
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

        {/* Save Button */}
        <div className="pt-2">
          <Button 
            onClick={handleSave}
            disabled={!selectedChartType || !name || !gender || !category || isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2.5 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              'Save and Start Analysis'
            )}
          </Button>
        </div>

        {/* Birth Time Accuracy Notice */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                Important: Birth Time Accuracy
              </h3>
              <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed mb-3">
                Note: BaZi only requires knowing the year, month, and day for about 75% accuracy, but ZiWei is different from BaZi - you must know which two-hour period you were born in to create an accurate chart.
              </p>
              <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed">
                Since people often don't remember their exact birth time clearly, please try charts with times 2 hours before or after, and see if the stars in the Life Palace and Health Palace match your personality to determine your correct chart.
              </p>
            </div>
          </div>
        </div>
        </div>

        {/* Time Picker */}
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