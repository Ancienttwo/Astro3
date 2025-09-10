'use client';

import React, { useState } from 'react';
import { Users, Calculator, Target, Star, Crown, Coins, Shield, Sword, BookOpen, Eye, ArrowRight, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import EnglishLayout from '@/components/EnglishLayout';
import { useLanguage } from '@/contexts/LanguageContext';

export default function BaZiShishenIntroPage() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('concept');
  const [selectedExample, setSelectedExample] = useState(0);

  const tenGods = [
    {
      category: 'Peer Gods',
      categoryDesc: 'Elements same as Day Master',
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      borderColor: 'border-green-200 dark:border-green-700',
      icon: <Users className="w-5 h-5" />,
      gods: [
        {
          chinese: '比肩',
          english: 'Peer God',
          yinyang: 'Same as Day Master',
          keywords: 'Friends, siblings, colleagues, self-esteem, competition',
          represents: 'Cooperation, friendship, equals',
          icon: <Users className="w-4 h-4" />
        },
        {
          chinese: '劫财',
          english: 'Rival God',
          yinyang: 'Different from Day Master',
          keywords: 'Ambition, charm, social network, rivalry, expenses',
          represents: 'Competition, conflict, partnership challenges',
          icon: <Target className="w-4 h-4" />
        }
      ]
    },
    {
      category: 'Output Gods',
      categoryDesc: 'Elements Day Master produces',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      borderColor: 'border-blue-200 dark:border-blue-700',
      icon: <Star className="w-5 h-5" />,
      gods: [
        {
          chinese: '食神',
          english: 'Prosperity God',
          yinyang: 'Same as Day Master',
          keywords: 'Creativity, enjoyment, speech, children (for female DM), ease',
          represents: 'Creativity, expression, gentle output',
          icon: <Star className="w-4 h-4" />
        },
        {
          chinese: '伤官',
          english: 'Drama God',
          yinyang: 'Different from Day Master',
          keywords: 'Performance, rebellion, intelligence, wit, children (for female DM)',
          represents: 'Innovation, rebellion, dramatic change',
          icon: <Crown className="w-4 h-4" />
        }
      ]
    },
    {
      category: 'Wealth Gods',
      categoryDesc: 'Elements Day Master controls',
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      borderColor: 'border-yellow-200 dark:border-yellow-700',
      icon: <Coins className="w-5 h-5" />,
      gods: [
        {
          chinese: '正财',
          english: 'Wealth God',
          yinyang: 'Different from Day Master',
          keywords: 'Wife (for male DM), stable income, hard work, assets',
          represents: 'Stable income, conservative investment',
          icon: <Coins className="w-4 h-4" />
        },
        {
          chinese: '偏财',
          english: 'Fortune God',
          yinyang: 'Same as Day Master',
          keywords: 'Father, business, windfalls, risk-taking, generosity',
          represents: 'Windfall, business opportunities',
          icon: <Target className="w-4 h-4" />
        }
      ]
    },
    {
      category: 'Authority Gods',
      categoryDesc: 'Elements that control Day Master',
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      borderColor: 'border-red-200 dark:border-red-700',
      icon: <Shield className="w-5 h-5" />,
      gods: [
        {
          chinese: '正官',
          english: 'Authority God',
          yinyang: 'Different from Day Master',
          keywords: 'Husband (for female DM), boss, career, discipline, reputation',
          represents: 'Legal authority, structured management',
          icon: <Shield className="w-4 h-4" />
        },
        {
          chinese: '七杀',
          english: 'War God',
          yinyang: 'Same as Day Master',
          keywords: 'Authority, challenges, stress, power, enemies, son (for male DM)',
          represents: 'Direct power, military leadership',
          icon: <Sword className="w-4 h-4" />
        }
      ]
    },
    {
      category: 'Support Gods',
      categoryDesc: 'Elements that produce Day Master',
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      borderColor: 'border-purple-200 dark:border-purple-700',
      icon: <BookOpen className="w-5 h-5" />,
      gods: [
        {
          chinese: '正印',
          english: 'Scholar God',
          yinyang: 'Different from Day Master',
          keywords: 'Mother, formal education, kindness, stability, comfort',
          represents: 'Education, support, motherly care',
          icon: <BookOpen className="w-4 h-4" />
        },
        {
          chinese: '偏印',
          english: 'Oracle God',
          yinyang: 'Same as Day Master',
          keywords: 'Intuition, metaphysics, unconventional knowledge, side-hustles',
          represents: 'Controlling help, conditional support',
          icon: <Eye className="w-4 h-4" />
        }
      ]
    }
  ];

  const calculationSteps = [
    {
      step: '1',
      title: 'Identify Your Day Master',
      description: 'Find the Heavenly Stem of your Day Pillar',
      details: 'This is your Day Master (DM) - the core of your chart that represents you',
      icon: <Target className="w-5 h-5" />
    },
    {
      step: '2',
      title: 'Determine Element & Yin-Yang',
      description: 'Identify the element and polarity of your Day Master',
      details: 'For example: 甲 (Jia) = Yang Wood',
      icon: <Calculator className="w-5 h-5" />
    },
    {
      step: '3',
      title: 'Compare Each Character',
      description: 'Analyze the relationship between each character and your Day Master',
      details: 'Use the Five Element relationship and Yin-Yang polarity',
      icon: <ArrowRight className="w-5 h-5" />
    },
    {
      step: '4',
      title: 'Apply Calculation Table',
      description: 'Use the systematic table to determine each Ten God',
      details: 'Element relationship + Yin-Yang polarity = Ten God type',
      icon: <CheckCircle className="w-5 h-5" />
    }
  ];

  const examples = [
    {
      dayMaster: '甲 (Jia) - Yang Wood',
      character: '癸 (Gui) - Yin Water',
      analysis: {
        element: 'Water produces Wood (Resource element)',
        yinyang: 'Yin Water vs Yang Wood (Different polarity)',
        result: 'Scholar God (正印)',
        meaning: 'Represents mother, formal education, stability'
      }
    },
    {
      dayMaster: '甲 (Jia) - Yang Wood',
      character: '戊 (Wu) - Yang Earth',
      analysis: {
        element: 'Wood controls Earth (Wealth element)',
        yinyang: 'Yang Earth vs Yang Wood (Same polarity)',
        result: 'Fortune God (偏财)',
        meaning: 'Represents father, business opportunities, windfalls'
      }
    },
    {
      dayMaster: '甲 (Jia) - Yang Wood',
      character: '庚 (Geng) - Yang Metal',
      analysis: {
        element: 'Metal controls Wood (Authority element)',
        yinyang: 'Yang Metal vs Yang Wood (Same polarity)',
        result: 'War God (七杀)',
        meaning: 'Represents challenges, authority, power struggles'
      }
    }
  ];

  const relationshipTypes = [
    {
      type: 'Produces Me',
      chinese: '印星 (Resource)',
      description: 'Elements that nourish and support the Day Master',
      example: 'Water → Wood',
      gods: ['Scholar God (正印)', 'Oracle God (偏印)']
    },
    {
      type: 'Same as Me',
      chinese: '比劫 (Companion)',
      description: 'Elements identical to the Day Master',
      example: 'Wood = Wood',
      gods: ['Peer God (比肩)', 'Rival God (劫财)']
    },
    {
      type: 'I Produce',
      chinese: '食伤 (Output)',
      description: 'Elements that the Day Master creates or feeds',
      example: 'Wood → Fire',
      gods: ['Prosperity God (食神)', 'Drama God (伤官)']
    },
    {
      type: 'I Control',
      chinese: '财星 (Wealth)',
      description: 'Elements that the Day Master dominates or manages',
      example: 'Wood → Earth',
      gods: ['Wealth God (正财)', 'Fortune God (偏财)']
    },
    {
      type: 'Controls Me',
      chinese: '官杀 (Authority)',
      description: 'Elements that discipline or govern the Day Master',
      example: 'Metal → Wood',
      gods: ['Authority God (正官)', 'War God (七杀)']
    }
  ];

  return (
    <EnglishLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              What Are the Ten Gods?
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              十神 - Symbolic archetypes representing people, psychology, and life domains in BaZi analysis
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <Badge variant="outline" className="text-sm">
                <BookOpen className="w-4 h-4 mr-1" />
                18 min read
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Calculator className="w-4 h-4 mr-1" />
                Calculation Guide
              </Badge>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="concept">Core Concept</TabsTrigger>
              <TabsTrigger value="categories">Ten God Categories</TabsTrigger>
              <TabsTrigger value="calculation">Calculation Method</TabsTrigger>
              <TabsTrigger value="examples">Concrete Examples</TabsTrigger>
            </TabsList>

            {/* Core Concept Tab */}
            <TabsContent value="concept" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-6 h-6" />
                    Understanding the Ten Gods
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed">
                      The Ten Gods are <strong>not literal deities</strong>. They are symbolic archetypes that represent:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                      <Card className="border-2 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="font-semibold">Specific People</h3>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Mother, father, spouse, boss, friends, children in your life
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-2 border-purple-200 dark:border-purple-800">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                              <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="font-semibold">Psyche Aspects</h3>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Your drive, creativity, discipline, desire for stability
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-2 border-green-200 dark:border-green-800">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                              <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="font-semibold">Life Domains</h3>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Career, wealth, health, academic ability
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <Alert className="mt-6 border-indigo-200 bg-indigo-50 dark:bg-indigo-900/10">
                      <BookOpen className="h-4 w-4" />
                      <AlertDescription className="text-indigo-800 dark:text-indigo-200">
                        <strong>Origin:</strong> The Ten Gods are derived from the relationship between your Day Master (日主) and the other seven characters (Stems and Branches) in your BaZi chart.
                      </AlertDescription>
                    </Alert>

                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">The Formation Process</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        There are <strong>five primary relationships</strong> based on the Five Element cycles, which are then split into <strong>two based on their Yin/Yang polarity</strong> relative to the Day Master, creating the ten "Gods."
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Ten God Categories Tab */}
            <TabsContent value="categories" className="space-y-8">
              <div className="space-y-6">
                {tenGods.map((category, index) => (
                  <Card key={index} className={`${category.borderColor} border-2`}>
                    <CardHeader className={`${category.color} rounded-t-lg`}>
                      <CardTitle className="flex items-center gap-2">
                        {category.icon}
                        {category.category}
                      </CardTitle>
                      <CardDescription className="text-gray-700 dark:text-gray-300">
                        {category.categoryDesc}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.gods.map((god, godIndex) => (
                          <Card key={godIndex} className="border border-gray-200 dark:border-gray-700">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                  {god.icon}
                                </div>
                                <div>
                                  <h3 className="font-semibold">{god.english}</h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">{god.chinese}</p>
                                </div>
                              </div>
                              
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium">Polarity:</span> {god.yinyang}
                                </div>
                                <div>
                                  <span className="font-medium">Keywords:</span> {god.keywords}
                                </div>
                                <div>
                                  <span className="font-medium">Represents:</span> {god.represents}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Calculation Method Tab */}
            <TabsContent value="calculation" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-6 h-6" />
                    How to Calculate the Ten Gods
                  </CardTitle>
                  <CardDescription>
                    A systematic, two-step process for each character in your chart
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Two Factors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-2 border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/10">
                        <CardTitle className="text-blue-800 dark:text-blue-200">Factor 1</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">Five Element Relationship</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          How does the element of the character relate to your Day Master's element? Does it produce it? Control it? Is it the same?
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-purple-200 dark:border-purple-800">
                      <CardHeader className="bg-purple-50 dark:bg-purple-900/10">
                        <CardTitle className="text-purple-800 dark:text-purple-200">Factor 2</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">Yin/Yang Relationship</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Is the character's Yin/Yang polarity the same as or different from your Day Master's?
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Calculation Steps */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {calculationSteps.map((step, index) => (
                      <Card key={index} className="border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                              <span className="text-indigo-600 dark:text-indigo-300 font-bold">{step.step}</span>
                            </div>
                            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                              {step.icon}
                            </div>
                          </div>
                          <h3 className="font-semibold text-sm mb-2">{step.title}</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{step.description}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">{step.details}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Relationship Types */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Five Element Relationships</h3>
                    <div className="space-y-3">
                      {relationshipTypes.map((relation, index) => (
                        <Card key={index} className="border border-gray-200 dark:border-gray-700">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-medium">{relation.type}</h4>
                                  <Badge variant="outline" className="text-xs">{relation.chinese}</Badge>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{relation.description}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-mono text-gray-500 dark:text-gray-400 mb-1">
                                  {relation.example}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-500">
                                  {relation.gods.map((god, idx) => (
                                    <div key={idx}>{god}</div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Examples Tab */}
            <TabsContent value="examples" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-6 h-6" />
                    Concrete Examples
                  </CardTitle>
                  <CardDescription>
                    Let's work through examples with Day Master: 甲 (Jia) - Yang Wood
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {examples.map((example, index) => (
                      <Button
                        key={index}
                        variant={selectedExample === index ? "default" : "outline"}
                        className="h-auto p-4 flex flex-col items-start"
                        onClick={() => setSelectedExample(index)}
                      >
                        <div className="font-medium text-sm mb-1">{example.dayMaster}</div>
                        <div className="text-xs text-gray-500">vs</div>
                        <div className="font-medium text-sm">{example.character}</div>
                      </Button>
                    ))}
                  </div>

                  <Card className="border-2 border-indigo-200 dark:border-indigo-800">
                    <CardHeader className="bg-indigo-50 dark:bg-indigo-900/10">
                      <CardTitle className="text-indigo-800 dark:text-indigo-200">
                        Analysis: {examples[selectedExample].character}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Element Relationship:</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {examples[selectedExample].analysis.element}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Yin/Yang Relationship:</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {examples[selectedExample].analysis.yinyang}
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Result:</h4>
                          <p className="text-green-700 dark:text-green-300 font-medium">
                            {examples[selectedExample].analysis.result}
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                            {examples[selectedExample].analysis.meaning}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
                    <Calculator className="h-4 w-4" />
                    <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                      <strong>Complete Process:</strong> You would repeat this process for all Stems and all the elements hidden within the Earthly Branches. The location (Pillar), strength, and whether a God is "favorable" or "unfavorable" adds further layers to the final interpretation.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </EnglishLayout>
  );
} 