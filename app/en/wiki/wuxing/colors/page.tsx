'use client';

import { useState } from 'react';
import EnglishLayout from '@/components/EnglishLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  Home, 
  Shirt, 
  Apple, 
  Brain, 
  Gem,
  ArrowRight,
  ArrowDown,
  Target,
  Sparkles,
  ChevronRight,
  Heart,
  Leaf,
  Mountain,
  CircleDot,
  Droplets
} from 'lucide-react';

export default function WuXingColorsPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const colorData = [
    {
      element: 'Wood',
      chinese: '木',
      colors: ['Green'],
      meaning: 'Growth, Renewal, Vitality, Action',
      whenToUse: 'When you feel stuck, indecisive, frustrated, or need a fresh start.',
      icon: <Leaf className="w-5 h-5" />,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      colorBg: 'bg-green-500',
      textColor: 'text-green-700 dark:text-green-300'
    },
    {
      element: 'Fire',
      chinese: '火',
      colors: ['Red'],
      meaning: 'Passion, Joy, Expansion, Connection',
      whenToUse: 'When you feel emotionally cold, depressed, lonely, or lack vitality.',
      icon: <CircleDot className="w-5 h-5" />,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      colorBg: 'bg-red-500',
      textColor: 'text-red-700 dark:text-red-300'
    },
    {
      element: 'Earth',
      chinese: '土',
      colors: ['Yellow', 'Brown', 'Ochre'],
      meaning: 'Stability, Grounding, Nourishment',
      whenToUse: 'When you feel worried, uncentered, scattered, or need comfort and security.',
      icon: <Mountain className="w-5 h-5" />,
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      colorBg: 'bg-yellow-500',
      textColor: 'text-yellow-700 dark:text-yellow-300'
    },
    {
      element: 'Metal',
      chinese: '金',
      colors: ['White', 'Gray', 'Metallic'],
      meaning: 'Purity, Structure, Clarity, Letting Go',
      whenToUse: 'When you feel cluttered (mentally or physically), disorganized, or are holding onto grief.',
      icon: <Sparkles className="w-5 h-5" />,
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      borderColor: 'border-gray-200 dark:border-gray-800',
      colorBg: 'bg-gray-500',
      textColor: 'text-gray-700 dark:text-gray-300'
    },
    {
      element: 'Water',
      chinese: '水',
      colors: ['Black', 'Dark Blue'],
      meaning: 'Stillness, Wisdom, Potential, Flow',
      whenToUse: 'When you feel fearful, burnt-out, exhausted, or need to tap into your inner reserves.',
      icon: <Droplets className="w-5 h-5" />,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      colorBg: 'bg-blue-500',
      textColor: 'text-blue-700 dark:text-blue-300'
    }
  ];

  const applications = [
    {
      title: 'Clothing & Accessories',
      icon: <Shirt className="w-6 h-6" />,
      description: 'This is the most direct way to wrap yourself in a specific energy for the day.',
      examples: [
        'Feeling scattered? Wear a yellow shirt.',
        'Need to be assertive in a meeting? A green tie or scarf can help.'
      ]
    },
    {
      title: 'Home & Office Decor',
      icon: <Home className="w-6 h-6" />,
      description: 'The colors you paint your walls, the furniture you choose, and the art you display constantly influence your subconscious.',
      examples: [
        'A blue bedroom can promote restful sleep (Water).',
        'A yellow kitchen can support nourishment and digestion (Earth).',
        'A green office space can foster creativity and growth (Wood).'
      ]
    },
    {
      title: 'Food Therapy',
      icon: <Apple className="w-6 h-6" />,
      description: 'Eating foods of a particular color can help nourish the corresponding organ system.',
      examples: [
        'Green: Leafy greens, broccoli, limes (Wood/Liver).',
        'Red: Berries, tomatoes, red peppers (Fire/Heart).',
        'Yellow: Squash, corn, bananas, lemons (Earth/Spleen).',
        'White: Onions, garlic, cauliflower, pears (Metal/Lungs).',
        'Black/Blue: Black beans, blueberries, seaweed (Water/Kidneys).'
      ]
    },
    {
      title: 'Visualization & Meditation',
      icon: <Brain className="w-6 h-6" />,
      description: 'During meditation, you can visualize yourself being bathed in a healing light of a specific color.',
      examples: [
        'Direct that energy to the part of your body or aspect of your life that needs it.'
      ]
    },
    {
      title: 'Crystals and Gemstones',
      icon: <Gem className="w-6 h-6" />,
      description: 'Using stones of a particular color can be a focused way to carry an element\'s energy with you.',
      examples: [
        'Rose quartz for Fire',
        'Amethyst for Water',
        'Tiger\'s eye for Earth'
      ]
    }
  ];

  const cycleExamples = [
    {
      type: 'Generating Cycle',
      title: 'To Nourish a Weak Element',
      description: 'If an element is weak or deficient, you can use the color of its "mother" element to nourish and strengthen it.',
      example: {
        problem: 'You feel chronic, low-level grief and have a weak immune system (deficient Metal).',
        solution: 'Use Yellow (Earth) to nourish and create Metal. Surrounding yourself with earthy, grounding colors can help build the foundation needed to process grief and strengthen your resolve.',
        mother: 'Earth',
        child: 'Metal'
      },
      icon: <ArrowDown className="w-5 h-5" />
    },
    {
      type: 'Controlling Cycle',
      title: 'To Sedate an Excessive Element',
      description: 'If an element is in excess and causing problems, you can use the color of the element that controls it to calm it down.',
      example: {
        problem: 'You are experiencing explosive anger, tension headaches, and frustration (excessive Wood).',
        solution: 'Use White or Metallic colors (Metal) to "cut through" the excess Wood energy. This can bring clarity, order, and a sense of calm to an overheated temper.',
        controller: 'Metal',
        controlled: 'Wood'
      },
      icon: <Target className="w-5 h-5" />
    }
  ];

  return (
    <EnglishLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Palette className="w-12 h-12 text-purple-600" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Five Elements Color Therapy
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Harness the energetic frequency of colors to influence the flow of Qi in your body and environment, 
              supporting emotional and physical well-being through the wisdom of the Five Elements.
            </p>
          </div>

          {/* Introduction */}
          <Card className="mb-8 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <Sparkles className="w-5 h-5" />
                The Principle of Color Therapy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Five Elements Color Therapy is based on the principle that colors, like all things, have a specific 
                energetic frequency or vibration. By consciously surrounding ourselves with certain colors, we can 
                influence the flow of Qi in our bodies and environments, helping to balance the energy of the Five 
                Elements within us.
              </p>
              <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-purple-700 dark:text-purple-300 italic">
                  It's a gentle, non-invasive way to support your emotional and physical well-being.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Color Signature Table */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">The Energetic Signature of Each Color</CardTitle>
              <CardDescription>
                Each element is associated with a primary color that embodies its core energy. 
                Using these colors can help to tonify (strengthen) a weak element or harmonize its expression.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {colorData.map((item, index) => (
                  <div 
                    key={index} 
                    className={`p-6 rounded-lg border-2 ${item.bgColor} ${item.borderColor} transition-all duration-300`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-full ${item.colorBg}`}>
                        {item.icon}
                      </div>
                      <div>
                        <h3 className={`text-xl font-semibold ${item.textColor}`}>
                          {item.element} ({item.chinese})
                        </h3>
                        <div className="flex gap-2 mt-2">
                          {item.colors.map((color, colorIndex) => (
                            <Badge key={colorIndex} variant="secondary">
                              {color}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Meaning & Energy: </span>
                        <span className="text-gray-600 dark:text-gray-400">{item.meaning}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">When to Use: </span>
                        <span className="text-gray-600 dark:text-gray-400">{item.whenToUse}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Applications */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">How to Apply Color Therapy in Daily Life</CardTitle>
              <CardDescription>
                You can incorporate these colors in many simple yet effective ways.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {applications.map((app, index) => (
                  <div key={index} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        {app.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                        {app.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                      {app.description}
                    </p>
                    <ul className="space-y-2">
                      {app.examples.map((example, exampleIndex) => (
                        <li key={exampleIndex} className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-500">
                          <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Advanced Applications */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Advanced Application: Using the Five Element Cycles</CardTitle>
              <CardDescription>
                For a more nuanced approach, you can use the Generating (Sheng) and Controlling (Ke) cycles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {cycleExamples.map((cycle, index) => (
                  <div key={index} className="border-l-4 border-purple-500 pl-6">
                    <div className="flex items-center gap-3 mb-4">
                      {cycle.icon}
                      <h3 className="text-xl font-semibold text-purple-700 dark:text-purple-300">
                        {cycle.type}: {cycle.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                      {cycle.description}
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
                      <div className="space-y-4">
                        <div>
                          <span className="font-medium text-red-600 dark:text-red-400">Problem: </span>
                          <span className="text-gray-700 dark:text-gray-300">{cycle.example.problem}</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-600 dark:text-green-400">Solution: </span>
                          <span className="text-gray-700 dark:text-gray-300">{cycle.example.solution}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Additional Example */}
                <div className="border-l-4 border-blue-500 pl-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="w-5 h-5" />
                    <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300">
                      Another Common Example
                    </h3>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
                    <div className="space-y-4">
                      <div>
                        <span className="font-medium text-red-600 dark:text-red-400">Problem: </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          You are feeling extreme anxiety and restlessness (excessive Fire).
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-green-600 dark:text-green-400">Solution: </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          Use Black or Dark Blue (Water) to cool and calm the agitated Fire. 
                          This is why deep blue is often considered a very calming and serene color.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conclusion */}
          <Card className="border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <Heart className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  By understanding these principles, you can use color as a powerful tool to consciously guide your energy, 
                  support your emotions, and create a greater sense of balance in your life.
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