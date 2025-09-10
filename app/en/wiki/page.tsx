'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  Calendar,
  Zap,
  Heart,
  Users,
  Target,
  Circle,
  Sparkles,
  Construction
} from 'lucide-react'
import SmartLayout from '@/components/SmartLayout'

export default function EnglishWikiPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTag, setActiveTag] = useState('all')
  const router = useRouter()

  // Knowledge categories configuration - English version
  const categories = [
    {
      id: 'bazi',
      name: 'BaZi Basics',
      description: 'Heavenly Stems & Earthly Branches, Five Elements',
      icon: Star,
      color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
      articles: [
        { title: 'What is BaZi? How does BaZi work?', readTime: '15 minutes', href: '/en/wiki/bazi/intro' },
        { title: 'What do the Ten Heavenly Stems represent?', readTime: '10 minutes', href: '/en/wiki/bazi/tiangan-meaning' },
        { title: 'What are the characteristics of the Twelve Earthly Branches?', readTime: '8 minutes', href: '/en/wiki/bazi/dizhi-meaning' },
        { title: 'What are the Ten Gods? How to calculate the Ten Gods?', readTime: '15 minutes', href: '/en/wiki/bazi/shishen-intro' }
      ]
    },
    {
      id: 'ziwei',
      name: 'ZiWei Astrology',
      description: 'Stars and Palaces, Four Transformations',
      icon: Compass,
      color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
      articles: [
        { title: 'Detailed Analysis of ZiWei Fourteen Main Stars', readTime: '10 minutes', href: '/en/wiki/ziwei-stars' },
        { title: 'Basic Introduction to ZiWei Astrology', readTime: '8 minutes', href: '/en/wiki/ziwei/intro' },
        { title: 'Four Transformations Flying Star Techniques', readTime: '12 minutes', href: '/en/wiki/ziwei/sihua' }
      ]
    },
    {
      id: 'wuxing',
      name: 'Five Elements Theory',
      description: 'Generation and Restraint, Balance and Harmony',
      icon: Target,
      color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
      articles: [
        { title: 'Complete Five Elements Theory', readTime: '20 minutes', href: '/en/wiki/wuxing' },
        { title: 'Five Elements and Health', readTime: '7 minutes', href: '/en/wiki/wuxing/health' },
        { title: 'Five Elements Color and Feng Shui', readTime: '5 minutes', href: '/en/wiki/wuxing/color' }
      ]
    },
    {
      id: 'yijing',
      name: 'I Ching Wisdom',
      description: 'I Ching Wisdom, Hexagram Analysis',
      icon: Circle,
      color: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
      articles: [
        { title: 'I Ching Wisdom Introduction Guide', readTime: '12 minutes', href: '/en/wiki/yijing' },
        { title: 'Detailed Analysis of Sixty-Four Hexagrams', readTime: '30 minutes', href: '/en/wiki/yijing/sixtyfour-gua' },
        { title: 'Introduction to Hexagram Divination', readTime: '8 minutes', href: '/en/wiki/yijing/divination' }
      ]
    },
    {
      id: 'comparison',
      name: 'School Comparison',
      description: 'Different schools and theoretical comparisons',
      icon: Sparkles,
      color: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
      articles: [
        { title: 'Differences between ZiWei Astrology and BaZi', readTime: '12 minutes', href: '/en/wiki/ziwei-vs-bazi' },
        { title: 'Comparison of Ancient and Modern Astrology', readTime: '8 minutes', href: '/en/wiki/comparison/ancient-modern' },
        { title: 'Analysis of Southern and Northern School Differences', readTime: '9 minutes', href: '/en/wiki/comparison/schools' }
      ]
    }
  ]

  // Tag system - English version
  const tags = [
    { id: 'all', name: 'All', color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' },
    { id: 'relationships', name: 'Relationships', color: 'bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400' },
    { id: 'career', name: 'Career & Finance', color: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400' },
    { id: 'health', name: 'Health & Wellness', color: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' },
    { id: 'study', name: 'Study & Exams', color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' },
    { id: 'family', name: 'Family Relations', color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' }
  ]

  // Hot articles data - English version
  const hotArticles = [
    {
      id: 1,
      title: 'What do the Ten Heavenly Stems represent?',
      category: 'BaZi Basics',
      categoryColor: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
      readTime: '10 minutes',
      views: 3421,
      tags: ['Career & Finance', 'Relationships'],
      href: '/en/wiki/bazi/tiangan-meaning'
    },
    {
      id: 2,
      title: 'What are the Ten Gods? How to calculate the Ten Gods?',
      category: 'BaZi Basics',
      categoryColor: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
      readTime: '15 minutes',
      views: 2876,
      tags: ['Career & Finance', 'Family Relations'],
      href: '/en/wiki/bazi/shishen-intro'
    },
    {
      id: 3,
      title: 'Differences between ZiWei Astrology and BaZi',
      category: 'School Comparison',
      categoryColor: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
      readTime: '12 minutes',
      views: 2654,
      tags: ['Study & Exams'],
      href: '/en/wiki/ziwei-vs-bazi'
    },
    {
      id: 4,
      title: 'What are the characteristics of the Twelve Earthly Branches?',
      category: 'BaZi Basics',
      categoryColor: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
      readTime: '8 minutes',
      views: 2341,
      tags: ['Health & Wellness', 'Relationships'],
      href: '/en/wiki/bazi/dizhi-meaning'
    }
  ]

  const handleCategoryClick = (categoryId: string) => {
    switch(categoryId) {
      case 'bazi':
        router.push('/en/wiki/bazi')
        break
      case 'ziwei':
        router.push('/en/wiki/ziwei')
        break
      case 'wuxing':
        router.push('/en/wiki/wuxing')
        break
      case 'yijing':
        router.push('/en/wiki/yijing')
        break
      case 'comparison':
        router.push('/en/wiki/ziwei-vs-bazi')
        break
      default:
        router.push(`/en/wiki/${categoryId}`)
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
    activeTag === 'all' || article.tags.some(tag => tag.toLowerCase().includes(activeTag))
  )

  const getTagColor = (tagName: string) => {
    const tag = tags.find(t => t.name === tagName)
    return tag ? tag.color : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
  }

  return (
    <SmartLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        {/* Page Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Knowledge Base
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Astrology knowledge library
              </p>
              
              {/* Search Bar */}
              <div className="mt-8 max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search knowledge base..."
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
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Categories Grid */}
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

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Hot Articles */}
              <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                    <TrendingUp className="w-5 h-5 text-red-500" />
                    <span>Hot Articles</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Tag Filter */}
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
                  
                  {/* Article List */}
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
    </SmartLayout>
  )
} 