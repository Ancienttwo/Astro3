'use client';

import React, { useState } from 'react';
import { Scale, User, Clock, Compass, Star, Target, CheckCircle, XCircle, AlertCircle, BookOpen, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import EnglishLayout from '@/components/EnglishLayout';
import { useLanguage } from '@/contexts/LanguageContext';

export default function BaZiWuxingBalancePage() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('concept');

  const elements = [
    { name: 'Wood', chinese: '木', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', season: 'Spring' },
    { name: 'Fire', chinese: '火', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', season: 'Summer' },
    { name: 'Earth', chinese: '土', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', season: 'Late Summer' },
    { name: 'Metal', chinese: '金', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', season: 'Autumn' },
    { name: 'Water', chinese: '水', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', season: 'Winter' }
  ];

  const seasons = [
    {
      season: 'Spring',
      months: ['Tiger 寅', 'Rabbit 卯', 'Dragon 辰'],
      dominant: 'Wood',
      description: 'Wood is strongest in spring'
    },
    {
      season: 'Summer',
      months: ['Snake 巳', 'Horse 午', 'Goat 未'],
      dominant: 'Fire',
      description: 'Fire is strongest in summer'
    },
    {
      season: 'Autumn',
      months: ['Monkey 申', 'Rooster 酉', 'Dog 戌'],
      dominant: 'Metal',
      description: 'Metal is strongest in autumn'
    },
    {
      season: 'Winter',
      months: ['Pig 亥', 'Rat 子', 'Ox 丑'],
      dominant: 'Water',
      description: 'Water is strongest in winter'
    }
  ];

  const strengthFactors = [
    {
      factor: 'Timeliness (得时)',
      description: 'The season of birth determines the prevailing Qi',
      impact: 'Most influential factor',
      icon: <Clock className="w-5 h-5" />
    },
    {
      factor: 'Support (得助)',
      description: 'Companion elements - same element as Day Master',
      impact: 'Strengthens Day Master',
      icon: <User className="w-5 h-5" />
    },
    {
      factor: 'Nourishment (得地)',
      description: 'Resource elements - elements that produce Day Master',
      impact: 'Provides foundation',
      icon: <Activity className="w-5 h-5" />
    }
  ];

  const generatingCycle = [
    { from: 'Water', to: 'Wood', description: 'Water nourishes Wood' },
    { from: 'Wood', to: 'Fire', description: 'Wood feeds Fire' },
    { from: 'Fire', to: 'Earth', description: 'Fire creates Earth (ash)' },
    { from: 'Earth', to: 'Metal', description: 'Earth bears Metal' },
    { from: 'Metal', to: 'Water', description: 'Metal collects Water' }
  ];

  const elementRoles = {
    strong: {
      favorable: [
        { name: 'Output Element (食伤)', description: 'Element your Day Master produces - drains your energy', example: 'Wood DM → Fire' },
        { name: 'Wealth Element (财星)', description: 'Element your Day Master controls - takes effort', example: 'Wood DM → Earth' },
        { name: 'Influence Element (官杀)', description: 'Element that controls your Day Master - disciplines you', example: 'Wood DM ← Metal' }
      ],
      unfavorable: [
        { name: 'Resource Element (印星)', description: 'Element that produces you - makes you stronger', example: 'Water → Wood DM' },
        { name: 'Companion Element (比劫)', description: 'Same element as you - strengthens you', example: 'Wood = Wood DM' }
      ]
    },
    weak: {
      favorable: [
        { name: 'Resource Element (印星)', description: 'Element that produces you - provides support', example: 'Water → Wood DM' },
        { name: 'Companion Element (比劫)', description: 'Same element as you - provides assistance', example: 'Wood = Wood DM' }
      ],
      unfavorable: [
        { name: 'Output Element (食伤)', description: 'Element your Day Master produces - drains you', example: 'Wood DM → Fire' },
        { name: 'Wealth Element (财星)', description: 'Element your Day Master controls - exhausts you', example: 'Wood DM → Earth' },
        { name: 'Influence Element (官杀)', description: 'Element that controls your Day Master - oppresses you', example: 'Wood DM ← Metal' }
      ]
    }
  };

  const balanceExamples = [
    {
      type: 'Balanced Chart',
      description: 'Favorable elements have strength, unfavorable elements are controlled',
      characteristics: [
        'Smooth flow of Qi',
        'Day Master appropriately supported or restrained',
        'Easier navigation of life challenges',
        'Better ability to seize opportunities'
      ],
      icon: <CheckCircle className="w-5 h-5 text-green-600" />
    },
    {
      type: 'Imbalanced Chart',
      description: 'Unfavorable elements dominate or favorable elements are weak',
      characteristics: [
        'Inherent tensions and challenges',
        'Life lessons and growth opportunities',
        'Requires conscious choices for balance',
        'Guidance needed for harmonious existence'
      ],
      icon: <AlertCircle className="w-5 h-5 text-yellow-600" />
    }
  ];

  return (
    <EnglishLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Five Elements Balance in BaZi Analysis
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              五行平衡 - The core of BaZi analysis: determining harmony through Day Master strength assessment
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <Badge variant="outline" className="text-sm">
                <BookOpen className="w-4 h-4 mr-1" />
                22 min read
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Scale className="w-4 h-4 mr-1" />
                Advanced Analysis
              </Badge>
            </div>
          </div>

          {/* Important Disclaimer */}
          <Alert className="mb-8 border-amber-200 bg-amber-50 dark:bg-amber-900/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Educational Purpose:</strong> This is a simplified explanation for learning. True BaZi reading is highly nuanced and best performed by experienced practitioners.
            </AlertDescription>
          </Alert>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="concept">Core Concept</TabsTrigger>
              <TabsTrigger value="chart">Create Chart</TabsTrigger>
              <TabsTrigger value="strength">Assess Strength</TabsTrigger>
              <TabsTrigger value="elements">Element Roles</TabsTrigger>
              <TabsTrigger value="balance">Balance Analysis</TabsTrigger>
            </TabsList>

            {/* Core Concept Tab */}
            <TabsContent value="concept" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="w-6 h-6" />
                    The Goal: Harmony, Not Equality
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed">
                      "Balance" in BaZi does not mean having an equal number of each of the five elements. Instead, balance is determined relative to the strength of your <strong>Day Master (日主 or 日元)</strong>.
                    </p>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
                        Day Master: The Core of Your Chart
                      </h3>
                      <p className="text-blue-700 dark:text-blue-300">
                        The Day Master is <strong>you</strong> - the core of the chart. The goal is to have the other elements in the chart support the Day Master in a harmonious way.
                      </p>
                    </div>
                  </div>

                  {/* Five Elements Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {elements.map((element, index) => (
                      <Card key={index} className="border-2 border-dashed">
                        <CardContent className="p-4 text-center">
                          <div className={`${element.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`}>
                            <span className="text-2xl font-bold">{element.chinese}</span>
                          </div>
                          <h3 className="font-semibold text-lg">{element.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {element.season}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Create Chart Tab */}
            <TabsContent value="chart" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Compass className="w-6 h-6" />
                    Step 1: Create Your BaZi Chart (排盘)
                  </CardTitle>
                  <CardDescription>
                    You need accurate birth information to generate the Four Pillars
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-4">Required Information:</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-300 font-bold">1</span>
                          </div>
                          <span>Birth Year</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-300 font-bold">2</span>
                          </div>
                          <span>Birth Month</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-300 font-bold">3</span>
                          </div>
                          <span>Birth Day</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-300 font-bold">4</span>
                          </div>
                          <span>Birth Hour (as accurately as possible)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-4">Chart Structure:</h3>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-center mb-4">
                          <h4 className="font-medium">Four Pillars (四柱)</h4>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div className="text-center">
                            <div className="p-2 bg-white dark:bg-gray-700 rounded mb-1">天干</div>
                            <div className="p-2 bg-white dark:bg-gray-700 rounded">地支</div>
                            <div className="mt-2 text-xs text-gray-500">Year</div>
                          </div>
                          <div className="text-center">
                            <div className="p-2 bg-white dark:bg-gray-700 rounded mb-1">天干</div>
                            <div className="p-2 bg-white dark:bg-gray-700 rounded">地支</div>
                            <div className="mt-2 text-xs text-gray-500">Month</div>
                          </div>
                          <div className="text-center border-2 border-blue-300 dark:border-blue-600 rounded">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded mb-1">
                              <strong>日主</strong>
                            </div>
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">地支</div>
                            <div className="mt-2 text-xs text-blue-600 dark:text-blue-300 font-medium">Day</div>
                          </div>
                          <div className="text-center">
                            <div className="p-2 bg-white dark:bg-gray-700 rounded mb-1">天干</div>
                            <div className="p-2 bg-white dark:bg-gray-700 rounded">地支</div>
                            <div className="mt-2 text-xs text-gray-500">Hour</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Alert className="border-green-200 bg-green-50 dark:bg-green-900/10">
                    <Target className="h-4 w-4" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      <strong>Day Master Identification:</strong> The Heavenly Stem (天干) of the Day Pillar is your Day Master - the most important element in your entire chart.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Assess Strength Tab */}
            <TabsContent value="strength" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6" />
                    Step 3: Analyze Day Master Strength (身强 or 身弱)
                  </CardTitle>
                  <CardDescription>
                    The most critical step - determining if your Day Master is strong or weak
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Three Factors */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {strengthFactors.map((factor, index) => (
                      <Card key={index} className="border-2 border-dashed">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                              {factor.icon}
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm">{factor.factor}</h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{factor.impact}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {factor.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Seasonal Strength */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Seasonal Element Strength</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {seasons.map((season, index) => (
                        <Card key={index} className="border border-gray-200 dark:border-gray-700">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold">{season.season}</h4>
                              <Badge variant="outline" className="text-xs">
                                {season.dominant} Dominant
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-1">
                                {season.months.map((month, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {month}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {season.description}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Generating Cycle */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Resource Elements (Generating Cycle)</h3>
                    <div className="space-y-3">
                      {generatingCycle.map((cycle, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                          <span className="font-medium text-green-700 dark:text-green-300">{cycle.from}</span>
                          <span className="text-green-600">→</span>
                          <span className="font-medium text-green-700 dark:text-green-300">{cycle.to}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-auto">
                            {cycle.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Element Roles Tab */}
            <TabsContent value="elements" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-6 h-6" />
                    Step 4: Identify Favorable vs. Unfavorable Elements
                  </CardTitle>
                  <CardDescription>
                    Elements that help or hinder based on Day Master strength
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Strong Day Master */}
                    <Card className="border-2 border-orange-200 dark:border-orange-800">
                      <CardHeader className="bg-orange-50 dark:bg-orange-900/10">
                        <CardTitle className="text-orange-800 dark:text-orange-200">
                          If Day Master is TOO STRONG (身强)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4">
                        <div>
                          <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Favorable Elements (喜神)
                          </h4>
                          <div className="space-y-2">
                            {elementRoles.strong.favorable.map((role, index) => (
                              <div key={index} className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                                <div className="font-medium text-sm text-green-800 dark:text-green-200">
                                  {role.name}
                                </div>
                                <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                                  {role.description}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Example: {role.example}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Unfavorable Elements (忌神)
                          </h4>
                          <div className="space-y-2">
                            {elementRoles.strong.unfavorable.map((role, index) => (
                              <div key={index} className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                                <div className="font-medium text-sm text-red-800 dark:text-red-200">
                                  {role.name}
                                </div>
                                <div className="text-xs text-red-700 dark:text-red-300 mt-1">
                                  {role.description}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Example: {role.example}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Weak Day Master */}
                    <Card className="border-2 border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/10">
                        <CardTitle className="text-blue-800 dark:text-blue-200">
                          If Day Master is WEAK (身弱)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4">
                        <div>
                          <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Favorable Elements (喜神)
                          </h4>
                          <div className="space-y-2">
                            {elementRoles.weak.favorable.map((role, index) => (
                              <div key={index} className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                                <div className="font-medium text-sm text-green-800 dark:text-green-200">
                                  {role.name}
                                </div>
                                <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                                  {role.description}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Example: {role.example}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Unfavorable Elements (忌神)
                          </h4>
                          <div className="space-y-2">
                            {elementRoles.weak.unfavorable.map((role, index) => (
                              <div key={index} className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                                <div className="font-medium text-sm text-red-800 dark:text-red-200">
                                  {role.name}
                                </div>
                                <div className="text-xs text-red-700 dark:text-red-300 mt-1">
                                  {role.description}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Example: {role.example}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Balance Analysis Tab */}
            <TabsContent value="balance" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="w-6 h-6" />
                    What is a Balanced Chart?
                  </CardTitle>
                  <CardDescription>
                    Understanding the characteristics of balanced and imbalanced charts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {balanceExamples.map((example, index) => (
                      <Card key={index} className="border-2 border-dashed">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            {example.icon}
                            <h3 className="font-semibold text-lg">{example.type}</h3>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {example.description}
                          </p>
                          <div className="space-y-2">
                            {example.characteristics.map((char, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-sm">{char}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-900/10">
                    <Star className="h-4 w-4" />
                    <AlertDescription className="text-purple-800 dark:text-purple-200">
                      <strong>Key Insight:</strong> Most charts are not perfectly balanced. The imbalances represent inherent tensions, challenges, and life lessons. The goal is to identify these patterns and provide guidance for harmonious living.
                    </AlertDescription>
                  </Alert>

                  <div className="prose dark:prose-invert max-w-none">
                    <h3 className="text-lg font-semibold mb-3">The Path to Balance</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      A BaZi reading aims to identify imbalances and provide guidance on how to "balance" them through conscious choices in life:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Career choices</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Location selection</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Color preferences</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Lifestyle adjustments</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </EnglishLayout>
  );
} 