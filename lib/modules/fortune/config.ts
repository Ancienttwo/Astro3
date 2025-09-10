// lib/modules/fortune/config.ts - Fortune Module Configuration
export interface FortuneModuleConfig {
  // API endpoints
  endpoints: {
    systems: string;
    slips: string;
    random: string;
    interpret: string;
  };
  
  // Feature flags
  features: {
    aiInterpretation: boolean;
    multiLanguage: boolean;
    qrCodeReferrals: boolean;
    templePartnership: boolean;
    authenticationRequired: boolean;
    tieredAccess: boolean;
  };

  // UI configuration
  ui: {
    theme: 'traditional' | 'modern' | 'minimal';
    showCulturalContext: boolean;
    showHistoricalStories: boolean;
    enableAnimations: boolean;
    customStyling: boolean;
  };

  // Language support
  languages: {
    default: string;
    supported: string[];
    rtl: string[];
  };

  // AI integration
  ai: {
    enabled: boolean;
    providers: {
      dify?: {
        baseUrl: string;
        apiKeys: {
          zh: string;
          en?: string;
          ja?: string;
        };
      };
      // Add other AI providers here
    };
  };

  // Authentication
  auth: {
    required: boolean;
    providers: ('email' | 'google' | 'web3')[];
    anonymousAccess: 'none' | 'basic' | 'limited';
  };

  // Branding
  branding: {
    moduleName: string;
    description: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    logo?: string;
    customCSS?: string;
  };
}

// Default configuration
export const DEFAULT_FORTUNE_CONFIG: FortuneModuleConfig = {
  endpoints: {
    systems: '/api/fortune/systems',
    slips: '/api/fortune/slips',
    random: '/api/fortune/random',
    interpret: '/api/fortune/interpret'
  },
  
  features: {
    aiInterpretation: true,
    multiLanguage: true,
    qrCodeReferrals: true,
    templePartnership: true,
    authenticationRequired: false,
    tieredAccess: true
  },

  ui: {
    theme: 'traditional',
    showCulturalContext: true,
    showHistoricalStories: true,
    enableAnimations: true,
    customStyling: true
  },

  languages: {
    default: 'zh',
    supported: ['zh', 'en', 'ja'],
    rtl: []
  },

  ai: {
    enabled: true,
    providers: {
      dify: {
        baseUrl: process.env.DIFY_BASE_URL || 'https://api.dify.ai/v1',
        apiKeys: {
          zh: process.env.DIFY_FORTUNE_MASTER_KEY || '',
          en: process.env.DIFY_FORTUNE_MASTER_EN_KEY || '',
          ja: process.env.DIFY_FORTUNE_MASTER_JA_KEY || ''
        }
      }
    }
  },

  auth: {
    required: false,
    providers: ['email', 'google', 'web3'],
    anonymousAccess: 'basic'
  },

  branding: {
    moduleName: '解签系统',
    description: 'AI驱动的多庙宇解签平台',
    colors: {
      primary: '#8b0000',
      secondary: '#ffd700',
      accent: '#d4af37'
    }
  }
};

// Environment-specific configurations
export const FORTUNE_CONFIGS = {
  development: {
    ...DEFAULT_FORTUNE_CONFIG,
    features: {
      ...DEFAULT_FORTUNE_CONFIG.features,
      // Enable all features in development
    }
  },
  
  production: {
    ...DEFAULT_FORTUNE_CONFIG,
    ui: {
      ...DEFAULT_FORTUNE_CONFIG.ui,
      enableAnimations: false // Disable animations in production for performance
    }
  },
  
  // Configuration for different deployment targets
  'web3-landing': {
    ...DEFAULT_FORTUNE_CONFIG,
    auth: {
      required: false,
      providers: ['web3'],
      anonymousAccess: 'basic'
    },
    branding: {
      ...DEFAULT_FORTUNE_CONFIG.branding,
      moduleName: 'Fortune Oracle',
      description: 'Blockchain-powered Fortune Divination',
      colors: {
        primary: '#1a1b23',
        secondary: '#f7931a',
        accent: '#00d4aa'
      }
    }
  },
  
  'web2-global': {
    ...DEFAULT_FORTUNE_CONFIG,
    languages: {
      default: 'en',
      supported: ['en', 'zh', 'ja'],
      rtl: []
    },
    branding: {
      ...DEFAULT_FORTUNE_CONFIG.branding,
      moduleName: 'Fortune Reading',
      description: 'Traditional Fortune Divination Platform'
    }
  },
  
  'unified-main': {
    ...DEFAULT_FORTUNE_CONFIG,
    // Full featured configuration
  }
} as const;

// Get configuration based on environment and deployment target
export function getFortuneConfig(): FortuneModuleConfig {
  const env = process.env.NODE_ENV || 'development';
  const deploymentTarget = process.env.NEXT_PUBLIC_DEPLOYMENT_TARGET || 'unified-main';
  
  const envConfig = FORTUNE_CONFIGS[env as keyof typeof FORTUNE_CONFIGS];
  const targetConfig = FORTUNE_CONFIGS[deploymentTarget as keyof typeof FORTUNE_CONFIGS];
  
  return {
    ...DEFAULT_FORTUNE_CONFIG,
    ...envConfig,
    ...targetConfig
  };
}

// Utility function to check if a feature is enabled
export function isFortuneFeatureEnabled(feature: keyof FortuneModuleConfig['features']): boolean {
  const config = getFortuneConfig();
  return config.features[feature];
}

// Utility function to get module branding
export function getFortuneBranding() {
  const config = getFortuneConfig();
  return config.branding;
}

// Utility function to get supported languages
export function getFortuneLanguages() {
  const config = getFortuneConfig();
  return config.languages;
}