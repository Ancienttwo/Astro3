'use client';

import { useState } from 'react';
import EnglishLayout from '@/components/EnglishLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Sprout, TreePine, Lightbulb, Target, Eye, Zap, Wind, ArrowUp } from 'lucide-react';

export default function WoodElementPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const correspondences = [
    { category: "Season", association: "Spring", description: "The time of renewal, new life, and bursting energy." },
    { category: "Direction", association: "East", description: "The direction of sunrise, symbolizing new beginnings." },
    { category: "Climate", association: "Wind", description: "Represents movement, change, and spreading of ideas." },
    { category: "Color", association: "Green, Blue", description: "The colors of plants, nature, and vitality." },
    { category: "Yin Organ", association: "Liver (肝)", description: "Stores blood, ensures smooth flow of Qi, governs planning." },
    { category: "Yang Organ", association: "Gall Bladder (膽)", description: "Governs decisiveness and judgment." },
    { category: "Emotion", association: "Assertiveness / Patience", description: "Balanced: Ability to move forward with purpose and patience." },
    { category: "Imbalance", association: "Anger / Frustration", description: "Imbalanced: Arises when drive to grow is blocked." }
  ];

  const balanceStates = [
    {
      id: "balanced",
      title: "Balanced Wood",
      icon: <Sprout className="w-6 h-6 text-green-600" />,
      description: "A person with balanced Wood energy embodies healthy growth and creativity. They are natural leaders with clear vision, organized and assertive, making clear decisions confidently while remaining flexible in thinking, compassionate in actions, and innovative.",
      color: "border-green-500"
    },
    {
      id: "excess",
      title: "Excess Wood",
      icon: <Zap className="w-6 h-6 text-orange-500" />,
      description: "Too much Wood energy leads to overwhelming drive that becomes destructive. This manifests as being aggressive and impatient, irritable and short-tempered, with workaholic tendencies, overly competitive behavior, and prone to anger outbursts. Physical symptoms include tension headaches, tight muscles, and high blood pressure.",
      color: "border-orange-500"
    },
    {
      id: "deficient",
      title: "Deficient Wood",
      icon: <Eye className="w-6 h-6 text-gray-500" />,
      description: "Insufficient Wood energy results in stagnation and inability to grow. This leads to feeling chronically 'stuck', being timid and indecisive, lacking direction or motivation, having difficulty executing ideas, being prone to frustration, and feeling resentful of others' success.",
      color: "border-gray-500"
    }
  ];

  const growthAspects = [
    {
      title: "Drive to Begin and Initiative",
      description: "The spark that initiates action - starting projects, launching businesses, setting goals. Like a seed breaking through soil, Wood energy provides the initial momentum to begin new ventures.",
      icon: <Target className="w-8 h-8 text-green-600" />
    },
    {
      title: "Vision and Strategic Planning",
      description: "Like a tree charting course for the sky - looking ahead and creating future vision. The Liver governs planning and ensures smooth flow of Qi, allowing for clear direction.",
      icon: <Eye className="w-8 h-8 text-green-600" />
    },
    {
      title: "Assertiveness and Determination",
      description: "The determination to push through obstacles and stay on course. The Gall Bladder governs decisiveness, providing the courage to make decisions and take action.",
      icon: <Zap className="w-8 h-8 text-green-600" />
    }
  ];

  const creativityAspects = [
    {
      title: "Birth of New Ideas",
      description: "Just as spring brings forth new life, Wood energy gives rise to new concepts and inspiration. This is the creative force that generates innovation and fresh perspectives.",
      icon: <Lightbulb className="w-8 h-8 text-emerald-600" />
    },
    {
      title: "Flexibility and Adaptation",
      description: "True creativity requires adaptability - finding new paths around obstacles. Like bamboo bending in the wind, Wood energy maintains resilience while adapting to circumstances.",
      icon: <Wind className="w-8 h-8 text-emerald-600" />
    },
    {
      title: "Growth and Expansion",
      description: "The natural tendency to grow, expand, and reach new heights. Wood energy drives continuous improvement and the pursuit of greater achievements.",
      icon: <TreePine className="w-8 h-8 text-emerald-600" />
    }
  ];

  return (
    <EnglishLayout>
      <div className="max-w-6xl mx-auto py-8 px-4 font-rajdhani">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-16 relative">
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-green-50/50 to-transparent dark:from-green-900/20 dark:to-transparent rounded-3xl -mx-8 -my-8"></div>
          
          <div className="relative z-10">
            <div className="flex justify-center mb-8">
              <div className="p-8 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/40 dark:to-emerald-800/40 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Sprout className="w-20 h-20 text-green-600 dark:text-green-400" />
              </div>
            </div>
            
            <h1 className="text-5xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A] mb-6 tracking-tight">
              The Wood Element
            </h1>
            
            <div className="inline-block px-6 py-2 bg-[#FBCB0A] text-[#3D0B5B] rounded-full font-bold text-xl mb-6 shadow-md">
              木 (mù)
            </div>
            
            <p className="text-2xl text-[#333333] dark:text-[#E0E0E0] mb-6 font-medium">
              Growth, Creativity, and New Beginnings
            </p>
            
            <p className="text-lg text-[#333333] dark:text-[#E0E0E0] max-w-4xl mx-auto leading-relaxed">
              Wood represents the first of the five phases and is powerfully symbolic of growth, creativity, and new beginnings. Its energy is expansive, dynamic, and forward-moving, much like the unstoppable force of nature in springtime.
            </p>
          </div>
        </div>

        {/* The Essence of Wood - Enhanced */}
        <Card className="mb-12 bg-white/95 dark:bg-black/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 rounded-xl">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A]">
              <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-full">
                <TreePine className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              The Essence of Wood: From Seed to Mighty Tree
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <p className="text-lg text-[#333333] dark:text-[#E0E0E0] leading-relaxed">
                To understand the Wood element, visualize a tree's journey from seed to maturity:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: "Upward Growth", icon: "🌱", desc: "Relentless drive to grow upward and outward, seeking light and expansion" },
                  { title: "Flexibility", icon: "🌿", desc: "Bending without breaking, adapting to wind and weather while maintaining direction" },
                  { title: "Renewal", icon: "🔄", desc: "Constant regeneration, sprouting new leaves and branches each season" },
                  { title: "Foundation", icon: "🌳", desc: "Strong roots providing stability while reaching for new heights" }
                ].map((item, index) => (
                  <div key={index} className="group p-6 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 rounded-xl border border-green-200 dark:border-green-700 hover:border-[#FBCB0A] transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{item.icon}</span>
                      <div>
                        <h4 className="font-bold text-lg text-[#3D0B5B] dark:text-[#FBCB0A] mb-2 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
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
              
              <div className="p-6 bg-gradient-to-r from-[#FBCB0A]/10 to-green-100/50 dark:from-[#FBCB0A]/20 dark:to-green-900/30 rounded-xl border-l-4 border-[#FBCB0A]">
                <p className="text-lg text-[#333333] dark:text-[#E0E0E0] font-medium leading-relaxed">
                  This imagery captures the core qualities of the Wood element: unstoppable growth, creative expansion, and the courage to begin anew.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wood as Growth - Enhanced */}
        <Card className="mb-12 bg-white/95 dark:bg-black/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 rounded-xl">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A]">
              <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-full">
                <Target className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              Wood as Growth (生長 - Shēngzhǎng)
            </CardTitle>
            <CardDescription className="text-lg text-[#333333] dark:text-[#E0E0E0] mt-3 leading-relaxed">
              Growth is the primary function of Wood. This isn't just physical growth, but growth in all aspects of life - personal, professional, and spiritual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {growthAspects.map((aspect, index) => (
                <Card key={index} className="group bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-l-4 border-green-500 hover:border-[#FBCB0A] shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-xl">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white dark:bg-black/30 rounded-full shadow-md group-hover:shadow-lg transition-all duration-300">
                        {aspect.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-[#3D0B5B] dark:text-[#FBCB0A] mb-3 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
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

        {/* Wood as Creativity - Enhanced */}
        <Card className="mb-12 bg-white/95 dark:bg-black/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 rounded-xl">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A]">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
                <Lightbulb className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              Wood as Creativity (創造 - Chuàngzào)
            </CardTitle>
            <CardDescription className="text-lg text-[#333333] dark:text-[#E0E0E0] mt-3 leading-relaxed">
              Creativity is the natural expression of growth. When Wood energy flows freely, it manifests as innovation and birth of new ideas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {creativityAspects.map((aspect, index) => (
                <Card key={index} className="group bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-l-4 border-emerald-500 hover:border-[#FBCB0A] shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-xl">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white dark:bg-black/30 rounded-full shadow-md group-hover:shadow-lg transition-all duration-300">
                        {aspect.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-[#3D0B5B] dark:text-[#FBCB0A] mb-3 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
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

        {/* Wood Element Correspondences - Enhanced */}
        <Card className="mb-12 bg-white/95 dark:bg-black/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 rounded-xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A]">
              The Wood Element at a Glance
            </CardTitle>
            <CardDescription className="text-lg text-[#333333] dark:text-[#E0E0E0] mt-3 leading-relaxed">
              Essential correspondences and associations of the Wood element
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
                    <tr key={index} className="border-b border-green-200 dark:border-green-700 hover:bg-green-50/50 dark:hover:bg-green-900/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-[#3D0B5B] dark:text-[#FBCB0A]">{item.category}</td>
                      <td className="py-4 px-6 text-green-600 dark:text-green-400 font-bold">{item.association}</td>
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
              Understanding the different states of Wood energy in the body and mind
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
                      <div className="p-6 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-l-4 border-[#FBCB0A]">
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
        <Card className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 border-2 border-[#FBCB0A]/30 shadow-xl rounded-xl">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="text-center lg:text-left">
                <p className="text-lg text-[#333333] dark:text-[#E0E0E0] mb-4 font-medium">
                  Continue exploring the Five Elements:
                </p>
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  <span className="px-4 py-2 bg-[#FBCB0A] text-[#3D0B5B] rounded-full font-bold shadow-md">Wood</span>
                  <span className="text-[#333333] dark:text-[#E0E0E0] text-xl">•</span>
                  <a href="/en/wiki/wuxing/fire" className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-lg">
                    Fire
                  </a>
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