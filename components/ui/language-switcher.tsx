'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Globe, Languages } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

type SupportedLanguage = 'zh' | 'en' | 'ja';

export interface LanguageSwitcherProps {
  variant?: 'select' | 'buttons';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const LANGUAGE_OPTIONS = [
  { value: 'zh' as const, label: '简体中文', flag: '🇨🇳' },
  { value: 'en' as const, label: 'English', flag: '🇺🇸' },
  { value: 'ja' as const, label: '日本語', flag: '🇯🇵' },
] as const;

export function LanguageSwitcher({
  variant = 'select',
  size = 'md',
  showIcon = true,
  className = ''
}: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale() as SupportedLanguage;

  const handleLanguageChange = (languageCode: SupportedLanguage) => {
    if (languageCode === currentLocale) return;

    try {
      // 构建新的路径
      let newPathname = pathname;

      // 移除当前语言前缀（如果有）
      if (currentLocale !== 'zh') {
        newPathname = pathname.replace(`/${currentLocale}`, '');
      }

      // 添加新语言前缀（如果不是中文）
      if (languageCode !== 'zh') {
        newPathname = `/${languageCode}${newPathname || '/'}`;
      } else {
        newPathname = newPathname || '/';
      }

      // 导航到新路径
      router.push(newPathname);
    } catch (error) {
      console.error('Language switch failed:', error);
    }
  };

  const getCurrentOption = () => {
    return LANGUAGE_OPTIONS.find(opt => opt.value === currentLocale) || LANGUAGE_OPTIONS[0];
  };

  if (variant === 'buttons') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showIcon && <Languages className="w-4 h-4 text-muted-foreground" />}
        <div className="flex rounded-lg border border-border overflow-hidden">
          {LANGUAGE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={currentLocale === option.value ? 'default' : 'ghost'}
              size={size}
              onClick={() => handleLanguageChange(option.value)}
              className={`rounded-none border-0 ${
                size === 'sm' ? 'px-2 py-1 text-xs' :
                size === 'lg' ? 'px-4 py-2' : 'px-3 py-1.5 text-sm'
              }`}
            >
              <span className="mr-1">{option.flag}</span>
              {size !== 'sm' && option.label}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && <Globe className="w-4 h-4 text-muted-foreground" />}
      <Select value={currentLocale} onValueChange={(val) => handleLanguageChange(val as SupportedLanguage)}>
        <SelectTrigger className={`
          ${size === 'sm' ? 'w-24 h-8 text-xs' :
            size === 'lg' ? 'w-40 h-12' : 'w-32 h-10'}
        `}>
          <SelectValue>
            <div className="flex items-center gap-2">
              <span>{getCurrentOption().flag}</span>
              {size !== 'sm' && (
                <span className="truncate">{getCurrentOption().label}</span>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {LANGUAGE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <span>{option.flag}</span>
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default LanguageSwitcher;
