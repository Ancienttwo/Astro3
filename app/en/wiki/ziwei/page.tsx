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

export default function ZiweiWikiPageEN() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const router = useRouter()
  const isMobile = useIsMobile()

  // Ziwei categories configuration
  const categories = [
    { id: 'all', name: 'All', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' },
    { id: 'basics', name: 'Basics', color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' },
    { id: 'stars', name: '14 Main Stars', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' },
    { id: 'palaces', name: '12 Palaces', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300' },
    { id: 'sihua', name: 'Four Transformations', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300' },
    { id: 'patterns', name: 'Star Patterns', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300' },
    { id: 'timing', name: 'Timing Analysis', color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' },
    { id: 'interpretation', name: 'Interpretation', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300' },
    { id: 'practical', name: 'Practical', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' }
  ]

  // Ziwei articles content configuration
  const articles = [
    // Basics
    {
      id: 'ziwei-intro',
      title: 'What is Ziwei Dou Shu? How did it originate?',
      category: 'basics',
      description: 'Understanding the basic concepts and historical origins of Ziwei Dou Shu',
      readTime: '8 min',
      views: 3245,
      comments: 198,
      isNew: true,
      isFree: true,
      difficulty: 'Beginner',
      href: '/en/wiki/ziwei/intro'
    },
    {
      id: 'chart-creation',
      title: 'How to create a Ziwei natal chart?',
      category: 'basics',
      description: 'Step-by-step guide to creating your Ziwei birth chart',
      readTime: '12 min',
      views: 2876,
      comments: 156,
      isFree: true,
      difficulty: 'Beginner',
      href: '/en/wiki/ziwei/chart-creation'
    },
    
    // 14 Main Stars
    {
      id: 'fourteen-stars',
      title: 'What are the 14 Main Stars in Ziwei Dou Shu?',
      category: 'stars',
      description: 'Comprehensive guide to the 14 primary stars and their meanings',
      readTime: '20 min',
      views: 4521,
      comments: 287,
      isHot: true,
      isFree: true,
      difficulty: 'Intermediate',
      href: '/en/wiki/ziwei/fourteen-stars'
    },
    {
      id: 'ziwei-star',
      title: 'The Emperor Star: Ziwei and its significance',
      category: 'stars',
      description: 'Deep dive into the Ziwei star and its royal characteristics',
      readTime: '15 min',
      views: 2654,
      comments: 178,
      isFree: false,
      difficulty: 'Intermediate',
      href: '/en/wiki/ziwei/ziwei-star'
    },
    {
      id: 'tianfu-star',
      title: 'Tianfu Star: The Southern Emperor',
      category: 'stars',
      description: 'Understanding Tianfu star and its complementary role to Ziwei',
      readTime: '12 min',
      views: 1987,
      comments: 145,
      isFree: false,
      difficulty: 'Intermediate',
      href: '/en/wiki/ziwei/tianfu-star'
    },
    
    // 12 Palaces
    {
      id: 'twelve-palaces',
      title: 'What are the 12 Palaces in Ziwei charts?',
      category: 'palaces',
      description: 'Complete overview of the 12 life palaces and their meanings',
      readTime: '18 min',
      views: 3890,
      comments: 234,
      isHot: true,
      isFree: true,
      difficulty: 'Intermediate',
      href: '/en/wiki/ziwei/twelve-palaces'
    },
    {
      id: 'ming-palace',
      title: 'Life Palace (Ming): Your core personality',
      category: 'palaces',
      description: 'Understanding the most important palace in Ziwei astrology',
      readTime: '10 min',
      views: 2432,
      comments: 167,
      isFree: true,
      difficulty: 'Beginner',
      href: '/en/wiki/ziwei/ming-palace'
    },
    {
      id: 'career-palace',
      title: 'Career Palace: Your professional destiny',
      category: 'palaces',
      description: 'How to interpret career prospects through the Career Palace',
      readTime: '14 min',
      views: 3123,
      comments: 198,
      isFree: false,
      difficulty: 'Intermediate',
      href: '/en/wiki/ziwei/career-palace'
    },
    
    // Four Transformations
    {
      id: 'four-transformations',
      title: 'The Four Transformations (Si Hua) - Complete Guide',
      category: 'sihua',
      description: 'A-B-C-D system operating across three dimensions: Events, People, Resources',
      readTime: '16 min',
      views: 2765,
      comments: 189,
      isFree: true,
      difficulty: 'Intermediate',
      href: '/en/wiki/ziwei/four-transformations'
    },
    {
      id: 'sihua-analysis',
      title: 'How to analyze Four Transformations in depth?',
      category: 'sihua',
      description: 'Advanced techniques for Si Hua interpretation',
      readTime: '22 min',
      views: 1654,
      comments: 145,
      isFree: false,
      difficulty: 'Advanced',
      href: '/en/wiki/ziwei/sihua-analysis'
    },
    
    // Star Patterns
    {
      id: 'star-combinations',
      title: 'What are important star combinations?',
      category: 'patterns',
      description: 'Key star patterns and their special meanings',
      readTime: '18 min',
      views: 2234,
      comments: 167,
      isFree: false,
      difficulty: 'Advanced',
      href: '/en/wiki/ziwei/star-combinations'
    },
    {
      id: 'lucky-patterns',
      title: 'Auspicious star patterns for success',
      category: 'patterns',
      description: 'Identifying and interpreting fortunate configurations',
      readTime: '15 min',
      views: 2987,
      comments: 198,
      isHot: true,
      isFree: false,
      difficulty: 'Intermediate',
      href: '/en/wiki/ziwei/lucky-patterns'
    },
    
    // Timing Analysis
    {
      id: 'da-xian',
      title: 'What are Major Life Periods (Da Xian)?',
      category: 'timing',
      description: 'Understanding 10-year life cycles in Ziwei astrology',
      readTime: '14 min',
      views: 2134,
      comments: 156,
      isFree: true,
      difficulty: 'Intermediate',
      href: '/en/wiki/ziwei/da-xian'
    },
    {
      id: 'fleeting-years',
      title: 'How to analyze annual fortune?',
      category: 'timing',
      description: 'Yearly fortune analysis using Ziwei methods',
      readTime: '16 min',
      views: 1876,
      comments: 134,
      isFree: false,
      difficulty: 'Advanced',
      href: '/en/wiki/ziwei/fleeting-years'
    },
    
    // Interpretation
    {
      id: 'personality-reading',
      title: 'How to read personality from Ziwei charts?',
      category: 'interpretation',
      description: 'Techniques for character analysis using Ziwei astrology',
      readTime: '20 min',
      views: 3456,
      comments: 245,
      isHot: true,
      isFree: false,
      difficulty: 'Intermediate',
      href: '/en/wiki/ziwei/personality-reading'
    },
    {
      id: 'relationship-compatibility',
      title: 'Ziwei compatibility for relationships',
      category: 'interpretation',
      description: 'Using Ziwei to analyze romantic compatibility',
      readTime: '18 min',
      views: 4123,
      comments: 298,
      isHot: true,
      isFree: false,
      difficulty: 'Advanced',
      href: '/en/wiki/ziwei/relationship-compatibility'
    },
    
    // Practical
    {
      id: 'career-guidance',
      title: 'Career guidance through Ziwei analysis',
      category: 'practical',
      description: 'Practical career advice using Ziwei principles',
      readTime: '17 min',
      views: 2765,
      comments: 189,
      isFree: false,
      difficulty: 'Advanced',
      href: '/en/wiki/ziwei/career-guidance'
    },
    {
      id: 'wealth-analysis',
      title: 'How to analyze wealth potential?',
      category: 'practical',
      description: 'Understanding financial fortune through Ziwei charts',
      readTime: '19 min',
      views: 3210,
      comments: 234,
      isFree: false,
      difficulty: 'Advanced',
      href: '/en/wiki/ziwei/wealth-analysis'
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ziwei Dou Shu</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">The Royal Star System</p>
            </div>
          </div>
          <Star className="w-6 h-6 text-purple-600 dark:text-yellow-400" />
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search Ziwei knowledge..."
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
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ziwei Dou Shu Encyclopedia</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                The Royal Star System of Chinese Astrology
              </p>
            </div>
          </div>
          <Star className="w-8 h-8 text-purple-600 dark:text-yellow-400" />
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search Ziwei Dou Shu knowledge and articles..."
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
            <Star className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No articles found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search terms or selecting a different category</p>
          </div>
        )}
      </div>
    </EnglishLayout>
  )

  return isMobile ? <MobileContent /> : <DesktopContent />
} 