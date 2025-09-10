// components/navigation/adaptive-navigation.tsx - 自适应导航组件
"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { APP_CONFIG } from '@/lib/config/app-config';
import { COMPONENT_STYLES } from '@/lib/config/ui-theme-config';
import { isFeatureEnabled } from '@/lib/config/feature-flags';
import { cn } from '@/lib/utils';

interface NavigationItem {
  key: string;
  label: string;
  href: string;
  featureFlag?: string;
  authRequired?: boolean;
  web3Only?: boolean;
  web2Only?: boolean;
}

// 基础导航配置
const BASE_NAVIGATION: NavigationItem[] = [
  {
    key: 'home',
    label: '首页',
    href: '/home'
  },
  {
    key: 'chatbot',
    label: 'AI问答',
    href: '/chatbot',
    featureFlag: 'chatbot',
    authRequired: true
  },
  {
    key: 'bazi-analysis',
    label: '八字分析',
    href: '/create-chart',
    featureFlag: 'bazi-analysis',
    authRequired: true
  },
  {
    key: 'ziwei-analysis',
    label: '紫微斗数',
    href: '/ziwei',
    featureFlag: 'ziwei-analysis',
    authRequired: true
  },
  {
    key: 'yijing-divination',
    label: '易经占卜',
    href: '/yijing',
    featureFlag: 'yijing-divination',
    authRequired: true,
    web2Only: true
  },
  {
    key: 'liuyao-divination',
    label: '六爻占卜',
    href: '/liuyao',
    featureFlag: 'liuyao-divination',
    authRequired: true,
    web2Only: true
  },
  {
    key: 'subscription',
    label: '会员中心',
    href: '/membership',
    featureFlag: 'subscription',
    authRequired: true
  },
  {
    key: 'profile',
    label: '个人中心',
    href: '/profile',
    authRequired: true
  },
  {
    key: 'help',
    label: '帮助中心',
    href: '/help-center',
    featureFlag: 'help-center'
  }
];

// 英文导航配置
const ENGLISH_NAVIGATION: NavigationItem[] = [
  {
    key: 'home',
    label: 'Home',
    href: '/en/home'
  },
  {
    key: 'chatbot',
    label: 'AI Q&A',
    href: '/en/chatbot',
    featureFlag: 'chatbot',
    authRequired: true
  },
  {
    key: 'bazi-analysis',
    label: 'BaZi Analysis',
    href: '/en/create-chart',
    featureFlag: 'bazi-analysis',
    authRequired: true
  },
  {
    key: 'ziwei-analysis',
    label: 'Ziwei Doushu',
    href: '/en/ziwei',
    featureFlag: 'ziwei-analysis',
    authRequired: true
  },
  {
    key: 'yijing-divination',
    label: 'I Ching Divination',
    href: '/en/yijing',
    featureFlag: 'yijing-divination',
    authRequired: true,
    web2Only: true
  },
  {
    key: 'liuyao-divination',
    label: 'Liuyao Divination',
    href: '/en/liuyao',
    featureFlag: 'liuyao-divination',
    authRequired: true,
    web2Only: true
  },
  {
    key: 'subscription',
    label: 'Membership',
    href: '/en/membership',
    featureFlag: 'subscription',
    authRequired: true
  },
  {
    key: 'profile',
    label: 'Profile',
    href: '/en/profile',
    authRequired: true
  },
  {
    key: 'help',
    label: 'Help Center',
    href: '/en/help-center',
    featureFlag: 'help-center'
  }
];

interface AdaptiveNavigationProps {
  language?: 'zh' | 'en';
  variant?: 'horizontal' | 'vertical' | 'mobile';
  className?: string;
  user?: any; // 用户信息
}

export function AdaptiveNavigation({ 
  language = 'zh',
  variant = 'horizontal',
  className,
  user
}: AdaptiveNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // 选择导航配置
  const navigationItems = language === 'en' ? ENGLISH_NAVIGATION : BASE_NAVIGATION;
  
  // 过滤可显示的导航项
  const visibleItems = navigationItems.filter(item => {
    // 检查功能开关
    if (item.featureFlag && !isFeatureEnabled(item.featureFlag as any)) {
      return false;
    }
    
    // 检查认证要求
    if (item.authRequired && !user) {
      return false;
    }
    
    // 检查Web3/Web2限制
    if (item.web3Only && !APP_CONFIG.auth.web3.enabled) {
      return false;
    }
    
    if (item.web2Only && !APP_CONFIG.auth.web2.enabled) {
      return false;
    }
    
    return true;
  });
  
  // 获取主题样式
  const styles = COMPONENT_STYLES.navigation;
  
  // 检查是否为当前页面
  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };
  
  // 渲染单个导航项
  const renderNavItem = (item: NavigationItem) => {
    const active = isActive(item.href);
    
    return (
      <Link
        key={item.key}
        href={item.href}
        className={cn(
          'px-3 py-2 rounded-md text-sm font-medium transition-colors',
          active ? styles.active : styles.inactive,
          'hover:' + styles.hover.replace(/^bg-/, ''),
          variant === 'vertical' && 'block w-full text-left'
        )}
      >
        {item.label}
      </Link>
    );
  };
  
  // 渲染语言切换器
  const renderLanguageSwitcher = () => {
    if (!APP_CONFIG.ui.navigation.showLanguageSwitcher) return null;
    
    const currentLang = language;
    const otherLang = currentLang === 'zh' ? 'en' : 'zh';
    const switchPath = pathname.startsWith('/en') 
      ? pathname.replace('/en', '') || '/home'
      : '/en' + pathname;
    
    return (
      <button
        onClick={() => router.push(switchPath)}
        className={cn(
          'px-2 py-1 text-xs rounded border',
          styles.inactive,
          'hover:' + styles.hover.replace(/^bg-/, '')
        )}
      >
        {currentLang === 'zh' ? 'EN' : '中文'}
      </button>
    );
  };
  
  // 渲染认证切换器 (仅统一模式)
  const renderAuthSwitcher = () => {
    if (!APP_CONFIG.ui.navigation.showAuthSwitcher) return null;
    
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-500">Auth:</span>
        <div className="flex gap-1">
          {APP_CONFIG.auth.web2.enabled && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Web2</span>
          )}
          {APP_CONFIG.auth.web3.enabled && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">Web3</span>
          )}
        </div>
      </div>
    );
  };
  
  // 水平布局
  if (variant === 'horizontal') {
    return (
      <nav className={cn('flex items-center space-x-4', className)}>
        <div className="flex items-center space-x-2">
          {visibleItems.map(renderNavItem)}
        </div>
        
        <div className="flex items-center space-x-2 ml-auto">
          {renderLanguageSwitcher()}
          {renderAuthSwitcher()}
        </div>
      </nav>
    );
  }
  
  // 垂直布局
  if (variant === 'vertical') {
    return (
      <nav className={cn('space-y-1', className)}>
        {visibleItems.map(renderNavItem)}
        
        {(APP_CONFIG.ui.navigation.showLanguageSwitcher || APP_CONFIG.ui.navigation.showAuthSwitcher) && (
          <div className="pt-4 space-y-2 border-t">
            {renderLanguageSwitcher()}
            {renderAuthSwitcher()}
          </div>
        )}
      </nav>
    );
  }
  
  // 移动端布局
  return (
    <nav className={cn('grid grid-cols-2 gap-2', className)}>
      {visibleItems.map(renderNavItem)}
      
      <div className="col-span-2 flex justify-between items-center pt-2 border-t">
        {renderLanguageSwitcher()}
        {renderAuthSwitcher()}
      </div>
    </nav>
  );
}