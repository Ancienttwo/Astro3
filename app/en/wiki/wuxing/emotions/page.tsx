'use client';

import { useState } from 'react';
import EnglishLayout from '@/components/EnglishLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Heart, Brain, Smile, Frown, AlertCircle, Shield, Angry, Lightbulb } from 'lucide-react';

export default function EmotionsPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const emotionalMap = [
    {
      element: "Wood (木)",
      organs: "Liver, Gallbladder",
      balanced: "Drive, Assertiveness, Planning",
      imbalanced: "Anger, Frustration, Rage",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-500"
    },
    {
      element: "Fire (火)",
      organs: "Heart, Small Intestine",
      balanced: "Joy, Love, Connection",
      imbalanced: "Anxiety, Mania, Restlessness",
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-500"
    },
    {
      element: "Earth (土)",
      organs: "Spleen, Stomach",
      balanced: "Empathy, Thoughtfulness",
      imbalanced: "Worry, Overthinking, Rumination",
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      borderColor: "border-yellow-500"
    },
    {
      element: "Metal (金)",
      organs: "Lungs, Large Intestine",
      balanced: "Righteousness, Letting Go",
      imbalanced: "Grief, Sadness, Sorrow",
      color: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-50 dark:bg-gray-900/20",
      borderColor: "border-gray-500"
    },
    {
      element: "Water (水)",
      organs: "Kidneys, Bladder",
      balanced: "Willpower, Wisdom, Courage",
      imbalanced: "Fear, Insecurity, Dread",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-500"
    }
  ];

  const detailedEmotions = [
    {
      id: "wood",
      element: "Wood",
      title: "Anger & Assertiveness",
      icon: <Angry className="w-6 h-6 text-green-600" />,
      color: "border-green-500",
      balanced: "When Wood energy is flowing freely, it manifests as healthy ambition, drive, creativity, and the ability to plan and make decisions. It is the power of forward movement and growth.",
      imbalanced: "When this flow is blocked or 'stagnant,' the resulting emotion is anger. This can range from mild irritability and frustration to explosive rage. It's often accompanied by a feeling of being 'stuck,' tight muscles (especially in the neck and shoulders), tension headaches, and sighing."
    },
    {
      id: "fire",
      element: "Fire",
      title: "Joy & Anxiety",
      icon: <Heart className="w-6 h-6 text-red-600" />,
      color: "border-red-500",
      balanced: "Healthy Fire energy is expressed as genuine joy, love, passion, and the ability to form warm, meaningful relationships. It is the spark of life and consciousness.",
      imbalanced: "An imbalance in the Fire element is not about 'too much happiness.' It's about agitation and a disturbed Shen. This manifests as anxiety, restlessness, insomnia, and mania. The mind becomes scattered and unable to settle. A deficiency of Fire, conversely, leads to a lack of joy and depression."
    },
    {
      id: "earth",
      element: "Earth",
      title: "Worry & Empathy",
      icon: <Brain className="w-6 h-6 text-yellow-600" />,
      color: "border-yellow-500",
      balanced: "Strong Earth energy allows for clear thinking, nurturing, and empathy. It gives us a feeling of being centered, grounded, and supportive of ourselves and others.",
      imbalanced: "When the Spleen's transformative function is weak, thoughts can get 'stuck,' leading to worry, rumination, and obsessive overthinking. The mind endlessly chews on a problem without digesting it, leading to fatigue and mental fog."
    },
    {
      id: "metal",
      element: "Metal",
      title: "Grief & Letting Go",
      icon: <Frown className="w-6 h-6 text-gray-600" />,
      color: "border-gray-500",
      balanced: "Healthy Metal allows us to experience loss, feel grief, and then let go, preserving what is valuable and releasing what is no longer needed. It provides a sense of self-worth and integrity.",
      imbalanced: "An imbalance leads to an inability to process loss, resulting in prolonged grief and sadness. The person may be stuck in the past, unable to move on. This can weaken the Lungs, leading to a weak voice, shortness of breath, and a compromised immune system."
    },
    {
      id: "water",
      element: "Water",
      title: "Fear & Willpower",
      icon: <AlertCircle className="w-6 h-6 text-blue-600" />,
      color: "border-blue-500",
      balanced: "When Water energy is strong, it provides deep reserves of energy, a powerful will, and the courage to face the unknown. It is the source of our endurance and wisdom.",
      imbalanced: "A depletion of this deep energy manifests as fear. This can be a chronic, low-grade anxiety, phobias, or a feeling of deep insecurity and dread. It signals that our core 'battery' is running low, leading to exhaustion and a lack of will to move forward."
    }
  ];

  const emotionalInterplay = [
    {
      title: "Fear (Water) can stifle Drive (Wood)",
      description: "When we're afraid or insecure, it becomes difficult to take assertive action or pursue our goals",
      icon: <AlertCircle className="w-5 h-5 text-blue-600" />
    },
    {
      title: "Anger (Wood) can overwhelm Thoughtfulness (Earth)",
      description: "When we're angry or frustrated, it disrupts our ability to think clearly and nurture others",
      icon: <Angry className="w-5 h-5 text-green-600" />
    },
    {
      title: "Worry (Earth) can dampen Willpower (Water)",
      description: "Excessive worry and overthinking can drain our core energy reserves and weaken our resolve",
      icon: <Brain className="w-5 h-5 text-yellow-600" />
    },
    {
      title: "Joy (Fire) can help melt away Grief (Metal)",
      description: "Genuine connection and warmth can help us process loss and move through sadness",
      icon: <Heart className="w-5 h-5 text-red-600" />
    },
    {
      title: "Thoughtfulness (Earth) can contain reckless Mania (Fire)",
      description: "Grounded thinking and empathy can help stabilize scattered or manic energy",
      icon: <Lightbulb className="w-5 h-5 text-yellow-600" />
    }
  ];

  return (
    <EnglishLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-purple-500/10 rounded-full">
              <Heart className="w-16 h-16 text-purple-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Five Elements and Emotions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            The Emotional Landscape of Traditional Chinese Medicine
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            In Traditional Chinese Medicine (TCM), emotions are not separate from the physical body. They are considered a form of energy (Qi) that, when flowing smoothly, is a natural and healthy part of life. However, when an emotion is repressed, excessive, or experienced for a prolonged period, it can disrupt the flow of Qi and cause disease in its corresponding organ system.
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600" />
              Understanding the Mind-Body Connection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Each of the Five Elements is associated with a specific organ system and a corresponding emotion. Understanding these connections provides a powerful map for self-awareness and healing.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              The beauty of this system is that it shows how emotions influence each other through the generating and controlling cycles, creating ripples throughout our entire emotional landscape.
            </p>
          </CardContent>
        </Card>

        {/* Emotional Landscape Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>The Emotional Landscape of the Five Elements</CardTitle>
            <CardDescription>
              A comprehensive overview of how each element governs specific emotions and organ systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Element</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Organs</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Balanced Expression</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Imbalanced Expression</th>
                  </tr>
                </thead>
                <tbody>
                  {emotionalMap.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className={`py-3 px-4 font-medium ${item.color}`}>{item.element}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{item.organs}</td>
                      <td className="py-3 px-4 text-green-600 dark:text-green-400 text-sm">{item.balanced}</td>
                      <td className="py-3 px-4 text-red-600 dark:text-red-400 text-sm">{item.imbalanced}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Emotional Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Detailed Emotional Analysis</CardTitle>
            <CardDescription>
              Deep dive into how each element expresses itself emotionally in both balanced and imbalanced states
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {detailedEmotions.map((emotion) => (
                <Card 
                  key={emotion.id} 
                  className={`border-2 ${emotion.color} cursor-pointer transition-all duration-200 hover:shadow-lg`}
                  onClick={() => setActiveSection(activeSection === emotion.id ? null : emotion.id)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {emotion.icon}
                        <span>{emotion.element}: {emotion.title}</span>
                      </div>
                      <ChevronRight 
                        className={`w-5 h-5 transition-transform duration-200 ${
                          activeSection === emotion.id ? 'rotate-90' : ''
                        }`}
                      />
                    </CardTitle>
                  </CardHeader>
                  {activeSection === emotion.id && (
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">Balanced:</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {emotion.balanced}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">Imbalanced:</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {emotion.imbalanced}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* The Interplay of Emotions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-purple-600" />
              The Interplay of Emotions
            </CardTitle>
            <CardDescription>
              How emotions influence each other through the Five Elements cycles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              The beauty of the Five Elements system is that it shows how emotions influence each other. According to the generating (Sheng) and controlling (Ke) cycles, we can understand the ripple effects throughout our emotional landscape:
            </p>
            <div className="space-y-4">
              {emotionalInterplay.map((interaction, index) => (
                <Card key={index} className="border-l-4 border-purple-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      {interaction.icon}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {interaction.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {interaction.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-purple-800 dark:text-purple-200 text-sm">
                <strong>Key Insight:</strong> By understanding these relationships, we can see how an imbalance in one area of our emotional life can create ripples throughout the entire system. This awareness allows us to address emotional patterns at their root and create lasting balance.
              </p>
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
                  <a href="/en/wiki/wuxing/intro" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
                    Introduction
                  </a>
                  <span className="text-gray-400">•</span>
                  <a href="/en/wiki/wuxing/wuxing-shengke" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                    Cycles
                  </a>
                  <span className="text-gray-400">•</span>
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
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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