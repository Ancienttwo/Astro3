'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import EnglishLayout from '@/components/EnglishLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Clock, User, Crown, Scroll, BookOpen, Star, Calendar } from 'lucide-react'

export default function WuxingHistoryPage() {
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null)

  const historicalPeriods = [
    {
      id: 'early-origins',
      title: 'Early Origins',
      period: 'Shang & Early Zhou Dynasties',
      dates: 'c. 1600–771 BCE',
      color: 'from-amber-100 to-yellow-200 dark:from-amber-900/40 dark:to-yellow-800/40',
      borderColor: 'border-amber-200 dark:border-amber-800',
      textColor: 'text-amber-700 dark:text-amber-300',
      icon: '📜',
      keyPoints: [
        'Term "Wǔcái" (五材) meaning "Five Materials"',
        'Appeared in Book of Documents (尚書)',
        'Seen as fundamental materials for life and governance',
        'Understood as distinct physical substances',
        'Not yet part of a dynamic, cyclical system'
      ],
      description: 'The earliest roots saw elements as fundamental materials necessary for human life and governance. Rulers needed to manage these five resources properly to ensure state prosperity.',
      keyFigures: [],
      keyTexts: ['Book of Documents (尚書)']
    },
    {
      id: 'zou-yan',
      title: 'Cosmological Synthesis',
      period: 'Warring States Period',
      dates: 'c. 475–221 BCE',
      color: 'from-blue-100 to-cyan-200 dark:from-blue-900/40 dark:to-cyan-800/40',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-700 dark:text-blue-300',
      icon: '⚡',
      keyPoints: [
        'Zou Yan (鄒衍) synthesized Yin-Yang and Five Elements',
        'Elements became dynamic phases of cosmic energy (Qi)',
        'Linked to cyclical succession',
        'Theory of "Cycle of Conquest of Five Virtues" (五德終始說)',
        'Provided cosmological justification for regime change'
      ],
      description: 'Zou Yan transformed static materials into dynamic phases of cosmic energy, creating a powerful framework for explaining political and cosmic changes.',
      keyFigures: ['Zou Yan (鄒衍) - Yin-Yang School philosopher'],
      keyTexts: ['Five Virtues Theory (五德終始說)'],
      dynastyExample: 'Yellow Emperor (Earth) → Xia (Wood) → Shang (Metal) → Zhou (Fire)'
    },
    {
      id: 'systematization',
      title: 'Integration & Systematization',
      period: 'Qin & Han Dynasties',
      dates: '221 BCE – 220 CE',
      color: 'from-red-100 to-rose-200 dark:from-red-900/40 dark:to-rose-800/40',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-700 dark:text-red-300',
      icon: '👑',
      keyPoints: [
        'Official adoption by imperial dynasties',
        'Qin identified with Water element',
        'Dong Zhongshu created comprehensive cosmological system',
        'Integration with Confucian ethics and governance',
        'Generation Cycle gained prominence'
      ],
      description: 'The theory was officially adopted and systematized, connecting cosmos, humanity, and government into one unified framework.',
      keyFigures: ['Dong Zhongshu (董仲舒) - Han philosopher'],
      keyTexts: ['Comprehensive cosmological system'],
      dynastyExample: 'Qin (Water/Black) → Han (Earth → Fire)'
    },
    {
      id: 'applications',
      title: 'Specialized Applications',
      period: 'Post-Han to Modern Era',
      dates: '220 CE – Present',
      color: 'from-green-100 to-emerald-200 dark:from-green-900/40 dark:to-emerald-800/40',
      borderColor: 'border-green-200 dark:border-green-800',
      textColor: 'text-green-700 dark:text-green-300',
      icon: '🏥',
      keyPoints: [
        'Embedded into specific cultural practices',
        'Detailed application in Traditional Chinese Medicine',
        'Integration with alchemy and Feng Shui',
        'Development of astrological systems',
        'Modern scientific and therapeutic applications'
      ],
      description: 'The theory evolved from state ideology into specialized applications across medicine, astrology, alchemy, and other fields.',
      keyFigures: [],
      keyTexts: ['Huangdi Neijing (Yellow Emperor\'s Inner Canon)'],
      applications: ['TCM', 'Feng Shui', 'Alchemy', 'Bazi Astrology']
    }
  ]

  const applications = [
    {
      title: 'Traditional Chinese Medicine (TCM)',
      description: 'Systematic correlation of Five Elements with Zang-fu organs. Generation and Overcoming cycles became primary diagnostic tools.',
      icon: '🏥',
      example: 'Liver = Wood, Heart = Fire',
      color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
    },
    {
      title: 'Alchemy (煉丹 - Liàndān)',
      description: 'Used Five Elements to understand substance transformation, seeking elixirs of immortality by balancing elements.',
      icon: '⚗️',
      example: 'Balancing elements in cauldrons',
      color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
    },
    {
      title: 'Feng Shui (風水)',
      description: 'Essential for analyzing landscapes and living spaces, managing Qi flow according to element interactions.',
      icon: '🏠',
      example: 'Building orientation, furniture placement',
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    },
    {
      title: 'Astrology & Divination',
      description: 'Bazi system converts birth data into Four Pillars chart with Yin-Yang and Five Element associations.',
      icon: '⭐',
      example: 'Character analysis, destiny reading',
      color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    }
  ]

  const PeriodCard = ({ period, isSelected, onClick }: { period: typeof historicalPeriods[0], isSelected: boolean, onClick: () => void }) => (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'} bg-gradient-to-br ${period.color} ${period.borderColor} border-2`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-4xl">{period.icon}</span>
          <Badge variant="outline" className={`${period.textColor} font-semibold`}>
            {period.dates}
          </Badge>
        </div>
        
        <h3 className={`font-bold text-xl ${period.textColor} mb-2`}>
          {period.title}
        </h3>
        <p className={`font-semibold ${period.textColor} mb-3`}>
          {period.period}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {period.description}
        </p>
        
        {isSelected && (
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Key Developments:</h4>
              <ul className="space-y-1">
                {period.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span className="text-gray-700 dark:text-gray-300">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {period.keyFigures.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Key Figures:</h4>
                <ul className="space-y-1">
                  {period.keyFigures.map((figure, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <User className="h-3 w-3 text-purple-600" />
                      <span className="text-gray-700 dark:text-gray-300">{figure}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {period.keyTexts.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Important Texts:</h4>
                <ul className="space-y-1">
                  {period.keyTexts.map((text, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Scroll className="h-3 w-3 text-blue-600" />
                      <span className="text-gray-700 dark:text-gray-300">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {period.dynastyExample && (
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Dynasty Succession:</h4>
                <p className="text-gray-700 dark:text-gray-300 font-mono text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  {period.dynastyExample}
                </p>
              </div>
            )}
            
            {period.applications && (
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Modern Applications:</h4>
                <div className="flex flex-wrap gap-1">
                  {period.applications.map((app, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {app}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <EnglishLayout>
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Historical Development of Five Elements Theory
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              A journey spanning centuries - from materials to cosmic philosophy
            </p>
          </div>
        </div>

        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The historical development of the Five Elements (Wu Xing) theory is a fascinating journey that spans centuries, evolving from a simple classification system into a complex and foundational philosophical framework. This theory has shaped Chinese thought, governance, medicine, and culture for over two millennia.
            </p>
          </CardContent>
        </Card>

        {/* Historical Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Historical Timeline
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click on any period to explore its developments, key figures, and contributions
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {historicalPeriods.map((period) => (
                <PeriodCard
                  key={period.id}
                  period={period}
                  isSelected={selectedPeriod === period.id}
                  onClick={() => setSelectedPeriod(
                    selectedPeriod === period.id ? null : period.id
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Zou Yan's Revolutionary Contribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Zou Yan's Revolutionary Contribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Zou Yan (鄒衍)</strong> of the Yin-Yang School is considered the great synthesizer who transformed Five Elements theory. His genius was moving beyond static materials to dynamic phases of cosmic energy.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                    Before Zou Yan
                  </h3>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Static physical materials</li>
                    <li>• Simple classification system</li>
                    <li>• Limited to governance resources</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                    After Zou Yan
                  </h3>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• Dynamic phases of cosmic energy (Qi)</li>
                    <li>• Cyclical succession system</li>
                    <li>• Cosmological framework for change</li>
                    <li>• Political legitimacy through elements</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
                  Five Virtues Theory (五德終始說)
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                  Each dynasty ruled under a specific element's protection. New dynasties arose under elements that could "overcome" the previous dynasty's element.
                </p>
                <div className="text-xs text-purple-600 dark:text-purple-400 font-mono bg-purple-100 dark:bg-purple-900/40 p-2 rounded">
                  Yellow Emperor (Earth) → Xia (Wood) → Shang (Metal) → Zhou (Fire)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modern Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              Modern Applications & Legacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              After the Han Dynasty, Five Elements theory evolved from state ideology into specialized applications across various fields:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applications.map((app) => (
                <Card key={app.title} className={`${app.color} border`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{app.icon}</span>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{app.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{app.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 font-mono bg-gray-100 dark:bg-gray-800 p-1 rounded">
                          {app.example}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conclusion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-600" />
              The Genius of Adaptability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              The Five Elements theory evolved from a simple list of essential materials to a sophisticated philosophical model for understanding change. <strong>Its genius lies in its adaptability</strong>, providing a powerful, unifying framework for everything from cosmic events and political legitimacy to the intricate workings of the human body. This remarkable theory continues to influence Chinese culture, medicine, and philosophy to this day.
            </p>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => router.push('/en/wiki/wuxing')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Five Elements Wiki
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/en/wiki/wuxing/intro')}
            className="flex items-center gap-2"
          >
            Introduction to Wu Xing
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </EnglishLayout>
  )
} 