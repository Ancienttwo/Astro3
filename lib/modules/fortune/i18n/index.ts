// lib/modules/fortune/i18n/index.ts - Fortune Module Internationalization
import { createI18n } from '@/lib/utils/i18n';

// Supported languages for Fortune module
export type FortuneLanguage = 
  // Phase 1: Basic support
  | 'zh-CN'     // 简体中文
  | 'zh-TW'     // 繁體中文
  | 'en-US'     // English
  // Phase 2: Extended support
  | 'ja-JP'     // 日本語
  | 'ko-KR'     // 한국어
  | 'th-TH'     // ไทย
  | 'vi-VN';    // Tiếng Việt

// Language configuration
export const FORTUNE_LANGUAGES = {
  // Phase 1 - Primary support
  'zh-CN': {
    name: '简体中文',
    nativeName: '简体中文',
    flag: '🇨🇳',
    rtl: false,
    priority: 1,
    status: 'active'
  },
  'zh-TW': {
    name: '繁體中文',
    nativeName: '繁體中文',
    flag: '🇹🇼',
    rtl: false,
    priority: 1,
    status: 'active'
  },
  'en-US': {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
    priority: 1,
    status: 'active'
  },
  // Phase 2 - Extended support
  'ja-JP': {
    name: '日本語',
    nativeName: '日本語',
    flag: '🇯🇵',
    rtl: false,
    priority: 2,
    status: 'planned'
  },
  'ko-KR': {
    name: '한국어',
    nativeName: '한국어',
    flag: '🇰🇷',
    rtl: false,
    priority: 2,
    status: 'planned'
  },
  'th-TH': {
    name: 'ไทย',
    nativeName: 'ไทย',
    flag: '🇹🇭',
    rtl: false,
    priority: 3,
    status: 'planned'
  },
  'vi-VN': {
    name: 'Tiếng Việt',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    rtl: false,
    priority: 3,
    status: 'planned'
  }
} as const;

// Language fallback chain
export const LANGUAGE_FALLBACKS: Record<FortuneLanguage, FortuneLanguage[]> = {
  'zh-CN': ['zh-TW', 'en-US'],
  'zh-TW': ['zh-CN', 'en-US'],
  'en-US': ['zh-CN', 'zh-TW'],
  'ja-JP': ['en-US', 'zh-CN'],
  'ko-KR': ['en-US', 'zh-CN'],
  'th-TH': ['en-US', 'zh-CN'],
  'vi-VN': ['en-US', 'zh-CN']
};

// Get active languages (status: 'active')
export function getActiveFortuneLanguages(): FortuneLanguage[] {
  return Object.entries(FORTUNE_LANGUAGES)
    .filter(([_, config]) => config.status === 'active')
    .map(([lang]) => lang as FortuneLanguage);
}

// Get planned languages for future implementation
export function getPlannedFortuneLanguages(): FortuneLanguage[] {
  return Object.entries(FORTUNE_LANGUAGES)
    .filter(([_, config]) => config.status === 'planned')
    .map(([lang]) => lang as FortuneLanguage);
}

// Normalize language code (e.g., 'zh' -> 'zh-CN', 'en' -> 'en-US')
export function normalizeFortuneLanguage(lang: string): FortuneLanguage {
  const langMap: Record<string, FortuneLanguage> = {
    'zh': 'zh-CN',
    'zh-cn': 'zh-CN',
    'zh-hans': 'zh-CN',
    'zh-tw': 'zh-TW',
    'zh-hant': 'zh-TW',
    'en': 'en-US',
    'en-us': 'en-US',
    'english': 'en-US',
    'ja': 'ja-JP',
    'ko': 'ko-KR',
    'th': 'th-TH',
    'vi': 'vi-VN'
  };

  const normalized = langMap[lang.toLowerCase()] || lang as FortuneLanguage;
  
  // Fallback to zh-CN if language not supported
  if (!FORTUNE_LANGUAGES[normalized]) {
    return 'zh-CN';
  }
  
  return normalized;
}

// Get language configuration
export function getFortuneLanguageConfig(lang: FortuneLanguage) {
  return FORTUNE_LANGUAGES[lang];
}

