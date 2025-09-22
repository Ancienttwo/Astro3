// lib/config/deployment-config.ts - 多环境部署配置管理
import { AppMode, APP_CONFIG } from './app-config';

// 环境类型定义
export type DeploymentEnvironment = 'development' | 'staging' | 'production';
export type DeploymentTarget = 'web3' | 'web2' | 'unified';

interface DeploymentConfig {
  target: DeploymentTarget;
  mode: AppMode;
  environment: DeploymentEnvironment;
  domain: string;
  features: {
    analytics: boolean;
    monitoring: boolean;
    errorTracking: boolean;
    featureFlags: boolean;
  };
  auth: {
    crossDomainAuth: boolean;
    web2AuthDomain?: string; // Web3版本跨域到Web2认证
    web3AuthDomain?: string; // Web2版本跨域到Web3认证
  };
  integrations: {
    supabase: {
      url: string;
      anonKey: string;
    };
    stripe: {
      publishableKey: string;
      enableSubscription: boolean;
    };
    walletConnect: {
      projectId: string;
      enabled: boolean;
    };
  };
  seo: {
    siteName: string;
    description: string;
    keywords: string[];
    locale: string;
  };
}

// 部署目标配置模板
const DEPLOYMENT_TEMPLATES: Record<DeploymentTarget, Partial<DeploymentConfig>> = {
  'web3': {
    target: 'web3',
    mode: 'web3',
    domain: 'astrozi.ai',
    auth: {
      crossDomainAuth: true,
      web2AuthDomain: 'https://astrozi.app' // Web3用户传统登录跳转到Web2域名
    },
    seo: {
      siteName: 'AstroZi - Professional Web3 Astrology Platform',
      description: 'Professional blockchain-based astrology platform with Ziwei Doushu and BaZi analysis. Connect your wallet to start.',
      keywords: ['Web3', 'Blockchain', 'Astrology', 'Ziwei', 'BaZi', 'Professional', 'Decentralized'],
      locale: 'en-US'
    },
    integrations: {
      walletConnect: {
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
        enabled: true
      },
      stripe: {
        publishableKey: '',
        enableSubscription: false // Web3版本使用代币支付
      }
    }
  },


  'web2': {
    target: 'web2',
    mode: 'web2',
    domain: 'astrozi.app',
    auth: {
      crossDomainAuth: true,
      web3AuthDomain: 'https://astrozi.ai' // Web2用户可以跳转到Web3钱包登录
    },
    seo: {
      siteName: 'AstroZi Global - Your Astrology Guide',
      description: 'Professional astrology platform supporting multiple languages and cultural adaptations',
      keywords: ['Astrology', 'Horoscope', 'Tarot', 'Palmistry', 'Fortune'],
      locale: 'en-US'
    },
    integrations: {
      walletConnect: {
        projectId: '',
        enabled: false
      },
      stripe: {
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
        enableSubscription: true
      }
    }
  },

  'unified': {
    target: 'unified',
    mode: 'unified',
    domain: 'astrozi.com',
    auth: {
      crossDomainAuth: false // 统一版本不需要跨域认证
    },
    seo: {
      siteName: 'AstroZi - 专业命理平台',
      description: '专业的命理分析平台，支持传统登录和Web3钱包认证',
      keywords: ['命理', '占星', '紫微斗数', '八字', 'Web3'],
      locale: 'zh-CN'
    },
    integrations: {
      walletConnect: {
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
        enabled: true
      },
      stripe: {
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
        enableSubscription: true
      }
    }
  }
};

// 环境配置
const ENVIRONMENT_CONFIGS: Record<DeploymentEnvironment, Partial<DeploymentConfig>> = {
  development: {
    environment: 'development',
    features: {
      analytics: false,
      monitoring: false,
      errorTracking: false,
      featureFlags: true
    }
  },
  staging: {
    environment: 'staging',
    features: {
      analytics: true,
      monitoring: true,
      errorTracking: true,
      featureFlags: true
    }
  },
  production: {
    environment: 'production',
    features: {
      analytics: true,
      monitoring: true,
      errorTracking: true,
      featureFlags: false
    }
  }
};

