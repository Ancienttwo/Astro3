"use client";
import {useLocale, useMessages} from 'next-intl';
import type {Dictionary} from './dictionaries';

export function useI18n() {
  // 从 next-intl Provider 获取
  const localeRaw = useLocale();
  const locale = (localeRaw === 'en' || localeRaw === 'ja') ? localeRaw : 'zh';
  const dict = useMessages() as unknown as Dictionary;
  
  return {
    dict,
    locale,
    isEnglish: locale === 'en',
    isChinese: locale === 'zh'
  };
}

/**
 * 获取当前语言代码的工具函数
 * @param pathname 当前路径
 * @param searchParams URL参数
 * @returns 语言代码
 */
export function getCurrentLanguage(pathname: string, searchParams?: URLSearchParams): 'zh' | 'en' {
  // 检查路径是否以 /en 开头
  if (pathname.startsWith('/en')) {
    return 'en';
  }
  
  // 检查 URL 参数中的 lang
  if (searchParams?.get('lang') === 'en') {
    return 'en';
  }
  
  // 默认中文
  return 'zh';
}

/**
 * 检查是否为英文版本的工具函数
 * @param pathname 当前路径
 * @param searchParams URL参数
 * @returns 是否为英文版本
 */
export function isEnglishVersion(pathname: string, searchParams?: URLSearchParams): boolean {
  return getCurrentLanguage(pathname, searchParams) === 'en';
} 
