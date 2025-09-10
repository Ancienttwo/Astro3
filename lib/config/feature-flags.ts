// lib/config/feature-flags.ts - 功能开关和特性管理
import React from 'react';
import { APP_CONFIG } from './app-config';
import { DEPLOYMENT_CONFIG, isProduction } from './deployment-config';

// 功能标识类型
export type FeatureFlagKey = 
  | 'web3-auth'
  | 'web2-auth'
  | 'chatbot'
  | 'bazi-analysis'
  | 'ziwei-analysis'
  | 'yijing-divination'
  | 'liuyao-divination'
  | 'subscription'
  | 'referral-system'
  | 'help-center'
  | 'dark-mode'
  | 'multi-language'
  | 'analytics'
  | 'error-tracking'
  | 'feature-flags'
  | 'admin-panel'
  | 'beta-features';

// 功能配置接口
interface FeatureFlag {
  key: FeatureFlagKey;
  enabled: boolean;
  rolloutPercentage?: number; // 灰度发布百分比
  targetUsers?: string[]; // 目标用户ID列表
  environments?: ('development' | 'staging' | 'production')[]; // 支持的环境
  dependencies?: FeatureFlagKey[]; // 依赖的其他功能
  description: string;
}

// 基础功能配置
const BASE_FEATURES: FeatureFlag[] = [
  {
    key: 'web3-auth',
    enabled: APP_CONFIG.auth.web3.enabled,
    environments: ['development', 'staging', 'production'],
    description: 'Web3钱包认证功能'
  },
  {
    key: 'web2-auth',
    enabled: APP_CONFIG.auth.web2.enabled,
    environments: ['development', 'staging', 'production'],
    description: '传统邮箱/社交登录认证'
  },
  {
    key: 'chatbot',
    enabled: APP_CONFIG.features.chatbot,
    environments: ['development', 'staging', 'production'],
    description: 'AI聊天机器人功能'
  },
  {
    key: 'bazi-analysis',
    enabled: APP_CONFIG.features.analysis.bazi,
    environments: ['development', 'staging', 'production'],
    description: '八字分析功能'
  },
  {
    key: 'ziwei-analysis',
    enabled: APP_CONFIG.features.analysis.ziwei,
    environments: ['development', 'staging', 'production'],
    description: '紫微斗数分析功能'
  },
  {
    key: 'yijing-divination',
    enabled: APP_CONFIG.features.analysis.yijing,
    environments: ['development', 'staging', 'production'],
    description: '易经占卜功能（仅Web2版本）'
  },
  {
    key: 'liuyao-divination',
    enabled: APP_CONFIG.features.analysis.liuyao,
    environments: ['development', 'staging', 'production'],
    description: '六爻占卜功能（仅Web2版本）'
  },
  {
    key: 'subscription',
    enabled: APP_CONFIG.features.subscription,
    environments: ['staging', 'production'],
    description: '订阅付费功能'
  },
  {
    key: 'referral-system',
    enabled: APP_CONFIG.features.referral,
    environments: ['staging', 'production'],
    description: '推荐奖励系统'
  },
  {
    key: 'help-center',
    enabled: APP_CONFIG.features.helpCenter,
    environments: ['development', 'staging', 'production'],
    description: '帮助中心功能'
  },
  {
    key: 'dark-mode',
    enabled: true,
    environments: ['development', 'staging', 'production'],
    description: '深色模式主题'
  },
  {
    key: 'multi-language',
    enabled: APP_CONFIG.supportedLanguages.length > 1,
    environments: ['development', 'staging', 'production'],
    description: '多语言支持'
  },
  {
    key: 'analytics',
    enabled: DEPLOYMENT_CONFIG.features.analytics,
    environments: ['staging', 'production'],
    description: '用户行为分析'
  },
  {
    key: 'error-tracking',
    enabled: DEPLOYMENT_CONFIG.features.errorTracking,
    environments: ['staging', 'production'],
    description: '错误追踪和监控'
  },
  {
    key: 'feature-flags',
    enabled: DEPLOYMENT_CONFIG.features.featureFlags,
    environments: ['development', 'staging'],
    description: '功能开关管理'
  },
  {
    key: 'admin-panel',
    enabled: !isProduction(),
    targetUsers: process.env.ADMIN_USER_IDS?.split(',') || [],
    environments: ['development', 'staging'],
    description: '管理员控制面板'
  },
  {
    key: 'beta-features',
    enabled: !isProduction(),
    rolloutPercentage: 10, // 仅对10%用户开启
    environments: ['development', 'staging'],
    description: '测试版功能'
  }
];

