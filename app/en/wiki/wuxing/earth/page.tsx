'use client';

import { useState } from 'react';
import EnglishLayout from '@/components/EnglishLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Mountain, Anchor, Shield, Heart, Sprout, Globe, Compass } from 'lucide-react';

export default function EarthElementPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const correspondences = [
    { category: "Season", association: "Late Summer / Seasonal Transitions", description: "The time of harvest and the calm pivot between other seasons." },
    { category: "Direction", association: "Center", description: "The point of balance and grounding." },
    { category: "Climate", association: "Dampness / Humidity", description: "Represents the rich, moist soil ready for harvest." },
    { category: "Color", association: "Yellow", description: "The color of the loess soil in central China and ripe grain." },
    { category: "Yin Organ", association: "Spleen (脾)", description: "Transforms food into Qi and Blood, governs digestion and thought." },
    { category: "Yang Organ", association: "Stomach (胃)", description: "Receives and breaks down food, the 'origin of fluids.'" },
    { category: "Emotion", association: "Empathy / Thoughtfulness", description: "Balanced: The capacity for deep care, support, and understanding." },
    { category: "Imbalance", association: "Worry / Overthinking", description: "Imbalanced: Getting stuck in mental loops, obsession, and anxiety." }
  ];

  const balanceStates = [
    {
      id: "balanced",
      title: "Balanced Earth",
      icon: <Heart className="w-6 h-6 text-yellow-600" />,
      description: "A person with balanced Earth is a natural nurturer. They are stable, grounded, practical, and deeply empathetic. They are the 'rock' that friends and family rely on for support and common sense.",
      color: "border-yellow-500"
    },
    {
      id: "excess",
      title: "Excess Earth",
      icon: <Mountain className="w-6 h-6 text-amber-600" />,
      description: "Too much Earth leads to stagnation. This can manifest as worry, overthinking, and obsession. The person may become meddlesome, needy, and resistant to change. Physically, it can lead to sluggishness, weight gain, and a feeling of heaviness or 'dampness.'",
      color: "border-amber-500"
    },
    {
      id: "deficient",
      title: "Deficient Earth",
      icon: <Globe className="w-6 h-6 text-gray-500" />,
      description: "A lack of Earth energy results in feeling ungrounded and scattered. This can cause 'brain fog,' difficulty concentrating, and a feeling of being disconnected. The person may suffer from poor digestion and chronic fatigue, lacking the energy to sustain themselves or others.",
      color: "border-gray-500"
    }
  ];

  const stabilityAspects = [
    {
      title: "Grounding and Centering",
      description: "Earth energy connects us to the present moment and to our physical bodies. It's the feeling of being 'grounded,' secure, and centered in oneself, even amidst chaos. This provides a sense of safety and calm.",
      icon: <Anchor className="w-8 h-8 text-yellow-600" />
    },
    {
      title: "The Great Peacemaker",
      description: "Positioned at the center of the Wu Xing cycle, Earth is the ultimate harmonizer. It provides the stable transition between the other elements and seasons. A person with strong Earth energy is often the reliable, dependable peacemaker in a group, able to mediate disputes and create harmony.",
      icon: <Shield className="w-8 h-8 text-yellow-600" />
    },
    {
      title: "Reliability and Consistency",
      description: "Earth is predictable and constant. The sun rises, the seasons change, and the ground is always there. This translates into qualities of perseverance, patience, and dependability. Earth energy is what allows us to follow through on our plans with steady, consistent effort.",
      icon: <Compass className="w-8 h-8 text-yellow-600" />
    }
  ];

  const nourishmentAspects = [
    {
      title: "Digestion and Transformation",
      description: "In Traditional Chinese Medicine (TCM), the Earth element is embodied by the Spleen and Stomach. These organs are the center of digestion, responsible for 'transforming and transporting' the food we eat into Qi (energy) and Blood. This is the most literal form of nourishment.",
      icon: <Globe className="w-8 h-8 text-amber-600" />
    },
    {
      title: "Thoughtfulness and Empathy",
      description: "This physical process mirrors a mental and emotional one. Earth energy allows us to 'digest' information and experiences, turning them into practical wisdom. It also governs our capacity for empathy—the ability to understand and care for others, providing emotional nourishment and support.",
      icon: <Heart className="w-8 h-8 text-amber-600" />
    },
    {
      title: "The Harvest",
      description: "Earth represents the abundance of the harvest. It is the fruition of the growth cycle. This relates to our ability to receive abundance, feel gratitude, and to generously share our resources (time, energy, compassion) with others.",
      icon: <Sprout className="w-8 h-8 text-amber-600" />
    }
  ];

  return (
    <EnglishLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-yellow-500/10 rounded-full">
              <Mountain className="w-16 h-16 text-yellow-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            The Earth Element
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            土 (tǔ) - The Great Stabilizer and Nourisher
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            If Wood is the upward thrust of birth and Fire is the radiant peak of life, Earth is the grounding, centering force that provides stability, nourishment, and balance. It is the pivot around which all the other elements rotate.
          </p>
        </div>

        {/* The Essence of Earth */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-amber-600" />
              The Essence of Earth: The Fertile Ground
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                To understand the Earth element, visualize a rich, fertile field or the ground beneath your feet:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Foundation</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Stable and supportive, providing a firm foundation for everything that stands upon it
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Transformation</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Receives the rain and sun (Water and Fire) and transforms them into life
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Nourishment</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Yields a harvest, providing the nourishment that sustains all living creatures
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Center</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Represents the center, the place of return, balance, and home
                  </p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                This imagery captures the core qualities of the Earth element: being the reliable, nurturing foundation of life.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Earth as Stability */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Anchor className="w-6 h-6 text-yellow-600" />
              Earth as Stability (穩定 - Wěndìng)
            </CardTitle>
            <CardDescription>
              Stability is the fundamental promise of the Earth element. It provides the security necessary for all other processes to occur.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stabilityAspects.map((aspect, index) => (
                <Card key={index} className="border-l-4 border-yellow-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      {aspect.icon}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {aspect.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {aspect.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Earth as Nourishment */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="w-6 h-6 text-amber-600" />
              Earth as Nourishment (滋養 - Zīyǎng)
            </CardTitle>
            <CardDescription>
              Nourishment is the active expression of Earth's stability. It is the process of transforming raw materials into life-sustaining energy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nourishmentAspects.map((aspect, index) => (
                <Card key={index} className="border-l-4 border-amber-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      {aspect.icon}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {aspect.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {aspect.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Earth Element Correspondences */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>The Earth Element at a Glance</CardTitle>
            <CardDescription>
              Essential correspondences and associations of the Earth element
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-semibold text-gray-900 dark:text-white">Category</th>
                    <th className="text-left py-2 px-4 font-semibold text-gray-900 dark:text-white">Association</th>
                    <th className="text-left py-2 px-4 font-semibold text-gray-900 dark:text-white">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {correspondences.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{item.category}</td>
                      <td className="py-3 px-4 text-yellow-600 dark:text-yellow-400 font-medium">{item.association}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Balance and Imbalance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Balance and Imbalance</CardTitle>
            <CardDescription>
              Understanding the different states of Earth energy in the body and mind
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {balanceStates.map((state) => (
                <Card 
                  key={state.id} 
                  className={`border-2 ${state.color} cursor-pointer transition-all duration-200 hover:shadow-lg`}
                  onClick={() => setActiveSection(activeSection === state.id ? null : state.id)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {state.icon}
                        {state.title}
                      </div>
                      <ChevronRight 
                        className={`w-5 h-5 transition-transform duration-200 ${
                          activeSection === state.id ? 'rotate-90' : ''
                        }`}
                      />
                    </CardTitle>
                  </CardHeader>
                  {activeSection === state.id && (
                    <CardContent className="pt-0">
                      <p className="text-gray-600 dark:text-gray-400">
                        {state.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-center sm:text-left">
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Continue exploring the Five Elements:
                </p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <a href="/en/wiki/wuxing/wood" className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300">
                    Wood
                  </a>
                  <span className="text-gray-400">•</span>
                  <a href="/en/wiki/wuxing/fire" className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                    Fire
                  </a>
                  <span className="text-gray-400">•</span>
                  <span className="text-yellow-600 font-medium">Earth</span>
                  <span className="text-gray-400">•</span>
                  <a href="/en/wiki/wuxing/metal" className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    Metal
                  </a>
                  <span className="text-gray-400">•</span>
                  <a href="/en/wiki/wuxing/water" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    Water
                  </a>
                </div>
              </div>
              <a 
                href="/en/wiki/wuxing" 
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Back to Wu Xing
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </EnglishLayout>
  );
} 