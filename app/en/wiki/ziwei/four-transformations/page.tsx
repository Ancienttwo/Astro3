'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft,
  Calendar,
  Coins,
  TrendingUp,
  TrendingDown,
  Leaf,
  Snowflake,
  Sun,
  Zap,
  Eye,
  MessageCircle,
  Clock,
  BookOpen,
  Target,
  Heart,
  ShieldCheck
} from 'lucide-react'
import { useIsMobile } from '@/hooks/useDeviceType'
import MobileAppLayout from '@/components/MobileAppLayout'
import EnglishLayout from '@/components/EnglishLayout'

export default function FourTransformationsWikiPageEN() {
  const router = useRouter()
  const isMobile = useIsMobile()

  const handleBack = () => {
    router.push('/en/wiki/ziwei')
  }

  // Four Transformations data
  const transformations = [
    {
      id: 'lu',
      chineseName: '化禄',
      name: 'A-Transformation: Affluence',
      season: 'Autumn Harvest 🍂',
      seasonIcon: <Leaf className="w-6 h-6 text-orange-500" />,
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300',
      borderColor: 'border-orange-200 dark:border-orange-800',
      karmicDimension: {
        title: 'Karmic Dimension (事)',
        aspects: [
          'Fated connections and divine arrangements',
          'Natural magnetism attracting opportunities',
          'Perfect timing for new beginnings',
          'Life supporting your endeavors effortlessly'
        ]
      },
      emotionalDimension: {
        title: 'Emotional Dimension (人)',
        aspects: [
          'Unconditional love and acceptance',
          'Generous, giving nature',
          'Creating harmony in relationships',
          'Loving without conditions or expectations'
        ]
      },
      materialDimension: {
        title: 'Material Dimension (物)',
        aspects: [
          'Abundant Income: Natural flow of wealth and resources',
          'Fruitful Returns: Investments and efforts paying off',
          'Seed Preparation: Saving and planning for future growth',
          'Generous Sharing: Having enough to give to others',
          'Sustainable Wealth: Resources that regenerate naturally'
        ],
        materialExpression: 'Money comes easily and naturally, like autumn harvest. You not only reap what you\'ve sown but also prepare seeds for next year\'s abundance.'
      }
    },
    {
      id: 'quan',
      chineseName: '化权',
      name: 'B-Transformation: Authority',
      season: 'Summer Storm ⛈️',
      seasonIcon: <Zap className="w-6 h-6 text-yellow-500" />,
      color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      karmicDimension: {
        title: 'Karmic Dimension (事)',
        aspects: [
          'Sudden, uncontrollable life changes',
          'Divine intervention disrupting plans',
          'Forced power shifts and accelerated lessons',
          'Cosmic intervention requiring immediate action'
        ]
      },
      emotionalDimension: {
        title: 'Emotional Dimension (人)',
        aspects: [
          'Possessive, controlling behavior',
          '"You belong to me" mentality',
          'Fear of loss triggering dominance',
          'Taking charge through force'
        ]
      },
      materialDimension: {
        title: 'Material Dimension (物)',
        aspects: [
          'Sudden Wealth: Money arriving quickly and unexpectedly',
          'Rapid Loss: Resources disappearing as fast as they came',
          'High Volatility: Dramatic financial ups and downs',
          'Speculative Gains: Quick profits from bold moves',
          'Temporary Abundance: Wealth that doesn\'t last long'
        ],
        materialExpression: 'Money comes like summer storms - sudden, intense, and often gone quickly. High risk, high reward patterns dominate your financial life.'
      }
    },
    {
      id: 'ke',
      chineseName: '化科',
      name: 'C-Transformation: Merit',
      season: 'Spring Growth 🌱',
      seasonIcon: <Sun className="w-6 h-6 text-green-500" />,
      color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
      borderColor: 'border-green-200 dark:border-green-800',
      karmicDimension: {
        title: 'Karmic Dimension (事)',
        aspects: [
          'Soul recognition and emotional destiny',
          'Connections meant for heart learning',
          'Deep bonds transcending ordinary friendship',
          'Relationships designed for mutual growth'
        ]
      },
      emotionalDimension: {
        title: 'Emotional Dimension (人)',
        aspects: [
          'Genuine appreciation and liking',
          'Warm, comfortable affection',
          'Intellectual and spiritual attraction',
          'Mutual respect and admiration'
        ]
      },
      materialDimension: {
        title: 'Material Dimension (物)',
        aspects: [
          'Steady Accumulation: Wealth building slowly but consistently',
          'Continuous Flow: Regular, reliable income streams',
          'Patient Investment: Long-term financial strategies',
          'Network Benefits: Money through relationships and connections',
          'Sustainable Growth: Resources that compound over time'
        ],
        materialExpression: 'Money flows like spring rain - gentle, consistent, and nurturing growth. Your wealth builds through patience, relationships, and steady effort.'
      }
    },
    {
      id: 'ji',
      chineseName: '化忌',
      name: 'D-Transformation: Adversity',
      season: 'Winter Storage 🐻',
      seasonIcon: <Snowflake className="w-6 h-6 text-blue-500" />,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
      borderColor: 'border-blue-200 dark:border-blue-800',
      karmicDimension: {
        title: 'Karmic Dimension (事)',
        aspects: [
          'Unfinished business requiring resolution',
          'Necessary endings and closures',
          'Karmic debt balancing',
          'Spiritual cleansing through loss'
        ]
      },
      emotionalDimension: {
        title: 'Emotional Dimension (人)',
        aspects: [
          'Deep resentment and grudges',
          'Bitter disappointment and blame',
          'Unhealed emotional wounds',
          'Anger at perceived injustices'
        ]
      },
      materialDimension: {
        title: 'Material Dimension (物)',
        aspects: [
          'Final Accumulation: Who ultimately gets the resources',
          'Hidden Reserves: Money stored away safely',
          'Inheritance Patterns: Wealth transferred through endings',
          'Protective Hoarding: Securing resources for survival',
          'Ultimate Ownership: Where possessions finally rest'
        ],
        materialExpression: 'Like bears preparing for winter hibernation, you accumulate and store resources for protection. Paradoxically, through loss and endings, you often gain the most lasting wealth.'
      }
    }
  ]

  const DimensionCard = ({ dimension, icon, title }: { dimension: any, icon: React.ReactNode, title: string }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className="font-medium text-purple-700 dark:text-purple-300">{title}</h4>
      </div>
      <ul className="space-y-2">
        {dimension.aspects.map((aspect: string, index: number) => (
          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
            <span>{aspect}</span>
          </li>
        ))}
      </ul>
      {dimension.materialExpression && (
        <div className="mt-3 p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium">{dimension.materialExpression}</p>
        </div>
      )}
    </div>
  )

  const TransformationCard = ({ transformation }: { transformation: typeof transformations[0] }) => (
    <Card className={`mb-6 transition-all duration-300 hover:shadow-lg border-2 ${transformation.borderColor}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${transformation.color}`}>
              {transformation.seasonIcon}
            </div>
            <div>
              <CardTitle className="text-xl">{transformation.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{transformation.chineseName}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {transformation.season}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {/* Karmic Dimension */}
          <DimensionCard 
            dimension={transformation.karmicDimension} 
            icon={<Target className="w-5 h-5 text-purple-500" />}
            title={transformation.karmicDimension.title}
          />
          
          {/* Emotional Dimension */}
          <DimensionCard 
            dimension={transformation.emotionalDimension} 
            icon={<Heart className="w-5 h-5 text-pink-500" />}
            title={transformation.emotionalDimension.title}
          />
          
          {/* Material Dimension */}
          <DimensionCard 
            dimension={transformation.materialDimension} 
            icon={<Coins className="w-5 h-5 text-green-500" />}
            title={transformation.materialDimension.title}
          />
        </div>
      </CardContent>
    </Card>
  )

  const MobileContent = () => (
    <MobileAppLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Article Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                  <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-2">The Four Transformations (Si Hua)</h1>
              <p className="text-muted-foreground mb-4">
                Complete guide to the A-B-C-D system operating across three dimensions of life
              </p>
              <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>2,765 views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>16 min</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>189 comments</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Introduction */}
        <Card>
          <CardContent className="pt-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2>The Three Dimensions System</h2>
              <p>
                In ZiWei Astrology, the Four Transformations operate across three distinct dimensions, 
                each representing a different aspect of life experience. They are commonly referred to 
                as the A-B-C-D system for simplicity.
              </p>
              <div className="grid gap-4 my-6">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">
                    1. Karmic Dimension (事) - The Events
                  </h3>
                  <p className="text-sm">How destiny orchestrates life situations and timing</p>
                </div>
                <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                  <h3 className="font-semibold text-pink-700 dark:text-pink-300 mb-2">
                    2. Emotional Dimension (人) - The People
                  </h3>
                  <p className="text-sm">How we emotionally respond to relationships and connections</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                    3. Material Dimension (物) - The Resources
                  </h3>
                  <p className="text-sm">How wealth, possessions, and material resources flow through our lives</p>
                </div>
              </div>
              <h2>The Four Seasons Financial Cycle</h2>
              <p>
                The transformations follow a natural progression through the seasons, each with its unique 
                wealth patterns and timing strategies.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Four Transformations */}
        <div className="space-y-4">
          {transformations.map((transformation) => (
            <TransformationCard key={transformation.id} transformation={transformation} />
          ))}
        </div>

        {/* Practical Applications */}
        <Card>
          <CardContent className="pt-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2>Practical Applications</h2>
              
              <h3>Investment Strategy by Season</h3>
              <ul>
                <li><strong>A-Years (Affluence):</strong> Harvest profits, make generous investments</li>
                <li><strong>B-Years (Authority):</strong> High-risk/high-reward opportunities</li>
                <li><strong>C-Years (Merit):</strong> Long-term growth investments, relationship building</li>
                <li><strong>D-Years (Adversity):</strong> Preserve capital, prepare for new cycles</li>
              </ul>

              <h3>The Tri-Dimensional Wisdom</h3>
              <p>
                Each transformation simultaneously operates as:
              </p>
              <ul>
                <li>An Event (karmic orchestration)</li>
                <li>An Emotion (human response)</li>
                <li>A Resource Flow (material manifestation)</li>
              </ul>

              <div className="bg-muted p-4 rounded-lg mt-4">
                <h4 className="font-semibold mb-2">Example - A-Force in Action:</h4>
                <ul className="space-y-1 text-sm">
                  <li><strong>Event:</strong> Meeting someone who becomes a key business partner</li>
                  <li><strong>Emotion:</strong> Feeling genuine love and trust for this person</li>
                  <li><strong>Resource:</strong> Money flowing naturally through this partnership</li>
                </ul>
              </div>

              <p className="text-center font-medium mt-6 text-purple-700 dark:text-purple-300">
                The Four Transformations teach us that life operates on multiple levels simultaneously - 
                every situation is both a karmic event, an emotional experience, and a material opportunity. 
                True wisdom lies in harmonizing all three dimensions of existence.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileAppLayout>
  )

  const DesktopContent = () => (
    <EnglishLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Ziwei Knowledge Base
          </Button>
        </div>

        {/* Article Title and Info */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900">
              <BookOpen className="w-12 h-12 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">The Four Transformations (Si Hua)</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Complete guide to the A-B-C-D system operating across three dimensions of life
          </p>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>2,765 views</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Reading time: 16 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span>189 comments</span>
            </div>
          </div>
        </div>

        {/* Introduction Section */}
        <div className="prose dark:prose-invert max-w-none mb-8">
          <h2>The Three Dimensions System</h2>
          <p>
            In ZiWei Astrology, the Four Transformations operate across three distinct dimensions, 
            each representing a different aspect of life experience. They are commonly referred to 
            as the A-B-C-D system for simplicity.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 my-8 not-prose">
            <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-8 h-8 text-purple-500" />
                <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                  Karmic Dimension (事)
                </h3>
              </div>
              <p className="text-purple-600 dark:text-purple-400">
                <strong>The Events:</strong> How destiny orchestrates life situations and timing
              </p>
            </div>
            
            <div className="p-6 bg-pink-50 dark:bg-pink-900/20 rounded-lg border-2 border-pink-200 dark:border-pink-800">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-8 h-8 text-pink-500" />
                <h3 className="text-lg font-semibold text-pink-700 dark:text-pink-300">
                  Emotional Dimension (人)
                </h3>
              </div>
              <p className="text-pink-600 dark:text-pink-400">
                <strong>The People:</strong> How we emotionally respond to relationships and connections
              </p>
            </div>
            
            <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-4">
                <Coins className="w-8 h-8 text-green-500" />
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                  Material Dimension (物)
                </h3>
              </div>
              <p className="text-green-600 dark:text-green-400">
                <strong>The Resources:</strong> How wealth, possessions, and material resources flow through our lives
              </p>
            </div>
          </div>

          <h2>Symbolized by the Four Seasons</h2>
          <p>
            The transformations follow a natural progression through the seasons, each with its unique 
            wealth patterns and timing strategies.
          </p>
        </div>

        {/* Four Transformations Content */}
        <div className="space-y-8">
          {transformations.map((transformation) => (
            <TransformationCard key={transformation.id} transformation={transformation} />
          ))}
        </div>

        {/* Practical Applications */}
        <div className="prose dark:prose-invert max-w-none mt-12">
          <h2>Practical Applications</h2>
          
          <div className="grid md:grid-cols-2 gap-8 not-prose my-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Investment Strategy by Season
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li><strong>A-Years (Affluence):</strong> Harvest profits, make generous investments</li>
                  <li><strong>B-Years (Authority):</strong> High-risk/high-reward opportunities</li>
                  <li><strong>C-Years (Merit):</strong> Long-term growth investments, relationship building</li>
                  <li><strong>D-Years (Adversity):</strong> Preserve capital, prepare for new cycles</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                  The Tri-Dimensional Wisdom
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Each transformation simultaneously operates as:</p>
                <ul className="space-y-2">
                  <li>• An Event (karmic orchestration)</li>
                  <li>• An Emotion (human response)</li>
                  <li>• A Resource Flow (material manifestation)</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted p-6 rounded-lg my-8">
            <h3 className="font-semibold mb-4 text-lg">Example - A-Force in Action:</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded">
                <strong className="text-purple-700 dark:text-purple-300">Event:</strong>
                <p className="text-sm mt-1">Meeting someone who becomes a key business partner</p>
              </div>
              <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded">
                <strong className="text-pink-700 dark:text-pink-300">Emotion:</strong>
                <p className="text-sm mt-1">Feeling genuine love and trust for this person</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded">
                <strong className="text-green-700 dark:text-green-300">Resource:</strong>
                <p className="text-sm mt-1">Money flowing naturally through this partnership</p>
              </div>
            </div>
          </div>

          <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg mt-8">
            <p className="text-lg font-medium text-purple-700 dark:text-purple-300">
              The Four Transformations teach us that life operates on multiple levels simultaneously - 
              every situation is both a karmic event, an emotional experience, and a material opportunity. 
              True wisdom lies in harmonizing all three dimensions of existence.
            </p>
          </div>
        </div>
      </div>
    </EnglishLayout>
  )

  return isMobile ? <MobileContent /> : <DesktopContent />
} 