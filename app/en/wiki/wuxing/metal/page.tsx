'use client';

import { useState } from 'react';
import EnglishLayout from '@/components/EnglishLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Gem, Compass, Shield, Scissors, Wrench, Zap, Grid } from 'lucide-react';

export default function MetalElementPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const correspondences = [
    { category: "Season", association: "Autumn", description: "The time of contraction, letting go, and preserving the essential." },
    { category: "Direction", association: "West", description: "The direction of the setting sun, where energy draws inward." },
    { category: "Climate", association: "Dryness", description: "Represents the crisp, clear air of autumn." },
    { category: "Color", association: "White, Metallic Gray", description: "The colors of metal, purity, and bone." },
    { category: "Yin Organ", association: "Lung (肺)", description: "Takes in the pure (oxygen) and expels the impure (CO2); governs protective Qi." },
    { category: "Yang Organ", association: "Large Intestine (大腸)", description: "The ultimate organ of letting go, eliminating physical waste." },
    { category: "Emotion", association: "Righteousness / Courage", description: "Balanced: A strong sense of justice, integrity, and dignity." },
    { category: "Imbalance", association: "Grief / Sadness", description: "Imbalanced: An inability to process loss and let go of the past." }
  ];

  const balanceStates = [
    {
      id: "balanced",
      title: "Balanced Metal",
      icon: <Shield className="w-6 h-6 text-gray-600" />,
      description: "A person with balanced Metal is organized, self-disciplined, and principled. They value quality, respect boundaries, and can process grief in a healthy way. They have a quiet dignity and a clear sense of right and wrong.",
      color: "border-gray-500"
    },
    {
      id: "excess",
      title: "Excess Metal",
      icon: <Scissors className="w-6 h-6 text-slate-600" />,
      description: "Too much Metal leads to rigidity and coldness. This person can be overly critical, perfectionistic, dogmatic, and emotionally distant. They may be obsessed with rules and order to the point of being harsh and unforgiving.",
      color: "border-slate-500"
    },
    {
      id: "deficient",
      title: "Deficient Metal",
      icon: <Wrench className="w-6 h-6 text-gray-400" />,
      description: "A lack of Metal results in a 'spineless' or unstructured life. This person may be disorganized, sloppy, and have weak boundaries. They may have low self-esteem and an inability to let go of sadness, leading to chronic grief. Physically, this can manifest as a weak immune system, frequent colds, and skin problems.",
      color: "border-gray-400"
    }
  ];

  const structureAspects = [
    {
      title: "Order, Rules, and Ritual",
      description: "Metal energy thrives on order and discipline. It is the force behind schedules, routines, laws, and codes of conduct. This isn't about rigid restriction, but about creating a framework that allows for excellence and quality to emerge.",
      icon: <Grid className="w-8 h-8 text-gray-600" />
    },
    {
      title: "Boundaries and Self-Worth",
      description: "Like the hard, defined edge of a diamond, Metal governs our sense of self and our personal boundaries. A healthy Metal element provides a clear understanding of where we end and others begin. This fosters self-respect, dignity, and integrity.",
      icon: <Shield className="w-8 h-8 text-gray-600" />
    },
    {
      title: "The Skeleton of Principle",
      description: "Metal represents our core principles and ethics—the unyielding internal structure of our character. It is the part of us that stands for justice, righteousness, and what is right, regardless of circumstance.",
      icon: <Compass className="w-8 h-8 text-gray-600" />
    }
  ];

  const precisionAspects = [
    {
      title: "Clarity and Analysis",
      description: "Metal energy is sharp and clear, like a well-forged blade. It allows us to 'cut through the noise,' to categorize information, to think logically, and to communicate with precision. It seeks clarity over emotional confusion.",
      icon: <Zap className="w-8 h-8 text-slate-600" />
    },
    {
      title: "The Pursuit of Quality",
      description: "The Metal element is associated with the artisan and the pursuit of excellence. It is the drive to refine our skills, to pay attention to detail, and to create things of lasting quality and beauty. It values the refined over the raw.",
      icon: <Gem className="w-8 h-8 text-slate-600" />
    },
    {
      title: "Letting Go: The Ultimate Precision",
      description: "The most profound act of precision is knowing what to cut away. In autumn, trees shed their leaves to conserve their essential energy for winter. Similarly, the Metal element governs our ability to let go of what no longer serves us—old habits, stale relationships, and past grievances. The associated emotion, grief, is the natural process of releasing these attachments.",
      icon: <Scissors className="w-8 h-8 text-slate-600" />
    }
  ];

  return (
    <EnglishLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-gray-500/10 rounded-full">
              <Gem className="w-16 h-16 text-gray-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            The Metal Element
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            金 (jīn) - Structure, Precision, and Refinement
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Following the expansive peak of Fire and the nurturing harvest of Earth, Metal represents the drawing inward of energy. It is the cool, crisp air of autumn, where the non-essential falls away, leaving only structure, purity, and value.
          </p>
        </div>

        {/* The Essence of Metal */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gem className="w-6 h-6 text-slate-600" />
              The Essence of Metal: The Alchemist and the Jeweler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                To understand the Metal element, think of an alchemist refining ore or a jeweler cutting a gemstone:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Raw Material</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    They take something raw and earthy (from the Earth element) and apply discipline and precision
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Refinement</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    They cut away impurities and excess material
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Structure</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    They reveal an underlying structure and brilliance
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Value</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    The final product is something of great value, strength, and beauty
                  </p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                This process of refinement perfectly captures the essence of the Metal element: creating order and value by paring down to the essential.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Metal as Structure */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid className="w-6 h-6 text-gray-600" />
              Metal as Structure (結構 - Jiégòu)
            </CardTitle>
            <CardDescription>
              Structure is the internal framework that gives everything its shape, strength, and integrity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {structureAspects.map((aspect, index) => (
                <Card key={index} className="border-l-4 border-gray-500">
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

        {/* Metal as Precision */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="w-6 h-6 text-slate-600" />
              Metal as Precision (精確 - Jīngquè)
            </CardTitle>
            <CardDescription>
              Precision is the ability to see clearly, analyze, and act with accuracy and focus.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {precisionAspects.map((aspect, index) => (
                <Card key={index} className="border-l-4 border-slate-500">
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

        {/* Metal Element Correspondences */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>The Metal Element at a Glance</CardTitle>
            <CardDescription>
              Essential correspondences and associations of the Metal element
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
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">{item.association}</td>
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
              Understanding the different states of Metal energy in the body and mind
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
                  <a href="/en/wiki/wuxing/earth" className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300">
                    Earth
                  </a>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600 font-medium">Metal</span>
                  <span className="text-gray-400">•</span>
                  <a href="/en/wiki/wuxing/water" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    Water
                  </a>
                </div>
              </div>
              <a 
                href="/en/wiki/wuxing" 
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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