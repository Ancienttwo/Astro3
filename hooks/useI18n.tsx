'use client';

import type { Dictionary } from '@/lib/i18n/dictionaries';
import {useLocale, useMessages} from 'next-intl';

/**
 * 统一的国际化Hook（基于 next-intl 提供消息）
 * 保持原有返回类型，便于渐进迁移
 */
export function useI18n(_locale: 'zh' | 'ja' | 'en' = 'en'): Dictionary {
  // Messages are provided by NextIntlClientProvider from app/layout.tsx
  return useMessages() as unknown as Dictionary;
}

/**
 * 是否为英文页面
 */
export function useIsEnglishPage(): boolean {
  try {
    return useLocale() === 'en';
  } catch {
    // Fallback for environments without provider
    if (typeof window !== 'undefined') {
      return window.location.pathname.startsWith('/en');
    }
    return false;
  }
}

/**
 * 获取当前页面语言
 */
export function useCurrentLocale(): 'zh' | 'ja' | 'en' {
  try {
    const l = useLocale();
    return (l === 'en' || l === 'ja') ? l : 'zh';
  } catch {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const lang = urlParams.get('lang');
      if (lang === 'ja') return 'ja';
      if (window.location.pathname.startsWith('/ja')) return 'ja';
      if (window.location.pathname.startsWith('/en')) return 'en';
    }
    return 'zh';
  }
}

/**
 * 智能翻译Hook - 自动检测页面语言
 */
export function useTranslation(): Dictionary {
  return useI18n();
}
