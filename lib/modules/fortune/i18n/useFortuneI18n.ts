// lib/modules/fortune/i18n/useFortuneI18n.ts - Fortune Module i18n Hook
'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import { getFortuneDictionary, getFortuneTranslation, type FortuneDictionary } from './fortune-dictionaries';
import { getCurrentLanguage } from '@/lib/i18n/useI18n';

export type FortuneLocale = 'zh-CN' | 'zh-TW' | 'en-US';

export interface FortuneI18nContext {
  dict: FortuneDictionary;
  locale: FortuneLocale;
  t: (key: string, params?: Record<string, string | number>) => string;
  isZhCN: boolean;
  isZhTW: boolean;
  isEnglish: boolean;
  isChinese: boolean;
  formatMessage: (template: string, params?: Record<string, string | number>) => string;
}

/**
 * Fortune module i18n hook that extends the main app's i18n system
 */
export function useFortuneI18n(): FortuneI18nContext {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // Detect language from various sources
  const locale = detectFortuneLocale(pathname, searchParams);
  const dict = getFortuneDictionary(locale);
  
  // Translation function
  const t = (key: string, params?: Record<string, string | number>): string => {
    return getFortuneTranslation(key, locale, params);
  };

  // Format message with parameters
  const formatMessage = (template: string, params?: Record<string, string | number>): string => {
    if (!params) return template;
    
    let result = template;
    for (const [key, value] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }
    return result;
  };

  return {
    dict,
    locale,
    t,
    isZhCN: locale === 'zh-CN',
    isZhTW: locale === 'zh-TW', 
    isEnglish: locale === 'en-US',
    isChinese: locale === 'zh-CN' || locale === 'zh-TW',
    formatMessage
  };
}

/**
 * Detect fortune locale from pathname and search params
 */
function detectFortuneLocale(pathname: string, searchParams: URLSearchParams | null): FortuneLocale {
  // Check URL path patterns
  if (pathname.includes('/zh-TW') || pathname.includes('/zh-tw') || pathname.includes('/hk')) {
    return 'zh-TW';
  }
  
  if (pathname.includes('/en') || pathname.includes('/english')) {
    return 'en-US';
  }
  
  // Check search parameters
  const langParam = searchParams?.get('lang') || searchParams?.get('language');
  if (langParam) {
    const normalized = normalizeLangParam(langParam);
    if (normalized) return normalized;
  }
  
  // Use main app's language detection as fallback
  const mainAppLang = getCurrentLanguage(pathname, searchParams);
  return mainAppLang === 'en' ? 'en-US' : 'zh-CN';
}

/**
 * Normalize language parameter to FortuneLocale
 */
function normalizeLangParam(lang: string): FortuneLocale | null {
  const normalized = lang.toLowerCase();
  
  if (normalized.includes('zh-tw') || normalized.includes('zh-hk') || 
      normalized.includes('hant') || normalized === 'tw' || normalized === 'hk') {
    return 'zh-TW';
  }
  
  if (normalized.includes('en') || normalized === 'english') {
    return 'en-US';
  }
  
  if (normalized.includes('zh') || normalized === 'chinese' || normalized === 'cn') {
    return 'zh-CN';
  }
  
  return null;
}

/**
 * Get fortune translation by key (standalone function)
 */
export function useFortuneTranslation() {
  const { t } = useFortuneI18n();
  return t;
}

/**
 * Get current fortune locale (standalone function) 
 */
export function useFortuneLocale(): FortuneLocale {
  const { locale } = useFortuneI18n();
  return locale;
}

/**
 * Check if current locale is Chinese (any variant)
 */
export function useIsChineseLocale(): boolean {
  const { isChinese } = useFortuneI18n();
  return isChinese;
}

/**
 * Get localized field from an object (utility for API responses)
 */
export function useLocalizedField() {
  const { locale } = useFortuneI18n();
  
  return function getLocalizedField<T extends Record<string, any>>(
    obj: T,
    baseField: keyof T,
    fallbackLocale?: FortuneLocale
  ): string {
    if (!obj) return '';
    
    // Try current locale
    const localizedField = `${String(baseField)}_${locale === 'zh-TW' ? 'tw' : locale}` as keyof T;
    if (obj[localizedField]) {
      return String(obj[localizedField]);
    }
    
    // Try fallback locale
    if (fallbackLocale && fallbackLocale !== locale) {
      const fallbackField = `${String(baseField)}_${fallbackLocale === 'zh-TW' ? 'tw' : fallbackLocale}` as keyof T;
      if (obj[fallbackField]) {
        return String(obj[fallbackField]);
      }
    }
    
    // Try base field
    if (obj[baseField]) {
      return String(obj[baseField]);
    }
    
    // Try English as last resort
    const enField = `${String(baseField)}_en` as keyof T;
    if (obj[enField]) {
      return String(obj[enField]);
    }
    
    return '';
  };
}

/**
 * Format relative time in current locale
 */
export function useFortuneTimeFormat() {
  const { locale, t } = useFortuneI18n();
  
  return function formatRelativeTime(date: Date | string): string {
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - targetDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return t('fortune.time.today');
    } else if (diffDays === 1) {
      return t('fortune.time.yesterday');
    } else if (diffDays < 7) {
      return t('fortune.time.thisWeek');
    } else if (diffDays < 30) {
      return t('fortune.time.thisMonth');
    } else if (diffDays < 365) {
      return t('fortune.time.thisYear');
    } else {
      // Format based on locale
      return targetDate.toLocaleDateString(
        locale === 'en-US' ? 'en-US' : 
        locale === 'zh-TW' ? 'zh-TW' : 'zh-CN'
      );
    }
  };
}

/**
 * Get number format for current locale
 */
export function useFortuneNumberFormat() {
  const { locale } = useFortuneI18n();
  
  return function formatNumber(num: number): string {
    return new Intl.NumberFormat(
      locale === 'en-US' ? 'en-US' : 
      locale === 'zh-TW' ? 'zh-TW' : 'zh-CN'
    ).format(num);
  };
}

/**
 * Fortune-specific error message formatter
 */
export function useFortuneErrorMessage() {
  const { t } = useFortuneI18n();
  
  return function formatError(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.code) {
      const errorKey = `fortune.error.${error.code}`;
      const translated = t(errorKey);
      // If translation exists (not equal to key), return it
      if (translated !== errorKey) {
        return translated;
      }
    }
    
    if (error?.message) {
      return error.message;
    }
    
    return t('fortune.error.serverError');
  };
}