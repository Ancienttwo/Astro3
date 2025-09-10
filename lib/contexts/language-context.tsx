"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// 支持的语言类型
export type SupportedLanguage = 'zh-CN' | 'zh-TW' | 'en-US';

// 语言配置接口
export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  enabled: boolean;
  isRTL: boolean;
}

// 语言状态接口
export interface LanguageState {
  currentLanguage: SupportedLanguage;
  availableLanguages: LanguageConfig[];
  isLoading: boolean;
  error: string | null;
  detectionSource: 'default' | 'url' | 'cookie' | 'header' | 'user';
  translations: Record<string, string>;
}

// 语言操作类型
export type LanguageAction =
  | { type: 'SET_LANGUAGE'; payload: { language: SupportedLanguage; source: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TRANSLATIONS'; payload: Record<string, string> }
  | { type: 'ADD_LANGUAGE'; payload: LanguageConfig }
  | { type: 'REMOVE_LANGUAGE'; payload: SupportedLanguage };

// 语言上下文类型
export interface LanguageContextType {
  state: LanguageState;
  changeLanguage: (language: SupportedLanguage) => Promise<void>;
  translate: (key: string, fallback?: string) => string;
  getCurrentLanguageConfig: () => LanguageConfig | undefined;
  isLanguageSupported: (language: string) => boolean;
  getLanguageDirection: () => 'ltr' | 'rtl';
}

// 默认支持的语言
const DEFAULT_LANGUAGES: LanguageConfig[] = [
  {
    code: 'zh-CN',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    flag: '🇨🇳',
    enabled: true,
    isRTL: false
  },
  {
    code: 'zh-TW',
    name: 'Chinese (Traditional)',
    nativeName: '繁體中文',
    flag: '🇹🇼',
    enabled: true,
    isRTL: false
  },
  {
    code: 'en-US',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    enabled: true,
    isRTL: false
  }
];

// 初始状态
const initialState: LanguageState = {
  currentLanguage: 'zh-CN',
  availableLanguages: DEFAULT_LANGUAGES,
  isLoading: false,
  error: null,
  detectionSource: 'default',
  translations: {}
};

// 状态归约器
function languageReducer(state: LanguageState, action: LanguageAction): LanguageState {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return {
        ...state,
        currentLanguage: action.payload.language,
        detectionSource: action.payload.source as any,
        error: null
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    case 'SET_TRANSLATIONS':
      return {
        ...state,
        translations: { ...state.translations, ...action.payload }
      };
    
    case 'ADD_LANGUAGE':
      return {
        ...state,
        availableLanguages: [...state.availableLanguages, action.payload]
      };
    
    case 'REMOVE_LANGUAGE':
      return {
        ...state,
        availableLanguages: state.availableLanguages.filter(
          lang => lang.code !== action.payload
        )
      };
    
    default:
      return state;
  }
}

// 创建上下文
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 工具函数：从Cookie获取语言偏好
function getLanguageFromCookie(): SupportedLanguage | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const langCookie = cookies.find(cookie => 
    cookie.trim().startsWith('preferred-language=')
  );
  
  if (langCookie) {
    const language = langCookie.split('=')[1];
    const supportedLanguages: SupportedLanguage[] = ['zh-CN', 'zh-TW', 'en-US'];
    return supportedLanguages.includes(language as SupportedLanguage) 
      ? language as SupportedLanguage 
      : null;
  }
  
  return null;
}

// 工具函数：从浏览器头检测语言
function detectBrowserLanguage(): SupportedLanguage {
  if (typeof navigator === 'undefined') return 'zh-CN';
  
  const browserLang = navigator.language || navigator.languages?.[0] || 'zh-CN';
  
  // 简单的语言映射
  if (browserLang.startsWith('zh-TW') || browserLang.startsWith('zh-Hant')) {
    return 'zh-TW';
  } else if (browserLang.startsWith('en')) {
    return 'en-US';
  } else {
    return 'zh-CN';
  }
}

// 工具函数：加载语言翻译
async function loadTranslations(language: SupportedLanguage): Promise<Record<string, string>> {
  try {
    // 尝试从API获取翻译
    const response = await fetch(`/api/translations?language=${language}`);
    if (response.ok) {
      const data = await response.json();
      return data.translations || {};
    }
  } catch (error) {
    console.warn('Failed to load translations from API:', error);
  }
  
  // 回退到本地翻译
  const localTranslations: Record<SupportedLanguage, Record<string, string>> = {
    'zh-CN': {
      'fortune.draw': '摇签',
      'fortune.interpret': 'AI解读',
      'fortune.random': '随机签文',
      'language.switch': '切换语言',
      'language.loading': '切换中...',
      'error.network': '网络错误，请重试',
      'error.general': '出现错误'
    },
    'zh-TW': {
      'fortune.draw': '搖籤',
      'fortune.interpret': 'AI解讀',
      'fortune.random': '隨機籤文',
      'language.switch': '切換語言',
      'language.loading': '切換中...',
      'error.network': '網絡錯誤，請重試',
      'error.general': '出現錯誤'
    },
    'en-US': {
      'fortune.draw': 'Draw Fortune',
      'fortune.interpret': 'AI Interpretation',
      'fortune.random': 'Random Fortune',
      'language.switch': 'Switch Language',
      'language.loading': 'Switching...',
      'error.network': 'Network error, please retry',
      'error.general': 'An error occurred'
    }
  };
  
  return localTranslations[language] || {};
}

// 语言提供者组件属性
export interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: SupportedLanguage;
  enableURLSync?: boolean;
  enableAutoDetection?: boolean;
}

