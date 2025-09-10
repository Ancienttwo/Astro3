// components/layout/adaptive-layout.tsx - 自适应布局组件
"use client";

import React from 'react';
import { APP_CONFIG } from '@/lib/config/app-config';
import { UI_THEME, CSS_VARIABLES } from '@/lib/config/ui-theme-config';
import { isFeatureEnabled } from '@/lib/config/feature-flags';

interface AdaptiveLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function AdaptiveLayout({ children, title, description }: AdaptiveLayoutProps) {
  // 应用CSS变量到根元素
  React.useEffect(() => {
    const root = document.documentElement;
    Object.entries(CSS_VARIABLES).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, []);

  // 动态设置页面类名基于应用模式
  const layoutClasses = React.useMemo(() => {
    const baseClasses = ['min-h-screen', 'transition-colors', 'duration-200'];
    
    switch (APP_CONFIG.ui.theme) {
      case 'web3':
        baseClasses.push('bg-slate-900', 'text-slate-100');
        break;
      case 'traditional':
        baseClasses.push('bg-orange-50', 'text-gray-900');
        break;
      case 'universal':
      default:
        baseClasses.push('bg-white', 'text-gray-900');
        break;
    }
    
    return baseClasses.join(' ');
  }, []);

  // 动态加载主题字体
  React.useEffect(() => {
    const fontFamilies = UI_THEME.typography.fontFamily.sans.join(',');
    document.body.style.fontFamily = fontFamilies;
  }, []);

  return (
    <div className={layoutClasses}>
      {/* 动态SEO头部 */}
      {title && (
        <React.Fragment>
          <title>{title} - {APP_CONFIG.ui.branding.productName}</title>
          {description && <meta name="description" content={description} />}
        </React.Fragment>
      )}
      
      {/* 主要内容 */}
      <div className="relative">
        {children}
      </div>
      
      {/* 调试信息 (仅开发环境) */}
      {process.env.NODE_ENV === 'development' && isFeatureEnabled('feature-flags') && (
        <div className="fixed bottom-4 right-4 z-50">
          <details className="bg-black/80 text-white p-2 rounded text-xs max-w-xs">
            <summary className="cursor-pointer">Debug Info</summary>
            <div className="mt-2 space-y-1">
              <div>Mode: {APP_CONFIG.mode}</div>
              <div>Theme: {APP_CONFIG.ui.theme}</div>
              <div>Lang: {APP_CONFIG.defaultLanguage}</div>
              <div>Web3: {APP_CONFIG.auth.web3.enabled ? '✓' : '✗'}</div>
              <div>Web2: {APP_CONFIG.auth.web2.enabled ? '✓' : '✗'}</div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}