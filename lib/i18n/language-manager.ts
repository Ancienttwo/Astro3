// 多语言管理系统
// 创建日期: 2025-01-31
// 功能: 语言切换、翻译管理、本地化支持

import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 支持的语言类型
export type SupportedLanguage = 'zh-CN' | 'zh-TW' | 'en-US';

// 语言配置接口
export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  dateFormat: string;
  numberFormat: string;
}

// 语言配置数据
export const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  'zh-CN': {
    code: 'zh-CN',
    name: 'Simplified Chinese',
    nativeName: '简体中文',
    flag: '🇨🇳',
    rtl: false,
    dateFormat: 'YYYY年MM月DD日',
    numberFormat: 'zh-CN'
  },
  'zh-TW': {
    code: 'zh-TW',
    name: 'Traditional Chinese',
    nativeName: '繁體中文',
    flag: '🇹🇼',
    rtl: false,
    dateFormat: 'YYYY年MM月DD日',
    numberFormat: 'zh-TW'
  },
  'en-US': {
    code: 'en-US',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
    dateFormat: 'MMM DD, YYYY',
    numberFormat: 'en-US'
  }
};

// UI翻译接口
export interface UITranslations {
  // 通用UI文本
  common: {
    loading: string;
    error: string;
    retry: string;
    confirm: string;
    cancel: string;
    back: string;
    next: string;
    submit: string;
    close: string;
  };
  
  // 导航相关
  navigation: {
    home: string;
    menu: string;
    language: string;
    settings: string;
  };
  
  // 签文相关
  fortune: {
    title: string;
    drawFortune: string;
    drawingFortune: string;
    fortuneResult: string;
    interpretation: string;
    categories: string;
    historicalContext: string;
    symbolism: string;
    drawAgain: string;
    manualQuery: string;
    slipNumber: string;
    enterSlipNumber: string;
    query: string;
    querying: string;
  };
  
  // AI解读相关
  ai: {
    aiInterpretation: string;
    basicInterpretation: string;
    personalizedInterpretation: string;
    deepInterpretation: string;
    analyzing: string;
    masterAnalyzing: string;
    generateInterpretation: string;
    enterPersonalInfo: string;
    name: string;
    age: string;
    question: string;
    loginRequired: string;
    creditsRequired: string;
    dailyLimitExceeded: string;
  };
  
  // 表单相关
  form: {
    required: string;
    invalidInput: string;
    submitSuccess: string;
    submitError: string;
  };
  
  // 关帝庙特定
  guandi: {
    templeName: string;
    devotionalMeditation: string;
    meditationInstructions: string;
    prayerTemplate: string;
    drawingInstructions: string;
    fortuneLevels: {
      excellent: string;
      good: string;
      average: string;
      caution: string;
      warning: string;
    };
  };
}

