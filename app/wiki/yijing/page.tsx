'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Search,
  BookOpen,
  Circle,
  Eye,
  MessageCircle
} from 'lucide-react'
import { useIsMobile } from '@/hooks/useDeviceType'
import MobileAppLayout, { MobileCard } from '@/components/MobileAppLayout'
import AnalysisLayout from '@/components/AnalysisLayout'

export default function YijingWikiPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const router = useRouter()
  const isMobile = useIsMobile()

  // 易经分类标签
  const categories = [
    { id: 'all', name: '全部', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' },
    { id: 'basics', name: '基础', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300' },
    { id: 'bagua', name: '八卦', color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' },
    { id: 'liushisigua', name: '六十四卦', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300' },
    { id: 'yichuan', name: '易传', color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' },
    { id: 'divination', name: '占卜', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' },
    { id: 'philosophy', name: '哲学', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300' },
    { id: 'practical', name: '实用', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300' }
  ]

  // 易经文章内容
  const articles = [
    // 基础类
    {
      id: 'yijing-intro',
      title: '什么是易经？易经的核心思想是什么？',
      category: 'basics',
      description: '了解易经的基本概念和核心哲学思想',
      readTime: '8分钟',
      views: 4567,
      comments: 234,
      isNew: true,
      isFree: true,
      difficulty: '入门',
      tags: ['易经基础', '核心思想'],
      href: '/wiki/yijing/intro'
    },
    {
      id: 'yinyang-theory',
      title: '阴阳理论是怎么来的？',
      category: 'basics',
      description: '阴阳理论的起源和基本概念',
      readTime: '6分钟',
      views: 3456,
      comments: 189,
      isFree: true,
      difficulty: '入门',
      tags: ['阴阳理论', '太极'],
      href: '/wiki/yijing/yinyang'
    },
    
    // 八卦类
    {
      id: 'bagua-basics',
      title: '八卦是什么？八卦怎么记？',
      category: 'bagua',
      description: '乾坤震巽坎离艮兑八卦的含义',
      readTime: '12分钟',
      views: 5678,
      comments: 345,
      isHot: true,
      isFree: true,
      difficulty: '入门',
      tags: ['八卦基础', '记忆方法'],
      href: '/wiki/yijing/bagua-basics'
    },
    {
      id: 'bagua-attributes',
      title: '八卦的五行属性和象征意义？',
      category: 'bagua',
      description: '八卦与五行、方位、家庭成员的对应',
      readTime: '15分钟',
      views: 3789,
      comments: 267,
      isFree: true,
      difficulty: '进阶',
      tags: ['八卦属性', '象征意义'],
      href: '/wiki/yijing/bagua-attributes'
    },
    {
      id: 'bagua-combinations',
      title: '八卦如何相互组合？',
      category: 'bagua',
      description: '八卦重叠组合成六十四卦的原理',
      readTime: '18分钟',
      views: 2345,
      comments: 156,
      isFree: false,
      difficulty: '进阶',
      tags: ['八卦组合', '重卦原理'],
      href: '/wiki/yijing/bagua-combinations'
    },
    
    // 六十四卦类
    {
      id: 'sixtyfour-gua',
      title: '六十四卦索引 - 完整卦象一览',
      category: 'liushisigua',
      description: '8×8网格展示所有64卦，点击查看详细解释',
      readTime: '浏览模式',
      views: 2876,
      comments: 178,
      isNew: true,
      isFree: true,
      difficulty: '入门',
      tags: ['六十四卦', '卦象索引', '互动查看'],
      href: '/wiki/yijing/sixtyfour-gua'
    },
    {
      id: 'gua-structure',
      title: '卦的结构是怎样的？',
      category: 'liushisigua',
      description: '卦辞、爻辞、彖辞、象辞的含义',
      readTime: '20分钟',
      views: 1987,
      comments: 134,
      isFree: false,
      difficulty: '进阶',
      tags: ['卦辞爻辞', '卦象结构'],
      href: '/wiki/yijing/gua-structure'
    },
    {
      id: 'famous-gua',
      title: '有哪些著名的卦象？',
      category: 'liushisigua',
      description: '乾卦、坤卦、屯卦等经典卦象详解',
      readTime: '25分钟',
      views: 3456,
      comments: 223,
      isHot: true,
      isFree: true,
      difficulty: '进阶',
      tags: ['经典卦象', '卦象详解'],
      href: '/wiki/yijing/famous-gua'
    },
    
    // 易传类
    {
      id: 'yichuan-intro',
      title: '易传十翼是什么？',
      category: 'yichuan',
      description: '易传十翼的组成和主要内容',
      readTime: '15分钟',
      views: 2654,
      comments: 167,
      isFree: true,
      difficulty: '进阶',
      tags: ['易传十翼', '经典注释'],
      href: '/wiki/yijing/yichuan-intro'
    },
    {
      id: 'xici-zhuan',
      title: '系辞传讲了什么？',
      category: 'yichuan',
      description: '系辞传的哲学思想和重要观点',
      readTime: '22分钟',
      views: 1876,
      comments: 145,
      isFree: false,
      difficulty: '高级',
      tags: ['系辞传', '哲学思想'],
      href: '/wiki/yijing/xici-zhuan'
    },
    
    // 占卜类
    {
      id: 'divination-methods',
      title: '易经占卜有哪些方法？',
      category: 'divination',
      description: '蓍草占卜、铜钱占卜等传统方法',
      readTime: '18分钟',
      views: 4321,
      comments: 289,
      isHot: true,
      isFree: true,
      difficulty: '进阶',
      tags: ['占卜方法', '蓍草铜钱'],
      href: '/wiki/yijing/divination-methods'
    },
    {
      id: 'divination-practice',
      title: '如何进行易经占卜？',
      category: 'divination',
      description: '占卜的具体步骤和注意事项',
      readTime: '16分钟',
      views: 3789,
      comments: 234,
      isFree: false,
      difficulty: '进阶',
      tags: ['占卜实践', '操作步骤'],
      href: '/wiki/yijing/divination-practice'
    },
    {
      id: 'divination-interpretation',
      title: '占卜结果如何解读？',
      category: 'divination',
      description: '卦象解读的方法和技巧',
      readTime: '20分钟',
      views: 2987,
      comments: 178,
      isFree: false,
      difficulty: '高级',
      tags: ['卦象解读', '占卜解释'],
      href: '/wiki/yijing/divination-interpretation'
    },
    
    // 哲学类
    {
      id: 'yijing-philosophy',
      title: '易经的哲学智慧有哪些？',
      category: 'philosophy',
      description: '易经中蕴含的人生哲学和智慧',
      readTime: '25分钟',
      views: 2345,
      comments: 156,
      isFree: true,
      difficulty: '进阶',
      tags: ['哲学智慧', '人生感悟'],
      href: '/wiki/yijing/philosophy'
    },
    {
      id: 'change-theory',
      title: '易经的变化理论是什么？',
      category: 'philosophy',
      description: '变易、不易、简易的哲学内涵',
      readTime: '18分钟',
      views: 1876,
      comments: 134,
      isFree: false,
      difficulty: '高级',
      tags: ['变化理论', '三易'],
      href: '/wiki/yijing/change-theory'
    },
    
    // 实用类
    {
      id: 'business-yijing',
      title: '易经智慧如何应用于商业？',
      category: 'practical',
      description: '易经在商业决策中的应用',
      readTime: '20分钟',
      views: 3456,
      comments: 223,
      isHot: true,
      isFree: true,
      difficulty: '进阶',
      tags: ['事业财运', '商业应用'],
      href: '/wiki/yijing/business'
    },
    {
      id: 'life-guidance',
      title: '易经如何指导人生选择？',
      category: 'practical',
      description: '用易经智慧处理人生重大决策',
      readTime: '22分钟',
      views: 4567,
      comments: 289,
      isFree: true,
      difficulty: '进阶',
      tags: ['人生指导', '决策智慧'],
      href: '/wiki/yijing/life-guidance'
    },
    {
      id: 'relationship-yijing',
      title: '易经如何看待人际关系？',
      category: 'practical',
      description: '易经中的人际关系智慧',
      readTime: '16分钟',
      views: 2876,
      comments: 178,
      isFree: false,
      difficulty: '进阶',
      tags: ['桃花姻缘', '人际关系'],
      href: '/wiki/yijing/relationship'
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
    if (tag.includes('桃花') || tag.includes('感情') || tag.includes('人际')) {
      return 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300'
    }
    if (tag.includes('事业') || tag.includes('财运') || tag.includes('商业')) {
      return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300'
    }
    return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
  }

  // 移动端内容
  const MobileContent = () => (
    <MobileAppLayout title="易经智慧">
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="p-4 space-y-6">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="我该如何做决策？点搜索看看"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 focus:border-purple-300 focus:ring-purple-200 text-sm dark:text-white"
            />
          </div>

          {/* 分类介绍 */}
          <MobileCard className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900 dark:to-red-900 border-orange-200 dark:border-orange-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center">
                <Circle className="w-5 h-5 text-orange-600 dark:text-orange-300" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-orange-800 dark:text-orange-200">易经智慧</h3>
                <p className="text-sm text-orange-600 dark:text-orange-300 mt-1">
                  探索古老的易经智慧，学习变化的哲学
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
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-800 dark:to-red-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-orange-600 dark:text-orange-300" />
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
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 border-orange-200 dark:border-orange-700">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center">
              <Circle className="w-6 h-6 text-orange-600 dark:text-orange-300" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-orange-800 dark:text-orange-200">易经智慧</h1>
              <p className="text-orange-600 dark:text-orange-300 mt-2">
                探索古老的易经智慧，学习变化的哲学
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
            placeholder="我该如何做决策？点搜索看看"
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
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-800 dark:to-red-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-orange-600 dark:text-orange-300" />
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