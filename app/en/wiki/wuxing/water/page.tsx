'use client';

import { useState } from 'react';
import EnglishLayout from '@/components/EnglishLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Waves, Droplets, Snowflake, Wind, Moon, Eye, ArrowUp } from 'lucide-react';

export default function WaterElementPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const correspondences = [
    { category: "Season", association: "Winter", description: "The time of rest, storage, stillness, and conserving energy." },
    { category: "Direction", association: "North", description: "The direction of darkness and cold." },
    { category: "Climate", association: "Cold", description: "Represents the contracting, stilling nature of winter." },
    { category: "Color", association: "Black, Dark Blue", description: "The colors of the deep ocean and the night sky." },
    { category: "Yin Organ", association: "Kidney (腎)", description: "Stores Jing (Essence), governs birth, growth, and willpower." },
    { category: "Yang Organ", association: "Bladder (膀胱)", description: "Stores and releases fluids, powered by the Kidney's energy." },
    { category: "Emotion", association: "Willpower / Wisdom", description: "Balanced: Deep inner strength, courage, and calm resolve." },
    { category: "Imbalance", association: "Fear / Anxiety", description: "Imbalanced: Feeling paralyzed by fear, phobias, and lack of will." }
  ];

  const balanceStates = [
    {
      id: "balanced",
      title: "Balanced Water",
      icon: <Waves className="w-6 h-6 text-blue-600" />,
      description: "A person with balanced Water is wise, introspective, and adaptable. They possess strong willpower and can remain calm and resourceful under pressure. They know when to act and when to be still, and they move through life with a quiet, confident flow.",
      color: "border-blue-500"
    },
    {
      id: "excess",
      title: "Excess Water",
      icon: <Snowflake className="w-6 h-6 text-cyan-600" />,
      description: "Too much Water can lead to feeling withdrawn, isolated, and emotionally cold. The person may be overly passive, 'spacey,' and lack the 'Fire' to engage with the world. Physically, this can manifest as edema and a feeling of coldness.",
      color: "border-cyan-500"
    },
    {
      id: "deficient",
      title: "Deficient Water",
      icon: <Droplets className="w-6 h-6 text-gray-500" />,
      description: "This is a common imbalance in modern, fast-paced life. It's a state of being 'burnt out.' This leads to exhaustion, anxiety, and deep-seated fear. The willpower is depleted, and the person may feel brittle and unable to cope with stress. Physically, it manifests as lower back pain, knee weakness, hearing problems, and adrenal fatigue.",
      color: "border-gray-500"
    }
  ];

  const flowAspects = [
    {
      title: "The Path of Least Resistance",
      description: "Water does not confront obstacles with force; it simply flows around them. This represents a powerful life strategy: the ability to navigate challenges with ease, without creating unnecessary conflict or resistance. It is the essence of 'going with the flow.'",
      icon: <Wind className="w-8 h-8 text-blue-600" />
    },
    {
      title: "Persistence and Endurance",
      description: "The steady drip of water that carves a canyon is a testament to Water's quiet power. This is the energy of endurance and perseverance. In TCM, the Water element's organ, the Kidney, stores our Jing (精), our constitutional essence and ancestral energy. This is our deepest reserve of stamina and willpower, allowing us to persist through the 'winters' of our lives.",
      icon: <Droplets className="w-8 h-8 text-blue-600" />
    },
    {
      title: "Communication and Social Flow",
      description: "Just as rivers connect the land and flow to the sea, Water energy governs our ability to communicate and connect with others. It allows for a smooth exchange of ideas and emotions, fostering social harmony.",
      icon: <Waves className="w-8 h-8 text-blue-600" />
    }
  ];

  const adaptabilityAspects = [
    {
      title: "Formlessness and Flexibility",
      description: "Water has no fixed shape. This translates to mental and emotional flexibility. A person with strong Water energy can adapt to changing circumstances, take on different roles, and see things from multiple perspectives without being rigid.",
      icon: <Wind className="w-8 h-8 text-cyan-600" />
    },
    {
      title: "Stillness and Potential",
      description: "The stillness of deep water is not empty; it is full of potential energy. This is the power of winter and rest. Water teaches us the wisdom of being still, of conserving our energy, and of introspection. From this quiet depth arises true wisdom and the will to begin the next cycle of growth (Wood).",
      icon: <Moon className="w-8 h-8 text-cyan-600" />
    },
    {
      title: "Courage in the Face of the Unknown",
      description: "The emotion associated with Water is fear when imbalanced, but courage and willpower when balanced. The deep, dark, unknown nature of the ocean can be frightening. Healthy Water energy gives us the courage to face our deepest fears and explore the unknown depths of our own consciousness.",
      icon: <Eye className="w-8 h-8 text-cyan-600" />
    }
  ];

  return (
    <EnglishLayout>
      <div className="max-w-6xl mx-auto py-8 px-4 font-rajdhani">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-16 relative">
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/20 dark:to-transparent rounded-3xl -mx-8 -my-8"></div>
          
          <div className="relative z-10">
            <div className="flex justify-center mb-8">
              <div className="p-8 bg-gradient-to-br from-blue-100 to-cyan-200 dark:from-blue-900/40 dark:to-cyan-800/40 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Waves className="w-20 h-20 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            
            <h1 className="text-5xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A] mb-6 tracking-tight">
              The Water Element
            </h1>
            
            <div className="inline-block px-6 py-2 bg-[#FBCB0A] text-[#3D0B5B] rounded-full font-bold text-xl mb-6 shadow-md">
              水 (shuǐ)
            </div>
            
            <p className="text-2xl text-[#333333] dark:text-[#E0E0E0] mb-6 font-medium">
              Flow, Adaptability, and Deep Wisdom
            </p>
            
            <p className="text-lg text-[#333333] dark:text-[#E0E0E0] max-w-4xl mx-auto leading-relaxed">
              After the refinement and contraction of Metal, Water represents the return to the source. It is the phase of maximum Yin, a state of deep stillness, immense potential, and effortless flow and adaptability.
            </p>
          </div>
        </div>

        {/* The Essence of Water - Enhanced */}
        <Card className="mb-12 bg-white/95 dark:bg-black/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 rounded-xl">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A]">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                <Waves className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              The Essence of Water: The River and the Deep Ocean
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <p className="text-lg text-[#333333] dark:text-[#E0E0E0] leading-relaxed">
                To understand the Water element, visualize water in its natural states:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: "Formless", icon: "💧", desc: "Taking the shape of any container it enters" },
                  { title: "Flow", icon: "🌊", desc: "Flows relentlessly, finding the path of least resistance around any obstacle" },
                  { title: "Persistence", icon: "🪨", desc: "Gentle persistence can wear away the hardest stone, demonstrating power in softness" },
                  { title: "Stillness", icon: "🌌", desc: "In its stillness (like a deep lake or ocean), it holds immense stored power and mystery" }
                ].map((item, index) => (
                  <div key={index} className="group p-6 bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-800/30 rounded-xl border border-blue-200 dark:border-blue-700 hover:border-[#FBCB0A] transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{item.icon}</span>
                      <div>
                        <h4 className="font-bold text-lg text-[#3D0B5B] dark:text-[#FBCB0A] mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
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
              
              <div className="p-6 bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-900/20 dark:to-blue-900/30 rounded-xl">
                <h4 className="font-bold text-lg text-[#3D0B5B] dark:text-[#FBCB0A] mb-3">Adaptability</h4>
                <p className="text-[#333333] dark:text-[#E0E0E0] leading-relaxed">
                  It can be a gentle stream, a powerful torrent, or solid ice—perfectly adapting its form to the environment
                </p>
              </div>
              
              <div className="p-6 bg-gradient-to-r from-[#FBCB0A]/10 to-blue-100/50 dark:from-[#FBCB0A]/20 dark:to-blue-900/30 rounded-xl border-l-4 border-[#FBCB0A]">
                <p className="text-lg text-[#333333] dark:text-[#E0E0E0] font-medium leading-relaxed">
                  This imagery reveals the core nature of Water: it is the master of yielding strength and effortless adaptation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Water as Flow - Enhanced */}
        <Card className="mb-12 bg-white/95 dark:bg-black/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 rounded-xl">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A]">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                <Wind className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              Water as Flow (流動 - Liúdòng)
            </CardTitle>
            <CardDescription className="text-lg text-[#333333] dark:text-[#E0E0E0] mt-3 leading-relaxed">
              Flow is the very definition of Water's movement. It is the energy of circulation, connection, and momentum.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {flowAspects.map((aspect, index) => (
                <Card key={index} className="group bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-l-4 border-blue-500 hover:border-[#FBCB0A] shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-xl">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white dark:bg-black/30 rounded-full shadow-md group-hover:shadow-lg transition-all duration-300">
                        {aspect.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-[#3D0B5B] dark:text-[#FBCB0A] mb-3 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
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

        {/* Water as Adaptability - Enhanced */}
        <Card className="mb-12 bg-white/95 dark:bg-black/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 rounded-xl">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A]">
              <div className="p-3 bg-cyan-100 dark:bg-cyan-900/40 rounded-full">
                <Moon className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
              </div>
              Water as Adaptability (適應 - Shìyìng)
            </CardTitle>
            <CardDescription className="text-lg text-[#333333] dark:text-[#E0E0E0] mt-3 leading-relaxed">
              Adaptability is Water's greatest strength. It is the wisdom to change and transform according to the needs of the moment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {adaptabilityAspects.map((aspect, index) => (
                <Card key={index} className="group bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-l-4 border-cyan-500 hover:border-[#FBCB0A] shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-xl">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white dark:bg-black/30 rounded-full shadow-md group-hover:shadow-lg transition-all duration-300">
                        {aspect.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-[#3D0B5B] dark:text-[#FBCB0A] mb-3 group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">
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

        {/* Water Element Correspondences - Enhanced */}
        <Card className="mb-12 bg-white/95 dark:bg-black/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 rounded-xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-[#3D0B5B] dark:text-[#FBCB0A]">
              The Water Element at a Glance
            </CardTitle>
            <CardDescription className="text-lg text-[#333333] dark:text-[#E0E0E0] mt-3 leading-relaxed">
              Essential correspondences and associations of the Water element
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
                    <tr key={index} className="border-b border-blue-200 dark:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-[#3D0B5B] dark:text-[#FBCB0A]">{item.category}</td>
                      <td className="py-4 px-6 text-blue-600 dark:text-blue-400 font-bold">{item.association}</td>
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
              Understanding the different states of Water energy in the body and mind
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
                      <div className="p-6 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border-l-4 border-[#FBCB0A]">
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
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-800/20 border-2 border-[#FBCB0A]/30 shadow-xl rounded-xl">
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
                  <span className="px-4 py-2 bg-[#FBCB0A] text-[#3D0B5B] rounded-full font-bold shadow-md">Water</span>
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