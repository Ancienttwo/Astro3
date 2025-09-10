'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Star,
  BookOpen,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  Users,
  Target,
  Brain,
  Calendar,
  Eye,
  MessageCircle
} from 'lucide-react'
import { useIsMobile } from '@/hooks/useDeviceType'
import MobileAppLayout, { MobileCard } from '@/components/MobileAppLayout'
import EnglishLayout from '@/components/EnglishLayout'

export default function ZiweiVsBaziPageEN() {
  const router = useRouter()
  const isMobile = useIsMobile()

  const comparisonData = [
    {
      aspect: 'Origin & History',
      ziwei: 'Originated in Tang Dynasty, developed by Chen Tuan',
      bazi: 'Originated in Han Dynasty, developed by Xu Ziping',
      advantage: 'bazi'
    },
    {
      aspect: 'Calculation Method',
      ziwei: 'Based on birth time and lunar calendar positioning',
      bazi: 'Based on Year, Month, Day, Hour pillars',
      advantage: 'equal'
    },
    {
      aspect: 'Chart Structure',
      ziwei: '12 palaces arranged in a square, 14 main stars',
      bazi: '4 pillars with 8 characters (Heavenly Stems & Earthly Branches)',
      advantage: 'equal'
    },
    {
      aspect: 'Prediction Accuracy',
      ziwei: 'Very detailed for personality and life events',
      bazi: 'Excellent for timing and fortune cycles',
      advantage: 'equal'
    },
    {
      aspect: 'Learning Difficulty',
      ziwei: 'Complex star combinations, many rules',
      bazi: 'Complex Five Elements interactions',
      advantage: 'bazi'
    },
    {
      aspect: 'Popularity',
      ziwei: 'Popular in Taiwan, Hong Kong, Southeast Asia',
      bazi: 'Popular in Mainland China, internationally',
      advantage: 'bazi'
    },
    {
      aspect: 'Fortune Timing',
      ziwei: 'Major Life Periods (10 years), Annual Analysis',
      bazi: 'Great Fortune Periods (10 years), Annual Fortune',
      advantage: 'equal'
    },
    {
      aspect: 'Personality Analysis',
      ziwei: 'Very detailed, star combinations reveal character',
      bazi: 'Good, through Ten Gods and Day Master analysis',
      advantage: 'ziwei'
    },
    {
      aspect: 'Relationship Compatibility',
      ziwei: 'Detailed through palace interactions',
      bazi: 'Good through element compatibility',
      advantage: 'ziwei'
    },
    {
      aspect: 'Career Guidance',
      ziwei: 'Excellent through Career Palace analysis',
      bazi: 'Good through Ten Gods career indicators',
      advantage: 'ziwei'
    }
  ]

  const articles = [
    {
      id: 'comparison-guide',
      title: 'Complete Comparison: Ziwei vs BaZi',
      description: 'Comprehensive analysis of both systems',
      readTime: '15 min',
      views: 5432,
      comments: 298,
      isHot: true,
      isFree: true,
      difficulty: 'Intermediate'
    },
    {
      id: 'which-to-choose',
      title: 'Which system should you learn first?',
      description: 'Guidance for beginners choosing between systems',
      readTime: '10 min',
      views: 4321,
      comments: 234,
      isNew: true,
      isFree: true,
      difficulty: 'Beginner'
    },
    {
      id: 'complementary-use',
      title: 'Using both systems together',
      description: 'How to combine Ziwei and BaZi for better insights',
      readTime: '18 min',
      views: 3210,
      comments: 189,
      isFree: false,
      difficulty: 'Advanced'
    },
    {
      id: 'accuracy-comparison',
      title: 'Accuracy comparison in real cases',
      description: 'Case studies comparing prediction accuracy',
      readTime: '20 min',
      views: 2876,
      comments: 167,
      isFree: false,
      difficulty: 'Advanced'
    }
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300'
      case 'Advanced': return 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getAdvantageIcon = (advantage: string, system: string) => {
    if (advantage === 'equal') return null
    if (advantage === system) return <CheckCircle className="w-4 h-4 text-green-500" />
    return <XCircle className="w-4 h-4 text-gray-400" />
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ziwei vs BaZi</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">System Comparison</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-600" />
            <span className="text-lg">vs</span>
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        {/* Quick Summary */}
        <MobileCard className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900 dark:to-blue-900">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-purple-600" />
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Ziwei:</strong> Better for personality & relationships
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700 dark:text-gray-300">
                <strong>BaZi:</strong> Better for timing & fortune cycles
              </span>
            </div>
          </div>
        </MobileCard>

        {/* Comparison Table */}
        <div className="space-y-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Detailed Comparison</h2>
          {comparisonData.map((item, index) => (
            <MobileCard key={index} className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">{item.aspect}</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Star className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-purple-600">Ziwei</span>
                    {getAdvantageIcon(item.advantage, 'ziwei')}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">{item.ziwei}</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-blue-600">BaZi</span>
                    {getAdvantageIcon(item.advantage, 'bazi')}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">{item.bazi}</p>
                </div>
              </div>
            </MobileCard>
          ))}
        </div>

        {/* Related Articles */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Related Articles</h2>
          {articles.map((article) => (
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
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
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
                <Badge className={`text-xs px-2 py-0.5 ${getDifficultyColor(article.difficulty)}`}>
                  {article.difficulty}
                </Badge>
              </div>
            </MobileCard>
          ))}
        </div>
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ziwei Dou Shu vs BaZi</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Comprehensive comparison of two major Chinese astrology systems
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-400">VS</span>
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <Star className="w-6 h-6" />
                Ziwei Dou Shu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Excellent for personality analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Detailed life event predictions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Complex star combinations</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <BookOpen className="w-6 h-6" />
                BaZi (Four Pillars)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Excellent for timing analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Accurate fortune cycles</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Systematic Five Elements theory</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Detailed Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Aspect</th>
                    <th className="text-left p-3 font-medium text-purple-600">Ziwei Dou Shu</th>
                    <th className="text-left p-3 font-medium text-blue-600">BaZi</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-3 font-medium">{item.aspect}</td>
                      <td className="p-3">
                        <div className="flex items-start gap-2">
                          <span className="flex-1">{item.ziwei}</span>
                          {getAdvantageIcon(item.advantage, 'ziwei')}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-start gap-2">
                          <span className="flex-1">{item.bazi}</span>
                          {getAdvantageIcon(item.advantage, 'bazi')}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Related Articles */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
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
                  </div>
                  
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3 leading-tight">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
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
        </div>
      </div>
    </EnglishLayout>
  )

  return isMobile ? <MobileContent /> : <DesktopContent />
} 