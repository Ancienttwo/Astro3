'use client';

import { useState } from 'react';
import EnglishLayout from '@/components/EnglishLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Flame, Sun, Zap, Heart, Sparkles, ThermometerSun, Activity, ArrowUp } from 'lucide-react';

export default function FireElementPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const correspondences = [
    { category: "Season", association: "Summer", description: "The time of peak activity, heat, and abundance." },
    { category: "Direction", association: "South", description: "The direction of the midday sun." },
    { category: "Climate", association: "Heat", description: "Represents warmth, passion, and vitality." },
    { category: "Color", association: "Red", description: "The color of fire, blood, and life." },
    { category: "Yin Organ", association: "Heart (心)", description: "Circulates blood, houses the Shen (Spirit/Mind), governs joy." },
    { category: "Yang Organ", association: "Small Intestine (小腸)", description: "Separates the pure from the impure in digestion and thought." },
    { category: "Emotion", association: "Joy / Love", description: "Balanced: The capacity for genuine joy, love, and connection." },
    { category: "Imbalance", association: "Anxiety / Mania", description: "Imbalanced: A scattered mind, restlessness, or a lack of joy (feeling 'burnt out')." }
  ];

  const balanceStates = [
    {
      id: "balanced",
      title: "Balanced Fire",
      icon: <Heart className="w-6 h-6 text-red-600" />,
      description: "A person with balanced Fire is charismatic, compassionate, and joyful. They have healthy relationships, sleep soundly, and can express themselves clearly. They have a gift for connecting with others and radiate warmth.",
      color: "border-red-500"
    },
    {
      id: "excess",
      title: "Excess Fire",
      icon: <Flame className="w-6 h-6 text-orange-500" />,
      description: "Too much Fire is like an uncontrolled blaze. This can manifest as mania, restlessness, anxiety, insomnia, and talking excessively. The person may be emotionally volatile and prone to burnout. Physically, it can lead to palpitations, a red complexion, and inflammation.",
      color: "border-orange-500"
    },
    {
      id: "deficient",
      title: "Deficient Fire",
      icon: <Sparkles className="w-6 h-6 text-gray-500" />,
      description: "When the Fire is weak, it's like dying embers. This leads to a lack of joy, depression, and emotional coldness. The person may feel isolated and have difficulty connecting with others. Physically, it results in poor circulation (cold hands and feet), low energy, and a pale complexion.",
      color: "border-gray-500"
    }
  ];

  const energyAspects = [
    {
      title: "Peak Vitality and Activity",
      description: "Fire governs the body's dynamism. In Traditional Chinese Medicine (TCM), the Heart (the primary Fire organ) propels blood through the vessels, bringing warmth, life, and vitality to every cell. This is the energy of a strong metabolism, robust circulation, and boundless enthusiasm.",
      icon: <Activity className="w-8 h-8 text-red-600" />
    },
    {
      title: "Passion and Expression",
      description: "Fire is the energy of human connection and relationship. It's the spark of charisma, the warmth of compassion, and the joy of social interaction. Laughter, excitement, and enthusiasm are all manifestations of healthy Fire energy.",
      icon: <Heart className="w-8 h-8 text-red-600" />
    },
    {
      title: "Consciousness and Awareness",
      description: "The light of Fire is symbolic of consciousness itself. The Heart is said to house the Shen (神), which translates as 'Spirit' or 'Mind.' A balanced Fire element results in a clear mind, self-awareness, and the ability to connect with others on an emotional level. It is the energy of being fully present and alive.",
      icon: <Sun className="w-8 h-8 text-red-600" />
    }
  ];

  const transformationAspects = [
    {
      title: "Refining and Purifying",
      description: "Think of a blacksmith's forge. Fire transforms hard, raw ore into a strong, useful sword. It burns away impurities to create something of higher value. On a personal level, this represents the transformation of raw experiences into wisdom and the refinement of our character.",
      icon: <Zap className="w-8 h-8 text-orange-600" />
    },
    {
      title: "Cooking and Assimilation",
      description: "Fire transforms raw food into a cooked meal, making it digestible and nourishing. This is a metaphor for how we process life's events. A healthy Fire element allows us to 'digest' our experiences, integrate the lessons, and let go of what doesn't serve us.",
      icon: <ThermometerSun className="w-8 h-8 text-orange-600" />
    },
    {
      title: "Opening and Flowering",
      description: "Just as the sun's heat causes a flower to open and reveal its beauty, Fire energy governs moments of emotional opening and peak experience. It is the transformative power of love, joy, and intimacy that opens the heart.",
      icon: <Sparkles className="w-8 h-8 text-orange-600" />
    }
  ];

  return (
    <EnglishLayout>
      <div className="max-w-6xl mx-auto py-8 px-4 font-rajdhani">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-16 relative">
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-red-50/50 to-transparent dark:from-red-900/20 dark:to-transparent rounded-3xl -mx-8 -my-8"></div>
          
          <div className="relative z-10">
            <div className="flex justify-center mb-8">
              <div className="p-8 bg-gradient-to-br from-red-100 to-orange-200 dark:from-red-900/40 dark:to-orange-800/40 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Flame className="w-20 h-20 text-red-600 dark:text-red-400" />
              </div>
            </div>
            
            <h1 className="text-5xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A] mb-6 tracking-tight">
              The Fire Element
            </h1>
            
            <div className="inline-block px-6 py-2 bg-[#FBCB0A] text-[#3D0B5B] rounded-full font-bold text-xl mb-6 shadow-md">
              火 (huǒ)
            </div>
            
            <p className="text-2xl text-[#333333] dark:text-[#E0E0E0] mb-6 font-medium">
              The Pinnacle of Energy and Transformation
            </p>
            
            <p className="text-lg text-[#333333] dark:text-[#E0E0E0] max-w-4xl mx-auto leading-relaxed">
              Fire represents the pinnacle of the energetic cycle, the phase of maximum energy, transformation, and consciousness. If Wood is the upward growth of spring, Fire is the radiant, expansive brilliance of the midday sun in high summer.
            </p>
          </div>
        </div>

        {/* The Essence of Fire - Enhanced */}
        <Card className="mb-12 bg-white/95 dark:bg-black/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 rounded-xl">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A]">
              <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-full">
                <Sun className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              The Essence of Fire: The Midday Sun
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <p className="text-lg text-[#333333] dark:text-[#E0E0E0] leading-relaxed">
                To understand the Fire element, picture the sun at its zenith:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: "Peak Power", icon: "☀️", desc: "At the peak of its power, radiating heat and light in all directions" },
                  { title: "Illumination", icon: "💡", desc: "It illuminates everything, leaving no shadows" },
                  { title: "Life Force", icon: "🌱", desc: "It warms the earth, allowing life to flourish" },
                  { title: "Dynamism", icon: "⚡", desc: "A source of immense, almost explosive activity and dynamism" }
                ].map((item, index) => (
                  <div key={index} className="group p-6 bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-900/30 dark:to-orange-800/30 rounded-xl border border-red-200 dark:border-red-700 hover:border-[#FBCB0A] transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{item.icon}</span>
                      <div>
                        <h4 className="font-bold text-lg text-[#3D0B5B] dark:text-[#FBCB0A] mb-2 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-[#333333] dark:text-[#E0E0E0] leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-6 bg-gradient-to-r from-[#FBCB0A]/10 to-red-100/50 dark:from-[#FBCB0A]/20 dark:to-red-900/30 rounded-xl border-l-4 border-[#FBCB0A]">
                <p className="text-lg text-[#333333] dark:text-[#E0E0E0] font-medium leading-relaxed">
                  This image captures the core qualities of the Fire element: peak vitality, awareness, and the power to change things.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fire as Energy - Enhanced */}
        <Card className="mb-12 bg-white/95 dark:bg-black/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 rounded-xl">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A]">
              <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-full">
                <Zap className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              Fire as Energy (能量 - Néngliàng)
            </CardTitle>
            <CardDescription className="text-lg text-[#333333] dark:text-[#E0E0E0] mt-3 leading-relaxed">
              Fire is the phase of Maximum Yang. It's the culmination of the growth cycle that began with Wood. This is energy at its most active and expressive.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {energyAspects.map((aspect, index) => (
                <Card key={index} className="group bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-l-4 border-red-500 hover:border-[#FBCB0A] shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-xl">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white dark:bg-black/30 rounded-full shadow-md group-hover:shadow-lg transition-all duration-300">
                        {aspect.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-[#3D0B5B] dark:text-[#FBCB0A] mb-3 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">
                          {aspect.title}
                        </h4>
                        <p className="text-[#333333] dark:text-[#E0E0E0] leading-relaxed">
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

        {/* Fire as Transformation - Enhanced */}
        <Card className="mb-12 bg-white/95 dark:bg-black/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 rounded-xl">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A]">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/40 rounded-full">
                <ThermometerSun className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              Fire as Transformation (轉化 - Zhuǎnhuà)
            </CardTitle>
            <CardDescription className="text-lg text-[#333333] dark:text-[#E0E0E0] mt-3 leading-relaxed">
              Transformation is the magical quality of Fire. Fire doesn't just add energy; it fundamentally changes the nature of things it touches.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {transformationAspects.map((aspect, index) => (
                <Card key={index} className="group bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-l-4 border-orange-500 hover:border-[#FBCB0A] shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-xl">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white dark:bg-black/30 rounded-full shadow-md group-hover:shadow-lg transition-all duration-300">
                        {aspect.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-[#3D0B5B] dark:text-[#FBCB0A] mb-3 group-hover:text-orange-700 dark:group-hover:text-orange-400 transition-colors">
                          {aspect.title}
                        </h4>
                        <p className="text-[#333333] dark:text-[#E0E0E0] leading-relaxed">
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

        {/* Fire Element Correspondences - Enhanced */}
        <Card className="mb-12 bg-white/95 dark:bg-black/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 rounded-xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A]">
              The Fire Element at a Glance
            </CardTitle>
            <CardDescription className="text-lg text-[#333333] dark:text-[#E0E0E0] mt-3 leading-relaxed">
              Essential correspondences and associations of the Fire element
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#FBCB0A]">
                    <th className="text-left py-4 px-6 font-bold text-lg text-[#3D0B5B] dark:text-[#FBCB0A]">Category</th>
                    <th className="text-left py-4 px-6 font-bold text-lg text-[#3D0B5B] dark:text-[#FBCB0A]">Association</th>
                    <th className="text-left py-4 px-6 font-bold text-lg text-[#3D0B5B] dark:text-[#FBCB0A]">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {correspondences.map((item, index) => (
                    <tr key={index} className="border-b border-red-200 dark:border-red-700 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-[#3D0B5B] dark:text-[#FBCB0A]">{item.category}</td>
                      <td className="py-4 px-6 text-red-600 dark:text-red-400 font-bold">{item.association}</td>
                      <td className="py-4 px-6 text-[#333333] dark:text-[#E0E0E0]">{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Balance and Imbalance - Enhanced */}
        <Card className="mb-12 bg-white/95 dark:bg-black/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 rounded-xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A]">
              Balance and Imbalance
            </CardTitle>
            <CardDescription className="text-lg text-[#333333] dark:text-[#E0E0E0] mt-3 leading-relaxed">
              Understanding the different states of Fire energy in the body and mind
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {balanceStates.map((state) => (
                <Card 
                  key={state.id} 
                  className={`group border-2 ${state.color} cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white/80 dark:bg-black/30 rounded-xl backdrop-blur-sm`}
                  onClick={() => setActiveSection(activeSection === state.id ? null : state.id)}
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white dark:bg-black/30 rounded-full shadow-md group-hover:shadow-lg transition-all duration-300">
                          {state.icon}
                        </div>
                        <span className="text-xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A]">{state.title}</span>
                      </div>
                      <ChevronRight 
                        className={`w-6 h-6 text-[#FBCB0A] transition-transform duration-300 ${
                          activeSection === state.id ? 'rotate-90' : ''
                        }`}
                      />
                    </CardTitle>
                  </CardHeader>
                  {activeSection === state.id && (
                    <CardContent className="pt-0 pb-6">
                      <div className="p-6 bg-gradient-to-r from-red-50/50 to-orange-50/50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border-l-4 border-[#FBCB0A]">
                        <p className="text-[#333333] dark:text-[#E0E0E0] leading-relaxed text-lg">
                          {state.description}
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Navigation */}
        <Card className="bg-gradient-to-r from-red-50 to-orange-100 dark:from-red-900/20 dark:to-orange-800/20 border-2 border-[#FBCB0A]/30 shadow-xl rounded-xl">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="text-center lg:text-left">
                <p className="text-lg text-[#333333] dark:text-[#E0E0E0] mb-4 font-medium">
                  Continue exploring the Five Elements:
                </p>
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  <a href="/en/wiki/wuxing/wood" className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full font-bold hover:bg-green-200 dark:hover:bg-green-900/50 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-lg">
                    Wood
                  </a>
                  <span className="text-[#333333] dark:text-[#E0E0E0] text-xl">•</span>
                  <span className="px-4 py-2 bg-[#FBCB0A] text-[#3D0B5B] rounded-full font-bold shadow-md">Fire</span>
                  <span className="text-[#333333] dark:text-[#E0E0E0] text-xl">•</span>
                  <a href="/en/wiki/wuxing/earth" className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full font-bold hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-lg">
                    Earth
                  </a>
                  <span className="text-[#333333] dark:text-[#E0E0E0] text-xl">•</span>
                  <a href="/en/wiki/wuxing/metal" className="px-4 py-2 bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 rounded-full font-bold hover:bg-gray-200 dark:hover:bg-gray-900/50 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-lg">
                    Metal
                  </a>
                  <span className="text-[#333333] dark:text-[#E0E0E0] text-xl">•</span>
                  <a href="/en/wiki/wuxing/water" className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-bold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-lg">
                    Water
                  </a>
                </div>
              </div>
              <a 
                href="/en/wiki/wuxing" 
                className="group px-8 py-4 bg-[#FBCB0A] text-[#3D0B5B] rounded-xl font-bold text-lg hover:bg-[#e6b709] transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <ArrowUp className="w-5 h-5 group-hover:translate-y-[-2px] transition-transform duration-300" />
                Back to Wu Xing
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </EnglishLayout>
  );
}