// UI翻译数据
const UI_TRANSLATIONS: Record<SupportedLanguage, UITranslations> = {
  'zh-CN': {
    common: {
      loading: '加载中...',
      error: '出错了',
      retry: '重试',
      confirm: '确认',
      cancel: '取消',
      back: '返回',
      next: '下一步',
      submit: '提交',
      close: '关闭'
    },
    navigation: {
      home: '首页',
      menu: '菜单',
      language: '语言',
      settings: '设置'
    },
    fortune: {
      title: '灵签',
      drawFortune: '摇签求解',
      drawingFortune: '摇签中...',
      fortuneResult: '签文结果',
      interpretation: '解签',
      categories: '适用范围',
      historicalContext: '典故',
      symbolism: '象征',
      drawAgain: '重新求签',
      manualQuery: '手动查签',
      slipNumber: '签号',
      enterSlipNumber: '请输入签号',
      query: '查询',
      querying: '查询中...'
    },
    ai: {
      aiInterpretation: 'AI大师解读',
      basicInterpretation: '基础解读',
      personalizedInterpretation: '个性化解读',
      deepInterpretation: '深度解读',
      analyzing: '分析中...',
      masterAnalyzing: 'AI大师正在解读中...',
      generateInterpretation: '生成解读',
      enterPersonalInfo: '输入个人信息',
      name: '姓名',
      age: '年龄',
      question: '所求之事',
      loginRequired: '需要登录',
      creditsRequired: '需要积分',
      dailyLimitExceeded: '今日次数已用完'
    },
    form: {
      required: '必填项',
      invalidInput: '输入无效',
      submitSuccess: '提交成功',
      submitError: '提交失败'
    },
    guandi: {
      templeName: '关圣帝君灵签',
      devotionalMeditation: '诚心默念',
      meditationInstructions: '请在心中默念您的姓名、年龄、所求之事，诚心祈求关圣帝君指点迷津',
      prayerTemplate: '弟子（姓名）诚心祈求关圣帝君，今年（年龄）岁，恳请帝君指点所求之事...',
      drawingInstructions: '请先在心中诚心默念祈求词，再进行摇签',
      fortuneLevels: {
        excellent: '大吉',
        good: '中吉',
        average: '平',
        caution: '小凶',
        warning: '大凶'
      }
    }
  },
  
  'zh-TW': {
    common: {
      loading: '載入中...',
      error: '出錯了',
      retry: '重試',
      confirm: '確認',
      cancel: '取消',
      back: '返回',
      next: '下一步',
      submit: '提交',
      close: '關閉'
    },
    navigation: {
      home: '首頁',
      menu: '菜單',
      language: '語言',
      settings: '設定'
    },
    fortune: {
      title: '靈籤',
      drawFortune: '搖籤求解',
      drawingFortune: '搖籤中...',
      fortuneResult: '籤文結果',
      interpretation: '解籤',
      categories: '適用範圍',
      historicalContext: '典故',
      symbolism: '象徵',
      drawAgain: '重新求籤',
      manualQuery: '手動查籤',
      slipNumber: '籤號',
      enterSlipNumber: '請輸入籤號',
      query: '查詢',
      querying: '查詢中...'
    },
    ai: {
      aiInterpretation: 'AI大師解讀',
      basicInterpretation: '基礎解讀',
      personalizedInterpretation: '個性化解讀',
      deepInterpretation: '深度解讀',
      analyzing: '分析中...',
      masterAnalyzing: 'AI大師正在解讀中...',
      generateInterpretation: '生成解讀',
      enterPersonalInfo: '輸入個人資訊',
      name: '姓名',
      age: '年齡',
      question: '所求之事',
      loginRequired: '需要登入',
      creditsRequired: '需要積分',
      dailyLimitExceeded: '今日次數已用完'
    },
    form: {
      required: '必填項',
      invalidInput: '輸入無效',
      submitSuccess: '提交成功',
      submitError: '提交失敗'
    },
    guandi: {
      templeName: '關聖帝君靈籤',
      devotionalMeditation: '誠心默念',
      meditationInstructions: '請在心中默念您的姓名、年齡、所求之事，誠心祈求關聖帝君指點迷津',
      prayerTemplate: '弟子（姓名）誠心祈求關聖帝君，今年（年齡）歲，懇請帝君指點所求之事...',
      drawingInstructions: '請先在心中誠心默念祈求詞，再進行搖籤',
      fortuneLevels: {
        excellent: '大吉',
        good: '中吉',
        average: '平',
        caution: '小凶',
        warning: '大凶'
      }
    }
  },
  
  'en-US': {
    common: {
      loading: 'Loading...',
      error: 'Error occurred',
      retry: 'Retry',
      confirm: 'Confirm',
      cancel: 'Cancel',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      close: 'Close'
    },
    navigation: {
      home: 'Home',
      menu: 'Menu',
      language: 'Language',
      settings: 'Settings'
    },
    fortune: {
      title: 'Oracle',
      drawFortune: 'Draw Fortune',
      drawingFortune: 'Drawing...',
      fortuneResult: 'Oracle Result',
      interpretation: 'Interpretation',
      categories: 'Categories',
      historicalContext: 'Historical Context',
      symbolism: 'Symbolism',
      drawAgain: 'Draw Again',
      manualQuery: 'Manual Query',
      slipNumber: 'Slip Number',
      enterSlipNumber: 'Enter slip number',
      query: 'Query',
      querying: 'Querying...'
    },
    ai: {
      aiInterpretation: 'AI Master Interpretation',
      basicInterpretation: 'Basic Interpretation',
      personalizedInterpretation: 'Personalized Interpretation',
      deepInterpretation: 'Deep Interpretation',
      analyzing: 'Analyzing...',
      masterAnalyzing: 'AI Master is interpreting...',
      generateInterpretation: 'Generate Interpretation',
      enterPersonalInfo: 'Enter Personal Information',
      name: 'Name',
      age: 'Age',
      question: 'Your Question',
      loginRequired: 'Login Required',
      creditsRequired: 'Credits Required',
      dailyLimitExceeded: 'Daily limit exceeded'
    },
    form: {
      required: 'Required',
      invalidInput: 'Invalid input',
      submitSuccess: 'Submit successful',
      submitError: 'Submit failed'
    },
    guandi: {
      templeName: 'Guandi Oracle',
      devotionalMeditation: 'Devotional Meditation',
      meditationInstructions: 'Please silently recite your name, age, and your question in your heart, and sincerely pray to Lord Guandi for guidance.',
      prayerTemplate: 'Disciple (Your Name) sincerely prays to Lord Guandi, (Your Age) years old this year, humbly requesting guidance on my question...',
      drawingInstructions: 'Please first silently recite the prayer in your heart, then draw the oracle.',
      fortuneLevels: {
        excellent: 'Excellent',
        good: 'Good',
        average: 'Average',
        caution: 'Caution',
        warning: 'Warning'
      }
    }
  }
};