/**
 * 语言上下文提供者组件
 */
export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  defaultLanguage = 'zh-CN',
  enableURLSync = true,
  enableAutoDetection = true
}) => {
  const [state, dispatch] = useReducer(languageReducer, {
    ...initialState,
    currentLanguage: defaultLanguage
  });
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 初始化语言检测
  useEffect(() => {
    let detectedLanguage: SupportedLanguage = defaultLanguage;
    let source = 'default';

    if (enableAutoDetection) {
      // 1. 优先从URL参数检测
      const urlLang = searchParams.get('language') || searchParams.get('lang');
      if (urlLang && ['zh-CN', 'zh-TW', 'en-US'].includes(urlLang)) {
        detectedLanguage = urlLang as SupportedLanguage;
        source = 'url';
      } else {
        // 2. 从Cookie检测
        const cookieLang = getLanguageFromCookie();
        if (cookieLang) {
          detectedLanguage = cookieLang;
          source = 'cookie';
        } else {
          // 3. 从浏览器头检测
          detectedLanguage = detectBrowserLanguage();
          source = 'header';
        }
      }
    }

    // 设置检测到的语言
    dispatch({ 
      type: 'SET_LANGUAGE', 
      payload: { language: detectedLanguage, source } 
    });

    // 加载翻译
    loadTranslations(detectedLanguage).then(translations => {
      dispatch({ type: 'SET_TRANSLATIONS', payload: translations });
    });
  }, [defaultLanguage, enableAutoDetection, searchParams]);

  // 语言切换函数
  const changeLanguage = async (newLanguage: SupportedLanguage): Promise<void> => {
    if (newLanguage === state.currentLanguage) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // 设置Cookie
      document.cookie = `preferred-language=${newLanguage}; path=/; max-age=${30 * 24 * 60 * 60}; samesite=lax`;
      
      // 加载新语言的翻译
      const translations = await loadTranslations(newLanguage);
      
      // 更新状态
      dispatch({ 
        type: 'SET_LANGUAGE', 
        payload: { language: newLanguage, source: 'user' } 
      });
      dispatch({ type: 'SET_TRANSLATIONS', payload: translations });
      
      // 同步URL（如果启用）
      if (enableURLSync) {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set('language', newLanguage);
        router.push(`${pathname}?${newSearchParams.toString()}`);
      }
      
      // 触发页面重新渲染以应用新语言
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('languagechange', {
          detail: { language: newLanguage }
        }));
      }
      
    } catch (error) {
      console.error('Language change failed:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Failed to change language' 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 翻译函数
  const translate = (key: string, fallback?: string): string => {
    return state.translations[key] || fallback || key;
  };

  // 获取当前语言配置
  const getCurrentLanguageConfig = (): LanguageConfig | undefined => {
    return state.availableLanguages.find(lang => lang.code === state.currentLanguage);
  };

  // 检查语言是否支持
  const isLanguageSupported = (language: string): boolean => {
    return state.availableLanguages.some(lang => lang.code === language && lang.enabled);
  };

  // 获取当前语言方向
  const getLanguageDirection = (): 'ltr' | 'rtl' => {
    const config = getCurrentLanguageConfig();
    return config?.isRTL ? 'rtl' : 'ltr';
  };

  const contextValue: LanguageContextType = {
    state,
    changeLanguage,
    translate,
    getCurrentLanguageConfig,
    isLanguageSupported,
    getLanguageDirection
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * 使用语言上下文的Hook
 */
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

/**
 * 快捷翻译Hook
 */
export const useTranslation = () => {
  const { translate, state } = useLanguage();
  return {
    t: translate,
    language: state.currentLanguage,
    isLoading: state.isLoading
  };
};

export default LanguageProvider;