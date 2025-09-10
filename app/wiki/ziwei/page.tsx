'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Search,
  BookOpen,
  Compass,
  Eye,
  MessageCircle
} from 'lucide-react'
import { useIsMobile } from '@/hooks/useDeviceType'
import MobileAppLayout, { MobileCard } from '@/components/MobileAppLayout'
import AnalysisLayout from '@/components/AnalysisLayout'

export default function ZiweiWikiPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const router = useRouter()
  const isMobile = useIsMobile()

  // 紫微斗数分类标签
  const categories = [
    { id: 'all', name: '全部', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' },
    { id: 'basics', name: '基础', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' },
    { id: 'stars', name: '星曜', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300' },
    { id: 'palaces', name: '宫位', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300' },
    { id: 'sihua', name: '四化', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300' },
    { id: 'patterns', name: '格局', color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' },
    { id: 'analysis', name: '分析', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300' },
    { id: 'practical', name: '实用', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300' }
  ]

  // 紫微斗数文章内容
  const articles = [
    // 基础类
    {
      id: 'ziwei-intro',
      title: '什么是紫微斗数？紫微斗数的起源？',
      category: 'basics',
      description: '了解紫微斗数的基本概念和历史背景',
      readTime: '6分钟',
      views: 3245,
      comments: 189,
      isNew: true,
      isFree: true,
      difficulty: '入门',
      tags: ['基础理论', '历史起源'],
      href: '/wiki/ziwei/intro'
    },
    {
      id: 'ziwei-paipan',
      title: '如何排出紫微斗数命盘？',
      category: 'basics',
      description: '学会紫微斗数排盘的基本方法',
      readTime: '10分钟',
      views: 2876,
      comments: 145,
      isFree: true,
      difficulty: '入门',
      tags: ['排盘技巧', '基础操作'],
      href: '/wiki/ziwei/paipan'
    },
    
    // 星曜类
    {
      id: 'fourteen-stars',
      title: '紫微十四主星都有什么特点？',
      category: 'stars',
      description: '详解紫微、天机、太阳等十四主星',
      readTime: '15分钟',
      views: 4321,
      comments: 267,
      isHot: true,
      isFree: true,
      difficulty: '进阶',
      tags: ['主星特质', '性格分析'],
      href: '/wiki/ziwei/fourteen-stars'
    },
    {
      id: 'star-brightness',
      title: '星曜的庙旺利陷是什么意思？',
      category: 'stars',
      description: '星曜亮度等级的含义和影响',
      readTime: '8分钟',
      views: 1987,
      comments: 134,
      isFree: true,
      difficulty: '进阶',
      tags: ['星曜亮度', '庙旺利陷'],
      href: '/wiki/ziwei/star-brightness'
    },
    {
      id: 'auxiliary-stars',
      title: '辅星和煞星都有哪些？',
      category: 'stars',
      description: '文昌文曲、左辅右弼、擎羊陀罗等',
      readTime: '12分钟',
      views: 2654,
      comments: 178,
      isFree: false,
      difficulty: '进阶',
      tags: ['辅星', '煞星', '吉凶星'],
      href: '/wiki/ziwei/auxiliary-stars'
    },
    
    // 宫位类
    {
      id: 'twelve-palaces',
      title: '十二宫位都代表什么？',
      category: 'palaces',
      description: '命宫、财帛宫、官禄宫等十二宫详解',
      readTime: '18分钟',
      views: 3789,
      comments: 234,
      isHot: true,
      isFree: true,
      difficulty: '进阶',
      tags: ['宫位含义', '人生领域'],
      href: '/wiki/ziwei/twelve-palaces'
    },
    {
      id: 'palace-analysis',
      title: '如何分析各宫位的吉凶？',
      category: 'palaces',
      description: '宫位分析的方法和技巧',
      readTime: '20分钟',
      views: 2143,
      comments: 156,
      isFree: false,
      difficulty: '高级',
      tags: ['宫位分析', '吉凶判断'],
      href: '/wiki/ziwei/palace-analysis'
    },
    
    // 四化类
    {
      id: 'sihua-basics',
      title: '什么是四化？四化怎么看？',
      category: 'sihua',
      description: '化禄、化权、化科、化忌的基本概念',
      readTime: '12分钟',
      views: 2876,
      comments: 189,
      isFree: true,
      difficulty: '进阶',
      tags: ['四化基础', '化禄化权'],
      href: '/wiki/ziwei/sihua-basics'
    },
    {
      id: 'sihua-flying',
      title: '四化飞星是怎么回事？',
      category: 'sihua',
      description: '四化飞星的运用和分析方法',
      readTime: '25分钟',
      views: 1654,
      comments: 98,
      isFree: false,
      difficulty: '高级',
      tags: ['四化飞星', '高级技巧'],
      href: '/wiki/ziwei/sihua-flying'
    },
    
    // 格局类
    {
      id: 'ziwei-patterns',
      title: '紫微斗数有哪些格局？',
      category: 'patterns',
      description: '紫府朝垣、府相朝垣等经典格局',
      readTime: '30分钟',
      views: 1432,
      comments: 89,
      isFree: false,
      difficulty: '高级',
      tags: ['经典格局', '格局判断'],
      href: '/wiki/ziwei/patterns'
    },
    
    // 分析类
    {
      id: 'personality-analysis',
      title: '如何从紫微斗数看性格？',
      category: 'analysis',
      description: '通过命宫主星分析性格特质',
      readTime: '15分钟',
      views: 3456,
      comments: 223,
      isHot: true,
      isFree: true,
      difficulty: '进阶',
      tags: ['性格分析', '命宫主星'],
      href: '/wiki/ziwei/personality'
    },
    {
      id: 'luck-analysis',
      title: '紫微斗数怎么看大运流年？',
      category: 'analysis',
      description: '大运和流年的分析方法',
      readTime: '22分钟',
      views: 2345,
      comments: 167,
      isFree: false,
      difficulty: '高级',
      tags: ['大运流年', '运势分析'],
      href: '/wiki/ziwei/luck-analysis'
    },
    
    // 实用类
    {
      id: 'career-ziwei',
      title: '紫微斗数如何看事业方向？',
      category: 'practical',
      description: '从官禄宫看适合的职业类型',
      readTime: '18分钟',
      views: 4567,
      comments: 289,
      isHot: true,
      isFree: true,
      difficulty: '进阶',
      tags: ['事业财运', '职业规划'],
      href: '/wiki/ziwei/career'
    },
    {
      id: 'marriage-ziwei',
      title: '紫微斗数怎么看婚姻感情？',
      category: 'practical',
      description: '从夫妻宫分析感情运势',
      readTime: '16分钟',
      views: 5678,
      comments: 345,
      isHot: true,
      isFree: true,
      difficulty: '进阶',
      tags: ['桃花姻缘', '感情分析'],
      href: '/wiki/ziwei/marriage'
    },
    {
      id: 'wealth-ziwei',
      title: '紫微斗数如何看财运？',
      category: 'practical',
      description: '从财帛宫分析财富运势',
      readTime: '14分钟',
      views: 3789,
      comments: 234,
      isFree: false,
      difficulty: '进阶',
      tags: ['事业财运', '财富分析'],
      href: '/wiki/ziwei/wealth'
    }
  ]

  // 筛选文章
  const filteredArticles = articles.filter(article => {
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  // 获取难度颜色
  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case '入门': return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
      case '进阶': return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
      case '高级': return 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  // 获取标签颜色
  const getTagColor = (tag: string) => {
    if (tag.includes('桃花') || tag.includes('感情') || tag.includes('婚姻')) {
      return 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300'
    }
    if (tag.includes('事业') || tag.includes('财运') || tag.includes('职业')) {
      return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300'
    }
    return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
  }

  // 移动端内容
  const MobileContent = () => (
    <MobileAppLayout title="紫微斗数">
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="p-4 space-y-6">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="我的事业运势如何？点搜索看看"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 focus:border-purple-300 focus:ring-purple-200 text-sm dark:text-white"
            />
          </div>

          {/* 分类介绍 */}
          <MobileCard className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 border-blue-200 dark:border-blue-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <Compass className="w-5 h-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200">紫微斗数知识</h3>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                  从星曜宫位开始，深入学习紫微斗数的精髓
                </p>
              </div>
            </div>
          </MobileCard>

          {/* 分类标签 - 横向滑动 */}
          <div className="overflow-x-auto">
            <div className="flex space-x-3 pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeCategory === category.id
                      ? category.color
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* 文章列表 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">学习内容</h2>
              <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                {filteredArticles.length} 篇文章
              </Badge>
            </div>

            {filteredArticles.map((article) => (
              <MobileCard
                key={article.id}
                onClick={() => router.push(article.href)}
                className="cursor-pointer hover:shadow-md transition-all duration-200 dark:hover:shadow-lg"
              >
                <div className="flex items-start space-x-3">
                  {/* 文章图标 */}
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800 dark:to-purple-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  
                  {/* 文章内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm leading-tight pr-2">
                        {article.title}
                      </h3>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        {article.isNew && (
                          <Badge className="bg-red-500 text-white text-xs px-2 py-0.5">新</Badge>
                        )}
                        {article.isHot && (
                          <Badge className="bg-orange-500 text-white text-xs px-2 py-0.5">热</Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* 描述 */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
                      {article.description}
                    </p>
                    
                    {/* 标签 */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {article.tags.slice(0, 2).map((tag, index) => (
                        <Badge 
                          key={index} 
                          className={`text-xs px-2 py-0.5 ${getTagColor(tag)}`}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    {/* 底部信息 */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-3">
                        {article.isFree && (
                          <span className="bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-0.5 rounded">免费</span>
                        )}
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{article.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{article.comments}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>{article.readTime}</span>
                        <Badge className={`text-xs px-2 py-0.5 ${getDifficultyColor(article.difficulty)}`}>
                          {article.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </MobileCard>
            ))}
          </div>

          {/* 空状态 */}
          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">没有找到相关内容</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">试试其他关键词或分类</p>
            </div>
          )}
        </div>
      </div>
    </MobileAppLayout>
  )

  // 桌面端内容
  const DesktopContent = () => (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      {/* 分类介绍 */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-blue-200 dark:border-blue-700">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
              <Compass className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-blue-800 dark:text-blue-200">紫微斗数知识</h1>
              <p className="text-blue-600 dark:text-blue-300 mt-2">
                从星曜宫位开始，深入学习紫微斗数的精髓
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 搜索和分类 */}
      <div className="space-y-6">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="我的事业运势如何？点搜索看看"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 focus:border-purple-300 focus:ring-purple-200 text-sm dark:text-white"
          />
        </div>

        {/* 分类标签 */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category.id
                  ? category.color
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* 文章列表 */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">学习内容</h2>
          <Badge variant="outline" className="text-sm dark:border-gray-600 dark:text-gray-300">
            {filteredArticles.length} 篇文章
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map((article) => (
            <Card
              key={article.id}
              onClick={() => router.push(article.href)}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 dark:hover:shadow-xl"
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  {/* 文章图标 */}
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800 dark:to-purple-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  
                  {/* 文章内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm leading-tight pr-2">
                        {article.title}
                      </h3>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        {article.isNew && (
                          <Badge className="bg-red-500 text-white text-xs px-2 py-0.5">新</Badge>
                        )}
                        {article.isHot && (
                          <Badge className="bg-orange-500 text-white text-xs px-2 py-0.5">热</Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* 描述 */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                      {article.description}
                    </p>
                    
                    {/* 标签 */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {article.tags.slice(0, 2).map((tag, index) => (
                        <Badge 
                          key={index} 
                          className={`text-xs px-2 py-0.5 ${getTagColor(tag)}`}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    {/* 底部信息 */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-3">
                        {article.isFree && (
                          <span className="bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-0.5 rounded">免费</span>
                        )}
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{article.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{article.comments}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>{article.readTime}</span>
                        <Badge className={`text-xs px-2 py-0.5 ${getDifficultyColor(article.difficulty)}`}>
                          {article.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 空状态 */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">没有找到相关内容</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">试试其他关键词或分类</p>
          </div>
        )}
      </div>
    </div>
  )

  // 条件渲染
  if (isMobile) {
    return <MobileContent />
  }

  return (
    <AnalysisLayout>
      <DesktopContent />
    </AnalysisLayout>
  )
} 