'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft,
  Star,
  User,
  Briefcase,
  Heart,
  Target,
  AlertTriangle,
  Eye,
  MessageCircle,
  Clock,
  BookOpen
} from 'lucide-react'
import { useIsMobile } from '@/hooks/useDeviceType'
import MobileAppLayout from '@/components/MobileAppLayout'
import EnglishLayout from '@/components/EnglishLayout'

export default function FourteenStarsWikiPageEN() {
  const router = useRouter()
  const isMobile = useIsMobile()

  // 14 Primary Stars detailed information
  const primaryStars = [
    {
      id: 'ziwei',
      chineseName: '紫微星',
      name: 'Emperor Star',
      element: 'Earth',
      nature: 'Big Dipper',
      coreEssence: 'Leadership and nobility',
      symbolism: 'The North Star - constant, central, commanding respect',
      keyTraits: [
        'Natural-born leaders with strong presence',
        'High self-esteem and dignity',
        'Excellent organizational and management skills',
        'Prefer to be in control and make decisions'
      ],
      idealCareers: 'CEO, politician, director, team leader',
      relationshipStyle: 'Protective but can be domineering',
      lifeApproach: 'Seeks positions of authority and influence',
      challenges: 'Can be arrogant, struggles with taking orders',
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
    },
    {
      id: 'tianji',
      chineseName: '天机星',
      name: 'Wisdom Star',
      element: 'Wood',
      nature: 'Southern Dipper',
      coreEssence: 'Strategic intelligence and adaptability',
      symbolism: 'The cosmic strategist - always calculating the best moves',
      keyTraits: [
        'Brilliant strategic mind and quick wit',
        'Loves learning and intellectual challenges',
        'Adaptable but sometimes inconsistent',
        'Excellent at seeing patterns and connections'
      ],
      idealCareers: 'Consultant, strategist, researcher, programmer',
      relationshipStyle: 'Values mental connection and intellectual stimulation',
      lifeApproach: 'Constantly seeking knowledge and new perspectives',
      challenges: 'Overthinking, difficulty with routine tasks',
      color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
    },
    {
      id: 'taiyang',
      chineseName: '太阳星',
      name: 'Solar Star',
      element: 'Fire',
      nature: 'Central Heaven',
      coreEssence: 'Radiant energy and benevolence',
      symbolism: 'The sun - illuminating and energizing everything around',
      keyTraits: [
        'Generous and warm-hearted',
        'Strong sense of justice and fairness',
        'Enjoys helping others succeed',
        'High energy but can burn out'
      ],
      idealCareers: 'Teacher, social worker, public relations, healthcare',
      relationshipStyle: 'Giving and supportive, sometimes self-sacrificing',
      lifeApproach: 'Focuses on contribution to society',
      challenges: 'Tendency to give too much, neglecting self-care',
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300'
    },
    {
      id: 'wuqu',
      chineseName: '武曲星',
      name: 'Martial Wealth Star',
      element: 'Metal',
      nature: 'Big Dipper',
      coreEssence: 'Financial acumen and decisive action',
      symbolism: 'The military commander - strategic with resources and bold in execution',
      keyTraits: [
        'Excellent with money and financial planning',
        'Decisive and practical',
        'Strong willpower and determination',
        'Direct communication style'
      ],
      idealCareers: 'Finance, banking, entrepreneurship, military',
      relationshipStyle: 'Loyal but may struggle with emotional expression',
      lifeApproach: 'Goal-oriented with focus on material security',
      challenges: 'Can be stubborn, impatient with inefficiency',
      color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300'
    },
    {
      id: 'tiantong',
      chineseName: '天同星',
      name: 'Harmonizer Star',
      element: 'Water',
      nature: 'Southern Dipper',
      coreEssence: 'Peace and contentment',
      symbolism: 'The gentle breeze - bringing calm and comfort wherever it goes',
      keyTraits: [
        'Peaceful and easy-going nature',
        'Excellent mediator and peacemaker',
        'Appreciates beauty and comfort',
        'Avoids conflict when possible'
      ],
      idealCareers: 'Counselor, HR, hospitality, arts and design',
      relationshipStyle: 'Supportive and harmonious partner',
      lifeApproach: 'Seeks balance and avoids stress',
      challenges: 'May lack ambition, avoids necessary confrontations',
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
    },
    {
      id: 'lianzhen',
      chineseName: '廉贞星',
      name: 'Paradox Star',
      element: 'Fire',
      nature: 'Big Dipper',
      coreEssence: 'Creative contradiction and transformation',
      symbolism: 'The paradox - beauty and destruction, creation and chaos in one',
      keyTraits: [
        'Emotionally complex and intense',
        'Strong artistic and creative abilities',
        'Charismatic and magnetic personality',
        'Can be both inspiring and volatile'
      ],
      idealCareers: 'Artist, performer, therapist, creative director',
      relationshipStyle: 'Passionate but can be possessive',
      lifeApproach: 'Seeks authentic self-expression through extremes',
      challenges: 'Emotional volatility, tendency toward contradictory behavior',
      color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
    },
    {
      id: 'tianfu',
      chineseName: '天府星',
      name: 'Treasurer Star',
      element: 'Earth',
      nature: 'Southern Dipper',
      coreEssence: 'Stability and resource management',
      symbolism: 'The royal treasury - secure, abundant, and well-organized',
      keyTraits: [
        'Natural ability to accumulate and manage resources',
        'Conservative and practical approach',
        'Reliable and trustworthy',
        'Values tradition and stability'
      ],
      idealCareers: 'Accounting, real estate, banking, administration',
      relationshipStyle: 'Steady and dependable partner',
      lifeApproach: 'Building long-term security and wealth',
      challenges: 'Can be overly cautious, resistant to change',
      color: 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300'
    },
    {
      id: 'taiyin',
      chineseName: '太阴星',
      name: 'Lunar Star',
      element: 'Water',
      nature: 'Central Heaven',
      coreEssence: 'Gentle intuition and nurturing care',
      symbolism: 'The moon - soft, receptive, and emotionally guided',
      keyTraits: [
        'Highly intuitive and empathetic',
        'Gentle and caring nature',
        'Strong connection to family and home',
        'Prefers indirect rather than confrontational approaches'
      ],
      idealCareers: 'Healthcare, education, psychology, family services',
      relationshipStyle: 'Nurturing and emotionally supportive',
      lifeApproach: 'Values emotional connections and family harmony',
      challenges: 'Can be overly sensitive, avoids direct confrontation',
      color: 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300'
    },
    {
      id: 'tanlang',
      chineseName: '贪狼星',
      name: 'Desire Star',
      element: 'Wood',
      nature: 'Big Dipper',
      coreEssence: 'Passion and versatility',
      symbolism: 'The seeker - driven by various desires and constantly exploring',
      keyTraits: [
        'Multi-talented and versatile',
        'Strong drive for success and pleasure',
        'Charismatic and socially skilled',
        'Can be easily tempted by new opportunities'
      ],
      idealCareers: 'Sales, entertainment, marketing, entrepreneurship',
      relationshipStyle: 'Charming but may struggle with commitment',
      lifeApproach: 'Pursues multiple interests and experiences',
      challenges: 'Inconsistency, difficulty focusing on one path',
      color: 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300'
    },
    {
      id: 'jumen',
      chineseName: '巨门星',
      name: 'Great Gate Star',
      element: 'Water',
      nature: 'Big Dipper',
      coreEssence: 'Perceptive communication and investigation',
      symbolism: 'The one who hears all whispers - detecting truth beneath the surface',
      keyTraits: [
        'Excellent communicator and speaker',
        'Investigative and analytical mind',
        'Strong sense of right and wrong',
        'Highly perceptive of hidden meanings'
      ],
      idealCareers: 'Lawyer, journalist, detective, public speaker',
      relationshipStyle: 'Values honest communication but can be critical',
      lifeApproach: 'Seeks truth and exposes what\'s hidden',
      challenges: 'Can be overly critical, tendency to gossip',
      color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
    },
    {
      id: 'tianxiang',
      chineseName: '天相星',
      name: 'Minister Star',
      element: 'Water',
      nature: 'Southern Dipper',
      coreEssence: 'Loyal service and diplomatic support',
      symbolism: 'The trusted minister - serving faithfully behind the throne',
      keyTraits: [
        'Natural helper and supporter',
        'Diplomatic and tactful',
        'Strong sense of duty and responsibility',
        'Prefers to work behind the scenes'
      ],
      idealCareers: 'Executive assistant, advisor, customer service, diplomacy',
      relationshipStyle: 'Supportive and accommodating partner',
      lifeApproach: 'Finds fulfillment in helping others succeed',
      challenges: 'May neglect own needs, can be indecisive',
      color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-300'
    },
    {
      id: 'tianliang',
      chineseName: '天梁星',
      name: 'Mentor Star',
      element: 'Earth',
      nature: 'Southern Dipper',
      coreEssence: 'Wisdom and protection',
      symbolism: 'The wise elder - offering guidance and shelter to those in need',
      keyTraits: [
        'Mature and wise beyond years',
        'Natural protector and guide',
        'Strong moral compass',
        'Enjoys teaching and mentoring'
      ],
      idealCareers: 'Teacher, counselor, coach, religious leader',
      relationshipStyle: 'Protective and guiding, sometimes controlling',
      lifeApproach: 'Seeks to help others grow and develop',
      challenges: 'Can be preachy, tendency to control others\' choices',
      color: 'bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-300'
    },
    {
      id: 'qisha',
      chineseName: '七杀星',
      name: 'Killings Star',
      element: 'Metal',
      nature: 'Southern Dipper',
      coreEssence: 'Courage and independence',
      symbolism: 'The lone warrior - brave, independent, and ready for any challenge',
      keyTraits: [
        'Fearless and adventurous',
        'Strong independent streak',
        'Natural crisis manager',
        'Dislikes routine and constraints'
      ],
      idealCareers: 'Emergency services, military, extreme sports, crisis management',
      relationshipStyle: 'Independent but loyal once committed',
      lifeApproach: 'Seeks challenge and adventure',
      challenges: 'Can be reckless, difficulty with authority and routine',
      color: 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-300'
    },
    {
      id: 'pojun',
      chineseName: '破军星',
      name: 'Revolution Star',
      element: 'Water',
      nature: 'Big Dipper',
      coreEssence: 'Transformation and innovation',
      symbolism: 'The revolutionary - breaking down old systems to build something better',
      keyTraits: [
        'Pioneer and innovator',
        'Thrives on change and transformation',
        'Creative problem solver',
        'Can be disruptive and unstable'
      ],
      idealCareers: 'Startup founder, innovator, artist, change management',
      relationshipStyle: 'Exciting but unpredictable partner',
      lifeApproach: 'Constantly seeking to improve and revolutionize',
      challenges: 'Can be destructive, difficulty maintaining stability',
      color: 'bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300'
    }
  ]

  const handleBack = () => {
    router.push('/en/wiki/ziwei')
  }

  const StarCard = ({ star }: { star: typeof primaryStars[0] }) => (
    <Card className="mb-6 transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${star.color}`}>
              <Star className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl">{star.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{star.chineseName}</p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="mb-1">
              {star.element}
            </Badge>
            <p className="text-xs text-muted-foreground">{star.nature}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Core Essence */}
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-purple-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-purple-700 dark:text-purple-300">Core Essence</h4>
              <p className="text-sm text-muted-foreground">{star.coreEssence}</p>
            </div>
          </div>

          {/* Symbolism */}
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-700 dark:text-blue-300">Symbolism</h4>
              <p className="text-sm text-muted-foreground">{star.symbolism}</p>
            </div>
          </div>

          {/* Key Traits */}
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-700 dark:text-green-300">Key Traits</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {star.keyTraits.map((trait, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>{trait}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Ideal Careers */}
          <div className="flex items-start gap-3">
            <Briefcase className="w-5 h-5 text-orange-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-700 dark:text-orange-300">Ideal Careers</h4>
              <p className="text-sm text-muted-foreground">{star.idealCareers}</p>
            </div>
          </div>

          {/* Relationship Style */}
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-pink-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-pink-700 dark:text-pink-300">Relationship Style</h4>
              <p className="text-sm text-muted-foreground">{star.relationshipStyle}</p>
            </div>
          </div>

          {/* Life Approach */}
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-indigo-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-indigo-700 dark:text-indigo-300">Life Approach</h4>
              <p className="text-sm text-muted-foreground">{star.lifeApproach}</p>
            </div>
          </div>

          {/* Challenges */}
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-700 dark:text-red-300">Challenges</h4>
              <p className="text-sm text-muted-foreground">{star.challenges}</p>
            </div>
          </div>
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
              <h1 className="text-2xl font-bold mb-2">The 14 Primary Stars Guide</h1>
              <p className="text-muted-foreground mb-4">
                Comprehensive guide to the 14 main stars in Ziwei Dou Shu and their modern applications
              </p>
              <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>4,521 views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>20 min</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>287 comments</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Introduction */}
        <Card>
          <CardContent className="pt-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2>What are the 14 Primary Stars?</h2>
              <p>
                The 14 Primary Stars (十四主星) are the core of the Ziwei Dou Shu system. They are: 
                Ziwei (Emperor), Tianji (Wisdom), Taiyang (Solar), Wuqu (Martial Wealth), Tiantong (Harmonizer), 
                Lianzhen (Paradox), Tianfu (Treasurer), Taiyin (Lunar), Tanlang (Desire), Jumen (Great Gate), 
                Tianxiang (Minister), Tianliang (Mentor), Qisha (Killings), and Pojun (Revolution).
              </p>
              <p>
                Each star represents different personality archetypes and life patterns. They are classified by 
                five elements and belong to three star systems: Big Dipper, Southern Dipper, and Central Heaven. 
                Their positions in your natal chart determine your basic personality, talents, and life direction.
              </p>
              <h2>How to Use This Guide?</h2>
              <ul>
                <li><strong>Career Guidance:</strong> Match your primary star with suitable professions</li>
                <li><strong>Relationship Understanding:</strong> Learn your communication and love styles</li>
                <li><strong>Personal Development:</strong> Identify strengths to develop and challenges to overcome</li>
                <li><strong>Life Direction:</strong> Understand your natural inclinations and life themes</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                <strong>Remember:</strong> Most people have multiple stars influencing their chart. This guide provides 
                the core essence of each star for foundational understanding.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 14 Primary Stars Content */}
        <div className="space-y-4">
          {primaryStars.map((star) => (
            <StarCard key={star.id} star={star} />
          ))}
        </div>
      </div>
    </MobileAppLayout>
  )

  const DesktopContent = () => (
    <EnglishLayout>
      <div className="max-w-4xl mx-auto p-6">
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
          <h1 className="text-4xl font-bold mb-4">The 14 Primary Stars Guide</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Comprehensive guide to the 14 main stars in Ziwei Dou Shu and their modern applications
          </p>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>4,521 views</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Reading time: 20 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span>287 comments</span>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="prose dark:prose-invert max-w-none mb-8">
          <h2>What are the 14 Primary Stars?</h2>
          <p>
            The 14 Primary Stars (十四主星) are the core of the Ziwei Dou Shu system, often called "The Emperor of Chinese Astrology." 
            They are: Ziwei (Emperor), Tianji (Wisdom), Taiyang (Solar), Wuqu (Martial Wealth), Tiantong (Harmonizer), 
            Lianzhen (Paradox), Tianfu (Treasurer), Taiyin (Lunar), Tanlang (Desire), Jumen (Great Gate), 
            Tianxiang (Minister), Tianliang (Mentor), Qisha (Killings), and Pojun (Revolution).
          </p>
          <p>
            Each star represents different personality archetypes and life patterns with remarkable precision. They are classified by 
            five elements (Wood, Fire, Earth, Metal, Water) and belong to three star systems: Big Dipper (北斗), Southern Dipper (南斗), 
            and Central Heaven (中天). Their positions in your natal chart determine your basic personality, natural talents, 
            career inclinations, and overall life direction.
          </p>
          <h2>How to Use This Guide?</h2>
          <ul>
            <li><strong>Career Guidance:</strong> Match your primary star with suitable professions and work environments</li>
            <li><strong>Relationship Understanding:</strong> Learn your communication patterns and romantic compatibility</li>
            <li><strong>Personal Development:</strong> Identify natural strengths to leverage and challenges to overcome</li>
            <li><strong>Life Direction:</strong> Understand your authentic path and natural life themes</li>
          </ul>
          <p className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
            <strong>Important Note:</strong> Most people have multiple stars influencing their chart, creating unique combinations. 
            This guide provides the core essence of each individual star for foundational understanding. For complete analysis, 
            consider the interactions between all stars in your personal chart.
          </p>
        </div>

        {/* 14 Primary Stars Content */}
        <div className="grid gap-6">
          {primaryStars.map((star) => (
            <StarCard key={star.id} star={star} />
          ))}
        </div>
      </div>
    </EnglishLayout>
  )

  return isMobile ? <MobileContent /> : <DesktopContent />
} 