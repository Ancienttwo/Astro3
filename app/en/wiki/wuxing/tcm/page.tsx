'use client';

import React, { useState } from 'react';
import { Heart, Leaf, Mountain, Gem, Droplets, ArrowRight, ArrowDown, Stethoscope, Pill, Target, Calendar, Utensils, Brain } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnglishLayout from '@/components/EnglishLayout';
import { useLanguage } from '@/contexts/LanguageContext';

export default function FiveElementsTCMPage() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('theory');

  const elements = [
    {
      name: 'Wood',
      chinese: '木',
      icon: <Leaf className="w-6 h-6" />,
      color: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200',
      borderColor: 'border-green-200 dark:border-green-800',
      yinOrgan: 'Liver',
      yangOrgan: 'Gall Bladder',
      emotion: 'Anger / Frustration',
      season: 'Spring',
      climate: 'Wind',
      color_attr: 'Green',
      taste: 'Sour',
      senseOrgan: 'Eyes (Sight)',
      bodyTissue: 'Tendons / Sinews',
      sound: 'Shouting'
    },
    {
      name: 'Fire',
      chinese: '火',
      icon: <Heart className="w-6 h-6" />,
      color: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200',
      borderColor: 'border-red-200 dark:border-red-800',
      yinOrgan: 'Heart',
      yangOrgan: 'Small Intestine',
      emotion: 'Joy / Anxiety',
      season: 'Summer',
      climate: 'Heat',
      color_attr: 'Red',
      taste: 'Bitter',
      senseOrgan: 'Tongue (Speech)',
      bodyTissue: 'Blood Vessels',
      sound: 'Laughing'
    },
    {
      name: 'Earth',
      chinese: '土',
      icon: <Mountain className="w-6 h-6" />,
      color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      yinOrgan: 'Spleen',
      yangOrgan: 'Stomach',
      emotion: 'Worry / Pensiveness',
      season: 'Late Summer',
      climate: 'Dampness',
      color_attr: 'Yellow',
      taste: 'Sweet',
      senseOrgan: 'Mouth (Taste)',
      bodyTissue: 'Muscles',
      sound: 'Singing'
    },
    {
      name: 'Metal',
      chinese: '金',
      icon: <Gem className="w-6 h-6" />,
      color: 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200',
      borderColor: 'border-gray-200 dark:border-gray-800',
      yinOrgan: 'Lungs',
      yangOrgan: 'Large Intestine',
      emotion: 'Grief / Sadness',
      season: 'Autumn',
      climate: 'Dryness',
      color_attr: 'White',
      taste: 'Pungent',
      senseOrgan: 'Nose (Smell)',
      bodyTissue: 'Skin & Body Hair',
      sound: 'Weeping'
    },
    {
      name: 'Water',
      chinese: '水',
      icon: <Droplets className="w-6 h-6" />,
      color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200',
      borderColor: 'border-blue-200 dark:border-blue-800',
      yinOrgan: 'Kidneys',
      yangOrgan: 'Bladder',
      emotion: 'Fear / Willpower',
      season: 'Winter',
      climate: 'Cold',
      color_attr: 'Black / Dark Blue',
      taste: 'Salty',
      senseOrgan: 'Ears (Hearing)',
      bodyTissue: 'Bones & Head Hair',
      sound: 'Groaning'
    }
  ];

  const shengCycle = [
    { from: 'Wood', to: 'Fire', description: 'Wood feeds Fire', mechanism: 'Combustion fuel' },
    { from: 'Fire', to: 'Earth', description: 'Fire creates Earth', mechanism: 'Ash formation' },
    { from: 'Earth', to: 'Metal', description: 'Earth bears Metal', mechanism: 'Ore extraction' },
    { from: 'Metal', to: 'Water', description: 'Metal carries Water', mechanism: 'Condensation' },
    { from: 'Water', to: 'Wood', description: 'Water nourishes Wood', mechanism: 'Plant growth' }
  ];

  const keCycle = [
    { from: 'Wood', to: 'Earth', description: 'Wood controls Earth', mechanism: 'Roots hold soil' },
    { from: 'Earth', to: 'Water', description: 'Earth controls Water', mechanism: 'Banks contain river' },
    { from: 'Water', to: 'Fire', description: 'Water controls Fire', mechanism: 'Water extinguishes fire' },
    { from: 'Fire', to: 'Metal', description: 'Fire controls Metal', mechanism: 'Fire melts metal' },
    { from: 'Metal', to: 'Wood', description: 'Metal controls Wood', mechanism: 'Axe cuts wood' }
  ];

  const clinicalExamples = [
    {
      title: 'Liver/Wood Imbalance',
      symptoms: ['Irritability', 'Tendonitis', 'Vision problems'],
      diagnosis: 'Wood element excess or stagnation',
      treatment: 'Sedate Wood, strengthen Metal (controller)',
      icon: <Leaf className="w-5 h-5" />
    },
    {
      title: 'Spleen/Earth Imbalance',
      symptoms: ['Chronic worry', 'Muscle weakness', 'Digestive issues'],
      diagnosis: 'Earth element deficiency',
      treatment: 'Tonify Earth, strengthen Fire (mother)',
      icon: <Mountain className="w-5 h-5" />
    },
    {
      title: 'Kidney/Water Imbalance',
      symptoms: ['Fear', 'Bone problems', 'Hearing issues'],
      diagnosis: 'Water element deficiency',
      treatment: 'Tonify Water, strengthen Metal (mother)',
      icon: <Droplets className="w-5 h-5" />
    }
  ];

  const treatmentMethods = [
    {
      method: 'Acupuncture',
      description: 'Points selected along meridians to tonify deficiency or sedate excess',
      icon: <Target className="w-5 h-5" />,
      example: 'Liver 3 (Taichong) to calm Wood element excess'
    },
    {
      method: 'Herbal Medicine',
      description: 'Herbs chosen based on taste and energetic properties',
      icon: <Pill className="w-5 h-5" />,
      example: 'Sour herbs like Schisandra for Liver/Wood support'
    },
    {
      method: 'Dietary Therapy',
      description: 'Foods that support the imbalanced element',
      icon: <Utensils className="w-5 h-5" />,
      example: 'Warm, sweet foods for Spleen/Earth deficiency'
    },
    {
      method: 'Lifestyle Advice',
      description: 'Exercise, emotional expression, and daily routines',
      icon: <Brain className="w-5 h-5" />,
      example: 'Qigong movements for specific element harmonization'
    }
  ];

  return (
    <EnglishLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Five Elements in Traditional Chinese Medicine
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              五行 (Wǔ Xíng) - The fundamental framework for understanding physiology, pathology, diagnosis, and treatment in TCM
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <Badge variant="outline" className="text-sm">
                <Calendar className="w-4 h-4 mr-1" />
                25 min read
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Stethoscope className="w-4 h-4 mr-1" />
                Clinical Theory
              </Badge>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="theory">Core Theory</TabsTrigger>
              <TabsTrigger value="correspondences">Correspondences</TabsTrigger>
              <TabsTrigger value="cycles">Dynamic Cycles</TabsTrigger>
              <TabsTrigger value="clinical">Clinical Application</TabsTrigger>
            </TabsList>

            {/* Core Theory Tab */}
            <TabsContent value="theory" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-6 h-6" />
                    The Foundation of TCM
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed">
                      The Five Element Theory (五行 - Wǔ Xíng) is one of the most fundamental and important pillars of Traditional Chinese Medicine (TCM). It is a comprehensive and elegant system used to understand the macrocosm of the universe and the microcosm of the human body.
                    </p>
                    
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                        Key Understanding
                      </h3>
                      <p className="text-yellow-700 dark:text-yellow-300">
                        It's crucial to understand that the "elements" are not literal substances but are better understood as <strong>five fundamental processes, patterns, or energetic movements</strong>. Each element represents a different phase of a cyclical movement and possesses a unique set of qualities and correspondences.
                      </p>
                    </div>

                    <p className="text-lg leading-relaxed">
                      This theory provides a master blueprint for everything from physiology and pathology to diagnosis and treatment. The power of the theory lies in its web of associations - an imbalance in one aspect will ripple through the entire system.
                    </p>
                  </div>

                  {/* Elements Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {elements.map((element, index) => (
                      <Card key={index} className={`${element.borderColor} border-2`}>
                        <CardContent className="p-4 text-center">
                          <div className={`${element.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`}>
                            {element.icon}
                          </div>
                          <h3 className="font-semibold text-lg">{element.name}</h3>
                          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{element.chinese}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            {element.season}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Correspondences Tab */}
            <TabsContent value="correspondences" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Complete Correspondence Table</CardTitle>
                  <CardDescription>
                    Each element is linked to multiple aspects of human physiology and the natural world
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                          <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left font-semibold">Aspect</th>
                          {elements.map((element, index) => (
                            <th key={index} className={`border border-gray-200 dark:border-gray-700 px-4 py-3 text-center ${element.color}`}>
                              <div className="flex items-center justify-center gap-2">
                                {element.icon}
                                <span>{element.name} ({element.chinese})</span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 font-medium">Yin Organ (Zang)</td>
                          {elements.map((element, index) => (
                            <td key={index} className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center">
                              {element.yinOrgan}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 font-medium">Yang Organ (Fu)</td>
                          {elements.map((element, index) => (
                            <td key={index} className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center">
                              {element.yangOrgan}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 font-medium">Emotion</td>
                          {elements.map((element, index) => (
                            <td key={index} className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center">
                              {element.emotion}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 font-medium">Season</td>
                          {elements.map((element, index) => (
                            <td key={index} className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center">
                              {element.season}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 font-medium">Climate</td>
                          {elements.map((element, index) => (
                            <td key={index} className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center">
                              {element.climate}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 font-medium">Color</td>
                          {elements.map((element, index) => (
                            <td key={index} className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center">
                              {element.color_attr}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 font-medium">Taste</td>
                          {elements.map((element, index) => (
                            <td key={index} className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center">
                              {element.taste}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 font-medium">Sense Organ</td>
                          {elements.map((element, index) => (
                            <td key={index} className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center">
                              {element.senseOrgan}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 font-medium">Body Tissue</td>
                          {elements.map((element, index) => (
                            <td key={index} className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center">
                              {element.bodyTissue}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 font-medium">Sound</td>
                          {elements.map((element, index) => (
                            <td key={index} className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center">
                              {element.sound}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Dynamic Cycles Tab */}
            <TabsContent value="cycles" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sheng Cycle */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowRight className="w-5 h-5 text-green-600" />
                      Sheng Cycle (Generating)
                    </CardTitle>
                    <CardDescription>
                      Mother-Child Relationship - How elements nourish each other
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {shengCycle.map((cycle, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-green-700 dark:text-green-300">
                            {cycle.from}
                          </span>
                          <ArrowRight className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-700 dark:text-green-300">
                            {cycle.to}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {cycle.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {cycle.mechanism}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                        Clinical Significance
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        If an element is weak or "deficient," treat its "mother" element to restore nourishment flow. 
                        Example: To strengthen weak Lungs (Metal), also treat the Spleen (Earth), the mother of Metal.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Ke Cycle */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowDown className="w-5 h-5 text-red-600" />
                      Ke Cycle (Controlling)
                    </CardTitle>
                    <CardDescription>
                      Grandparent-Grandchild Relationship - How elements control each other
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {keCycle.map((cycle, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-red-700 dark:text-red-300">
                            {cycle.from}
                          </span>
                          <ArrowDown className="w-4 h-4 text-red-600" />
                          <span className="font-semibold text-red-700 dark:text-red-300">
                            {cycle.to}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {cycle.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {cycle.mechanism}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                        Clinical Significance
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        If an element is "in excess," strengthen the controlling element to regulate it. 
                        Example: For explosive anger (excess Wood), strengthen Metal to help control it.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Clinical Application Tab */}
            <TabsContent value="clinical" className="space-y-8">
              {/* Diagnosis Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-6 h-6" />
                    Diagnosis Through Five Elements
                  </CardTitle>
                  <CardDescription>
                    How TCM practitioners translate symptoms into Five Element language
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {clinicalExamples.map((example, index) => (
                      <Card key={index} className="border-2 border-dashed">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            {example.icon}
                            <h3 className="font-semibold">{example.title}</h3>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Symptoms:</h4>
                              <ul className="text-sm text-gray-800 dark:text-gray-200">
                                {example.symptoms.map((symptom, idx) => (
                                  <li key={idx}>• {symptom}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Diagnosis:</h4>
                              <p className="text-sm text-gray-800 dark:text-gray-200">{example.diagnosis}</p>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Treatment:</h4>
                              <p className="text-sm text-gray-800 dark:text-gray-200">{example.treatment}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Treatment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="w-6 h-6" />
                    Treatment Methods
                  </CardTitle>
                  <CardDescription>
                    How Five Element theory guides different therapeutic approaches
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {treatmentMethods.map((method, index) => (
                      <Card key={index} className="border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                              {method.icon}
                            </div>
                            <h3 className="font-semibold text-lg">{method.method}</h3>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">
                            {method.description}
                          </p>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm">
                              <span className="font-medium">Example: </span>
                              {method.example}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Philosophy Section */}
              <Card>
                <CardHeader>
                  <CardTitle>The Philosophy of Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed">
                      In essence, the Five Element theory is a powerful and poetic system that recognizes the profound interconnectedness between our body, our mind, our emotions, and the natural world around us. 
                    </p>
                    <div className="bg-purple-50 dark:bg-purple-900/10 p-6 rounded-lg border border-purple-200 dark:border-purple-800 mt-4">
                      <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">
                        TCM Definition of Health
                      </h3>
                      <p className="text-purple-700 dark:text-purple-300">
                        Health is not the absence of symptoms, but the presence of <strong>dynamic balance and harmony</strong> among all five elements. A skilled TCM practitioner is like a gardener tending to an ecosystem.
                      </p>
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