'use client';

import { useState } from 'react';
import EnglishLayout from '@/components/EnglishLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Scale, 
  ArrowRight, 
  ArrowDown, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  Heart, 
  Shield, 
  Target,
  Brain,
  Compass,
  Zap,
  Flame,
  Leaf,
  Mountain,
  Sparkles,
  Droplets,
  Activity,
  Eye,
  Puzzle,
  Crown,
  Apple,
  Workflow,
  GitBranch,
  CircleDot,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Scissors
} from 'lucide-react';

export default function WuXingBalancePage() {
  const [selectedCycle, setSelectedCycle] = useState<'sheng' | 'ke' | null>(null);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  const shengCycle = [
    { from: 'Wood', to: 'Fire', description: 'Wood feeds Fire (Wood provides fuel for fire)', icon: <Flame className="w-4 h-4" />, color: 'text-red-600' },
    { from: 'Fire', to: 'Earth', description: 'Fire creates Earth (Fire produces ash, which becomes earth)', icon: <Mountain className="w-4 h-4" />, color: 'text-yellow-600' },
    { from: 'Earth', to: 'Metal', description: 'Earth bears Metal (Metal ores are mined from the earth)', icon: <Sparkles className="w-4 h-4" />, color: 'text-gray-600' },
    { from: 'Metal', to: 'Water', description: 'Metal carries Water (Metal vessels hold water, or condensation forms on metal)', icon: <Droplets className="w-4 h-4" />, color: 'text-blue-600' },
    { from: 'Water', to: 'Wood', description: 'Water nourishes Wood (Water is essential for trees to grow)', icon: <Leaf className="w-4 h-4" />, color: 'text-green-600' }
  ];

  const keCycle = [
    { from: 'Wood', to: 'Earth', description: 'Wood controls Earth (Tree roots hold the soil, preventing erosion)', icon: <Mountain className="w-4 h-4" />, color: 'text-yellow-600' },
    { from: 'Earth', to: 'Water', description: 'Earth controls Water (Earthen banks contain and direct rivers)', icon: <Droplets className="w-4 h-4" />, color: 'text-blue-600' },
    { from: 'Water', to: 'Fire', description: 'Water controls Fire (Water extinguishes fire)', icon: <Flame className="w-4 h-4" />, color: 'text-red-600' },
    { from: 'Fire', to: 'Metal', description: 'Fire controls Metal (Fire melts and forges metal)', icon: <Sparkles className="w-4 h-4" />, color: 'text-gray-600' },
    { from: 'Metal', to: 'Wood', description: 'Metal controls Wood (A metal axe can chop wood)', icon: <Leaf className="w-4 h-4" />, color: 'text-green-600' }
  ];

  const practicalExamples = [
    {
      title: "Strengthening Weak Water Element",
      problem: "You feel fearful, exhausted, and lack willpower. Your motivation is gone.",
      analysis: "This points to a deficiency in the Water element. Who is the 'mother' of Water? Looking at the cycle, Metal is the mother of Water.",
      solution: "Strengthen your Metal element to feed and restore your Water element.",
      actions: [
        "Practice deep breathing exercises: The Lungs are the organ of Metal.",
        "Declutter your home or workspace: Metal thrives on order and structure.",
        "Engage in activities that require precision: Calligraphy, organizing, detailed crafts.",
        "Incorporate pungent foods: Onions, garlic, radishes.",
        "Wear white and metallic colors."
      ],
      cycle: "Sheng",
      color: "border-blue-200 bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "Controlling Excessive Wood Element",
      problem: "You are experiencing intense frustration, irritability, and outbursts of anger. You feel 'stuck' and have tension headaches.",
      analysis: "This points to an excess of Wood energy. Which element controls Wood? Looking at the cycle, Metal controls Wood.",
      solution: "Strengthen your Metal element to gently 'prune' the overgrown Wood.",
      actions: [
        "Impose structure on your day: Create a clear schedule and stick to it (Metal loves order).",
        "Focus on quality over quantity: Edit your work, refine a skill.",
        "Let go of what isn't serving you: Clean out your closet, end a draining commitment.",
        "Breathe: Deep, calm breathing helps regulate the Liver (Wood's organ).",
        "Wear white or gray to bring in Metal's clarifying energy."
      ],
      cycle: "Ke",
      color: "border-green-200 bg-green-50 dark:bg-green-900/20"
    }
  ];

  const pathologicalCycles = [
    {
      type: "Overwhelming (Cheng)",
      description: "The Ke cycle in overdrive",
      example: "If Water is too strong, it doesn't just control Fire, it completely extinguishes it, leading to a total lack of joy and vitality.",
      icon: <TrendingDown className="w-5 h-5 text-red-600" />,
      color: "border-red-200 bg-red-50 dark:bg-red-900/20"
    },
    {
      type: "Insulting (Wu)",
      description: "The Ke cycle in reverse. The 'grandchild' rebels against the 'grandparent'",
      example: "If Wood is excessively strong and Metal is weak, the 'axe' (Metal) cannot cut the 'tree' (Wood) and may even break. This is seen when anger (Wood) is so intense that it defies all attempts at discipline or order (Metal).",
      icon: <RefreshCw className="w-5 h-5 text-orange-600" />,
      color: "border-orange-200 bg-orange-50 dark:bg-orange-900/20"
    }
  ];

  const elements = [
    { name: 'Wood', chinese: '木', color: 'bg-green-500', textColor: 'text-green-700', icon: <Leaf className="w-5 h-5" /> },
    { name: 'Fire', chinese: '火', color: 'bg-red-500', textColor: 'text-red-700', icon: <Flame className="w-5 h-5" /> },
    { name: 'Earth', chinese: '土', color: 'bg-yellow-500', textColor: 'text-yellow-700', icon: <Mountain className="w-5 h-5" /> },
    { name: 'Metal', chinese: '金', color: 'bg-gray-500', textColor: 'text-gray-700', icon: <Sparkles className="w-5 h-5" /> },
    { name: 'Water', chinese: '水', color: 'bg-blue-500', textColor: 'text-blue-700', icon: <Droplets className="w-5 h-5" /> }
  ];

  return (
    <EnglishLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Scale className="w-12 h-12 text-emerald-600" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Five Elements Balance
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Understanding the dynamic self-regulating system that governs the flow and balance 
              of energy through the Sheng and Ke cycles.
            </p>
          </div>

          {/* Introduction */}
          <Card className="mb-8 border-emerald-200 dark:border-emerald-800">
            <CardHeader>
                             <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                 <Scale className="w-5 h-5" />
                 The Heart of Five Elements System
               </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                It gets to the very heart of how the Five Elements system works as a dynamic, 
                self-regulating map for health. Achieving balance is not about having equal parts 
                of all five elements. It's about ensuring that the elements are in a healthy, 
                flowing relationship with each other.
              </p>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
                <p className="text-emerald-700 dark:text-emerald-300 font-medium">
                  The primary tools for understanding and influencing this balance are the Sheng (Generating) 
                  Cycle and the Ke (Controlling) Cycle. Think of them as the two fundamental laws of nature 
                  that govern the Five Elements ecosystem.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* The Two Cycles */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">The Two Fundamental Cycles</CardTitle>
              <CardDescription>
                Explore the Sheng (Generating) and Ke (Controlling) cycles that maintain natural balance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="sheng" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="sheng" className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Sheng Cycle (Nourishing)
                  </TabsTrigger>
                  <TabsTrigger value="ke" className="flex items-center gap-2">
                    <Scissors className="w-4 h-4" />
                    Ke Cycle (Controlling)
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="sheng" className="mt-6">
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold mb-2">The "Mother-Child" Relationship</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        A cycle of nourishment and creation. Each element is the "mother" of the element 
                        that follows it, and the "child" of the one that precedes it.
                      </p>
                    </div>
                    
                    <div className="grid md:grid-cols-1 gap-4">
                      {shengCycle.map((relationship, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="px-3 py-1">
                              {relationship.from} ({elements.find(e => e.name === relationship.from)?.chinese})
                            </Badge>
                            <ArrowRight className="w-5 h-5 text-emerald-600" />
                            <Badge variant="outline" className="px-3 py-1">
                              {relationship.to} ({elements.find(e => e.name === relationship.to)?.chinese})
                            </Badge>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {relationship.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                        Core Principle: "To strengthen a weak child, nourish its mother."
                      </h4>
                      <p className="text-emerald-600 dark:text-emerald-400">
                        This is a profound and gentle approach to healing. Instead of directly forcing 
                        a weak element to work harder, you strengthen its source of nourishment, 
                        allowing it to naturally recover.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="ke" className="mt-6">
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold mb-2">The "Grandparent-Grandchild" Relationship</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        A cycle of control, restraint, and regulation. It ensures that no single element 
                        becomes too powerful and overwhelms the system. It provides checks and balances.
                      </p>
                    </div>
                    
                    <div className="grid md:grid-cols-1 gap-4">
                      {keCycle.map((relationship, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="px-3 py-1">
                              {relationship.from} ({elements.find(e => e.name === relationship.from)?.chinese})
                            </Badge>
                            <Target className="w-5 h-5 text-orange-600" />
                            <Badge variant="outline" className="px-3 py-1">
                              {relationship.to} ({elements.find(e => e.name === relationship.to)?.chinese})
                            </Badge>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {relationship.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">
                        Core Principle: "To restrain an excessive element, support its controller."
                      </h4>
                      <p className="text-orange-600 dark:text-orange-400">
                        When an element is in excess (e.g., "too much Wood"), it can become destructive. 
                        The Ke cycle provides the natural antidote.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Practical Examples */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Practical Applications</CardTitle>
              <CardDescription>
                Real-world examples of how to use the cycles for healing and balance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {practicalExamples.map((example, index) => (
                  <div key={index} className={`border-2 rounded-lg p-6 ${example.color}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant={example.cycle === 'Sheng' ? 'default' : 'destructive'}>
                        {example.cycle} Cycle
                      </Badge>
                      <h3 className="text-xl font-semibold">{example.title}</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">Problem:</h4>
                        <p className="text-gray-700 dark:text-gray-300">{example.problem}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Analysis:</h4>
                        <p className="text-gray-700 dark:text-gray-300">{example.analysis}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Solution:</h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">{example.solution}</p>
                        
                        <div>
                          <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Actions:</h5>
                          <ul className="space-y-2">
                            {example.actions.map((action, actionIndex) => (
                              <li key={actionIndex} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-400">{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pathological Cycles */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                Pathological Cycles: When Balance Fails
              </CardTitle>
              <CardDescription>
                Understanding how the cycles can become destructive when balance is lost.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {pathologicalCycles.map((cycle, index) => (
                  <div key={index} className={`border-2 rounded-lg p-6 ${cycle.color}`}>
                    <div className="flex items-center gap-3 mb-4">
                      {cycle.icon}
                      <h3 className="text-lg font-semibold">{cycle.type}</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">
                      {cycle.description}
                    </p>
                    <div className="bg-white/50 dark:bg-gray-900/50 rounded p-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Example:</span> {cycle.example}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* The Holistic View */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Eye className="w-6 h-6 text-emerald-600" />
                The Holistic View
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                True balance is achieved by looking at the whole picture. If you have a problem 
                with one element, you should always ask:
              </p>
              
              <div className="space-y-4">
                {[
                  {
                    question: "Is its Mother (Sheng Cycle) failing to nourish it?",
                    icon: <Heart className="w-5 h-5 text-emerald-600" />,
                    explanation: "Check if the preceding element in the generating cycle is weak or blocked."
                  },
                  {
                    question: "Is its Controller (Ke Cycle) too weak to restrain it?",
                    icon: <Shield className="w-5 h-5 text-orange-600" />,
                    explanation: "Examine if the controlling element has enough strength to maintain balance."
                  },
                  {
                    question: "Is it over-controlling its Grandchild?",
                    icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
                    explanation: "Determine if the element is excessively suppressing what it should control."
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    {item.icon}
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                        {item.question}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Conclusion */}
          <Card className="border-emerald-200 dark:border-emerald-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <Compass className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  By using these two cycles, you can move beyond simply identifying an imbalance 
                  and begin to intelligently and effectively guide your body and mind back to a 
                  state of dynamic, healthy equilibrium.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              ← Back to Five Elements
            </Button>
            <Button 
              onClick={() => window.location.href = '/en/wiki/wuxing'}
              className="flex items-center gap-2"
            >
              Explore More Elements
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </EnglishLayout>
  );
} 