// 功能管理器类
class FeatureFlagManager {
  private features: Map<FeatureFlagKey, FeatureFlag>;
  private userContext: { id?: string; email?: string; role?: string } = {};

  constructor(features: FeatureFlag[]) {
    this.features = new Map(features.map(f => [f.key, f]));
  }

  // 设置用户上下文
  setUserContext(context: { id?: string; email?: string; role?: string }) {
    this.userContext = context;
  }

  // 检查功能是否启用
  isEnabled(key: FeatureFlagKey): boolean {
    const feature = this.features.get(key);
    if (!feature) return false;

    // 检查环境支持
    if (feature.environments && !feature.environments.includes(DEPLOYMENT_CONFIG.environment)) {
      return false;
    }

    // 基础开关检查
    if (!feature.enabled) return false;

    // 检查依赖功能
    if (feature.dependencies) {
      const allDependenciesMet = feature.dependencies.every(dep => this.isEnabled(dep));
      if (!allDependenciesMet) return false;
    }

    // 检查目标用户
    if (feature.targetUsers && feature.targetUsers.length > 0) {
      if (!this.userContext.id || !feature.targetUsers.includes(this.userContext.id)) {
        return false;
      }
    }

    // 检查灰度发布
    if (feature.rolloutPercentage !== undefined && feature.rolloutPercentage < 100) {
      if (!this.userContext.id) return false;
      
      // 基于用户ID生成稳定的随机数
      const userHash = this.hashString(this.userContext.id);
      const userPercentage = userHash % 100;
      return userPercentage < feature.rolloutPercentage;
    }

    return true;
  }

  // 获取功能配置
  getFeature(key: FeatureFlagKey): FeatureFlag | undefined {
    return this.features.get(key);
  }

  // 获取所有启用的功能
  getEnabledFeatures(): FeatureFlagKey[] {
    return Array.from(this.features.keys()).filter(key => this.isEnabled(key));
  }

  // 动态更新功能开关（仅开发环境）
  updateFeature(key: FeatureFlagKey, updates: Partial<FeatureFlag>) {
    if (isProduction()) {
      console.warn('Feature flag updates are not allowed in production');
      return false;
    }

    const feature = this.features.get(key);
    if (!feature) return false;

    this.features.set(key, { ...feature, ...updates });
    return true;
  }

  // 生成稳定hash值
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash);
  }

  // 调试信息
  getDebugInfo(): Record<string, any> {
    if (isProduction()) return {};

    return {
      userContext: this.userContext,
      enabledFeatures: this.getEnabledFeatures(),
      allFeatures: Array.from(this.features.entries()).map(([key, feature]) => ({
        key,
        enabled: this.isEnabled(key),
        config: feature
      }))
    };
  }
}

// 创建全局功能管理器实例
export const featureFlags = new FeatureFlagManager(BASE_FEATURES);

// 便捷函数
export function isFeatureEnabled(key: FeatureFlagKey): boolean {
  return featureFlags.isEnabled(key);
}

export function setUserContext(context: { id?: string; email?: string; role?: string }) {
  featureFlags.setUserContext(context);
}

export function getEnabledFeatures(): FeatureFlagKey[] {
  return featureFlags.getEnabledFeatures();
}

// React Hook 支持
export function useFeatureFlag(key: FeatureFlagKey) {
  return {
    isEnabled: isFeatureEnabled(key),
    feature: featureFlags.getFeature(key)
  };
}

// 组件包装器
export function withFeatureFlag<P extends object>(
  Component: React.ComponentType<P>,
  featureKey: FeatureFlagKey,
  fallback?: React.ComponentType<P>
) {
  return function FeatureFlagWrapper(props: P) {
    if (isFeatureEnabled(featureKey)) {
      return React.createElement(Component, props);
    }
    
    if (fallback) {
      return React.createElement(fallback, props);
    }
    
    return null;
  };
}

// 导出调试信息（仅非生产环境）
export function getFeatureFlagDebugInfo() {
  return featureFlags.getDebugInfo();
}