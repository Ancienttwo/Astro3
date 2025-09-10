'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  BookOpen,
  Calendar,
  Users,
  Star,
  Globe,
  Clock,
  Zap,
  Target,
  Briefcase,
  Heart,
  TrendingUp,
  Shield,
  History
} from 'lucide-react'
import { useIsMobile } from '@/hooks/useDeviceType'
import MobileAppLayout, { MobileCard } from '@/components/MobileAppLayout'
import EnglishLayout from '@/components/EnglishLayout'

export default function WhatIsBaziPage() {
  const router = useRouter()
  const isMobile = useIsMobile()

  // Ten Gods System data
  const tenGodsData = [
    {
      category: 'Support Gods',
      description: 'What produces you',
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      gods: [
        { name: 'Scholar God', chinese: '正印', description: 'Education, support, motherly care', polarity: '(opposite polarity)' },
        { name: 'Oracle God', chinese: '偏印', description: 'Controlling help, conditional support', polarity: '(same polarity)' }
      ]
    },
    {
      category: 'Peer Gods',
      description: 'Same as you',
      color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      gods: [
        { name: 'Peer God', chinese: '比肩', description: 'Cooperation, friendship, equals', polarity: '(same polarity)' },
        { name: 'Rival God', chinese: '劫财', description: 'Competition, conflict, partnership challenges', polarity: '(opposite polarity)' }
      ]
    },
    {
      category: 'Output Gods',
      description: 'What you produce',
      color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
      gods: [
        { name: 'Prosperity God', chinese: '食神', description: 'Creativity, expression, gentle output', polarity: '(same polarity)' },
        { name: 'Drama God', chinese: '伤官', description: 'Innovation, rebellion, dramatic change', polarity: '(opposite polarity)' }
      ]
    },
    {
      category: 'Wealth Gods',
      description: 'What you control',
      color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      gods: [
        { name: 'Wealth God', chinese: '正财', description: 'Stable income, conservative investment', polarity: '(opposite polarity)' },
        { name: 'Fortune God', chinese: '偏财', description: 'Windfall, business opportunities', polarity: '(same polarity)' }
      ]
    },
    {
      category: 'Authority Gods',
      description: 'What controls you',
      color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      gods: [
        { name: 'Authority God', chinese: '正官', description: 'Legal authority, structured management', polarity: '(opposite polarity)' },
        { name: 'War God', chinese: '七杀', description: 'Direct power, military leadership', polarity: '(same polarity)' }
      ]
    }
  ]

  // Applications data
  const applications = [
    {
      icon: Briefcase,
      title: 'Career Guidance',
      description: 'Wealth Gods dominant → Business, finance\nAuthority Gods dominant → Management, government\nOutput Gods dominant → Creative fields, arts\nSupport Gods dominant → Education, counseling',
      color: 'text-blue-600'
    },
    {
      icon: Heart,
      title: 'Relationship Analysis',
      description: 'Peer/Rival Gods → Friendship and partnership dynamics\nAuthority Gods → Relationship with bosses, authorities\nWealth Gods → Relationship with money and resources',
      color: 'text-red-600'
    },
    {
      icon: Clock,
      title: 'Timing Analysis',
      description: 'Luck Cycle (大运) → 10-year cycles\nAnnual Influences (流年) → Yearly changes\nMonthly Influences (流月) → Monthly variations',
      color: 'text-green-600'
    }
  ]

  const MobileContent = () => (
    <MobileAppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/en/wiki/bazi')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to BaZi
          </Button>
        </div>

        {/* Title */}
        <MobileCard>
          <div className="text-center space-y-4">
            <BookOpen className="h-12 w-12 text-purple-600 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              What is BaZi?
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              The Four Pillars of Destiny - Ancient Chinese Astrological System
            </p>
            <div className="flex justify-center gap-2">
              <Badge variant="outline">Eight Characters</Badge>
              <Badge variant="outline">Four Pillars</Badge>
              <Badge variant="outline">Destiny Analysis</Badge>
            </div>
          </div>
        </MobileCard>

        {/* What is BaZi */}
        <MobileCard>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              What is BaZi?
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                BaZi (八字), which literally translates to "eight characters," is a sophisticated and ancient Chinese astrological system for personal destiny analysis. It is also widely known as the Four Pillars of Destiny.
              </p>
              <p>
                The core of BaZi lies in the eight characters that are derived from a person's birth date and time. These are organized into four pairs, or "pillars," with each pillar representing a different aspect of time:
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  The Four Pillars
                </h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Year Pillar:</strong> Represents one's ancestors, social circle, and early life (childhood).</div>
                  <div><strong>Month Pillar:</strong> Represents one's parents, siblings, and working life (youth).</div>
                  <div><strong>Day Pillar:</strong> Represents oneself, one's spouse, and middle age (adulthood).</div>
                  <div><strong>Hour Pillar:</strong> Represents one's children, ambitions, and later life (old age).</div>
                </div>
              </div>

              <p>
                Each pillar consists of two characters: a <strong>Heavenly Stem</strong> and an <strong>Earthly Branch</strong>. These characters are drawn from the Chinese sexagenary cycle, a complex system based on the principles of Yin and Yang and the Five Elements (Wood, Fire, Earth, Metal, and Water).
              </p>
              <p>
                By analyzing the interplay and relationships between these eight characters, a BaZi practitioner can gain insights into an individual's personality, talents, potential, and life path. It is a tool for understanding one's strengths and weaknesses, and for making informed decisions to navigate life more effectively.
              </p>
            </div>
          </div>
        </MobileCard>

        {/* The Origin of BaZi */}
        <MobileCard>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <History className="h-5 w-5" />
              The Origin of BaZi
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                The roots of BaZi can be traced back to the Tang Dynasty in China (618–907 AD). During this period, a scholar named <strong>Li Xuzhong</strong> (李虛中) laid the foundation for the system. He developed a method of fortune-telling that used the year, month, and day of a person's birth, which comprised six characters in total.
              </p>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  The Father of Modern BaZi
                </h3>
                <p className="text-sm">
                  However, the system as we know it today was fully developed during the Song Dynasty (960–1279 AD) by a man named <strong>Xu Ziping</strong> (徐子平). He is considered the "father" of modern BaZi. Xu Ziping refined and expanded upon Li Xuzhong's work by adding the hour of birth, thus completing the "Four Pillars" and creating the "eight character" system. This addition allowed for a much more precise and detailed analysis of a person's destiny.
                </p>
              </div>

              <p>
                Because of Xu Ziping's significant contributions, the art of BaZi is sometimes referred to as "Ziping's Art of Reckoning Fate" (子平算命術). The system he established has been passed down through generations and is still widely practiced today in China and by Chinese communities around the world.
              </p>
            </div>
          </div>
        </MobileCard>

        {/* Core Principles */}
        <MobileCard>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Core Principles
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  1. The Foundation: Heavenly Stems and Earthly Branches
                </h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  天干地支 (Tiangan Dizhi) = Heavenly Stems and Earthly Branches (60-year cycle combinations)
                </p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  2. The Four Pillars Structure
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-green-700 dark:text-green-300">
                  <div>• Year Pillar (年柱) - Birth year</div>
                  <div>• Month Pillar (月柱) - Birth month</div>
                  <div>• Day Pillar (日柱) - Core Identity</div>
                  <div>• Hour Pillar (时柱) - Birth hour</div>
                </div>
                <p className="text-green-700 dark:text-green-300 text-sm mt-2">
                  Each pillar contains one Heavenly Stem + one Earthly Branch = 8 characters total
                </p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  3. The Five Elements System
                </h3>
                <div className="grid grid-cols-1 gap-2 text-sm text-purple-700 dark:text-purple-300">
                  <div>🌳 Wood (木) - Growth, expansion, creativity</div>
                  <div>🔥 Fire (火) - Transformation, energy, activity</div>
                  <div>🌍 Earth (土) - Stability, nourishment, centering</div>
                  <div>⚡ Metal (金) - Contraction, structure, refinement</div>
                  <div>💧 Water (水) - Flow, adaptability, conservation</div>
                </div>
              </div>
            </div>
          </div>
        </MobileCard>

        {/* Ten Gods System */}
        <MobileCard>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Star className="h-5 w-5" />
              The Ten Gods System (十神)
            </h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-yellow-900 dark:text-yellow-100 font-medium mb-2">
                The Day Master (日干) represents YOU
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                All other elements are analyzed in relation to you
              </p>
            </div>
            
            <div className="space-y-3">
              {tenGodsData.map((category, index) => (
                <div key={index} className={`p-4 rounded-lg border ${category.color}`}>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {category.category}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {category.description}
                  </p>
                  <div className="space-y-2">
                    {category.gods.map((god, godIndex) => (
                      <div key={godIndex} className="bg-white dark:bg-gray-800 p-2 rounded border">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {god.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {god.chinese}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          {god.description} {god.polarity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                Why These Names Make Sense
              </h3>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-3">
                <div>
                  <strong>Wealth Gods:</strong> "Wealth God" vs "Fortune God" immediately conveys the difference between salary vs investment income. Far clearer than "Direct" vs "Indirect" wealth.
                </div>
                <div>
                  <strong>Authority Gods:</strong> "Authority God" evokes civil authority and structured leadership. "War God" suggests military-style direct command. Much more intuitive than "Officer" vs "Seven Killings".
                </div>
                <div>
                  <strong>Output Gods:</strong> "Prosperity God" captures the gentle, nurturing quality of creative expression. "Drama God" conveys the dramatic, rebellious nature of innovation. Infinitely better than "Eating God" and "Hurting Officer".
                </div>
                <div>
                  <strong>Support Gods:</strong> "Scholar God" suggests motherly, educational support. "Oracle God" hints at unclear, conditional help. More meaningful than "Direct/Indirect Resource".
                </div>
              </div>
            </div>
          </div>
        </MobileCard>

        {/* Key Concepts */}
        <MobileCard>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Key Concepts Explained
            </h2>
            <div className="space-y-3">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Day Master (日干)
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Your core identity in the BaZi system</li>
                  <li>• All analysis revolves around this central element</li>
                  <li>• Determines your fundamental nature and life approach</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Balance Concept
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• <strong>Strong (旺):</strong> Too much of an element</li>
                  <li>• <strong>Weak (弱):</strong> Too little of an element</li>
                  <li>• <strong>Focal Element (用神):</strong> The key element for balance</li>
                  <li>• <strong>Unfavorable Element (忌神):</strong> What disrupts balance</li>
                </ul>
              </div>
            </div>
          </div>
        </MobileCard>

        {/* Practical Applications */}
        <MobileCard>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Practical Applications
            </h2>
            <div className="space-y-3">
              {applications.map((app, index) => {
                const IconComponent = app.icon
                return (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <IconComponent className={`h-5 w-5 ${app.color}`} />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {app.title}
                      </h3>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {app.description.split('\n').map((line, lineIndex) => (
                        <div key={lineIndex} className="mb-1">
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </MobileCard>

        {/* Cultural Context */}
        <MobileCard>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Cultural Context
            </h2>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg border">
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                BaZi is not merely fortune-telling, but also a sophisticated personality analysis system that helps people:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Understand their natural tendencies</li>
                <li>• Make better life decisions</li>
                <li>• Optimize timing for important events</li>
                <li>• Improve relationships and career choices</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-3">
                Think of it as an ancient Chinese version of personality psychology, similar to how Myers-Briggs or Enneagram are used in Western psychology today.
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-green-900 dark:text-green-100 font-medium mb-2">
                Historical Significance
              </p>
              <p className="text-green-700 dark:text-green-300 text-sm">
                This system has been used for over 1,000 years in Chinese culture and continues to be a valuable tool for self-understanding and life guidance. Through thoughtful translation, we hope to make these profound insights accessible to the global community.
              </p>
            </div>
          </div>
        </MobileCard>
      </div>
    </MobileAppLayout>
  )

  const DesktopContent = () => (
    <EnglishLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/en/wiki/bazi')}
              className="mb-4 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to BaZi Wiki
            </Button>
            
            <div className="text-center space-y-4">
              <BookOpen className="h-16 w-16 text-purple-600 mx-auto" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                What is BaZi?
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                The Four Pillars of Destiny - Ancient Chinese Astrological System
              </p>
              <div className="flex justify-center gap-2">
                <Badge variant="outline">Eight Characters</Badge>
                <Badge variant="outline">Four Pillars</Badge>
                <Badge variant="outline">Destiny Analysis</Badge>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* What is BaZi */}
            <Card>
              <CardHeader>
                <CardTitle>What is BaZi?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  BaZi (八字), which literally translates to "eight characters," is a sophisticated and ancient Chinese astrological system for personal destiny analysis. It is also widely known as the Four Pillars of Destiny.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  The core of BaZi lies in the eight characters that are derived from a person's birth date and time. These are organized into four pairs, or "pillars," with each pillar representing a different aspect of time:
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-4">
                    The Four Pillars
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Year Pillar:</strong> Represents one's ancestors, social circle, and early life (childhood).</div>
                    <div><strong>Month Pillar:</strong> Represents one's parents, siblings, and working life (youth).</div>
                    <div><strong>Day Pillar:</strong> Represents oneself, one's spouse, and middle age (adulthood).</div>
                    <div><strong>Hour Pillar:</strong> Represents one's children, ambitions, and later life (old age).</div>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300">
                  Each pillar consists of two characters: a <strong>Heavenly Stem</strong> and an <strong>Earthly Branch</strong>. These characters are drawn from the Chinese sexagenary cycle, a complex system based on the principles of Yin and Yang and the Five Elements (Wood, Fire, Earth, Metal, and Water).
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  By analyzing the interplay and relationships between these eight characters, a BaZi practitioner can gain insights into an individual's personality, talents, potential, and life path. It is a tool for understanding one's strengths and weaknesses, and for making informed decisions to navigate life more effectively.
                </p>
              </CardContent>
            </Card>

            {/* The Origin of BaZi */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  The Origin of BaZi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  The roots of BaZi can be traced back to the Tang Dynasty in China (618–907 AD). During this period, a scholar named <strong>Li Xuzhong</strong> (李虛中) laid the foundation for the system. He developed a method of fortune-telling that used the year, month, and day of a person's birth, which comprised six characters in total.
                </p>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3">
                    The Father of Modern BaZi
                  </h3>
                  <p className="text-green-700 dark:text-green-300">
                    However, the system as we know it today was fully developed during the Song Dynasty (960–1279 AD) by a man named <strong>Xu Ziping</strong> (徐子平). He is considered the "father" of modern BaZi. Xu Ziping refined and expanded upon Li Xuzhong's work by adding the hour of birth, thus completing the "Four Pillars" and creating the "eight character" system. This addition allowed for a much more precise and detailed analysis of a person's destiny.
                  </p>
                </div>

                <p className="text-gray-700 dark:text-gray-300">
                  Because of Xu Ziping's significant contributions, the art of BaZi is sometimes referred to as "Ziping's Art of Reckoning Fate" (子平算命術). The system he established has been passed down through generations and is still widely practiced today in China and by Chinese communities around the world.
                </p>
              </CardContent>
            </Card>

            {/* Core Principles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Core Principles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      1. The Foundation
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      <strong>Heavenly Stems and Earthly Branches</strong><br/>
                      天干地支 (Tiangan Dizhi) = 60-year cycle combinations
                    </p>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                      2. Four Pillars Structure
                    </h3>
                    <div className="text-green-700 dark:text-green-300 text-sm space-y-1">
                      <div>• Year Pillar (年柱) - Birth year</div>
                      <div>• Month Pillar (月柱) - Birth month</div>
                      <div>• Day Pillar (日柱) - Core Identity</div>
                      <div>• Hour Pillar (时柱) - Birth hour</div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                      3. Five Elements System
                    </h3>
                    <div className="text-purple-700 dark:text-purple-300 text-sm space-y-1">
                      <div>🌳 Wood - Growth, creativity</div>
                      <div>🔥 Fire - Transformation, energy</div>
                      <div>🌍 Earth - Stability, nourishment</div>
                      <div>⚡ Metal - Structure, refinement</div>
                      <div>💧 Water - Flow, adaptability</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ten Gods System */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  The Ten Gods System (十神)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                    Our Reimagined Translations
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                    The Day Master (日干) represents YOU. All other elements are analyzed in relation to you:
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {tenGodsData.map((category, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${category.color}`}>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {category.category}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {category.description}
                      </p>
                      <div className="space-y-2">
                        {category.gods.map((god, godIndex) => (
                          <div key={godIndex} className="bg-white dark:bg-gray-800 p-3 rounded border">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {god.name}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {god.chinese}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                              {god.description} {god.polarity}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                    Why These Names Make Sense
                  </h3>
                  <div className="text-sm text-blue-800 dark:text-blue-200 space-y-3">
                    <div>
                      <strong>Wealth Gods:</strong> "Wealth God" vs "Fortune God" immediately conveys the difference between salary vs investment income. Far clearer than "Direct" vs "Indirect" wealth.
                    </div>
                    <div>
                      <strong>Authority Gods:</strong> "Authority God" evokes civil authority and structured leadership. "War God" suggests military-style direct command. Much more intuitive than "Officer" vs "Seven Killings".
                    </div>
                    <div>
                      <strong>Output Gods:</strong> "Prosperity God" captures the gentle, nurturing quality of creative expression. "Drama God" conveys the dramatic, rebellious nature of innovation. Infinitely better than "Eating God" and "Hurting Officer".
                    </div>
                    <div>
                      <strong>Support Gods:</strong> "Scholar God" suggests motherly, educational support. "Oracle God" hints at unclear, conditional help. More meaningful than "Direct/Indirect Resource".
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Concepts */}
            <Card>
              <CardHeader>
                <CardTitle>Key Concepts Explained</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Day Master (日干)
                    </h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <li>• Your core identity in the BaZi system</li>
                      <li>• All analysis revolves around this central element</li>
                      <li>• Determines your fundamental nature and life approach</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Polarity System
                    </h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <li>• Same polarity = Natural resonance but potential conflict</li>
                      <li>• Opposite polarity = Attraction and complementary relationship</li>
                      <li>• Similar to magnetic forces: like poles repel, opposite poles attract</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Balance Concept
                    </h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <li>• <strong>Strong (旺):</strong> Too much of an element</li>
                      <li>• <strong>Weak (弱):</strong> Too little of an element</li>
                      <li>• <strong>Focal Element (用神):</strong> The key element for balance</li>
                      <li>• <strong>Unfavorable Element (忌神):</strong> What disrupts balance</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      God Interactions
                    </h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <li>• Support Gods: What produces you</li>
                      <li>• Peer Gods: Same as you</li>
                      <li>• Output Gods: What you produce</li>
                      <li>• Wealth Gods: What you control</li>
                      <li>• Authority Gods: What controls you</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Practical Applications */}
            <Card>
              <CardHeader>
                <CardTitle>Practical Applications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  {applications.map((app, index) => {
                    const IconComponent = app.icon
                    return (
                      <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <IconComponent className={`h-6 w-6 ${app.color}`} />
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {app.title}
                          </h3>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {app.description.split('\n').map((line, lineIndex) => (
                            <div key={lineIndex} className="mb-1">
                              {line}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Cultural Context */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Cultural Context
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg border">
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    BaZi is not merely fortune-telling, but also a sophisticated personality analysis system that helps people:
                  </p>
                  <ul className="text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Understand their natural tendencies</li>
                    <li>• Make better life decisions</li>
                    <li>• Optimize timing for important events</li>
                    <li>• Improve relationships and career choices</li>
                  </ul>
                  <p className="text-gray-700 dark:text-gray-300 mt-3">
                    Think of it as an ancient Chinese version of personality psychology, similar to how Myers-Briggs or Enneagram are used in Western psychology today.
                  </p>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    Historical Significance
                  </h3>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    This system has been used for over 1,000 years in Chinese culture and continues to be a valuable tool for self-understanding and life guidance. Through thoughtful translation, we hope to make these profound insights accessible to the global community.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </EnglishLayout>
  )

  return isMobile ? <MobileContent /> : <DesktopContent />
} 