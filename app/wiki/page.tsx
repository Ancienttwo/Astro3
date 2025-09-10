'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdaptiveLayout } from '@/components/layout/adaptive-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search,
  BookOpen,
  Star,
  Clock,
  TrendingUp,
  ChevronRight,
  Compass,
  Target,
  Circle,
  Sparkles
} from 'lucide-react'

export default function ChineseWikiPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTag, setActiveTag] = useState('all')
  const router = useRouter()

  // 知识分类配置 - 中文版本
  const categories = [
    {
      id: 'bazi',
      name: '八字基础',
      description: '天干地支、五行理论',
      icon: Star,
      color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
      articles: [
        { title: '八字是什么？八字如何运作？', readTime: '15 分钟', href: '/wiki/bazi/intro' },
        { title: '十天干代表什么意思？', readTime: '10 分钟', href: '/wiki/bazi/tiangan-meaning' },
        { title: '十二地支有什么特点？', readTime: '8 分钟', href: '/wiki/bazi/dizhi-meaning' },
        { title: '十神是什么？如何计算十神？', readTime: '15 分钟', href: '/wiki/bazi/shishen-intro' }
      ]
    },
    {
      id: 'ziwei',
      name: 'ZiWei Astrology',
      description: '星曜宫位、四化理论',
      icon: Compass,
      color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
      articles: [
        { title: '紫微十四主星详解', readTime: '10 分钟', href: '/wiki/ziwei-stars' },
        { title: '紫微斗数基础入门', readTime: '8 分钟', href: '/wiki/ziwei/intro' },
        { title: '四化飞星技法', readTime: '12 分钟', href: '/wiki/ziwei/sihua' }
      ]
    },
    {
      id: 'wuxing',
      name: '五行理论',
      description: '生克制化、均衡调和',
      icon: Target,
      color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
      articles: [
        { title: '五行理论完整版', readTime: '20 分钟', href: '/wiki/wuxing' },
        { title: '五行与健康', readTime: '7 分钟', href: '/wiki/wuxing/health' },
        { title: '五行颜色与风水', readTime: '5 分钟', href: '/wiki/wuxing/color' }
      ]
    },
    {
      id: 'yijing',
      name: '易经智慧',
      description: '周易智慧、卦象解析',
      icon: Circle,
      color: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
      articles: [
        { title: '易经智慧入门指南', readTime: '12 分钟', href: '/wiki/yijing' },
        { title: '六十四卦详解', readTime: '30 分钟', href: '/wiki/yijing/sixtyfour-gua' },
        { title: '卦象占卜入门', readTime: '8 分钟', href: '/wiki/yijing/divination' }
      ]
    },
    {
      id: 'comparison',
      name: '流派比较',
      description: '不同流派、理论比较',
      icon: Sparkles,
      color: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
      articles: [
        { title: '紫微斗数与八字的区别', readTime: '12 分钟', href: '/wiki/ziwei-vs-bazi' },
        { title: '古代与现代占星对比', readTime: '8 分钟', href: '/wiki/comparison/ancient-modern' },
        { title: '南派北派差异分析', readTime: '9 分钟', href: '/wiki/comparison/schools' }
      ]
    }
  ]

  // 标签系统 - 中文版本
  const tags = [
    { id: 'all', name: '全部', color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' },
    { id: 'relationships', name: '感情婚姻', color: 'bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400' },
    { id: 'career', name: '事业财运', color: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400' },
    { id: 'health', name: '健康养生', color: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' },
    { id: 'study', name: '学业考试', color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' },
    { id: 'family', name: '家庭关系', color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' }
  ]

  // 热门文章数据 - 中文版本
  const hotArticles = [
    {
      id: 1,
      title: '十天干代表什么意思？',
      category: '八字基础',
      categoryColor: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
      readTime: '10 分钟',
      views: 3421,
      tags: ['事业财运', '感情婚姻'],
      href: '/wiki/bazi/tiangan-meaning'
    },
    {
      id: 2,
      title: '十神是什么？如何计算十神？',
      category: '八字基础',
      categoryColor: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
      readTime: '15 分钟',
      views: 2876,
      tags: ['事业财运', '家庭关系'],
      href: '/wiki/bazi/shishen-intro'
    },
    {
      id: 3,
      title: 'ZiWei Astrology与八字的区别',
      category: '流派比较',
      categoryColor: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
      readTime: '12 分钟',
      views: 2654,
      tags: ['学业考试'],
      href: '/wiki/ziwei-vs-bazi'
    },
    {
      id: 4,
      title: '十二地支有什么特点？',
      category: '八字基础',
      categoryColor: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
      readTime: '8 分钟',
      views: 2341,
      tags: ['健康养生', '感情婚姻'],
      href: '/wiki/bazi/dizhi-meaning'
    }
  ]

  // 处理分类点击 - 更新路由支持
  const handleCategoryClick = (categoryId: string) => {
    switch(categoryId) {
      case 'bazi':
        router.push('/wiki/bazi')
        break
      case 'ziwei':
        router.push('/wiki/ziwei')
        break
      case 'wuxing':
        router.push('/wiki/wuxing')
        break
      case 'yijing':
        router.push('/wiki/yijing')
        break
      case 'comparison':
        router.push('/wiki/ziwei-vs-bazi')
        break
      default:
        // 如果是现有页面，直接跳转
        if (categoryId === 'ziwei-stars') {
          router.push('/wiki/ziwei-stars')
        } else if (categoryId === 'ziwei-vs-bazi') {
          router.push('/wiki/ziwei-vs-bazi')
        } else {
          router.push(`/wiki/${categoryId}`)
        }
    }
  }

  // 处理文章点击 - 跳转到具体文章页面
  const handleArticleClick = (articlePath: string) => {
    router.push(articlePath)
  }

  // 处理标签筛选
  const handleTagClick = (tagId: string) => {
    setActiveTag(tagId)
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log('Search for:', searchQuery)
      // 将来可以实现搜索功能
    }
  }

  // 筛选热门文章
  const filteredHotArticles = hotArticles.filter(article => {
    const matchesTag = activeTag === 'all' || article.tags.includes(tags.find(t => t.id === activeTag)?.name || '')
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTag && matchesSearch
  })

  // 获取标签颜色
  const getTagColor = (tagName: string) => {
    const tag = tags.find(t => t.name === tagName)
    return tag ? tag.color : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
  }

  return (
    <AdaptiveLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        {/* 页面头部 */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                知识百科
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                命理学知识宝库
              </p>
              
              {/* 搜索栏 */}
              <div className="mt-8 max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="搜索知识百科..."
                    className="pl-10 pr-4 py-3 w-full border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 主要内容 */}
            <div className="lg:col-span-2">
              {/* 分类网格 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {categories.map((category) => (
                  <Card 
                    key={category.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-300 dark:bg-slate-800 dark:border-slate-700"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${category.color}`}>
                            <category.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                              {category.name}
                            </CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {category.description}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {category.articles.slice(0, 3).map((article, index) => (
                          <div 
                            key={index} 
                            className="flex items-center justify-between text-sm hover:bg-gray-50 dark:hover:bg-slate-700 p-2 rounded cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleArticleClick(article.href)
                            }}
                          >
                            <span className="text-gray-700 dark:text-gray-300 flex-1">
                              {article.title}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 ml-2">
                              {article.readTime}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 侧边栏 */}
            <div className="space-y-6">
              {/* 热门文章 */}
              <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                    <TrendingUp className="w-5 h-5 text-red-500" />
                    <span>热门文章</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* 标签筛选 */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => handleTagClick(tag.id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            activeTag === tag.id
                              ? 'bg-purple-500 text-white dark:bg-purple-600'
                              : tag.color
                          }`}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* 文章列表 */}
                  <div className="space-y-4">
                    {filteredHotArticles.map((article) => (
                      <div 
                        key={article.id}
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 p-3 rounded-lg transition-colors"
                        onClick={() => handleArticleClick(article.href)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm leading-tight">
                            {article.title}
                          </h4>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-3">
                            <Badge variant="secondary" className={`${article.categoryColor} text-xs`}>
                              {article.category}
                            </Badge>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {article.readTime}
                            </span>
                            <span className="flex items-center">
                              <BookOpen className="w-3 h-3 mr-1" />
                              {article.views}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {article.tags.map((tag, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className={`text-xs ${getTagColor(tag)}`}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdaptiveLayout>
  )
} 