// 语言状态管理
interface LanguageState {
  currentLanguage: SupportedLanguage;
  isLoading: boolean;
  error: string | null;
  urlSyncEnabled: boolean;
  
  // Actions
  setLanguage: (language: SupportedLanguage) => void;
  getTranslations: () => UITranslations;
  getLanguageConfig: () => LanguageConfig;
  detectUserLanguage: () => SupportedLanguage;
  formatDate: (date: Date) => string;
  formatNumber: (number: number) => string;
  
  // URL sync methods
  enableUrlSync: () => void;
  disableUrlSync: () => void;
  getLanguageFromUrl: () => SupportedLanguage | null;
  updateUrlLanguage: (language: SupportedLanguage) => void;
}

// URL参数处理工具函数
const getUrlParams = () => {
  if (typeof window === 'undefined') return new URLSearchParams();
  return new URLSearchParams(window.location.search);
};

const updateUrlParams = (language: SupportedLanguage) => {
  if (typeof window === 'undefined') return;
  
  const url = new URL(window.location.href);
  url.searchParams.set('lang', language);
  
  // 使用 replaceState 避免添加历史记录
  window.history.replaceState({}, '', url.toString());
};

// Zustand store with persistence
export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: 'zh-TW',
      isLoading: false,
      error: null,
      urlSyncEnabled: false,

      setLanguage: (language: SupportedLanguage) => {
        const { urlSyncEnabled } = get();
        
        set({ 
          currentLanguage: language, 
          error: null 
        });
        
        // 更新HTML lang属性
        if (typeof document !== 'undefined') {
          document.documentElement.lang = language;
          document.documentElement.dir = LANGUAGE_CONFIGS[language].rtl ? 'rtl' : 'ltr';
        }
        
        // 如果启用了URL同步，更新URL参数
        if (urlSyncEnabled) {
          updateUrlParams(language);
        }
        
        // 触发自定义事件通知其他组件
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('languageChange', { 
            detail: { language } 
          }));
        }
      },

      getTranslations: () => {
        const { currentLanguage } = get();
        return UI_TRANSLATIONS[currentLanguage];
      },

      getLanguageConfig: () => {
        const { currentLanguage } = get();
        return LANGUAGE_CONFIGS[currentLanguage];
      },

      detectUserLanguage: (): SupportedLanguage => {
        if (typeof navigator === 'undefined') return 'zh-CN';
        
        const browserLanguage = navigator.language || navigator.languages?.[0];
        
        // 匹配逻辑
        if (browserLanguage?.startsWith('zh')) {
          // 检查是否为繁体中文
          if (browserLanguage.includes('TW') || 
              browserLanguage.includes('HK') || 
              browserLanguage.includes('MO')) {
            return 'zh-TW';
          }
          return 'zh-CN';
        }
        
        if (browserLanguage?.startsWith('en')) {
          return 'en-US';
        }
        
        return 'zh-TW'; // 默认值
      },

      formatDate: (date: Date) => {
        const { currentLanguage } = get();
        const config = LANGUAGE_CONFIGS[currentLanguage];
        
        return new Intl.DateTimeFormat(config.numberFormat, {
          year: 'numeric',
          month: currentLanguage.startsWith('zh') ? 'numeric' : 'short',
          day: 'numeric'
        }).format(date);
      },

      formatNumber: (number: number) => {
        const { currentLanguage } = get();
        const config = LANGUAGE_CONFIGS[currentLanguage];
        
        return new Intl.NumberFormat(config.numberFormat).format(number);
      },

      // URL同步控制
      enableUrlSync: () => {
        set({ urlSyncEnabled: true });
      },

      disableUrlSync: () => {
        set({ urlSyncEnabled: false });
      },

      // 从URL获取语言参数
      getLanguageFromUrl: (): SupportedLanguage | null => {
        const params = getUrlParams();
        const langParam = params.get('lang');
        
        if (langParam && isValidLanguage(langParam)) {
          return langParam as SupportedLanguage;
        }
        
        return null;
      },

      // 更新URL语言参数
      updateUrlLanguage: (language: SupportedLanguage) => {
        updateUrlParams(language);
      }
    }),
    {
      name: 'language-storage',
      partialize: (state) => ({ 
        currentLanguage: state.currentLanguage 
      })
    }
  )
);