// 创建部署配置
function createDeploymentConfig(): DeploymentConfig {
  const target = (process.env.NEXT_PUBLIC_DEPLOYMENT_TARGET as DeploymentTarget) || 'unified';
  const environment = (process.env.NODE_ENV === 'production' ? 'production' : 
                      process.env.VERCEL_ENV === 'preview' ? 'staging' : 'development') as DeploymentEnvironment;

  const targetTemplate = DEPLOYMENT_TEMPLATES[target];
  const envTemplate = ENVIRONMENT_CONFIGS[environment];

  // 基础配置合并
  const baseConfig: DeploymentConfig = {
    target,
    mode: targetTemplate.mode!,
    environment,
    domain: targetTemplate.domain!,
    features: {
      analytics: true,
      monitoring: true,
      errorTracking: true,
      featureFlags: true,
      ...envTemplate.features
    },
    auth: {
      crossDomainAuth: false,
      ...targetTemplate.auth
    },
    integrations: {
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      },
      stripe: {
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
        enableSubscription: true,
        ...targetTemplate.integrations?.stripe
      },
      walletConnect: {
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
        enabled: false,
        ...targetTemplate.integrations?.walletConnect
      }
    },
    seo: {
      siteName: 'AstroZi',
      description: 'Professional Astrology Platform',
      keywords: ['astrology'],
      locale: 'en-US',
      ...targetTemplate.seo
    }
  };

  return baseConfig;
}

// 导出配置实例
export const DEPLOYMENT_CONFIG = createDeploymentConfig();

// 工具函数
export function getDeploymentTarget(): DeploymentTarget {
  return DEPLOYMENT_CONFIG.target;
}

export function isProduction(): boolean {
  return DEPLOYMENT_CONFIG.environment === 'production';
}

export function isWeb3Mode(): boolean {
  return DEPLOYMENT_CONFIG.mode === 'web3';
}

export function isFeatureEnabled(feature: keyof DeploymentConfig['features']): boolean {
  return DEPLOYMENT_CONFIG.features[feature];
}

export function getIntegrationConfig<T extends keyof DeploymentConfig['integrations']>(
  integration: T
): DeploymentConfig['integrations'][T] {
  return DEPLOYMENT_CONFIG.integrations[integration];
}

// 跨域认证工具函数
export function getCrossDomainAuthUrl(authType: 'web2' | 'web3'): string | null {
  if (!DEPLOYMENT_CONFIG.auth.crossDomainAuth) {
    return null;
  }
  
  if (authType === 'web2' && DEPLOYMENT_CONFIG.auth.web2AuthDomain) {
    return `${DEPLOYMENT_CONFIG.auth.web2AuthDomain}/auth`;
  }
  
  if (authType === 'web3' && DEPLOYMENT_CONFIG.auth.web3AuthDomain) {
    return `${DEPLOYMENT_CONFIG.auth.web3AuthDomain}/login`;
  }
  
  return null;
}

export function isCrossDomainAuthEnabled(): boolean {
  return DEPLOYMENT_CONFIG.auth.crossDomainAuth;
}

// 部署验证
export function validateDeploymentConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 检查必需的环境变量
  if (!DEPLOYMENT_CONFIG.integrations.supabase.url) {
    errors.push('Missing NEXT_PUBLIC_SUPABASE_URL');
  }
  
  if (!DEPLOYMENT_CONFIG.integrations.supabase.anonKey) {
    errors.push('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  // Web3模式需要WalletConnect配置
  if (isWeb3Mode() && DEPLOYMENT_CONFIG.integrations.walletConnect.enabled) {
    if (!DEPLOYMENT_CONFIG.integrations.walletConnect.projectId) {
      errors.push('Web3 mode requires NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID');
    }
  }

  // 生产环境需要Stripe配置
  if (isProduction() && DEPLOYMENT_CONFIG.integrations.stripe.enableSubscription) {
    if (!DEPLOYMENT_CONFIG.integrations.stripe.publishableKey) {
      errors.push('Production requires NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// 环境变量模板生成器
export function generateEnvTemplate(target: DeploymentTarget): string {
  const template = DEPLOYMENT_TEMPLATES[target];
  
  return `# ${target.toUpperCase()} Environment Configuration
# Deployment
NEXT_PUBLIC_DEPLOYMENT_TARGET=${target}
NEXT_PUBLIC_APP_MODE=${template.mode}

# Domain
NEXT_PUBLIC_BASE_URL=https://${template.domain}

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (if needed)
${template.integrations?.stripe?.enableSubscription ? 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key' : '# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=not_needed'}

# WalletConnect (if needed)  
${template.integrations?.walletConnect?.enabled ? 'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id' : '# NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=not_needed'}

# Analytics & Monitoring
${isProduction() ? `NEXT_PUBLIC_GA_ID=your_ga_id
SENTRY_DSN=your_sentry_dsn` : '# Analytics disabled in development'}
`;
}
