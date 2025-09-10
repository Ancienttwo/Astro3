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
import EnglishLayout from '@/components/EnglishLayout'

export default function YijingWikiPageEN() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const router = useRouter()
  const isMobile = useIsMobile()

  // I Ching categories configuration
  const categories = [
    { id: 'all', name: 'All', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' },
    { id: 'basics', name: 'Basics', color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' },
    { id: 'bagua', name: 'Eight Trigrams', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' },
    { id: 'hexagrams', name: '64 Hexagrams', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300' },
    { id: 'philosophy', name: 'Philosophy', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300' },
    { id: 'divination', name: 'Divination', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300' },
    { id: 'interpretation', name: 'Interpretation', color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' },
    { id: 'practical', name: 'Practical', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' }
  ]

  // I Ching articles content configuration
  const articles = [
    // Basics
    {
      id: 'yijing-intro',
      title: 'What is the I Ching (Book of Changes)?',
      category: 'basics',
      description: 'Introduction to the ancient Chinese divination classic',
      readTime: '10 min',
      views: 4521,
      comments: 287,
      isNew: true,
      isFree: true,
      difficulty: 'Beginner',
      href: '/en/wiki/yijing/intro'
    },
    {
      id: 'yin-yang',
      title: 'Understanding Yin and Yang principles',
      category: 'basics',
      description: 'The fundamental concepts of duality and balance',
      readTime: '8 min',
      views: 3876,
      comments: 234,
      isFree: true,
      difficulty: 'Beginner',
      href: '/en/wiki/yijing/yin-yang'
    },
    
    // Eight Trigrams
    {
      id: 'bagua-intro',
      title: 'What are the Eight Trigrams (Bagua)?',
      category: 'bagua',
      description: 'Introduction to the eight fundamental symbols',
      readTime: '12 min',
      views: 3245,
      comments: 198,
      isHot: true,
      isFree: true,
      difficulty: 'Intermediate',
      href: '/en/wiki/yijing/bagua-intro'
    },
    {
      id: 'trigram-meanings',
      title: 'Meanings of each trigram explained',
      category: 'bagua',
      description: 'Detailed analysis of all eight trigrams and their symbolism',
      readTime: '15 min',
      views: 2987,
      comments: 176,
      isFree: true,
      difficulty: 'Intermediate',
      href: '/en/wiki/yijing/trigram-meanings'
    },
    
    // 64 Hexagrams
    {
      id: 'sixtyfour-hexagrams',
      title: 'The 64 Hexagrams: Complete overview',
      category: 'hexagrams',
      description: 'Comprehensive guide to all 64 hexagrams of the I Ching',
      readTime: '25 min',
      views: 5432,
      comments: 345,
      isHot: true,
      isFree: true,
      difficulty: 'Intermediate',
      href: '/en/wiki/yijing/sixtyfour-gua'
    },
    {
      id: 'hexagram-structure',
      title: 'How to read hexagram structure?',
      category: 'hexagrams',
      description: 'Understanding the composition and meaning of hexagrams',
      readTime: '14 min',
      views: 2654,
      comments: 167,
      isFree: false,
      difficulty: 'Intermediate',
      href: '/en/wiki/yijing/hexagram-structure'
    },
    {
      id: 'changing-lines',
      title: 'What are changing lines in hexagrams?',
      category: 'hexagrams',
      description: 'Understanding dynamic changes in I Ching readings',
      readTime: '16 min',
      views: 2123,
      comments: 145,
      isFree: false,
      difficulty: 'Advanced',
      href: '/en/wiki/yijing/changing-lines'
    },
    
    // Philosophy
    {
      id: 'yijing-philosophy',
      title: 'The philosophical foundations of I Ching',
      category: 'philosophy',
      description: 'Deep exploration of I Ching wisdom and worldview',
      readTime: '20 min',
      views: 1876,
      comments: 134,
      isFree: false,
      difficulty: 'Advanced',
      href: '/en/wiki/yijing/philosophy'
    },
    {
      id: 'change-theory',
      title: 'The theory of constant change',
      category: 'philosophy',
      description: 'Understanding the concept of perpetual transformation',
      readTime: '18 min',
      views: 1654,
      comments: 123,
      isFree: false,
      difficulty: 'Advanced',
      href: '/en/wiki/yijing/change-theory'
    },
    
    // Divination
    {
      id: 'divination-methods',
      title: 'Traditional I Ching divination methods',
      category: 'divination',
      description: 'Coin method, yarrow stalks, and modern approaches',
      readTime: '12 min',
      views: 3456,
      comments: 234,
      isHot: true,
      isFree: true,
      difficulty: 'Beginner',
      href: '/en/wiki/yijing/divination-methods'
    },
    {
      id: 'asking-questions',
      title: 'How to formulate questions for I Ching?',
      category: 'divination',
      description: 'Best practices for consulting the oracle',
      readTime: '10 min',
      views: 2765,
      comments: 187,
      isFree: true,
      difficulty: 'Beginner',
      href: '/en/wiki/yijing/asking-questions'
    },
    
    // Interpretation
    {
      id: 'reading-hexagrams',
      title: 'How to interpret I Ching readings?',
      category: 'interpretation',
      description: 'Step-by-step guide to understanding your hexagram',
      readTime: '22 min',
      views: 4123,
      comments: 298,
      isHot: true,
      isFree: false,
      difficulty: 'Intermediate',
      href: '/en/wiki/yijing/reading-hexagrams'
    },
    {
      id: 'symbolism-guide',
      title: 'Understanding I Ching symbolism',
      category: 'interpretation',
      description: 'Decoding the rich symbolic language of the I Ching',
      readTime: '19 min',
      views: 2234,
      comments: 165,
      isFree: false,
      difficulty: 'Advanced',
      href: '/en/wiki/yijing/symbolism'
    },
    
    // Practical
    {
      id: 'daily-guidance',
      title: 'Using I Ching for daily guidance',
      category: 'practical',
      description: 'Practical applications of I Ching wisdom in daily life',
      readTime: '15 min',
      views: 3210,
      comments: 234,
      isFree: false,
      difficulty: 'Intermediate',
      href: '/en/wiki/yijing/daily-guidance'
    },
    {
      id: 'decision-making',
      title: 'I Ching for decision making',
      category: 'practical',
      description: 'Using ancient wisdom for modern choices',
      readTime: '17 min',
      views: 2987,
      comments: 198,
      isFree: false,
      difficulty: 'Intermediate',
      href: '/en/wiki/yijing/decision-making'
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">I Ching</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Book of Changes</p>
            </div>
          </div>
          <div className="text-2xl">☯️</div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search I Ching knowledge..."
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
            <div className="text-4xl mb-4">☯️</div>
            <p className="text-gray-500 dark:text-gray-400">No articles found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your search or category</p>
          </div>
        )}
      </div>
    </MobileAppLayout>
  )

  const DesktopContent = () => (
    <EnglishLayout>
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">I Ching Encyclopedia</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                The Book of Changes - Ancient Chinese Wisdom
              </p>
            </div>
          </div>
          <div className="text-4xl">☯️</div>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search I Ching knowledge and wisdom..."
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
            <div className="text-6xl mb-6">☯️</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No articles found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search terms or selecting a different category</p>
          </div>
        )}
      </div>
    </EnglishLayout>
  )

  return isMobile ? <MobileContent /> : <DesktopContent />
} 