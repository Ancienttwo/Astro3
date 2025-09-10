'use client';

import { getDictionary, type Dictionary } from '@/lib/i18n/dictionaries';

/**
 * 国际化Hook
 * 用于在英文页面中获取界面元素的翻译文本
 * 注意：排盘术语（天干地支、宫位、星曜等）保持中文不翻译
 */
export function useI18n(locale: 'zh' | 'ja' | 'en' = 'en'): Dictionary {
  return getDictionary(locale);
}

/**
 * 检测当前页面是否为英文版
 * 基于路径 /en/* 来判断
 */
export function useIsEnglishPage(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.startsWith('/en');
}

/**
 * 获取当前页面语言
 */
export function useCurrentLocale(): 'zh' | 'ja' | 'en' {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang');
    if (lang === 'ja') return 'ja';
    if (window.location.pathname.startsWith('/ja')) return 'ja';
    if (window.location.pathname.startsWith('/en')) return 'en';
  }
  return 'zh';
}

/**
 * 智能翻译Hook - 自动检测页面语言
 */
export function useTranslation(): Dictionary {
  const locale = useCurrentLocale();
  return useI18n(locale);
} 