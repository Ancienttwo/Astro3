'use client'
// @ts-expect-error next-dynamic-flag
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, BarChart3, Compass, SunMoon, User, Calendar, Plus, Menu, Target, Book } from 'lucide-react'
import { useDailyCheckin } from '@/hooks/useDailyCheckin'
import { ChartCategoryFilter, ChartCardContainer } from '@/components/fatebook'
import { useFatebookStore, useFilteredCharts } from '@/stores/fatebook-store'
import type { ChartRecord } from '@/types/fatebook'
import { useIsMobile } from '@/hooks/useDeviceType'
import SmartLayout from '@/components/SmartLayout'

export default function ChartsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()
  
  // 语言检测
  const langParam = searchParams.get('lang')
  const isEnglish = langParam === 'en'
  
  // 恢复完整的状态管理
  const { loading, loadCharts } = useFatebookStore()
  const charts = useFilteredCharts() // 使用过滤后的数据
  const [showMenu, setShowMenu] = useState(false)
  const { canCheckinToday, performCheckin } = useDailyCheckin()
  const menuRef = useRef<HTMLDivElement>(null)
  
  // 初始化数据加载
  useEffect(() => {
    loadCharts()
  }, [loadCharts])

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

  // 导航处理
  const handleNavigation = (route: string) => {
    router.push(route)
  }

  // 处理命盘选择
  const handleChartSelect = (chart: ChartRecord) => {
    console.log('🔍 选择命盘:', chart);
    
    // 根据当前语言环境决定跳转路径
    const basePage = chart.chartType === 'bazi' ? 'bazi' : 'ziwei';
    const targetPage = isEnglish ? `/en/${basePage}` : `/${basePage}`;
    router.push(`${targetPage}?chartId=${chart.id}`);
  }



  // 渲染内容区域
  const renderContent = () => (
    <div className={isMobile ? "pt-4 pb-4 px-4 max-w-7xl mx-auto" : "max-w-7xl mx-auto"}>
      <div className={isMobile ? "space-y-4" : "space-y-6"}>
        {/* 分类标签 */}
        <div className={isMobile 
          ? "border-b border-gray-200 dark:border-slate-600 -mx-4 px-4 pb-3"
          : "bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6"
        }>
          <ChartCategoryFilter />
        </div>

        {/* 命盘列表 */}
        <div className={isMobile ? "space-y-3" : "space-y-4"}>
          {loading ? (
            <div className={`text-center ${isMobile ? 'py-8' : 'py-12'}`}>
              <div className={`animate-spin rounded-full border-b-2 mx-auto ${
                isMobile 
                  ? 'h-8 w-8 border-yellow-600' 
                  : 'h-12 w-12 border-primary dark:border-amber-400'
              }`}></div>
              <p className={`mt-4 ${isMobile ? 'text-gray-600' : 'text-muted-foreground dark:text-gray-300 text-lg'}`}>
                Loading...
              </p>
            </div>
          ) : charts.length > 0 ? (
            <div className={isMobile ? "space-y-3" : "grid gap-4 md:gap-6"}>
              {charts.map((chart) => (
                <div key={chart.id} className={isMobile 
                  ? "bg-white rounded-lg border border-gray-200"
                  : "transition-all duration-200 hover:shadow-md"
                }>
                  {isMobile ? (
                    <ChartCardContainer
                      chart={chart}
                      isSelected={false}
                      onClick={() => handleChartSelect(chart)}
                      isEnglish={isEnglish}
                    />
                  ) : (
                    <Card className="dark:bg-slate-800 dark:border-slate-700">
                      <CardContent className="p-0">
                        <ChartCardContainer
                          chart={chart}
                          isSelected={false}
                          onClick={() => handleChartSelect(chart)}
                          isEnglish={isEnglish}
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={isMobile 
              ? "text-center py-8 text-gray-500"
              : ""
            }>
              {isMobile ? (
                <>
                  <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                  <p>{isEnglish ? 'No chart records yet' : '还没有命盘记录'}</p>
                  <p className="text-sm mt-1">
                    {isEnglish 
                      ? 'Create your first chart from home menu or chart pages'
                      : '从首页菜单或命书页面创建您的第一个命盘'
                    }
                  </p>
                </>
              ) : (
                <Card className="dark:bg-slate-800 dark:border-slate-700">
                  <CardContent className="text-center py-16">
                    <BarChart3 size={64} className="mx-auto mb-6 text-muted-foreground dark:text-gray-400 opacity-50" />
                    <h3 className="text-xl font-semibold text-foreground dark:text-gray-100 mb-2">
                      {isEnglish ? 'No chart records yet' : '还没有命盘记录'}
                    </h3>
                    <p className="text-muted-foreground dark:text-gray-300 mb-6">
                      {isEnglish 
                        ? 'Create your first chart from the navigation or chart pages'
                        : '从左侧导航或排盘页面创建您的第一个命盘'
                      }
                    </p>
                    <Button 
                      onClick={() => router.push(isEnglish ? '/create-chart?lang=en' : '/create-chart')}
                      className="bg-primary hover:bg-primary/90 dark:bg-amber-600 dark:hover:bg-amber-700 dark:text-gray-900"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {isEnglish ? 'Create Chart' : '创建命盘'}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // 移动端：保持原有布局
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* 顶部导航栏 */}
        <div className="bg-white px-4 py-2 flex items-center justify-between border-b border-gray-100 relative">
          <button
            onClick={() => router.push(isEnglish ? '/en/home' : '/home')}
            className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-900">{isEnglish ? 'Chart Records' : '命盘记录'}</h1>
          </div>
          
          {/* 右侧菜单图标 */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            
            {/* 下拉菜单 */}
            {showMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">
                <button
                  onClick={() => { 
                    handleNavigation(isEnglish ? '/en/create-chart' : '/create-chart');
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 transition-colors flex items-center"
                >
                  <Target className="w-4 h-4 mr-3" />
                  {isEnglish ? 'Create Chart' : '排盘'}
                </button>
                {!isEnglish && (
                  <button
                    onClick={() => { 
                      if (canCheckinToday) performCheckin();
                      setShowMenu(false);
                    }}
                    disabled={!canCheckinToday}
                    className={`w-full px-4 py-2 text-left transition-colors flex items-center ${
                      canCheckinToday 
                        ? 'hover:bg-gray-100 text-gray-700' 
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Book className="w-4 h-4 mr-3" />
                    每日签到
                  </button>
                )}
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => { 
                    handleNavigation(isEnglish ? '/en/home' : '/home');
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 transition-colors flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-3" />
                  {isEnglish ? 'Back to Home' : '回到首页'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* 主要内容区域 */}
        {renderContent()}
      </div>
    )
  }

  // 桌面端：使用基于语言的布局
  return (
    <SmartLayout>
      {renderContent()}
    </SmartLayout>
  )
} 
