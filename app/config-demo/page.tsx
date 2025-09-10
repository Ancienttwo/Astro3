// app/config-demo/page.tsx - 配置系统演示页面
"use client";

import React from 'react';
import { AdaptiveLayout } from '@/components/layout/adaptive-layout';
import { ThemedButton } from '@/components/ui/themed-button';
import { ThemedCard } from '@/components/ui/themed-card';
import { ThemedInput } from '@/components/ui/themed-input';
import { APP_CONFIG } from '@/lib/config/app-config';
import { DEPLOYMENT_CONFIG } from '@/lib/config/deployment-config';
import { isFeatureEnabled, getEnabledFeatures, getFeatureFlagDebugInfo } from '@/lib/config/feature-flags';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ConfigDemoPage() {
  const enabledFeatures = getEnabledFeatures();
  const debugInfo = getFeatureFlagDebugInfo();

  return (
    <AdaptiveLayout 
      title="配置系统演示"
      description="展示统一配置架构的功能和组件"
    >
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">
            {APP_CONFIG.ui.branding.productName} 配置系统演示
          </h1>
          <p className="text-muted-foreground">
            {APP_CONFIG.ui.branding.tagline}
          </p>
        </div>

        {/* 当前配置信息 */}
        <ThemedCard themeVariant="elevated">
          <CardHeader>
            <CardTitle>当前配置信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">部署配置</h3>
                <ul className="space-y-1 text-sm">
                  <li>目标: {DEPLOYMENT_CONFIG.target}</li>
                  <li>模式: {APP_CONFIG.mode}</li>
                  <li>域名: {DEPLOYMENT_CONFIG.domain}</li>
                  <li>环境: {DEPLOYMENT_CONFIG.environment}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">功能配置</h3>
                <ul className="space-y-1 text-sm">
                  <li>Web3认证: {APP_CONFIG.auth.web3.enabled ? '✅' : '❌'}</li>
                  <li>Web2认证: {APP_CONFIG.auth.web2.enabled ? '✅' : '❌'}</li>
                  <li>支持语言: {APP_CONFIG.supportedLanguages.join(', ')}</li>
                  <li>默认语言: {APP_CONFIG.defaultLanguage}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </ThemedCard>

        {/* 主题化组件演示 */}
        <ThemedCard themeVariant="base">
          <CardHeader>
            <CardTitle>主题化组件演示</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 按钮组件 */}
            <div>
              <h3 className="font-semibold mb-3">按钮组件</h3>
              <div className="flex flex-wrap gap-3">
                <ThemedButton themeVariant="primary">
                  主要按钮
                </ThemedButton>
                <ThemedButton themeVariant="secondary">
                  次要按钮
                </ThemedButton>
                <ThemedButton themeVariant="ghost">
                  幽灵按钮
                </ThemedButton>
              </div>
            </div>

            {/* 输入框组件 */}
            <div>
              <h3 className="font-semibold mb-3">输入框组件</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ThemedInput placeholder="普通输入框" />
                <ThemedInput placeholder="错误状态输入框" error={true} />
              </div>
            </div>

            {/* 嵌套卡片 */}
            <div>
              <h3 className="font-semibold mb-3">嵌套卡片</h3>
              <ThemedCard themeVariant="elevated">
                <CardContent className="p-4">
                  <p>这是一个嵌套的主题化卡片，展示了不同的视觉层级。</p>
                </CardContent>
              </ThemedCard>
            </div>
          </CardContent>
        </ThemedCard>

        {/* 功能开关演示 */}
        <ThemedCard themeVariant="base">
          <CardHeader>
            <CardTitle>功能开关演示</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">已启用的功能</h3>
                <div className="flex flex-wrap gap-2">
                  {enabledFeatures.map(feature => (
                    <span 
                      key={feature}
                      className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* 条件渲染示例 */}
              <div className="space-y-2">
                <h3 className="font-semibold">条件渲染示例</h3>
                
                {isFeatureEnabled('chatbot') && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    🤖 聊天机器人功能已启用
                  </div>
                )}

                {isFeatureEnabled('yijing-divination') && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    🔮 易经占卜功能已启用
                  </div>
                )}

                {isFeatureEnabled('liuyao-divination') && (
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    ⚊ 六爻占卜功能已启用
                  </div>
                )}

                {APP_CONFIG.auth.web3.enabled && (
                  <div className="p-3 bg-orange-50 rounded-lg">
                    🔗 Web3认证已启用
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </ThemedCard>

        {/* 调试信息（仅开发环境） */}
        {Object.keys(debugInfo).length > 0 && (
          <ThemedCard themeVariant="base">
            <CardHeader>
              <CardTitle>调试信息（开发环境）</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-4 rounded-lg overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </CardContent>
          </ThemedCard>
        )}
      </div>
    </AdaptiveLayout>
  );
}