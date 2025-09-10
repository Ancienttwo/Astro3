// lib/config/app-config.ts - 统一应用配置中心
export type AppMode = 'web3' | 'web2' | 'unified';
export type SupportedLanguage = 'zh' | 'en' | 'ja' | 'ko' | 'es' | 'fr' | 'de' | 'pt';

interface AppConfig {
  // 核心模式配置
  mode: AppMode;
  
  // 语言支持配置
  supportedLanguages: SupportedLanguage[];
  defaultLanguage: SupportedLanguage;
  
  // 认证功能配置
  auth: {
    web2: {
      enabled: boolean;
      providers: ('email' | 'google' | 'facebook')[];
    };
    web3: {
      enabled: boolean;
      providers: ('metamask' | 'walletconnect' | 'coinbase')[];
    };
  };
  
  // 功能模块配置
  features: {
    chatbot: boolean;
    analysis: {
      bazi: boolean;
      ziwei: boolean;
      yijing: boolean; // 易经占卜
      liuyao: boolean; // 六爻占卜
      qianwen: boolean; // 签文解读 - Web2版本独有
    };
    subscription: boolean;
    referral: boolean;
    helpCenter: boolean;
  };
  
  // UI/UX配置
  ui: {
    theme: 'web3' | 'traditional' | 'universal';
    branding: {
      productName: string;
      tagline: string;
      colors: {
        primary: string;
        secondary: string;
      };
    };
    navigation: {
      showLanguageSwitcher: boolean;
      showAuthSwitcher: boolean;
    };
  };
  
  // 市场化配置
  localization: {
    currency: 'USD' | 'CNY' | 'EUR' | 'JPY';
    timezone: string;
    culturalAdaptation: boolean; // 是否进行文化适应
  };
}

// 预设配置模板
const CONFIG_TEMPLATES: Record<AppMode, Partial<AppConfig>> = {
  web3: {
    mode: 'web3',
    supportedLanguages: ['en'],
    defaultLanguage: 'en',
    auth: {
      web2: { enabled: false, providers: [] },
      web3: { enabled: true, providers: ['metamask', 'walletconnect'] }
    },
    features: {
      chatbot: true,
      analysis: {
        bazi: true,     // 八字分析 - 核心功能
        ziwei: true,    // 紫微斗数 - 核心功能
        yijing: false,  // 易经 - Web3版本不包含
        liuyao: false,  // 六爻 - Web3版本不包含
        qianwen: false  // 签文 - Web3版本不包含
      },
      subscription: true,
      referral: true,     // 邀请系统通用，两个版本都包含
      helpCenter: true    // Wiki知识库
    },
    ui: {
      theme: 'web3',
      branding: {
        productName: 'AstroZi Web3',
        tagline: 'Professional ZiWei Astrology & BaZi Natal'
      },
      navigation: {
        showLanguageSwitcher: false, // Web3版本只支持英文
        showAuthSwitcher: false
      }
    }
  },
  
  web2: {
    mode: 'web2',
    supportedLanguages: ['zh', 'en', 'ja', 'ko', 'es', 'fr'],
    defaultLanguage: 'zh',
    auth: {
      web2: { enabled: true, providers: ['email', 'google'] },
      web3: { enabled: false, providers: [] }
    },
    features: {
      chatbot: true,
      analysis: {
        bazi: true,        // 八字分析
        ziwei: true,       // 紫微斗数  
        yijing: true,      // 易经占卜 - Web2版本独有
        liuyao: true       // 六爻占卜 - Web2版本独有
      },
      subscription: true,
      referral: true,      // Web2版本包含推荐系统
      helpCenter: true     // 帮助中心和Wiki
    },
    ui: {
      theme: 'traditional',
      branding: {
        productName: 'AstroZi',
        tagline: 'Complete Traditional Astrology Platform'
      },
      navigation: {
        showLanguageSwitcher: true,
        showAuthSwitcher: false
      }
    },
    localization: {
      culturalAdaptation: true
    }
  },
  
  unified: {
    mode: 'unified',
    supportedLanguages: ['zh', 'en'], // 统一版本保持中英文支持
    defaultLanguage: 'zh',
    auth: {
      web2: { enabled: true, providers: ['email'] },
      web3: { enabled: true, providers: ['metamask', 'walletconnect'] }
    },
    ui: {
      theme: 'universal',
      navigation: {
        showLanguageSwitcher: true,
        showAuthSwitcher: true
      }
    }
  }
};

// 运行时配置生成
function createAppConfig(): AppConfig {
  const mode = (process.env.NEXT_PUBLIC_APP_MODE as AppMode) || 'unified';
  const template = CONFIG_TEMPLATES[mode];
  
  // 环境变量覆盖配置
  const envOverrides: Partial<AppConfig> = {
    supportedLanguages: process.env.NEXT_PUBLIC_SUPPORTED_LANGUAGES?.split(',') as SupportedLanguage[] || template.supportedLanguages,
    defaultLanguage: (process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE as SupportedLanguage) || template.defaultLanguage,
  };
  
  // 深度合并配置
  return {
    ...template,
    ...envOverrides,
    // 默认值
    features: {
      chatbot: true,
      analysis: {
        bazi: true,
        ziwei: true,
        yijing: mode === 'web2', // 仅Web2版本启用易经占卜
        liuyao: mode === 'web2'  // 仅Web2版本启用六爻占卜
      },
      subscription: true,
      referral: true,
      helpCenter: true,
      ...template.features
    },
    ui: {
      theme: template.ui?.theme || 'universal',
      branding: {
        productName: template.ui?.branding?.productName || 'AstroZi',
        tagline: template.ui?.branding?.tagline || 'Professional Astrology Platform',
        colors: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          ...template.ui?.branding?.colors
        }
      },
      navigation: {
        showLanguageSwitcher: true,
        showAuthSwitcher: mode === 'unified',
        ...template.ui?.navigation
      }
    },
    localization: {
      currency: 'USD',
      timezone: 'UTC',
      culturalAdaptation: mode === 'web2',
      ...template.localization
    }
  } as AppConfig;
}

// 导出全局配置实例
export const APP_CONFIG = createAppConfig();

// 配置验证函数
export function validateConfig(config: AppConfig): boolean {
  // 验证语言配置
  if (!config.supportedLanguages.includes(config.defaultLanguage)) {
    console.error('Default language not in supported languages');
    return false;
  }
  
  // 验证认证配置
  if (!config.auth.web2.enabled && !config.auth.web3.enabled) {
    console.error('At least one auth method must be enabled');
    return false;
  }
  
  return true;
}

// 导出工具函数
export function isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
  return APP_CONFIG.features[feature];
}

export function isAuthMethodEnabled(method: 'web2' | 'web3'): boolean {
  return APP_CONFIG.auth[method].enabled;
}

export function getSupportedLanguages(): SupportedLanguage[] {
  return APP_CONFIG.supportedLanguages;
}

export function getUITheme(): AppConfig['ui']['theme'] {
  return APP_CONFIG.ui.theme;
}