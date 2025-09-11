'use client'
// @ts-expect-error next-dynamic-flag
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Settings, 
  Palette,
  Globe
} from 'lucide-react'
import { ThemeSettings } from '@/components/theme-toggle'
import AuthGuard from '@/components/AuthGuard'
import SmartLayout from '@/components/SmartLayout'
import { useJapaneseTranslation } from '@/hooks/useJapaneseTranslation'
import { getLanguage } from '@/lib/utils/language'

export function PreferencesPageComponent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentLang = getLanguage(pathname);
  const isEnglish = currentLang === 'en';
  const isJapanese = currentLang === 'ja';
  
  const { jt, isJapanese: isJapaneseContext } = useJapaneseTranslation();
  
  const [selectedLanguage, setSelectedLanguage] = useState<string>(currentLang)

  const languages = [
    { code: 'zh', name: '中文', flag: '🇨🇳', available: true },
    { code: 'en', name: 'English', flag: '🇺🇸', available: true },
    { code: 'ja', name: '日本語', flag: '🇯🇵', available: false }
  ]

  const handleLanguageChange = (langCode: string) => {
    let newPath: string;
    
    switch (langCode) {
      case 'zh':
        newPath = '/preferences';
        break;
      case 'en':
        newPath = '/en/preferences';
        break;
      case 'ja':
        newPath = '/ja/preferences';
        break;
      default:
        newPath = '/preferences';
    }
    
    window.location.href = newPath;
    setSelectedLanguage(langCode);
  }

  return (
    <AuthGuard>
      <SmartLayout forceLayout={isEnglish ? 'english' : undefined}>
        <div className={`container mx-auto px-4 py-6 max-w-4xl ${isJapanese ? 'font-noto-sans-jp leading-japanese tracking-japanese' : ''}`}>
          {/* 页面标题 */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-7 h-7 text-primary dark:text-yellow-400" />
              <h1 className="text-2xl font-bold text-primary dark:text-yellow-400">
                {isEnglish ? 'Preferences' : isJapanese ? jt('pages.preferences.title') : '偏好设置'}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {isEnglish ? 'Customize your experience' : isJapanese ? jt('pages.preferences.subtitle') : '个性化您的使用体验'}
            </p>
          </div>

          <div className="space-y-6">
            {/* 主题偏好 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary dark:text-yellow-400" />
                  <CardTitle className="dark:text-yellow-400">
                    {isEnglish ? 'Theme Preferences' : isJapanese ? jt('pages.preferences.theme.title') : '主题偏好'}
                  </CardTitle>
                </div>
                <CardDescription>
                  {isEnglish ? 'Choose your preferred interface style' : isJapanese ? jt('pages.preferences.theme.description') : '选择您喜欢的界面风格'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ThemeSettings />
              </CardContent>
            </Card>

            {/* 语言设置 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary dark:text-yellow-400" />
                  <CardTitle className="dark:text-yellow-400">
                    {isEnglish ? 'Language Settings' : isJapanese ? jt('pages.preferences.language.title') : '语言设置'}
                  </CardTitle>
                </div>
                <CardDescription>
                  {isEnglish ? 'Choose your preferred display language' : isJapanese ? jt('pages.preferences.language.description') : '选择您偏好的显示语言'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {languages.map((lang) => (
                    <Button
                      key={lang.code}
                      variant={selectedLanguage === lang.code ? "default" : "outline"}
                      onClick={() => handleLanguageChange(lang.code)}
                      disabled={!lang.available}
                      title={!lang.available ? (isEnglish ? 'Coming soon!' : isJapanese ? jt('pages.preferences.language.comingSoon') + '予定！' : '该语言版本即将推出，敬请期待！') : ''}
                      className={`flex items-center gap-2 ${
                        selectedLanguage === lang.code 
                          ? 'bg-primary dark:bg-yellow-600 text-primary-foreground dark:text-slate-900' 
                          : 'hover:bg-accent dark:hover:bg-yellow-600/20'
                      } ${!lang.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span>{lang.name}</span>
                      {!lang.available && (
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {isEnglish ? 'Coming Soon' : isJapanese ? jt('pages.preferences.language.comingSoon') : '即将推出'}
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  {isEnglish 
                    ? '🌐 Supports Chinese, Japanese, and English interfaces. Switch languages anytime!' 
                    : isJapanese
                    ? jt('pages.preferences.language.support')
                    : '🌐 支持中文、日语和英文界面，随时切换语言！'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </SmartLayout>
    </AuthGuard>
  )
}

export default function PreferencesPage() {
  return <PreferencesPageComponent />
} 
