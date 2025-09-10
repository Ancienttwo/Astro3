'use client';

import React, { useEffect } from 'react';
import { useUrlLanguage, initializeLanguageWithUrl, useTranslations } from '@/lib/i18n/language-manager';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

interface HybridLanguageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showLanguageSelector?: boolean;
}

/**
 * 混合多语言架构布局组件
 * 支持查询参数的多语言页面布局
 */
export default function HybridLanguageLayout({ 
  children, 
  title, 
  description, 
  showLanguageSelector = true 
}: HybridLanguageLayoutProps) {
  const { currentLanguage } = useUrlLanguage();
  const { t } = useTranslations();

  // 初始化URL同步
  useEffect(() => {
    initializeLanguageWithUrl();
  }, []);

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'zh-CN': return '简体中文';
      case 'zh-TW': return '繁體中文';
      case 'en-US': return 'English';
      default: return lang;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 页面头部 */}
      {(title || showLanguageSelector) && (
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                {title && (
                  <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                )}
                {description && (
                  <p className="text-muted-foreground mt-1">{description}</p>
                )}
              </div>
              
              {showLanguageSelector && (
                <LanguageSwitcher variant="select" size="md" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* 页面内容 */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* 语言变更提示 */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="text-xs text-muted-foreground bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2">
          {t.common.loading}... {getLanguageLabel(currentLanguage)}
        </div>
      </div>
    </div>
  );
}

/**
 * HOC: 包装组件以支持混合多语言架构
 */
export function withHybridLanguage<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    title?: string;
    description?: string;
    showLanguageSelector?: boolean;
  }
) {
  return function HybridLanguageWrapper(props: P) {
    return (
      <HybridLanguageLayout {...options}>
        <Component {...props} />
      </HybridLanguageLayout>
    );
  };
}