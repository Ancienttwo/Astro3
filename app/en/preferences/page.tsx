'use client'

import React, { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Monitor, Moon, Sun, Globe, Palette, Settings } from 'lucide-react'
import AuthGuard from '@/components/AuthGuard'
import SmartLayout from '@/components/SmartLayout'
import { getDictionary } from '@/lib/i18n/dictionaries'

export default function EnglishPreferencesPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const t = getDictionary('en')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  const themeOptions = [
    {
      id: 'light',
      name: t.preferences.lightMode,
      description: 'Clean and bright interface',
      icon: Sun,
      preview: 'bg-gradient-to-br from-white to-gray-100',
      textColor: 'text-gray-800'
    },
    {
      id: 'dark',
      name: t.preferences.darkMode,
      description: 'Easy on the eyes for nighttime use',
      icon: Moon,
      preview: 'bg-gradient-to-br from-gray-900 to-black',
      textColor: 'text-white'
    },
    {
      id: 'system',
      name: t.preferences.systemMode,
      description: 'Automatically match your system preferences',
      icon: Monitor,
      preview: 'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900',
      textColor: 'text-gray-700 dark:text-gray-300'
    }
  ]

  const languageOptions = [
    {
      id: 'en',
      name: t.preferences.english,
      description: 'English interface with Chinese astrology terms',
      flag: '🇺🇸',
      available: true
    },
    {
      id: 'zh',
      name: t.preferences.chinese,
      description: '中文界面，完整本土化体验',
      flag: '🇨🇳',
      available: true
    },
    {
      id: 'ja',
      name: t.preferences.japanese,
      description: '日本語インターフェース',
      flag: '🇯🇵',
      available: true
    }
  ]

  return (
    <AuthGuard>
      <SmartLayout>
        <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-4xl">
          {/* Page Header */}
          <div className="text-center mb-8 md:mb-12">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
              <Settings className="w-6 h-6 md:w-8 md:h-8 text-purple-600 dark:text-yellow-400 flex-shrink-0" />
              <h1 className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-yellow-400 leading-none">
                {t.preferences.title}
              </h1>
            </div>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 px-4 leading-relaxed">
              {t.preferences.subtitle}
            </p>
          </div>

          {/* Theme Settings */}
          <div className="mb-8 md:mb-12">
            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-purple-600 dark:text-yellow-400" />
                  <div>
                    <CardTitle className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">
                      {t.preferences.themeSettings}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {t.preferences.themeSettingsDesc}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t.preferences.currentTheme}:
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {theme === 'light' ? t.preferences.lightMode : 
                       theme === 'dark' ? t.preferences.darkMode : 
                       t.preferences.systemMode}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {themeOptions.map((option) => (
                    <Card
                      key={option.id}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        theme === option.id
                          ? 'border-2 border-purple-500 shadow-lg shadow-purple-100 dark:shadow-purple-900/20'
                          : 'border border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                      onClick={() => setTheme(option.id)}
                    >
                      <CardContent className="p-4">
                        <div className={`w-full h-20 rounded-lg mb-3 ${option.preview} flex items-center justify-center`}>
                          <option.icon className={`w-6 h-6 ${option.textColor}`} />
                        </div>
                        <h3 className="font-semibold text-sm mb-1 text-gray-800 dark:text-white">
                          {option.name}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {option.description}
                        </p>
                        {theme === option.id && (
                          <div className="mt-2 flex items-center gap-1">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                              Active
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Language Settings */}
          <div className="mb-8 md:mb-12">
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <CardTitle className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">
                      {t.preferences.languageSettings}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {t.preferences.languageSettingsDesc}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t.preferences.currentLanguage}:
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {t.preferences.english}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {languageOptions.map((option) => (
                    <Card
                      key={option.id}
                      className={`transition-all duration-300 ${
                        option.available 
                          ? 'cursor-pointer hover:shadow-lg hover:border-blue-300' 
                          : 'opacity-60 cursor-not-allowed'
                      } ${
                        option.id === 'en'
                          ? 'border-2 border-blue-500 shadow-lg shadow-blue-100 dark:shadow-blue-900/20'
                          : 'border border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => {
                        if (option.available && option.id !== 'en') {
                          if (option.id === 'zh') {
                            window.location.href = '/preferences'
                          } else if (option.id === 'ja') {
                            window.location.href = '/ja/preferences'
                          }
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-center text-3xl mb-3">
                          {option.flag}
                        </div>
                        <h3 className="font-semibold text-sm mb-1 text-gray-800 dark:text-white text-center">
                          {option.name}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-300 text-center">
                          {option.description}
                        </p>
                        <div className="mt-2 flex items-center justify-center gap-1">
                          {option.available ? (
                            option.id === 'en' ? (
                              <>
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                  Active
                                </span>
                              </>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                {t.preferences.available}
                              </Badge>
                            )
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              {t.preferences.comingSoon}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Features Coming Soon */}
          <div className="mb-8">
            <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
              <CardContent className="p-6 md:p-8 text-center">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-2">
                  {t.preferences.comingSoon}
                </h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-4">
                  {t.preferences.comingSoonDesc}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Notification Settings
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Display Preferences
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Privacy Controls
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Export Options
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SmartLayout>
    </AuthGuard>
  )
} 