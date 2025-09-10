'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, Calculator, Compass, Clock, ArrowRight, ArrowLeft, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import EnglishLayout from '@/components/EnglishLayout';
import { useLanguage } from '@/contexts/LanguageContext';

export default function BaZiDayunBasicsPage() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('concept');
  const [selectedDirection, setSelectedDirection] = useState('forward');

  const yangStems = ['甲', '丙', '戊', '庚', '壬'];
  const yinStems = ['乙', '丁', '己', '辛', '癸'];

  const directionRules = [
    {
      condition: 'Male + Yang Year',
      rule: 'Forward (顺排)',
      description: 'Male born in Yang Year stem',
      icon: <ArrowRight className="w-4 h-4" />,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    },
    {
      condition: 'Female + Yin Year',
      rule: 'Forward (顺排)',
      description: 'Female born in Yin Year stem',
      icon: <ArrowRight className="w-4 h-4" />,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    },
    {
      condition: 'Female + Yang Year',
      rule: 'Reverse (逆排)',
      description: 'Female born in Yang Year stem',
      icon: <ArrowLeft className="w-4 h-4" />,
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    },
    {
      condition: 'Male + Yin Year',
      rule: 'Reverse (逆排)',
      description: 'Male born in Yin Year stem',
      icon: <ArrowLeft className="w-4 h-4" />,
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
  ];

  const calculationSteps = [
    {
      step: '1',
      title: 'Determine Direction',
      description: 'Forward or Reverse based on gender and Year Stem',
      icon: <Compass className="w-5 h-5" />,
      details: 'Check Year Stem polarity (Yin/Yang) and your gender to determine counting direction'
    },
    {
      step: '2',
      title: 'Find Starting Point',
      description: 'The sequence always begins from Month Pillar',
      icon: <Target className="w-5 h-5" />,
      details: 'Your Month Pillar sets the foundation for all Luck Periods'
    },
    {
      step: '3',
      title: 'Plot Sequence',
      description: 'List pillars in 60 Stem-Branch cycle order',
      icon: <Calendar className="w-5 h-5" />,
      details: 'Follow the Jia Zi cycle forward or reverse from Month Pillar'
    },
    {
      step: '4',
      title: 'Calculate Starting Age',
      description: 'Based on distance to nearest Solar Term',
      icon: <Clock className="w-5 h-5" />,
      details: 'Count days to Solar Term, divide by 3 to get starting age'
    }
  ];

  const forwardExample = {
    monthPillar: '丙寅 (Bing Yin)',
    sequence: [
      { period: '1st', pillar: '丁卯 (Ding Mao)', ages: '3-12' },
      { period: '2nd', pillar: '戊辰 (Wu Chen)', ages: '13-22' },
      { period: '3rd', pillar: '己巳 (Ji Si)', ages: '23-32' },
      { period: '4th', pillar: '庚午 (Geng Wu)', ages: '33-42' },
      { period: '5th', pillar: '辛未 (Xin Wei)', ages: '43-52' }
    ]
  };

  const reverseExample = {
    monthPillar: '丙寅 (Bing Yin)',
    sequence: [
      { period: '1st', pillar: '乙丑 (Yi Chou)', ages: '3-12' },
      { period: '2nd', pillar: '甲子 (Jia Zi)', ages: '13-22' },
      { period: '3rd', pillar: '癸亥 (Gui Hai)', ages: '23-32' },
      { period: '4th', pillar: '壬戌 (Ren Xu)', ages: '33-42' },
      { period: '5th', pillar: '辛酉 (Xin You)', ages: '43-52' }
    ]
  };

  const interpretationPrinciples = [
    {
      principle: 'Heavenly Stem Influence',
      timeframe: 'First 5 years of each period',
      description: 'The Stem energy dominates the beginning of each decade',
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      principle: 'Earthly Branch Influence',
      timeframe: 'Last 5 years of each period',
      description: 'The Branch energy becomes more prominent toward the end',
      icon: <Target className="w-5 h-5" />
    },
    {
      principle: 'Favorable vs Unfavorable',
      timeframe: 'Throughout the period',
      description: 'Check if elements are beneficial (喜神) or challenging (忌神)',
      icon: <AlertTriangle className="w-5 h-5" />
    }
  ];

  const ageCalculationExample = {
    birthDate: 'Born 9 days after the last Solar Term',
    direction: 'Forward',
    calculation: '9 days ÷ 3 = 3 years',
    result: 'First Luck Period starts at age 3',
    schedule: [
      { period: '1st', ages: '3-12', years: '10 years' },
      { period: '2nd', ages: '13-22', years: '10 years' },
      { period: '3rd', ages: '23-32', years: '10 years' }
    ]
  };

  return (
    <EnglishLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900/20 dark:to-teal-900/20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Luck Periods - BaZi Timing System
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              大运 (Dà Yùn) - The 10-year cycles that reveal the timing of your destiny
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <Badge variant="outline" className="text-sm">
                <Calendar className="w-4 h-4 mr-1" />
                16 min read
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Clock className="w-4 h-4 mr-1" />
                Timing Analysis
              </Badge>
            </div>
          </div>

          {/* Car Analogy */}
          <Card className="mb-8 border-2 border-emerald-200 dark:border-emerald-800">
            <CardHeader className="bg-emerald-50 dark:bg-emerald-900/10">
              <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
                <MapPin className="w-6 h-6" />
                The Car and Road Analogy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Your BaZi Chart = The Car</h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      Your natal chart is the vehicle you're born with - its engine, features, strengths, and weaknesses
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                    <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Luck Periods = The Roads</h3>
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      The 10-year cycles are the roads you travel throughout life - some smooth, some challenging
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Great Car + Bumpy Road</h3>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                      Even excellent potential can struggle during challenging periods
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                    <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Modest Car + Smooth Road</h3>
                    <p className="text-purple-700 dark:text-purple-300 text-sm">
                      Average potential can achieve great success during favorable periods
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="concept">Core Concept</TabsTrigger>
              <TabsTrigger value="calculation">Calculation Method</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="interpretation">Interpretation</TabsTrigger>
            </TabsList>

            {/* Core Concept Tab */}
            <TabsContent value="concept" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-6 h-6" />
                    What Are Luck Periods?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed">
                      A Luck Period is a <strong>10-year cycle of influence</strong>, governed by a specific Pillar (one Heavenly Stem and one Earthly Branch). This Pillar introduces a new dominant elemental Qi (energy) that interacts with your original BaZi chart for that entire decade.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-2 border-green-200 dark:border-green-800">
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-semibold mb-2">Activate Positive Elements</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Leading to success and opportunity
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-red-200 dark:border-red-800">
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="font-semibold mb-2">Introduce Challenges</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Leading to obstacles and difficulties
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-purple-200 dark:border-purple-800">
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="font-semibold mb-2">Signal Major Events</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Career, relationships, health, family
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Alert className="border-teal-200 bg-teal-50 dark:bg-teal-900/10">
                    <Calendar className="h-4 w-4" />
                    <AlertDescription className="text-teal-800 dark:text-teal-200">
                      <strong>Life Mapping:</strong> Your entire life is mapped out as a sequence of these 10-year Luck Periods, showing when opportunities and challenges will arise.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Calculation Method Tab */}
            <TabsContent value="calculation" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-6 h-6" />
                    How to Calculate Luck Periods
                  </CardTitle>
                  <CardDescription>
                    A precise, technical process based on your natal chart
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Calculation Steps */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {calculationSteps.map((step, index) => (
                      <Card key={index} className="border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                              <span className="text-teal-600 dark:text-teal-300 font-bold">{step.step}</span>
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

                  {/* Direction Rules */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Step 1: Direction Rules</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {directionRules.map((rule, index) => (
                        <Card key={index} className="border border-gray-200 dark:border-gray-700">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className={`${rule.color} px-3 py-1 rounded-full flex items-center gap-2`}>
                                {rule.icon}
                                <span className="text-sm font-medium">{rule.rule}</span>
                              </div>
                            </div>
                            <h4 className="font-medium mb-1">{rule.condition}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{rule.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Yang Year Stems</h4>
                        <div className="flex flex-wrap gap-2">
                          {yangStems.map((stem, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{stem}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                        <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Yin Year Stems</h4>
                        <div className="flex flex-wrap gap-2">
                          {yinStems.map((stem, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{stem}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Age Calculation */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Step 4: Starting Age Calculation</h3>
                    <Card className="border-2 border-yellow-200 dark:border-yellow-800">
                      <CardHeader className="bg-yellow-50 dark:bg-yellow-900/10">
                        <CardTitle className="text-yellow-800 dark:text-yellow-200">Example Calculation</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div>
                              <span className="font-medium">Birth Date:</span>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{ageCalculationExample.birthDate}</p>
                            </div>
                            <div>
                              <span className="font-medium">Direction:</span>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{ageCalculationExample.direction}</p>
                            </div>
                            <div>
                              <span className="font-medium">Calculation:</span>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{ageCalculationExample.calculation}</p>
                            </div>
                            <div>
                              <span className="font-medium">Result:</span>
                              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">{ageCalculationExample.result}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-3">Life Schedule:</h4>
                            <div className="space-y-2">
                              {ageCalculationExample.schedule.map((period, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                  <span className="text-sm">{period.period} Luck Period</span>
                                  <span className="text-sm font-medium">Ages {period.ages}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
                    Sequence Examples
                  </CardTitle>
                  <CardDescription>
                    Starting from Month Pillar: 丙寅 (Bing Yin)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-center gap-4 mb-6">
                    <Button
                      variant={selectedDirection === 'forward' ? "default" : "outline"}
                      onClick={() => setSelectedDirection('forward')}
                      className="flex items-center gap-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Forward (顺排)
                    </Button>
                    <Button
                      variant={selectedDirection === 'reverse' ? "default" : "outline"}
                      onClick={() => setSelectedDirection('reverse')}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Reverse (逆排)
                    </Button>
                  </div>

                  <Card className="border-2 border-teal-200 dark:border-teal-800">
                    <CardHeader className="bg-teal-50 dark:bg-teal-900/10">
                      <CardTitle className="text-teal-800 dark:text-teal-200">
                        {selectedDirection === 'forward' ? 'Forward' : 'Reverse'} Sequence
                      </CardTitle>
                      <CardDescription>
                        Month Pillar: {selectedDirection === 'forward' ? forwardExample.monthPillar : reverseExample.monthPillar}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {(selectedDirection === 'forward' ? forwardExample.sequence : reverseExample.sequence).map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                                <span className="text-teal-600 dark:text-teal-300 text-sm font-bold">{index + 1}</span>
                              </div>
                              <div>
                                <span className="font-medium">{item.period} Luck Period</span>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{item.pillar}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-sm">
                              Ages {item.ages}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
                    <Calculator className="h-4 w-4" />
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                      <strong>Automatic Calculation:</strong> Fortunately, any online BaZi calculator will perform all these steps automatically! When you generate your chart, it shows your complete Luck Period sequence with starting ages.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Interpretation Tab */}
            <TabsContent value="interpretation" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6" />
                    How to Interpret Luck Periods
                  </CardTitle>
                  <CardDescription>
                    Analyzing the interaction between Luck Periods and your natal chart
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Interpretation Principles */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {interpretationPrinciples.map((principle, index) => (
                      <Card key={index} className="border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-teal-100 dark:bg-teal-900/20 rounded-lg">
                              {principle.icon}
                            </div>
                            <h3 className="font-semibold text-sm">{principle.principle}</h3>
                          </div>
                          <div className="space-y-2">
                            <Badge variant="outline" className="text-xs">{principle.timeframe}</Badge>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{principle.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Period Structure */}
                  <Card className="border-2 border-indigo-200 dark:border-indigo-800">
                    <CardHeader className="bg-indigo-50 dark:bg-indigo-900/10">
                      <CardTitle className="text-indigo-800 dark:text-indigo-200">10-Year Period Structure</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">First Half (Years 1-5)</h3>
                          <div className="space-y-2">
                            <p className="text-sm text-green-700 dark:text-green-300">
                              <strong>Heavenly Stem</strong> influence dominates
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                              The Stem's elemental energy sets the tone for the beginning of the period
                            </p>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Second Half (Years 6-10)</h3>
                          <div className="space-y-2">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              <strong>Earthly Branch</strong> influence increases
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              The Branch's energy becomes more prominent toward the end of the period
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Analysis Framework */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Analysis Framework</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Favorable Elements (喜神)</h4>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              Elements that support your Day Master bring opportunities, smooth progress, and positive developments
                            </p>
                          </div>
                          
                          <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                            <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Unfavorable Elements (忌神)</h4>
                            <p className="text-sm text-red-700 dark:text-red-300">
                              Elements that challenge your Day Master bring obstacles, tests, and growth opportunities
                            </p>
                          </div>
                        </div>

                        <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
                          <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Advanced Analysis</h4>
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            Look for combinations, clashes, and other interactions between the Luck Period pillar and your natal chart that can trigger significant life events
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </EnglishLayout>
  );
} 