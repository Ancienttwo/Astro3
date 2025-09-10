'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import EnglishLayout from '@/components/EnglishLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users, Clock, MapPin, Sparkles, Info } from 'lucide-react'

export default function DizhiMeaningPage() {
  const router = useRouter()
  const [selectedZhi, setSelectedZhi] = useState<string | null>(null)

  const dizhiData = [
    {
      name: '子 (zǐ)',
      animal: 'Rat',
      yinyang: 'Yang (阳)',
      element: 'Water (水)',
      time: '11 PM - 1 AM',
      characteristics: 'Intelligent, resourceful, adaptable, charming, sociable, quick-witted. Represents wisdom and the beginning of new cycles.',
      color: 'from-blue-100 to-cyan-200 dark:from-blue-900/40 dark:to-cyan-800/40'
    },
    {
      name: '丑 (chǒu)',
      animal: 'Ox',
      yinyang: 'Yin (阴)',
      element: 'Earth (土)',
      time: '1 AM - 3 AM',
      characteristics: 'Diligent, dependable, strong, patient, methodical, stubborn. Represents endurance and steady progress.',
      color: 'from-amber-100 to-yellow-200 dark:from-amber-900/40 dark:to-yellow-800/40'
    },
    {
      name: '寅 (yín)',
      animal: 'Tiger',
      yinyang: 'Yang (阳)',
      element: 'Wood (木)',
      time: '3 AM - 5 AM',
      characteristics: 'Brave, confident, competitive, unpredictable, authoritative. Represents power, courage, and leadership.',
      color: 'from-green-100 to-emerald-200 dark:from-green-900/40 dark:to-emerald-800/40'
    },
    {
      name: '卯 (mǎo)',
      animal: 'Rabbit',
      yinyang: 'Yin (阴)',
      element: 'Wood (木)',
      time: '5 AM - 7 AM',
      characteristics: 'Gentle, kind, compassionate, artistic, cautious, elegant. Represents diplomacy, sensitivity, and growth.',
      color: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20'
    },
    {
      name: '辰 (chén)',
      animal: 'Dragon',
      yinyang: 'Yang (阳)',
      element: 'Earth (土)',
      time: '7 AM - 9 AM',
      characteristics: 'Ambitious, energetic, charismatic, confident, a natural leader. Represents power, luck, and transformation.',
      color: 'from-purple-100 to-indigo-200 dark:from-purple-900/40 dark:to-indigo-800/40'
    },
    {
      name: '巳 (sì)',
      animal: 'Snake',
      yinyang: 'Yin (阴)',
      element: 'Fire (火)',
      time: '9 AM - 11 AM',
      characteristics: 'Wise, intuitive, mysterious, sophisticated, calm, possessive. Represents wisdom, intuition, and hidden depth.',
      color: 'from-red-100 to-pink-200 dark:from-red-900/40 dark:to-pink-800/40'
    },
    {
      name: '午 (wǔ)',
      animal: 'Horse',
      yinyang: 'Yang (阳)',
      element: 'Fire (火)',
      time: '11 AM - 1 PM',
      characteristics: 'Active, energetic, enthusiastic, independent, impatient, popular. Represents freedom, passion, and movement.',
      color: 'from-red-200 to-orange-200 dark:from-red-900/50 dark:to-orange-800/50'
    },
    {
      name: '未 (wèi)',
      animal: 'Goat',
      yinyang: 'Yin (阴)',
      element: 'Earth (土)',
      time: '1 PM - 3 PM',
      characteristics: 'Artistic, gentle, compassionate, calm, creative, indecisive. Represents harmony, creativity, and empathy.',
      color: 'from-yellow-100 to-amber-200 dark:from-yellow-900/40 dark:to-amber-800/40'
    },
    {
      name: '申 (shēn)',
      animal: 'Monkey',
      yinyang: 'Yang (阳)',
      element: 'Metal (金)',
      time: '3 PM - 5 PM',
      characteristics: 'Witty, inventive, curious, agile, mischievous, skillful. Represents intelligence, humor, and versatility.',
      color: 'from-gray-100 to-slate-200 dark:from-gray-900/40 dark:to-slate-800/40'
    },
    {
      name: '酉 (yǒu)',
      animal: 'Rooster',
      yinyang: 'Yin (阴)',
      element: 'Metal (金)',
      time: '5 PM - 7 PM',
      characteristics: 'Punctual, observant, organized, confident, direct, critical. Represents precision, hard work, and communication.',
      color: 'from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20'
    },
    {
      name: '戌 (xū)',
      animal: 'Dog',
      yinyang: 'Yang (阳)',
      element: 'Earth (土)',
      time: '7 PM - 9 PM',
      characteristics: 'Loyal, honest, responsible, just, protective, anxious. Represents loyalty, fairness, and guardianship.',
      color: 'from-brown-100 to-amber-200 dark:from-brown-900/40 dark:to-amber-800/40'
    },
    {
      name: '亥 (hài)',
      animal: 'Pig',
      yinyang: 'Yin (阴)',
      element: 'Water (水)',
      time: '9 PM - 11 PM',
      characteristics: 'Honest, good-humored, sociable, generous, naive, self-indulgent. Represents community, abundance, and sincerity.',
      color: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20'
    }
  ]

  const selectedZhiData = selectedZhi ? dizhiData.find(zhi => zhi.name === selectedZhi) : null

  return (
    <EnglishLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/en/wiki/bazi')}
              className="mb-4 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to BaZi Wiki
            </Button>
            
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              The Twelve Earthly Branches (十二地支)
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl">
              The Twelve Earthly Branches (<em>shí èr dì zhī</em>) are a foundational component of Chinese metaphysics, used in the traditional calendar, astrology (like BaZi and Zi Wei Dou Shu), and Feng Shui.
            </p>
          </div>

          {/* Introduction */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                Understanding the Earthly Branches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Each branch represents a specific time of day, a zodiac animal, a direction, a month, a Yin or Yang polarity, and one of the Five Elements. These associations give each branch a unique set of characteristics.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Click on any branch below to explore its detailed characteristics, or scroll down to see the comprehensive table and interaction patterns.
              </p>
            </CardContent>
          </Card>

          {/* Interactive Branch Selection */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Interactive Branch Explorer
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
              {dizhiData.map((zhi) => (
                <Card
                  key={zhi.name}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedZhi === zhi.name ? 'ring-2 ring-purple-500' : ''
                  }`}
                  onClick={() => setSelectedZhi(selectedZhi === zhi.name ? null : zhi.name)}
                >
                  <CardContent className={`p-4 bg-gradient-to-br ${zhi.color}`}>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {zhi.name.split(' ')[0]}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        {zhi.animal}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {zhi.element.split(' ')[0]}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Selected Branch Details */}
            {selectedZhiData && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${selectedZhiData.color} flex items-center justify-center`}>
                      <span className="text-lg font-bold">{selectedZhiData.name.split(' ')[0]}</span>
                    </div>
                    {selectedZhiData.name} - {selectedZhiData.animal}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Basic Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{selectedZhiData.yinyang}</Badge>
                          <Badge variant="outline">{selectedZhiData.element}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700 dark:text-gray-300">{selectedZhiData.time}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Characteristics</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {selectedZhiData.characteristics}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Comprehensive Table */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Characteristics of the Twelve Earthly Branches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold">Earthly Branch</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold">Zodiac Animal</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold">Yin/Yang</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold">Element</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold">Time of Day</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold">Core Characteristics & Keywords</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dizhiData.map((zhi, index) => (
                      <tr key={zhi.name} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-bold">{zhi.name}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{zhi.animal}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{zhi.yinyang}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{zhi.element}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{zhi.time}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm">{zhi.characteristics}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Interactions Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                The Importance of Interactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                It's crucial to understand that in practice (like in a BaZi chart), these characteristics are just the starting point. The true meaning and influence of an Earthly Branch come from its interactions with the other branches and the Heavenly Stems in a chart. These interactions include:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Combinations (合)
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    Branches that combine to form a new element, indicating harmony and cooperation.
                  </p>
                  
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    Clashes (冲)
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Branches in opposition, indicating conflict, change, and challenges.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    Harms (害)
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    A more subtle negative interaction that can imply betrayal or hidden problems.
                  </p>
                  
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    Punishments (刑)
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Complex negative relationships that can point to hidden troubles, ingratitude, or health issues.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  <strong>Important Note:</strong> While the table above provides the fundamental nature of each branch, a full analysis requires looking at the dynamic interplay within the entire system.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => router.push('/en/wiki/bazi')}
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to BaZi Wiki
            </Button>
            
            <Button
              onClick={() => router.push('/en/wiki/bazi/what-is-bazi')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Learn More About BaZi
              <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
            </Button>
          </div>
        </div>
      </div>
    </EnglishLayout>
  )
} 