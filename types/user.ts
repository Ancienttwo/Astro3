// 用户相关类型定义
import type { AppMode, SupportedLanguage } from './config';

export interface UnifiedUser {
  id: string;
  email?: string;
  username?: string;
  wallet_address?: string;
  // 新增：用户的认证偏好和功能权限
  auth_methods?: ('web2' | 'web3')[];
  preferred_language?: SupportedLanguage;
  enabled_features?: string[];
  registration_source?: AppMode;
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
    provider?: string;
  };
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
}

export interface UserProfile {
  nickname?: string;
  email?: string;
  avatar_url?: string;
  full_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserUsage {
  daily_usage: number;
  total_usage: number;
  last_used: string;
  is_premium: boolean;
  remaining_quota: number;
}

export interface AuthSession {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: UnifiedUser;
}