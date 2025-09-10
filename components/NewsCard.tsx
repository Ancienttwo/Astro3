"use client";

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Newspaper, 
  Clock, 
  Star, 
  TrendingUp,
  Calendar,
  ExternalLink,
  RefreshCw,
  Sparkles,
  BookOpen,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NewsItem {
  id: string
  title: string
  summary: string
  category: '功能更新' | '命理知识' | '系统公告' | '活动资讯'
  date: string
  isNew?: boolean
  isHot?: boolean
  link?: string
}

interface NewsCardProps {
  className?: string
}

// 模拟新闻数据
const mockNews: NewsItem[] = [
  {
    id: '1',
    title: '四大AI大师上线',
    summary: '分别是八字的用神大师、铁口直断盲派大师，和紫微的四化大师、推理大师。请分别在八字和紫微星盘中访问。',
    category: '功能更新',
    date: '2025-06-15',
    isNew: true,
    link: '/home'
  },
  {
    id: '2',
    title: '每日签到系统优化',
    summary: '完善签到奖励机制，连续签到可获得更多免费AI分析次数',
    category: '功能更新',
    date: '2025-06-14',
    isHot: true
  },
  {
    id: '3',
    title: '五行旺弱系统加强版上线！',
    summary: '加入季节调候、天透地藏、天干克合、地支刑冲破害绝、三合三会六合半合拱合、成党成势，精确计算出你的命盘五行旺弱，助你在大运的趋吉避凶上不再彷徨！',
    category: '功能更新',
    date: '2025-06-13',
    isHot: true
  },
  {
    id: '4',
    title: '八字VS紫微',
    summary: '为你详解八字和紫微各自的优势，助你在命理学习上如虎添翼！',
    category: '命理知识',
    date: '2025-06-12'
  },
  {
    id: '5',
    title: '个人中心功能完善',
    summary: '新增使用统计、签到记录、购买历史等个人数据管理功能',
    category: '功能更新',
    date: '2025-06-11'
  }
]

const categoryConfig = {
  '功能更新': {
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    icon: Zap
  },
  '命理知识': {
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    icon: BookOpen
  },
  '系统公告': {
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    icon: Newspaper
  },
  '活动资讯': {
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    icon: Star
  }
}

export function NewsCard({ className = '' }: NewsCardProps) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    // 模拟加载延迟
    const timer = setTimeout(() => {
      setNews(mockNews)
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  const handleRefresh = () => {
    setLoading(true)
    // 模拟刷新
    setTimeout(() => {
      setNews([...mockNews])
      setLoading(false)
    }, 300)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '昨天'
    if (diffDays < 7) return `${diffDays}天前`
    
    return date.toLocaleDateString('zh-CN', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const displayNews = expanded ? news : news.slice(0, 3)

  if (loading) {
    return (
      <Card className={cn("bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 border-blue-200 dark:border-slate-600", className)}>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mb-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
          <CardTitle className="text-lg text-blue-800 dark:text-blue-200">
            加载最新资讯中...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={cn("bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 border-blue-200 dark:border-slate-600", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-lg text-blue-800 dark:text-blue-200">
              最新资讯
            </CardTitle>
          </div>
          
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {displayNews.map((item) => {
          const categoryInfo = categoryConfig[item.category]
          const CategoryIcon = categoryInfo.icon

          return (
            <div
              key={item.id}
              className="p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-blue-100 dark:border-slate-600 hover:shadow-md transition-all duration-200 group cursor-pointer"
              onClick={() => item.link && (window.location.href = item.link)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2 flex-1">
                  <Badge className={cn("text-xs px-2 py-1", categoryInfo.color)}>
                    <CategoryIcon className="w-3 h-3 mr-1" />
                    {item.category}
                  </Badge>
                  
                  {item.isNew && (
                    <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs px-2 py-1">
                      <Sparkles className="w-3 h-3 mr-1" />
                      NEW
                    </Badge>
                  )}
                  
                  {item.isHot && (
                    <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 text-xs px-2 py-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      HOT
                    </Badge>
                  )}
                </div>

                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDate(item.date)}
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {item.title}
                {item.link && (
                  <ExternalLink className="w-3 h-3 ml-1 inline opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {item.summary}
              </p>
            </div>
          )
        })}

        {news.length > 3 && (
          <Button
            onClick={() => setExpanded(!expanded)}
            variant="ghost"
            className="w-full text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 mt-3"
          >
            {expanded ? '收起' : `查看更多 (${news.length - 3}条)`}
          </Button>
        )}

        {/* 底部说明 */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-blue-100 dark:border-slate-600">
          定期更新系统功能和命理知识，敬请关注
        </div>
      </CardContent>
    </Card>
  )
} 