// Check if language is RTL
export function isRTL(lang: FortuneLanguage): boolean {
  return FORTUNE_LANGUAGES[lang]?.rtl || false;
}

// Get fallback languages for a given language
export function getFallbackLanguages(lang: FortuneLanguage): FortuneLanguage[] {
  return LANGUAGE_FALLBACKS[lang] || ['zh-CN'];
}

// Locale detection utilities
export function detectUserLanguage(): FortuneLanguage {
  if (typeof window === 'undefined') {
    return 'zh-CN';
  }

  // Try to get language from URL
  const pathname = window.location.pathname;
  const urlLang = pathname.split('/')[1];
  if (urlLang && FORTUNE_LANGUAGES[urlLang as FortuneLanguage]) {
    return urlLang as FortuneLanguage;
  }

  // Try to get language from navigator
  const navigatorLang = navigator.language || navigator.languages?.[0];
  if (navigatorLang) {
    const normalized = normalizeFortuneLanguage(navigatorLang);
    if (FORTUNE_LANGUAGES[normalized]?.status === 'active') {
      return normalized;
    }
  }

  // Default fallback
  return 'zh-CN';
}

// Translation key types for type safety
export interface FortuneTranslationKeys {
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    confirm: string;
    cancel: string;
    save: string;
    edit: string;
    delete: string;
    back: string;
    next: string;
    previous: string;
    search: string;
    filter: string;
    sort: string;
    language: string;
  };

  // Temple system
  temple: {
    title: string;
    name: string;
    location: string;
    deity: string;
    established: string;
    totalSlips: string;
    specialization: string;
    description: string;
    culturalContext: string;
    selectTemple: string;
    noTemplesAvailable: string;
    loadingTemples: string;
  };

  // Fortune slip
  slip: {
    title: string;
    number: string;
    level: string;
    category: string;
    content: string;
    interpretation: string;
    historicalContext: string;
    symbolism: string;
    drawSlip: string;
    randomSlip: string;
    yourSlip: string;
    upgradeRequired: string;
    loginRequired: string;
  };

  // Fortune levels
  fortuneLevel: {
    excellent: string;
    good: string;
    average: string;
    caution: string;
    warning: string;
  };

  // Categories
  category: {
    career: string;
    wealth: string;
    marriage: string;
    health: string;
    study: string;
    travel: string;
    family: string;
    business: string;
    legal: string;
    general: string;
  };

  // AI interpretation
  ai: {
    title: string;
    analyzing: string;
    interpretation: string;
    question: string;
    askQuestion: string;
    getInterpretation: string;
    culturalStory: string;
    practicalAdvice: string;
    interpretationComplete: string;
    interpretationFailed: string;
  };

  // Authentication
  auth: {
    login: string;
    register: string;
    logout: string;
    loginRequired: string;
    upgradeAccount: string;
    basicAccess: string;
    fullAccess: string;
    anonymousUser: string;
  };

  // QR Code & Referrals
  qr: {
    title: string;
    generate: string;
    scan: string;
    campaign: string;
    referralLink: string;
    downloadQR: string;
    printQR: string;
  };

  // Messages
  message: {
    welcome: string;
    slipDrawn: string;
    interpretationSaved: string;
    shareSlip: string;
    copyLink: string;
    linkCopied: string;
  };

  // Errors
  error: {
    networkError: string;
    serverError: string;
    notFound: string;
    unauthorized: string;
    forbidden: string;
    invalidInput: string;
    slipNotFound: string;
    templeNotFound: string;
    interpretationFailed: string;
  };

  // Navigation
  nav: {
    home: string;
    temples: string;
    mySlips: string;
    history: string;
    settings: string;
    help: string;
    about: string;
  };

  // Meta & SEO
  meta: {
    title: string;
    description: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
  };
}

// Export default configuration
export const FORTUNE_I18N_CONFIG = {
  defaultLanguage: 'zh-CN' as FortuneLanguage,
  fallbackLanguage: 'zh-CN' as FortuneLanguage,
  supportedLanguages: getActiveFortuneLanguages(),
  plannedLanguages: getPlannedFortuneLanguages(),
  namespaces: ['fortune'],
  debug: process.env.NODE_ENV === 'development'
};