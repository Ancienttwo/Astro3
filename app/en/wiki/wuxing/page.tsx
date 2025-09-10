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
  MessageCircle,
  Palette
} from 'lucide-react'
import { useIsMobile } from '@/hooks/useDeviceType'
import MobileAppLayout, { MobileCard } from '@/components/MobileAppLayout'
import EnglishLayout from '@/components/EnglishLayout'

export default function WuxingWikiPageEN() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const router = useRouter()
  const isMobile = useIsMobile()

  // Five Elements categories configuration
  const categories = [
    { id: 'all', name: 'All', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' },
    { id: 'basics', name: 'Basics', color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' },
    { id: 'elements', name: 'Five Elements', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' },
    { id: 'cycles', name: 'Cycles', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300' },
    { id: 'correspondences', name: 'Correspondences', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300' },
    { id: 'health', name: 'Health & Medicine', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300' },
    { id: 'feng-shui', name: 'Feng Shui', color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' },
    { id: 'practical', name: 'Practical', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' }
  ]

      // Five Elements articles content configuration
  const articles = [
    // Basics
    {
      id: 'wuxing-intro',
      title: 'What are the Five Elements (Wu Xing)?',
      category: 'basics',
      description: 'Complete introduction to Wu Xing - the cornerstone of traditional Chinese philosophy',
      readTime: '18 min',
      views: 5421,
      comments: 324,
      isNew: true,
      isHot: true,
      isFree: true,
      difficulty: 'Beginner',
      href: '/en/wiki/wuxing/intro'
    },
    {
      id: 'wuxing-mathematical-logic',
      title: 'The Mathematical Logic Behind Five Elements',
      category: 'basics',
      description: 'Why Five represents the minimal complete relational system - Mathematical proof using Euler\'s theorem',
      readTime: '20 min',
      views: 8234,
      comments: 567,
      isNew: true,
      isHot: true,
      isFree: true,
      difficulty: 'Advanced',
      href: '/en/wiki/wuxing/mathematical-logic'
    },
    {
      id: 'wuxing-history',
      title: 'Historical Development of Five Elements Theory',
      category: 'basics',
      description: 'Journey from ancient materials to cosmic philosophy - key figures, dynasties, and evolution',
      readTime: '25 min',
      views: 3276,
      comments: 198,
      isHot: true,
      isFree: true,
      difficulty: 'Intermediate',
      href: '/en/wiki/wuxing/history'
    },
    
    // Five Elements
    {
      id: 'wood-element',
      title: 'Wood Element: Growth and Creativity',
      category: 'elements',
      description: 'Complete guide to Wood energy - from seed to maturity, growth cycles, and creative expression',
      readTime: '20 min',
      views: 2987,
      comments: 176,
      isNew: true,
      isHot: true,
      isFree: true,
      difficulty: 'Beginner',
      href: '/en/wiki/wuxing/wood'
    },
    {
      id: 'fire-element',
      title: 'Fire Element: The Pinnacle of Energy and Transformation',
      category: 'elements',
      description: 'Complete guide to Fire energy - from midday sun to peak consciousness, transformation power, and balanced vitality',
      readTime: '22 min',
      views: 2654,
      comments: 167,
      isNew: true,
      isHot: true,
      isFree: true,
      difficulty: 'Beginner',
      href: '/en/wiki/wuxing/fire'
    },
    {
      id: 'earth-element',
      title: 'Earth Element: The Great Stabilizer and Nourisher',
      category: 'elements',
      description: 'Complete guide to Earth energy - from fertile ground to grounding stability, nourishment power, and balanced empathy',
      readTime: '24 min',
      views: 2432,
      comments: 154,
      isNew: true,
      isHot: true,
      isFree: true,
      difficulty: 'Beginner',
      href: '/en/wiki/wuxing/earth'
    },
    {
      id: 'metal-element',
      title: 'Metal Element: Structure, Precision, and Refinement',
      category: 'elements',
      description: 'Complete guide to Metal energy - from alchemist\'s forge to autumn clarity, structural integrity, and precision mastery',
      readTime: '26 min',
      views: 2123,
      comments: 145,
      isNew: true,
      isHot: true,
      isFree: true,
      difficulty: 'Beginner',
      href: '/en/wiki/wuxing/metal'
    },
    {
      id: 'water-element',
      title: 'Water Element: Flow, Adaptability, and Deep Wisdom',
      category: 'elements',
      description: 'Complete guide to Water energy - from ocean depths to winter stillness, yielding strength, and effortless adaptation',
      readTime: '28 min',
      views: 2876,
      comments: 189,
      isNew: true,
      isHot: true,
      isFree: true,
      difficulty: 'Beginner',
      href: '/en/wiki/wuxing/water'
    },
    
    // Cycles
    {
      id: 'wuxing-shengke',
      title: 'Five Elements Generation & Destruction Cycles',
      category: 'cycles',
      description: 'Complete guide to Wu Xing cycles - how elements support and control each other',
      readTime: '15 min',
      views: 4123,
      comments: 234,
      isHot: true,
      isFree: true,
      difficulty: 'Beginner',
      href: '/en/wiki/wuxing/wuxing-shengke'
    },
    {
      id: 'balance-dynamics',
      title: 'Five Elements Balance Dynamics',
      category: 'cycles',
      description: 'Understanding the dynamic self-regulating system that governs the flow and balance of energy through Sheng and Ke cycles',
      readTime: '25 min',
      views: 3876,
      comments: 298,
      isNew: true,
      isHot: true,
      isFree: true,
      difficulty: 'Advanced',
      href: '/en/wiki/wuxing/balance'
    },
    {
      id: 'generating-cycle',
      title: 'The Generating Cycle (Sheng Cycle)',
      category: 'cycles',
      description: 'How the Five Elements support and nourish each other',
      readTime: '12 min',
      views: 4123,
      comments: 287,
      isHot: true,
      isFree: true,
      difficulty: 'Intermediate',
      href: '/en/wiki/wuxing/generating-cycle'
    },
    {
      id: 'overcoming-cycle',
      title: 'The Overcoming Cycle (Ke Cycle)',
      category: 'cycles',
      description: 'Understanding how elements control and restrain each other',
      readTime: '12 min',
      views: 3654,
      comments: 234,
      isFree: true,
      difficulty: 'Intermediate',
      href: '/en/wiki/wuxing/overcoming-cycle'
    },
    {
      id: 'cycles-balance',
      title: 'Achieving balance through Five Elements cycles',
      category: 'cycles',
      description: 'How to use generating and overcoming cycles for harmony',
      readTime: '15 min',
      views: 2987,
      comments: 198,
      isFree: false,
      difficulty: 'Advanced',
      href: '/en/wiki/wuxing/balance'
    },
    
    // Correspondences
    {
      id: 'element-correspondences',
      title: 'Five Elements correspondences table',
      category: 'correspondences',
      description: 'Complete guide to colors, directions, seasons, organs, and more',
      readTime: '18 min',
      views: 5234,
      comments: 345,
      isHot: true,
      isFree: true,
      difficulty: 'Intermediate',
      href: '/en/wiki/wuxing/correspondences'
    },
    {
      id: 'emotions-elements',
      title: 'Five Elements and Emotions',
      category: 'correspondences',
      description: 'Complete guide to emotional landscapes - how each element governs specific emotions and their mind-body connections',
      readTime: '16 min',
      views: 3542,
      comments: 298,
      isNew: true,
      isHot: true,
      isFree: true,
      difficulty: 'Intermediate',
      href: '/en/wiki/wuxing/emotions'
    },
    {
      id: 'seasonal-elements',
      title: 'Five Elements and the seasons',
      category: 'correspondences',
      description: 'How each element relates to seasonal energies',
      readTime: '10 min',
      views: 2765,
      comments: 176,
      isFree: true,
      difficulty: 'Beginner',
      href: '/en/wiki/wuxing/seasons'
    },
    
    // Health & Medicine
    {
      id: 'tcm-five-elements',
      title: 'Five Elements in Traditional Chinese Medicine',
      category: 'health',
      description: 'Complete TCM framework - physiology, pathology, diagnosis, and treatment through Five Elements theory',
      readTime: '25 min',
      views: 3876,
      comments: 287,
      isNew: true,
      isHot: true,
      isFree: true,
      difficulty: 'Advanced',
      href: '/en/wiki/wuxing/tcm'
    },
    {
      id: 'emotional-elements',
      title: 'Emotions and the Five Elements',
      category: 'health',
      description: 'Understanding emotional patterns through Five Elements theory',
      readTime: '14 min',
      views: 3245,
      comments: 234,
      isHot: true,
      isFree: false,
      difficulty: 'Intermediate',
      href: '/en/wiki/wuxing/emotions'
    },
    
    // Feng Shui
    {
      id: 'feng-shui-elements',
      title: 'Five Elements in Feng Shui practice',
      category: 'feng-shui',
      description: 'Using Five Elements to harmonize living spaces',
      readTime: '16 min',
      views: 4321,
      comments: 298,
      isHot: true,
      isFree: false,
      difficulty: 'Intermediate',
      href: '/en/wiki/wuxing/feng-shui'
    },
    {
      id: 'color-therapy',
      title: 'Five Elements Color Therapy',
      category: 'practical',
      description: 'Harness the power of color to balance your energy and support emotional well-being through Five Elements wisdom',
      readTime: '18 min',
      views: 3421,
      comments: 267,
      isNew: true,
      isHot: true,
      isFree: true,
      difficulty: 'Beginner',
      href: '/en/wiki/wuxing/colors'
    },
    
    // Practical
    {
      id: 'personality-assessment',
      title: 'Five Elements Personality Types',
      category: 'practical',
      description: 'Discover your constitutional element and understand how it shapes your personality, emotional responses, and interactions with the world',
      readTime: '22 min',
      views: 4287,
      comments: 321,
      isNew: true,
      isHot: true,
      isFree: true,
      difficulty: 'Beginner',
      href: '/en/wiki/wuxing/personality'
    },
    {
      id: 'daily-application',
      title: 'Applying Five Elements in daily life',
      category: 'practical',
      description: 'Practical ways to use Five Elements wisdom',
      readTime: '15 min',
      views: 2876,
      comments: 198,
      isFree: false,
      difficulty: 'Beginner',
      href: '/en/wiki/wuxing/daily-life'
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Five Elements</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Wu Xing Theory</p>
            </div>
          </div>
          <div className="text-2xl">🌟</div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search Five Elements knowledge..."
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
            <div className="text-4xl mb-4">🌟</div>
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Five Elements Encyclopedia</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Wu Xing - The Foundation of Chinese Philosophy
              </p>
            </div>
          </div>
          <div className="text-4xl">🌟</div>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search Five Elements knowledge and wisdom..."
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
            <div className="text-6xl mb-6">🌟</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No articles found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search terms or selecting a different category</p>
          </div>
        )}
      </div>
    </EnglishLayout>
  )

  return isMobile ? <MobileContent /> : <DesktopContent />
} 