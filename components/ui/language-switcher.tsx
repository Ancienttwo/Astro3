'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Globe, Languages } from 'lucide-react';
import { useUrlLanguage, SupportedLanguage } from '@/lib/i18n/language-manager';

export interface LanguageSwitcherProps {
  variant?: 'select' | 'buttons';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const LANGUAGE_OPTIONS = [
  { value: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
  { value: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
  { value: 'en-US', label: 'English', flag: '🇺🇸' },
] as const;

export function LanguageSwitcher({ 
  variant = 'select', 
  size = 'md', 
  showIcon = true,
  className = '' 
}: LanguageSwitcherProps) {
  const { currentLanguage, setLanguage } = useUrlLanguage();

  const handleLanguageChange = (language: string) => {
    setLanguage(language as SupportedLanguage);
  };

  const getCurrentOption = () => {
    return LANGUAGE_OPTIONS.find(opt => opt.value === currentLanguage) || LANGUAGE_OPTIONS[0];
  };

  if (variant === 'buttons') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showIcon && <Languages className="w-4 h-4 text-muted-foreground" />}
        <div className="flex rounded-lg border border-border overflow-hidden">
          {LANGUAGE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={currentLanguage === option.value ? 'default' : 'ghost'}
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
      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
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