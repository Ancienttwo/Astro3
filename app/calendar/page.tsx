'use client'

import { useState } from 'react'
import { Solar } from '@/lib/lunar'
import { useIsMobile } from '@/hooks/useDeviceType'
import MobileAppLayout, { MobileCard, MobilePageHeader } from '@/components/MobileAppLayout'
import AnalysisLayout from '@/components/AnalysisLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Star,
  Zap,
  Clock,
  MapPin
} from 'lucide-react'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const isMobile = useIsMobile()
  
  // 使用lunar-typescript获取真实的农历数据
  const solar = Solar.fromDate(currentDate)
  const lunar = solar.getLunar()
  
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  
  // 生成日历数据
  const generateCalendar = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  const calendarDays = generateCalendar(currentDate)
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentDate(newDate)
  }

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  // 获取今日的真实数据
  const todaySolar = Solar.fromDate(new Date())
  const todayLunar = todaySolar.getLunar()
  
  // 获取节气和节日
  const jieqi = todayLunar.getJieQi()
  const festivals = todaySolar.getFestivals().concat(todaySolar.getOtherFestivals())
  
  // 获取宜忌
  const yis = todayLunar.getDayYi() || []
  const jis = todayLunar.getDayJi() || []
  
  // 获取时辰吉凶
  const getShichenData = () => {
    const shichens = [
      { name: '子', period: '23:00-01:00' },
      { name: '丑', period: '01:00-03:00' },
      { name: '寅', period: '03:00-05:00' },
      { name: '卯', period: '05:00-07:00' },
      { name: '辰', period: '07:00-09:00' },
      { name: '巳', period: '09:00-11:00' },
      { name: '午', period: '11:00-13:00' },
      { name: '未', period: '13:00-15:00' },
      { name: '申', period: '15:00-17:00' },
      { name: '酉', period: '17:00-19:00' },
      { name: '戌', period: '19:00-21:00' },
      { name: '亥', period: '21:00-23:00' }
    ]
    
    return shichens.map((shichen, index) => {
      // 使用简单的算法来确定吉凶，可以根据需要改进
      const isJi = (index + todayLunar.getDay()) % 3 !== 0
      return {
        time: `${shichen.name}时`,
        period: shichen.period,
        status: isJi ? '吉' : '凶',
        color: isJi ? 'green' : 'red'
      }
    })
  }

  // 主要内容组件
  const MainContent = () => (
    <div className={`${isMobile ? 'min-h-screen bg-gray-50' : 'px-4 py-6 space-y-6 max-w-5xl mx-auto'}`}>
      {/* 移动端页面标题 */}
      {isMobile && (
        <MobilePageHeader
          title="万年历"
          subtitle="查看农历、节气、吉日信息"
        />
      )}

      <div className={`${isMobile ? 'p-4' : ''} space-y-6`}>
        {/* 日历头部 */}
        <Card className={isMobile ? '' : 'dark:bg-slate-800 dark:border-slate-700'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="p-2 dark:text-gray-300 dark:hover:text-yellow-400"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {lunar.getYearInGanZhi()}年{lunar.getMonthInChinese()}月
                </p>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigateMonth('next')}
                className="p-2 dark:text-gray-300 dark:hover:text-yellow-400"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* 星期标题 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day, index) => (
                <div key={day} className="text-center py-2">
                  <span className={`text-sm font-medium ${
                    index === 0 || index === 6 ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'
                  }`}>
                    {day}
                  </span>
                </div>
              ))}
            </div>

            {/* 日历网格 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                const dateSolar = Solar.fromDate(date)
                const dateLunar = dateSolar.getLunar()
                const today = isToday(date)
                const currentMonth = isCurrentMonth(date)
                const dayFestivals = dateSolar.getFestivals().concat(dateSolar.getOtherFestivals())
                const dayJieqi = dateLunar.getJieQi()
                
                return (
                  <div
                    key={index}
                    className={`
                      relative p-1 min-h-[60px] border rounded-lg cursor-pointer transition-all flex flex-col justify-center
                      ${today ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600' : 'bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600'}
                      ${!currentMonth ? 'opacity-40' : ''}
                      hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-200 dark:hover:border-purple-500
                    `}
                  >
                    <div className="text-center">
                      <div className={`text-sm font-medium leading-tight ${
                        today ? 'text-purple-600 dark:text-purple-300' : 
                        index % 7 === 0 || index % 7 === 6 ? 'text-red-500' : 'text-gray-900 dark:text-white'
                      }`}>
                        {date.getDate()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight whitespace-nowrap overflow-hidden">
                        {dateLunar.getDayInChinese()}
                      </div>
                      {(dayFestivals.length > 0 || dayJieqi) && (
                        <div className="absolute top-1 right-1">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 信息面板 - 桌面端并排显示 */}
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'} gap-6`}>
          {/* 今日信息 */}
          <Card className={isMobile ? '' : 'dark:bg-slate-800 dark:border-slate-700'}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">今日信息</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Sun className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">公历</span>
                    </div>
                    <p className="font-medium dark:text-white">{todaySolar.toYmd()}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{['星期日','星期一','星期二','星期三','星期四','星期五','星期六'][new Date().getDay()]}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Moon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">农历</span>
                    </div>
                    <p className="font-medium dark:text-white">{todayLunar.getMonthInChinese()}月{todayLunar.getDayInChinese()}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{todayLunar.getYearInGanZhi()}年</p>
                  </div>
                </div>

                {(jieqi || festivals.length > 0) && (
                  <div className="border-t dark:border-slate-600 pt-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">节气节日</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {jieqi && (
                        <Badge variant="outline" className="text-xs dark:border-slate-500 dark:text-gray-300">
                          {jieqi}
                        </Badge>
                      )}
                      {festivals.map((festival, index) => (
                        <Badge key={index} variant="outline" className="text-xs dark:border-slate-500 dark:text-gray-300">
                          {festival}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 宜忌信息 */}
          <Card className={isMobile ? '' : 'dark:bg-slate-800 dark:border-slate-700'}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">今日宜忌</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">宜</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {yis.length > 0 ? yis.map((item, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                          {item}
                        </Badge>
                      )) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">诸事不宜</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium text-red-600 dark:text-red-400">忌</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {jis.length > 0 ? jis.map((item, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                          {item}
                        </Badge>
                      )) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">百无禁忌</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 时辰吉凶 */}
          <Card className={isMobile ? '' : 'dark:bg-slate-800 dark:border-slate-700'}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">时辰吉凶</h3>
                </div>
                
                <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-3`}>
                  {getShichenData().map((item) => (
                    <div key={item.time} className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm dark:text-white">{item.time}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            item.color === 'green' ? 'border-green-500 text-green-600 dark:border-green-400 dark:text-green-400' : 'border-red-500 text-red-600 dark:border-red-400 dark:text-red-400'
                          }`}
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.period}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 底部空白区域 */}
        <div className="h-4"></div>
      </div>
    </div>
  )

  return isMobile ? (
    <MobileAppLayout title="万年历">
      <MainContent />
    </MobileAppLayout>
  ) : (
    <AnalysisLayout>
      <MainContent />
    </AnalysisLayout>
  )
} 