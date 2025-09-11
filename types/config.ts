// types/config.ts - 统一配置架构类型定义

// 重新导出配置相关类型，方便全局使用
export type { AppMode, SupportedLanguage } from '@/lib/config/app-config';
export type { DeploymentEnvironment, DeploymentTarget } from '@/lib/config/deployment-config';
export type { ThemeConfig, ComponentStyleConfig } from '@/lib/config/ui-theme-config';
export type { FeatureFlagKey } from '@/lib/config/feature-flags';

// 引入类型以便在本文件中使用
import type { AppMode, SupportedLanguage } from '@/lib/config/app-config';
import type { DeploymentTarget } from '@/lib/config/deployment-config';
import type { FeatureFlagKey } from '@/lib/config/feature-flags';

// 全局配置上下文类型
export interface GlobalConfigContext {
  appMode: AppMode;
  deploymentTarget: DeploymentTarget;
  supportedLanguages: SupportedLanguage[];
  defaultLanguage: SupportedLanguage;
  enabledFeatures: FeatureFlagKey[];
  isWeb3Enabled: boolean;
  isWeb2Enabled: boolean;
  currentTheme: string;
}

// 组件配置属性类型
export interface ConfigurableComponentProps {
  mode?: AppMode;
  language?: SupportedLanguage;
  featureGated?: FeatureFlagKey;
}

// 页面级别配置类型
export interface PageConfig {
  title: string;
  description: string;
  keywords: string[];
  requiresAuth?: boolean;
  requiredFeatures?: FeatureFlagKey[];
  supportedModes?: AppMode[];
}
