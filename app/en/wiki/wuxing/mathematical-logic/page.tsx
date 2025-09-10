'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  BookOpen,
  Calculator,
  Target,
  Zap,
  Globe,
  TreePine,
  Flame,
  Mountain,
  Gem,
  Droplets,
  CheckCircle,
  XCircle,
  TrendingUp,
  Network,
  Lightbulb
} from 'lucide-react'
import { useIsMobile } from '@/hooks/useDeviceType'
import MobileAppLayout, { MobileCard } from '@/components/MobileAppLayout'
import EnglishLayout from '@/components/EnglishLayout'

export default function WuxingMathematicalLogicPage() {
  const router = useRouter()
  const isMobile = useIsMobile()

  // Five Elements data
  const elements = [
    {
      name: 'Wood',
      icon: TreePine,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      description: 'Growth, expansion, creativity'
    },
    {
      name: 'Fire',
      icon: Flame,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      description: 'Transformation, energy, activity'
    },
    {
      name: 'Earth',
      icon: Mountain,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      description: 'Stability, nourishment, centering'
    },
    {
      name: 'Metal',
      icon: Gem,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      description: 'Contraction, structure, refinement'
    },
    {
      name: 'Water',
      icon: Droplets,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      description: 'Flow, adaptability, conservation'
    }
  ]

  // Relational states
  const relationalStates = [
    { name: 'A generates B', description: 'I nurture/produce', icon: TrendingUp },
    { name: 'A restrains B', description: 'I control/limit', icon: Target },
    { name: 'B generates A', description: 'I am nurtured/produced', icon: Globe },
    { name: 'B restrains A', description: 'I am controlled/limited', icon: Network },
    { name: 'A harmonizes with B', description: 'I maintain equilibrium', icon: Zap }
  ]

  // Mathematical cases
  const mathematicalCases = [
    {
      elements: 2,
      name: 'Two Elements',
      relationships: 4,
      status: 'incomplete',
      description: 'Only 4 relationships possible, missing restraint relationships',
      verdict: 'Incomplete'
    },
    {
      elements: 3,
      name: 'Three Elements',
      relationships: 9,
      status: 'limited',
      description: 'Can form cycle, but limited to single relationship types',
      verdict: 'Too Simple'
    },
    {
      elements: 4,
      name: 'Four Elements',
      relationships: 16,
      status: 'invalid',
      description: 'Creates odd-vertex graph, cannot traverse in single continuous path',
      verdict: 'Mathematically Invalid'
    },
    {
      elements: 5,
      name: 'Five Elements',
      relationships: 25,
      status: 'optimal',
      description: 'Perfect cyclical structure, complete relational matrix',
      verdict: 'Mathematically Optimal'
    },
    {
      elements: 6,
      name: 'Six Elements',
      relationships: 36,
      status: 'complex',
      description: 'Overcomplicated with redundant categories',
      verdict: 'Unnecessarily Complex'
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
            onClick={() => router.push('/en/wiki/wuxing')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Wu Xing
          </Button>
        </div>

        {/* Title */}
        <MobileCard>
          <div className="text-center space-y-4">
            <Calculator className="h-12 w-12 text-purple-600 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              The Mathematical Logic Behind Chinese Five Elements
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Why Five Represents the Minimal Complete Relational System
            </p>
            <div className="flex justify-center gap-2">
              <Badge variant="outline">Mathematics</Badge>
              <Badge variant="outline">Systems Theory</Badge>
              <Badge variant="outline">Graph Theory</Badge>
            </div>
          </div>
        </MobileCard>

        {/* Introduction */}
        <MobileCard>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Introduction
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                Ancient Chinese philosophers conceived the universe as composed of Five Elements: Wood, Fire, Earth, Metal, Water - operating within the dynamic interplay of Yin-Yang forces.
              </p>
              <p>
                Unlike Western approaches that view elements as physical substances, Chinese Five Elements represent functional processes:
              </p>
            </div>
          </div>
        </MobileCard>

        {/* Five Elements Grid */}
        <MobileCard>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              The Five Elements
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {elements.map((element) => {
                const IconComponent = element.icon
                return (
                  <div key={element.name} className={`p-4 rounded-lg ${element.bgColor} border`}>
                    <div className="flex items-center gap-3">
                      <IconComponent className={`h-6 w-6 ${element.color}`} />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{element.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{element.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </MobileCard>

        {/* Mathematical Foundation */}
        <MobileCard>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Mathematical Foundation
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p className="font-medium">
                Core Mathematical Principle:
              </p>
              <p>
                For any element A interacting with element B, there must exist exactly five relational states:
              </p>
            </div>
            <div className="space-y-2">
              {relationalStates.map((state, index) => {
                const IconComponent = state.icon
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <IconComponent className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{state.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{state.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </MobileCard>

        {/* Mathematical Proof */}
        <MobileCard>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Mathematical Proof of Optimality
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p className="font-medium">
                Theorem: The minimum number of elements required for complete relational modeling is exactly 5.
              </p>
              <p>
                <strong>Proof by Combinatorial Analysis:</strong>
              </p>
              <ul className="space-y-1 ml-4">
                <li>• n elements in mutual interaction require n² relational nodes</li>
                <li>• For complete expression of all five relational states: 5² = 25 nodes</li>
                <li>• Minimum classification needed: 5 categories</li>
              </ul>
            </div>
          </div>
        </MobileCard>

        {/* Verification Cases */}
        <MobileCard>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Verification by Elimination
            </h2>
            <div className="space-y-3">
              {mathematicalCases.map((case_) => (
                <div key={case_.elements} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {case_.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {case_.relationships} relationships ({case_.elements}²)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {case_.status === 'optimal' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <Badge variant={case_.status === 'optimal' ? 'default' : 'destructive'}>
                        {case_.verdict}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {case_.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </MobileCard>

        {/* Euler's Theorem */}
        <MobileCard>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Euler's One-Stroke Theorem: The Decisive Evidence
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                <strong>Euler's One-Stroke Drawing Theorem (1736):</strong>
              </p>
              <ol className="space-y-1 ml-4">
                <li>1. Even-vertex connected graphs: Can definitely be drawn in one stroke</li>
                <li>2. Graphs with exactly two odd vertices: Can definitely be drawn in one stroke</li>
                <li>3. All other cases: Cannot be drawn in one stroke</li>
              </ol>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                  ❌ Four Elements System: Mathematical Failure
                </h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li>• 4 odd vertices (each connects 3 edges)</li>
                  <li>• According to Euler: Requires 2 strokes to complete</li>
                  <li>• <strong>Conclusion:</strong> Mathematically incomplete</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  ✅ Five Elements System: Mathematical Perfection
                </h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• 5 even vertices (each connects 4 edges)</li>
                  <li>• According to Euler: Can be drawn in one continuous stroke</li>
                  <li>• <strong>Conclusion:</strong> Mathematically perfect</li>
                </ul>
              </div>
            </div>
          </div>
        </MobileCard>

        {/* Systems Theory */}
        <MobileCard>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Systems Theory Perspective
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                The Five Elements system satisfies all requirements for a complete relational framework:
              </p>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span><strong>Closure:</strong> Every interaction produces a result within the system</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span><strong>Connectivity:</strong> Every element relates to every other element</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span><strong>Cyclical Stability:</strong> System returns to starting point</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span><strong>Dynamic Balance:</strong> Generative and restraint forces equilibrate</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span><strong>Minimal Sufficiency:</strong> No element is redundant, none missing</span>
                </div>
              </div>
            </div>
          </div>
        </MobileCard>

        {/* Historical Significance */}
        <MobileCard>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Historical Significance
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                Ancient Chinese philosophers, without access to modern graph theory, intuitively discovered the only mathematically correct complete relational system.
              </p>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  Timeline of Discovery
                </h4>
                <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                  <li>• <strong>6th Century BCE:</strong> China discovered Five Elements system</li>
                  <li>• <strong>1736 CE:</strong> Euler established graph theory proving its correctness</li>
                  <li>• <strong>Time Gap:</strong> China preceded Western mathematical proof by 2,300 years!</li>
                </ul>
              </div>
            </div>
          </div>
        </MobileCard>

        {/* Modern Applications */}
        <MobileCard>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Modern Applications
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                The Five Elements mathematical structure applies to:
              </p>
              <div className="grid grid-cols-1 gap-2">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <strong>Business Ecosystems:</strong> Five-role organizational optimization
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <strong>Ecological Networks:</strong> Five-level trophic stability
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <strong>AI/Machine Learning:</strong> Five-layer neural network architectures
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <strong>Social Systems:</strong> Five-person group dynamics optimization
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <strong>Economic Models:</strong> Five-phase business cycles
                </div>
              </div>
            </div>
          </div>
        </MobileCard>

        {/* Conclusion */}
        <MobileCard>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Conclusion: Mathematical Supremacy
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                Euler's One-Stroke Theorem provides irrefutable mathematical evidence that the Chinese Five Elements system represents humanity's earliest mathematical discovery of the Minimal Complete Relational System.
              </p>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Mathematical Properties:
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span><strong>Minimal:</strong> Uses fewest possible elements (5)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span><strong>Complete:</strong> Expresses all relational states</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span><strong>Cyclical:</strong> Maintains dynamic stability</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span><strong>Optimal:</strong> Graph-theoretically perfect</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span><strong>Universal:</strong> Applicable across all domains</span>
                  </div>
                </div>
              </div>
              <p className="text-center font-medium">
                Contemporary mathematics confirms what ancient Chinese wisdom discovered: <strong>Five is the mathematically optimal number for modeling complex relational systems.</strong>
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
              onClick={() => router.push('/en/wiki/wuxing')}
              className="mb-4 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Wu Xing Wiki
            </Button>
            
            <div className="text-center space-y-4">
              <Calculator className="h-16 w-16 text-purple-600 mx-auto" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                The Mathematical Logic Behind Chinese Five Elements
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Why Five Represents the Minimal Complete Relational System
              </p>
              <div className="flex justify-center gap-2">
                <Badge variant="outline">Mathematics</Badge>
                <Badge variant="outline">Systems Theory</Badge>
                <Badge variant="outline">Graph Theory</Badge>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Introduction: Two Paradigms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Chinese Five Elements Cosmology</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Ancient Chinese philosophers conceived the universe as composed of Five Elements: Wood, Fire, Earth, Metal, Water - operating within the dynamic interplay of Yin-Yang forces.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Unlike Western approaches that view elements as physical substances, Chinese Five Elements represent functional processes:
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {elements.map((element) => {
                        const IconComponent = element.icon
                        return (
                          <div key={element.name} className={`p-3 rounded-lg ${element.bgColor} border flex items-center gap-3`}>
                            <IconComponent className={`h-5 w-5 ${element.color}`} />
                            <div>
                              <strong>{element.name}:</strong> {element.description}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Western Four Elements Paradigm</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Greek Philosophy: Earth, Water, Air, Fire as fundamental material building blocks
                    </p>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li>• Static compositional model: "What is everything made of?"</li>
                      <li>• Reductionist approach: Break complex into simple components</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mathematical Foundation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  The Mathematical Foundation: Why Five is Optimal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Core Mathematical Principle:
                  </h4>
                  <p className="text-blue-700 dark:text-blue-300">
                    For any element A interacting with element B, there must exist exactly five relational states:
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {relationalStates.map((state, index) => {
                    const IconComponent = state.icon
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <IconComponent className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{state.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{state.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Mathematical Proof */}
            <Card>
              <CardHeader>
                <CardTitle>Mathematical Proof of Optimality</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    Theorem: The minimum number of elements required for complete relational modeling is exactly 5.
                  </p>
                  <div className="text-purple-700 dark:text-purple-300">
                    <p className="font-medium mb-2">Proof by Combinatorial Analysis:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• n elements in mutual interaction require n² relational nodes</li>
                      <li>• For complete expression of all five relational states: 5² = 25 nodes</li>
                      <li>• Minimum classification needed: 5 categories</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Verification by Elimination:</h4>
                  <div className="grid gap-4">
                    {mathematicalCases.map((case_) => (
                      <div key={case_.elements} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h5 className="font-semibold text-gray-900 dark:text-white">
                              {case_.name}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {case_.relationships} relationships ({case_.elements}²)
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {case_.status === 'optimal' ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                            <Badge variant={case_.status === 'optimal' ? 'default' : 'destructive'}>
                              {case_.verdict}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {case_.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Euler's Theorem */}
            <Card>
              <CardHeader>
                <CardTitle>Euler's One-Stroke Theorem: The Decisive Mathematical Evidence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Euler's One-Stroke Drawing Theorem (1736):
                  </h4>
                  <ol className="space-y-1 ml-4 text-gray-700 dark:text-gray-300">
                    <li>1. Even-vertex connected graphs: Can definitely be drawn in one stroke</li>
                    <li>2. Graphs with exactly two odd vertices: Can definitely be drawn in one stroke</li>
                    <li>3. All other cases: Cannot be drawn in one stroke</li>
                  </ol>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                      ❌ Four Elements System: Mathematical Failure
                    </h4>
                    <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
                      <p>• Edges per element: 3 connections (to other 3 elements)</p>
                      <p>• Vertex properties: 4 odd vertices (each connects 3 edges)</p>
                      <p>• One-stroke possibility: <strong>IMPOSSIBLE</strong></p>
                      <p>• Euler's Theorem: Requires 4÷2 = 2 strokes to complete</p>
                      <p>• <strong>Conclusion:</strong> Mathematically incomplete</p>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                      ✅ Five Elements System: Mathematical Perfection
                    </h4>
                    <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <p>• Edges per element: 4 connections (generates 2 + restrains 2)</p>
                      <p>• Vertex properties: 5 even vertices (each connects 4 edges)</p>
                      <p>• One-stroke possibility: <strong>PERFECTLY ACHIEVABLE</strong></p>
                      <p>• Euler's Theorem: Can be drawn in one continuous stroke</p>
                      <p>• <strong>Conclusion:</strong> Mathematically perfect</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                    Historical Significance of Euler's Theorem:
                  </h4>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• 1736: Euler established this theorem through the famous Seven Bridges of Königsberg problem</li>
                    <li>• Modern applications: Computer science, network optimization, logistics planning</li>
                    <li>• <strong>Validation of Chinese wisdom:</strong> Proves mathematical superiority of Five Elements system</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Systems Theory */}
            <Card>
              <CardHeader>
                <CardTitle>Systems Theory Perspective</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Western Four Elements Logic:
                    </h4>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li>• Question: "What components make up matter?"</li>
                      <li>• Method: Decomposition into parts</li>
                      <li>• Result: Static categories with incomplete relationships</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Chinese Five Elements Logic:
                    </h4>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li>• Question: "What interaction patterns govern change?"</li>
                      <li>• Method: Mapping dynamic relationships</li>
                      <li>• Result: Complete relational framework</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3">
                    Completeness Verification:
                  </h4>
                  <p className="text-green-700 dark:text-green-300 mb-3">
                    The Five Elements system satisfies all requirements for a complete relational framework:
                  </p>
                  <div className="grid md:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm"><strong>Closure:</strong> Every interaction produces a result within the system</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm"><strong>Connectivity:</strong> Every element relates to every other element</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm"><strong>Cyclical Stability:</strong> System returns to starting point</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm"><strong>Dynamic Balance:</strong> Generative and restraint forces equilibrate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm"><strong>Minimal Sufficiency:</strong> No element is redundant, none missing</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Historical Validation */}
            <Card>
              <CardHeader>
                <CardTitle>Historical Mathematical Validation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Cross-Cultural Convergence Evidence:
                  </h4>
                  <div className="space-y-3 text-blue-700 dark:text-blue-300">
                    <div>
                      <p className="font-medium">Indian Buddhism Correction:</p>
                      <ul className="text-sm space-y-1 ml-4">
                        <li>• Original: Four Elements (Earth, Water, Fire, Wind)</li>
                        <li>• Problem Discovered: Incomplete transformation cycles</li>
                        <li>• Mathematical Solution: Added Space (= Chinese Metal function)</li>
                        <li>• Result: Five Elements (Panchamahabhuta)</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-medium">Medieval Alchemy Recognition:</p>
                      <ul className="text-sm space-y-1 ml-4">
                        <li>• Original: Greek Four Elements</li>
                        <li>• Problem Encountered: Insufficient for chemical processes</li>
                        <li>• Attempted Solution: Added Quintessence</li>
                        <li>• Partial Success: Recognized need for fifth element</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modern Applications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Practical Mathematical Applications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  The Five Elements mathematical structure applies universally across domains:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <strong className="text-blue-900 dark:text-blue-100">Business Ecosystems:</strong>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Five-role organizational optimization</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <strong className="text-green-900 dark:text-green-100">Ecological Networks:</strong>
                      <p className="text-sm text-green-700 dark:text-green-300">Five-level trophic stability</p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <strong className="text-purple-900 dark:text-purple-100">AI/Machine Learning:</strong>
                      <p className="text-sm text-purple-700 dark:text-purple-300">Five-layer neural network architectures</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <strong className="text-orange-900 dark:text-orange-100">Social Systems:</strong>
                      <p className="text-sm text-orange-700 dark:text-orange-300">Five-person group dynamics optimization</p>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <strong className="text-red-900 dark:text-red-100">Economic Models:</strong>
                      <p className="text-sm text-red-700 dark:text-red-300">Five-phase business cycles</p>
                    </div>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                      <strong className="text-indigo-900 dark:text-indigo-100">Network Theory:</strong>
                      <p className="text-sm text-indigo-700 dark:text-indigo-300">Five-node configurations optimize connectivity</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conclusion */}
            <Card>
              <CardHeader>
                <CardTitle>Conclusion: Mathematical Supremacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg border">
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Euler's One-Stroke Theorem provides irrefutable mathematical evidence:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span><strong>Four Elements:</strong> 4 odd vertices, mathematically impossible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span><strong>Five Elements:</strong> 5 even vertices, mathematically perfect</span>
                    </div>
                  </div>
                  <p className="text-center text-gray-700 dark:text-gray-300 font-medium">
                    This is not a difference in philosophical viewpoints, but an objective judgment of mathematical theorems!
                  </p>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
                    The Chinese Five Elements system represents humanity's earliest mathematical discovery of the Minimal Complete Relational System:
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Mathematical Properties:</p>
                      <div className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span><strong>Minimal:</strong> Uses fewest possible elements (5)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span><strong>Complete:</strong> Expresses all relational states</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span><strong>Cyclical:</strong> Maintains dynamic stability</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span><strong>Optimal:</strong> Graph-theoretically perfect</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span><strong>Universal:</strong> Applicable across all domains</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Historical Timeline:</p>
                      <div className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                        <p>• <strong>6th Century BCE:</strong> China discovered Five Elements system</p>
                        <p>• <strong>1736 CE:</strong> Euler established graph theory proving its correctness</p>
                        <p>• <strong>Time Gap:</strong> China preceded Western mathematical proof by 2,300 years!</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    Contemporary mathematics confirms what ancient Chinese wisdom discovered:
                  </p>
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                    Five is the mathematically optimal number for modeling complex relational systems.
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