// Hook for easy access to translations
export function useTranslations() {
  const currentLanguage = useLanguageStore((state) => state.currentLanguage);
  const translations = UI_TRANSLATIONS[currentLanguage];
  return { 
    t: translations, 
    currentLanguage,
    isRTL: LANGUAGE_CONFIGS[currentLanguage].rtl
  };
}

// Hook for language configuration
export function useLanguageConfig() {
  const { getLanguageConfig, currentLanguage } = useLanguageStore();
  return { 
    config: getLanguageConfig(), 
    currentLanguage 
  };
}

// Utility function to get supported languages list
export function getSupportedLanguages(): LanguageConfig[] {
  return Object.values(LANGUAGE_CONFIGS);
}

// Utility function to validate language code
export function isValidLanguage(code: string): code is SupportedLanguage {
  return Object.keys(LANGUAGE_CONFIGS).includes(code);
}

// Initialize language detection on app start
export function initializeLanguage() {
  const store = useLanguageStore.getState();
  
  // 只在没有存储语言时进行检测
  if (store.currentLanguage === 'zh-TW') {
    const detectedLanguage = store.detectUserLanguage();
    if (detectedLanguage !== 'zh-TW') {
      store.setLanguage(detectedLanguage);
    }
  }
}

// Initialize language with URL sync for hybrid architecture
export function initializeLanguageWithUrl() {
  const store = useLanguageStore.getState();
  
  // 启用URL同步
  store.enableUrlSync();
  
  // 检查URL参数
  const urlLanguage = store.getLanguageFromUrl();
  
  if (urlLanguage) {
    // URL参数优先级最高
    if (urlLanguage !== store.currentLanguage) {
      store.setLanguage(urlLanguage);
    }
  } else {
    // 没有URL参数时，检查是否需要浏览器语言检测
    if (store.currentLanguage === 'zh-TW') {
      const detectedLanguage = store.detectUserLanguage();
      if (detectedLanguage !== 'zh-TW') {
        store.setLanguage(detectedLanguage);
      }
    }
    
    // 将当前语言同步到URL
    store.updateUrlLanguage(store.currentLanguage);
  }
}

// React Hook for URL-synced language management
export function useUrlLanguage() {
  const { 
    currentLanguage, 
    setLanguage, 
    getLanguageFromUrl, 
    updateUrlLanguage, 
    enableUrlSync, 
    disableUrlSync 
  } = useLanguageStore();
  
  // 监听URL变化
  React.useEffect(() => {
    const handleUrlChange = () => {
      const urlLanguage = getLanguageFromUrl();
      if (urlLanguage && urlLanguage !== currentLanguage) {
        setLanguage(urlLanguage);
      }
    };
    
    // 监听浏览器前进后退
    window.addEventListener('popstate', handleUrlChange);
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [currentLanguage, getLanguageFromUrl, setLanguage]);
  
  return {
    currentLanguage,
    setLanguage: (language: SupportedLanguage) => {
      setLanguage(language);
      updateUrlLanguage(language);
    },
    enableUrlSync,
    disableUrlSync
  };
}

// Export everything needed
export {
  UI_TRANSLATIONS,
  type UITranslations,
  type LanguageState
};