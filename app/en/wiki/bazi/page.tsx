'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Search,
  BookOpen,
  Star,
  Clock,
  ChevronRight,
  ArrowLeft,
  Tag,
  TrendingUp,
  Eye,
  MessageCircle
} from 'lucide-react'
import { useIsMobile } from '@/hooks/useDeviceType'
import MobileAppLayout, { MobileCard } from '@/components/MobileAppLayout'
import SmartLayout from '@/components/SmartLayout'

export default function BaziWikiPageEN() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const router = useRouter()
  const isMobile = useIsMobile()

  // BaZi categories configuration
  const categories = [
    { id: 'all', name: 'All', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' },
    { id: 'basics', name: 'Basics', color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' },
    { id: 'tiangan', name: 'Heavenly Stems', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' },
    { id: 'dizhi', name: 'Earthly Branches', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300' },
    { id: 'wuxing', name: 'Five Elements', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300' },
    { id: 'shishen', name: 'Ten Gods', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300' },
    { id: 'dayun', name: 'Luck Periods', color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' },
    { id: 'yongshen', name: 'Useful God', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300' },
    { id: 'geju', name: 'Structures', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300' },
    { id: 'practical', name: 'Practical', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' }
  ]

  // BaZi articles content configuration
  const articles = [
    // Basics
    {
      id: 'bazi-intro',
      title: 'What is BaZi? How did BaZi originate?',
      category: 'basics',
      description: 'Understanding the basic concepts and historical origins of BaZi',
      readTime: '5 min',
      views: 2345,
      comments: 156,
      isNew: true,
      isFree: true,
      difficulty: 'Beginner',
      href: '/en/wiki/bazi/intro'
    },
    {
      id: 'paipan-basics',
      title: 'How to create your own BaZi chart?',
      category: 'basics',
      description: 'Learn the basic methods of BaZi chart creation',
      readTime: '8 min',
      views: 1876,
      comments: 98,
      isFree: true,
      difficulty: 'Beginner',
      href: '/en/wiki/bazi/paipan'
    },
    
    // Heavenly Stems
    {
      id: 'tiangan-meaning',
      title: 'What do the Ten Heavenly Stems represent?',
      category: 'tiangan',
      description: 'Detailed explanation of Jia, Yi, Bing, Ding, Wu, Ji, Geng, Xin, Ren, Gui meanings',
      readTime: '10 min',
      views: 3421,
      comments: 201,
      isHot: true,
      isFree: true,
      difficulty: 'Intermediate',
      href: '/en/wiki/bazi/tiangan-meaning'
    },
    {
      id: 'tiangan-wuxing',
      title: 'How are Heavenly Stems classified by Five Elements?',
      category: 'tiangan',
      description: 'Correspondence between Heavenly Stems and Five Elements',
      readTime: '6 min',
      views: 1654,
      comments: 89,
      isFree: true,
      difficulty: 'Beginner',
      href: '/en/wiki/bazi/tiangan-wuxing'
    },
    
    // Earthly Branches
    {
      id: 'dizhi-meaning',
      title: 'What are the characteristics of the Twelve Earthly Branches?',
      category: 'dizhi',
      description: 'Detailed explanation of Zi, Chou, Yin, Mao, Chen, Si, Wu, Wei, Shen, You, Xu, Hai',
      readTime: '12 min',
      views: 2890,
      comments: 167,
      isHot: true,
      isFree: true,
      difficulty: 'Intermediate',
      href: '/en/wiki/bazi/dizhi-meaning'
    },
    {
      id: 'dizhi-chong',
      title: 'What does Earthly Branch Clash mean?',
      category: 'dizhi',
      description: 'Meaning and effects of the Six Clashes between Earthly Branches',
      readTime: '8 min',
      views: 1432,
      comments: 76,
      isFree: false,
      difficulty: 'Intermediate',
      href: '/en/wiki/bazi/dizhi-chong'
    },
    
    // Five Elements
    {
      id: 'wuxing-shengke',
      title: 'Five Elements Generation & Destruction Cycles',
      category: 'wuxing',
      description: 'Complete guide to Wu Xing cycles - how elements support and control each other',
      readTime: '15 min',
      views: 4123,
      comments: 234,
      isHot: true,
      isFree: true,
      difficulty: 'Beginner',
      href: '/en/wiki/bazi/wuxing-shengke'
    },
    {
      id: 'wuxing-balance',
      title: 'Five Elements Balance in BaZi Analysis',
      category: 'wuxing',
      description: 'Complete guide to determining harmony through Day Master strength assessment - the core of BaZi analysis',
      readTime: '22 min',
      views: 1987,
      comments: 145,
      isNew: true,
      isHot: true,
      isFree: true,
      difficulty: 'Advanced',
      href: '/en/wiki/bazi/wuxing-balance'
    },
    
    // Ten Gods
    {
      id: 'shishen-intro',
      title: 'What Are the Ten Gods?',
      category: 'shishen',
      description: 'Complete guide to symbolic archetypes representing people, psychology, and life domains in BaZi analysis',
      readTime: '18 min',
      views: 2654,
      comments: 178,
      isNew: true,
      isHot: true,
      isFree: true,
      difficulty: 'Intermediate',
      href: '/en/wiki/bazi/shishen-intro'
    },
    {
      id: 'shishen-meaning',
      title: 'What do Peer God, Rival God, Scholar God, Oracle God mean?',
      category: 'shishen',
      description: 'Detailed analysis of Ten Gods meanings using correct dictionary translations',
      readTime: '18 min',
      views: 3567,
      comments: 289,
      isHot: true,
      isFree: false,
      difficulty: 'Advanced',
      href: '/en/wiki/bazi/shishen-meaning'
    },
    
    // Luck Periods
    {
      id: 'dayun-basics',
      title: 'Luck Periods - BaZi Timing System',
      category: 'dayun',
      description: 'Complete guide to 10-year cycles that reveal the timing of your destiny - calculation and interpretation',
      readTime: '16 min',
      views: 2134,
      comments: 156,
      isNew: true,
      isHot: true,
      isFree: true,
      difficulty: 'Intermediate',
      href: '/en/wiki/bazi/dayun-basics'
    },
    {
      id: 'liunian-analysis',
      title: 'How to analyze Annual Influences?',
      category: 'liunian',
      description: 'Methods and techniques for Annual Influences analysis',
      readTime: '20 min',
      views: 1765,
      comments: 98,
      isFree: false,
      difficulty: 'Advanced',
      href: '/en/wiki/bazi/liunian'
    },
    
    // Useful God
    {
      id: 'yongshen-basics',
      title: 'What is the Useful God? How to find it?',
      category: 'yongshen',
      description: 'Basic concepts and identification methods of Useful God',
      readTime: '15 min',
      views: 1543,
      comments: 134,
      isFree: false,
      difficulty: 'Advanced',
      href: '/en/wiki/bazi/yongshen'
    },
    
    // Structures
    {
      id: 'geju-intro',
      title: 'What are BaZi Structures?',
      category: 'geju',
      description: 'Introduction to various BaZi structural patterns',
      readTime: '14 min',
      views: 1876,
      comments: 156,
      isFree: false,
      difficulty: 'Advanced',
      href: '/en/wiki/bazi/geju'
    },
    
    // Practical
    {
      id: 'career-analysis',
      title: 'How to analyze career from BaZi?',
      category: 'practical',
      description: 'Practical methods for career analysis using BaZi',
      readTime: '16 min',
      views: 2345,
      comments: 189,
      isFree: false,
      difficulty: 'Advanced',
      href: '/en/wiki/bazi/career'
    },
    {
      id: 'relationship-analysis',
      title: 'How to see relationships in BaZi?',
      category: 'practical',
      description: 'BaZi analysis for marriage and relationships',
      readTime: '18 min',
      views: 3210,
      comments: 245,
      isHot: true,
      isFree: false,
      difficulty: 'Advanced',
      href: '/en/wiki/bazi/relationships'
    }
  ]

  // Filter articles based on search and category
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300'
      case 'Advanced': return 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const MobileContent = () => (
    <MobileAppLayout>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">BaZi Encyclopedia</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Explore Traditional Chinese Astrology</p>
            </div>
          </div>
          <BookOpen className="w-6 h-6 text-purple-600 dark:text-yellow-400" />
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search BaZi knowledge..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 dark:bg-gray-800 border-none"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category.id)}
              className={`whitespace-nowrap ${
                activeCategory === category.id 
                  ? 'bg-purple-600 dark:bg-yellow-600 text-white dark:text-slate-900' 
                  : 'bg-white dark:bg-gray-800'
              }`}
            >
              <Tag className="w-3 h-3 mr-1" />
              {category.name}
            </Button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <MobileCard key={article.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {article.isNew && (
                      <Badge className="bg-green-500 text-white text-xs px-2 py-0.5">NEW</Badge>
                    )}
                    {article.isHot && (
                      <Badge className="bg-red-500 text-white text-xs px-2 py-0.5 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        HOT
                      </Badge>
                    )}
                    {!article.isFree && (
                      <Badge className="bg-yellow-500 text-white text-xs px-2 py-0.5">
                        <Star className="w-3 h-3 mr-1" />
                        PREMIUM
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 leading-tight">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {article.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {article.views.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {article.comments}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs px-2 py-0.5 ${getDifficultyColor(article.difficulty)}`}>
                    {article.difficulty}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => router.push(article.href)}
                    className="p-1"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </MobileCard>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No articles found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your search or category</p>
          </div>
        )}
      </div>
    </MobileAppLayout>
  )

  const DesktopContent = () => (
    <SmartLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">BaZi Encyclopedia</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Comprehensive guide to Traditional Chinese Astrology
              </p>
            </div>
          </div>
          <BookOpen className="w-8 h-8 text-purple-600 dark:text-yellow-400" />
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search BaZi knowledge and articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-yellow-400"
              />
            </div>
          </div>
          <div className="flex items-center justify-center bg-gradient-to-r from-purple-500 to-blue-500 dark:from-yellow-500 dark:to-orange-500 text-white dark:text-slate-900 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{articles.length}</div>
              <div className="text-sm opacity-90">Articles</div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 ${
                activeCategory === category.id 
                  ? 'bg-purple-600 dark:bg-yellow-600 text-white dark:text-slate-900' 
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Tag className="w-4 h-4" />
              {category.name}
            </Button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow duration-300 group cursor-pointer">
              <CardContent className="p-6" onClick={() => router.push(article.href)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-wrap gap-2">
                    {article.isNew && (
                      <Badge className="bg-green-500 text-white">NEW</Badge>
                    )}
                    {article.isHot && (
                      <Badge className="bg-red-500 text-white flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        HOT
                      </Badge>
                    )}
                    {!article.isFree && (
                      <Badge className="bg-yellow-500 text-white flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        PREMIUM
                      </Badge>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-yellow-400 transition-colors" />
                </div>
                
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-yellow-400 transition-colors leading-tight">
                  {article.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {article.description}
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {article.readTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {article.views.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {article.comments}
                    </div>
                  </div>
                  <Badge className={getDifficultyColor(article.difficulty)}>
                    {article.difficulty}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No articles found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search terms or selecting a different category</p>
          </div>
        )}
      </div>
    </SmartLayout>
  )

  return isMobile ? <MobileContent /> : <DesktopContent />
} 