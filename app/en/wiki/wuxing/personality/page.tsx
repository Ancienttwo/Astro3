'use client';

import { useState } from 'react';
import EnglishLayout from '@/components/EnglishLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  UserCheck, 
  UserX, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Lightbulb, 
  Heart, 
  Shield, 
  Target,
  Brain,
  Compass,
  Zap,
  Flame,
  Leaf,
  Mountain,
  Sparkles,
  Droplets,
  Activity,
  Eye,
  Puzzle,
  Crown,
  Apple
} from 'lucide-react';

export default function WuXingPersonalityPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const personalityTypes = [
    {
      element: 'Wood',
      chinese: '木',
      archetype: 'The Pioneer',
      coreDrive: 'Action & Growth',
      strengths: ['Leader', 'Decisive', 'Visionary', 'Assertive'],
      challenges: ['Impatient', 'Frustrated', 'Angry', 'Controlling'],
      icon: <Leaf className="w-5 h-5" />,
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      textColor: 'text-green-700 dark:text-green-300',
      accentColor: 'bg-green-500'
    },
    {
      element: 'Fire',
      chinese: '火',
      archetype: 'The Wizard',
      coreDrive: 'Connection & Joy',
      strengths: ['Charismatic', 'Passionate', 'Optimistic', 'Sociable'],
      challenges: ['Anxious', 'Dramatic', 'Restless', 'Attention-seeking'],
      icon: <Flame className="w-5 h-5" />,
      color: 'red',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-700 dark:text-red-300',
      accentColor: 'bg-red-500'
    },
    {
      element: 'Earth',
      chinese: '土',
      archetype: 'The Peacemaker',
      coreDrive: 'Nurturing & Harmony',
      strengths: ['Supportive', 'Reliable', 'Empathetic', 'Practical'],
      challenges: ['Worrier', 'Meddlesome', 'Needy', 'Stubborn'],
      icon: <Mountain className="w-5 h-5" />,
      color: 'yellow',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      accentColor: 'bg-yellow-500'
    },
    {
      element: 'Metal',
      chinese: '金',
      archetype: 'The Architect',
      coreDrive: 'Order & Purity',
      strengths: ['Organized', 'Disciplined', 'Ethical', 'Refined'],
      challenges: ['Critical', 'Rigid', 'Reserved', 'Holds onto grief'],
      icon: <Sparkles className="w-5 h-5" />,
      color: 'gray',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      borderColor: 'border-gray-200 dark:border-gray-800',
      textColor: 'text-gray-700 dark:text-gray-300',
      accentColor: 'bg-gray-500'
    },
    {
      element: 'Water',
      chinese: '水',
      archetype: 'The Philosopher',
      coreDrive: 'Wisdom & Willpower',
      strengths: ['Introspective', 'Calm', 'Determined', 'Adaptable'],
      challenges: ['Fearful', 'Isolated', 'Secretive', 'Cynical'],
      icon: <Droplets className="w-5 h-5" />,
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-700 dark:text-blue-300',
      accentColor: 'bg-blue-500'
    }
  ];

  const detailedDescriptions = {
    Wood: {
      balanced: {
        title: "When in Balance",
        description: "They are assertive, confident, and decisive. They thrive on challenges and have a clear sense of direction. They are excellent at starting new projects and inspiring others to action. Their anger is clean and quick—it rises when an obstacle appears and dissipates just as quickly once the obstacle is overcome.",
        traits: ["Assertive & confident", "Thrives on challenges", "Excellent at starting projects", "Inspires others to action", "Clean, quick anger resolution"]
      },
      imbalanced: {
        title: "When Out of Balance",
        description: "Their drive turns into aggression and impatience. They become easily frustrated and are prone to outbursts of anger or simmering resentment. They can become \"workaholics,\" pushing themselves and others too hard. They may feel \"stuck,\" leading to tension, headaches, and a controlling nature.",
        traits: ["Aggressive & impatient", "Easily frustrated", "Prone to anger outbursts", "Workaholic tendencies", "Controlling nature"]
      },
      physical: "Often have a lean, sinewy build, strong tendons, and a direct, piercing gaze."
    },
    Fire: {
      balanced: {
        title: "When in Balance",
        description: "They are charismatic, fun-loving, and full of passion. They laugh easily and have a gift for making others feel seen and appreciated. They are optimistic and can light up a room with their enthusiasm and warmth.",
        traits: ["Charismatic & fun-loving", "Passionate & enthusiastic", "Makes others feel appreciated", "Optimistic outlook", "Lights up the room"]
      },
      imbalanced: {
        title: "When Out of Balance",
        description: "Their need for connection turns into a desperate need for attention. They can become agitated, anxious, and restless, unable to be alone or sit still. Their speech may become rapid and scattered. They are prone to dramatic emotional highs and lows and can burn out from over-committing socially.",
        traits: ["Desperate for attention", "Agitated & anxious", "Cannot be alone", "Rapid, scattered speech", "Dramatic emotional swings"]
      },
      physical: "Often have pointed features, a reddish complexion, sparkling eyes, and quick, animated movements."
    },
    Earth: {
      balanced: {
        title: "When in Balance",
        description: "They are empathetic, supportive, and incredibly loyal. They are practical, grounded, and have a knack for making people feel safe and cared for. They are thoughtful and steady, creating a stable center for those around them.",
        traits: ["Empathetic & supportive", "Incredibly loyal", "Practical & grounded", "Makes others feel safe", "Thoughtful & steady"]
      },
      imbalanced: {
        title: "When Out of Balance",
        description: "Their desire to help becomes meddling and neediness. They are prone to constant worry and overthinking, ruminating on problems without resolution. They can become stuck in a rut, resistant to change, and may use food for comfort. Their empathy can lead them to take on everyone else's problems to their own detriment.",
        traits: ["Meddling & needy", "Constant worry", "Overthinking problems", "Resistant to change", "Takes on others' problems"]
      },
      physical: "Often have a more solid or rounded physique, a gentle and melodic voice, and a calm, approachable demeanor."
    },
    Metal: {
      balanced: {
        title: "When in Balance",
        description: "They are organized, self-disciplined, and have high standards for themselves and others. They are emotionally reserved but deeply principled and righteous. They have a natural ability to let go of what is no longer essential, creating a life of elegant simplicity.",
        traits: ["Organized & self-disciplined", "High standards", "Deeply principled", "Emotionally reserved", "Elegant simplicity"]
      },
      imbalanced: {
        title: "When Out of Balance",
        description: "Their high standards curdle into perfectionism and harsh judgment (of themselves and others). They can become rigid, dogmatic, and emotionally cold or distant. They struggle to connect with the \"messiness\" of emotions and may have difficulty processing grief, leading to a lingering sadness.",
        traits: ["Perfectionist & judgmental", "Rigid & dogmatic", "Emotionally cold", "Struggles with emotions", "Difficulty processing grief"]
      },
      physical: "Often have a pale complexion, well-defined facial features, an upright posture, and a clear, strong voice."
    },
    Water: {
      balanced: {
        title: "When in Balance",
        description: "They are introspective, wise, and perceptive. They have immense willpower and determination that is not loud or flashy but deep and persistent. They are calm in a crisis and have a powerful, quiet presence.",
        traits: ["Introspective & wise", "Immense willpower", "Deep determination", "Calm in crisis", "Powerful quiet presence"]
      },
      imbalanced: {
        title: "When Out of Balance",
        description: "Their introspection turns to isolation and social withdrawal. They can become paralyzed by fear and insecurity. Their quiet nature can become secretive and cynical. They are prone to exhaustion and burnout, as their core energy reserves (Kidney Jing) become depleted.",
        traits: ["Isolation & withdrawal", "Paralyzed by fear", "Secretive & cynical", "Prone to exhaustion", "Depleted energy reserves"]
      },
      physical: "Often have soft, rounded features, deep and watchful eyes, and may have dark circles under their eyes. They have a still, quiet presence."
    }
  };

  return (
    <EnglishLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <User className="w-12 h-12 text-indigo-600" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Five Elements Personality Types
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Discover your constitutional element and understand how it shapes your personality, 
              emotional responses, and interactions with the world.
            </p>
          </div>

          {/* Introduction */}
          <Card className="mb-8 border-indigo-200 dark:border-indigo-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                <Lightbulb className="w-5 h-5" />
                Understanding Your Dominant Element
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                In Traditional Chinese Medicine, it's believed that while everyone has all five elements 
                within them, most people have one or two elements that are more constitutionally dominant. 
                This dominant element shapes not only our physical health tendencies but also our fundamental 
                personality, emotional responses, and how we interact with the world.
              </p>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                <p className="text-indigo-700 dark:text-indigo-300 font-medium">
                  Understanding your dominant personality type can be incredibly illuminating. It helps you 
                  understand your innate strengths and also your "Achilles' heel"—the specific emotional 
                  and physical challenges you're most likely to face when out of balance.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Personality Types Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Overview of the Five Personality Types</CardTitle>
              <CardDescription>
                Each element corresponds to a distinct personality archetype with unique drives, 
                strengths, and challenges.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                      <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Element</th>
                      <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Archetype</th>
                      <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Core Drive</th>
                      <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Strengths</th>
                      <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Challenges When Imbalanced</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personalityTypes.map((type, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-full ${type.accentColor}`}>
                              {type.icon}
                            </div>
                            <div>
                              <div className={`font-semibold ${type.textColor}`}>
                                {type.element} ({type.chinese})
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {type.archetype}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-gray-600 dark:text-gray-400">
                            {type.coreDrive}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {type.strengths.map((strength, strengthIndex) => (
                              <Badge key={strengthIndex} variant="secondary" className="text-xs">
                                {strength}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {type.challenges.map((challenge, challengeIndex) => (
                              <Badge key={challengeIndex} variant="destructive" className="text-xs">
                                {challenge}
                              </Badge>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Descriptions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">A Deeper Look at Each Type</CardTitle>
              <CardDescription>
                Explore the detailed characteristics of each personality type, including balanced 
                and imbalanced states.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {personalityTypes.map((type, index) => {
                  const details = detailedDescriptions[type.element as keyof typeof detailedDescriptions];
                  return (
                    <div key={index} className={`border-2 ${type.borderColor} ${type.bgColor} rounded-lg p-6`}>
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`p-3 rounded-full ${type.accentColor}`}>
                          {type.icon}
                        </div>
                        <div>
                          <h3 className={`text-2xl font-bold ${type.textColor}`}>
                            {index + 1}. The {type.element} Personality: {type.archetype}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {type.element} types are driven by {type.coreDrive.toLowerCase()}.
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Balanced State */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <h4 className="text-lg font-semibold text-green-700 dark:text-green-300">
                              {details.balanced.title}
                            </h4>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {details.balanced.description}
                          </p>
                          <ul className="space-y-2">
                            {details.balanced.traits.map((trait, traitIndex) => (
                              <li key={traitIndex} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-400">{trait}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Imbalanced State */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <h4 className="text-lg font-semibold text-red-700 dark:text-red-300">
                              {details.imbalanced.title}
                            </h4>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {details.imbalanced.description}
                          </p>
                          <ul className="space-y-2">
                            {details.imbalanced.traits.map((trait, traitIndex) => (
                              <li key={traitIndex} className="flex items-start gap-2 text-sm">
                                <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-400">{trait}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Physical Characteristics */}
                      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className="w-5 h-5 text-gray-600" />
                          <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                            Physical Clues
                          </h4>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          {details.physical}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Practical Applications */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Practical Applications in Daily Life</CardTitle>
              <CardDescription>
                Applying the Five Elements is not about rigid rules, but about mindful observation 
                and gentle adjustment. It's about asking, "What energy do I feel right now, and what energy do I need?"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Emotional Self-Awareness */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-indigo-600" />
                    1. The Foundation: Emotional Self-Awareness
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    This is the most powerful application. Start by noticing your dominant emotional 
                    state and linking it to an element.
                  </p>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        emotion: "Irritable or Frustrated",
                        element: "Excess Wood Energy",
                        description: "Your Qi is stagnant",
                        action: "Move your body. Go for a brisk walk or run. Stretch your limbs. Do something creative to give that energy a positive outlet. Avoid bottling it up.",
                        color: "border-green-200 bg-green-50 dark:bg-green-900/20"
                      },
                      {
                        emotion: "Anxious or Restless",
                        element: "Imbalanced Fire Energy",
                        description: "Your Shen (spirit) is agitated",
                        action: "Calm your spirit. Connect with a loved one. Practice gratitude. Place a hand on your heart and breathe deeply. Use the color blue (Water) to cool the excess Fire.",
                        color: "border-red-200 bg-red-50 dark:bg-red-900/20"
                      },
                      {
                        emotion: "Worried or Overthinking",
                        element: "Earth Element Imbalance",
                        description: "You are ungrounded",
                        action: "Nourish and center yourself. Eat a simple, warm meal. Tidy your desk or a small part of your home. Walk barefoot on grass. Listen to calming music.",
                        color: "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20"
                      },
                      {
                        emotion: "Sad or Holding On",
                        element: "Metal Element Imbalance",
                        description: "You are struggling with letting go",
                        action: "Create order and breathe. Practice deep, conscious breathing, focusing on a full exhale. Declutter a drawer or your closet. Write down your feelings to process them.",
                        color: "border-gray-200 bg-gray-50 dark:bg-gray-900/20"
                      },
                      {
                        emotion: "Fearful or Exhausted",
                        element: "Water Element Depleted",
                        description: "Your deep reserves are low",
                        action: "Rest and conserve. Take a nap. Have a warm bath with Epsom salts. Say 'no' to extra commitments. Spend some quiet time alone. Drink plenty of water.",
                        color: "border-blue-200 bg-blue-50 dark:bg-blue-900/20"
                      }
                    ].map((item, index) => (
                      <div key={index} className={`p-4 rounded-lg border-2 ${item.color}`}>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          Feeling {item.emotion}?
                        </h4>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                          → {item.element}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-3 italic">
                          {item.description}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Action:</span> {item.action}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Five Element Eating */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Apple className="w-5 h-5 text-indigo-600" />
                    2. Five Element Eating
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    The simplest way to start is by "eating the rainbow." Aim to incorporate all five 
                    colors (and their associated flavors) into your diet regularly to nourish all your organ systems.
                  </p>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                          <th className="text-left p-3 font-semibold">Element</th>
                          <th className="text-left p-3 font-semibold">Color</th>
                          <th className="text-left p-3 font-semibold">Flavor</th>
                          <th className="text-left p-3 font-semibold">Action & Examples</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { element: "Wood", color: "Green", flavor: "Sour", action: "Cleanses the Liver. Leafy greens, broccoli, lime, vinegar.", bgColor: "bg-green-50 dark:bg-green-900/20" },
                          { element: "Fire", color: "Red", flavor: "Bitter", action: "Boosts the Heart. Tomatoes, berries, red peppers, dark chocolate.", bgColor: "bg-red-50 dark:bg-red-900/20" },
                          { element: "Earth", color: "Yellow", flavor: "Sweet", action: "Nourishes the Spleen. Corn, squash, sweet potatoes, bananas.", bgColor: "bg-yellow-50 dark:bg-yellow-900/20" },
                          { element: "Metal", color: "White", flavor: "Pungent", action: "Strengthens the Lungs. Onions, garlic, cauliflower, radishes.", bgColor: "bg-gray-50 dark:bg-gray-900/20" },
                          { element: "Water", color: "Black", flavor: "Salty", action: "Fortifies the Kidneys. Black beans, seaweed, mushrooms, miso.", bgColor: "bg-blue-50 dark:bg-blue-900/20" }
                        ].map((item, index) => (
                          <tr key={index} className={`border-b border-gray-100 dark:border-gray-800 ${item.bgColor}`}>
                            <td className="p-3 font-medium">{item.element}</td>
                            <td className="p-3">{item.color}</td>
                            <td className="p-3">{item.flavor}</td>
                            <td className="p-3 text-sm">{item.action}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <p className="text-indigo-700 dark:text-indigo-300">
                      <span className="font-medium">Practical Tip:</span> Look at your plate for lunch or dinner. 
                      Is it all brown and white? Add some green spinach (Wood), red bell peppers (Fire), 
                      or a side of black beans (Water).
                    </p>
                  </div>
                </div>

                {/* Exercise */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    3. Choosing Your Exercise
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    Match your movement to the energy you need.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { element: "Wood", exercise: "Competitive sports, running, kickboxing", benefit: "Moves stagnant Qi", color: "border-green-200 bg-green-50 dark:bg-green-900/20" },
                      { element: "Fire", exercise: "Dancing, fun group classes, joyful cardio", benefit: "Expresses joy", color: "border-red-200 bg-red-50 dark:bg-red-900/20" },
                      { element: "Earth", exercise: "Hiking, walking, weight training, gardening", benefit: "Grounds and stabilizes", color: "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20" },
                      { element: "Metal", exercise: "Yoga, Pilates, Tai Chi, breathing exercises", benefit: "Focuses on structure and breath", color: "border-gray-200 bg-gray-50 dark:bg-gray-900/20" },
                      { element: "Water", exercise: "Swimming, Qigong, restorative stretching", benefit: "Promotes flow and restoration", color: "border-blue-200 bg-blue-50 dark:bg-blue-900/20" }
                    ].map((item, index) => (
                      <div key={index} className={`p-4 rounded-lg border-2 ${item.color}`}>
                        <h4 className="font-semibold mb-2">To Balance {item.element}:</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{item.exercise}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 italic">({item.benefit})</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Daily Structure */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-600" />
                    4. Structuring Your Day or Projects
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    You can use the generating cycle (Wood → Fire → Earth → Metal → Water) to structure your workflow.
                  </p>
                  
                  <div className="space-y-4">
                    {[
                      { phase: "Wood (Beginnings)", activity: "Start with planning, brainstorming, and setting goals.", color: "bg-green-500" },
                      { phase: "Fire (Action)", activity: "Move into the most active, collaborative, or public-facing part of your work.", color: "bg-red-500" },
                      { phase: "Earth (Sustaining)", activity: "Settle into the steady, focused work of executing the plan.", color: "bg-yellow-500" },
                      { phase: "Metal (Refining)", activity: "Shift to editing, organizing, and perfecting the details.", color: "bg-gray-500" },
                      { phase: "Water (Resting)", activity: "End with reflection, rest, and storing energy for the next cycle.", color: "bg-blue-500" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200">{item.phase}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.activity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Environment */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-600" />
                    5. Enhancing Your Environment
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    Use color and objects to shift the energy of your space.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { need: "Need more drive (Wood)?", solution: "Add a healthy green plant to your desk.", color: "border-green-200 bg-green-50 dark:bg-green-900/20" },
                      { need: "Need more joy (Fire)?", solution: "Light a candle or use warmer, reddish tones in your lighting.", color: "border-red-200 bg-red-50 dark:bg-red-900/20" },
                      { need: "Need more stability (Earth)?", solution: "Use ceramic mugs, stable wooden furniture, and earthy colors.", color: "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20" },
                      { need: "Need more clarity (Metal)?", solution: "Declutter your space. Organize with clean lines and metallic accents.", color: "border-gray-200 bg-gray-50 dark:bg-gray-900/20" },
                      { need: "Need more calm (Water)?", solution: "Use a small water fountain for gentle sound, hang a mirror, or use deep blue/black accents.", color: "border-blue-200 bg-blue-50 dark:bg-blue-900/20" }
                    ].map((item, index) => (
                      <div key={index} className={`p-4 rounded-lg border-2 ${item.color}`}>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{item.need}</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{item.solution}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conclusion */}
          <Card className="border-indigo-200 dark:border-indigo-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <Compass className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Recognizing your primary element is the first step toward using this ancient system 
                  for modern well-being. It allows you to honor your strengths and be mindful of your 
                  potential pitfalls, guiding you toward a more balanced and harmonious life.
                </p>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                  <p className="text-indigo-700 dark:text-indigo-300 font-medium">
                    By starting with small, conscious choices, you begin to weave the wisdom of the Five Elements 
                    into the fabric of your life, creating a more balanced, healthy, and harmonious existence.
                  </p>
                </div>
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