'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
export default function JapaneseWikiPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTag, setActiveTag] = useState('all')
  const router = useRouter()

  // 知識カテゴリ設定 - 日本語版
  const categories = [
    {
      id: 'bazi',
      name: '八字基礎',
      description: '天干地支、五行理論',
      icon: Star,
      color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
      articles: [
        { title: '八字とは？八字はどのように機能するのか？', readTime: '15分', href: '/ja/wiki/bazi/intro' },
        { title: '十天干は何を意味するのか？', readTime: '10分', href: '/ja/wiki/bazi/tiangan-meaning' },
        { title: '十二地支の特徴は？', readTime: '8分', href: '/ja/wiki/bazi/dizhi-meaning' },
        { title: '十神とは？十神はどのように計算するのか？', readTime: '15分', href: '/ja/wiki/bazi/shishen-intro' }
      ]
    },
    {
      id: 'ziwei',
      name: '紫微斗数',
      description: '星曜宮位、四化理論',
      icon: Compass,
      color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
      articles: [
        { title: '紫微十四主星詳解', readTime: '10分', href: '/ja/wiki/ziwei-stars' },
        { title: '紫微斗数基礎入門', readTime: '8分', href: '/ja/wiki/ziwei/intro' },
        { title: '四化飛星技法', readTime: '12分', href: '/ja/wiki/ziwei/sihua' }
      ]
    },
    {
      id: 'wuxing',
      name: '五行理論',
      description: '生克制化、均衡調和',
      icon: Target,
      color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
      articles: [
        { title: '五行理論完全版', readTime: '20分', href: '/ja/wiki/wuxing' },
        { title: '五行と健康', readTime: '7分', href: '/ja/wiki/wuxing/health' },
        { title: '五行色彩と風水', readTime: '5分', href: '/ja/wiki/wuxing/color' }
      ]
    },
    {
      id: 'yijing',
      name: '易経智慧',
      description: '周易智慧、卦象解析',
      icon: Circle,
      color: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
      articles: [
        { title: '易経智慧入門ガイド', readTime: '12分', href: '/ja/wiki/yijing' },
        { title: '六十四卦詳解', readTime: '30分', href: '/ja/wiki/yijing/sixtyfour-gua' },
        { title: '卦象占卜入門', readTime: '8分', href: '/ja/wiki/yijing/divination' }
      ]
    },
    {
      id: 'comparison',
      name: '流派比較',
      description: '異なる流派・理論比較',
      icon: Sparkles,
      color: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
      articles: [
        { title: '紫微斗数と八字の違い', readTime: '12分', href: '/ja/wiki/ziwei-vs-bazi' },
        { title: '古代と現代占星術の比較', readTime: '8分', href: '/ja/wiki/comparison/ancient-modern' },
        { title: '南派北派の差異分析', readTime: '9分', href: '/ja/wiki/comparison/schools' }
      ]
    }
  ]

  // タグシステム - 日本語版
  const tags = [
    { id: 'all', name: 'すべて', color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' },
    { id: 'relationships', name: '恋愛結婚', color: 'bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400' },
    { id: 'career', name: '事業財運', color: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400' },
    { id: 'health', name: '健康養生', color: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' },
    { id: 'study', name: '学業試験', color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' },
    { id: 'family', name: '家庭関係', color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' }
  ]

  // 人気記事データ - 日本語版
  const hotArticles = [
    {
      id: 1,
      title: '十天干は何を意味するのか？',
      category: '八字基礎',
      categoryColor: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
      readTime: '10分',
      views: 3421,
      tags: ['事業財運', '恋愛結婚'],
      href: '/ja/wiki/bazi/tiangan-meaning'
    },
    {
      id: 2,
      title: '十神とは？十神はどのように計算するのか？',
      category: '八字基礎',
      categoryColor: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
      readTime: '15分',
      views: 2876,
      tags: ['事業財運', '家庭関係'],
      href: '/ja/wiki/bazi/shishen-intro'
    },
    {
      id: 3,
      title: '紫微斗数と八字の違い',
      category: '流派比較',
      categoryColor: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
      readTime: '12分',
      views: 2654,
      tags: ['学業試験'],
      href: '/ja/wiki/ziwei-vs-bazi'
    },
    {
      id: 4,
      title: '十二地支の特徴は？',
      category: '八字基礎',
      categoryColor: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
      readTime: '8分',
      views: 2341,
      tags: ['健康養生', '恋愛結婚'],
      href: '/ja/wiki/bazi/dizhi-meaning'
    }
  ]

  const handleCategoryClick = (categoryId: string) => {
    switch(categoryId) {
      case 'bazi':
        router.push('/ja/wiki/bazi')
        break
      case 'ziwei':
        router.push('/ja/wiki/ziwei')
        break
      case 'wuxing':
        router.push('/ja/wiki/wuxing')
        break
      case 'yijing':
        router.push('/ja/wiki/yijing')
        break
      case 'comparison':
        router.push('/ja/wiki/ziwei-vs-bazi')
        break
      default:
        router.push(`/ja/wiki/${categoryId}`)
    }
  }

  const handleArticleClick = (articlePath: string) => {
    router.push(articlePath)
  }

  const handleTagClick = (tagId: string) => {
    setActiveTag(tagId)
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log('Search for:', searchQuery)
    }
  }

  const filteredHotArticles = hotArticles.filter(article => 
    activeTag === 'all' || article.tags.some(tag => tag.includes(activeTag.replace('relationships', '恋愛結婚').replace('career', '事業財運').replace('health', '健康養生').replace('study', '学業試験').replace('family', '家庭関係')))
  )

  const getTagColor = (tagName: string) => {
    const tag = tags.find(t => t.name === tagName)
    return tag ? tag.color : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        {/* ページヘッダー */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                知識ベース
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                命理学知識の宝庫
              </p>
              
              {/* 検索バー */}
              <div className="mt-8 max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="知識ベースを検索..."
                    className="pl-10 pr-4 py-3 w-full border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* メインコンテンツ */}
            <div className="lg:col-span-2">
              {/* カテゴリグリッド */}
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

            {/* サイドバー */}
            <div className="space-y-6">
              {/* 人気記事 */}
              <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                    <TrendingUp className="w-5 h-5 text-red-500" />
                    <span>人気記事</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* タグフィルター */}
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
                  
                  {/* 記事リスト */}
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
  )
}