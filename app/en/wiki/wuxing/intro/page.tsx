'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import EnglishLayout from '@/components/EnglishLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Sparkles, Info, Star, Compass, Users, BookOpen } from 'lucide-react'

export default function WuxingIntroPage() {
  const router = useRouter()
  const [selectedElement, setSelectedElement] = useState<string | null>(null)

  const elements = [
    {
      name: 'Wood (木 - mù)',
      color: 'from-green-100 to-emerald-200 dark:from-green-900/40 dark:to-emerald-800/40',
      textColor: 'text-green-700 dark:text-green-300',
      borderColor: 'border-green-200 dark:border-green-800',
      qualities: ['Growth', 'Expansion', 'Vitality', 'Creativity', 'Flexibility'],
      season: 'Spring',
      direction: 'East',
      color_assoc: 'Green',
      emotion: 'Anger',
      emoji: '🌱',
      description: 'Represents growth, expansion, and creative energy'
    },
    {
      name: 'Fire (火 - huǒ)',
      color: 'from-red-100 to-rose-200 dark:from-red-900/40 dark:to-rose-800/40',
      textColor: 'text-red-700 dark:text-red-300',
      borderColor: 'border-red-200 dark:border-red-800',
      qualities: ['Ascending Energy', 'Passion', 'Heat', 'Transformation', 'Peak Activity'],
      season: 'Summer',
      direction: 'South',
      color_assoc: 'Red',
      emotion: 'Joy',
      emoji: '🔥',
      description: 'Represents ascending energy, passion, and transformation'
    },
    {
      name: 'Earth (土 - tǔ)',
      color: 'from-amber-100 to-yellow-200 dark:from-amber-900/40 dark:to-yellow-800/40',
      textColor: 'text-amber-700 dark:text-amber-300',
      borderColor: 'border-amber-200 dark:border-amber-800',
      qualities: ['Stability', 'Nourishment', 'Grounding', 'Balance', 'Thoughtfulness'],
      season: 'Late Summer',
      direction: 'Center',
      color_assoc: 'Yellow',
      emotion: 'Worry',
      emoji: '🌍',
      description: 'Represents stability, nourishment, and grounding'
    },
    {
      name: 'Metal (金 - jīn)',
      color: 'from-gray-100 to-slate-200 dark:from-gray-900/40 dark:to-slate-800/40',
      textColor: 'text-gray-700 dark:text-gray-300',
      borderColor: 'border-gray-200 dark:border-gray-800',
      qualities: ['Contraction', 'Structure', 'Order', 'Strength', 'Harvesting'],
      season: 'Autumn',
      direction: 'West',
      color_assoc: 'White',
      emotion: 'Grief',
      emoji: '⚡',
      description: 'Represents contraction, structure, and order'
    },
    {
      name: 'Water (水 - shuǐ)',
      color: 'from-blue-100 to-cyan-200 dark:from-blue-900/40 dark:to-cyan-800/40',
      textColor: 'text-blue-700 dark:text-blue-300',
      borderColor: 'border-blue-200 dark:border-blue-800',
      qualities: ['Descending Energy', 'Stillness', 'Conservation', 'Wisdom', 'Potential'],
      season: 'Winter',
      direction: 'North',
      color_assoc: 'Black',
      emotion: 'Fear',
      emoji: '💧',
      description: 'Represents descending energy, stillness, and potential'
    }
  ]

  const applications = [
    {
      title: 'Traditional Chinese Medicine (TCM)',
      description: 'Each element corresponds to an organ system. The cycles are used to diagnose and treat illnesses by restoring balance.',
      icon: '🏥',
      color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
    },
    {
      title: 'Feng Shui',
      description: 'To harmonize the energy within a space for better health, wealth, and happiness.',
      icon: '🏠',
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    },
    {
      title: 'Martial Arts',
      description: 'To develop strategies and techniques based on the principles of overcoming and generating.',
      icon: '🥋',
      color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    },
    {
      title: 'Chinese Astrology',
      description: 'Used in systems like Bazi (Four Pillars of Destiny) to analyze character, potential, and life path.',
      icon: '⭐',
      color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
    },
    {
      title: 'Music, Food & Governance',
      description: 'The theory has historically been applied to a vast range of other fields.',
      icon: '🎵',
      color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    }
  ]

  const ElementCard = ({ element, isSelected, onClick }: { element: typeof elements[0], isSelected: boolean, onClick: () => void }) => (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'} bg-gradient-to-br ${element.color} ${element.borderColor} border-2`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-3xl">{element.emoji}</span>
          <Badge variant="outline" className={element.textColor}>
            {element.name.split(' ')[0]}
          </Badge>
        </div>
        <h3 className={`font-bold text-lg ${element.textColor} mb-1`}>
          {element.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          {element.description}
        </p>
        
        {isSelected && (
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Qualities:</h4>
              <div className="flex flex-wrap gap-1">
                {element.qualities.map((quality, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {quality}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">Season:</span>
                <p className="text-gray-700 dark:text-gray-300">{element.season}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">Direction:</span>
                <p className="text-gray-700 dark:text-gray-300">{element.direction}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">Color:</span>
                <p className="text-gray-700 dark:text-gray-300">{element.color_assoc}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">Emotion:</span>
                <p className="text-gray-700 dark:text-gray-300">{element.emotion}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <EnglishLayout>
      <div className="max-w-4xl mx-auto p-4 space-y-6">
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
              What are the Five Elements?
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Wu Xing (五行) - The cornerstone of traditional Chinese philosophy
            </p>
          </div>
        </div>

        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Introduction to Wu Xing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                The Five Elements, or <strong>Wǔ Xíng (五行)</strong>, is a cornerstone of traditional Chinese philosophy. It's a five-fold conceptual model used to explain the composition of the universe and the relationships, interactions, and cycles within it.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                It's important to understand that these "elements" are not just the literal substances we know. Instead, they represent <strong>five fundamental processes, qualities, and phases of energy (Qi)</strong> that are in constant motion and change.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Five Elements Interactive */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              The Five Elements
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click on any element to explore its qualities, associations, and correspondences
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {elements.map((element) => (
                <ElementCard
                  key={element.name}
                  element={element}
                  isSelected={selectedElement === element.name}
                  onClick={() => setSelectedElement(
                    selectedElement === element.name ? null : element.name
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cycles Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-blue-600" />
              The Cycles of Interaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The relationships between these five elements are defined by two primary cycles:
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                  The Generation Cycle (相生 - xiāngshēng)
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                  This is a creative and nurturing cycle where each element gives rise to the next.
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 font-mono">
                  Wood feeds Fire → Fire creates Earth → Earth bears Metal → Metal carries Water → Water nourishes Wood
                </p>
              </div>
              
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                  The Overcoming Cycle (相克 - xiāngkè)
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                  Also known as the Destruction or Control cycle, this is a balancing and regulating cycle where each element controls another.
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 font-mono">
                  Wood parts Earth → Earth dams Water → Water extinguishes Fire → Fire melts Metal → Metal chops Wood
                </p>
              </div>
            </div>
            
            <div className="mt-4 flex justify-center">
              <Button
                onClick={() => router.push('/en/wiki/wuxing/wuxing-shengke')}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Learn More About the Cycles
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Why is Wu Xing Important? */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Why is Wu Xing Important?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The theory of the Five Elements is not just an abstract idea; it's the foundation for many traditional Chinese practices, providing a framework to understand and influence the flow of energy in:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applications.map((app) => (
                <Card key={app.title} className={`${app.color} border`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{app.icon}</span>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{app.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{app.description}</p>
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
              <Compass className="h-5 w-5 text-purple-600" />
              The Dynamic Map of the Universe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              In essence, <strong>Wu Xing is a dynamic map of how everything in the universe is interconnected and in a constant state of flux</strong>. It provides a sophisticated framework for understanding the patterns and relationships that govern both the natural world and human experience.
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
            onClick={() => router.push('/en/wiki/wuxing/wuxing-shengke')}
            className="flex items-center gap-2"
          >
            Generation & Destruction Cycles
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </EnglishLayout>
  )
} 