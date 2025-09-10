'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Search,
  Star,
  Clock,
  ChevronRight,
  ArrowLeft,
  Tag,
  TrendingUp,
  Eye,
  MessageCircle,
  Crown,
  Zap,
  Shield,
  Heart
} from 'lucide-react'
import { useIsMobile } from '@/hooks/useDeviceType'
import MobileAppLayout, { MobileCard } from '@/components/MobileAppLayout'
import EnglishLayout from '@/components/EnglishLayout'

export default function ZiweiStarsPageEN() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const router = useRouter()
  const isMobile = useIsMobile()

  // Ziwei stars categories configuration
  const categories = [
    { id: 'all', name: 'All Stars', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' },
    { id: 'fourteen', name: '14 Main Stars', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' },
    { id: 'northern', name: 'Northern Group', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300' },
    { id: 'southern', name: 'Southern Group', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300' },
    { id: 'auxiliary', name: 'Auxiliary Stars', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300' },
    { id: 'auspicious', name: 'Auspicious Stars', color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' },
    { id: 'inauspicious', name: 'Inauspicious Stars', color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' },
    { id: 'combinations', name: 'Star Combinations', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300' }
  ]

  // Ziwei stars articles content configuration
  const articles = [
    // 14 Main Stars
    {
      id: 'ziwei-star',
      title: 'Ziwei Star (紫微): The Emperor Star',
      category: 'fourteen',
      description: 'The most important star in Ziwei astrology, representing leadership and nobility',
      readTime: '12 min',
      views: 6543,
      comments: 387,
      isHot: true,
      isFree: true,
      difficulty: 'Intermediate',
      href: '/en/wiki/ziwei-stars/ziwei'
    },
    {
      id: 'tianfu-star',
      title: 'Tianfu Star (天府): The Southern Emperor',
      category: 'fourteen',
      description: 'The secondary emperor star, representing stability and wealth',
      readTime: '10 min',
      views: 4321,
      comments: 234,
      isFree: true,
      difficulty: 'Intermediate',
      href: '/en/wiki/ziwei-stars/tianfu'
    },
    {
      id: 'taiyang-star',
      title: 'Taiyang Star (太阳): The Sun Star',
      category: 'fourteen',
      description: 'Representing vitality, brightness, and masculine energy',
      readTime: '8 min',
      views: 3876,
      comments: 198,
      isFree: true,
      difficulty: 'Beginner',
      href: '/en/wiki/ziwei-stars/taiyang'
    },
    {
      id: 'wuqu-star',
      title: 'Wuqu Star (武曲): The Military Star',
      category: 'fourteen',
      description: 'The star of action, courage, and financial matters',
      readTime: '9 min',
      views: 3654,
      comments: 189,
      isFree: true,
      difficulty: 'Intermediate',
      href: '/en/wiki/ziwei-stars/wuqu'
    },
    
    // Northern Group
    {
      id: 'tianji-star',
      title: 'Tianji Star (天机): The Strategist Star',
      category: 'northern',
      description: 'Representing wisdom, strategy, and analytical thinking',
      readTime: '10 min',
      views: 3210,
      comments: 176,
      isFree: true,
      difficulty: 'Intermediate',
      href: '/en/wiki/ziwei-stars/tianji'
    },
    {
      id: 'tiantong-star',
      title: 'Tiantong Star (天同): The Child Star',
      category: 'northern',
      description: 'The star of happiness, innocence, and good fortune',
      readTime: '8 min',
      views: 2987,
      comments: 167,
      isFree: true,
      difficulty: 'Beginner',
      href: '/en/wiki/ziwei-stars/tiantong'
    },
    {
      id: 'lianzhen-star',
      title: 'Lianzhen Star (廉贞): The Prisoner Star',
      category: 'northern',
      description: 'A complex star representing both corruption and transformation',
      readTime: '11 min',
      views: 2654,
      comments: 145,
      isFree: false,
      difficulty: 'Advanced',
      href: '/en/wiki/ziwei-stars/lianzhen'
    },
    
    // Southern Group
    {
      id: 'tianxiang-star',
      title: 'Tianxiang Star (天相): The Prime Minister Star',
      category: 'southern',
      description: 'Representing support, assistance, and diplomatic skills',
      readTime: '9 min',
      views: 2432,
      comments: 134,
      isFree: true,
      difficulty: 'Intermediate',
      href: '/en/wiki/ziwei-stars/tianxiang'
    },
    {
      id: 'taiyin-star',
      title: 'Taiyin Star (太阴): The Moon Star',
      category: 'southern',
      description: 'Representing femininity, intuition, and gentle nature',
      readTime: '8 min',
      views: 3789,
      comments: 203,
      isHot: true,
      isFree: true,
      difficulty: 'Beginner',
      href: '/en/wiki/ziwei-stars/taiyin'
    },
    {
      id: 'tanlang-star',
      title: 'Tanlang Star (贪狼): The Greedy Wolf Star',
      category: 'southern',
      description: 'Representing desire, ambition, and versatility',
      readTime: '10 min',
      views: 3456,
      comments: 198,
      isFree: false,
      difficulty: 'Intermediate',
      href: '/en/wiki/ziwei-stars/tanlang'
    },
    
    // Auxiliary Stars
    {
      id: 'wenchang-star',
      title: 'Wenchang Star (文昌): The Literary Star',
      category: 'auxiliary',
      description: 'Enhancing intelligence, writing skills, and academic success',
      readTime: '7 min',
      views: 2876,
      comments: 167,
      isFree: true,
      difficulty: 'Beginner',
      href: '/en/wiki/ziwei-stars/wenchang'
    },
    {
      id: 'wenqu-star',
      title: 'Wenqu Star (文曲): The Arts Star',
      category: 'auxiliary',
      description: 'Representing artistic talent and creative expression',
      readTime: '7 min',
      views: 2543,
      comments: 145,
      isFree: true,
      difficulty: 'Beginner',
      href: '/en/wiki/ziwei-stars/wenqu'
    },
    {
      id: 'zuofu-youbi',
      title: 'Zuofu & Youbi Stars (左辅右弼): The Assistant Stars',
      category: 'auxiliary',
      description: 'The helping stars that provide support and assistance',
      readTime: '9 min',
      views: 2234,
      comments: 134,
      isFree: false,
      difficulty: 'Intermediate',
      href: '/en/wiki/ziwei-stars/zuofu-youbi'
    },
    
    // Auspicious Stars
    {
      id: 'tiankui-tianyue',
      title: 'Tiankui & Tianyue Stars (天魁天钺): Noble Stars',
      category: 'auspicious',
      description: 'Stars bringing noble people and important assistance',
      readTime: '8 min',
      views: 1987,
      comments: 123,
      isFree: false,
      difficulty: 'Intermediate',
      href: '/en/wiki/ziwei-stars/tiankui-tianyue'
    },
    {
      id: 'lucun-star',
      title: 'Lucun Star (禄存): The Wealth Star',
      category: 'auspicious',
      description: 'Bringing financial stability and material prosperity',
      readTime: '8 min',
      views: 3456,
      comments: 234,
      isHot: true,
      isFree: false,
      difficulty: 'Intermediate',
      href: '/en/wiki/ziwei-stars/lucun'
    },
    
    // Inauspicious Stars
    {
      id: 'qisha-star',
      title: 'Qisha Star (七杀): The Seven Killings Star',
      category: 'inauspicious',
      description: 'A challenging star representing conflict and transformation',
      readTime: '11 min',
      views: 2765,
      comments: 178,
      isFree: false,
      difficulty: 'Advanced',
      href: '/en/wiki/ziwei-stars/qisha'
    },
    {
      id: 'pojun-star',
      title: 'Pojun Star (破军): The Army Breaker Star',
      category: 'inauspicious',
      description: 'Representing destruction and radical change',
      readTime: '10 min',
      views: 2543,
      comments: 156,
      isFree: false,
      difficulty: 'Advanced',
      href: '/en/wiki/ziwei-stars/pojun'
    },
    
    // Star Combinations
    {
      id: 'ziwei-tianfu',
      title: 'Ziwei + Tianfu: Double Emperor Pattern',
      category: 'combinations',
      description: 'When both emperor stars appear together',
      readTime: '14 min',
      views: 1876,
      comments: 134,
      isFree: false,
      difficulty: 'Advanced',
      href: '/en/wiki/ziwei-stars/ziwei-tianfu'
    },
    {
      id: 'sun-moon',
      title: 'Taiyang + Taiyin: Sun-Moon Combination',
      category: 'combinations',
      description: 'The balance of masculine and feminine energies',
      readTime: '12 min',
      views: 2123,
      comments: 145,
      isFree: false,
      difficulty: 'Intermediate',
      href: '/en/wiki/ziwei-stars/sun-moon'
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

  const getStarIcon = (category: string) => {
    switch (category) {
      case 'fourteen': return <Crown className="w-4 h-4" />
      case 'auxiliary': return <Shield className="w-4 h-4" />
      case 'auspicious': return <Star className="w-4 h-4" />
      case 'inauspicious': return <Zap className="w-4 h-4" />
      default: return <Star className="w-4 h-4" />
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ziwei Stars</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Star Encyclopedia</p>
            </div>
          </div>
          <Crown className="w-6 h-6 text-purple-600 dark:text-yellow-400" />
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search stars and meanings..."
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
                    {getStarIcon(article.category)}
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
            <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No stars found</p>
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ziwei Stars Encyclopedia</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Complete guide to all stars in Ziwei Dou Shu system
              </p>
            </div>
          </div>
          <Crown className="w-8 h-8 text-purple-600 dark:text-yellow-400" />
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search stars, meanings, and characteristics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-yellow-400"
              />
            </div>
          </div>
          <div className="flex items-center justify-center bg-gradient-to-r from-purple-500 to-blue-500 dark:from-yellow-500 dark:to-orange-500 text-white dark:text-slate-900 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{articles.length}</div>
              <div className="text-sm opacity-90">Stars</div>
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
                    <div className="flex items-center gap-1 text-purple-600 dark:text-yellow-400">
                      {getStarIcon(article.category)}
                    </div>
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
            <Crown className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No stars found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search terms or selecting a different category</p>
          </div>
        )}
      </div>
    </EnglishLayout>
  )

  return isMobile ? <MobileContent /> : <DesktopContent />
} 